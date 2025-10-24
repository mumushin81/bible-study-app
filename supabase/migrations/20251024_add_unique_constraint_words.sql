-- ========================================
-- Add UNIQUE Constraint to Words Table
-- ========================================
-- Purpose: Prevent duplicate (hebrew, verse_id) combinations
-- Date: 2025-10-24
-- Rationale: After cleaning 849 duplicate records, we need to
--            prevent future duplicates at the database level
-- ========================================

-- Step 1: Verify no duplicates exist (safety check)
-- This query should return 0 rows if we're ready to add constraint
SELECT
  hebrew,
  verse_id,
  COUNT(*) as duplicate_count
FROM words
GROUP BY hebrew, verse_id
HAVING COUNT(*) > 1;

-- If the above query returns rows, DO NOT proceed!
-- Run the duplicate removal scripts first:
-- - tsx scripts/migrations/removeDuplicateWords.ts
-- - tsx scripts/migrations/removeDuplicatesSQL.ts

-- ========================================
-- Step 2: Add the UNIQUE constraint
-- ========================================
-- This will:
-- 1. Prevent future duplicate insertions
-- 2. Force applications to use UPSERT instead of INSERT
-- 3. Ensure data integrity at database level

ALTER TABLE words
ADD CONSTRAINT unique_hebrew_verse
UNIQUE (hebrew, verse_id);

-- ========================================
-- Step 3: Verify constraint was added
-- ========================================
-- Query to check constraint exists:
SELECT
  conname as constraint_name,
  contype as constraint_type,
  conrelid::regclass as table_name
FROM pg_constraint
WHERE conrelid = 'words'::regclass
  AND conname = 'unique_hebrew_verse';

-- Expected result:
-- constraint_name       | constraint_type | table_name
-- ----------------------|-----------------|------------
-- unique_hebrew_verse   | u               | words

-- ========================================
-- IMPORTANT NOTES FOR DEVELOPERS
-- ========================================
--
-- After adding this constraint, insertion code must change:
--
-- ❌ OLD WAY (will fail on duplicates):
-- await supabase.from('words').insert(wordsData)
--
-- ✅ NEW WAY (use upsert):
-- await supabase.from('words').upsert(wordsData, {
--   onConflict: 'hebrew,verse_id',
--   ignoreDuplicates: false
-- })
--
-- OR (delete before insert):
-- await supabase.from('words').delete().eq('verse_id', verseId)
-- await supabase.from('words').insert(wordsData)
--
-- ========================================
-- Rollback (if needed):
-- ========================================
-- ALTER TABLE words DROP CONSTRAINT unique_hebrew_verse;
-- ========================================
