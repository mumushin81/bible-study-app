-- ============================================================================
-- APPLY UNIQUE CONSTRAINT TO PREVENT DUPLICATE WORDS
-- ============================================================================
--
-- Database is now clean with 0 duplicates.
-- Apply this SQL in Supabase Dashboard to add permanent protection.
--
-- How to apply:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Copy this entire file
--   3. Paste and click "Run"
--
-- ============================================================================

-- Step 1: Add UNIQUE constraint
ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_unique
UNIQUE (hebrew, verse_id);

-- Step 2: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_words_verse_id ON words(verse_id);
CREATE INDEX IF NOT EXISTS idx_words_hebrew ON words(hebrew);
CREATE INDEX IF NOT EXISTS idx_words_hebrew_verse ON words(hebrew, verse_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that constraint was added
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE con.contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
    END AS constraint_type_desc
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'words'
  AND con.conname = 'words_hebrew_verse_unique';

-- Check that indexes were added
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'words'
  AND indexname IN ('idx_words_verse_id', 'idx_words_hebrew', 'idx_words_hebrew_verse');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If you see results from the queries above, the constraint and indexes
-- were successfully applied!
-- ============================================================================
