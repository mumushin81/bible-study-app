/**
 * Upload Unified Data to Supabase
 *
 * This script uploads all unified verse data to the Supabase database
 * in a structured way, handling:
 * - Verses table
 * - Words table with proper relationships
 * - Commentaries, sections, conclusions, and why_questions
 * - Word relations
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  console.error('   Note: Using SERVICE_ROLE_KEY is recommended to bypass RLS policies');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Paths
const UNIFIED_DIR = path.join(process.cwd(), 'data', 'unified_verses');

// Stats
interface UploadStats {
  versesUploaded: number;
  wordsUploaded: number;
  commentariesUploaded: number;
  sectionsUploaded: number;
  conclusionsUploaded: number;
  whyQuestionsUploaded: number;
  wordRelationsUploaded: number;
  errors: string[];
  filesProcessed: number;
  totalFiles: number;
}

const stats: UploadStats = {
  versesUploaded: 0,
  wordsUploaded: 0,
  commentariesUploaded: 0,
  sectionsUploaded: 0,
  conclusionsUploaded: 0,
  whyQuestionsUploaded: 0,
  wordRelationsUploaded: 0,
  errors: [],
  filesProcessed: 0,
  totalFiles: 0,
};

/**
 * Extract book_id from verse ID (e.g., genesis_1_1 -> genesis)
 */
function extractBookId(verseId: string): string {
  return verseId.split('_')[0];
}

/**
 * Extract chapter from verse ID (e.g., genesis_1_1 -> 1)
 */
function extractChapter(verseId: string): number {
  return parseInt(verseId.split('_')[1], 10);
}

/**
 * Extract verse number from verse ID (e.g., genesis_1_1 -> 1)
 */
function extractVerseNumber(verseId: string): number {
  return parseInt(verseId.split('_')[2], 10);
}

/**
 * Upload a single verse to the database
 */
async function uploadVerse(verse: any): Promise<boolean> {
  try {
    // 1. Upload verse
    const { data: verseData, error: verseError } = await supabase
      .from('verses')
      .upsert({
        id: verse.id,
        book_id: extractBookId(verse.id),
        chapter: extractChapter(verse.id),
        verse_number: extractVerseNumber(verse.id),
        reference: verse.reference,
        hebrew: verse.hebrew,
        ipa: verse.ipa,
        korean_pronunciation: verse.koreanPronunciation,
        modern: verse.modern,
      })
      .select()
      .single();

    if (verseError) {
      throw new Error(`Failed to upload verse: ${verseError.message}`);
    }

    stats.versesUploaded++;

    // 2. Upload words
    if (verse.words && verse.words.length > 0) {
      const wordsToInsert = verse.words.map((word: any, index: number) => ({
        verse_id: verse.id,
        position: index + 1,
        hebrew: word.hebrew,
        meaning: word.meaning,
        ipa: word.ipa,
        korean: word.korean,
        letters: word.letters || null,
        root: word.root,
        grammar: word.grammar,
        emoji: word.emoji || null,
        icon_svg: word.iconSvg || null,
        structure: word.structure || null,
      }));

      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .upsert(wordsToInsert)
        .select();

      if (wordsError) {
        throw new Error(`Failed to upload words: ${wordsError.message}`);
      }

      stats.wordsUploaded += wordsData.length;

      // 3. Upload word relations
      for (let i = 0; i < verse.words.length; i++) {
        const word = verse.words[i];
        const wordData = wordsData[i];

        if (word.relatedWords && word.relatedWords.length > 0) {
          const relationsToInsert = word.relatedWords.map((related: string) => ({
            word_id: wordData.id,
            related_word: related,
          }));

          const { error: relationsError } = await supabase
            .from('word_relations')
            .upsert(relationsToInsert);

          if (relationsError) {
            console.warn(`⚠️  Failed to upload relations for ${word.hebrew}: ${relationsError.message}`);
          } else {
            stats.wordRelationsUploaded += relationsToInsert.length;
          }
        }
      }
    }

    // 4. Upload commentary if present
    if (verse.commentary) {
      const { data: commentaryData, error: commentaryError } = await supabase
        .from('commentaries')
        .upsert({
          verse_id: verse.id,
          intro: verse.commentary.intro,
        })
        .select()
        .single();

      if (commentaryError) {
        throw new Error(`Failed to upload commentary: ${commentaryError.message}`);
      }

      stats.commentariesUploaded++;

      const commentaryId = commentaryData.id;

      // 5. Upload commentary sections
      if (verse.commentary.sections && verse.commentary.sections.length > 0) {
        const sectionsToInsert = verse.commentary.sections.map((section: any, index: number) => ({
          commentary_id: commentaryId,
          position: index + 1,
          emoji: section.emoji,
          title: section.title,
          description: section.description,
          points: section.points,
          color: section.color || null,
        }));

        const { error: sectionsError } = await supabase
          .from('commentary_sections')
          .upsert(sectionsToInsert);

        if (sectionsError) {
          throw new Error(`Failed to upload sections: ${sectionsError.message}`);
        }

        stats.sectionsUploaded += sectionsToInsert.length;
      }

      // 6. Upload conclusion if present
      if (verse.commentary.conclusion) {
        const { error: conclusionError } = await supabase
          .from('commentary_conclusions')
          .upsert({
            commentary_id: commentaryId,
            title: verse.commentary.conclusion.title,
            content: verse.commentary.conclusion.content,
          });

        if (conclusionError) {
          throw new Error(`Failed to upload conclusion: ${conclusionError.message}`);
        }

        stats.conclusionsUploaded++;
      }

      // 7. Upload why_question if present
      if (verse.commentary.whyQuestion) {
        const { error: whyError } = await supabase
          .from('why_questions')
          .upsert({
            commentary_id: commentaryId,
            question: verse.commentary.whyQuestion.question,
            answer: verse.commentary.whyQuestion.answer,
            bible_references: verse.commentary.whyQuestion.bibleReferences,
          });

        if (whyError) {
          throw new Error(`Failed to upload why_question: ${whyError.message}`);
        }

        stats.whyQuestionsUploaded++;
      }
    }

    return true;
  } catch (error) {
    const errorMsg = `Error uploading ${verse.id}: ${error}`;
    console.error(`❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
    return false;
  }
}

/**
 * Process all unified files
 */
async function processUnifiedFiles(): Promise<void> {
  console.log(`\n📂 Reading unified files from: ${UNIFIED_DIR}`);

  if (!fs.existsSync(UNIFIED_DIR)) {
    console.error(`❌ Unified directory not found: ${UNIFIED_DIR}`);
    console.error(`   Please run the migration script first: npm run migrate:unify`);
    process.exit(1);
  }

  const files = fs.readdirSync(UNIFIED_DIR).filter(f => f.endsWith('.json'));
  stats.totalFiles = files.length;

  console.log(`✅ Found ${files.length} unified verse files`);

  // Sort files for proper ordering (genesis_1_1, genesis_1_2, etc.)
  files.sort((a, b) => {
    const [bookA, chapA, verseA] = a.replace('.json', '').split('_');
    const [bookB, chapB, verseB] = b.replace('.json', '').split('_');

    if (bookA !== bookB) return bookA.localeCompare(bookB);
    if (chapA !== chapB) return parseInt(chapA) - parseInt(chapB);
    return parseInt(verseA) - parseInt(verseB);
  });

  console.log(`\n🚀 Starting upload...`);
  console.log(`   Batch size: 10 verses at a time`);
  console.log(`   Total batches: ${Math.ceil(files.length / 10)}\n`);

  // Process in batches of 10
  const BATCH_SIZE = 10;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);

    console.log(`📦 Batch ${batchNumber}/${totalBatches} (${batch.length} files)`);

    for (const file of batch) {
      const filePath = path.join(UNIFIED_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const verse = JSON.parse(content);

      await uploadVerse(verse);
      stats.filesProcessed++;

      // Progress indicator
      const progress = ((stats.filesProcessed / stats.totalFiles) * 100).toFixed(1);
      process.stdout.write(`   Progress: ${stats.filesProcessed}/${stats.totalFiles} (${progress}%)\r`);
    }

    console.log(`   ✅ Batch ${batchNumber} completed\n`);

    // Small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Generate upload report
 */
function generateReport(): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`�� UPLOAD REPORT`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📁 Files:`);
  console.log(`   - Total files: ${stats.totalFiles}`);
  console.log(`   - Processed: ${stats.filesProcessed}`);
  console.log(`\n📤 Uploaded:`);
  console.log(`   - Verses: ${stats.versesUploaded}`);
  console.log(`   - Words: ${stats.wordsUploaded}`);
  console.log(`   - Commentaries: ${stats.commentariesUploaded}`);
  console.log(`   - Commentary sections: ${stats.sectionsUploaded}`);
  console.log(`   - Conclusions: ${stats.conclusionsUploaded}`);
  console.log(`   - Why questions: ${stats.whyQuestionsUploaded}`);
  console.log(`   - Word relations: ${stats.wordRelationsUploaded}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
  } else {
    console.log(`\n✅ No errors!`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Upload completed!`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Main upload function
 */
async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 UNIFIED DATA UPLOAD TO SUPABASE`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Test Supabase connection
    console.log(`🔌 Testing Supabase connection...`);
    const { data, error } = await supabase.from('books').select('count').limit(1);
    if (error) {
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }
    console.log(`✅ Connected to Supabase\n`);

    // Process all unified files
    await processUnifiedFiles();

    // Generate report
    generateReport();

    if (stats.errors.length > 0) {
      console.log(`⚠️  Upload completed with ${stats.errors.length} errors`);
      console.log(`   Check the error messages above for details`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Fatal error during upload:`, error);
    process.exit(1);
  }
}

// Run upload
main();
