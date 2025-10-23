/**
 * Generate and Upload SVG Icons for Hebrew Words
 *
 * This script:
 * 1. Reads words without SVG icons from JSON file
 * 2. Gets unique words by hebrew + meaning combination
 * 3. Generates simple, minimalist SVG icons using Claude API
 * 4. Updates the database with the generated SVG icons
 * 5. Saves progress to resume if interrupted
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not found in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Anthropic setup
const anthropicKey = process.env.ANTHROPIC_API_KEY!;

if (!anthropicKey) {
  throw new Error('ANTHROPIC_API_KEY not found in environment variables');
}

const anthropic = new Anthropic({
  apiKey: anthropicKey,
});

// Paths
const INPUT_FILE = path.resolve(process.cwd(), 'scripts/migrations/words-without-svg.json');
const PROGRESS_FILE = path.resolve(process.cwd(), 'scripts/migrations/svg-generation-progress.json');

// Types
interface Word {
  hebrew: string;
  meaning: string;
  grammar: string;
  icon_svg: string | null;
}

interface UniqueWord {
  hebrew: string;
  meaning: string;
  grammar: string;
  key: string; // hebrew + meaning for uniqueness
}

interface ProgressData {
  completed: string[]; // Array of keys (hebrew + meaning)
  failed: Array<{ key: string; error: string }>;
  lastProcessedIndex: number;
  generatedSVGs: Record<string, string>; // key -> SVG string
}

// Stats
interface Stats {
  totalWords: number;
  uniqueWords: number;
  alreadyCompleted: number;
  generated: number;
  failed: number;
  updated: number;
}

const stats: Stats = {
  totalWords: 0,
  uniqueWords: 0,
  alreadyCompleted: 0,
  generated: 0,
  failed: 0,
  updated: 0,
};

/**
 * Load progress from file
 */
function loadProgress(): ProgressData {
  if (fs.existsSync(PROGRESS_FILE)) {
    const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(content);
  }
  return {
    completed: [],
    failed: [],
    lastProcessedIndex: -1,
    generatedSVGs: {},
  };
}

/**
 * Save progress to file
 */
function saveProgress(progress: ProgressData): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

/**
 * Get unique words by hebrew + meaning combination
 */
function getUniqueWords(words: Word[]): UniqueWord[] {
  const uniqueMap = new Map<string, UniqueWord>();

  for (const word of words) {
    const key = `${word.hebrew}|${word.meaning}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        hebrew: word.hebrew,
        meaning: word.meaning,
        grammar: word.grammar,
        key,
      });
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Generate SVG icon using Claude API
 */
async function generateSVGIcon(word: UniqueWord): Promise<string> {
  const prompt = `Generate a simple, minimalist SVG icon for the following Hebrew word:

Hebrew: ${word.hebrew}
Korean Meaning: ${word.meaning}
Grammar: ${word.grammar}

Requirements:
- Create a SIMPLE, MINIMALIST line art icon
- Use ONLY ONE COLOR: #374151 (gray)
- Set viewBox="0 0 64 64"
- NO gradients, NO complex effects, NO fills except the main color
- Just clean, simple, recognizable shapes that represent the word's meaning
- The icon should be understandable and clear even at small sizes
- Keep it minimal - think of it as a simple line drawing

IMPORTANT:
- Return ONLY the SVG string starting with <svg and ending with </svg>
- Do NOT include any React component code
- Do NOT include any explanations or markdown
- Do NOT wrap it in code blocks
- JUST the raw SVG string

Example of the style I want (but create unique content based on the meaning):
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 8L56 48H8L32 8Z" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract SVG from response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    let svgString = content.text.trim();

    // Remove markdown code blocks if present
    svgString = svgString.replace(/```svg\n?/g, '');
    svgString = svgString.replace(/```\n?/g, '');
    svgString = svgString.trim();

    // Validate it's an SVG
    if (!svgString.startsWith('<svg')) {
      throw new Error('Response does not start with <svg tag');
    }

    if (!svgString.endsWith('</svg>')) {
      throw new Error('Response does not end with </svg> tag');
    }

    return svgString;
  } catch (error) {
    throw new Error(`Failed to generate SVG: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update database with generated SVG
 */
async function updateWordSVG(hebrew: string, meaning: string, svg: string): Promise<number> {
  try {
    // Update all words with this hebrew + meaning combination
    const { data, error } = await supabase
      .from('words')
      .update({ icon_svg: svg })
      .eq('hebrew', hebrew)
      .eq('meaning', meaning)
      .select();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data?.length || 0;
  } catch (error) {
    throw new Error(`Failed to update database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process all unique words
 */
async function processWords(): Promise<void> {
  console.log('\n📖 Reading input file...');

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file not found: ${INPUT_FILE}`);
  }

  const words: Word[] = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  stats.totalWords = words.length;

  console.log(`✅ Found ${stats.totalWords} words in input file`);

  // Get unique words
  const uniqueWords = getUniqueWords(words);
  stats.uniqueWords = uniqueWords.length;

  console.log(`🔍 Identified ${stats.uniqueWords} unique words (by hebrew + meaning)\n`);

  // Load progress
  const progress = loadProgress();
  stats.alreadyCompleted = progress.completed.length;

  if (stats.alreadyCompleted > 0) {
    console.log(`📊 Resuming from previous run...`);
    console.log(`   Already completed: ${stats.alreadyCompleted} words`);
    console.log(`   Remaining: ${stats.uniqueWords - stats.alreadyCompleted} words\n`);
  }

  // Process each unique word
  console.log(`🚀 Starting SVG generation...\n`);

  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i];

    // Skip if already completed
    if (progress.completed.includes(word.key)) {
      continue;
    }

    console.log(`[${i + 1}/${uniqueWords.length}] Processing: ${word.hebrew} (${word.meaning})`);

    try {
      // Generate SVG
      console.log(`   🎨 Generating SVG...`);
      const svg = await generateSVGIcon(word);
      stats.generated++;

      // Save to progress
      progress.generatedSVGs[word.key] = svg;

      // Update database
      console.log(`   💾 Updating database...`);
      const updatedCount = await updateWordSVG(word.hebrew, word.meaning, svg);
      stats.updated += updatedCount;
      console.log(`   ✅ Updated ${updatedCount} database records`);

      // Mark as completed
      progress.completed.push(word.key);
      progress.lastProcessedIndex = i;

      // Save progress
      saveProgress(progress);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Failed: ${errorMsg}`);

      stats.failed++;
      progress.failed.push({
        key: word.key,
        error: errorMsg,
      });

      // Save progress even on failure
      saveProgress(progress);
    }

    // Wait 3 seconds between API calls to avoid rate limits
    if (i < uniqueWords.length - 1) {
      console.log(`   ⏳ Waiting 3 seconds...\n`);
      await sleep(3000);
    }
  }
}

/**
 * Generate report
 */
function generateReport(): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SVG GENERATION REPORT`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📈 Statistics:`);
  console.log(`   - Total words in input: ${stats.totalWords}`);
  console.log(`   - Unique words: ${stats.uniqueWords}`);
  console.log(`   - Already completed: ${stats.alreadyCompleted}`);
  console.log(`   - Generated this run: ${stats.generated}`);
  console.log(`   - Failed: ${stats.failed}`);
  console.log(`   - Database records updated: ${stats.updated}`);

  const progress = loadProgress();

  if (progress.failed.length > 0) {
    console.log(`\n❌ Failed words (${progress.failed.length}):`);
    progress.failed.slice(0, 10).forEach((item, idx) => {
      const [hebrew, meaning] = item.key.split('|');
      console.log(`   ${idx + 1}. ${hebrew} (${meaning})`);
      console.log(`      Error: ${item.error}`);
    });
    if (progress.failed.length > 10) {
      console.log(`   ... and ${progress.failed.length - 10} more failures`);
    }
  }

  console.log(`\n📁 Files:`);
  console.log(`   - Progress saved to: ${PROGRESS_FILE}`);

  if (stats.failed === 0 && progress.completed.length === stats.uniqueWords) {
    console.log(`\n✅ All SVGs generated successfully!`);
  } else if (progress.completed.length === stats.uniqueWords) {
    console.log(`\n⚠️  Completed with ${stats.failed} failures`);
  } else {
    console.log(`\n⚠️  Incomplete - run again to resume`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎨 SVG ICON GENERATION FOR HEBREW WORDS`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Test Supabase connection
    console.log(`🔌 Testing Supabase connection...`);
    const { error } = await supabase.from('words').select('count').limit(1);
    if (error) {
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }
    console.log(`✅ Connected to Supabase`);

    // Test Anthropic API
    console.log(`🔌 Testing Anthropic API connection...`);
    await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    });
    console.log(`✅ Connected to Anthropic API`);

    // Process all words
    await processWords();

    // Generate report
    generateReport();

    if (stats.failed > 0) {
      console.log(`⚠️  Process completed with ${stats.failed} failures`);
      console.log(`   You can run this script again to retry failed words`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  }
}

// Run the script
main();
