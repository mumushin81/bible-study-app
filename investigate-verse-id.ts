import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateVerseId() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VERSE_ID FORMAT AND UNIQUENESS INVESTIGATION');
  console.log('='.repeat(80) + '\n');

  // ============================================================================
  // 1. VERSES TABLE SCHEMA ANALYSIS
  // ============================================================================
  console.log('📋 TASK 1: VERSES TABLE SCHEMA');
  console.log('-'.repeat(80));

  // Get sample verses to understand the structure
  const { data: sampleVerses, error: sampleError } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .limit(5);

  if (sampleError) {
    console.error('❌ Error fetching sample verses:', sampleError);
  } else {
    console.log('\n✅ Sample Verse Structure (Genesis 1:1-5):');
    sampleVerses?.forEach((verse, idx) => {
      console.log(`\nVerse ${idx + 1}:`);
      console.log(`  id: ${verse.id}`);
      console.log(`  book_id: ${verse.book_id}`);
      console.log(`  chapter: ${verse.chapter}`);
      console.log(`  verse_number: ${verse.verse_number}`);
      console.log(`  reference: ${verse.reference}`);
    });
  }

  // ============================================================================
  // 2. SPECIFIC VERSE: GENESIS 1:6
  // ============================================================================
  console.log('\n\n📋 TASK 2: QUERY GENESIS 1:6 SPECIFICALLY');
  console.log('-'.repeat(80));

  // Try querying by constructed verse_id
  const { data: gen1v6ById, error: byIdError } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number, reference, hebrew')
    .eq('id', 'genesis_1_6');

  console.log('\n🔹 Query: .eq("id", "genesis_1_6")');
  if (byIdError) {
    console.error('❌ Error:', byIdError);
  } else {
    console.log(`✅ Results: ${gen1v6ById?.length || 0} record(s)`);
    gen1v6ById?.forEach(v => {
      console.log(`   ID: ${v.id}, Ref: ${v.reference}`);
    });
  }

  // Try querying by components
  const { data: gen1v6ByComponents, error: byComponentsError } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number, reference, hebrew')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 6);

  console.log('\n🔹 Query: .eq("book_id", "genesis").eq("chapter", 1).eq("verse_number", 6)');
  if (byComponentsError) {
    console.error('❌ Error:', byComponentsError);
  } else {
    console.log(`✅ Results: ${gen1v6ByComponents?.length || 0} record(s)`);
    gen1v6ByComponents?.forEach(v => {
      console.log(`   ID: ${v.id}, Ref: ${v.reference}, Hebrew: ${v.hebrew?.substring(0, 30)}...`);
    });
  }

  // ============================================================================
  // 3. CHECK FOR DUPLICATE VERSE_IDs
  // ============================================================================
  console.log('\n\n📋 TASK 3: CHECK FOR DUPLICATE VERSE IDs');
  console.log('-'.repeat(80));

  // Get all verses from Genesis
  const { data: allGenesis, error: allGenesisError } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number, reference')
    .eq('book_id', 'genesis')
    .order('chapter')
    .order('verse_number');

  if (allGenesisError) {
    console.error('❌ Error:', allGenesisError);
  } else {
    console.log(`\n✅ Total Genesis verses: ${allGenesis?.length}`);

    // Check for duplicate IDs
    const idMap = new Map<string, number>();
    allGenesis?.forEach(verse => {
      idMap.set(verse.id, (idMap.get(verse.id) || 0) + 1);
    });

    const duplicateIds = Array.from(idMap.entries()).filter(([_, count]) => count > 1);

    if (duplicateIds.length > 0) {
      console.log(`\n❌ Found ${duplicateIds.length} duplicate verse IDs:`);
      duplicateIds.slice(0, 10).forEach(([id, count]) => {
        console.log(`   ${id}: ${count} occurrences`);
      });
    } else {
      console.log('\n✅ No duplicate verse IDs found!');
    }

    // Check for duplicate (book_id, chapter, verse_number) combinations
    const comboMap = new Map<string, any[]>();
    allGenesis?.forEach(verse => {
      const key = `${verse.book_id}_${verse.chapter}_${verse.verse_number}`;
      if (!comboMap.has(key)) {
        comboMap.set(key, []);
      }
      comboMap.get(key)!.push(verse);
    });

    const duplicateCombos = Array.from(comboMap.entries()).filter(([_, verses]) => verses.length > 1);

    if (duplicateCombos.length > 0) {
      console.log(`\n❌ Found ${duplicateCombos.length} duplicate (book_id, chapter, verse_number) combinations:`);
      duplicateCombos.slice(0, 10).forEach(([key, verses]) => {
        console.log(`   ${key}: ${verses.length} records with IDs: ${verses.map(v => v.id).join(', ')}`);
      });
    } else {
      console.log('✅ No duplicate (book_id, chapter, verse_number) combinations found!');
    }
  }

  // ============================================================================
  // 4. ANALYZE WORDS TABLE RELATIONSHIP
  // ============================================================================
  console.log('\n\n📋 TASK 4: WORDS TABLE RELATIONSHIP WITH VERSES');
  console.log('-'.repeat(80));

  // Get words for Genesis 1:6
  const { data: wordsGen1v6, error: wordsError } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, meaning, position')
    .eq('verse_id', 'genesis_1_6')
    .order('position');

  console.log('\n🔹 Query: words WHERE verse_id = "genesis_1_6"');
  if (wordsError) {
    console.error('❌ Error:', wordsError);
  } else {
    console.log(`✅ Results: ${wordsGen1v6?.length || 0} word(s)`);
    if (wordsGen1v6 && wordsGen1v6.length > 0) {
      console.log('\nFirst 5 words:');
      wordsGen1v6.slice(0, 5).forEach(w => {
        console.log(`   [${w.position}] ${w.hebrew} - "${w.meaning}"`);
      });
    }
  }

  // Check for duplicate words (same hebrew, same verse_id)
  const { data: allWords, error: allWordsError } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, meaning, position')
    .eq('verse_id', 'genesis_1_6');

  if (!allWordsError && allWords) {
    const wordMap = new Map<string, any[]>();
    allWords.forEach(word => {
      const key = `${word.hebrew}::${word.verse_id}`;
      if (!wordMap.has(key)) {
        wordMap.set(key, []);
      }
      wordMap.get(key)!.push(word);
    });

    const duplicateWords = Array.from(wordMap.entries()).filter(([_, words]) => words.length > 1);

    if (duplicateWords.length > 0) {
      console.log(`\n❌ Found ${duplicateWords.length} duplicate (hebrew, verse_id) combinations in Genesis 1:6:`);
      duplicateWords.forEach(([key, words]) => {
        console.log(`   ${words[0].hebrew}:`);
        words.forEach(w => {
          console.log(`      ID: ${w.id.substring(0, 8)}..., Position: ${w.position}, Meaning: ${w.meaning}`);
        });
      });
    } else {
      console.log('\n✅ No duplicate (hebrew, verse_id) combinations in Genesis 1:6!');
    }
  }

  // ============================================================================
  // 5. CHECK WORDS POINTING TO DIFFERENT VERSE RECORDS
  // ============================================================================
  console.log('\n\n📋 TASK 5: CHECK IF DUPLICATE WORDS POINT TO SAME/DIFFERENT VERSE RECORDS');
  console.log('-'.repeat(80));

  // Find all words with duplicate (hebrew, verse_id) in all of Genesis
  const { data: allGenesisWords, error: allWordsErr } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, meaning, position, verses!inner(id, reference, book_id)')
    .eq('verses.book_id', 'genesis')
    .limit(1000); // Limit for performance

  if (!allWordsErr && allGenesisWords) {
    const wordComboMap = new Map<string, any[]>();
    allGenesisWords.forEach((word: any) => {
      const key = `${word.hebrew}::${word.verse_id}`;
      if (!wordComboMap.has(key)) {
        wordComboMap.set(key, []);
      }
      wordComboMap.get(key)!.push(word);
    });

    const duplicates = Array.from(wordComboMap.entries()).filter(([_, words]) => words.length > 1);

    console.log(`\n🔹 Checking first 1000 words from Genesis...`);
    console.log(`✅ Found ${duplicates.length} duplicate (hebrew, verse_id) combinations`);

    if (duplicates.length > 0) {
      console.log('\nSample duplicates (first 5):');
      duplicates.slice(0, 5).forEach(([key, words]) => {
        const [hebrew, verseId] = key.split('::');
        console.log(`\n   Hebrew: ${hebrew}, verse_id: ${verseId}`);
        console.log(`   Number of duplicate records: ${words.length}`);

        // Check if they point to the same verse record
        const uniqueVerseIds = new Set(words.map((w: any) => w.verses.id));
        if (uniqueVerseIds.size === 1) {
          console.log(`   ✅ All point to SAME verse record (id: ${words[0].verses.id})`);
        } else {
          console.log(`   ❌ Point to DIFFERENT verse records:`);
          words.forEach((w: any) => {
            console.log(`      - Word ID: ${w.id.substring(0, 8)}..., Points to verse: ${w.verses.id}`);
          });
        }
      });
    }
  }

  // ============================================================================
  // 6. VERSE_ID FORMAT VERIFICATION
  // ============================================================================
  console.log('\n\n📋 TASK 6: VERIFY VERSE_ID FORMAT');
  console.log('-'.repeat(80));

  const { data: formatSample, error: formatError } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number')
    .eq('book_id', 'genesis')
    .limit(20);

  if (!formatError && formatSample) {
    console.log('\n✅ Verifying format: book_chapter_verse\n');

    let formatCorrect = 0;
    let formatIncorrect = 0;

    formatSample.forEach(verse => {
      const expected = `${verse.book_id}_${verse.chapter}_${verse.verse_number}`;
      const actual = verse.id;

      if (expected === actual) {
        formatCorrect++;
      } else {
        formatIncorrect++;
        console.log(`   ❌ Mismatch: Expected "${expected}", Got "${actual}"`);
      }
    });

    console.log(`\n📊 Format verification (sample of ${formatSample.length}):`);
    console.log(`   ✅ Correct format: ${formatCorrect}`);
    console.log(`   ❌ Incorrect format: ${formatIncorrect}`);
  }

  // ============================================================================
  // 7. CHECK PRIMARY KEY AND CONSTRAINTS
  // ============================================================================
  console.log('\n\n📋 TASK 7: DATABASE SCHEMA CONSTRAINTS');
  console.log('-'.repeat(80));

  // Query information schema
  const { data: constraints, error: constraintsError } = await supabase
    .rpc('get_table_constraints', { table_name: 'verses' })
    .limit(1);

  console.log('\n🔹 Attempting to query table constraints...');
  if (constraintsError) {
    console.log('⚠️  RPC function not available (expected)');
    console.log('   Based on schema migration file:');
    console.log('   - verses.id is TEXT PRIMARY KEY');
    console.log('   - Format: "book_chapter_verse" (e.g., "genesis_1_6")');
    console.log('   - UNIQUE constraint may exist on (book_id, chapter, verse_number)');
  } else {
    console.log('✅ Constraints found:', constraints);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 INVESTIGATION SUMMARY');
  console.log('='.repeat(80) + '\n');

  console.log('KEY FINDINGS:');
  console.log('1. verses.id is the PRIMARY KEY (TEXT type)');
  console.log('2. verse_id format: "book_chapter_verse" (e.g., "genesis_1_6")');
  console.log('3. words.verse_id is a FOREIGN KEY referencing verses.id');
  console.log('4. Schema expects verses.id to be UNIQUE (primary key)');
  console.log('5. A UNIQUE constraint may exist on (book_id, chapter, verse_number)');
  console.log('\nRELATIONSHIP:');
  console.log('words.verse_id → verses.id (NOT verses.verse_id)');
  console.log('\nNOTE: verses table does NOT have a separate "verse_id" column');
  console.log('      The "id" column serves as the verse identifier');

  console.log('\n' + '='.repeat(80) + '\n');
}

investigateVerseId().catch(console.error);
