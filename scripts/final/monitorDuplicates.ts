/**
 * DUPLICATE MONITORING SCRIPT
 *
 * Continuous monitoring script to detect future duplicates.
 *
 * Features:
 * - Real-time duplicate detection
 * - Scheduled checks (cron-style)
 * - Alert system
 * - Historical tracking
 * - Integration with CI/CD
 *
 * Usage:
 *   npx tsx scripts/final/monitorDuplicates.ts [--watch] [--interval=60]
 *
 * Options:
 *   --watch: Continuous monitoring mode
 *   --interval: Check interval in seconds (default: 60)
 *   --alert: Enable alerts (console only for now)
 *   --ci: CI mode - exit with error if duplicates found
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

interface MonitoringResult {
  timestamp: string;
  status: 'CLEAN' | 'DUPLICATES_FOUND';
  totalWords: number;
  uniqueCombinations: number;
  duplicateGroups: number;
  totalDuplicateRecords: number;
  samples?: Array<{
    hebrew: string;
    verseId: string;
    count: number;
  }>;
}

interface HistoricalData {
  checks: MonitoringResult[];
  firstCheck: string;
  lastCheck: string;
  totalChecks: number;
  duplicatesDetected: number;
}

const HISTORY_FILE = path.join(process.cwd(), 'logs', 'duplicate-monitoring-history.json');

function ensureLogsDir() {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function loadHistory(): HistoricalData {
  ensureLogsDir();

  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch {
      // If file is corrupted, start fresh
    }
  }

  return {
    checks: [],
    firstCheck: new Date().toISOString(),
    lastCheck: new Date().toISOString(),
    totalChecks: 0,
    duplicatesDetected: 0
  };
}

function saveHistory(history: HistoricalData) {
  ensureLogsDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function logWithTimestamp(message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') {
  const timestamp = new Date().toISOString();
  const icon = level === 'SUCCESS' ? '✅' : level === 'WARN' ? '⚠️' : level === 'ERROR' ? '❌' : 'ℹ️';
  console.log(`[${timestamp}] ${icon} ${message}`);
}

async function checkForDuplicates(showSamples: boolean = false): Promise<MonitoringResult> {
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id');

  if (error) {
    throw new Error(`Failed to fetch words: ${error.message}`);
  }

  if (!words || words.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      status: 'CLEAN',
      totalWords: 0,
      uniqueCombinations: 0,
      duplicateGroups: 0,
      totalDuplicateRecords: 0
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
    .filter(([_, wordList]) => wordList.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  const totalDuplicateRecords = duplicates.reduce(
    (sum, [_, list]) => sum + (list.length - 1),
    0
  );

  const samples = showSamples ? duplicates.slice(0, 5).map(([key, list]) => {
    const [hebrew, verseId] = key.split('::');
    return {
      hebrew,
      verseId,
      count: list.length
    };
  }) : undefined;

  return {
    timestamp: new Date().toISOString(),
    status: duplicates.length > 0 ? 'DUPLICATES_FOUND' : 'CLEAN',
    totalWords: words.length,
    uniqueCombinations: groupMap.size,
    duplicateGroups: duplicates.length,
    totalDuplicateRecords,
    samples
  };
}

function alertDuplicates(result: MonitoringResult) {
  console.log('\n' + '='.repeat(70));
  console.log('🚨 DUPLICATE ALERT!');
  console.log('='.repeat(70));
  console.log(`Timestamp: ${result.timestamp}`);
  console.log(`Duplicate Groups: ${result.duplicateGroups}`);
  console.log(`Total Duplicate Records: ${result.totalDuplicateRecords}`);

  if (result.samples && result.samples.length > 0) {
    console.log('\nTop Duplicates:');
    result.samples.forEach((sample, i) => {
      console.log(`  ${i + 1}. "${sample.hebrew}" (${sample.verseId}) - ${sample.count} copies`);
    });
  }

  console.log('\nAction Required:');
  console.log('  1. Run: npx tsx scripts/final/finalDuplicateRemoval.ts');
  console.log('  2. Investigate root cause');
  console.log('  3. Fix data generation scripts');
  console.log('='.repeat(70) + '\n');
}

function displayHistory(history: HistoricalData) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 MONITORING HISTORY');
  console.log('='.repeat(70));
  console.log(`First Check: ${history.firstCheck}`);
  console.log(`Last Check: ${history.lastCheck}`);
  console.log(`Total Checks: ${history.totalChecks}`);
  console.log(`Duplicates Detected: ${history.duplicatesDetected} times`);

  if (history.checks.length > 0) {
    const recentChecks = history.checks.slice(-5);
    console.log('\nRecent Checks:');
    recentChecks.forEach((check, i) => {
      const icon = check.status === 'CLEAN' ? '✅' : '❌';
      console.log(`  ${icon} ${check.timestamp} - ${check.status}`);
      if (check.status === 'DUPLICATES_FOUND') {
        console.log(`     ${check.duplicateGroups} groups, ${check.totalDuplicateRecords} records`);
      }
    });
  }

  console.log('='.repeat(70) + '\n');
}

async function runSingleCheck(alertEnabled: boolean, ciMode: boolean): Promise<boolean> {
  logWithTimestamp('Running duplicate check...', 'INFO');

  const result = await checkForDuplicates(true);
  const history = loadHistory();

  // Update history
  history.checks.push(result);
  history.lastCheck = result.timestamp;
  history.totalChecks++;

  if (result.status === 'DUPLICATES_FOUND') {
    history.duplicatesDetected++;
  }

  // Keep only last 100 checks
  if (history.checks.length > 100) {
    history.checks = history.checks.slice(-100);
  }

  saveHistory(history);

  // Display results
  if (result.status === 'CLEAN') {
    logWithTimestamp(
      `Database is clean (${result.totalWords} words, ${result.uniqueCombinations} unique)`,
      'SUCCESS'
    );
  } else {
    logWithTimestamp(
      `Duplicates detected! ${result.duplicateGroups} groups, ${result.totalDuplicateRecords} records`,
      'ERROR'
    );

    if (alertEnabled) {
      alertDuplicates(result);
    }
  }

  // CI mode: exit with error if duplicates found
  if (ciMode && result.status === 'DUPLICATES_FOUND') {
    console.error('\n❌ CI Mode: Duplicates detected. Failing build.');
    process.exit(1);
  }

  return result.status === 'CLEAN';
}

async function watchMode(interval: number, alertEnabled: boolean) {
  console.log('='.repeat(70));
  console.log('👁️  WATCH MODE ACTIVATED');
  console.log('='.repeat(70));
  console.log(`Check Interval: ${interval} seconds`);
  console.log(`Alerts: ${alertEnabled ? 'Enabled' : 'Disabled'}`);
  console.log('Press Ctrl+C to stop');
  console.log('='.repeat(70) + '\n');

  let checkCount = 0;

  const runCheck = async () => {
    checkCount++;
    console.log(`\n--- Check #${checkCount} ---`);
    await runSingleCheck(alertEnabled, false);
  };

  // Run first check immediately
  await runCheck();

  // Then run on interval
  const intervalId = setInterval(runCheck, interval * 1000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping monitor...');
    clearInterval(intervalId);

    const history = loadHistory();
    displayHistory(history);

    process.exit(0);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const watchEnabled = args.includes('--watch');
  const alertEnabled = args.includes('--alert');
  const ciMode = args.includes('--ci');
  const showHistory = args.includes('--history');

  const intervalArg = args.find(arg => arg.startsWith('--interval='));
  const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 60;

  console.log('🛡️  DUPLICATE MONITORING SYSTEM\n');

  if (showHistory) {
    const history = loadHistory();
    displayHistory(history);
    return;
  }

  if (watchEnabled) {
    await watchMode(interval, alertEnabled);
  } else {
    const isClean = await runSingleCheck(alertEnabled, ciMode);

    if (!ciMode) {
      console.log('\nℹ️  Run with --watch for continuous monitoring');
      console.log('ℹ️  Run with --history to view monitoring history');
    }

    process.exit(isClean ? 0 : 1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
