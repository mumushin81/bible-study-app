/**
 * ANALYZE ORPHANED WORDS
 *
 * Find and analyze words without valid verse_id references
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('======================================================================');
  console.log('🔍 ORPHANED WORDS ANALYSIS');
  console.log('======================================================================\n');

  // Get all words
  const { data: allWords, error: wordsError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, verse_id, position, created_at')
    .order('created_at', { ascending: true });

  if (wordsError) {
    console.error('❌ Error fetching words:', wordsError);
    process.exit(1);
  }

  // Get all verses
  const { data: allVerses, error: versesError } = await supabase
    .from('verses')
    .select('id, reference');

  if (versesError) {
    console.error('❌ Error fetching verses:', versesError);
    process.exit(1);
  }

  const verseIds = new Set(allVerses?.map(v => v.id) || []);

  // Find orphaned words
  const orphaned = allWords?.filter(w => {
    // Orphaned if verse_id is null OR verse_id doesn't exist in verses table
    return !w.verse_id || !verseIds.has(w.verse_id);
  }) || [];

  console.log('📊 SUMMARY');
  console.log('----------------------------------------------------------------------');
  console.log(`Total words in database: ${allWords?.length || 0}`);
  console.log(`Total verses in database: ${allVerses?.length || 0}`);
  console.log(`Orphaned words: ${orphaned.length}`);
  console.log('');

  if (orphaned.length > 0) {
    console.log('📋 ORPHANED WORD BREAKDOWN');
    console.log('----------------------------------------------------------------------');

    const nullVerseId = orphaned.filter(w => !w.verse_id);
    const invalidVerseId = orphaned.filter(w => w.verse_id && !verseIds.has(w.verse_id));

    console.log(`Words with NULL verse_id: ${nullVerseId.length}`);
    console.log(`Words with INVALID verse_id: ${invalidVerseId.length}`);
    console.log('');

    // Sample null verse_id words
    if (nullVerseId.length > 0) {
      console.log('📝 SAMPLE NULL VERSE_ID WORDS (first 10):');
      console.log('----------------------------------------------------------------------');
      nullVerseId.slice(0, 10).forEach((w, i) => {
        console.log(`${i + 1}. ${w.hebrew} (${w.meaning}) - ID: ${w.id.substring(0, 8)}... - Created: ${new Date(w.created_at).toISOString()}`);
      });
      console.log('');
    }

    // Sample invalid verse_id words
    if (invalidVerseId.length > 0) {
      console.log('📝 SAMPLE INVALID VERSE_ID WORDS (first 10):');
      console.log('----------------------------------------------------------------------');
      invalidVerseId.slice(0, 10).forEach((w, i) => {
        console.log(`${i + 1}. ${w.hebrew} (${w.meaning}) - verse_id: ${w.verse_id} - ID: ${w.id.substring(0, 8)}...`);
      });
      console.log('');
    }

    // Analyze creation patterns
    console.log('📅 CREATION DATE ANALYSIS');
    console.log('----------------------------------------------------------------------');
    const byDate = new Map<string, number>();
    orphaned.forEach(w => {
      const date = new Date(w.created_at).toISOString().split('T')[0];
      byDate.set(date, (byDate.get(date) || 0) + 1);
    });

    Array.from(byDate.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([date, count]) => {
        console.log(`${date}: ${count} orphaned words`);
      });
    console.log('');
  }

  // Now check for ACTUAL duplicates including orphaned words
  console.log('🔍 DUPLICATE ANALYSIS (INCLUDING ORPHANED WORDS)');
  console.log('======================================================================');

  const groupByHebrew = new Map<string, any[]>();
  allWords?.forEach(w => {
    const key = w.hebrew;
    if (!groupByHebrew.has(key)) {
      groupByHebrew.set(key, []);
    }
    groupByHebrew.get(key)!.push(w);
  });

  const duplicatesByHebrew = Array.from(groupByHebrew.entries())
    .filter(([_, list]) => list.length > 1);

  console.log(`Total unique Hebrew words: ${groupByHebrew.size}`);
  console.log(`Hebrew words with duplicates: ${duplicatesByHebrew.length}`);
  console.log('');

  if (duplicatesByHebrew.length > 0) {
    console.log('📝 SAMPLE DUPLICATE HEBREW WORDS (first 10):');
    console.log('----------------------------------------------------------------------');
    duplicatesByHebrew.slice(0, 10).forEach(([hebrew, list], i) => {
      console.log(`${i + 1}. ${hebrew} - ${list.length} occurrences`);
      list.slice(0, 3).forEach((w, j) => {
        console.log(`   ${j + 1}) verse_id: ${w.verse_id || 'NULL'} - meaning: ${w.meaning} - ID: ${w.id.substring(0, 8)}...`);
      });
    });
  }

  console.log('');
  console.log('======================================================================');
  console.log('💡 RECOMMENDATIONS');
  console.log('======================================================================');

  if (orphaned.length > 0) {
    console.log('1. Delete orphaned words (they have no verse association)');
    console.log('2. Investigate why words were created without verse_id');
    console.log('3. Add foreign key constraint to prevent future orphaned words');
  }

  console.log('');
}

main().catch(console.error);
