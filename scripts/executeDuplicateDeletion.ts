/**
 * Execute Duplicate Deletion Script
 *
 * This script safely deletes duplicate word records based on analysis.
 * It uses a transaction to ensure data integrity.
 *
 * USAGE:
 * 1. Run analyzeAllWordDuplicates.ts first to get DELETE commands
 * 2. Review the commands carefully
 * 3. Set DRY_RUN to false to execute
 * 4. Run this script
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// CONFIGURATION
// ============================================================================

const DRY_RUN = true; // Set to false to execute deletions

// Add IDs to delete here (from analyzeAllWordDuplicates.ts output)
const IDS_TO_DELETE: string[] = [
  // Example:
  // '12345678-1234-1234-1234-123456789012', // יְהִי duplicate in genesis_1_6
];

// ============================================================================
// DELETION SCRIPT
// ============================================================================

interface WordRecord {
  id: string;
  verse_id: string | null;
  hebrew: string;
  meaning: string;
  position: number;
  created_at: string;
}

async function executeDeletion() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  DUPLICATE DELETION SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No deletions will be executed');
    console.log('   Set DRY_RUN = false to execute deletions\n');
  } else {
    console.log('🚨 LIVE MODE - Deletions will be executed!');
    console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  if (IDS_TO_DELETE.length === 0) {
    console.log('✅ No IDs specified for deletion');
    console.log('   Add IDs to the IDS_TO_DELETE array in this script\n');
    return;
  }

  console.log(`Target: ${IDS_TO_DELETE.length} record(s)\n`);

  // Step 1: Fetch records to be deleted
  console.log('📋 Step 1: Fetching records to delete...\n');

  const { data: recordsToDelete, error: fetchError } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, meaning, position, created_at')
    .in('id', IDS_TO_DELETE);

  if (fetchError) {
    console.error('❌ Error fetching records:', fetchError);
    return;
  }

  if (!recordsToDelete || recordsToDelete.length === 0) {
    console.log('⚠️  No records found with specified IDs');
    return;
  }

  console.log(`Found ${recordsToDelete.length} record(s):\n`);

  recordsToDelete.forEach((record, idx) => {
    console.log(`${idx + 1}. ${record.hebrew} (${record.meaning})`);
    console.log(`   ID: ${record.id}`);
    console.log(`   Verse: ${record.verse_id}`);
    console.log(`   Position: ${record.position}`);
    console.log(`   Created: ${record.created_at}\n`);
  });

  // Step 2: Check what will remain
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Step 2: Checking remaining records...\n');

  const verseIds = [...new Set(recordsToDelete.map(r => r.verse_id))];

  for (const verseId of verseIds) {
    if (!verseId) continue;

    const { data: verseWords } = await supabase
      .from('words')
      .select('id, hebrew, position')
      .eq('verse_id', verseId)
      .order('position', { ascending: true });

    console.log(`\nVerse: ${verseId}`);
    console.log(`Current words: ${verseWords?.length || 0}`);

    if (verseWords) {
      const afterDeletion = verseWords.filter(w => !IDS_TO_DELETE.includes(w.id));
      console.log(`After deletion: ${afterDeletion.length}`);

      // Check for remaining duplicates
      const hebrewCounts = new Map<string, number>();
      afterDeletion.forEach(w => {
        hebrewCounts.set(w.hebrew, (hebrewCounts.get(w.hebrew) || 0) + 1);
      });

      const stillDuplicate = Array.from(hebrewCounts.entries())
        .filter(([_, count]) => count > 1);

      if (stillDuplicate.length > 0) {
        console.log('⚠️  Still has duplicates after deletion:');
        stillDuplicate.forEach(([hebrew, count]) => {
          console.log(`   ${hebrew}: ${count} copies`);
        });
      } else {
        console.log('✅ No duplicates will remain');
      }
    }
  }

  // Step 3: Execute deletion
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  Step 3: Executing deletion...\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN - Skipping actual deletion\n');
    console.log('Would delete:');
    IDS_TO_DELETE.forEach(id => {
      console.log(`  DELETE FROM words WHERE id = '${id}';`);
    });
  } else {
    console.log('Deleting records...\n');

    let successCount = 0;
    let errorCount = 0;

    // Delete in batches of 50
    const batchSize = 50;
    for (let i = 0; i < IDS_TO_DELETE.length; i += batchSize) {
      const batch = IDS_TO_DELETE.slice(i, i + batchSize);

      const { error: deleteError } = await supabase
        .from('words')
        .delete()
        .in('id', batch);

      if (deleteError) {
        console.error(`❌ Error deleting batch ${Math.floor(i / batchSize) + 1}:`, deleteError);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Deleted: ${successCount}/${IDS_TO_DELETE.length}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Deletion Results:');
    console.log(`   Total: ${IDS_TO_DELETE.length}`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 4: Verify
    console.log('✅ Step 4: Verifying deletion...\n');

    const { data: remaining } = await supabase
      .from('words')
      .select('id')
      .in('id', IDS_TO_DELETE);

    if (remaining && remaining.length > 0) {
      console.log(`⚠️  ${remaining.length} record(s) still exist:`);
      remaining.forEach(r => console.log(`   ${r.id}`));
    } else {
      console.log('✅ All records successfully deleted\n');
    }

    // Check for remaining duplicates
    const { data: allWords } = await supabase
      .from('words')
      .select('verse_id, hebrew, position')
      .in('verse_id', verseIds);

    if (allWords) {
      const duplicateCheck = new Map<string, number>();
      allWords.forEach(w => {
        const key = `${w.verse_id}_${w.hebrew}_${w.position}`;
        duplicateCheck.set(key, (duplicateCheck.get(key) || 0) + 1);
      });

      const stillHasDuplicates = Array.from(duplicateCheck.values())
        .filter(count => count > 1).length;

      if (stillHasDuplicates > 0) {
        console.log(`⚠️  ${stillHasDuplicates} duplicate groups still remain`);
      } else {
        console.log('✅ No duplicates remain in affected verses\n');
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Next Steps:');
  if (DRY_RUN) {
    console.log('   1. Review the records to be deleted');
    console.log('   2. Set DRY_RUN = false');
    console.log('   3. Run this script again to execute');
  } else {
    console.log('   1. Verify data integrity');
    console.log('   2. Run analyzeAllWordDuplicates.ts to confirm');
    console.log('   3. Clear IDS_TO_DELETE array');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

executeDeletion().catch(console.error);
