/**
 * Generate Simple SVG Icons for Hebrew Words
 *
 * This script generates simple, meaning-based SVG icons for words without icons
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not found');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple SVG templates based on meaning keywords
const svgTemplates: Record<string, string> = {
  // People & Family
  '아버지': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="20" r="8" stroke="#374151" stroke-width="2"/><path d="M20 50 Q20 35 32 35 Q44 35 44 50" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '아들': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="6" stroke="#374151" stroke-width="2"/><path d="M24 46 Q24 35 32 35 Q40 35 40 46" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '딸': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="6" stroke="#374151" stroke-width="2"/><path d="M24 46 Q24 35 32 35 Q40 35 40 46" stroke="#374151" stroke-width="2" fill="none"/><line x1="28" y1="22" x2="36" y2="22" stroke="#374151" stroke-width="2"/></svg>',
  '형제': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="24" r="5" stroke="#374151" stroke-width="2"/><circle cx="39" cy="24" r="5" stroke="#374151" stroke-width="2"/><path d="M19 44 Q19 35 25 35 Q31 35 31 44 M33 44 Q33 35 39 35 Q45 35 45 44" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '아내': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="7" stroke="#374151" stroke-width="2"/><path d="M22 48 Q22 34 32 34 Q42 34 42 48" stroke="#374151" stroke-width="2" fill="none"/><path d="M28 48 L36 48" stroke="#374151" stroke-width="2"/></svg>',
  '누이': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="6" stroke="#374151" stroke-width="2"/><path d="M24 46 Q24 35 32 35 Q40 35 40 46" stroke="#374151" stroke-width="2" fill="none"/><line x1="28" y1="22" x2="36" y2="22" stroke="#374151" stroke-width="2"/></svg>',
  '사람': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="7" stroke="#374151" stroke-width="2"/><line x1="32" y1="29" x2="32" y2="42" stroke="#374151" stroke-width="2"/><line x1="22" y1="35" x2="42" y2="35" stroke="#374151" stroke-width="2"/><line x1="32" y1="42" x2="26" y2="52" stroke="#374151" stroke-width="2"/><line x1="32" y1="42" x2="38" y2="52" stroke="#374151" stroke-width="2"/></svg>',
  '남자': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="7" stroke="#374151" stroke-width="2"/><line x1="32" y1="29" x2="32" y2="42" stroke="#374151" stroke-width="2"/><line x1="22" y1="35" x2="42" y2="35" stroke="#374151" stroke-width="2"/><line x1="32" y1="42" x2="26" y2="52" stroke="#374151" stroke-width="2"/><line x1="32" y1="42" x2="38" y2="52" stroke="#374151" stroke-width="2"/></svg>',

  // God & Religious
  '하나님': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="20" stroke="#374151" stroke-width="2"/><path d="M32 20 L35 28 L43 28 L37 34 L40 42 L32 37 L24 42 L27 34 L21 28 L29 28 Z" fill="#374151"/></svg>',
  '여호와': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="18" stroke="#374151" stroke-width="2"/><circle cx="32" cy="32" r="12" stroke="#374151" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#374151"/></svg>',
  '주': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 10 L42 25 L52 25 L44 35 L48 48 L32 40 L16 48 L20 35 L12 25 L22 25 Z" fill="#374151"/></svg>',

  // Places
  '땅': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="40" rx="25" ry="15" stroke="#374151" stroke-width="2"/><path d="M12 35 Q20 25 32 25 Q44 25 52 35" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '집': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 35 L32 15 L54 35" stroke="#374151" stroke-width="2" fill="none"/><rect x="18" y="35" width="28" height="20" stroke="#374151" stroke-width="2" fill="none"/><rect x="28" y="42" width="8" height="13" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '장막': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 50 L32 15 L49 50" stroke="#374151" stroke-width="2" fill="none"/><line x1="20" y1="40" x2="44" y2="40" stroke="#374151" stroke-width="2"/></svg>',
  '도시': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="25" width="12" height="25" stroke="#374151" stroke-width="2" fill="none"/><rect x="30" y="18" width="12" height="32" stroke="#374151" stroke-width="2" fill="none"/><rect x="45" y="28" width="10" height="22" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '방주': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 35 Q12 30 16 28 L48 28 Q52 30 52 35 L52 45 Q52 48 48 48 L16 48 Q12 48 12 45 Z" stroke="#374151" stroke-width="2" fill="none"/><line x1="16" y1="28" x2="16" y2="22" stroke="#374151" stroke-width="2"/><rect x="20" y="32" width="8" height="8" stroke="#374151" stroke-width="2" fill="none"/></svg>',

  // Nature
  '나무': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="32" y1="25" x2="32" y2="50" stroke="#374151" stroke-width="2"/><circle cx="32" cy="20" r="12" stroke="#374151" stroke-width="2"/><circle cx="25" cy="15" r="8" stroke="#374151" stroke-width="2"/><circle cx="39" cy="15" r="8" stroke="#374151" stroke-width="2"/></svg>',
  '물': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 35 Q18 30 26 35 Q34 40 42 35 Q50 30 58 35 L58 50 L10 50 Z" stroke="#374151" stroke-width="2" fill="none"/><path d="M10 25 Q18 20 26 25 Q34 30 42 25 Q50 20 58 25" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '하늘': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="22" r="6" stroke="#374151" stroke-width="2"/><circle cx="38" cy="18" r="8" stroke="#374151" stroke-width="2"/><circle cx="48" cy="26" r="5" stroke="#374151" stroke-width="2"/><path d="M15 35 Q32 28 50 35" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '빛': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="8" fill="#374151"/><line x1="32" y1="12" x2="32" y2="20" stroke="#374151" stroke-width="2"/><line x1="32" y1="44" x2="32" y2="52" stroke="#374151" stroke-width="2"/><line x1="12" y1="32" x2="20" y2="32" stroke="#374151" stroke-width="2"/><line x1="44" y1="32" x2="52" y2="32" stroke="#374151" stroke-width="2"/><line x1="19" y1="19" x2="25" y2="25" stroke="#374151" stroke-width="2"/><line x1="39" y1="39" x2="45" y2="45" stroke="#374151" stroke-width="2"/><line x1="45" y1="19" x2="39" y2="25" stroke="#374151" stroke-width="2"/><line x1="25" y1="39" x2="19" y2="45" stroke="#374151" stroke-width="2"/></svg>',

  // Animals
  '새': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="28" r="5" stroke="#374151" stroke-width="2"/><path d="M20 28 Q28 25 36 28" stroke="#374151" stroke-width="2" fill="none"/><path d="M36 28 Q44 25 52 28" stroke="#374151" stroke-width="2" fill="none"/><line x1="36" y1="33" x2="36" y2="40" stroke="#374151" stroke-width="2"/><line x1="33" y1="40" x2="39" y2="40" stroke="#374151" stroke-width="2"/></svg>',
  '소': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="35" rx="18" ry="12" stroke="#374151" stroke-width="2"/><circle cx="32" cy="22" r="8" stroke="#374151" stroke-width="2"/><path d="M24 18 L20 12 M40 18 L44 12" stroke="#374151" stroke-width="2"/><line x1="26" y1="47" x2="26" y2="52" stroke="#374151" stroke-width="2"/><line x1="38" y1="47" x2="38" y2="52" stroke="#374151" stroke-width="2"/></svg>',
  '낙타': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="38" rx="20" ry="10" stroke="#374151" stroke-width="2"/><circle cx="28" cy="26" r="6" stroke="#374151" stroke-width="2"/><circle cx="38" cy="28" r="5" stroke="#374151" stroke-width="2"/><line x1="22" y1="48" x2="22" y2="54" stroke="#374151" stroke-width="2"/><line x1="42" y1="48" x2="42" y2="54" stroke="#374151" stroke-width="2"/></svg>',
  '양': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="35" rx="15" ry="10" stroke="#374151" stroke-width="2"/><circle cx="32" cy="22" r="7" stroke="#374151" stroke-width="2"/><line x1="24" y1="45" x2="24" y2="52" stroke="#374151" stroke-width="2"/><line x1="40" y1="45" x2="40" y2="52" stroke="#374151" stroke-width="2"/></svg>',

  // Time
  '날': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="25" r="10" stroke="#374151" stroke-width="2"/><line x1="32" y1="8" x2="32" y2="14" stroke="#374151" stroke-width="2"/><line x1="15" y1="25" x2="20" y2="25" stroke="#374151" stroke-width="2"/><line x1="44" y1="25" x2="49" y2="25" stroke="#374151" stroke-width="2"/><path d="M10 40 L54 40" stroke="#374151" stroke-width="2"/></svg>',
  '년': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="18" stroke="#374151" stroke-width="2"/><line x1="32" y1="18" x2="32" y2="32" stroke="#374151" stroke-width="2"/><line x1="32" y1="32" x2="42" y2="32" stroke="#374151" stroke-width="2"/></svg>',
  '세대': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="22" r="5" stroke="#374151" stroke-width="2"/><circle cx="32" cy="32" r="6" stroke="#374151" stroke-width="2"/><circle cx="44" cy="42" r="5" stroke="#374151" stroke-width="2"/><line x1="23" y1="26" x2="29" y2="30" stroke="#374151" stroke-width="2"/><line x1="35" y1="36" x2="41" y2="40" stroke="#374151" stroke-width="2"/></svg>',
  '후': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="15" y1="32" x2="49" y2="32" stroke="#374151" stroke-width="2"/><path d="M40 22 L49 32 L40 42" stroke="#374151" stroke-width="2" fill="none"/></svg>',

  // Actions & Abstract
  '말씀': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 20 Q15 15 20 15 L44 15 Q49 15 49 20 L49 40 Q49 45 44 45 L25 45 L15 52 Z" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '이름': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="20" width="34" height="24" rx="4" stroke="#374151" stroke-width="2" fill="none"/><line x1="22" y1="28" x2="42" y2="28" stroke="#374151" stroke-width="2"/><line x1="22" y1="36" x2="38" y2="36" stroke="#374151" stroke-width="2"/></svg>',
  '마음': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 45 L20 30 Q15 24 15 18 Q15 10 22 10 Q28 10 32 15 Q36 10 42 10 Q49 10 49 18 Q49 24 44 30 Z" stroke="#374151" stroke-width="2" fill="none"/></svg>',

  // Numbers
  '백': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="32" y="42" font-size="24" fill="#374151" text-anchor="middle" font-family="monospace">100</text></svg>',
  '천': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="32" y="42" font-size="20" fill="#374151" text-anchor="middle" font-family="monospace">1000</text></svg>',
  '사십': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="32" y="42" font-size="24" fill="#374151" text-anchor="middle" font-family="monospace">40</text></svg>',

  // Default fallback
  'default': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="24" height="24" rx="4" stroke="#374151" stroke-width="2" fill="none"/><circle cx="32" cy="32" r="6" fill="#374151"/></svg>',
};

// Function to find best matching SVG for a word
function findBestSVG(meaning: string): string {
  const lowerMeaning = meaning.toLowerCase();

  // Try exact keyword match
  for (const [keyword, svg] of Object.entries(svgTemplates)) {
    if (lowerMeaning.includes(keyword)) {
      return svg;
    }
  }

  // Return default
  return svgTemplates['default'];
}

async function generateAndUploadSVGs() {
  console.log('🎨 Generating simple SVG icons for Hebrew words...\n');

  // Read words without SVG
  const inputPath = path.resolve(process.cwd(), 'scripts/migrations/words-without-svg.json');
  const wordsData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  // Get unique words by hebrew + meaning
  const uniqueMap = new Map<string, any>();
  for (const word of wordsData) {
    const key = `${word.hebrew}:${word.meaning}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, word);
    }
  }

  const uniqueWords = Array.from(uniqueMap.values());
  console.log(`📊 Total unique words to process: ${uniqueWords.length}\n`);

  let successCount = 0;
  let failCount = 0;

  // Process each unique word
  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i];
    console.log(`[${i + 1}/${uniqueWords.length}] ${word.hebrew} (${word.meaning})`);

    try {
      // Find best matching SVG
      const svg = findBestSVG(word.meaning);

      // Update database - find all words with same hebrew and meaning WHERE icon_svg IS NULL
      const { data, error } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('hebrew', word.hebrew)
        .eq('meaning', word.meaning)
        .is('icon_svg', null);

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
        failCount++;
      } else {
        console.log(`  ✅ Updated`);
        successCount++;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Success: ${successCount}/${uniqueWords.length}`);
  console.log(`❌ Failed: ${failCount}/${uniqueWords.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

generateAndUploadSVGs();
