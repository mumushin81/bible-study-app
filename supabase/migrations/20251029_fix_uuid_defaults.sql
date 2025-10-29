-- ============================================================================
-- Fix UUID Default Functions
-- Date: 2025-10-29
-- Purpose: Replace uuid_generate_v4() with gen_random_uuid() for compatibility
--          with default Supabase installations (pgcrypto vs uuid-ossp)
-- ============================================================================

-- Background:
-- - uuid_generate_v4() requires the uuid-ossp extension
-- - gen_random_uuid() is available by default in PostgreSQL 13+ via pgcrypto
-- - Supabase uses gen_random_uuid() as the standard

-- ============================================================================
-- 1. user_word_bookmarks (from 003_word_learning_tables.sql)
-- ============================================================================
ALTER TABLE user_word_bookmarks
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- 2. user_word_progress (from 003_word_learning_tables.sql)
-- ============================================================================
ALTER TABLE user_word_progress
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- 3. user_book_progress (from 20251022_vocabulary_improvement_v2.sql)
-- ============================================================================
ALTER TABLE user_book_progress
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- 4. hebrew_roots (from 20251022_vocabulary_improvement_v2.sql)
-- ============================================================================
ALTER TABLE hebrew_roots
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- 5. word_derivations (from 20251022_vocabulary_improvement_v2.sql)
-- ============================================================================
ALTER TABLE word_derivations
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- 6. word_metadata (from 20251022_vocabulary_improvement_v2.sql)
-- ============================================================================
ALTER TABLE word_metadata
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- 7. user_word_progress_v2 (from 20251022_vocabulary_improvement_v2.sql)
-- ============================================================================
ALTER TABLE user_word_progress_v2
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- Verification Query (Optional - for testing)
-- ============================================================================
-- Run this to verify all tables now use gen_random_uuid():
--
-- SELECT
--   table_name,
--   column_name,
--   column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND column_name = 'id'
--   AND data_type = 'uuid'
-- ORDER BY table_name;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON COLUMN user_word_bookmarks.id
  IS 'Primary key using gen_random_uuid() for cross-platform compatibility';

COMMENT ON COLUMN user_word_progress.id
  IS 'Primary key using gen_random_uuid() for cross-platform compatibility';

COMMENT ON COLUMN user_book_progress.id
  IS 'Primary key using gen_random_uuid() for cross-platform compatibility';

COMMENT ON COLUMN hebrew_roots.id
  IS 'Primary key using gen_random_uuid() for cross-platform compatibility';

COMMENT ON COLUMN word_derivations.id
  IS 'Primary key using gen_random_uuid() for cross-platform compatibility';

COMMENT ON COLUMN word_metadata.id
  IS 'Primary key using gen_random_uuid() for cross-platform compatibility';

COMMENT ON COLUMN user_word_progress_v2.id
  IS 'Primary key using gen_random_uuid() for cross-platform compatibility';
