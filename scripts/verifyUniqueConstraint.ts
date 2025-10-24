import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyConstraint() {
  console.log('\n' + '=' .repeat(70));
  console.log('🔍 Verifying UNIQUE Constraint on words table');
  console.log('=' .repeat(70) + '\n');

  let allTestsPassed = true;

  // Test 1: Try to insert a duplicate (should fail)
  console.log('Test 1: Attempting to insert a duplicate...\n');

  // First, get a sample word
  const { data: sampleWord, error: fetchError } = await supabase
    .from('words')
    .select('hebrew, verse_id, position, meaning, ipa, korean, root, grammar')
    .limit(1)
    .single();

  if (fetchError || !sampleWord) {
    console.log('   ⚠️  No sample word found for testing');
    console.log(`   Error: ${fetchError?.message || 'No data'}\n`);
    allTestsPassed = false;
  } else {
    console.log(`   Sample word: ${sampleWord.hebrew}`);
    console.log(`   Verse: ${sampleWord.verse_id}`);
    console.log(`   Position: ${sampleWord.position}\n`);

    // Try to insert duplicate
    const { error } = await supabase
      .from('words')
      .insert({
        hebrew: sampleWord.hebrew,
        verse_id: sampleWord.verse_id,
        position: sampleWord.position,
        meaning: sampleWord.meaning,
        ipa: sampleWord.ipa,
        korean: sampleWord.korean,
        root: sampleWord.root,
        grammar: sampleWord.grammar
      });

    if (error) {
      if (error.message.includes('duplicate key') ||
          error.message.includes('unique') ||
          error.message.includes('words_hebrew_verse_id_position_unique')) {
        console.log('   ✅ PASS: Constraint working! Duplicate insert rejected.');
        console.log(`   Error message: ${error.message}\n`);
      } else {
        console.log('   ❌ FAIL: Unexpected error (not constraint-related)');
        console.log(`   Error: ${error.message}\n`);
        allTestsPassed = false;
      }
    } else {
      console.log('   ❌ FAIL: Duplicate was inserted! Constraint NOT working!\n');
      allTestsPassed = false;

      // Clean up the duplicate we just created
      await supabase
        .from('words')
        .delete()
        .eq('hebrew', sampleWord.hebrew)
        .eq('verse_id', sampleWord.verse_id)
        .eq('position', sampleWord.position)
        .eq('meaning', sampleWord.meaning);
    }
  }

  console.log('=' .repeat(70) + '\n');

  // Test 2: Verify existing data has no duplicates
  console.log('Test 2: Checking for duplicates in existing data...\n');

  const { data: allWords, error: allWordsError } = await supabase
    .from('words')
    .select('hebrew, verse_id, position');

  if (allWordsError || !allWords) {
    console.log('   ❌ FAIL: Could not fetch words');
    console.log(`   Error: ${allWordsError?.message || 'No data'}\n`);
    allTestsPassed = false;
  } else {
    const uniqueMap = new Map<string, number>();
    allWords.forEach(word => {
      const key = `${word.hebrew}::${word.verse_id}::${word.position}`;
      uniqueMap.set(key, (uniqueMap.get(key) || 0) + 1);
    });

    const duplicates = Array.from(uniqueMap.values()).filter(count => count > 1);

    if (duplicates.length === 0) {
      console.log('   ✅ PASS: No duplicates in existing data');
      console.log(`   Total words: ${allWords.length}`);
      console.log(`   Unique combinations: ${uniqueMap.size}\n`);
    } else {
      console.log(`   ❌ FAIL: Found ${duplicates.length} duplicate combinations!`);
      console.log('   This should not happen if constraint was added correctly.\n');
      allTestsPassed = false;

      // Show samples
      console.log('   Sample duplicates:');
      let count = 0;
      uniqueMap.forEach((cnt, key) => {
        if (cnt > 1 && count < 5) {
          console.log(`      ${key}: ${cnt} occurrences`);
          count++;
        }
      });
      console.log('');
    }
  }

  console.log('=' .repeat(70) + '\n');

  // Test 3: Test valid insert with different position (should succeed)
  console.log('Test 3: Inserting same word at different position...\n');

  if (sampleWord) {
    // Find highest position for this verse
    const { data: maxPosData } = await supabase
      .from('words')
      .select('position')
      .eq('verse_id', sampleWord.verse_id)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const newPosition = (maxPosData?.position || 0) + 100; // Use a high position to avoid conflicts

    const { error: insertError } = await supabase
      .from('words')
      .insert({
        hebrew: sampleWord.hebrew,
        verse_id: sampleWord.verse_id,
        position: newPosition,
        meaning: 'TEST - different position',
        ipa: sampleWord.ipa,
        korean: sampleWord.korean,
        root: sampleWord.root,
        grammar: sampleWord.grammar
      });

    if (insertError) {
      console.log('   ❌ FAIL: Valid insert was rejected!');
      console.log(`   Error: ${insertError.message}\n`);
      allTestsPassed = false;
    } else {
      console.log('   ✅ PASS: Same word at different position inserted successfully');
      console.log(`   Position: ${newPosition}\n`);

      // Clean up
      await supabase
        .from('words')
        .delete()
        .eq('hebrew', sampleWord.hebrew)
        .eq('verse_id', sampleWord.verse_id)
        .eq('position', newPosition);
    }
  }

  console.log('=' .repeat(70) + '\n');

  // Test 4: Test valid insert with different verse (should succeed)
  console.log('Test 4: Inserting same word in different verse...\n');

  if (sampleWord) {
    // Get a different verse
    const { data: differentVerse } = await supabase
      .from('verses')
      .select('id')
      .neq('id', sampleWord.verse_id)
      .limit(1)
      .single();

    if (differentVerse) {
      const { error: insertError } = await supabase
        .from('words')
        .insert({
          hebrew: sampleWord.hebrew,
          verse_id: differentVerse.id,
          position: 0,
          meaning: 'TEST - different verse',
          ipa: sampleWord.ipa,
          korean: sampleWord.korean,
          root: sampleWord.root,
          grammar: sampleWord.grammar
        });

      if (insertError) {
        console.log('   ❌ FAIL: Valid insert was rejected!');
        console.log(`   Error: ${insertError.message}\n`);
        allTestsPassed = false;
      } else {
        console.log('   ✅ PASS: Same word in different verse inserted successfully');
        console.log(`   Verse: ${differentVerse.id}\n`);

        // Clean up
        await supabase
          .from('words')
          .delete()
          .eq('hebrew', sampleWord.hebrew)
          .eq('verse_id', differentVerse.id)
          .eq('position', 0);
      }
    }
  }

  console.log('=' .repeat(70) + '\n');

  // Final summary
  console.log('=' .repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(70) + '\n');

  if (allTestsPassed) {
    console.log('✅ All tests PASSED!');
    console.log('✅ UNIQUE constraint is working correctly.');
    console.log('✅ Database integrity verified.\n');
    console.log('=' .repeat(70));
    console.log('🎉 You can now safely use the words table with confidence!');
    console.log('=' .repeat(70) + '\n');
    return true;
  } else {
    console.log('❌ Some tests FAILED!');
    console.log('⚠️  Please review the errors above.');
    console.log('⚠️  The constraint may not be working as expected.\n');
    console.log('=' .repeat(70));
    console.log('🔧 Recommended actions:');
    console.log('   1. Check if constraint was actually added');
    console.log('   2. Review migration logs');
    console.log('   3. Run cleanup script if duplicates exist');
    console.log('=' .repeat(70) + '\n');
    return false;
  }
}

verifyConstraint()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
