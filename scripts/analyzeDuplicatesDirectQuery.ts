import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface WordRecord {
  id: number;
  hebrew: string;
  verse_id: string;
  created_at: string;
}

async function analyzeWordDuplicates() {
  console.log('=== DIRECT QUERY ANALYSIS - NO JOINS ===\n');

  // 1. Get total words count
  console.log('1. Querying total words count...');
  const { count: totalCount, error: countError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting total words:', countError);
    return;
  }

  console.log(`   Total words in table: ${totalCount}\n`);

  // 2. Get all words - fetch in batches to handle large dataset
  console.log('2. Fetching all words (no verse filter)...');

  let allWords: WordRecord[] = [];
  let hasMore = true;
  let page = 0;
  const pageSize = 1000;

  while (hasMore) {
    const { data: batch, error: fetchError } = await supabase
      .from('words')
      .select('id, hebrew, verse_id, created_at')
      .order('id', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (fetchError) {
      console.error('Error fetching words:', fetchError);
      return;
    }

    if (batch && batch.length > 0) {
      allWords = allWords.concat(batch);
      page++;
      process.stdout.write(`\r   Fetched ${allWords.length} words...`);

      if (batch.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`\n   Total words fetched: ${allWords.length}\n`);

  // 3. Analyze duplicates
  console.log('3. Analyzing duplicates...');

  // Create a map to track (hebrew, verse_id) combinations
  const combinationMap = new Map<string, WordRecord[]>();

  allWords.forEach(word => {
    const key = `${word.verse_id}::${word.hebrew}`;
    if (!combinationMap.has(key)) {
      combinationMap.set(key, []);
    }
    combinationMap.get(key)!.push(word);
  });

  // Count unique combinations
  const uniqueCombinations = combinationMap.size;
  console.log(`   Total unique (hebrew, verse_id) combinations: ${uniqueCombinations}`);
  console.log(`   Total records: ${allWords.length}`);
  console.log(`   Duplicate records to delete: ${allWords.length - uniqueCombinations}\n`);

  // 4. Find all duplicates
  console.log('4. Listing all duplicate combinations...');
  const duplicates = Array.from(combinationMap.entries())
    .filter(([_, records]) => records.length > 1)
    .sort((a, b) => b[1].length - a[1].length); // Sort by count descending

  console.log(`   Found ${duplicates.length} duplicate combinations\n`);

  if (duplicates.length > 0) {
    console.log('   All duplicates with full details:');
    duplicates.forEach(([key, records]) => {
      const [verse_id, hebrew] = key.split('::');
      console.log(`\n   ${verse_id} | ${hebrew} | Count: ${records.length}`);
      records.forEach(r => {
        console.log(`     - ID: ${r.id}, Created: ${r.created_at}`);
      });
    });
    console.log('');
  }

  // 5. Analyze Genesis 1:6 specifically
  console.log('5. Analyzing Genesis 1:6 specifically...');
  const genesis16Words = allWords.filter(w => w.verse_id === 'genesis_1_6');

  console.log(`   Total Genesis 1:6 words: ${genesis16Words.length}`);

  const gen16Map = new Map<string, WordRecord[]>();
  genesis16Words.forEach(word => {
    const key = word.hebrew;
    if (!gen16Map.has(key)) {
      gen16Map.set(key, []);
    }
    gen16Map.get(key)!.push(word);
  });

  const gen16Unique = gen16Map.size;
  console.log(`   Unique Hebrew words in Genesis 1:6: ${gen16Unique}`);
  console.log(`   Duplicate records in Genesis 1:6: ${genesis16Words.length - gen16Unique}\n`);

  const gen16Duplicates = Array.from(gen16Map.entries())
    .filter(([_, records]) => records.length > 1);

  if (gen16Duplicates.length > 0) {
    console.log(`   Genesis 1:6 duplicates found: ${gen16Duplicates.length} Hebrew words`);
    console.log('');
    gen16Duplicates.forEach(([hebrew, records]) => {
      console.log(`   Hebrew: ${hebrew}`);
      console.log(`   Count: ${records.length}`);
      console.log('   Records:');
      records.forEach(r => {
        console.log(`     - ID: ${r.id}, Created: ${r.created_at}`);
      });
      console.log('');
    });
  }

  // 6. Identify IDs to delete for Genesis 1:6
  console.log('6. Identifying IDs to DELETE for Genesis 1:6...');
  console.log('   (Strategy: Keep NEWEST by created_at, or LARGEST by id if same timestamp)\n');

  const idsToDelete: number[] = [];

  gen16Duplicates.forEach(([hebrew, records]) => {
    // Sort by created_at desc, then by id desc
    const sorted = records.sort((a, b) => {
      const dateCompare = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });

    // Keep the first one (newest/largest), delete the rest
    const toKeep = sorted[0];
    const toDelete = sorted.slice(1);

    console.log(`   Hebrew: ${hebrew}`);
    console.log(`   KEEP: ID ${toKeep.id} (created: ${toKeep.created_at})`);
    toDelete.forEach(r => {
      console.log(`   DELETE: ID ${r.id} (created: ${r.created_at})`);
      idsToDelete.push(r.id);
    });
    console.log('');
  });

  // 7. Verify these IDs exist
  console.log('7. Verifying IDs to delete exist...');
  if (idsToDelete.length > 0) {
    console.log(`   IDs to delete: [${idsToDelete.join(', ')}]\n`);

    const { data: verifyRecords, error: verifyError } = await supabase
      .from('words')
      .select('id, hebrew, verse_id')
      .in('id', idsToDelete);

    if (verifyError) {
      console.error('   Error verifying IDs:', verifyError);
    } else if (verifyRecords) {
      console.log(`   Verified ${verifyRecords.length} records exist:`);
      verifyRecords.forEach(r => {
        console.log(`   - ID ${r.id}: ${r.verse_id} | ${r.hebrew}`);
      });
    }
  } else {
    console.log('   No IDs to delete for Genesis 1:6');
  }

  // 8. Calculate ALL IDs to delete across entire dataset
  console.log('\n8. Identifying ALL duplicate IDs to DELETE...');
  console.log('   (Strategy: Keep NEWEST by created_at, or LARGEST by id if same timestamp)\n');

  const allIdsToDelete: number[] = [];

  duplicates.forEach(([key, records]) => {
    const [verse_id, hebrew] = key.split('::');
    // Sort by created_at desc, then by id desc
    const sorted = records.sort((a, b) => {
      const dateCompare = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });

    // Keep the first one (newest/largest), delete the rest
    const toKeep = sorted[0];
    const toDelete = sorted.slice(1);

    console.log(`   ${verse_id} | ${hebrew}`);
    console.log(`   KEEP: ID ${toKeep.id} (created: ${toKeep.created_at})`);
    toDelete.forEach(r => {
      console.log(`   DELETE: ID ${r.id} (created: ${r.created_at})`);
      allIdsToDelete.push(r.id);
    });
    console.log('');
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Total words in database: ${totalCount}`);
  console.log(`Total words analyzed: ${allWords.length}`);
  console.log(`Unique (hebrew, verse_id) combinations: ${uniqueCombinations}`);
  console.log(`Total duplicate records: ${allWords.length - uniqueCombinations}`);
  console.log(`Duplicate combinations: ${duplicates.length}`);
  console.log(`\nAll IDs to DELETE: ${allIdsToDelete.length}`);
  if (allIdsToDelete.length > 0) {
    console.log(`IDs: [${allIdsToDelete.join(', ')}]`);
  }
  console.log(`\nGenesis 1:6 specific:`);
  console.log(`  Total records: ${genesis16Words.length}`);
  console.log(`  Unique Hebrew words: ${gen16Unique}`);
  console.log(`  Duplicate records: ${genesis16Words.length - gen16Unique}`);
  console.log(`  IDs to delete: ${idsToDelete.length}`);
  if (idsToDelete.length > 0) {
    console.log(`  IDs: [${idsToDelete.join(', ')}]`);
  }
}

analyzeWordDuplicates().catch(console.error);
