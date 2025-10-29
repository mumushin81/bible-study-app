-- ============================================================================
-- Add root_ipa column to words table
-- Date: 2025-10-27
-- Purpose: Store accurate IPA pronunciation for word roots separately
-- ============================================================================

-- ============================================================================
-- 1. Add root_ipa column to words table
-- ============================================================================
ALTER TABLE words
ADD COLUMN IF NOT EXISTS root_ipa TEXT;

COMMENT ON COLUMN words.root_ipa IS 'IPA pronunciation of the root only (without prefixes). Example: reˈʃit for רֵאשִׁית';

-- ============================================================================
-- 2. Create index for root_ipa
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_words_root_ipa
ON words(root_ipa) WHERE root_ipa IS NOT NULL;

-- ============================================================================
-- 3. Initial population logic (placeholder - needs manual correction)
-- ============================================================================
-- This is a starting point that removes prefix IPA patterns
-- BUT this needs manual review and correction for accuracy

CREATE OR REPLACE FUNCTION extract_root_ipa(full_ipa TEXT, hebrew TEXT, is_combined BOOLEAN)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := full_ipa;

  -- Only process if it's a combined form
  IF NOT is_combined THEN
    RETURN result;
  END IF;

  -- Remove prefix IPA patterns
  IF LEFT(hebrew, 1) = 'ו' THEN
    result := regexp_replace(result, '^və', '', 'i');
    result := regexp_replace(result, '^ve', '', 'i');
  END IF;

  IF LEFT(hebrew, 1) = 'ב' THEN
    result := regexp_replace(result, '^bə', '', 'i');
    result := regexp_replace(result, '^be', '', 'i');
  END IF;

  IF LEFT(hebrew, 1) = 'ל' THEN
    result := regexp_replace(result, '^lə', '', 'i');
    result := regexp_replace(result, '^le', '', 'i');
  END IF;

  IF LEFT(hebrew, 1) = 'מ' THEN
    result := regexp_replace(result, '^mə', '', 'i');
    result := regexp_replace(result, '^me', '', 'i');
  END IF;

  IF LEFT(hebrew, 1) = 'כ' THEN
    result := regexp_replace(result, '^kə', '', 'i');
    result := regexp_replace(result, '^ke', '', 'i');
  END IF;

  IF LEFT(hebrew, 1) = 'ה' THEN
    result := regexp_replace(result, '^ha', '', 'i');
    result := regexp_replace(result, '^he', '', 'i');
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION extract_root_ipa(TEXT, TEXT, BOOLEAN) IS 'Extract root IPA by removing prefix patterns - needs manual verification';

-- ============================================================================
-- 4. Populate root_ipa for all words (starting point)
-- ============================================================================
UPDATE words
SET root_ipa = extract_root_ipa(ipa, hebrew, is_combined_form)
WHERE ipa IS NOT NULL;

-- ============================================================================
-- 5. Verification query - Check Genesis 1:1
-- ============================================================================
/*
SELECT
  w.hebrew,
  w.meaning,
  w.root,
  w.is_combined_form,
  w.ipa as full_ipa,
  w.root_ipa,
  CASE
    WHEN w.root_ipa IS NULL THEN '❌ NULL'
    ELSE '✅ ' || w.root_ipa
  END as root_ipa_status
FROM words w
JOIN verses v ON w.verse_id = v.id
WHERE v.book_id = 'genesis'
  AND v.chapter = 1
  AND v.verse_number = 1
ORDER BY w.position;
*/

-- ============================================================================
-- 6. Manual correction examples for Genesis 1:1
-- ============================================================================
-- ⚠️ THESE NEED TO BE MANUALLY VERIFIED AND CORRECTED

-- Example corrections (uncomment and adjust after verification):
/*
-- בְּרֵאשִׁית (태초에) - root: רֵאשִׁית
UPDATE words SET root_ipa = 'reˈʃit'
WHERE hebrew = 'בְּרֵאשִׁית' AND meaning LIKE '%태초%';

-- בָּרָא (창조하셨다) - root: ב-ר-א (not combined, so full IPA is root IPA)
UPDATE words SET root_ipa = 'baˈra'
WHERE hebrew = 'בָּרָא' AND meaning LIKE '%창조%';

-- אֱלֹהִים (하나님)
UPDATE words SET root_ipa = 'ʔɛloˈhim'
WHERE hebrew = 'אֱלֹהִים' AND meaning LIKE '%하나님%';

-- אֵת (~을/를)
UPDATE words SET root_ipa = 'ʔet'
WHERE hebrew = 'אֵת' AND meaning LIKE '%을/를%';

-- הַשָּׁמַיִם (하늘들) - root: שָׁמַיִם
UPDATE words SET root_ipa = 'ʃaˈmajim'
WHERE hebrew = 'הַשָּׁמַיִם' AND meaning LIKE '%하늘%';

-- וְאֵת (그리고 ~을/를) - root: אֵת
UPDATE words SET root_ipa = 'ʔet'
WHERE hebrew = 'וְאֵת' AND meaning LIKE '%그리고%을/를%';

-- הָאָרֶץ (땅) - root: אֶרֶץ
UPDATE words SET root_ipa = 'ʔeˈrets'
WHERE hebrew = 'הָאָרֶץ' AND meaning LIKE '%땅%';
*/

-- ============================================================================
-- 7. Create trigger to auto-populate root_ipa on INSERT/UPDATE
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_populate_root_ipa()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate only if root_ipa is NULL
  IF NEW.root_ipa IS NULL AND NEW.ipa IS NOT NULL THEN
    NEW.root_ipa := extract_root_ipa(NEW.ipa, NEW.hebrew, NEW.is_combined_form);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_populate_root_ipa ON words;

CREATE TRIGGER trigger_auto_populate_root_ipa
BEFORE INSERT OR UPDATE ON words
FOR EACH ROW
EXECUTE FUNCTION auto_populate_root_ipa();

COMMENT ON TRIGGER trigger_auto_populate_root_ipa ON words IS 'Auto-populate root_ipa if NULL (needs manual verification)';

-- ============================================================================
-- Expected Results for Genesis 1:1 (AFTER MANUAL CORRECTION):
-- בְּרֵאשִׁית - full: bəreʃit, root: reˈʃit
-- בָּרָא - full: baˈra, root: baˈra (same, standalone)
-- אֱלֹהִים - full: ʔɛloˈhim, root: ʔɛloˈhim (same, standalone)
-- אֵת - full: ʔet, root: ʔet (same, standalone)
-- הַשָּׁמַיִם - full: haʃaˈmajim, root: ʃaˈmajim
-- וְאֵת - full: vəʔet, root: ʔet
-- הָאָרֶץ - full: haˈʔarɛts, root: ʔeˈrets
-- ============================================================================

-- ============================================================================
-- Rollback Instructions
-- ============================================================================
/*
DROP TRIGGER IF EXISTS trigger_auto_populate_root_ipa ON words;
DROP FUNCTION IF EXISTS auto_populate_root_ipa();
DROP FUNCTION IF EXISTS extract_root_ipa(TEXT, TEXT, BOOLEAN);
ALTER TABLE words DROP COLUMN IF EXISTS root_ipa;
DROP INDEX IF EXISTS idx_words_root_ipa;
*/

-- ============================================================================
-- End of Migration
-- ============================================================================
