/**
 * DEBUG VERIFICATION LOGIC
 *
 * Reproduce the exact logic from verifyNoDuplicates.ts to understand the discrepancy
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
  console.log('🔍 DEBUG VERIFICATION LOGIC');
  console.log('======================================================================\n');

  // EXACT CODE FROM verifyNoDuplicates.ts CHECK 1
  console.log('CHECK 1: Word Duplicates (verse-specific)');
  console.log('----------------------------------------------------------------------');

  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position');

  if (!words) {
    console.error('No words found');
    return;
  }

  console.log(`Total words fetched: ${words.length}`);

  // Group by (hebrew, verse_id) - only check verse_id if it exists
  const groupMap = new Map<string, any[]>();
  words.forEach((word) => {
    // Skip words without verse_id (orphaned words)
    if (!word.verse_id) return;

    const key = `${word.hebrew}::${word.verse_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(word);
  });

  const skippedWords = words.filter(w => !w.verse_id);
  console.log(`Words with verse_id: ${words.length - skippedWords.length}`);
  console.log(`Words WITHOUT verse_id (skipped): ${skippedWords.length}`);
  console.log(`Unique (hebrew, verse_id) combinations: ${groupMap.size}`);

  const duplicates = Array.from(groupMap.entries())
    .filter(([_, wordList]) => wordList.length > 1);

  const totalDuplicateRecords = duplicates.reduce(
    (sum, [_, list]) => sum + (list.length - 1),
    0
  );

  console.log(`Duplicate combinations: ${duplicates.length}`);
  console.log(`Total duplicate records: ${totalDuplicateRecords}`);

  if (duplicates.length > 0) {
    console.log('\n📝 SAMPLE DUPLICATES:');
    duplicates.slice(0, 5).forEach(([key, list]) => {
      const [hebrew, verseId] = key.split('::');
      console.log(`\n"${hebrew}" in ${verseId} - ${list.length} copies:`);
      list.forEach((w, i) => {
        console.log(`  ${i + 1}) ID: ${w.id.substring(0, 8)}... position: ${w.position}`);
      });
    });
  }

  console.log('\n======================================================================');
  console.log('CHECK 6: Data Integrity');
  console.log('----------------------------------------------------------------------');

  // EXACT CODE FROM verifyNoDuplicates.ts CHECK 6
  const { data: allWords } = await supabase
    .from('words')
    .select('id, verse_id');

  const { data: verses } = await supabase
    .from('verses')
    .select('id');

  if (!allWords || !verses) {
    console.error('Cannot verify');
    return;
  }

  const verseIds = new Set(verses.map(v => v.id));
  const orphanedWords = allWords.filter(w => w.verse_id && !verseIds.has(w.verse_id));

  console.log(`Total words: ${allWords.length}`);
  console.log(`Total verses: ${verses.length}`);
  console.log(`Orphaned words (has verse_id but verse doesn't exist): ${orphanedWords.length}`);

  // Additional check: words with NULL verse_id
  const nullVerseId = allWords.filter(w => !w.verse_id);
  console.log(`Words with NULL verse_id: ${nullVerseId.length}`);

  console.log('\n======================================================================');
  console.log('💡 EXPLANATION OF DISCREPANCY');
  console.log('======================================================================');

  console.log(`
The "234 duplicate combinations" from the verification script means:
- There are 234 unique (hebrew, verse_id) pairs that have MORE THAN ONE record
- This accounts for the DIFFERENCE between total words (1000) and unique combinations (764)
- Calculation: If we have 1000 total words but only 764 unique combinations,
  that means 236 words are "extra" duplicates (1000 - 764 = 236)

However, the finalDuplicateRemoval.ts script found 0 duplicates because:
- It uses a different query or grouping logic
- OR the data was already cleaned

Let's verify by manually checking one known duplicate case...
  `);

  // Check a specific verse for duplicates
  const verse = 'genesis_1_6';
  const gen16Words = words.filter(w => w.verse_id === verse);
  const gen16ByHebrew = new Map<string, any[]>();

  gen16Words.forEach(w => {
    if (!gen16ByHebrew.has(w.hebrew)) {
      gen16ByHebrew.set(w.hebrew, []);
    }
    gen16ByHebrew.get(w.hebrew)!.push(w);
  });

  const gen16Duplicates = Array.from(gen16ByHebrew.entries())
    .filter(([_, list]) => list.length > 1);

  console.log(`\n🔍 SPECIFIC CHECK: Genesis 1:6`);
  console.log(`Total words: ${gen16Words.length}`);
  console.log(`Unique Hebrew words: ${gen16ByHebrew.size}`);
  console.log(`Duplicate Hebrew words in this verse: ${gen16Duplicates.length}`);

  if (gen16Duplicates.length > 0) {
    gen16Duplicates.forEach(([hebrew, list]) => {
      console.log(`  "${hebrew}": ${list.length} copies`);
    });
  }
}

main().catch(console.error);
