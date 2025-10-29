-- ============================================================================
-- Add Composite Unique Constraints
-- Date: 2025-10-29
-- Purpose: Prevent duplicate verses and words, ensure canonical ordering
-- ============================================================================

-- Background:
-- Without composite unique constraints, we could accidentally insert:
-- - Duplicate verses (same book, chapter, verse_number)
-- - Duplicate words at the same position in a verse
-- - Invalid data that breaks application assumptions

-- ============================================================================
-- 1. verses: Ensure no duplicate verse numbers within a chapter
-- ============================================================================
-- First, check for and clean up any existing duplicates
WITH duplicates AS (
  SELECT
    book_id,
    chapter,
    verse_number,
    COUNT(*) as count,
    ARRAY_AGG(id ORDER BY created_at) as verse_ids
  FROM verses
  WHERE book_id IS NOT NULL
  GROUP BY book_id, chapter, verse_number
  HAVING COUNT(*) > 1
)
SELECT
  book_id,
  chapter,
  verse_number,
  count,
  'Run: DELETE FROM verses WHERE id IN (' || ARRAY_TO_STRING(verse_ids[2:count], ',') || ');' as cleanup_query
FROM duplicates;

-- Note: If duplicates exist, manually review and run the cleanup queries above
-- before proceeding with the constraint addition

-- Add the unique constraint
ALTER TABLE verses
  ADD CONSTRAINT unique_verse_reference
  UNIQUE (book_id, chapter, verse_number);

COMMENT ON CONSTRAINT unique_verse_reference ON verses
  IS 'Ensures each verse appears only once per book and chapter';

-- ============================================================================
-- 2. words: Ensure no duplicate positions within a verse
-- ============================================================================
-- Check for duplicates
WITH duplicates AS (
  SELECT
    verse_id,
    position,
    COUNT(*) as count,
    ARRAY_AGG(id ORDER BY created_at) as word_ids
  FROM words
  WHERE verse_id IS NOT NULL
  GROUP BY verse_id, position
  HAVING COUNT(*) > 1
)
SELECT
  verse_id,
  position,
  count,
  'Run: DELETE FROM words WHERE id IN (''' || ARRAY_TO_STRING(word_ids[2:count], ''',''') || ''');' as cleanup_query
FROM duplicates;

-- Add the unique constraint
ALTER TABLE words
  ADD CONSTRAINT unique_word_position
  UNIQUE (verse_id, position);

COMMENT ON CONSTRAINT unique_word_position ON words
  IS 'Ensures each word position is unique within a verse';

-- ============================================================================
-- 3. Optional: Add check constraint for valid position numbers
-- ============================================================================
-- Ensure position is non-negative (0-indexed)
ALTER TABLE words
  ADD CONSTRAINT check_word_position_nonnegative
  CHECK (position >= 0);

COMMENT ON CONSTRAINT check_word_position_nonnegative ON words
  IS 'Word positions must be non-negative (0-indexed)';

-- ============================================================================
-- 4. Optional: Add check constraint for valid verse numbers
-- ============================================================================
ALTER TABLE verses
  ADD CONSTRAINT check_verse_number_positive
  CHECK (verse_number > 0);

ALTER TABLE verses
  ADD CONSTRAINT check_chapter_positive
  CHECK (chapter > 0);

COMMENT ON CONSTRAINT check_verse_number_positive ON verses
  IS 'Verse numbers must be positive (1-indexed)';

COMMENT ON CONSTRAINT check_chapter_positive ON verses
  IS 'Chapter numbers must be positive (1-indexed)';

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- 1. Check for remaining duplicates in verses:
--
-- SELECT book_id, chapter, verse_number, COUNT(*)
-- FROM verses
-- GROUP BY book_id, chapter, verse_number
-- HAVING COUNT(*) > 1;
--
-- Expected: 0 rows

-- 2. Check for remaining duplicates in words:
--
-- SELECT verse_id, position, COUNT(*)
-- FROM words
-- GROUP BY verse_id, position
-- HAVING COUNT(*) > 1;
--
-- Expected: 0 rows

-- 3. Verify constraints exist:
--
-- SELECT
--   conname,
--   conrelid::regclass as table_name,
--   pg_get_constraintdef(oid) as definition
-- FROM pg_constraint
-- WHERE conname IN (
--   'unique_verse_reference',
--   'unique_word_position',
--   'check_word_position_nonnegative',
--   'check_verse_number_positive',
--   'check_chapter_positive'
-- );

-- ============================================================================
-- Expected Benefits
-- ============================================================================
-- 1. Data Quality: Prevents accidental duplicate imports
-- 2. Application Stability: Eliminates bugs from unexpected duplicate data
-- 3. Performance: Unique indexes speed up lookups
-- 4. Debugging: Constraint violations immediately reveal data issues
