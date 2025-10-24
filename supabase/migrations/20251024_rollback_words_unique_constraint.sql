-- ============================================================================
-- ROLLBACK: Remove UNIQUE constraint from words table
-- Date: 2025-10-24
-- Use only if constraint causes issues
-- ============================================================================

-- Check if constraint exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'words_hebrew_verse_id_position_unique'
  ) THEN
    RAISE NOTICE 'Constraint exists. Removing...';

    ALTER TABLE words
    DROP CONSTRAINT words_hebrew_verse_id_position_unique;

    RAISE NOTICE '✅ Constraint removed successfully!';
  ELSE
    RAISE NOTICE '⚠️  Constraint does not exist. Nothing to rollback.';
  END IF;
END $$;
