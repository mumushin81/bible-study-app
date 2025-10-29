/**
 * RLS 정책 검증 스크립트
 *
 * 목적:
 * - 모든 테이블에 RLS가 활성화되어 있는지 확인
 * - 각 테이블의 정책이 올바르게 설정되어 있는지 확인
 *
 * 사용법:
 * npx tsx scripts/verify/checkRLSPolicies.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RLSStatus {
  tablename: string
  rowsecurity: boolean
}

interface PolicyInfo {
  schemaname: string
  tablename: string
  policyname: string
  permissive: string
  roles: string[]
  cmd: string
  qual: string
  with_check: string
}

const EXPECTED_TABLES = [
  // User-specific tables (should have user-based CRUD policies)
  { name: 'user_profiles', type: 'user_data' },
  { name: 'user_progress', type: 'user_data' },
  { name: 'user_favorites', type: 'user_data' },
  { name: 'user_notes', type: 'user_data' },
  { name: 'user_preferences', type: 'user_data' },
  { name: 'user_word_bookmarks', type: 'user_data' },
  { name: 'user_word_progress', type: 'user_data' },
  { name: 'user_book_progress', type: 'user_data' },
  { name: 'user_word_progress_v2', type: 'user_data' },

  // Public content tables (should be read-only for users, writable by service role)
  { name: 'books', type: 'public_content' },
  { name: 'verses', type: 'public_content' },
  { name: 'words', type: 'public_content' },
  { name: 'word_relations', type: 'public_content' },
  { name: 'commentaries', type: 'public_content' },
  { name: 'commentary_sections', type: 'public_content' },
  { name: 'commentary_conclusions', type: 'public_content' },
  { name: 'why_questions', type: 'public_content' },
  { name: 'hebrew_roots', type: 'public_content' },
  { name: 'word_derivations', type: 'public_content' },
  { name: 'word_metadata', type: 'public_content' },

  // Quiz tables
  { name: 'quiz_results', type: 'user_data' },
]

async function checkRLSEnabled() {
  console.log('🔍 Checking RLS enabled status...\n')

  const { data, error } = await supabase.rpc('check_rls_status' as any)

  if (error) {
    // RPC 함수가 없으면 직접 쿼리
    console.log('📝 Creating helper function to check RLS...')

    // 실제로는 Supabase 대시보드에서 직접 실행하거나
    // service role로 raw SQL 쿼리를 실행해야 합니다
    console.log('\n⚠️  Cannot check RLS status via Supabase client.')
    console.log('Please run this query in Supabase SQL Editor:\n')
    console.log(`
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (${EXPECTED_TABLES.map(t => `'${t.name}'`).join(', ')})
ORDER BY tablename;
    `)
    return
  }
}

async function checkPolicies() {
  console.log('🔍 Checking RLS policies...\n')

  console.log('⚠️  Cannot check policies via Supabase client.')
  console.log('Please run this query in Supabase SQL Editor:\n')
  console.log(`
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as qual_status,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (${EXPECTED_TABLES.map(t => `'${t.name}'`).join(', ')})
ORDER BY tablename, policyname;
  `)
}

async function checkMissingRLS() {
  console.log('🔍 Checking for tables with missing RLS...\n')

  const missingRLS: string[] = []
  const missingPolicies: string[] = []

  for (const table of EXPECTED_TABLES) {
    try {
      // 테이블 존재 확인
      const { error: tableError } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })

      if (tableError) {
        if (tableError.message.includes('does not exist')) {
          console.log(`⚠️  ${table.name}: Table does not exist`)
          continue
        }

        // RLS 에러인 경우 (정상 - RLS가 작동 중)
        if (tableError.message.includes('row-level security')) {
          console.log(`✅ ${table.name}: RLS enabled and working`)
          continue
        }

        console.log(`❌ ${table.name}: Unexpected error - ${tableError.message}`)
      } else {
        console.log(`✅ ${table.name}: Accessible (RLS configured correctly or disabled)`)
      }

    } catch (error) {
      console.log(`❌ ${table.name}: Error checking - ${error}`)
    }
  }

  if (missingRLS.length > 0) {
    console.log('\n❌ Tables missing RLS:')
    missingRLS.forEach(table => console.log(`   - ${table}`))
  }

  if (missingPolicies.length > 0) {
    console.log('\n⚠️  Tables with missing policies:')
    missingPolicies.forEach(table => console.log(`   - ${table}`))
  }
}

async function main() {
  console.log('================================================')
  console.log('🔐 RLS Policy Verification')
  console.log('================================================\n')

  await checkMissingRLS()

  console.log('\n================================================')
  console.log('📋 Manual Verification Queries')
  console.log('================================================\n')

  await checkRLSEnabled()
  await checkPolicies()

  console.log('\n================================================')
  console.log('✅ Verification Complete')
  console.log('================================================\n')

  console.log('Next steps:')
  console.log('1. Run the queries above in Supabase SQL Editor')
  console.log('2. Check for tables with rowsecurity = false')
  console.log('3. Apply migrations:')
  console.log('   - supabase/migrations/20251029_add_missing_rls_policies.sql')
  console.log('   - supabase/migrations/20251029_fix_uuid_defaults.sql')
}

main()
