-- ============================================================================
-- Remove Duplicate Words (Direct SQL Approach)
-- ============================================================================
-- This script removes duplicate (hebrew, verse_id) combinations,
-- keeping only the most recent record (by created_at DESC)
--
-- ⚠️  BACKUP FIRST:
-- CREATE TABLE words_backup_20251024 AS SELECT * FROM words;
-- ============================================================================

-- Step 1: Check current state
SELECT 'Before Deletion' as stage;

SELECT
  'Total words' as metric,
  COUNT(*) as count
FROM words;

SELECT
  'Genesis words' as metric,
  COUNT(*) as count
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

SELECT
  'Duplicates to delete' as metric,
  COUNT(*) - COUNT(DISTINCT (hebrew, verse_id)) as count
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

-- Step 2: Show sample duplicates (before deletion)
SELECT
  '=== Sample Duplicates (Before) ===' as section;

SELECT
  hebrew,
  verse_id,
  COUNT(*) as count,
  ARRAY_AGG(id ORDER BY created_at DESC) as ids,
  ARRAY_AGG(created_at ORDER BY created_at DESC) as created_dates
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
)
GROUP BY hebrew, verse_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 10;

-- ============================================================================
-- Step 3: DELETE DUPLICATES (Method 1: Using SELF JOIN)
-- ============================================================================
-- This keeps the record with the LATEST created_at (or largest ID if same time)
-- ============================================================================

BEGIN;

-- Create temporary table with IDs to delete
CREATE TEMP TABLE words_to_delete AS
SELECT w1.id
FROM words w1
INNER JOIN words w2 ON
  w1.hebrew = w2.hebrew AND
  w1.verse_id = w2.verse_id AND
  (
    w1.created_at < w2.created_at OR
    (w1.created_at = w2.created_at AND w1.id < w2.id)
  )
WHERE w1.verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

-- Show what will be deleted
SELECT 'Records to delete' as info, COUNT(*) as count FROM words_to_delete;

-- Actual deletion
DELETE FROM words
WHERE id IN (SELECT id FROM words_to_delete);

-- Verify no duplicates remain
SELECT
  'Remaining duplicates' as info,
  COUNT(*) as count
FROM (
  SELECT hebrew, verse_id, COUNT(*) as cnt
  FROM words
  WHERE verse_id IN (
    SELECT id FROM verses WHERE book_id = 'genesis'
  )
  GROUP BY hebrew, verse_id
  HAVING COUNT(*) > 1
) as check_duplicates;

-- If verification passes, commit
COMMIT;

-- ============================================================================
-- Alternative Method 2: Using CTE and ROW_NUMBER (cleaner)
-- ============================================================================
-- Uncomment below if you prefer this method instead
-- ============================================================================
/*
BEGIN;

WITH ranked_words AS (
  SELECT
    id,
    hebrew,
    verse_id,
    ROW_NUMBER() OVER (
      PARTITION BY hebrew, verse_id
      ORDER BY created_at DESC, id DESC
    ) as rn
  FROM words
  WHERE verse_id IN (
    SELECT id FROM verses WHERE book_id = 'genesis'
  )
)
DELETE FROM words
WHERE id IN (
  SELECT id FROM ranked_words WHERE rn > 1
);

-- Verify
SELECT
  'Remaining duplicates' as info,
  COUNT(*) as count
FROM (
  SELECT hebrew, verse_id, COUNT(*) as cnt
  FROM words
  WHERE verse_id IN (
    SELECT id FROM verses WHERE book_id = 'genesis'
  )
  GROUP BY hebrew, verse_id
  HAVING COUNT(*) > 1
) as check_duplicates;

COMMIT;
*/

-- ============================================================================
-- Step 4: Verify results
-- ============================================================================

SELECT 'After Deletion' as stage;

SELECT
  'Total words' as metric,
  COUNT(*) as count
FROM words;

SELECT
  'Genesis words' as metric,
  COUNT(*) as count
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

SELECT
  'Unique (hebrew, verse_id)' as metric,
  COUNT(DISTINCT (hebrew, verse_id)) as count
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

SELECT
  'Remaining duplicates' as metric,
  COUNT(*) - COUNT(DISTINCT (hebrew, verse_id)) as count
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

-- ============================================================================
-- Step 5: Add UNIQUE constraint (prevents future duplicates)
-- ============================================================================
-- Run this only after verifying all duplicates are gone
-- ============================================================================

-- ALTER TABLE words
-- ADD CONSTRAINT words_hebrew_verse_unique
-- UNIQUE (hebrew, verse_id);

-- ============================================================================
-- Rollback option (if needed)
-- ============================================================================
-- If something went wrong and you created a backup:
-- DELETE FROM words;
-- INSERT INTO words SELECT * FROM words_backup_20251024;
-- ============================================================================
