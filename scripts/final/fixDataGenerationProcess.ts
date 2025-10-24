/**
 * FIX DATA GENERATION PROCESS
 *
 * Updates all data generation scripts to use UPSERT instead of INSERT
 * to prevent duplicate creation.
 *
 * Features:
 * - Analyzes existing data generation scripts
 * - Identifies INSERT operations
 * - Provides fix recommendations
 * - Can auto-update scripts (with backup)
 *
 * Usage:
 *   npx tsx scripts/final/fixDataGenerationProcess.ts [--analyze-only] [--auto-fix]
 *
 * Options:
 *   --analyze-only: Just analyze, don't fix anything
 *   --auto-fix: Automatically update scripts (creates backups)
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScriptAnalysis {
  filePath: string;
  hasInsert: boolean;
  hasUpsert: boolean;
  hasDelete: boolean;
  insertCount: number;
  lines: Array<{
    lineNumber: number;
    content: string;
    issue: string;
  }>;
  recommendation: string;
}

function printHeader(title: string) {
  const line = '='.repeat(70);
  console.log(line);
  console.log(title);
  console.log(line);
}

function analyzeScript(filePath: string): ScriptAnalysis {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const analysis: ScriptAnalysis = {
    filePath,
    hasInsert: false,
    hasUpsert: false,
    hasDelete: false,
    insertCount: 0,
    lines: [],
    recommendation: ''
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for .insert() calls
    if (/\.insert\s*\(/.test(line) && !line.includes('//')) {
      analysis.hasInsert = true;
      analysis.insertCount++;
      analysis.lines.push({
        lineNumber: index + 1,
        content: trimmed,
        issue: 'Uses .insert() - should use .upsert()'
      });
    }

    // Check for .upsert() calls
    if (/\.upsert\s*\(/.test(line)) {
      analysis.hasUpsert = true;
    }

    // Check for .delete() calls
    if (/\.delete\s*\(/.test(line)) {
      analysis.hasDelete = true;
    }
  });

  // Generate recommendation
  if (analysis.hasInsert && !analysis.hasDelete) {
    analysis.recommendation = 'CRITICAL: Replace .insert() with .upsert() or add .delete() before insert';
  } else if (analysis.hasInsert && analysis.hasDelete) {
    analysis.recommendation = 'GOOD: Has delete before insert, but consider using .upsert() for atomicity';
  } else if (analysis.hasUpsert) {
    analysis.recommendation = 'EXCELLENT: Already using .upsert()';
  } else {
    analysis.recommendation = 'OK: No insert operations found';
  }

  return analysis;
}

function findScriptsToAnalyze(): string[] {
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const scripts: string[] = [];

  function walkDir(dir: string) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', 'archive', 'debug', 'final'].includes(file)) {
          walkDir(filePath);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        // Only include scripts that likely interact with database
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('supabase') && content.includes('words')) {
          scripts.push(filePath);
        }
      }
    });
  }

  walkDir(scriptsDir);
  return scripts;
}

function generateUpsertExample(): string {
  return `
// ❌ BAD: Using insert (can create duplicates)
const { error } = await supabase
  .from('words')
  .insert(wordsData);

// ✅ GOOD: Using upsert (prevents duplicates)
const { error } = await supabase
  .from('words')
  .upsert(wordsData, {
    onConflict: 'hebrew,verse_id',
    ignoreDuplicates: false  // Update if exists
  });

// ✅ ALSO GOOD: Delete then insert (but less efficient)
await supabase.from('words').delete().eq('verse_id', verseId);
const { error } = await supabase.from('words').insert(wordsData);
  `.trim();
}

function createBackup(filePath: string): string {
  const backupDir = path.join(process.cwd(), 'backups', 'scripts');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);

  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function autoFixScript(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let modified = content;
    let changesMade = 0;

    // Pattern 1: Simple insert to upsert
    // Replace .insert( with .upsert(
    const insertPattern = /\.insert\s*\(/g;
    if (insertPattern.test(content)) {
      // Check if there's already a delete before insert
      if (!content.includes('.delete()')) {
        modified = modified.replace(
          /\.insert\s*\(/g,
          '.upsert('
        );

        // Add onConflict option if words table
        if (content.includes("'words'")) {
          // This is a simplified replacement - might need manual review
          console.log('   ⚠️  Note: You may need to add onConflict option manually');
        }

        changesMade++;
      }
    }

    if (changesMade > 0) {
      const backupPath = createBackup(filePath);
      fs.writeFileSync(filePath, modified);
      console.log(`   ✅ Fixed ${changesMade} issues`);
      console.log(`   📦 Backup: ${backupPath}`);
      return true;
    }

    return false;
  } catch (error: any) {
    console.error(`   ❌ Error fixing script: ${error.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const analyzeOnly = args.includes('--analyze-only');
  const autoFix = args.includes('--auto-fix');

  printHeader('🔧 DATA GENERATION PROCESS ANALYZER');
  console.log(`Mode: ${autoFix ? 'Auto-Fix' : analyzeOnly ? 'Analyze Only' : 'Analyze & Recommend'}\n`);

  console.log('🔍 Finding scripts to analyze...\n');
  const scripts = findScriptsToAnalyze();
  console.log(`Found ${scripts.length} scripts that interact with database\n`);

  const analyses: ScriptAnalysis[] = [];
  let criticalCount = 0;

  console.log('='.repeat(70));
  console.log('ANALYSIS RESULTS');
  console.log('='.repeat(70) + '\n');

  for (const scriptPath of scripts) {
    const relativePath = path.relative(process.cwd(), scriptPath);
    const analysis = analyzeScript(scriptPath);
    analyses.push(analysis);

    if (analysis.hasInsert && !analysis.hasDelete) {
      criticalCount++;
      console.log(`❌ CRITICAL: ${relativePath}`);
    } else if (analysis.hasInsert && analysis.hasDelete) {
      console.log(`⚠️  WARNING: ${relativePath}`);
    } else if (analysis.hasUpsert) {
      console.log(`✅ GOOD: ${relativePath}`);
    } else {
      console.log(`ℹ️  INFO: ${relativePath}`);
    }

    console.log(`   ${analysis.recommendation}`);

    if (analysis.lines.length > 0) {
      analysis.lines.slice(0, 3).forEach(line => {
        console.log(`   Line ${line.lineNumber}: ${line.issue}`);
      });
      if (analysis.lines.length > 3) {
        console.log(`   ... and ${analysis.lines.length - 3} more issues`);
      }
    }

    // Auto-fix if enabled
    if (autoFix && analysis.hasInsert && !analysis.hasDelete) {
      console.log(`   🔧 Attempting to fix...`);
      autoFixScript(scriptPath);
    }

    console.log('');
  }

  // Summary
  printHeader('SUMMARY');
  console.log(`Total Scripts Analyzed: ${analyses.length}`);
  console.log(`Critical Issues: ${criticalCount}`);
  console.log(`Scripts Using Upsert: ${analyses.filter(a => a.hasUpsert).length}`);
  console.log(`Scripts Using Delete+Insert: ${analyses.filter(a => a.hasDelete && a.hasInsert).length}`);

  if (criticalCount > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  RECOMMENDED ACTIONS');
    console.log('='.repeat(70));
    console.log('1. Review scripts marked as CRITICAL');
    console.log('2. Update .insert() to .upsert() with proper onConflict');
    console.log('3. Test updated scripts thoroughly');
    console.log('4. Add unique constraints to prevent duplicates at DB level');
    console.log('\n📖 Example Usage:');
    console.log(generateUpsertExample());
  }

  if (!autoFix && criticalCount > 0) {
    console.log('\n💡 Run with --auto-fix to automatically update scripts');
    console.log('   (Backups will be created automatically)');
  }

  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
