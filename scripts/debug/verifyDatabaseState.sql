-- ============================================================================
-- Database State Verification
-- Diagnose why JOIN queries appear to return incorrect duplicate counts
-- ============================================================================

-- 1. Total words count
SELECT
  'Total words' as description,
  COUNT(*) as count
FROM words;

-- 2. Total Genesis words (without JOIN)
SELECT
  'Genesis words (no JOIN)' as description,
  COUNT(*) as count
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

-- 3. Total Genesis words (with JOIN simulation)
SELECT
  'Genesis words (JOIN simulation)' as description,
  COUNT(*) as count
FROM words w
INNER JOIN verses v ON w.verse_id = v.id
WHERE v.book_id = 'genesis';

-- 4. Check verses table for duplicates
SELECT
  'Verses duplicates' as description,
  COUNT(*) as total_verses,
  COUNT(DISTINCT id) as unique_ids,
  COUNT(*) - COUNT(DISTINCT id) as duplicates
FROM verses
WHERE book_id = 'genesis';

-- 5. Check words table for (hebrew, verse_id) duplicates
SELECT
  'Words duplicates (hebrew, verse_id)' as description,
  COUNT(*) as total_records,
  COUNT(DISTINCT (hebrew, verse_id)) as unique_combinations,
  COUNT(*) - COUNT(DISTINCT (hebrew, verse_id)) as duplicate_records
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
);

-- 6. Find specific duplicate groups
SELECT
  '=== Duplicate Groups Sample ===' as section;

SELECT
  hebrew,
  verse_id,
  COUNT(*) as record_count,
  ARRAY_AGG(id ORDER BY created_at DESC) as word_ids,
  MAX(created_at) as latest_created
FROM words
WHERE verse_id IN (
  SELECT id FROM verses WHERE book_id = 'genesis'
)
GROUP BY hebrew, verse_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, hebrew
LIMIT 10;

-- 7. Count total duplicate records to delete
SELECT
  'Duplicate records to delete' as description,
  SUM(cnt - 1) as records_to_delete
FROM (
  SELECT
    hebrew,
    verse_id,
    COUNT(*) as cnt
  FROM words
  WHERE verse_id IN (
    SELECT id FROM verses WHERE book_id = 'genesis'
  )
  GROUP BY hebrew, verse_id
  HAVING COUNT(*) > 1
) as duplicates;

-- 8. Verify book distribution
SELECT
  '=== Words by Book ===' as section;

SELECT
  COALESCE(v.book_id, 'NULL/ORPHANED') as book_id,
  COUNT(*) as word_count
FROM words w
LEFT JOIN verses v ON w.verse_id = v.id
GROUP BY v.book_id
ORDER BY COUNT(*) DESC;

-- 9. Check for NULL verse_id
SELECT
  'Words with NULL verse_id' as description,
  COUNT(*) as count
FROM words
WHERE verse_id IS NULL;

-- 10. Sample of actual duplicate data
SELECT
  '=== Sample Duplicate Data ===' as section;

SELECT
  w.id,
  w.hebrew,
  w.meaning,
  w.verse_id,
  v.reference,
  w.created_at
FROM words w
INNER JOIN verses v ON w.verse_id = v.id
WHERE (w.hebrew, w.verse_id) IN (
  SELECT hebrew, verse_id
  FROM words
  WHERE verse_id IN (
    SELECT id FROM verses WHERE book_id = 'genesis'
  )
  GROUP BY hebrew, verse_id
  HAVING COUNT(*) > 1
  LIMIT 3
)
ORDER BY w.hebrew, w.verse_id, w.created_at DESC;
