-- ============================================================================
-- RLS Status Verification Query
-- Run this in Supabase SQL Editor to check RLS status
-- ============================================================================

-- 1. Check which tables have RLS enabled
SELECT
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles', 'user_progress', 'user_favorites', 'user_notes',
    'user_preferences', 'user_word_bookmarks', 'user_word_progress',
    'user_book_progress', 'user_word_progress_v2', 'books', 'verses',
    'words', 'word_relations', 'commentaries', 'commentary_sections',
    'commentary_conclusions', 'why_questions', 'hebrew_roots',
    'word_derivations', 'word_metadata', 'quiz_results'
  )
ORDER BY
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

-- ============================================================================

-- 2. Check existing policies
SELECT
  tablename,
  policyname,
  cmd as operation,
  roles,
  CASE
    WHEN qual IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_using,
  CASE
    WHEN with_check IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================

-- 3. Check UUID default functions
SELECT
  table_name,
  column_name,
  column_default,
  CASE
    WHEN column_default LIKE '%gen_random_uuid()%' THEN '✅ CORRECT'
    WHEN column_default LIKE '%uuid_generate_v4()%' THEN '⚠️  NEEDS FIX'
    ELSE '❓ CHECK MANUALLY'
  END as uuid_function_status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND data_type = 'uuid'
ORDER BY
  CASE
    WHEN column_default LIKE '%uuid_generate_v4()%' THEN 0
    WHEN column_default LIKE '%gen_random_uuid()%' THEN 1
    ELSE 2
  END,
  table_name;

-- ============================================================================

-- 4. Summary: Tables that need RLS policies
SELECT
  t.tablename,
  CASE
    WHEN t.rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as rls_status,
  COUNT(p.policyname) as policy_count,
  CASE
    WHEN COUNT(p.policyname) = 0 THEN '⚠️  NO POLICIES'
    WHEN COUNT(p.policyname) < 4 THEN '⚠️  FEW POLICIES'
    ELSE '✅ Has Policies'
  END as policy_status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'user_book_progress', 'user_word_progress_v2',
    'hebrew_roots', 'word_derivations', 'word_metadata'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.rowsecurity, policy_count;

-- ============================================================================
-- Expected results:
--
-- Tables that SHOULD have RLS enabled but DON'T:
--   ❌ user_book_progress
--   ❌ user_word_progress_v2
--   ❌ hebrew_roots
--   ❌ word_derivations
--   ❌ word_metadata
--
-- Tables that SHOULD have uuid_generate_v4() changed:
--   ⚠️  user_word_bookmarks
--   ⚠️  user_word_progress
--   ⚠️  user_book_progress
--   ⚠️  hebrew_roots
--   ⚠️  word_derivations
--   ⚠️  word_metadata
--   ⚠️  user_word_progress_v2
-- ============================================================================
