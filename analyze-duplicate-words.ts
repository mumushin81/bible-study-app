import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDuplicateWords() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 DUPLICATE WORDS DEEP DIVE ANALYSIS');
  console.log('='.repeat(80) + '\n');

  // ============================================================================
  // 1. GET ALL GENESIS WORDS
  // ============================================================================
  console.log('📋 STEP 1: FETCHING ALL GENESIS WORDS');
  console.log('-'.repeat(80) + '\n');

  const { data: allWords, error: wordsError } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, meaning, position, root, grammar, verses!inner(id, reference, book_id, chapter, verse_number)')
    .eq('verses.book_id', 'genesis');

  if (wordsError) {
    console.error('❌ Error fetching words:', wordsError);
    return;
  }

  console.log(`✅ Total Genesis words: ${allWords?.length}\n`);

  // ============================================================================
  // 2. ANALYZE DUPLICATES BY (hebrew, verse_id)
  // ============================================================================
  console.log('📋 STEP 2: GROUPING BY (hebrew, verse_id)');
  console.log('-'.repeat(80) + '\n');

  const hebrewVerseMap = new Map<string, any[]>();

  allWords?.forEach((word: any) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    if (!hebrewVerseMap.has(key)) {
      hebrewVerseMap.set(key, []);
    }
    hebrewVerseMap.get(key)!.push(word);
  });

  const duplicates = Array.from(hebrewVerseMap.entries()).filter(([_, words]) => words.length > 1);

  console.log(`Total unique (hebrew, verse_id) combinations: ${hebrewVerseMap.size}`);
  console.log(`Combinations with duplicates: ${duplicates.length}`);
  console.log(`Total duplicate word records: ${duplicates.reduce((sum, [_, words]) => sum + (words.length - 1), 0)}\n`);

  // ============================================================================
  // 3. DETAILED DUPLICATE ANALYSIS
  // ============================================================================
  console.log('📋 STEP 3: DETAILED DUPLICATE ANALYSIS');
  console.log('-'.repeat(80) + '\n');

  console.log('Sample duplicates (first 10):\n');

  duplicates.slice(0, 10).forEach(([key, words], idx) => {
    const [hebrew, verseId] = key.split('::');
    console.log(`${idx + 1}. Hebrew: "${hebrew}" | Verse: ${verseId}`);
    console.log(`   Reference: ${words[0].verses.reference}`);
    console.log(`   Duplicate count: ${words.length}`);

    // Check if meanings differ
    const uniqueMeanings = new Set(words.map(w => w.meaning));
    const uniquePositions = new Set(words.map(w => w.position));
    const uniqueRoots = new Set(words.map(w => w.root));
    const uniqueGrammar = new Set(words.map(w => w.grammar));

    console.log(`   Unique meanings: ${uniqueMeanings.size} (${Array.from(uniqueMeanings).join(' | ')})`);
    console.log(`   Unique positions: ${uniquePositions.size} (${Array.from(uniquePositions).join(', ')})`);
    console.log(`   Unique roots: ${uniqueRoots.size}`);
    console.log(`   Unique grammar: ${uniqueGrammar.size}`);

    console.log(`   Records:`);
    words.forEach((w, i) => {
      console.log(`     [${i + 1}] ID: ${w.id.substring(0, 8)}... | Pos: ${w.position} | Meaning: "${w.meaning}"`);
    });
    console.log('');
  });

  // ============================================================================
  // 4. CATEGORIZE DUPLICATES BY TYPE
  // ============================================================================
  console.log('\n📋 STEP 4: CATEGORIZING DUPLICATES');
  console.log('-'.repeat(80) + '\n');

  let identicalRecords = 0;
  let differentMeanings = 0;
  let differentPositions = 0;
  let differentAttributes = 0;

  duplicates.forEach(([_, words]) => {
    const meanings = new Set(words.map(w => w.meaning));
    const positions = new Set(words.map(w => w.position));
    const roots = new Set(words.map(w => w.root));
    const grammar = new Set(words.map(w => w.grammar));

    if (meanings.size === 1 && positions.size === 1 && roots.size === 1 && grammar.size === 1) {
      identicalRecords++;
    } else if (meanings.size > 1) {
      differentMeanings++;
    } else if (positions.size > 1) {
      differentPositions++;
    } else {
      differentAttributes++;
    }
  });

  console.log('Duplicate Categories:');
  console.log(`  ✅ Truly identical (all fields same): ${identicalRecords}`);
  console.log(`  ⚠️  Different meanings: ${differentMeanings}`);
  console.log(`  ⚠️  Different positions: ${differentPositions}`);
  console.log(`  ⚠️  Other differences: ${differentAttributes}\n`);

  // ============================================================================
  // 5. CHECK VERSES WITH MOST DUPLICATES
  // ============================================================================
  console.log('\n📋 STEP 5: VERSES WITH MOST DUPLICATE WORDS');
  console.log('-'.repeat(80) + '\n');

  const verseMap = new Map<string, number>();
  duplicates.forEach(([key, words]) => {
    const verseId = key.split('::')[1];
    verseMap.set(verseId, (verseMap.get(verseId) || 0) + words.length - 1); // count extra records
  });

  const topVerses = Array.from(verseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('Top 10 verses with most duplicate word records:\n');
  topVerses.forEach(([verseId, count], idx) => {
    // Find reference
    const sampleWord = allWords?.find((w: any) => w.verse_id === verseId);
    console.log(`  ${idx + 1}. ${sampleWord?.verses.reference || verseId}: ${count} duplicate records`);
  });

  // ============================================================================
  // 6. INVESTIGATE SPECIFIC CASE
  // ============================================================================
  console.log('\n\n📋 STEP 6: SPECIFIC CASE INVESTIGATION');
  console.log('-'.repeat(80) + '\n');

  // Find a duplicate with different meanings (if exists)
  const differentMeaningCase = duplicates.find(([_, words]) => {
    const meanings = new Set(words.map(w => w.meaning));
    return meanings.size > 1;
  });

  if (differentMeaningCase) {
    const [key, words] = differentMeaningCase;
    const [hebrew, verseId] = key.split('::');

    console.log('🔍 Example: Duplicate with DIFFERENT meanings\n');
    console.log(`Hebrew: "${hebrew}"`);
    console.log(`Verse: ${verseId} (${words[0].verses.reference})\n`);
    console.log('Records:');
    words.forEach((w, i) => {
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    Word ID: ${w.id}`);
      console.log(`    Verse ID: ${w.verse_id}`);
      console.log(`    Hebrew: ${w.hebrew}`);
      console.log(`    Meaning: ${w.meaning}`);
      console.log(`    Position: ${w.position}`);
      console.log(`    Root: ${w.root}`);
      console.log(`    Grammar: ${w.grammar}`);
      console.log(`    Points to verse: ${w.verses.id} (${w.verses.reference})`);
    });
  } else {
    console.log('✅ No duplicates with different meanings found.');
  }

  // ============================================================================
  // 7. CHECK IF DUPLICATES POINT TO DIFFERENT VERSE RECORDS
  // ============================================================================
  console.log('\n\n📋 STEP 7: DO DUPLICATES POINT TO DIFFERENT VERSE RECORDS?');
  console.log('-'.repeat(80) + '\n');

  let allPointToSame = 0;
  let pointToDifferent = 0;

  duplicates.forEach(([key, words]) => {
    const verseIds = new Set(words.map((w: any) => w.verses.id));
    if (verseIds.size === 1) {
      allPointToSame++;
    } else {
      pointToDifferent++;
      // Log this anomaly
      const [hebrew, wordVerseId] = key.split('::');
      console.log(`⚠️  Anomaly found!`);
      console.log(`   Hebrew: "${hebrew}", word.verse_id: ${wordVerseId}`);
      console.log(`   Points to ${verseIds.size} different verse records:`);
      words.forEach((w: any) => {
        console.log(`     - Word ID: ${w.id.substring(0, 8)}..., verse.id: ${w.verses.id}`);
      });
      console.log('');
    }
  });

  console.log(`\nSummary:`);
  console.log(`  ✅ All duplicates point to SAME verse record: ${allPointToSame}`);
  console.log(`  ❌ Duplicates point to DIFFERENT verse records: ${pointToDifferent}\n`);

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL ANALYSIS SUMMARY');
  console.log('='.repeat(80) + '\n');

  console.log('KEY FINDINGS:\n');
  console.log(`1. Total words in Genesis: ${allWords?.length}`);
  console.log(`2. Unique (hebrew, verse_id) combinations: ${hebrewVerseMap.size}`);
  console.log(`3. Duplicate combinations: ${duplicates.length}`);
  console.log(`4. Total duplicate records to remove: ${duplicates.reduce((sum, [_, words]) => sum + (words.length - 1), 0)}\n`);

  console.log('DUPLICATE TYPES:\n');
  console.log(`5. Truly identical duplicates: ${identicalRecords}`);
  console.log(`6. Duplicates with different meanings: ${differentMeanings}`);
  console.log(`7. Duplicates with different positions: ${differentPositions}`);
  console.log(`8. Other attribute differences: ${differentAttributes}\n`);

  console.log('RELATIONSHIP INTEGRITY:\n');
  console.log(`9. Duplicates pointing to SAME verse: ${allPointToSame}`);
  console.log(`10. Duplicates pointing to DIFFERENT verses: ${pointToDifferent}\n`);

  console.log('CONCLUSION:\n');
  if (pointToDifferent > 0) {
    console.log('❌ CRITICAL ISSUE: Some duplicate words point to different verse records!');
    console.log('   This indicates a data integrity problem that needs investigation.');
  } else if (duplicates.length > 0) {
    console.log('⚠️  There are duplicate word records (same hebrew + verse_id).');
    console.log('   All duplicates correctly point to the same verse record.');
    console.log('   Recommendation: Remove duplicate records, keeping only one per (hebrew, verse_id).');
  } else {
    console.log('✅ No duplicate words found. Data integrity is good!');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

analyzeDuplicateWords().catch(console.error);
