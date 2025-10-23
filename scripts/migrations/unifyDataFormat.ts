/**
 * Data Unification Migration Script
 *
 * Purpose: Merge data from 'generated' (batch format) and 'generated_v2' (individual verse format)
 * into a single unified format under 'data/unified_verses/'
 *
 * Unified Format:
 * - One JSON file per verse
 * - Filename: {book}_{chapter}_{verse}.json (e.g., genesis_1_1.json)
 * - Consistent schema across all files
 * - Ready for database upload
 */

import fs from 'fs';
import path from 'path';

// Paths
const DATA_DIR = path.join(process.cwd(), 'data');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');
const GENERATED_V2_DIR = path.join(DATA_DIR, 'generated_v2');
const UNIFIED_DIR = path.join(DATA_DIR, 'unified_verses');
const BACKUP_DIR = path.join(DATA_DIR, `backup_unified_migration_${new Date().toISOString().split('T')[0]}`);

// Unified verse interface
interface UnifiedWord {
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  letters?: string;
  root: string;
  grammar: string;
  emoji?: string;
  iconSvg?: string;
  relatedWords?: string[];
  structure?: string;
}

interface CommentarySection {
  emoji: string;
  title: string;
  description: string;
  points: string[];
  color: string;
}

interface WhyQuestion {
  question: string;
  answer: string;
  bibleReferences: string[];
}

interface Commentary {
  intro: string;
  sections: CommentarySection[];
  whyQuestion?: WhyQuestion;
  conclusion?: {
    title: string;
    content: string;
  };
}

interface UnifiedVerse {
  id: string;
  reference: string;
  hebrew: string;
  ipa: string;
  koreanPronunciation: string;
  modern: string;
  words: UnifiedWord[];
  commentary?: Commentary;
}

// Stats
interface MigrationStats {
  generatedBatchFiles: number;
  generatedV2Files: number;
  totalVersesProcessed: number;
  unifiedFilesCreated: number;
  errors: string[];
}

const stats: MigrationStats = {
  generatedBatchFiles: 0,
  generatedV2Files: 0,
  totalVersesProcessed: 0,
  unifiedFilesCreated: 0,
  errors: [],
};

/**
 * Create necessary directories
 */
function ensureDirectories(): void {
  if (!fs.existsSync(UNIFIED_DIR)) {
    fs.mkdirSync(UNIFIED_DIR, { recursive: true });
    console.log(`✅ Created unified directory: ${UNIFIED_DIR}`);
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Backup existing unified folder if it exists
 */
function backupExistingData(): void {
  if (fs.existsSync(UNIFIED_DIR)) {
    const files = fs.readdirSync(UNIFIED_DIR);
    if (files.length > 0) {
      console.log(`📦 Backing up ${files.length} existing unified files...`);
      files.forEach(file => {
        const srcPath = path.join(UNIFIED_DIR, file);
        const destPath = path.join(BACKUP_DIR, file);
        fs.copyFileSync(srcPath, destPath);
      });
      console.log(`✅ Backup completed to: ${BACKUP_DIR}`);
    }
  }
}

/**
 * Normalize word format from batch files to unified format
 */
function normalizeWordFromBatch(word: any): UnifiedWord {
  return {
    hebrew: word.hebrew || '',
    meaning: word.meaning || '',
    ipa: word.ipa || '',
    korean: word.korean || '',
    letters: word.letters || word.structure,
    root: word.root || '',
    grammar: word.grammar || '',
    emoji: word.emoji,
    iconSvg: word.iconSvg,
    relatedWords: word.relatedWords,
    structure: word.structure,
  };
}

/**
 * Normalize word format from v2 files to unified format
 */
function normalizeWordFromV2(word: any): UnifiedWord {
  return {
    hebrew: word.hebrew || '',
    meaning: word.meaning || '',
    ipa: word.ipa || '',
    korean: word.korean || '',
    letters: word.letters,
    root: word.root || '',
    grammar: word.grammar || '',
    emoji: word.emoji,
    iconSvg: word.iconSvg,
    relatedWords: word.relatedWords,
  };
}

/**
 * Convert verse from batch format to unified format
 */
function convertBatchVerseToUnified(verse: any): UnifiedVerse {
  return {
    id: verse.verseId,
    reference: verse.reference || generateReference(verse.verseId),
    hebrew: verse.hebrew || '',
    ipa: verse.ipa || '',
    koreanPronunciation: verse.koreanPronunciation || '',
    modern: verse.modern || '',
    words: (verse.words || []).map(normalizeWordFromBatch),
    commentary: verse.commentary,
  };
}

/**
 * Convert verse from v2 format to unified format
 */
function convertV2VerseToUnified(verse: any): UnifiedVerse {
  return {
    id: verse.id,
    reference: verse.reference || generateReference(verse.id),
    hebrew: verse.hebrew || '',
    ipa: verse.ipa || '',
    koreanPronunciation: verse.koreanPronunciation || '',
    modern: verse.modern || '',
    words: (verse.words || []).map(normalizeWordFromV2),
    commentary: verse.commentary,
  };
}

/**
 * Generate reference from verse ID (e.g., genesis_1_1 -> 창세기 1:1)
 */
function generateReference(verseId: string): string {
  const parts = verseId.split('_');
  const book = parts[0];
  const chapter = parts[1];
  const verse = parts[2];

  const bookNames: { [key: string]: string } = {
    genesis: '창세기',
    exodus: '출애굽기',
    // Add more as needed
  };

  return `${bookNames[book] || book} ${chapter}:${verse}`;
}

/**
 * Process batch files from 'generated' folder
 */
function processBatchFiles(): Map<string, UnifiedVerse> {
  const verses = new Map<string, UnifiedVerse>();

  if (!fs.existsSync(GENERATED_DIR)) {
    console.log(`⚠️  Generated folder not found: ${GENERATED_DIR}`);
    return verses;
  }

  const files = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.json'));
  console.log(`\n📂 Processing ${files.length} batch files from 'generated' folder...`);

  for (const file of files) {
    try {
      const filePath = path.join(GENERATED_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const batchData = JSON.parse(content);

      // Batch files contain arrays of verses
      if (Array.isArray(batchData)) {
        for (const verse of batchData) {
          const unified = convertBatchVerseToUnified(verse);
          verses.set(unified.id, unified);
          stats.totalVersesProcessed++;
        }
      } else {
        // Single verse file
        const unified = convertBatchVerseToUnified(batchData);
        verses.set(unified.id, unified);
        stats.totalVersesProcessed++;
      }

      stats.generatedBatchFiles++;
    } catch (error) {
      const errorMsg = `Error processing ${file}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }

  return verses;
}

/**
 * Process individual files from 'generated_v2' folder
 */
function processV2Files(): Map<string, UnifiedVerse> {
  const verses = new Map<string, UnifiedVerse>();

  if (!fs.existsSync(GENERATED_V2_DIR)) {
    console.log(`⚠️  Generated_v2 folder not found: ${GENERATED_V2_DIR}`);
    return verses;
  }

  const files = fs.readdirSync(GENERATED_V2_DIR).filter(f => f.endsWith('.json'));
  console.log(`\n📂 Processing ${files.length} individual files from 'generated_v2' folder...`);

  for (const file of files) {
    try {
      const filePath = path.join(GENERATED_V2_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const verseData = JSON.parse(content);

      const unified = convertV2VerseToUnified(verseData);
      verses.set(unified.id, unified);
      stats.totalVersesProcessed++;
      stats.generatedV2Files++;
    } catch (error) {
      const errorMsg = `Error processing ${file}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }

  return verses;
}

/**
 * Merge verses from both sources (v2 takes precedence over batch)
 */
function mergeVerses(
  batchVerses: Map<string, UnifiedVerse>,
  v2Verses: Map<string, UnifiedVerse>
): Map<string, UnifiedVerse> {
  console.log(`\n🔄 Merging verses...`);
  console.log(`   Batch verses: ${batchVerses.size}`);
  console.log(`   V2 verses: ${v2Verses.size}`);

  // V2 files take precedence (they're usually more complete)
  const merged = new Map([...batchVerses, ...v2Verses]);

  console.log(`   Total unique verses: ${merged.size}`);
  return merged;
}

/**
 * Write unified verses to individual files
 */
function writeUnifiedFiles(verses: Map<string, UnifiedVerse>): void {
  console.log(`\n💾 Writing ${verses.size} unified verse files...`);

  // Clear existing files
  if (fs.existsSync(UNIFIED_DIR)) {
    const existingFiles = fs.readdirSync(UNIFIED_DIR);
    existingFiles.forEach(file => {
      fs.unlinkSync(path.join(UNIFIED_DIR, file));
    });
  }

  for (const [id, verse] of verses) {
    try {
      const filename = `${id}.json`;
      const filepath = path.join(UNIFIED_DIR, filename);
      fs.writeFileSync(filepath, JSON.stringify(verse, null, 2), 'utf-8');
      stats.unifiedFilesCreated++;
    } catch (error) {
      const errorMsg = `Error writing ${id}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }

  console.log(`✅ Created ${stats.unifiedFilesCreated} unified files`);
}

/**
 * Generate migration report
 */
function generateReport(): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 MIGRATION REPORT`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📥 Input Sources:`);
  console.log(`   - Batch files processed: ${stats.generatedBatchFiles}`);
  console.log(`   - V2 files processed: ${stats.generatedV2Files}`);
  console.log(`   - Total verses processed: ${stats.totalVersesProcessed}`);
  console.log(`\n📤 Output:`);
  console.log(`   - Unified files created: ${stats.unifiedFilesCreated}`);
  console.log(`   - Location: ${UNIFIED_DIR}`);
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
  console.log(`✅ Migration completed successfully!`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Main migration function
 */
async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 DATA UNIFICATION MIGRATION`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Step 1: Ensure directories exist
    console.log(`📁 Step 1: Preparing directories...`);
    ensureDirectories();

    // Step 2: Backup existing data
    console.log(`\n📦 Step 2: Backing up existing data...`);
    backupExistingData();

    // Step 3: Process batch files
    console.log(`\n🔄 Step 3: Processing source files...`);
    const batchVerses = processBatchFiles();

    // Step 4: Process v2 files
    const v2Verses = processV2Files();

    // Step 5: Merge verses
    const mergedVerses = mergeVerses(batchVerses, v2Verses);

    // Step 6: Write unified files
    console.log(`\n💾 Step 4: Writing unified files...`);
    writeUnifiedFiles(mergedVerses);

    // Step 7: Generate report
    generateReport();

    console.log(`\n✅ Next step: Run the database upload script`);
    console.log(`   npm run upload:unified`);

  } catch (error) {
    console.error(`\n❌ Fatal error during migration:`, error);
    process.exit(1);
  }
}

// Run migration
main();
