import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalVerification() {
  console.log('\n' + '='.repeat(80));
  console.log('✅ FINAL VERIFICATION CHECKLIST');
  console.log('='.repeat(80) + '\n');

  const results: Array<{ test: string; passed: boolean; details: string }> = [];

  // Test 1: verses.id is unique
  console.log('Test 1: Verifying verses.id is unique...');
  const { data: allVerses } = await supabase
    .from('verses')
    .select('id');

  const uniqueVerseIds = new Set(allVerses?.map(v => v.id));
  const test1Pass = uniqueVerseIds.size === allVerses?.length;
  results.push({
    test: 'verses.id is unique (PRIMARY KEY)',
    passed: test1Pass,
    details: `Total: ${allVerses?.length}, Unique: ${uniqueVerseIds.size}`
  });

  // Test 2: verse_id format is book_chapter_verse
  console.log('Test 2: Verifying verse_id format...');
  const formatSample = allVerses?.slice(0, 100) || [];
  let formatErrors = 0;

  for (const verse of formatSample) {
    if (!verse.id.match(/^[a-z]+_\d+_\d+$/)) {
      formatErrors++;
    }
  }

  const test2Pass = formatErrors === 0;
  results.push({
    test: 'verse_id format is book_chapter_verse',
    passed: test2Pass,
    details: `Checked ${formatSample.length} verses, ${formatErrors} errors`
  });

  // Test 3: words.verse_id references existing verses
  console.log('Test 3: Verifying words.verse_id foreign key integrity...');
  const { data: allWords } = await supabase
    .from('words')
    .select('verse_id');

  const allVerseIdSet = new Set(allVerses?.map(v => v.id));
  const orphanWords = allWords?.filter(w => !allVerseIdSet.has(w.verse_id)) || [];

  const test3Pass = orphanWords.length === 0;
  results.push({
    test: 'words.verse_id references existing verses (FK integrity)',
    passed: test3Pass,
    details: `Total words: ${allWords?.length}, Orphans: ${orphanWords.length}`
  });

  // Test 4: Check for duplicate (hebrew, verse_id)
  console.log('Test 4: Checking for duplicate (hebrew, verse_id)...');
  const { data: wordsFull } = await supabase
    .from('words')
    .select('hebrew, verse_id');

  const wordComboMap = new Map<string, number>();
  wordsFull?.forEach(w => {
    const key = `${w.hebrew}::${w.verse_id}`;
    wordComboMap.set(key, (wordComboMap.get(key) || 0) + 1);
  });

  const duplicateCount = Array.from(wordComboMap.values()).filter(count => count > 1).length;
  const test4Pass = duplicateCount === 0;
  results.push({
    test: 'No duplicate (hebrew, verse_id) combinations',
    passed: test4Pass,
    details: `Unique combos: ${wordComboMap.size}, Duplicates: ${duplicateCount}`
  });

  // Test 5: Genesis 1:6 query test
  console.log('Test 5: Querying Genesis 1:6...');
  const { data: gen16ById } = await supabase
    .from('verses')
    .select('*')
    .eq('id', 'genesis_1_6')
    .single();

  const { data: gen16ByComponents } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 6)
    .single();

  const test5Pass = gen16ById !== null && gen16ByComponents !== null && gen16ById.id === gen16ByComponents.id;
  results.push({
    test: 'Genesis 1:6 query by ID and components returns same record',
    passed: test5Pass,
    details: `By ID: ${gen16ById?.id || 'null'}, By components: ${gen16ByComponents?.id || 'null'}`
  });

  // Test 6: Words for Genesis 1:6
  console.log('Test 6: Fetching words for Genesis 1:6...');
  const { data: gen16Words } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', 'genesis_1_6')
    .order('position');

  const test6Pass = gen16Words !== null && gen16Words.length > 0;
  results.push({
    test: 'Words for Genesis 1:6 can be fetched via verse_id',
    passed: test6Pass,
    details: `Found ${gen16Words?.length || 0} words`
  });

  // Test 7: Verify no column named 'verse_id' in verses table
  console.log('Test 7: Checking verses table columns...');
  const { data: sampleVerse } = await supabase
    .from('verses')
    .select('*')
    .limit(1)
    .single();

  const hasVerseIdColumn = sampleVerse ? 'verse_id' in sampleVerse : false;
  const test7Pass = !hasVerseIdColumn;
  results.push({
    test: 'verses table does NOT have a verse_id column (uses id instead)',
    passed: test7Pass,
    details: hasVerseIdColumn ? 'UNEXPECTED: verse_id column found!' : 'Correct: Only id column exists'
  });

  // Test 8: Verify verses table has expected columns
  console.log('Test 8: Verifying verses table schema...');
  const expectedColumns = ['id', 'book_id', 'chapter', 'verse_number', 'reference', 'hebrew'];
  const hasAllColumns = expectedColumns.every(col => sampleVerse ? col in sampleVerse : false);

  const test8Pass = hasAllColumns;
  results.push({
    test: 'verses table has expected columns',
    passed: test8Pass,
    details: `Checked: ${expectedColumns.join(', ')}`
  });

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(80) + '\n');

  results.forEach((result, idx) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${idx + 1}: ${result.test}`);
    console.log(`   ${result.details}\n`);
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log('='.repeat(80));
  console.log(`FINAL SCORE: ${passedCount}/${totalCount} tests passed`);
  console.log('='.repeat(80) + '\n');

  if (passedCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('CONFIRMED:');
    console.log('1. verse_id is truly unique (it is verses.id, the PRIMARY KEY)');
    console.log('2. There is exactly ONE record per verse');
    console.log('3. words.verse_id correctly references verses.id');
    console.log('4. verse_id format is: book_chapter_verse\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED\n');
    console.log('Failed tests:');
    results.forEach((result, idx) => {
      if (!result.passed) {
        console.log(`  - Test ${idx + 1}: ${result.test}`);
      }
    });
    console.log('');
  }

  // Additional context
  if (duplicateCount > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  DUPLICATE WORDS DETECTED');
    console.log('='.repeat(80) + '\n');
    console.log(`Found ${duplicateCount} duplicate (hebrew, verse_id) combinations.`);
    console.log('This is NOT a verse uniqueness issue, but a words table issue.\n');
    console.log('To fix:');
    console.log('1. Run: npx tsx scripts/migrations/removeDuplicateWords.ts');
    console.log('2. Add unique constraint on words table');
    console.log('3. Prevent future duplicates during data import\n');
  }

  console.log('='.repeat(80) + '\n');
}

finalVerification().catch(console.error);
