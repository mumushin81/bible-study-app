-- ============================================================================
-- Add Foreign Key Constraints
-- Date: 2025-10-29
-- Purpose: Add missing foreign key constraints for referential integrity
--          and enable cascading deletes
-- ============================================================================

-- Background:
-- Several tables reference verse_id as TEXT but don't have foreign key
-- constraints. This can lead to orphaned records and data inconsistency.

-- ============================================================================
-- 1. user_progress.verse_id → verses.id
-- ============================================================================
-- First, clean up any orphaned records (if they exist)
DELETE FROM user_progress
WHERE verse_id NOT IN (SELECT id FROM verses);

-- Add the foreign key constraint
ALTER TABLE user_progress
  ADD CONSTRAINT fk_user_progress_verse
  FOREIGN KEY (verse_id)
  REFERENCES verses(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT fk_user_progress_verse ON user_progress
  IS 'Ensures verse_id references a valid verse; cascades on delete';

-- ============================================================================
-- 2. user_favorites.verse_id → verses.id
-- ============================================================================
DELETE FROM user_favorites
WHERE verse_id NOT IN (SELECT id FROM verses);

ALTER TABLE user_favorites
  ADD CONSTRAINT fk_user_favorites_verse
  FOREIGN KEY (verse_id)
  REFERENCES verses(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT fk_user_favorites_verse ON user_favorites
  IS 'Ensures verse_id references a valid verse; cascades on delete';

-- ============================================================================
-- 3. user_notes.verse_id → verses.id
-- ============================================================================
DELETE FROM user_notes
WHERE verse_id NOT IN (SELECT id FROM verses);

ALTER TABLE user_notes
  ADD CONSTRAINT fk_user_notes_verse
  FOREIGN KEY (verse_id)
  REFERENCES verses(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT fk_user_notes_verse ON user_notes
  IS 'Ensures verse_id references a valid verse; cascades on delete';

-- ============================================================================
-- 4. quiz_results.verse_id → verses.id
-- ============================================================================
DELETE FROM quiz_results
WHERE verse_id NOT IN (SELECT id FROM verses);

ALTER TABLE quiz_results
  ADD CONSTRAINT fk_quiz_results_verse
  FOREIGN KEY (verse_id)
  REFERENCES verses(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT fk_quiz_results_verse ON quiz_results
  IS 'Ensures verse_id references a valid verse; cascades on delete';

-- ============================================================================
-- 5. Add indexes for foreign key columns (if not exists)
-- ============================================================================
-- These indexes improve JOIN performance and foreign key checks

-- user_progress already has: idx_user_progress_verse
-- user_favorites already has: (no verse index)
CREATE INDEX IF NOT EXISTS idx_user_favorites_verse
  ON user_favorites(verse_id);

-- user_notes already has: idx_user_notes_user_verse (compound)
-- quiz_results already has: idx_quiz_results_verse

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify foreign keys were added:
--
-- SELECT
--   conname as constraint_name,
--   conrelid::regclass as table_name,
--   confrelid::regclass as foreign_table,
--   pg_get_constraintdef(oid) as definition
-- FROM pg_constraint
-- WHERE contype = 'f'
--   AND connamespace = 'public'::regnamespace
--   AND conrelid::regclass::text IN (
--     'user_progress', 'user_favorites', 'user_notes', 'quiz_results'
--   )
-- ORDER BY table_name, constraint_name;

-- ============================================================================
-- Expected Benefits
-- ============================================================================
-- 1. Data Integrity: Cannot insert invalid verse_id
-- 2. Cascading Deletes: Automatically clean up user data when verse is deleted
-- 3. Query Optimization: Database can use FK for query planning
-- 4. Documentation: Schema explicitly shows relationships
