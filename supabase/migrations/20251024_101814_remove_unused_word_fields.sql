-- ============================================================================
-- Remove Unused Word Fields Migration
-- Date: 2025-10-24
-- Purpose: Clean up database by removing fields no longer used in code
--   - Remove 'structure' column from words table
--   - Remove 'emoji' column from words table (fallback logic moved to code)
--   - Remove 'word_relations' table (relatedWords feature removed)
-- ============================================================================

-- ============================================================================
-- 1. Drop word_relations table
-- ============================================================================
-- This table was used for the relatedWords feature, which has been removed
DROP TABLE IF EXISTS word_relations CASCADE;

COMMENT ON TABLE words IS 'Individual Hebrew words with grammatical analysis - cleaned up schema';

-- ============================================================================
-- 2. Remove unused columns from words table
-- ============================================================================

-- Remove 'structure' column (morphological structure - no longer used)
ALTER TABLE words DROP COLUMN IF EXISTS structure;

-- Remove 'emoji' column (moved to fallback logic in wordHelpers.ts)
ALTER TABLE words DROP COLUMN IF EXISTS emoji;

-- ============================================================================
-- 3. Update table comments to reflect changes
-- ============================================================================

COMMENT ON COLUMN words.icon_svg IS 'Custom SVG icon code (required) - 3-4+ gradients with unique IDs';
COMMENT ON COLUMN words.letters IS 'Letter-by-letter pronunciation breakdown (e.g., "ש(sh) + ל(l) + ו(o) + ם(m)")';
COMMENT ON COLUMN words.root IS 'Hebrew root in format: "ברא (bara)"';
COMMENT ON COLUMN words.grammar IS 'Simple part of speech: 명사/동사/형용사/전치사/접속사/부사/대명사';

-- ============================================================================
-- Rollback Instructions (if needed)
-- ============================================================================
-- To rollback this migration, run:
/*
ALTER TABLE words ADD COLUMN IF NOT EXISTS structure TEXT;
ALTER TABLE words ADD COLUMN IF NOT EXISTS emoji TEXT;

CREATE TABLE IF NOT EXISTS word_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  related_word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE word_relations IS 'Related words for vocabulary building';
COMMENT ON COLUMN word_relations.word_id IS 'Reference to parent word';
COMMENT ON COLUMN word_relations.related_word IS 'Related Hebrew word';
*/

-- ============================================================================
-- End of Migration
-- ============================================================================
