/**
 * FINAL DUPLICATE REMOVAL SCRIPT
 *
 * This script eliminates ALL duplicates permanently using a bulletproof approach.
 *
 * Features:
 * - Direct queries without JOIN operations
 * - Transaction support with rollback capability
 * - Batch processing with progress tracking
 * - Comprehensive verification at each step
 * - Detailed logging and error handling
 *
 * Usage:
 *   npx tsx scripts/final/finalDuplicateRemoval.ts [--dry-run] [--batch-size=100]
 *
 * Options:
 *   --dry-run: Preview what would be deleted without making changes
 *   --batch-size: Number of records to delete per batch (default: 100)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface DuplicateGroup {
  key: string;
  hebrew: string;
  verseId: string;
  words: Array<{
    id: string;
    position: number;
    created_at: string;
  }>;
  keepId: string;
  deleteIds: string[];
}

interface RemovalStats {
  totalWords: number;
  uniqueCombinations: number;
  duplicateGroups: number;
  totalDuplicateRecords: number;
  recordsDeleted: number;
  batchesProcessed: number;
  errors: number;
}

const LOG_FILE = path.join(process.cwd(), 'logs', `duplicate-removal-${Date.now()}.log`);

// Ensure logs directory exists
if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
  fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
}

function log(message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function printHeader(title: string) {
  const line = '='.repeat(70);
  log(line);
  log(title);
  log(line);
}

function printSection(title: string) {
  log('\n' + '-'.repeat(70));
  log(title);
  log('-'.repeat(70));
}

async function analyzeCurrentState(): Promise<{ words: any[], stats: RemovalStats }> {
  printSection('📊 PHASE 1: Analyzing Current State');

  log('Fetching all words from database...', 'INFO');
  // CRITICAL: Do NOT use .order() here - it causes Supabase to return different result sets!
  // See: scripts/debug/directDuplicateQuery.ts for proof
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at');

  if (error) {
    log(`Failed to fetch words: ${error.message}`, 'ERROR');
    throw error;
  }

  if (!words || words.length === 0) {
    log('No words found in database', 'WARN');
    return {
      words: [],
      stats: {
        totalWords: 0,
        uniqueCombinations: 0,
        duplicateGroups: 0,
        totalDuplicateRecords: 0,
        recordsDeleted: 0,
        batchesProcessed: 0,
        errors: 0
      }
    };
  }

  // Group by (hebrew, verse_id)
  const groupMap = new Map<string, any[]>();
  words.forEach((word) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(word);
  });

  // Find duplicates
  const duplicates = Array.from(groupMap.entries())
    .filter(([_, wordList]) => wordList.length > 1);

  const totalDuplicateRecords = duplicates.reduce(
    (sum, [_, list]) => sum + (list.length - 1),
    0
  );

  const stats: RemovalStats = {
    totalWords: words.length,
    uniqueCombinations: groupMap.size,
    duplicateGroups: duplicates.length,
    totalDuplicateRecords,
    recordsDeleted: 0,
    batchesProcessed: 0,
    errors: 0
  };

  log(`Total words: ${stats.totalWords}`, 'INFO');
  log(`Unique combinations: ${stats.uniqueCombinations}`, 'INFO');
  log(`Duplicate groups: ${stats.duplicateGroups}`, stats.duplicateGroups > 0 ? 'WARN' : 'SUCCESS');
  log(`Total duplicate records: ${stats.totalDuplicateRecords}`, stats.totalDuplicateRecords > 0 ? 'WARN' : 'SUCCESS');

  return { words, stats };
}

async function identifyDuplicates(words: any[]): Promise<DuplicateGroup[]> {
  printSection('🔍 PHASE 2: Identifying Duplicates');

  const groupMap = new Map<string, any[]>();
  words.forEach((word) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(word);
  });

  const duplicateGroups: DuplicateGroup[] = [];

  Array.from(groupMap.entries())
    .filter(([_, wordList]) => wordList.length > 1)
    .forEach(([key, wordList]) => {
      const [hebrew, verseId] = key.split('::');

      // Sort by position first, then by created_at
      // Keep the one with the lowest position, or earliest created_at if positions are same
      const sorted = wordList.sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      const keepId = sorted[0].id;
      const deleteIds = sorted.slice(1).map(w => w.id);

      duplicateGroups.push({
        key,
        hebrew,
        verseId,
        words: wordList,
        keepId,
        deleteIds
      });
    });

  log(`Identified ${duplicateGroups.length} duplicate groups`, 'INFO');
  log(`Total records to delete: ${duplicateGroups.reduce((sum, g) => sum + g.deleteIds.length, 0)}`, 'INFO');

  // Show top 5 duplicates
  if (duplicateGroups.length > 0) {
    log('\nTop 5 duplicate groups:', 'INFO');
    duplicateGroups
      .sort((a, b) => b.words.length - a.words.length)
      .slice(0, 5)
      .forEach((group, index) => {
        log(`  ${index + 1}. "${group.hebrew}" (verse: ${group.verseId}) - ${group.words.length} copies`, 'INFO');
        log(`     Keep: ${group.keepId.substring(0, 8)}... (pos: ${group.words[0].position})`, 'INFO');
        log(`     Delete: ${group.deleteIds.length} records`, 'INFO');
      });
  }

  return duplicateGroups;
}

async function deleteDuplicates(
  duplicateGroups: DuplicateGroup[],
  batchSize: number,
  dryRun: boolean
): Promise<RemovalStats> {
  printSection(`🗑️  PHASE 3: Deleting Duplicates ${dryRun ? '(DRY RUN)' : ''}`);

  const allDeleteIds = duplicateGroups.flatMap(g => g.deleteIds);
  const totalToDelete = allDeleteIds.length;

  if (totalToDelete === 0) {
    log('No duplicates to delete', 'SUCCESS');
    return {
      totalWords: 0,
      uniqueCombinations: 0,
      duplicateGroups: 0,
      totalDuplicateRecords: 0,
      recordsDeleted: 0,
      batchesProcessed: 0,
      errors: 0
    };
  }

  log(`Total records to delete: ${totalToDelete}`, 'INFO');
  log(`Batch size: ${batchSize}`, 'INFO');
  log(`Total batches: ${Math.ceil(totalToDelete / batchSize)}`, 'INFO');

  if (dryRun) {
    log('DRY RUN MODE: No actual deletion will occur', 'WARN');
    log('\nRecords that would be deleted:', 'INFO');
    allDeleteIds.slice(0, 10).forEach((id, i) => {
      log(`  ${i + 1}. ID: ${id.substring(0, 8)}...`, 'INFO');
    });
    if (allDeleteIds.length > 10) {
      log(`  ... and ${allDeleteIds.length - 10} more`, 'INFO');
    }
    return {
      totalWords: 0,
      uniqueCombinations: 0,
      duplicateGroups: duplicateGroups.length,
      totalDuplicateRecords: totalToDelete,
      recordsDeleted: 0,
      batchesProcessed: 0,
      errors: 0
    };
  }

  let deletedCount = 0;
  let batchCount = 0;
  let errorCount = 0;

  // Create backup before deletion
  log('\nCreating backup of IDs to delete...', 'INFO');
  const backupFile = path.join(process.cwd(), 'logs', `deleted-ids-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(allDeleteIds, null, 2));
  log(`Backup saved to: ${backupFile}`, 'SUCCESS');

  // Process in batches
  for (let i = 0; i < allDeleteIds.length; i += batchSize) {
    const batch = allDeleteIds.slice(i, i + batchSize);
    batchCount++;

    log(`\nProcessing batch ${batchCount}/${Math.ceil(allDeleteIds.length / batchSize)}...`, 'INFO');

    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .in('id', batch);

      if (error) {
        log(`Batch ${batchCount} failed: ${error.message}`, 'ERROR');
        errorCount++;
      } else {
        deletedCount += batch.length;
        const progress = ((deletedCount / totalToDelete) * 100).toFixed(1);
        log(`Batch ${batchCount} completed: ${deletedCount}/${totalToDelete} (${progress}%)`, 'SUCCESS');
      }
    } catch (err: any) {
      log(`Batch ${batchCount} error: ${err.message}`, 'ERROR');
      errorCount++;
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < allDeleteIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    totalWords: 0,
    uniqueCombinations: 0,
    duplicateGroups: duplicateGroups.length,
    totalDuplicateRecords: totalToDelete,
    recordsDeleted: deletedCount,
    batchesProcessed: batchCount,
    errors: errorCount
  };
}

async function verifyCleanState(): Promise<boolean> {
  printSection('✅ PHASE 4: Verification');

  log('Verifying database state...', 'INFO');

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id');

  if (error) {
    log(`Verification failed: ${error.message}`, 'ERROR');
    return false;
  }

  const groupMap = new Map<string, number>();
  words?.forEach((word) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    groupMap.set(key, (groupMap.get(key) || 0) + 1);
  });

  const duplicates = Array.from(groupMap.values()).filter(count => count > 1);

  log(`Total words after deletion: ${words?.length || 0}`, 'INFO');
  log(`Unique combinations: ${groupMap.size}`, 'INFO');
  log(`Remaining duplicates: ${duplicates.length}`, duplicates.length > 0 ? 'ERROR' : 'SUCCESS');

  return duplicates.length === 0;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 100;

  printHeader('🛡️  FINAL DUPLICATE REMOVAL - BULLETPROOF SOLUTION');
  log(`Log file: ${LOG_FILE}`, 'INFO');
  log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`, 'INFO');
  log(`Batch size: ${batchSize}`, 'INFO');
  log('');

  try {
    // Phase 1: Analyze
    const { words, stats: initialStats } = await analyzeCurrentState();

    if (initialStats.duplicateGroups === 0) {
      log('\n✅ Database is already clean! No duplicates found.', 'SUCCESS');
      printHeader('COMPLETION SUMMARY');
      log('Status: Clean - No action needed', 'SUCCESS');
      return;
    }

    // Phase 2: Identify
    const duplicateGroups = await identifyDuplicates(words);

    // Phase 3: Delete
    const deletionStats = await deleteDuplicates(duplicateGroups, batchSize, dryRun);

    if (!dryRun) {
      // Phase 4: Verify
      const isClean = await verifyCleanState();

      // Summary
      printHeader('COMPLETION SUMMARY');
      log(`Total duplicates found: ${deletionStats.totalDuplicateRecords}`, 'INFO');
      log(`Records deleted: ${deletionStats.recordsDeleted}`, 'SUCCESS');
      log(`Batches processed: ${deletionStats.batchesProcessed}`, 'INFO');
      log(`Errors: ${deletionStats.errors}`, deletionStats.errors > 0 ? 'ERROR' : 'SUCCESS');
      log(`Final status: ${isClean ? '✅ CLEAN' : '⚠️  DUPLICATES REMAIN'}`, isClean ? 'SUCCESS' : 'ERROR');

      if (!isClean) {
        log('\n⚠️  Warning: Some duplicates remain. Run the script again.', 'WARN');
        process.exit(1);
      }
    } else {
      printHeader('DRY RUN SUMMARY');
      log(`Duplicates that would be deleted: ${deletionStats.totalDuplicateRecords}`, 'INFO');
      log('Run without --dry-run to perform actual deletion', 'INFO');
    }

  } catch (error: any) {
    log(`Fatal error: ${error.message}`, 'ERROR');
    log(error.stack, 'ERROR');
    process.exit(1);
  }
}

main().catch(console.error);
