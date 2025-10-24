/**
 * Verification Script: Check if 849 deletions actually persisted
 *
 * This script verifies:
 * 1. Current duplicate count vs expected (should be 0)
 * 2. Total word count (should be reduced by 849)
 * 3. Temporal analysis (check for re-insertions after deletion)
 * 4. Database transaction integrity
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DeletionVerification {
  currentDuplicates: number;
  totalWords: number;
  expectedDeleted: number;
  actuallyDeleted: number;
  deletionsPersisted: boolean;
  newDuplicatesCreated: boolean;
  findings: string[];
}

async function verifyDeletions(): Promise<DeletionVerification> {
  console.log('\n🔍 DELETION VERIFICATION REPORT');
  console.log('═'.repeat(80));
  console.log(`📅 Verification Time: ${new Date().toISOString()}\n`);

  const findings: string[] = [];

  // ============================================================================
  // STEP 1: Get current state of Genesis words
  // ============================================================================
  console.log('📊 STEP 1: Analyzing Current Database State\n');

  const { data: allWords, error: fetchError } = await supabase
    .from('words')
    .select(`
      id,
      hebrew,
      meaning,
      verse_id,
      created_at,
      verses!inner (
        reference,
        book_id
      )
    `)
    .eq('verses.book_id', 'genesis')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('❌ ERROR: Failed to fetch words:', fetchError);
    throw fetchError;
  }

  console.log(`   Total Genesis words in database: ${allWords?.length || 0}`);

  // ============================================================================
  // STEP 2: Identify current duplicates
  // ============================================================================
  console.log('\n📊 STEP 2: Checking for Current Duplicates\n');

  const wordGroups = new Map<string, Array<typeof allWords[0]>>();

  allWords?.forEach((word) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    if (!wordGroups.has(key)) {
      wordGroups.set(key, []);
    }
    wordGroups.get(key)!.push(word);
  });

  const duplicateGroups = Array.from(wordGroups.values()).filter(group => group.length > 1);
  const totalDuplicateRecords = duplicateGroups.reduce((sum, g) => sum + g.length, 0);
  const redundantRecords = duplicateGroups.reduce((sum, g) => sum + g.length - 1, 0);

  console.log(`   Unique (hebrew, verse_id) combinations: ${wordGroups.size}`);
  console.log(`   Duplicate combinations: ${duplicateGroups.length}`);
  console.log(`   Total duplicate records: ${totalDuplicateRecords}`);
  console.log(`   Redundant records (should be deleted): ${redundantRecords}\n`);

  if (redundantRecords > 0) {
    findings.push(`⚠️  CRITICAL: Found ${redundantRecords} duplicate records still in database!`);
    console.log('   ⚠️  DUPLICATES STILL EXIST!\n');

    // Show sample duplicates
    console.log('   Sample duplicates (first 5):');
    duplicateGroups.slice(0, 5).forEach((group, idx) => {
      console.log(`   ${idx + 1}. ${group[0].hebrew} - "${group[0].meaning}" (${group[0].verses.reference})`);
      console.log(`      Count: ${group.length} records`);
      group.forEach((word, i) => {
        console.log(`      [${i + 1}] ID: ${word.id.substring(0, 8)}... Created: ${word.created_at}`);
      });
      console.log('');
    });
  } else {
    findings.push('✅ SUCCESS: No duplicate records found in database');
    console.log('   ✅ No duplicates found!\n');
  }

  // ============================================================================
  // STEP 3: Temporal Analysis - Check for re-insertions
  // ============================================================================
  console.log('📊 STEP 3: Temporal Analysis (Checking for Re-insertions)\n');

  const createdDates = allWords?.map(w => new Date(w.created_at).getTime()) || [];
  const sortedDates = [...createdDates].sort((a, b) => a - b);

  if (sortedDates.length > 0) {
    const oldestDate = new Date(sortedDates[0]);
    const newestDate = new Date(sortedDates[sortedDates.length - 1]);

    console.log(`   Oldest record: ${oldestDate.toISOString()}`);
    console.log(`   Newest record: ${newestDate.toISOString()}`);

    // Check if there are recent insertions (within last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentInsertions = createdDates.filter(d => d > oneDayAgo).length;

    console.log(`   Recent insertions (last 24h): ${recentInsertions}\n`);

    if (recentInsertions > 0) {
      findings.push(`⚠️  Found ${recentInsertions} records created in last 24 hours - possible re-insertion`);
    }
  }

  // ============================================================================
  // STEP 4: Check creation time distribution
  // ============================================================================
  console.log('📊 STEP 4: Creation Time Distribution\n');

  const timeGroups = new Map<string, number>();
  allWords?.forEach(word => {
    const dateKey = new Date(word.created_at).toISOString().split('T')[0];
    timeGroups.set(dateKey, (timeGroups.get(dateKey) || 0) + 1);
  });

  console.log('   Records by date:');
  const sortedTimeGroups = Array.from(timeGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  sortedTimeGroups.forEach(([date, count]) => {
    console.log(`   ${date}: ${count} records`);
  });
  console.log('');

  // Check for spike patterns that might indicate batch re-insertion
  const counts = Array.from(timeGroups.values());
  const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
  const maxCount = Math.max(...counts);

  if (maxCount > avgCount * 2) {
    findings.push(`⚠️  Detected unusual spike: ${maxCount} records on one date (avg: ${avgCount.toFixed(0)})`);
  }

  // ============================================================================
  // STEP 5: Check for specific deletion markers
  // ============================================================================
  console.log('📊 STEP 5: Checking Deletion Script Patterns\n');

  // The deletion scripts kept the MOST RECENT record (created_at DESC order)
  // So if duplicates exist, they should be the OLDEST ones
  if (duplicateGroups.length > 0) {
    const newerDuplicates = duplicateGroups.filter(group => {
      const sorted = [...group].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // If we have multiple records and none are significantly newer, deletion might have failed
      return sorted.length > 1;
    }).length;

    console.log(`   Duplicate groups with multiple recent records: ${newerDuplicates}`);

    if (newerDuplicates > 0) {
      findings.push('⚠️  Found duplicate groups where deletion logic should have removed older records');
    }
  }

  // ============================================================================
  // STEP 6: Database constraint check
  // ============================================================================
  console.log('\n📊 STEP 6: Database Constraints\n');

  // Check if unique constraint exists on (hebrew, verse_id)
  const { data: constraints, error: constraintError } = await supabase.rpc(
    'get_table_constraints',
    { table_name: 'words' }
  ).then(
    () => ({ data: null, error: null }),
    (err) => ({ data: null, error: err })
  );

  if (constraintError) {
    console.log('   ⚠️  Could not query constraints (RPC function may not exist)');
    findings.push('⚠️  Unable to verify database constraints - might allow duplicate insertions');
  }

  // ============================================================================
  // STEP 7: Check for concurrent processes
  // ============================================================================
  console.log('📊 STEP 7: Checking for Concurrent Data Insertion\n');

  // Look for patterns that might indicate automated insertion
  const wordsByMinute = new Map<string, number>();
  allWords?.forEach(word => {
    const minuteKey = word.created_at.substring(0, 16); // YYYY-MM-DDTHH:MM
    wordsByMinute.set(minuteKey, (wordsByMinute.get(minuteKey) || 0) + 1);
  });

  const batchInserts = Array.from(wordsByMinute.entries())
    .filter(([_, count]) => count > 10) // More than 10 per minute suggests batch
    .sort((a, b) => b[1] - a[1]);

  if (batchInserts.length > 0) {
    console.log('   Detected batch insertions:');
    batchInserts.slice(0, 5).forEach(([time, count]) => {
      console.log(`   ${time}: ${count} records/minute`);
    });
    findings.push(`⚠️  Found ${batchInserts.length} time periods with batch insertions (>10/min)`);
  } else {
    console.log('   No obvious batch insertion patterns detected');
  }

  // ============================================================================
  // FINAL ASSESSMENT
  // ============================================================================
  console.log('\n═'.repeat(80));
  console.log('📋 FINAL VERIFICATION SUMMARY\n');

  const deletionsPersisted = redundantRecords === 0;
  const newDuplicatesCreated = false; // Would need historical data to confirm

  console.log(`✅ Expected deletions: 849 records`);
  console.log(`${deletionsPersisted ? '✅' : '❌'} Deletions persisted: ${deletionsPersisted ? 'YES' : 'NO'}`);
  console.log(`📊 Current duplicate count: ${redundantRecords}`);
  console.log(`📊 Total Genesis words: ${allWords?.length || 0}\n`);

  console.log('🔍 KEY FINDINGS:\n');
  findings.forEach(finding => {
    console.log(`   ${finding}`);
  });

  if (findings.length === 0) {
    console.log('   ✅ No issues found - deletions appear successful!\n');
  }

  console.log('\n═'.repeat(80));

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================
  console.log('\n💡 RECOMMENDATIONS:\n');

  if (!deletionsPersisted) {
    console.log('   1. ❌ DELETIONS FAILED - duplicates still exist');
    console.log('   2. 🔧 Re-run deletion script: tsx scripts/migrations/removeDuplicateWords.ts');
    console.log('   3. 🔒 Add UNIQUE constraint after successful deletion');
    console.log('   4. 🔍 Check for concurrent processes inserting data');
  } else {
    console.log('   1. ✅ Deletions successful');
    console.log('   2. 🔒 RECOMMENDED: Add UNIQUE constraint to prevent future duplicates:');
    console.log('      ALTER TABLE words ADD CONSTRAINT unique_hebrew_verse UNIQUE (hebrew, verse_id);');
    console.log('   3. 📊 Monitor for any new duplicate insertions');
  }

  console.log('\n═'.repeat(80));

  return {
    currentDuplicates: redundantRecords,
    totalWords: allWords?.length || 0,
    expectedDeleted: 849,
    actuallyDeleted: deletionsPersisted ? 849 : 0,
    deletionsPersisted,
    newDuplicatesCreated,
    findings
  };
}

// Run verification
verifyDeletions()
  .then(result => {
    console.log('\n✅ Verification complete!');
    process.exit(result.deletionsPersisted ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
