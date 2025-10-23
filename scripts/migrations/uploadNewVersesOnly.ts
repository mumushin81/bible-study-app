/**
 * Upload Only New Verses to Supabase
 *
 * This script checks existing verses in the database and only uploads
 * verses that are not already present.
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
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const UNIFIED_DIR = path.join(process.cwd(), 'data', 'unified_verses');

interface UploadStats {
  totalLocal: number;
  totalInDB: number;
  newVersesToUpload: number;
  uploaded: number;
  skipped: number;
  errors: string[];
}

const stats: UploadStats = {
  totalLocal: 0,
  totalInDB: 0,
  newVersesToUpload: 0,
  uploaded: 0,
  skipped: 0,
  errors: [],
};

function extractBookId(verseId: string): string {
  return verseId.split('_')[0];
}

function extractChapter(verseId: string): number {
  return parseInt(verseId.split('_')[1], 10);
}

function extractVerseNumber(verseId: string): number {
  return parseInt(verseId.split('_')[2], 10);
}

async function uploadVerse(verse: any): Promise<boolean> {
  try {
    // 1. Upload verse
    const { error: verseError } = await supabase
      .from('verses')
      .insert({
        id: verse.id,
        book_id: extractBookId(verse.id),
        chapter: extractChapter(verse.id),
        verse_number: extractVerseNumber(verse.id),
        reference: verse.reference,
        hebrew: verse.hebrew,
        ipa: verse.ipa,
        korean_pronunciation: verse.koreanPronunciation,
        modern: verse.modern,
      });

    if (verseError) {
      throw new Error(`Failed to upload verse: ${verseError.message}`);
    }

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
        .insert(wordsToInsert)
        .select();

      if (wordsError) {
        throw new Error(`Failed to upload words: ${wordsError.message}`);
      }

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
            .insert(relationsToInsert);

          if (relationsError) {
            console.warn(`⚠️  Failed to upload relations for ${word.hebrew}`);
          }
        }
      }
    }

    // 4. Upload commentary if present
    if (verse.commentary) {
      const { data: commentaryData, error: commentaryError } = await supabase
        .from('commentaries')
        .insert({
          verse_id: verse.id,
          intro: verse.commentary.intro,
        })
        .select()
        .single();

      if (commentaryError) {
        console.warn(`⚠️  Failed to upload commentary for ${verse.id}`);
        return true; // Still consider verse uploaded even if commentary fails
      }

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

        await supabase.from('commentary_sections').insert(sectionsToInsert);
      }

      // 6. Upload conclusion if present
      if (verse.commentary.conclusion) {
        await supabase.from('commentary_conclusions').insert({
          commentary_id: commentaryId,
          title: verse.commentary.conclusion.title,
          content: verse.commentary.conclusion.content,
        });
      }

      // 7. Upload why_question if present
      if (verse.commentary.whyQuestion) {
        await supabase.from('why_questions').insert({
          commentary_id: commentaryId,
          question: verse.commentary.whyQuestion.question,
          answer: verse.commentary.whyQuestion.answer,
          bible_references: verse.commentary.whyQuestion.bibleReferences,
        });
      }
    }

    return true;
  } catch (error) {
    const errorMsg = `${verse.id}: ${error}`;
    console.error(`❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 UPLOAD NEW VERSES ONLY');
  console.log('='.repeat(60) + '\n');

  // 1. Get all local verse files
  console.log('📂 Reading local verse files...');
  const files = fs.readdirSync(UNIFIED_DIR).filter(f => f.endsWith('.json'));
  stats.totalLocal = files.length;
  console.log(`✅ Found ${files.length} local verse files\n`);

  // 2. Get all existing verse IDs from database
  console.log('🔍 Fetching existing verses from database...');
  const { data: existingVerses, error } = await supabase
    .from('verses')
    .select('id');

  if (error) {
    console.error('❌ Failed to fetch existing verses:', error);
    process.exit(1);
  }

  const existingIds = new Set(existingVerses.map(v => v.id));
  stats.totalInDB = existingIds.size;
  console.log(`✅ Found ${existingIds.size} verses in database\n`);

  // 3. Identify new verses to upload
  const newVersesToUpload: string[] = [];
  for (const file of files) {
    const verseId = file.replace('.json', '');
    if (!existingIds.has(verseId)) {
      newVersesToUpload.push(file);
    }
  }

  stats.newVersesToUpload = newVersesToUpload.length;

  if (newVersesToUpload.length === 0) {
    console.log('✅ All verses are already in the database!');
    console.log('   Nothing to upload.\n');
    return;
  }

  console.log(`📤 Found ${newVersesToUpload.length} new verses to upload\n`);

  // Sort files
  newVersesToUpload.sort((a, b) => {
    const [bookA, chapA, verseA] = a.replace('.json', '').split('_');
    const [bookB, chapB, verseB] = b.replace('.json', '').split('_');

    if (bookA !== bookB) return bookA.localeCompare(bookB);
    if (chapA !== chapB) return parseInt(chapA) - parseInt(chapB);
    return parseInt(verseA) - parseInt(verseB);
  });

  // 4. Upload new verses
  console.log('🚀 Starting upload...\n');

  const BATCH_SIZE = 10;
  for (let i = 0; i < newVersesToUpload.length; i += BATCH_SIZE) {
    const batch = newVersesToUpload.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(newVersesToUpload.length / BATCH_SIZE);

    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} verses)`);

    for (const file of batch) {
      const filePath = path.join(UNIFIED_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const verse = JSON.parse(content);

      const success = await uploadVerse(verse);
      if (success) {
        stats.uploaded++;
        console.log(`   ✅ ${verse.reference}`);
      } else {
        stats.skipped++;
      }
    }

    console.log();

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 5. Summary
  console.log('='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nLocal files: ${stats.totalLocal}`);
  console.log(`Database (before): ${stats.totalInDB}`);
  console.log(`New verses identified: ${stats.newVersesToUpload}`);
  console.log(`Successfully uploaded: ${stats.uploaded}`);
  console.log(`Skipped (errors): ${stats.skipped}`);
  console.log(`Database (after): ${stats.totalInDB + stats.uploaded}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`);
    }
  } else {
    console.log('\n✅ No errors!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Upload completed!\n');
}

main().catch(console.error);
