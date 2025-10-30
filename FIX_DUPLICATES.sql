-- ============================================================================
-- Quick Fix for Duplicate Data
-- Copy and paste this into Supabase SQL Editor
-- ============================================================================

-- Step 1: Check duplicates (READ ONLY - safe to run)
SELECT
  verse_id,
  position,
  COUNT(*) as count,
  STRING_AGG(hebrew, ', ') as words
FROM words
GROUP BY verse_id, position
HAVING COUNT(*) > 1
ORDER BY verse_id, position;

-- Step 2: Delete duplicates (keeps oldest, removes rest)
-- WARNING: This will DELETE data!
WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY verse_id, position ORDER BY created_at ASC) as rn
  FROM words
)
DELETE FROM words
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 3: Verify (should return 0 rows)
SELECT
  verse_id,
  position,
  COUNT(*) as count
FROM words
GROUP BY verse_id, position
HAVING COUNT(*) > 1;
