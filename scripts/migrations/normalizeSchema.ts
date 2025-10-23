/**
 * Schema Normalization Script
 *
 * Purpose: Normalize all Genesis 1-15 JSON files to match the Genesis 1:1 template schema
 * - Ensure all required fields are present
 * - Add missing fields with empty/null values
 * - Maintain consistent structure across all files
 */

import fs from 'fs';
import path from 'path';

// Paths
const UNIFIED_DIR = path.join(process.cwd(), 'data', 'unified_verses');
const BACKUP_DIR = path.join(process.cwd(), 'data', `backup_schema_normalization_${new Date().toISOString().split('T')[0]}`);

// Template schema based on Genesis 1:1
interface TemplateWord {
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  letters: string;  // Required field
  root: string;
  grammar: string;
  emoji?: string;   // Optional
  iconSvg?: string; // Optional
  relatedWords?: string[];  // Optional
}

interface TemplateSection {
  emoji: string;
  title: string;
  description: string;
  points: string[];
  color: string;
}

interface TemplateWhyQuestion {
  question: string;
  answer: string;
  bibleReferences: string[];
}

interface TemplateConclusion {
  title: string;
  content: string;
}

interface TemplateCommentary {
  intro: string;
  sections: TemplateSection[];
  whyQuestion?: TemplateWhyQuestion;
  conclusion?: TemplateConclusion;
}

interface TemplateVerse {
  id: string;
  reference: string;
  hebrew: string;
  ipa: string;
  koreanPronunciation: string;
  modern: string;
  words: TemplateWord[];
  commentary?: TemplateCommentary;
}

// Stats
interface NormalizationStats {
  filesProcessed: number;
  filesNormalized: number;
  fieldsAdded: number;
  errors: string[];
}

const stats: NormalizationStats = {
  filesProcessed: 0,
  filesNormalized: 0,
  fieldsAdded: 0,
  errors: [],
};

/**
 * Create backup directory
 */
function createBackup(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Normalize word object to match template
 */
function normalizeWord(word: any): TemplateWord {
  let fieldsAdded = 0;

  // Ensure all required fields exist
  const normalized: TemplateWord = {
    hebrew: word.hebrew || '',
    meaning: word.meaning || '',
    ipa: word.ipa || '',
    korean: word.korean || '',
    letters: word.letters || word.structure || '', // Use structure as fallback
    root: word.root || '',
    grammar: word.grammar || '',
  };

  // Track field additions
  if (!word.letters && !word.structure) fieldsAdded++;

  // Add optional fields if they exist
  if (word.emoji) normalized.emoji = word.emoji;
  if (word.iconSvg) normalized.iconSvg = word.iconSvg;
  if (word.relatedWords && Array.isArray(word.relatedWords)) {
    normalized.relatedWords = word.relatedWords;
  }

  stats.fieldsAdded += fieldsAdded;
  return normalized;
}

/**
 * Normalize commentary section
 */
function normalizeSection(section: any): TemplateSection {
  return {
    emoji: section.emoji || '📖',
    title: section.title || '',
    description: section.description || '',
    points: Array.isArray(section.points) ? section.points : [],
    color: section.color || 'blue',
  };
}

/**
 * Normalize commentary
 */
function normalizeCommentary(commentary: any): TemplateCommentary | undefined {
  if (!commentary) return undefined;

  const normalized: TemplateCommentary = {
    intro: commentary.intro || '',
    sections: Array.isArray(commentary.sections)
      ? commentary.sections.map(normalizeSection)
      : [],
  };

  // Add optional fields
  if (commentary.whyQuestion) {
    normalized.whyQuestion = {
      question: commentary.whyQuestion.question || '',
      answer: commentary.whyQuestion.answer || '',
      bibleReferences: Array.isArray(commentary.whyQuestion.bibleReferences)
        ? commentary.whyQuestion.bibleReferences
        : [],
    };
  }

  if (commentary.conclusion) {
    normalized.conclusion = {
      title: commentary.conclusion.title || '',
      content: commentary.conclusion.content || '',
    };
  }

  return normalized;
}

/**
 * Normalize verse object to match template
 */
function normalizeVerse(verse: any): TemplateVerse {
  const normalized: TemplateVerse = {
    id: verse.id || '',
    reference: verse.reference || '',
    hebrew: verse.hebrew || '',
    ipa: verse.ipa || '',
    koreanPronunciation: verse.koreanPronunciation || '',
    modern: verse.modern || '',
    words: Array.isArray(verse.words) ? verse.words.map(normalizeWord) : [],
  };

  // Add commentary if exists
  if (verse.commentary) {
    normalized.commentary = normalizeCommentary(verse.commentary);
  }

  return normalized;
}

/**
 * Check if file is a Genesis 1-15 file
 */
function isGenesis1to15(filename: string): boolean {
  const match = filename.match(/genesis_(\d+)_\d+\.json/);
  if (!match) return false;

  const chapter = parseInt(match[1], 10);
  return chapter >= 1 && chapter <= 15;
}

/**
 * Process a single file
 */
function processFile(filename: string): boolean {
  try {
    const filePath = path.join(UNIFIED_DIR, filename);

    // Read original file
    const content = fs.readFileSync(filePath, 'utf-8');
    const verse = JSON.parse(content);

    // Backup original file
    const backupPath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(backupPath, content, 'utf-8');

    // Normalize verse
    const normalized = normalizeVerse(verse);

    // Write normalized version
    fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf-8');

    stats.filesProcessed++;
    stats.filesNormalized++;

    return true;
  } catch (error) {
    const errorMsg = `Error processing ${filename}: ${error}`;
    console.error(`❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
    stats.filesProcessed++;
    return false;
  }
}

/**
 * Process all Genesis 1-15 files
 */
function processAllFiles(): void {
  console.log(`\n📂 Reading files from: ${UNIFIED_DIR}`);

  if (!fs.existsSync(UNIFIED_DIR)) {
    console.error(`❌ Unified directory not found: ${UNIFIED_DIR}`);
    process.exit(1);
  }

  const allFiles = fs.readdirSync(UNIFIED_DIR).filter(f => f.endsWith('.json'));
  const genesis1to15Files = allFiles.filter(isGenesis1to15);

  console.log(`✅ Found ${genesis1to15Files.length} Genesis 1-15 files (out of ${allFiles.length} total)`);

  // Sort files for better reporting
  genesis1to15Files.sort((a, b) => {
    const [bookA, chapA, verseA] = a.replace('.json', '').split('_');
    const [bookB, chapB, verseB] = b.replace('.json', '').split('_');

    if (chapA !== chapB) return parseInt(chapA) - parseInt(chapB);
    return parseInt(verseA) - parseInt(verseB);
  });

  console.log(`\n🔄 Processing files...`);

  // Process in batches of 10 for progress reporting
  const BATCH_SIZE = 10;
  for (let i = 0; i < genesis1to15Files.length; i += BATCH_SIZE) {
    const batch = genesis1to15Files.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(genesis1to15Files.length / BATCH_SIZE);

    for (const file of batch) {
      processFile(file);
      const progress = ((stats.filesProcessed / genesis1to15Files.length) * 100).toFixed(1);
      process.stdout.write(`   Progress: ${stats.filesProcessed}/${genesis1to15Files.length} (${progress}%)\r`);
    }

    console.log(`   ✅ Batch ${batchNumber}/${totalBatches} completed`);
  }
}

/**
 * Generate report
 */
function generateReport(): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 NORMALIZATION REPORT`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📁 Files:`);
  console.log(`   - Processed: ${stats.filesProcessed}`);
  console.log(`   - Normalized: ${stats.filesNormalized}`);
  console.log(`\n✏️  Changes:`);
  console.log(`   - Fields added/normalized: ${stats.fieldsAdded}`);
  console.log(`\n💾 Backup:`);
  console.log(`   - Location: ${BACKUP_DIR}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err}`);
    });
  } else {
    console.log(`\n✅ No errors!`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Normalization completed!`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔧 SCHEMA NORMALIZATION - Genesis 1-15`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Step 1: Create backup
    console.log(`📦 Step 1: Creating backup...`);
    createBackup();

    // Step 2: Process all files
    console.log(`\n🔄 Step 2: Normalizing files...`);
    processAllFiles();

    // Step 3: Generate report
    generateReport();

    console.log(`\n✨ All Genesis 1-15 files now match the schema template!`);

  } catch (error) {
    console.error(`\n❌ Fatal error during normalization:`, error);
    process.exit(1);
  }
}

// Run normalization
main();
