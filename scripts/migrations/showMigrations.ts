/**
 * Show Migrations for Copy-Paste
 *
 * Displays each migration file content for easy copy-paste to Supabase Dashboard
 */

import * as fs from 'fs'
import * as path from 'path'

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

const MIGRATIONS = [
  {
    file: '20251029_fix_uuid_defaults.sql',
    title: 'Fix UUID Functions',
    description: 'Changes uuid_generate_v4() to gen_random_uuid()'
  },
  {
    file: '20251029_add_missing_rls_policies.sql',
    title: 'Add Missing RLS Policies',
    description: 'Secures 5 tables with Row Level Security'
  },
  {
    file: '20251029_add_foreign_keys.sql',
    title: 'Add Foreign Key Constraints',
    description: 'Adds FK constraints for referential integrity'
  },
  {
    file: '20251029_add_unique_constraints.sql',
    title: 'Add Unique Constraints',
    description: 'Prevents duplicate verses and words'
  },
]

function displayMigration(migration: typeof MIGRATIONS[0], index: number) {
  const filePath = path.join(MIGRATIONS_DIR, migration.file)

  if (!fs.existsSync(filePath)) {
    console.error(`\n❌ File not found: ${migration.file}`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  console.log('\n' + '='.repeat(80))
  console.log(`📦 Migration ${index + 1}/${MIGRATIONS.length}: ${migration.title}`)
  console.log('='.repeat(80))
  console.log(`File: ${migration.file}`)
  console.log(`Description: ${migration.description}`)
  console.log('='.repeat(80))
  console.log('\n📋 SQL to Copy:\n')
  console.log(content)
  console.log('\n' + '='.repeat(80))
  console.log(`✅ Copy the SQL above and paste into Supabase SQL Editor`)
  console.log('='.repeat(80) + '\n')
}

function main() {
  console.log('🚀 Eden Bible Study - Migration Guide')
  console.log('=====================================\n')
  console.log('📍 Instructions:')
  console.log('1. Open: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Navigate to: SQL Editor')
  console.log('4. Create a new query')
  console.log('5. Copy each migration SQL below (in order)')
  console.log('6. Paste and click "Run"\n')

  console.log('⚠️  Apply migrations in the order shown below!\n')

  MIGRATIONS.forEach((migration, index) => {
    displayMigration(migration, index)

    if (index < MIGRATIONS.length - 1) {
      console.log('\n⏭️  Continue to next migration after this succeeds...\n')
    }
  })

  console.log('\n✅ After all migrations are applied:')
  console.log('Run verification: npx tsx scripts/verify/checkRLSPolicies.ts')
  console.log('\nOr check manually with queries from:')
  console.log('scripts/verify/verify_rls_status.sql\n')
}

main()
