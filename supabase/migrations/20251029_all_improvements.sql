-- ============================================================================
-- All Improvements Combined Migration
-- Date: 2025-10-29
-- Purpose: Single migration file combining all improvements for easy application
-- ============================================================================

-- This file combines:
-- 1. UUID function fixes
-- 2. RLS policies
-- 3. Foreign keys
-- 4. Unique constraints

-- Apply this in Supabase SQL Editor in one go

-- ============================================================================
-- PART 1: Fix UUID Default Functions
-- ============================================================================

ALTER TABLE user_word_bookmarks ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE user_word_progress ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE user_book_progress ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE hebrew_roots ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE word_derivations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE word_metadata ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE user_word_progress_v2 ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- PART 2: Add Missing RLS Policies
-- ============================================================================

-- user_book_progress
ALTER TABLE user_book_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own book progress"
  ON user_book_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own book progress"
  ON user_book_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own book progress"
  ON user_book_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own book progress"
  ON user_book_progress FOR DELETE USING (auth.uid() = user_id);

-- user_word_progress_v2
ALTER TABLE user_word_progress_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own word progress v2"
  ON user_word_progress_v2 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own word progress v2"
  ON user_word_progress_v2 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own word progress v2"
  ON user_word_progress_v2 FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own word progress v2"
  ON user_word_progress_v2 FOR DELETE USING (auth.uid() = user_id);

-- hebrew_roots
ALTER TABLE hebrew_roots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hebrew roots are viewable by everyone"
  ON hebrew_roots FOR SELECT USING (true);
CREATE POLICY "Only service role can insert hebrew roots"
  ON hebrew_roots FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can update hebrew roots"
  ON hebrew_roots FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Only service role can delete hebrew roots"
  ON hebrew_roots FOR DELETE USING (auth.role() = 'service_role');

-- word_derivations
ALTER TABLE word_derivations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Word derivations are viewable by everyone"
  ON word_derivations FOR SELECT USING (true);
CREATE POLICY "Only service role can insert word derivations"
  ON word_derivations FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can update word derivations"
  ON word_derivations FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Only service role can delete word derivations"
  ON word_derivations FOR DELETE USING (auth.role() = 'service_role');

-- word_metadata
ALTER TABLE word_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Word metadata is viewable by everyone"
  ON word_metadata FOR SELECT USING (true);
CREATE POLICY "Only service role can insert word metadata"
  ON word_metadata FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can update word metadata"
  ON word_metadata FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Only service role can delete word metadata"
  ON word_metadata FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- PART 3: Add Foreign Key Constraints
-- ============================================================================

-- Clean up orphaned records first
DELETE FROM user_progress WHERE verse_id NOT IN (SELECT id FROM verses);
DELETE FROM user_favorites WHERE verse_id NOT IN (SELECT id FROM verses);
DELETE FROM user_notes WHERE verse_id NOT IN (SELECT id FROM verses);
DELETE FROM quiz_results WHERE verse_id NOT IN (SELECT id FROM verses);

-- Add foreign keys
ALTER TABLE user_progress
  ADD CONSTRAINT fk_user_progress_verse
  FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;

ALTER TABLE user_favorites
  ADD CONSTRAINT fk_user_favorites_verse
  FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;

ALTER TABLE user_notes
  ADD CONSTRAINT fk_user_notes_verse
  FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;

ALTER TABLE quiz_results
  ADD CONSTRAINT fk_quiz_results_verse
  FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;

-- Add missing index
CREATE INDEX IF NOT EXISTS idx_user_favorites_verse ON user_favorites(verse_id);

-- ============================================================================
-- PART 4: Add Unique Constraints
-- ============================================================================

-- Check for duplicates first (info only - manual cleanup may be needed)
-- Run these queries separately if you need to check:
-- SELECT book_id, chapter, verse_number, COUNT(*) FROM verses
--   GROUP BY book_id, chapter, verse_number HAVING COUNT(*) > 1;
-- SELECT verse_id, position, COUNT(*) FROM words
--   GROUP BY verse_id, position HAVING COUNT(*) > 1;

-- Add unique constraints
ALTER TABLE verses
  ADD CONSTRAINT unique_verse_reference
  UNIQUE (book_id, chapter, verse_number);

ALTER TABLE words
  ADD CONSTRAINT unique_word_position
  UNIQUE (verse_id, position);

-- Add check constraints
ALTER TABLE words
  ADD CONSTRAINT check_word_position_nonnegative
  CHECK (position >= 0);

ALTER TABLE verses
  ADD CONSTRAINT check_verse_number_positive
  CHECK (verse_number > 0);

ALTER TABLE verses
  ADD CONSTRAINT check_chapter_positive
  CHECK (chapter > 0);

-- ============================================================================
-- Verification Queries (Run these after migration)
-- ============================================================================

-- 1. Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename IN
--   ('user_book_progress', 'user_word_progress_v2', 'hebrew_roots', 'word_derivations', 'word_metadata');

-- 2. Check UUID functions
-- SELECT table_name, column_default FROM information_schema.columns
--   WHERE table_schema = 'public' AND column_name = 'id' AND data_type = 'uuid';

-- 3. Check foreign keys
-- SELECT conname, conrelid::regclass, confrelid::regclass FROM pg_constraint
--   WHERE contype = 'f' AND conrelid::regclass::text IN
--   ('user_progress', 'user_favorites', 'user_notes', 'quiz_results');

-- 4. Check unique constraints
-- SELECT conname, conrelid::regclass FROM pg_constraint
--   WHERE contype = 'u' AND conrelid::regclass::text IN ('verses', 'words');

-- ============================================================================
-- End of Migration
-- ============================================================================
