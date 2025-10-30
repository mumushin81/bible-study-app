-- ============================================================================
-- Fix Duplicate Data Before Adding Unique Constraints
-- Date: 2025-10-29
-- Purpose: Clean up duplicate data that prevents unique constraint creation
-- ============================================================================

-- This migration MUST be run BEFORE 20251029_add_unique_constraints.sql

-- ============================================================================
-- PART 1: Find and Display Duplicates
-- ============================================================================

-- Check for duplicate words (verse_id + position)
-- Run this first to see what duplicates exist
SELECT
  verse_id,
  position,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY created_at) as word_ids,
  ARRAY_AGG(hebrew ORDER BY created_at) as hebrew_texts
FROM words
GROUP BY verse_id, position
HAVING COUNT(*) > 1
ORDER BY verse_id, position;

-- ============================================================================
-- PART 2: Clean Up Duplicate Words
-- ============================================================================

-- Strategy: Keep the OLDEST word (first created), delete the rest
-- This preserves the original data and removes duplicates added later

WITH duplicates AS (
  SELECT
    verse_id,
    position,
    id,
    ROW_NUMBER() OVER (PARTITION BY verse_id, position ORDER BY created_at ASC) as rn
  FROM words
)
DELETE FROM words
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE rn > 1
);

-- Show how many duplicates were removed
-- Re-run the duplicate check to verify cleanup
SELECT
  verse_id,
  position,
  COUNT(*) as duplicate_count
FROM words
GROUP BY verse_id, position
HAVING COUNT(*) > 1;

-- Expected result: 0 rows (no duplicates)

-- ============================================================================
-- PART 3: Check for Duplicate Verses (for reference)
-- ============================================================================

-- Check if there are duplicate verses as well
SELECT
  book_id,
  chapter,
  verse_number,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY created_at) as verse_ids
FROM verses
WHERE book_id IS NOT NULL
GROUP BY book_id, chapter, verse_number
HAVING COUNT(*) > 1
ORDER BY book_id, chapter, verse_number;

-- If duplicates exist in verses, clean them up:
-- (Uncomment and run if needed)
/*
WITH duplicates AS (
  SELECT
    book_id,
    chapter,
    verse_number,
    id,
    ROW_NUMBER() OVER (PARTITION BY book_id, chapter, verse_number ORDER BY created_at ASC) as rn
  FROM verses
  WHERE book_id IS NOT NULL
)
DELETE FROM verses
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE rn > 1
);
*/

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- 1. Verify no word duplicates remain
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT verse_id, position
    FROM words
    GROUP BY verse_id, position
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE EXCEPTION '❌ Still have % duplicate word positions', duplicate_count;
  ELSE
    RAISE NOTICE '✅ No duplicate words found - ready for unique constraint';
  END IF;
END $$;

-- 2. Verify no verse duplicates remain
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT book_id, chapter, verse_number
    FROM verses
    WHERE book_id IS NOT NULL
    GROUP BY book_id, chapter, verse_number
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE NOTICE '⚠️  Still have % duplicate verses', duplicate_count;
  ELSE
    RAISE NOTICE '✅ No duplicate verses found - ready for unique constraint';
  END IF;
END $$;

-- ============================================================================
-- After running this migration successfully:
-- Run: 20251029_add_unique_constraints.sql
-- ============================================================================
