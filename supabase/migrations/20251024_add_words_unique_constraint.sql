-- ============================================================================
-- Add UNIQUE constraint to words table
-- Date: 2025-10-24
-- Purpose: Prevent duplicate (hebrew, verse_id, position) entries
-- ============================================================================

-- Verify no duplicates exist (this will fail if duplicates found)
-- Run cleanup script first if this fails!

DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Check for duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT hebrew, verse_id, position, COUNT(*) as cnt
    FROM words
    GROUP BY hebrew, verse_id, position
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Found % duplicate combinations. Run cleanup script first!', duplicate_count;
  END IF;

  RAISE NOTICE 'No duplicates found. Proceeding with constraint...';
END $$;

-- Add the UNIQUE constraint
ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_id_position_unique
UNIQUE (hebrew, verse_id, position);

-- Add comment for documentation
COMMENT ON CONSTRAINT words_hebrew_verse_id_position_unique ON words IS
  'Ensures each Hebrew word appears only once per verse position. Position is included because the same word can legitimately appear multiple times in a verse at different positions.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ UNIQUE constraint added successfully!';
  RAISE NOTICE 'Constraint name: words_hebrew_verse_id_position_unique';
  RAISE NOTICE 'Columns: (hebrew, verse_id, position)';
END $$;
