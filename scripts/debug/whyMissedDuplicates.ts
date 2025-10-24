/**
 * WHY MISSED DUPLICATES?
 *
 * Investigate why the duplicate removal script missed Genesis 3:15 duplicates
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
  console.log('🔍 WHY DID WE MISS THE DUPLICATES?');
  console.log('======================================================================\n');

  // Fetch ALL words, exactly as directDuplicateQuery.ts does
  console.log('METHOD 1: Fetch all words (no order)');
  const { data: allWords1, error: error1 } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at');

  console.log(`Total words fetched: ${allWords1?.length || 0}`);

  // Group by (hebrew + verse_id)
  const groups1 = new Map<string, any[]>();
  allWords1?.forEach(w => {
    const key = `${w.hebrew}::${w.verse_id}`;
    if (!groups1.has(key)) {
      groups1.set(key, []);
    }
    groups1.get(key)!.push(w);
  });

  const duplicates1 = Array.from(groups1.entries())
    .filter(([_, list]) => list.length > 1);

  console.log(`Unique combinations: ${groups1.size}`);
  console.log(`Duplicate combinations: ${duplicates1.length}\n`);

  // Check if Genesis 3:15 duplicates are in the list
  const gen315Duplicates = duplicates1.filter(([key]) => key.includes('genesis_3_15'));
  console.log(`Genesis 3:15 duplicates found: ${gen315Duplicates.length}`);

  if (gen315Duplicates.length > 0) {
    console.log('\n📋 Genesis 3:15 duplicates in the list:');
    gen315Duplicates.forEach(([key, list]) => {
      console.log(`   ${key}: ${list.length} copies`);
    });
  } else {
    console.log('⚠️  NO Genesis 3:15 duplicates in the list!');
  }

  console.log('\n======================================================================');
  console.log('HYPOTHESIS: Maybe the fetch is incomplete?');
  console.log('======================================================================\n');

  // Try with explicit range to get ALL records
  console.log('METHOD 2: Fetch with explicit range (0-10000)');
  const { data: allWords2, error: error2, count } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at', { count: 'exact' })
    .range(0, 10000);

  console.log(`Total words in DB (count): ${count}`);
  console.log(`Total words fetched: ${allWords2?.length || 0}`);

  const groups2 = new Map<string, any[]>();
  allWords2?.forEach(w => {
    const key = `${w.hebrew}::${w.verse_id}`;
    if (!groups2.has(key)) {
      groups2.set(key, []);
    }
    groups2.get(key)!.push(w);
  });

  const duplicates2 = Array.from(groups2.entries())
    .filter(([_, list]) => list.length > 1);

  console.log(`Unique combinations: ${groups2.size}`);
  console.log(`Duplicate combinations: ${duplicates2.length}\n`);

  const gen315Duplicates2 = duplicates2.filter(([key]) => key.includes('genesis_3_15'));
  console.log(`Genesis 3:15 duplicates found: ${gen315Duplicates2.length}`);

  if (gen315Duplicates2.length > 0) {
    console.log('\n📋 Genesis 3:15 duplicates:');
    gen315Duplicates2.forEach(([key, list]) => {
      const [hebrew, verseId] = key.split('::');
      console.log(`\n   "${hebrew}": ${list.length} copies`);
      list.forEach((w, i) => {
        console.log(`      ${i + 1}) ${w.id.substring(0, 8)}... pos:${w.position} created:${w.created_at}`);
      });
    });
  }

  console.log('\n======================================================================');
  console.log('HYPOTHESIS: Pagination limit?');
  console.log('======================================================================\n');

  // Check if there's a hard limit
  const { data: test1000, error: e1 } = await supabase
    .from('words')
    .select('id', { count: 'exact' })
    .limit(10000);

  console.log(`Query with limit(10000): ${test1000?.length} records`);

  const { data: testNoLimit, error: e2 } = await supabase
    .from('words')
    .select('id', { count: 'exact' });

  console.log(`Query with NO limit: ${testNoLimit?.length} records`);

  console.log('\n💡 CONCLUSION:');
  if (testNoLimit && testNoLimit.length === 1000) {
    console.log('❌ Supabase has a hard 1000-record limit on queries!');
    console.log('   This is why some duplicates are being missed.');
  } else {
    console.log(`✅ No hard limit found - fetched ${testNoLimit?.length} records`);
  }

  console.log('\n======================================================================');
}

main().catch(console.error);
