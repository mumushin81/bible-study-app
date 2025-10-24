/**
 * Deep Analysis of Genesis 1:6 Duplicate Issue
 *
 * Objective: Thoroughly investigate why Genesis 1:6 has exactly 3 copies of יְהִי
 * and create a precise deletion plan.
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

async function analyzeGenesis1_6() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Genesis 1:6 Duplicate Analysis - יְהִי Investigation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Query ALL words for Genesis 1:6
  console.log('📋 STEP 1: Query ALL words for Genesis 1:6\n');

  const { data: allWords, error } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', 'genesis_1_6')
    .order('position', { ascending: true });

  if (error) {
    console.error('Error querying words:', error);
    return;
  }

  if (!allWords || allWords.length === 0) {
    console.log('⚠️  No words found for genesis_1_6');
    return;
  }

  console.log(`Total words found: ${allWords.length}\n`);

  // Display all words
  console.log('All words in Genesis 1:6:');
  console.log('─'.repeat(80));
  allWords.forEach((word, idx) => {
    console.log(`${idx + 1}. Position: ${word.position} | Hebrew: ${word.hebrew} | Meaning: ${word.meaning}`);
  });
  console.log('\n');

  // Step 2: Find and analyze יְהִי duplicates
  console.log('📋 STEP 2: Analyze יְהִי (yehi) duplicates\n');

  const yehiWords = allWords.filter(w => w.hebrew === 'יְהִי');

  if (yehiWords.length === 0) {
    console.log('⚠️  No יְהִי words found');
    return;
  }

  console.log(`Found ${yehiWords.length} copies of יְהִי\n`);

  // Detailed comparison
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DETAILED FIELD COMPARISON');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  yehiWords.forEach((word, idx) => {
    console.log(`\n─── Copy #${idx + 1} ───`);
    console.log(`ID:          ${word.id}`);
    console.log(`Position:    ${word.position}`);
    console.log(`Hebrew:      ${word.hebrew}`);
    console.log(`Meaning:     ${word.meaning}`);
    console.log(`IPA:         ${word.ipa}`);
    console.log(`Korean:      ${word.korean}`);
    console.log(`Root:        ${word.root}`);
    console.log(`Grammar:     ${word.grammar}`);
    console.log(`Structure:   ${word.structure || 'null'}`);
    console.log(`Category:    ${word.category || 'null'}`);
    console.log(`Emoji:       ${word.emoji || 'null'}`);
    console.log(`Created At:  ${word.created_at}`);
    console.log(`Icon SVG:    ${word.icon_svg ? `${word.icon_svg.substring(0, 100)}...` : 'null'}`);
    if (word.icon_svg) {
      // Check for gradient IDs
      const gradientMatch = word.icon_svg.match(/id="([^"]+)"/g);
      if (gradientMatch) {
        console.log(`Gradient IDs: ${gradientMatch.join(', ')}`);
      }
      // Check SVG format version
      if (word.icon_svg.includes('viewBox')) {
        console.log(`SVG Format:  Has viewBox (newer format)`);
      }
      if (word.icon_svg.includes('linearGradient')) {
        console.log(`SVG Style:   Has gradients`);
      }
    }
  });

  // Step 3: Analyze position field meaning
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('POSITION FIELD ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const positionCounts = new Map<number, number>();
  allWords.forEach(w => {
    positionCounts.set(w.position, (positionCounts.get(w.position) || 0) + 1);
  });

  console.log('Position distribution in Genesis 1:6:');
  Array.from(positionCounts.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([pos, count]) => {
      const words = allWords.filter(w => w.position === pos);
      if (count > 1) {
        console.log(`  Position ${pos}: ${count} words ❌ DUPLICATE`);
        words.forEach(w => console.log(`    - ${w.hebrew} (${w.meaning})`));
      } else {
        console.log(`  Position ${pos}: ${count} word - ${words[0].hebrew} (${words[0].meaning})`);
      }
    });

  console.log('\n💡 Position Analysis:');
  console.log('  - Position field represents word order in the verse');
  console.log('  - Each position should have exactly ONE word');
  console.log(`  - Current duplicates at positions: ${Array.from(positionCounts.entries()).filter(([_, count]) => count > 1).map(([pos]) => pos).join(', ')}`);

  // Step 4: SVG Quality Analysis
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SVG QUALITY ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  yehiWords.forEach((word, idx) => {
    console.log(`\nCopy #${idx + 1} (ID: ${word.id.substring(0, 8)}...):`);

    if (!word.icon_svg) {
      console.log('  ❌ No SVG');
    } else {
      const hasViewBox = word.icon_svg.includes('viewBox');
      const hasGradient = word.icon_svg.includes('linearGradient');
      const hasGradientId = word.icon_svg.match(/id="gradient-/);
      const svgLength = word.icon_svg.length;

      console.log(`  Length: ${svgLength} chars`);
      console.log(`  ViewBox: ${hasViewBox ? '✅' : '❌'}`);
      console.log(`  Gradient: ${hasGradient ? '✅' : '❌'}`);
      console.log(`  MD Script gradient ID: ${hasGradientId ? '✅' : '❌'}`);

      // Extract gradient IDs
      const gradientMatches = word.icon_svg.match(/id="([^"]+)"/g);
      if (gradientMatches) {
        console.log(`  IDs found: ${gradientMatches.join(', ')}`);
      }
    }
  });

  // Step 5: Decision Matrix
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DECISION MATRIX - Which to Keep?');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const scores = yehiWords.map((word, idx) => {
    let score = 0;
    const reasons = [];

    // Newest created_at
    const timestamps = yehiWords.map(w => new Date(w.created_at).getTime());
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
      if (word.icon_svg.includes('linearGradient')) {
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

    return { idx, id: word.id, score, reasons };
  });

  scores.sort((a, b) => b.score - a.score);

  scores.forEach(({ idx, id, score, reasons }) => {
    console.log(`\nCopy #${idx + 1} (ID: ${id.substring(0, 8)}...):`);
    console.log(`  Score: ${score}`);
    console.log(`  Reasons:`);
    reasons.forEach(r => console.log(`    - ${r}`));
  });

  const keepRecord = scores[0];
  const deleteRecords = scores.slice(1);

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FINAL DECISION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`✅ KEEP: Copy #${keepRecord.idx + 1}`);
  console.log(`   ID: ${yehiWords[keepRecord.idx].id}`);
  console.log(`   Score: ${keepRecord.score}`);
  console.log(`   Position: ${yehiWords[keepRecord.idx].position}`);
  console.log(`   Created: ${yehiWords[keepRecord.idx].created_at}\n`);

  console.log(`❌ DELETE: ${deleteRecords.length} record(s)\n`);
  deleteRecords.forEach(({ idx }) => {
    console.log(`   Copy #${idx + 1}:`);
    console.log(`     ID: ${yehiWords[idx].id}`);
    console.log(`     Position: ${yehiWords[idx].position}`);
    console.log(`     Created: ${yehiWords[idx].created_at}`);
  });

  // Step 6: Generate DELETE commands
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SQL DELETE COMMANDS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('-- DELETE commands for duplicate יְהִי records:');
  deleteRecords.forEach(({ idx }) => {
    console.log(`DELETE FROM words WHERE id = '${yehiWords[idx].id}';`);
  });

  console.log('\n-- Verification query:');
  console.log(`SELECT id, hebrew, meaning, position, created_at FROM words WHERE verse_id = 'genesis_1_6' AND hebrew = 'יְהִי' ORDER BY position;`);

  // Step 7: Check for other duplicates in Genesis 1:6
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OTHER DUPLICATES IN GENESIS 1:6');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const wordCounts = new Map<string, WordRecord[]>();
  allWords.forEach(w => {
    if (!wordCounts.has(w.hebrew)) {
      wordCounts.set(w.hebrew, []);
    }
    wordCounts.get(w.hebrew)!.push(w);
  });

  const otherDuplicates = Array.from(wordCounts.entries())
    .filter(([hebrew, words]) => words.length > 1 && hebrew !== 'יְהִי');

  if (otherDuplicates.length === 0) {
    console.log('✅ No other duplicates found in Genesis 1:6\n');
  } else {
    console.log(`⚠️  Found ${otherDuplicates.length} other duplicate word(s):\n`);

    otherDuplicates.forEach(([hebrew, words]) => {
      console.log(`\nWord: ${hebrew}`);
      console.log(`Copies: ${words.length}`);
      console.log('Details:');
      words.forEach((w, idx) => {
        console.log(`  Copy #${idx + 1}:`);
        console.log(`    ID: ${w.id}`);
        console.log(`    Position: ${w.position}`);
        console.log(`    Meaning: ${w.meaning}`);
        console.log(`    Created: ${w.created_at}`);
        console.log(`    Has SVG: ${w.icon_svg ? 'Yes' : 'No'}`);
      });
    });

    // Generate delete commands for other duplicates
    console.log('\n\n-- DELETE commands for other duplicates:');
    otherDuplicates.forEach(([hebrew, words]) => {
      // Keep newest with SVG
      const sorted = words.sort((a, b) => {
        // Prioritize having SVG
        if (a.icon_svg && !b.icon_svg) return -1;
        if (!a.icon_svg && b.icon_svg) return 1;
        // Then by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const toDelete = sorted.slice(1);
      toDelete.forEach(w => {
        console.log(`DELETE FROM words WHERE id = '${w.id}'; -- ${hebrew} duplicate`);
      });
    });
  }

  // Summary
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalDuplicates = yehiWords.length - 1 + otherDuplicates.reduce((sum, [_, words]) => sum + words.length - 1, 0);

  console.log(`Total words in Genesis 1:6: ${allWords.length}`);
  console.log(`Total duplicate records to delete: ${totalDuplicates}`);
  console.log(`  - יְהִי duplicates: ${yehiWords.length - 1}`);
  if (otherDuplicates.length > 0) {
    console.log(`  - Other duplicates: ${otherDuplicates.reduce((sum, [_, words]) => sum + words.length - 1, 0)}`);
  }
  console.log(`\nAfter cleanup, Genesis 1:6 will have ${allWords.length - totalDuplicates} unique words\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

analyzeGenesis1_6().catch(console.error);
