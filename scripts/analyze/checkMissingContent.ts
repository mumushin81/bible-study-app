/**
 * Check Missing Content in Genesis 1-15
 *
 * Purpose: Identify missing verses and incomplete word content
 */

import fs from 'fs';
import path from 'path';

const UNIFIED_DIR = path.join(process.cwd(), 'data', 'unified_verses');

// Expected verse counts per chapter in Genesis
const EXPECTED_VERSES: { [chapter: number]: number } = {
  1: 31,
  2: 25,
  3: 24,
  4: 26,
  5: 32,
  6: 22,
  7: 24,
  8: 22,
  9: 29,
  10: 32,
  11: 32,
  12: 20,
  13: 18,
  14: 24,
  15: 21,
};

interface MissingVerse {
  chapter: number;
  verse: number;
  id: string;
}

interface IncompleteVerse {
  id: string;
  reference: string;
  issues: string[];
  wordCount: number;
  emptyWords: number;
}

interface AnalysisResult {
  totalExpected: number;
  totalFound: number;
  missingVerses: MissingVerse[];
  incompleteVerses: IncompleteVerse[];
  completeVerses: number;
}

/**
 * Get expected verse IDs for Genesis 1-15
 */
function getExpectedVerses(): Set<string> {
  const expected = new Set<string>();

  for (let chapter = 1; chapter <= 15; chapter++) {
    const verseCount = EXPECTED_VERSES[chapter];
    for (let verse = 1; verse <= verseCount; verse++) {
      expected.add(`genesis_${chapter}_${verse}`);
    }
  }

  return expected;
}

/**
 * Get existing verse IDs from files
 */
function getExistingVerses(): Set<string> {
  const existing = new Set<string>();

  if (!fs.existsSync(UNIFIED_DIR)) {
    return existing;
  }

  const files = fs.readdirSync(UNIFIED_DIR);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const match = file.match(/genesis_(\d+)_(\d+)\.json/);
    if (match) {
      const chapter = parseInt(match[1], 10);
      if (chapter >= 1 && chapter <= 15) {
        const id = file.replace('.json', '');
        existing.add(id);
      }
    }
  }

  return existing;
}

/**
 * Check if verse content is complete
 */
function checkVerseCompleteness(verseId: string): IncompleteVerse | null {
  const filePath = path.join(UNIFIED_DIR, `${verseId}.json`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const verse = JSON.parse(content);

    const issues: string[] = [];

    // Check verse-level fields
    if (!verse.hebrew || verse.hebrew.trim() === '') {
      issues.push('Missing hebrew text');
    }
    if (!verse.ipa || verse.ipa.trim() === '') {
      issues.push('Missing IPA pronunciation');
    }
    if (!verse.koreanPronunciation || verse.koreanPronunciation.trim() === '') {
      issues.push('Missing Korean pronunciation');
    }
    if (!verse.modern || verse.modern.trim() === '') {
      issues.push('Missing modern translation');
    }

    // Check words array
    if (!verse.words || !Array.isArray(verse.words) || verse.words.length === 0) {
      issues.push('No words data');
      return {
        id: verseId,
        reference: verse.reference || verseId,
        issues,
        wordCount: 0,
        emptyWords: 0,
      };
    }

    // Check each word
    let emptyWords = 0;
    verse.words.forEach((word: any, index: number) => {
      const wordIssues: string[] = [];

      if (!word.hebrew || word.hebrew.trim() === '') wordIssues.push('hebrew');
      if (!word.meaning || word.meaning.trim() === '') wordIssues.push('meaning');
      if (!word.ipa || word.ipa.trim() === '') wordIssues.push('ipa');
      if (!word.korean || word.korean.trim() === '') wordIssues.push('korean');
      if (!word.root || word.root.trim() === '') wordIssues.push('root');
      if (!word.grammar || word.grammar.trim() === '') wordIssues.push('grammar');

      if (wordIssues.length > 0) {
        emptyWords++;
        issues.push(`Word ${index + 1}: missing ${wordIssues.join(', ')}`);
      }
    });

    if (issues.length > 0) {
      return {
        id: verseId,
        reference: verse.reference || verseId,
        issues,
        wordCount: verse.words.length,
        emptyWords,
      };
    }

    return null;
  } catch (error) {
    return {
      id: verseId,
      reference: verseId,
      issues: [`Error reading file: ${error}`],
      wordCount: 0,
      emptyWords: 0,
    };
  }
}

/**
 * Analyze Genesis 1-15 content
 */
function analyzeContent(): AnalysisResult {
  const expected = getExpectedVerses();
  const existing = getExistingVerses();

  // Find missing verses
  const missingVerses: MissingVerse[] = [];
  for (const verseId of expected) {
    if (!existing.has(verseId)) {
      const parts = verseId.split('_');
      missingVerses.push({
        chapter: parseInt(parts[1], 10),
        verse: parseInt(parts[2], 10),
        id: verseId,
      });
    }
  }

  // Check completeness of existing verses
  const incompleteVerses: IncompleteVerse[] = [];
  let completeVerses = 0;

  for (const verseId of existing) {
    const result = checkVerseCompleteness(verseId);
    if (result) {
      incompleteVerses.push(result);
    } else {
      completeVerses++;
    }
  }

  return {
    totalExpected: expected.size,
    totalFound: existing.size,
    missingVerses,
    incompleteVerses,
    completeVerses,
  };
}

/**
 * Generate detailed report
 */
function generateReport(result: AnalysisResult): void {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 GENESIS 1-15 CONTENT ANALYSIS`);
  console.log(`${'='.repeat(70)}\n`);

  // Overall statistics
  console.log(`📈 Overall Statistics:`);
  console.log(`   Total expected verses: ${result.totalExpected}`);
  console.log(`   Total found verses: ${result.totalFound}`);
  console.log(`   Complete verses: ${result.completeVerses}`);
  console.log(`   Incomplete verses: ${result.incompleteVerses.length}`);
  console.log(`   Missing verses: ${result.missingVerses.length}\n`);

  // Chapter breakdown
  console.log(`📖 Chapter Breakdown:\n`);
  for (let chapter = 1; chapter <= 15; chapter++) {
    const expected = EXPECTED_VERSES[chapter];
    const found = result.totalFound > 0 ?
      Array.from(Array(expected).keys())
        .map(i => `genesis_${chapter}_${i + 1}`)
        .filter(id => {
          const filePath = path.join(UNIFIED_DIR, `${id}.json`);
          return fs.existsSync(filePath);
        }).length : 0;

    const missing = expected - found;
    const status = missing === 0 ? '✅' : '⚠️';
    console.log(`   ${status} Chapter ${chapter}: ${found}/${expected} verses`);
  }

  // Missing verses
  if (result.missingVerses.length > 0) {
    console.log(`\n\n❌ Missing Verses (${result.missingVerses.length}):\n`);

    // Group by chapter
    const byChapter: { [key: number]: MissingVerse[] } = {};
    result.missingVerses.forEach(mv => {
      if (!byChapter[mv.chapter]) byChapter[mv.chapter] = [];
      byChapter[mv.chapter].push(mv);
    });

    Object.keys(byChapter).sort((a, b) => parseInt(a) - parseInt(b)).forEach(chapterStr => {
      const chapter = parseInt(chapterStr);
      const verses = byChapter[chapter];
      const verseNumbers = verses.map(v => v.verse).sort((a, b) => a - b);
      console.log(`   Chapter ${chapter}: verses ${verseNumbers.join(', ')}`);
    });
  } else {
    console.log(`\n\n✅ No missing verses!\n`);
  }

  // Incomplete verses
  if (result.incompleteVerses.length > 0) {
    console.log(`\n\n⚠️  Incomplete Verses (${result.incompleteVerses.length}):\n`);

    result.incompleteVerses.slice(0, 20).forEach(iv => {
      console.log(`   ${iv.reference} (${iv.id})`);
      console.log(`      Words: ${iv.wordCount}, Empty: ${iv.emptyWords}`);
      console.log(`      Issues: ${iv.issues.slice(0, 3).join('; ')}`);
      if (iv.issues.length > 3) {
        console.log(`      ... and ${iv.issues.length - 3} more issues`);
      }
      console.log();
    });

    if (result.incompleteVerses.length > 20) {
      console.log(`   ... and ${result.incompleteVerses.length - 20} more incomplete verses\n`);
    }
  } else {
    console.log(`\n\n✅ All verses are complete!\n`);
  }

  console.log(`${'='.repeat(70)}\n`);

  // Summary for action
  const totalIssues = result.missingVerses.length + result.incompleteVerses.length;

  if (totalIssues === 0) {
    console.log(`🎉 EXCELLENT! All Genesis 1-15 content is complete and ready!\n`);
  } else {
    console.log(`📋 ACTION NEEDED:\n`);
    if (result.missingVerses.length > 0) {
      console.log(`   1. Generate ${result.missingVerses.length} missing verses`);
    }
    if (result.incompleteVerses.length > 0) {
      console.log(`   2. Complete ${result.incompleteVerses.length} incomplete verses`);
    }
    console.log(`\n   Total items to fix: ${totalIssues}\n`);
  }
}

/**
 * Save detailed results to JSON
 */
function saveResults(result: AnalysisResult): void {
  const outputPath = path.join(process.cwd(), 'MISSING_CONTENT_REPORT.json');

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalExpected: result.totalExpected,
      totalFound: result.totalFound,
      completeVerses: result.completeVerses,
      incompleteVerses: result.incompleteVerses.length,
      missingVerses: result.missingVerses.length,
      totalIssues: result.missingVerses.length + result.incompleteVerses.length,
    },
    missingVerses: result.missingVerses,
    incompleteVerses: result.incompleteVerses,
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`💾 Detailed report saved to: MISSING_CONTENT_REPORT.json\n`);
}

/**
 * Main function
 */
async function main() {
  console.log(`\n�� Analyzing Genesis 1-15 content...\n`);

  const result = analyzeContent();
  generateReport(result);
  saveResults(result);
}

main();
