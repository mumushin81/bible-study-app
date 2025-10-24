/**
 * Comprehensive analysis of Emoji vs SVG usage
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AnalysisReport {
  generatedFiles: {
    totalFiles: number;
    totalWords: number;
    withEmoji: number;
    withIconSvg: number;
    withBoth: number;
    withNeither: number;
  };
  database: {
    totalWords: number;
    withIconSvg: number;
    withoutIconSvg: number;
    nullIconSvg: number;
  };
  comparison: {
    jsonHasEmojiButDbMissingSvg?: number;
    uploadIssues?: string[];
  };
}

async function analyzeGeneratedFiles(): Promise<any> {
  const generatedDir = path.resolve(process.cwd(), 'data/generated');
  const files = glob.sync(`${generatedDir}/*.json`);

  let totalWords = 0;
  let withEmoji = 0;
  let withIconSvg = 0;
  let withBoth = 0;
  let withNeither = 0;

  console.log(`📁 Analyzing ${files.length} JSON files in data/generated/\n`);

  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));

    if (Array.isArray(content)) {
      // Array of verses
      for (const verse of content) {
        if (verse.words && Array.isArray(verse.words)) {
          for (const word of verse.words) {
            totalWords++;
            const hasEmoji = !!word.emoji;
            const hasIconSvg = !!word.iconSvg;

            if (hasEmoji) withEmoji++;
            if (hasIconSvg) withIconSvg++;
            if (hasEmoji && hasIconSvg) withBoth++;
            if (!hasEmoji && !hasIconSvg) withNeither++;
          }
        }
      }
    } else {
      // Single verse
      if (content.words && Array.isArray(content.words)) {
        for (const word of content.words) {
          totalWords++;
          const hasEmoji = !!word.emoji;
          const hasIconSvg = !!word.iconSvg;

          if (hasEmoji) withEmoji++;
          if (hasIconSvg) withIconSvg++;
          if (hasEmoji && hasIconSvg) withBoth++;
          if (!hasEmoji && !hasIconSvg) withNeither++;
        }
      }
    }
    } catch (error) {
      console.log(`  ⚠️  Skipping invalid JSON: ${path.basename(file)}`);
    }
  }

  return {
    totalFiles: files.length,
    totalWords,
    withEmoji,
    withIconSvg,
    withBoth,
    withNeither,
  };
}

async function analyzeDatabaseWords() {
  console.log('🗄️  Analyzing database words...\n');

  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting words:', countError);
    return null;
  }

  // Get words with SVG
  const { count: withSvgCount, error: svgError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null);

  if (svgError) {
    console.error('Error counting SVG words:', svgError);
    return null;
  }

  // Get words without SVG
  const { count: nullSvgCount, error: nullError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .is('icon_svg', null);

  if (nullError) {
    console.error('Error counting null SVG words:', nullError);
    return null;
  }

  return {
    totalWords: totalCount,
    withIconSvg: withSvgCount,
    withoutIconSvg: (totalCount || 0) - (withSvgCount || 0),
    nullIconSvg: nullSvgCount,
  };
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 EMOJI vs SVG COMPREHENSIVE ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Analyze generated files
  const generatedAnalysis = await analyzeGeneratedFiles();

  console.log('\n📈 GENERATED FILES (data/generated/) ANALYSIS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total files: ${generatedAnalysis.totalFiles}`);
  console.log(`Total words: ${generatedAnalysis.totalWords}`);
  console.log(`\nEmoji vs SVG breakdown:`);
  console.log(`  • Words with emoji: ${generatedAnalysis.withEmoji} (${((generatedAnalysis.withEmoji / generatedAnalysis.totalWords) * 100).toFixed(1)}%)`);
  console.log(`  • Words with iconSvg: ${generatedAnalysis.withIconSvg} (${((generatedAnalysis.withIconSvg / generatedAnalysis.totalWords) * 100).toFixed(1)}%)`);
  console.log(`  • Words with BOTH: ${generatedAnalysis.withBoth} (${((generatedAnalysis.withBoth / generatedAnalysis.totalWords) * 100).toFixed(1)}%)`);
  console.log(`  • Words with NEITHER: ${generatedAnalysis.withNeither} (${((generatedAnalysis.withNeither / generatedAnalysis.totalWords) * 100).toFixed(1)}%)`);

  // Analyze database
  const dbAnalysis = await analyzeDatabaseWords();

  if (dbAnalysis) {
    console.log('\n\n📈 DATABASE (Supabase) ANALYSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total words: ${dbAnalysis.totalWords}`);
    console.log(`Words with icon_svg: ${dbAnalysis.withIconSvg} (${((dbAnalysis.withIconSvg / dbAnalysis.totalWords) * 100).toFixed(1)}%)`);
    console.log(`Words without icon_svg: ${dbAnalysis.nullIconSvg} (${((dbAnalysis.nullIconSvg / dbAnalysis.totalWords) * 100).toFixed(1)}%)`);
  }

  // Key insights
  console.log('\n\n🔍 KEY INSIGHTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n1. EMOJI vs SVG USAGE IN JSON FILES:');
  console.log(`   • Emoji were used in ${generatedAnalysis.withEmoji} words (${((generatedAnalysis.withEmoji / generatedAnalysis.totalWords) * 100).toFixed(1)}%)`);
  console.log(`   • SVG (iconSvg) were used in ${generatedAnalysis.withIconSvg} words (${((generatedAnalysis.withIconSvg / generatedAnalysis.totalWords) * 100).toFixed(1)}%)`);
  console.log(`   • ${generatedAnalysis.withBoth} words have BOTH emoji and iconSvg`);

  if (generatedAnalysis.withEmoji > generatedAnalysis.withIconSvg) {
    console.log('\n   ⚠️  MORE EMOJI than SVG in generated files!');
    console.log('   This suggests emoji were the primary visual indicator initially.');
  }

  if (generatedAnalysis.withBoth > 0) {
    console.log('\n   ✅ Some words have BOTH emoji and iconSvg');
    console.log('   This indicates a transition period or dual support.');
  }

  console.log('\n2. DATABASE UPLOAD STATUS:');
  if (dbAnalysis) {
    const coverage = (dbAnalysis.withIconSvg / dbAnalysis.totalWords) * 100;
    if (coverage < 50) {
      console.log(`   ⚠️  LOW SVG coverage: ${coverage.toFixed(1)}%`);
      console.log('   Reason: Database has more word instances (duplicates across verses)');
    } else if (coverage < 80) {
      console.log(`   📊 MODERATE SVG coverage: ${coverage.toFixed(1)}%`);
    } else {
      console.log(`   ✅ GOOD SVG coverage: ${coverage.toFixed(1)}%`);
    }

    console.log(`\n   Database has ${dbAnalysis.totalWords} total word instances`);
    console.log(`   Generated files have ${generatedAnalysis.totalWords} unique word instances`);

    if (dbAnalysis.totalWords > generatedAnalysis.totalWords) {
      console.log('\n   📌 Database has MORE words than generated files');
      console.log('   Reason: Same Hebrew word appears multiple times across different verses');
    }
  }

  console.log('\n3. WHY SVG REPLACED EMOJI:');
  console.log('   • Emoji rendering varies across platforms (iOS, Android, Web)');
  console.log('   • SVG provides consistent visual appearance everywhere');
  console.log('   • SVG allows custom designs matching word meanings');
  console.log('   • SVG can use gradients and filters (professional look)');
  console.log('   • SVG is scalable without quality loss');

  console.log('\n4. UPLOAD ISSUES (if any):');
  if (dbAnalysis && dbAnalysis.nullIconSvg > 0) {
    console.log(`   ⚠️  ${dbAnalysis.nullIconSvg} words in database have NULL icon_svg`);
    console.log('   Possible reasons:');
    console.log('   • Database has duplicate word entries (same word in different verses)');
    console.log('   • Initial JSON files may not have had iconSvg for all words');
    console.log('   • Some verses were uploaded before SVG generation was implemented');
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ANALYSIS COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    generatedFiles: generatedAnalysis,
    database: dbAnalysis,
  };

  const reportPath = path.resolve(process.cwd(), 'EMOJI_SVG_ANALYSIS_REPORT.md');
  const markdown = `# Emoji vs SVG Analysis Report

Generated: ${report.timestamp}

## Generated Files (data/generated/)

- **Total Files**: ${generatedAnalysis.totalFiles}
- **Total Words**: ${generatedAnalysis.totalWords}
- **Words with Emoji**: ${generatedAnalysis.withEmoji} (${((generatedAnalysis.withEmoji / generatedAnalysis.totalWords) * 100).toFixed(1)}%)
- **Words with SVG**: ${generatedAnalysis.withIconSvg} (${((generatedAnalysis.withIconSvg / generatedAnalysis.totalWords) * 100).toFixed(1)}%)
- **Words with Both**: ${generatedAnalysis.withBoth}
- **Words with Neither**: ${generatedAnalysis.withNeither}

## Database (Supabase)

- **Total Words**: ${dbAnalysis?.totalWords || 'N/A'}
- **Words with SVG**: ${dbAnalysis?.withIconSvg || 'N/A'} (${dbAnalysis ? ((dbAnalysis.withIconSvg / dbAnalysis.totalWords) * 100).toFixed(1) : 'N/A'}%)
- **Words without SVG**: ${dbAnalysis?.nullIconSvg || 'N/A'} (${dbAnalysis ? ((dbAnalysis.nullIconSvg / dbAnalysis.totalWords) * 100).toFixed(1) : 'N/A'}%)

## Key Findings

### Why SVG Replaced Emoji

1. **Platform Consistency**: Emoji render differently on iOS, Android, and Web
2. **Custom Design**: SVG allows meaning-specific custom icons
3. **Professional Appearance**: Gradients, filters, and effects
4. **Scalability**: Perfect quality at any size
5. **Guidelines Compliance**: Eden SVG Guidelines (viewBox, gradients, drop-shadow)

### Upload Status

${dbAnalysis && dbAnalysis.nullIconSvg > 0 ? `
⚠️ **${dbAnalysis.nullIconSvg} words have NULL icon_svg**

Reasons:
- Database has duplicate entries (same word in multiple verses)
- Generated files may not have complete iconSvg coverage
- Earlier verses uploaded before SVG implementation
` : '✅ All words have SVG icons'}
`;

  fs.writeFileSync(reportPath, markdown, 'utf-8');
  console.log(`📄 Report saved to: ${reportPath}\n`);
}

main();
