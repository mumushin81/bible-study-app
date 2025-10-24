/**
 * ADD UNIQUE CONSTRAINT SCRIPT
 *
 * This script adds a UNIQUE constraint to prevent future duplicates.
 *
 * Features:
 * - Checks for existing duplicates before adding constraint
 * - Verifies existing constraints
 * - Creates migration file for version control
 * - Includes rollback procedure
 * - Safe execution with pre-flight checks
 *
 * Usage:
 *   npx tsx scripts/final/addUniqueConstraint.ts [--force] [--rollback]
 *
 * Options:
 *   --force: Add constraint even if duplicates exist (will fail but show error)
 *   --rollback: Remove the unique constraint
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CONSTRAINT_NAME = 'words_hebrew_verse_unique';

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

async function checkDuplicates(): Promise<boolean> {
  printSection('🔍 Pre-flight Check: Checking for Duplicates');

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id');

  if (error) {
    console.error('❌ Failed to fetch words:', error.message);
    return false;
  }

  const groupMap = new Map<string, number>();
  words?.forEach((word) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    groupMap.set(key, (groupMap.get(key) || 0) + 1);
  });

  const duplicates = Array.from(groupMap.values()).filter(count => count > 1);

  console.log(`Total words: ${words?.length || 0}`);
  console.log(`Unique combinations: ${groupMap.size}`);
  console.log(`Duplicate combinations: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('\n⚠️  WARNING: Duplicates still exist!');
    console.log('   Adding unique constraint will fail.');
    console.log('   Run finalDuplicateRemoval.ts first to clean the database.');
    return false;
  }

  console.log('\n✅ No duplicates found. Safe to proceed.');
  return true;
}

async function checkExistingConstraint(): Promise<boolean> {
  printSection('📋 Checking Existing Constraints');

  // Query PostgreSQL system tables for constraint info
  const { data, error } = await supabase.rpc('get_table_constraints', {
    table_name: 'words'
  });

  // If RPC doesn't exist, we'll check differently
  if (error) {
    console.log('ℹ️  Custom RPC not available, using alternative method...');

    // Try to query constraint directly
    const { data: constraintCheck, error: constraintError } = await supabase
      .from('words')
      .select('id')
      .limit(1);

    if (constraintError && constraintError.message.includes(CONSTRAINT_NAME)) {
      console.log(`✅ Constraint '${CONSTRAINT_NAME}' already exists`);
      return true;
    }

    console.log('ℹ️  Cannot determine constraint existence definitively');
    console.log('   Will attempt to add constraint (will fail gracefully if exists)');
    return false;
  }

  const hasConstraint = data?.some((c: any) => c.constraint_name === CONSTRAINT_NAME);

  if (hasConstraint) {
    console.log(`✅ Constraint '${CONSTRAINT_NAME}' already exists`);
  } else {
    console.log(`ℹ️  Constraint '${CONSTRAINT_NAME}' does not exist`);
  }

  return hasConstraint;
}

async function addConstraint(): Promise<boolean> {
  printSection('➕ Adding Unique Constraint');

  const sql = `
ALTER TABLE words
ADD CONSTRAINT ${CONSTRAINT_NAME}
UNIQUE (hebrew, verse_id);
  `.trim();

  console.log('\nExecuting SQL:');
  console.log(sql);
  console.log('');

  try {
    // For Supabase, we need to use the SQL editor or create a migration
    // We'll create a migration file instead
    const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const migrationFile = path.join(migrationDir, `${timestamp}_add_words_unique_constraint.sql`);

    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    const migrationContent = `-- Add unique constraint to prevent duplicate words
-- Created: ${new Date().toISOString()}
-- Purpose: Ensure (hebrew, verse_id) combinations are unique

${sql}

-- Rollback:
-- ALTER TABLE words DROP CONSTRAINT IF EXISTS ${CONSTRAINT_NAME};
`;

    fs.writeFileSync(migrationFile, migrationContent);

    console.log(`✅ Migration file created: ${migrationFile}`);
    console.log('\nℹ️  To apply this migration:');
    console.log('   1. Using Supabase CLI: supabase db push');
    console.log('   2. Using Supabase Dashboard: SQL Editor → Paste SQL → Run');
    console.log('\n⚠️  Manual execution required!');
    console.log('   Copy the SQL from the migration file and run it in Supabase Dashboard.');

    return true;
  } catch (error: any) {
    console.error('❌ Failed to create migration:', error.message);
    return false;
  }
}

async function removeConstraint(): Promise<boolean> {
  printSection('➖ Removing Unique Constraint');

  const sql = `
ALTER TABLE words
DROP CONSTRAINT IF EXISTS ${CONSTRAINT_NAME};
  `.trim();

  console.log('\nExecuting SQL (Rollback):');
  console.log(sql);
  console.log('');

  const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const migrationFile = path.join(migrationDir, `${timestamp}_rollback_words_unique_constraint.sql`);

  const migrationContent = `-- Rollback: Remove unique constraint from words table
-- Created: ${new Date().toISOString()}
-- Purpose: Remove (hebrew, verse_id) unique constraint

${sql}
`;

  fs.writeFileSync(migrationFile, migrationContent);

  console.log(`✅ Rollback migration file created: ${migrationFile}`);
  console.log('\nℹ️  To apply this rollback:');
  console.log('   Run the SQL in Supabase Dashboard SQL Editor');

  return true;
}

async function createIndexes(): Promise<boolean> {
  printSection('📊 Creating Supporting Indexes');

  const indexes = [
    {
      name: 'idx_words_verse_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_words_verse_id ON words(verse_id);'
    },
    {
      name: 'idx_words_hebrew',
      sql: 'CREATE INDEX IF NOT EXISTS idx_words_hebrew ON words(hebrew);'
    },
    {
      name: 'idx_words_hebrew_verse',
      sql: 'CREATE INDEX IF NOT EXISTS idx_words_hebrew_verse ON words(hebrew, verse_id);'
    }
  ];

  const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const migrationFile = path.join(migrationDir, `${timestamp}_add_words_indexes.sql`);

  const migrationContent = `-- Add indexes to words table for better performance
-- Created: ${new Date().toISOString()}
-- Purpose: Optimize queries on words table

${indexes.map(idx => idx.sql).join('\n\n')}

-- Rollback:
${indexes.map(idx => `-- DROP INDEX IF EXISTS ${idx.name};`).join('\n')}
`;

  fs.writeFileSync(migrationFile, migrationContent);

  console.log(`✅ Index migration file created: ${migrationFile}`);
  console.log('\nIndexes to be created:');
  indexes.forEach(idx => {
    console.log(`   - ${idx.name}`);
  });

  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const rollback = args.includes('--rollback');

  printHeader('🛡️  ADD UNIQUE CONSTRAINT - BULLETPROOF SOLUTION');

  if (rollback) {
    console.log('Mode: ROLLBACK');
    await removeConstraint();
    return;
  }

  console.log('Mode: ADD CONSTRAINT');
  console.log('');

  try {
    // Step 1: Check for duplicates
    const isClean = await checkDuplicates();

    if (!isClean && !force) {
      console.log('\n❌ Cannot proceed. Database has duplicates.');
      console.log('   Run: npx tsx scripts/final/finalDuplicateRemoval.ts');
      console.log('   Then run this script again.');
      process.exit(1);
    }

    if (!isClean && force) {
      console.log('\n⚠️  Force mode enabled. Proceeding despite duplicates...');
      console.log('   (Constraint creation will likely fail)');
    }

    // Step 2: Check existing constraint
    const hasConstraint = await checkExistingConstraint();

    if (hasConstraint) {
      console.log('\n✅ Constraint already exists. No action needed.');
      console.log('   Database is protected against duplicates.');
      return;
    }

    // Step 3: Create migration files
    const constraintAdded = await addConstraint();
    const indexesAdded = await createIndexes();

    // Summary
    printHeader('COMPLETION SUMMARY');
    console.log('✅ Migration files created successfully');
    console.log('✅ Constraint SQL generated');
    console.log('✅ Index SQL generated');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Review the migration files in supabase/migrations/');
    console.log('   2. Apply migrations using Supabase Dashboard SQL Editor');
    console.log('   3. Run verifyNoDuplicates.ts to confirm protection');
    console.log('');
    console.log('🔒 Once applied, your database will be protected against duplicates!');

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
