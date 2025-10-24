/**
 * VERIFY NO DUPLICATES SCRIPT
 *
 * Comprehensive verification script to ensure database integrity.
 *
 * Features:
 * - Multi-table duplicate detection
 * - Constraint verification
 * - Data integrity checks
 * - Performance impact analysis
 * - Detailed reporting with statistics
 *
 * Usage:
 *   npx tsx scripts/final/verifyNoDuplicates.ts [--detailed] [--export]
 *
 * Options:
 *   --detailed: Show detailed information about each check
 *   --export: Export report to JSON file
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface VerificationReport {
  timestamp: string;
  overallStatus: 'PASS' | 'FAIL';
  checks: {
    wordDuplicates: CheckResult;
    verseDuplicates: CheckResult;
    commentaryDuplicates: CheckResult;
    constraints: CheckResult;
    indexes: CheckResult;
    dataIntegrity: CheckResult;
  };
  statistics: {
    totalWords: number;
    totalVerses: number;
    totalCommentaries: number;
    uniqueWordCombinations: number;
    uniqueVerses: number;
  };
  recommendations: string[];
}

interface CheckResult {
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

function printHeader(title: string) {
  const line = '='.repeat(70);
  console.log(line);
  console.log(title);
  console.log(line);
}

function printSection(title: string) {
  console.log('\n' + '-'.repeat(70));
  console.log(title);
  console.log('-'.repeat(70));
}

function printCheck(name: string, result: CheckResult) {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${result.message}`);
  if (result.details && process.argv.includes('--detailed')) {
    console.log('   Details:', JSON.stringify(result.details, null, 2));
  }
}

async function checkWordDuplicates(detailed: boolean): Promise<CheckResult> {
  printSection('🔍 CHECK 1: Word Duplicates');

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position');

  if (error) {
    return {
      status: 'FAIL',
      message: `Failed to fetch words: ${error.message}`
    };
  }

  if (!words || words.length === 0) {
    return {
      status: 'WARN',
      message: 'No words found in database'
    };
  }

  // Group by (hebrew, verse_id) - only check verse_id if it exists
  const groupMap = new Map<string, any[]>();
  words.forEach((word) => {
    // Skip words without verse_id (orphaned words)
    if (!word.verse_id) return;

    const key = `${word.hebrew}::${word.verse_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(word);
  });

  const duplicates = Array.from(groupMap.entries())
    .filter(([_, wordList]) => wordList.length > 1);

  const totalDuplicateRecords = duplicates.reduce(
    (sum, [_, list]) => sum + (list.length - 1),
    0
  );

  console.log(`Total words: ${words.length}`);
  console.log(`Unique combinations: ${groupMap.size}`);
  console.log(`Duplicate combinations: ${duplicates.length}`);
  console.log(`Total duplicate records: ${totalDuplicateRecords}`);

  if (duplicates.length === 0) {
    return {
      status: 'PASS',
      message: `No duplicates found (${words.length} words, ${groupMap.size} unique)`,
      details: { totalWords: words.length, uniqueCombinations: groupMap.size }
    };
  }

  const details = detailed ? {
    duplicateCount: duplicates.length,
    totalDuplicateRecords,
    samples: duplicates.slice(0, 5).map(([key, list]) => ({
      key,
      count: list.length,
      ids: list.map(w => w.id.substring(0, 8))
    }))
  } : undefined;

  return {
    status: 'FAIL',
    message: `Found ${duplicates.length} duplicate combinations (${totalDuplicateRecords} extra records)`,
    details
  };
}

async function checkVerseDuplicates(): Promise<CheckResult> {
  printSection('🔍 CHECK 2: Verse Duplicates');

  const { data: verses, error } = await supabase
    .from('verses')
    .select('id, reference, book_id, chapter, verse_number');

  if (error) {
    return {
      status: 'FAIL',
      message: `Failed to fetch verses: ${error.message}`
    };
  }

  if (!verses || verses.length === 0) {
    return {
      status: 'WARN',
      message: 'No verses found in database'
    };
  }

  // Check for duplicate IDs
  const idMap = new Map<string, number>();
  verses.forEach(v => {
    idMap.set(v.id, (idMap.get(v.id) || 0) + 1);
  });

  const duplicateIds = Array.from(idMap.entries()).filter(([_, count]) => count > 1);

  // Check for duplicate references
  const refMap = new Map<string, number>();
  verses.forEach(v => {
    refMap.set(v.reference, (refMap.get(v.reference) || 0) + 1);
  });

  const duplicateRefs = Array.from(refMap.entries()).filter(([_, count]) => count > 1);

  console.log(`Total verses: ${verses.length}`);
  console.log(`Duplicate IDs: ${duplicateIds.length}`);
  console.log(`Duplicate references: ${duplicateRefs.length}`);

  if (duplicateIds.length === 0 && duplicateRefs.length === 0) {
    return {
      status: 'PASS',
      message: `No duplicates found (${verses.length} verses)`,
      details: { totalVerses: verses.length }
    };
  }

  return {
    status: 'FAIL',
    message: `Found ${duplicateIds.length} duplicate IDs, ${duplicateRefs.length} duplicate references`,
    details: {
      duplicateIds: duplicateIds.slice(0, 5),
      duplicateRefs: duplicateRefs.slice(0, 5)
    }
  };
}

async function checkCommentaryDuplicates(): Promise<CheckResult> {
  printSection('🔍 CHECK 3: Commentary Duplicates');

  const { data: commentaries, error } = await supabase
    .from('commentaries')
    .select('id, verse_id');

  if (error) {
    return {
      status: 'FAIL',
      message: `Failed to fetch commentaries: ${error.message}`
    };
  }

  if (!commentaries || commentaries.length === 0) {
    return {
      status: 'WARN',
      message: 'No commentaries found in database'
    };
  }

  // Check for duplicate verse_ids (should be 1:1 relationship)
  const verseMap = new Map<string, number>();
  commentaries.forEach(c => {
    if (c.verse_id) {
      verseMap.set(c.verse_id, (verseMap.get(c.verse_id) || 0) + 1);
    }
  });

  const duplicates = Array.from(verseMap.entries()).filter(([_, count]) => count > 1);

  console.log(`Total commentaries: ${commentaries.length}`);
  console.log(`Duplicate verse associations: ${duplicates.length}`);

  if (duplicates.length === 0) {
    return {
      status: 'PASS',
      message: `No duplicates found (${commentaries.length} commentaries)`,
      details: { totalCommentaries: commentaries.length }
    };
  }

  return {
    status: 'FAIL',
    message: `Found ${duplicates.length} verses with multiple commentaries`,
    details: { duplicates: duplicates.slice(0, 5) }
  };
}

async function checkConstraints(): Promise<CheckResult> {
  printSection('🔍 CHECK 4: Database Constraints');

  // We can't directly query constraints with standard Supabase client
  // Instead, we'll try to insert a duplicate and see if it fails
  console.log('Attempting to test unique constraint...');

  const { data: sample } = await supabase
    .from('words')
    .select('hebrew, verse_id')
    .limit(1)
    .single();

  if (!sample) {
    return {
      status: 'WARN',
      message: 'No sample data to test constraint'
    };
  }

  // Try to insert duplicate (should fail if constraint exists)
  const { error } = await supabase
    .from('words')
    .insert({
      hebrew: sample.hebrew,
      verse_id: sample.verse_id,
      position: 999,
      meaning: 'TEST',
      ipa: 'test',
      korean: 'test',
      root: 'test',
      grammar: 'test'
    });

  if (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      console.log('✅ Unique constraint is active');
      return {
        status: 'PASS',
        message: 'Unique constraint prevents duplicates',
        details: { constraintActive: true }
      };
    } else {
      console.log('⚠️  Insert failed for different reason:', error.message);
      return {
        status: 'WARN',
        message: 'Cannot determine constraint status',
        details: { error: error.message }
      };
    }
  } else {
    // Undo the test insert
    await supabase
      .from('words')
      .delete()
      .eq('hebrew', sample.hebrew)
      .eq('verse_id', sample.verse_id)
      .eq('position', 999);

    console.log('⚠️  Unique constraint is NOT active');
    return {
      status: 'FAIL',
      message: 'No unique constraint found - duplicates are possible!',
      details: { constraintActive: false }
    };
  }
}

async function checkIndexes(): Promise<CheckResult> {
  printSection('🔍 CHECK 5: Database Indexes');

  // Check query performance as a proxy for index existence
  const start = Date.now();

  await supabase
    .from('words')
    .select('id')
    .eq('hebrew', 'בְּרֵאשִׁית')
    .eq('verse_id', 'genesis-1-1');

  const duration = Date.now() - start;

  console.log(`Query duration: ${duration}ms`);

  if (duration < 100) {
    return {
      status: 'PASS',
      message: `Query performance is good (${duration}ms) - indexes likely present`,
      details: { queryTime: duration }
    };
  } else if (duration < 500) {
    return {
      status: 'WARN',
      message: `Query performance is acceptable (${duration}ms)`,
      details: { queryTime: duration }
    };
  } else {
    return {
      status: 'WARN',
      message: `Query performance is slow (${duration}ms) - consider adding indexes`,
      details: { queryTime: duration }
    };
  }
}

async function checkDataIntegrity(): Promise<CheckResult> {
  printSection('🔍 CHECK 6: Data Integrity');

  // Check for orphaned words (words without valid verse_id)
  const { data: words } = await supabase
    .from('words')
    .select('id, verse_id');

  const { data: verses } = await supabase
    .from('verses')
    .select('id');

  if (!words || !verses) {
    return {
      status: 'WARN',
      message: 'Cannot verify data integrity - missing data'
    };
  }

  const verseIds = new Set(verses.map(v => v.id));
  const orphanedWords = words.filter(w => w.verse_id && !verseIds.has(w.verse_id));

  console.log(`Total words: ${words.length}`);
  console.log(`Total verses: ${verses.length}`);
  console.log(`Orphaned words: ${orphanedWords.length}`);

  if (orphanedWords.length === 0) {
    return {
      status: 'PASS',
      message: 'All words have valid verse references',
      details: { orphanedWords: 0 }
    };
  }

  return {
    status: 'FAIL',
    message: `Found ${orphanedWords.length} orphaned words`,
    details: { orphanedWords: orphanedWords.length }
  };
}

async function generateReport(detailed: boolean): Promise<VerificationReport> {
  const checks = {
    wordDuplicates: await checkWordDuplicates(detailed),
    verseDuplicates: await checkVerseDuplicates(),
    commentaryDuplicates: await checkCommentaryDuplicates(),
    constraints: await checkConstraints(),
    indexes: await checkIndexes(),
    dataIntegrity: await checkDataIntegrity()
  };

  const { data: words } = await supabase.from('words').select('id', { count: 'exact', head: true });
  const { data: verses } = await supabase.from('verses').select('id', { count: 'exact', head: true });
  const { data: commentaries } = await supabase.from('commentaries').select('id', { count: 'exact', head: true });

  const overallStatus = Object.values(checks).every(c => c.status === 'PASS') ? 'PASS' : 'FAIL';

  const recommendations: string[] = [];

  if (checks.wordDuplicates.status === 'FAIL') {
    recommendations.push('Run: npx tsx scripts/final/finalDuplicateRemoval.ts');
  }

  if (checks.constraints.status !== 'PASS') {
    recommendations.push('Run: npx tsx scripts/final/addUniqueConstraint.ts');
  }

  if (checks.indexes.status === 'WARN') {
    recommendations.push('Consider adding indexes for better performance');
  }

  if (checks.dataIntegrity.status === 'FAIL') {
    recommendations.push('Fix orphaned records with data cleanup script');
  }

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    checks,
    statistics: {
      totalWords: checks.wordDuplicates.details?.totalWords || 0,
      totalVerses: checks.verseDuplicates.details?.totalVerses || 0,
      totalCommentaries: checks.commentaryDuplicates.details?.totalCommentaries || 0,
      uniqueWordCombinations: checks.wordDuplicates.details?.uniqueCombinations || 0,
      uniqueVerses: checks.verseDuplicates.details?.totalVerses || 0
    },
    recommendations
  };
}

async function main() {
  const args = process.argv.slice(2);
  const detailed = args.includes('--detailed');
  const exportReport = args.includes('--export');

  printHeader('🛡️  COMPREHENSIVE DATABASE VERIFICATION');
  console.log(`Mode: ${detailed ? 'Detailed' : 'Standard'}`);
  console.log(`Export: ${exportReport ? 'Yes' : 'No'}`);
  console.log('');

  try {
    const report = await generateReport(detailed);

    // Print summary
    printHeader('VERIFICATION SUMMARY');
    printCheck('Word Duplicates', report.checks.wordDuplicates);
    printCheck('Verse Duplicates', report.checks.verseDuplicates);
    printCheck('Commentary Duplicates', report.checks.commentaryDuplicates);
    printCheck('Constraints', report.checks.constraints);
    printCheck('Indexes', report.checks.indexes);
    printCheck('Data Integrity', report.checks.dataIntegrity);

    console.log('\n' + '='.repeat(70));
    console.log('📊 STATISTICS');
    console.log('='.repeat(70));
    console.log(`Total Words: ${report.statistics.totalWords}`);
    console.log(`Unique Word Combinations: ${report.statistics.uniqueWordCombinations}`);
    console.log(`Total Verses: ${report.statistics.totalVerses}`);
    console.log(`Total Commentaries: ${report.statistics.totalCommentaries}`);

    if (report.recommendations.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('💡 RECOMMENDATIONS');
      console.log('='.repeat(70));
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    printHeader('FINAL STATUS');
    const statusIcon = report.overallStatus === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} Overall Status: ${report.overallStatus}`);

    if (exportReport) {
      const reportDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const reportFile = path.join(reportDir, `verification-${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`\n📄 Report exported to: ${reportFile}`);
    }

    // Exit with appropriate code
    process.exit(report.overallStatus === 'PASS' ? 0 : 1);

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
