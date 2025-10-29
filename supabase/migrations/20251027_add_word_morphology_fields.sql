-- ============================================================================
-- Add Morphology and Root IPA Fields
-- Date: 2025-10-27
-- Purpose:
--   1. Distinguish single words from combined forms
--   2. Add IPA pronunciation for roots
--   3. Improve morphological analysis
-- ============================================================================

-- ============================================================================
-- 1. Add is_combined_form to words table
-- ============================================================================
ALTER TABLE words
ADD COLUMN IF NOT EXISTS is_combined_form BOOLEAN DEFAULT false;

COMMENT ON COLUMN words.is_combined_form IS 'True if word has prefixes (ו, ב, ל, מ, כ, ה), false for standalone words';

-- ============================================================================
-- 2. Add root_ipa to hebrew_roots table
-- ============================================================================
ALTER TABLE hebrew_roots
ADD COLUMN IF NOT EXISTS root_ipa TEXT;

COMMENT ON COLUMN hebrew_roots.root_ipa IS 'IPA pronunciation of the root (e.g., /ʔeʁets/ for ארץ)';

-- ============================================================================
-- 3. Update index for is_combined_form
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_words_is_combined_form
ON words(is_combined_form);

-- ============================================================================
-- 4. Helper function: Detect if word is combined form
-- ============================================================================
CREATE OR REPLACE FUNCTION is_word_combined(hebrew_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if word starts with common prefixes
  -- ו (vav - and), ב (bet - in), ל (lamed - to), מ (mem - from), כ (kaf - like), ה (he - the)

  -- Simple check: if it starts with one of these AND has more than 2 characters
  IF LENGTH(hebrew_text) > 2 THEN
    IF LEFT(hebrew_text, 1) IN ('ו', 'ב', 'ל', 'מ', 'כ') THEN
      RETURN true;
    END IF;

    -- Check for definite article ה (but not at start of verb forms)
    IF LEFT(hebrew_text, 1) = 'ה' AND LENGTH(hebrew_text) > 3 THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_word_combined(TEXT) IS 'Detects if a Hebrew word is a combined form with prefixes';

-- ============================================================================
-- 5. Sample data for testing
-- ============================================================================

-- Update hebrew_roots with IPA pronunciations (examples)
UPDATE hebrew_roots SET root_ipa = '/baˈʁa/' WHERE root = 'ב-ר-א'; -- create
UPDATE hebrew_roots SET root_ipa = '/ʔeʁets/' WHERE root = 'א-ר-ץ'; -- earth/land
UPDATE hebrew_roots SET root_ipa = '/ʃaˈmajim/' WHERE root = 'ש-מ-י'; -- heaven

-- ============================================================================
-- 6. Auto-detect combined forms in existing data (optional migration)
-- ============================================================================
-- Uncomment to run on existing data:
/*
UPDATE words
SET is_combined_form = is_word_combined(hebrew)
WHERE is_combined_form IS NULL OR is_combined_form = false;
*/

-- ============================================================================
-- Rollback Instructions
-- ============================================================================
/*
ALTER TABLE words DROP COLUMN IF EXISTS is_combined_form;
ALTER TABLE hebrew_roots DROP COLUMN IF EXISTS root_ipa;
DROP FUNCTION IF EXISTS is_word_combined(TEXT);
DROP INDEX IF EXISTS idx_words_is_combined_form;
*/

-- ============================================================================
-- End of Migration
-- ============================================================================
