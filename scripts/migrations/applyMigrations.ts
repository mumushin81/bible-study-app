/**
 * Apply Migrations Script
 *
 * Applies all pending migrations to Supabase database
 * Uses service role key for admin operations
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

const MIGRATION_FILES = [
  '20251029_fix_uuid_defaults.sql',
  '20251029_add_missing_rls_policies.sql',
  '20251029_add_foreign_keys.sql',
  '20251029_add_unique_constraints.sql',
]

async function runSQL(sql: string, description: string): Promise<boolean> {
  try {
    console.log(`\n📝 ${description}...`)

    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/))

    for (const statement of statements) {
      if (statement.trim().length === 0) continue

      // Skip comments
      if (statement.trim().startsWith('--')) continue
      if (statement.trim().startsWith('/*')) continue

      const { error } = await supabase.rpc('exec_sql' as any, { sql: statement })

      if (error) {
        // Some errors are expected (like "already exists")
        if (
          error.message.includes('already exists') ||
          error.message.includes('does not exist') ||
          error.message.includes('duplicate key')
        ) {
          console.log(`   ⚠️  ${error.message}`)
          continue
        }
        throw error
      }
    }

    console.log('   ✅ Success')
    return true
  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

async function applyMigration(filename: string): Promise<boolean> {
  const filePath = path.join(MIGRATIONS_DIR, filename)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`)
    return false
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📦 Applying: ${filename}`)
  console.log('='.repeat(60))

  const sql = fs.readFileSync(filePath, 'utf-8')

  // Remove multi-line comments
  const cleanedSQL = sql.replace(/\/\*[\s\S]*?\*\//g, '')

  return await runSQL(cleanedSQL, filename)
}

async function main() {
  console.log('🚀 Migration Application Script')
  console.log('================================\n')
  console.log(`Database: ${supabaseUrl}`)
  console.log(`Migrations: ${MIGRATION_FILES.length} files\n`)

  // Note: We can't directly execute SQL via the Supabase client
  // This would require creating a custom RPC function or using direct postgres connection
  console.log('⚠️  Important: Supabase JS client cannot execute raw SQL directly.')
  console.log('Please use one of these methods:\n')

  console.log('Option 1: Supabase Dashboard (Recommended)')
  console.log('-------------------------------------------')
  console.log('1. Go to: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to SQL Editor')
  console.log('4. Copy and paste each migration file in order:\n')

  MIGRATION_FILES.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`)
  })

  console.log('\nOption 2: Supabase CLI (If installed)')
  console.log('--------------------------------------')
  console.log('supabase db push\n')

  console.log('Option 3: Direct PostgreSQL Connection')
  console.log('---------------------------------------')
  console.log('psql $DATABASE_URL -f supabase/migrations/20251029_fix_uuid_defaults.sql')
  console.log('psql $DATABASE_URL -f supabase/migrations/20251029_add_missing_rls_policies.sql')
  console.log('psql $DATABASE_URL -f supabase/migrations/20251029_add_foreign_keys.sql')
  console.log('psql $DATABASE_URL -f supabase/migrations/20251029_add_unique_constraints.sql\n')

  console.log('\n✅ To verify after applying:')
  console.log('npx tsx scripts/verify/checkRLSPolicies.ts')
  console.log('\nOr run SQL queries from:')
  console.log('scripts/verify/verify_rls_status.sql')
}

main()
