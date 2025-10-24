/**
 * DIRECT DUPLICATE QUERY
 *
 * Simplest possible query to find duplicates - no fancy logic
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

console.log('Using URL:', supabaseUrl);
console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('\n======================================================================');
  console.log('🔍 DIRECT DUPLICATE QUERY - SIMPLEST APPROACH');
  console.log('======================================================================\n');

  // Method 1: Fetch ALL words with NO filters
  console.log('METHOD 1: Fetching all words...');
  const { data: allWords, error: error1 } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at');

  if (error1) {
    console.error('❌ Error:', error1);
    return;
  }

  console.log(`Total words fetched: ${allWords?.length || 0}`);

  // Group by (hebrew + verse_id)
  const groups = new Map<string, any[]>();
  allWords?.forEach(w => {
    const key = `${w.hebrew}::${w.verse_id}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(w);
  });

  const duplicates = Array.from(groups.entries())
    .filter(([_, list]) => list.length > 1);

  console.log(`Unique (hebrew, verse_id) combinations: ${groups.size}`);
  console.log(`Duplicate combinations: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('\n📋 FIRST 5 DUPLICATES:');
    console.log('----------------------------------------------------------------------');
    duplicates.slice(0, 5).forEach(([key, list]) => {
      const [hebrew, verseId] = key.split('::');
      console.log(`\n"${hebrew}" in ${verseId} - ${list.length} copies:`);
      list.forEach((w, i) => {
        console.log(`  ${i + 1}) ID: ${w.id} | pos: ${w.position} | created: ${w.created_at}`);
      });
    });

    console.log('\n----------------------------------------------------------------------');
    console.log(`Total extra duplicate records: ${duplicates.reduce((sum, [_, list]) => sum + (list.length - 1), 0)}`);
  } else {
    console.log('\n✅ NO DUPLICATES FOUND');
  }

  console.log('\n======================================================================');
  console.log('METHOD 2: Using ORDER BY created_at');
  console.log('======================================================================\n');

  const { data: orderedWords, error: error2 } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at')
    .order('created_at', { ascending: true });

  if (error2) {
    console.error('❌ Error:', error2);
    return;
  }

  console.log(`Total words fetched: ${orderedWords?.length || 0}`);

  // Group again
  const groups2 = new Map<string, any[]>();
  orderedWords?.forEach(w => {
    const key = `${w.hebrew}::${w.verse_id}`;
    if (!groups2.has(key)) {
      groups2.set(key, []);
    }
    groups2.get(key)!.push(w);
  });

  const duplicates2 = Array.from(groups2.entries())
    .filter(([_, list]) => list.length > 1);

  console.log(`Unique (hebrew, verse_id) combinations: ${groups2.size}`);
  console.log(`Duplicate combinations: ${duplicates2.length}`);

  if (duplicates2.length > 0 && duplicates2.length !== duplicates.length) {
    console.log(`\n⚠️  DISCREPANCY: ORDER BY affected results!`);
    console.log(`   Without ORDER BY: ${duplicates.length} duplicates`);
    console.log(`   With ORDER BY: ${duplicates2.length} duplicates`);
  }

  console.log('\n======================================================================');
  console.log('METHOD 3: Check specific known duplicate');
  console.log('======================================================================\n');

  // From the debugVerificationLogic output, we know "הוּא" in genesis_2_11 has 3 copies
  const { data: specificWord, error: error3 } = await supabase
    .from('words')
    .select('*')
    .eq('hebrew', 'הוּא')
    .eq('verse_id', 'genesis_2_11');

  if (error3) {
    console.error('❌ Error:', error3);
  } else {
    console.log(`Checking "הוּא" in genesis_2_11:`);
    console.log(`Found ${specificWord?.length || 0} records`);
    if (specificWord && specificWord.length > 1) {
      console.log('\n📋 ALL COPIES:');
      specificWord.forEach((w, i) => {
        console.log(`  ${i + 1}) ID: ${w.id} | pos: ${w.position} | created: ${w.created_at}`);
      });
    }
  }

  console.log('\n======================================================================');
}

main().catch(console.error);
