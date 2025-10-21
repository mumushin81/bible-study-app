import * as fs from 'fs';
import * as path from 'path';

interface Word {
  hebrew: string;
  meaning: string;
  emoji?: string;
  iconSvg?: string;
  [key: string]: any;
}

interface VerseData {
  id?: string;
  verse_id?: string;
  words?: Word[];
  [key: string]: any;
}

interface FileAnalysis {
  fileName: string;
  hasId: boolean;
  hasVerseId: boolean;
  totalWords: number;
  wordsWithIconSvg: number;
  wordsWithEmoji: number;
  wordsWithBoth: number;
  wordsWithNeither: number;
}

const GENERATED_V2_DIR = path.join(process.cwd(), 'data', 'generated_v2');

async function analyzeFiles() {
  const files = fs.readdirSync(GENERATED_V2_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  const analyses: FileAnalysis[] = [];

  for (const file of files) {
    const filePath = path.join(GENERATED_V2_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data: VerseData = JSON.parse(content);

    const analysis: FileAnalysis = {
      fileName: file,
      hasId: !!data.id,
      hasVerseId: !!data.verse_id,
      totalWords: 0,
      wordsWithIconSvg: 0,
      wordsWithEmoji: 0,
      wordsWithBoth: 0,
      wordsWithNeither: 0,
    };

    if (data.words && Array.isArray(data.words)) {
      analysis.totalWords = data.words.length;

      for (const word of data.words) {
        const hasIconSvg = !!word.iconSvg;
        const hasEmoji = !!word.emoji;

        if (hasIconSvg && hasEmoji) {
          analysis.wordsWithBoth++;
        } else if (hasIconSvg) {
          analysis.wordsWithIconSvg++;
        } else if (hasEmoji) {
          analysis.wordsWithEmoji++;
        } else {
          analysis.wordsWithNeither++;
        }
      }
    }

    analyses.push(analysis);
  }

  // Summary statistics
  const totalFiles = analyses.length;
  const filesWithId = analyses.filter(a => a.hasId).length;
  const filesWithoutId = analyses.filter(a => !a.hasId).length;
  const filesWithVerseId = analyses.filter(a => a.hasVerseId).length;

  const totalWords = analyses.reduce((sum, a) => sum + a.totalWords, 0);
  const totalIconSvg = analyses.reduce((sum, a) => sum + a.wordsWithIconSvg, 0);
  const totalEmoji = analyses.reduce((sum, a) => sum + a.wordsWithEmoji, 0);
  const totalBoth = analyses.reduce((sum, a) => sum + a.wordsWithBoth, 0);
  const totalNeither = analyses.reduce((sum, a) => sum + a.wordsWithNeither, 0);

  console.log('='.repeat(80));
  console.log('GENERATED_V2 JSON FILES ANALYSIS');
  console.log('='.repeat(80));
  console.log();

  console.log('📊 FILE SUMMARY:');
  console.log(`   Total files: ${totalFiles}`);
  console.log(`   Files WITH "id": ${filesWithId}`);
  console.log(`   Files WITHOUT "id": ${filesWithoutId}`);
  console.log(`   Files with "verse_id": ${filesWithVerseId}`);
  console.log();

  console.log('📝 WORD FIELD SUMMARY:');
  console.log(`   Total words: ${totalWords}`);
  console.log(`   Words with BOTH iconSvg & emoji: ${totalBoth} (${((totalBoth / totalWords) * 100).toFixed(1)}%)`);
  console.log(`   Words with ONLY iconSvg: ${totalIconSvg} (${((totalIconSvg / totalWords) * 100).toFixed(1)}%)`);
  console.log(`   Words with ONLY emoji: ${totalEmoji} (${((totalEmoji / totalWords) * 100).toFixed(1)}%)`);
  console.log(`   Words with NEITHER: ${totalNeither} (${((totalNeither / totalWords) * 100).toFixed(1)}%)`);
  console.log();

  const iconSvgCoverage = ((totalBoth + totalIconSvg) / totalWords) * 100;
  const emojiCoverage = ((totalBoth + totalEmoji) / totalWords) * 100;

  console.log('📈 COVERAGE:');
  console.log(`   IconSvg coverage: ${iconSvgCoverage.toFixed(1)}%`);
  console.log(`   Emoji coverage: ${emojiCoverage.toFixed(1)}%`);
  console.log();

  // Files needing fixes
  const filesNeedingIdFix = analyses.filter(a => !a.hasId);

  if (filesNeedingIdFix.length > 0) {
    console.log('🔧 FILES NEEDING ID FIX:');
    filesNeedingIdFix.forEach(a => {
      const idValue = a.hasVerseId ? `(has verse_id)` : `(no id field)`;
      console.log(`   - ${a.fileName} ${idValue}`);
    });
    console.log();
  }

  // Files with inconsistent word fields
  const filesWithInconsistentWords = analyses.filter(a =>
    a.wordsWithEmoji > 0 || a.wordsWithNeither > 0
  );

  if (filesWithInconsistentWords.length > 0) {
    console.log('⚠️  FILES WITH WORDS MISSING iconSvg:');
    filesWithInconsistentWords.forEach(a => {
      if (a.wordsWithNeither > 0 || a.wordsWithEmoji > 0) {
        console.log(`   - ${a.fileName}:`);
        console.log(`     Total: ${a.totalWords}, Both: ${a.wordsWithBoth}, IconSvg only: ${a.wordsWithIconSvg}, Emoji only: ${a.wordsWithEmoji}, Neither: ${a.wordsWithNeither}`);
      }
    });
    console.log();
  }

  console.log('💡 RECOMMENDATION:');
  if (iconSvgCoverage >= 95) {
    console.log('   ✅ IconSvg coverage is excellent (>95%)');
    console.log('   ✅ SAFE to remove emoji field from all words');
    console.log('   ✅ Application should use iconSvg exclusively');
  } else if (iconSvgCoverage >= 80) {
    console.log('   ⚠️  IconSvg coverage is good but not complete');
    console.log('   ⚠️  Consider keeping emoji as fallback until 100% iconSvg coverage');
  } else {
    console.log('   ❌ IconSvg coverage is LOW');
    console.log('   ❌ DO NOT remove emoji field yet');
    console.log('   ❌ Need to add iconSvg to more words first');
  }
  console.log();

  // Detailed file list (optional)
  console.log('📋 DETAILED FILE LIST:');
  console.log();
  analyses.forEach(a => {
    const idStatus = a.hasId ? '✅' : (a.hasVerseId ? '⚠️ verse_id' : '❌');
    const wordStatus = a.wordsWithBoth === a.totalWords ? '✅' :
                       (a.wordsWithBoth + a.wordsWithIconSvg) === a.totalWords ? '🔶' : '❌';
    console.log(`${idStatus} ${wordStatus} ${a.fileName}`);
    if (a.totalWords > 0) {
      console.log(`     Words: ${a.totalWords}, Both: ${a.wordsWithBoth}, IconSvg: ${a.wordsWithIconSvg}, Emoji: ${a.wordsWithEmoji}, Neither: ${a.wordsWithNeither}`);
    }
  });

  console.log();
  console.log('Legend:');
  console.log('  ID Status: ✅ = has "id", ⚠️ = has "verse_id", ❌ = missing id');
  console.log('  Word Status: ✅ = all words have both, 🔶 = all have iconSvg, ❌ = missing iconSvg');
}

analyzeFiles().catch(console.error);
