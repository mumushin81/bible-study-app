/**
 * Comprehensive Analysis of ALL Word Duplicates
 *
 * Analyzes all duplicate words across the database and creates deletion plans
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface WordRecord {
  id: string;
  verse_id: string | null;
  position: number;
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  root: string;
  grammar: string;
  structure: string | null;
  emoji: string | null;
  category: string | null;
  icon_svg: string | null;
  created_at: string;
}

function scoreWord(word: WordRecord, allVersions: WordRecord[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons = [];

  // Newest created_at
  const timestamps = allVersions.map(w => new Date(w.created_at).getTime());
  const maxTimestamp = Math.max(...timestamps);
  if (new Date(word.created_at).getTime() === maxTimestamp) {
    score += 10;
    reasons.push('Newest record (+10)');
  }

  // Has SVG
  if (word.icon_svg) {
    score += 5;
    reasons.push('Has SVG (+5)');

    // SVG quality checks
    if (word.icon_svg.includes('viewBox')) {
      score += 3;
      reasons.push('Has viewBox (+3)');
    }
    if (word.icon_svg.includes('linearGradient') || word.icon_svg.includes('radialGradient')) {
      score += 3;
      reasons.push('Has gradient (+3)');
    }
    if (word.icon_svg.match(/id="gradient-/)) {
      score += 5;
      reasons.push('MD Script gradient ID (+5)');
    }

    // Longer SVG (more detailed)
    if (word.icon_svg.length > 500) {
      score += 2;
      reasons.push('Detailed SVG (+2)');
    }
  }

  return { score, reasons };
}

async function analyzeAllDuplicates() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 COMPREHENSIVE WORD DUPLICATE ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Query all words
  console.log('📋 Querying all words from database...\n');

  const { data: allWords, error } = await supabase
    .from('words')
    .select('*')
    .order('verse_id', { ascending: true })
    .order('position', { ascending: true });

  if (error) {
    console.error('Error querying words:', error);
    return;
  }

  if (!allWords || allWords.length === 0) {
    console.log('⚠️  No words found in database');
    return;
  }

  console.log(`Total words in database: ${allWords.length}\n`);

  // Find duplicates based on verse_id + hebrew + position
  const duplicateMap = new Map<string, WordRecord[]>();

  allWords.forEach(word => {
    const key = `${word.verse_id}_${word.hebrew}_${word.position}`;
    if (!duplicateMap.has(key)) {
      duplicateMap.set(key, []);
    }
    duplicateMap.get(key)!.push(word);
  });

  const duplicates = Array.from(duplicateMap.entries())
    .filter(([_, words]) => words.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found in the database!\n');
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} duplicate word groups\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Analyze each duplicate group
  let totalRecordsToDelete = 0;
  const deleteCommands: string[] = [];

  duplicates.forEach(([key, words], idx) => {
    const [verse_id, hebrew, position] = key.split('_');

    console.log(`\n${'═'.repeat(80)}`);
    console.log(`DUPLICATE GROUP #${idx + 1}`);
    console.log('═'.repeat(80));
    console.log(`\nWord: ${hebrew}`);
    console.log(`Verse ID: ${verse_id}`);
    console.log(`Position: ${position}`);
    console.log(`Number of duplicates: ${words.length}\n`);

    // Show all versions
    console.log('All Versions:');
    console.log('-'.repeat(80));
    words.forEach((word, i) => {
      console.log(`\n  Version #${i + 1}:`);
      console.log(`    ID: ${word.id}`);
      console.log(`    Meaning: ${word.meaning}`);
      console.log(`    IPA: ${word.ipa}`);
      console.log(`    Korean: ${word.korean}`);
      console.log(`    Root: ${word.root}`);
      console.log(`    Grammar: ${word.grammar}`);
      console.log(`    Created: ${word.created_at}`);
      console.log(`    Has SVG: ${word.icon_svg ? 'Yes' : 'No'}`);
      if (word.icon_svg) {
        console.log(`    SVG Length: ${word.icon_svg.length} chars`);
        const hasViewBox = word.icon_svg.includes('viewBox');
        const hasGradient = word.icon_svg.includes('linearGradient') || word.icon_svg.includes('radialGradient');
        const hasMDScriptId = word.icon_svg.match(/id="gradient-/);
        console.log(`    SVG Quality: ${hasViewBox ? '✅ ViewBox' : '❌'} | ${hasGradient ? '✅ Gradient' : '❌'} | ${hasMDScriptId ? '✅ MD Script ID' : '❌'}`);
      }
    });

    // Score each version
    console.log('\n\n  Scoring:');
    console.log('  ' + '-'.repeat(78));

    const scores = words.map((word, i) => {
      const { score, reasons } = scoreWord(word, words);
      return { idx: i, id: word.id, score, reasons, word };
    });

    scores.sort((a, b) => b.score - a.score);

    scores.forEach(({ idx, id, score, reasons }) => {
      console.log(`\n    Version #${idx + 1} (ID: ${id.substring(0, 8)}...):`);
      console.log(`      Score: ${score}`);
      console.log(`      Reasons:`);
      reasons.forEach(r => console.log(`        - ${r}`));
    });

    // Decision
    const keepRecord = scores[0];
    const deleteRecords = scores.slice(1);

    console.log('\n\n  DECISION:');
    console.log('  ' + '-'.repeat(78));
    console.log(`  ✅ KEEP: Version #${keepRecord.idx + 1}`);
    console.log(`     ID: ${keepRecord.word.id}`);
    console.log(`     Score: ${keepRecord.score}`);
    console.log(`     Created: ${keepRecord.word.created_at}`);

    console.log(`\n  ❌ DELETE: ${deleteRecords.length} record(s)`);
    deleteRecords.forEach(({ idx, word }) => {
      console.log(`     Version #${idx + 1}:`);
      console.log(`       ID: ${word.id}`);
      console.log(`       Created: ${word.created_at}`);
      totalRecordsToDelete++;
      deleteCommands.push(`DELETE FROM words WHERE id = '${word.id}'; -- ${hebrew} in ${verse_id}`);
    });

    console.log('\n' + '═'.repeat(80) + '\n');
  });

  // Final SQL commands
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('COMPLETE SQL DELETE SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('-- ============================================');
  console.log('-- DELETE DUPLICATE WORDS');
  console.log(`-- Total duplicates to remove: ${totalRecordsToDelete}`);
  console.log('-- ============================================\n');

  console.log('BEGIN;\n');

  deleteCommands.forEach(cmd => {
    console.log(cmd);
  });

  console.log('\n-- Verification queries:');
  console.log('SELECT COUNT(*) as total_words FROM words;');
  console.log('SELECT verse_id, hebrew, position, COUNT(*) as count');
  console.log('FROM words');
  console.log('GROUP BY verse_id, hebrew, position');
  console.log('HAVING COUNT(*) > 1;');

  console.log('\nCOMMIT;');
  console.log('-- ROLLBACK; -- Uncomment to undo changes\n');

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Total words in database: ${allWords.length}`);
  console.log(`Duplicate word groups: ${duplicates.length}`);
  console.log(`Total duplicate records to delete: ${totalRecordsToDelete}`);
  console.log(`Words after cleanup: ${allWords.length - totalRecordsToDelete}\n`);

  // Group by verse
  const verseGroups = new Map<string, number>();
  duplicates.forEach(([key, _]) => {
    const verse_id = key.split('_')[0];
    verseGroups.set(verse_id, (verseGroups.get(verse_id) || 0) + 1);
  });

  console.log('Duplicates by verse:');
  Array.from(verseGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([verse_id, count]) => {
      console.log(`  ${verse_id}: ${count} duplicate group(s)`);
    });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

analyzeAllDuplicates().catch(console.error);
