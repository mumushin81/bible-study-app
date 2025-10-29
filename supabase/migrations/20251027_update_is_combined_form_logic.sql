-- ============================================================================
-- Update is_combined_form Detection Logic
-- Date: 2025-10-27
-- Purpose: Improve accuracy by using root field analysis
-- ============================================================================

-- ============================================================================
-- 1. Drop old function
-- ============================================================================
DROP FUNCTION IF EXISTS is_word_combined(TEXT);

-- ============================================================================
-- 2. Create improved function that uses both hebrew and root
-- ============================================================================
CREATE OR REPLACE FUNCTION is_word_combined_accurate(hebrew_text TEXT, root_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  first_char TEXT;
  prefixes TEXT[] := ARRAY['ו', 'ב', 'ל', 'מ', 'כ', 'ה'];
BEGIN
  -- 1. If root contains "+", it's definitely a combined form
  IF root_text ~ '\+' THEN
    RETURN true;
  END IF;

  -- 2. Check if hebrew starts with a prefix
  IF LENGTH(hebrew_text) > 1 THEN
    first_char := LEFT(hebrew_text, 1);

    IF first_char = ANY(prefixes) THEN
      -- Check if root starts with the same character
      -- If root doesn't start with it, then it's a prefix
      IF LEFT(root_text, 1) != first_char THEN
        RETURN true;
      END IF;
    END IF;
  END IF;

  -- 3. Default to standalone word
  RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_word_combined_accurate(TEXT, TEXT) IS 'Accurately detects if a Hebrew word is combined using both hebrew and root fields';

-- ============================================================================
-- 3. Update all existing words with accurate detection
-- ============================================================================
UPDATE words
SET is_combined_form = is_word_combined_accurate(hebrew, root);

-- ============================================================================
-- 4. Create trigger to auto-update on INSERT/UPDATE
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_update_is_combined_form()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_combined_form := is_word_combined_accurate(NEW.hebrew, NEW.root);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_update_is_combined_form ON words;

-- Create new trigger
CREATE TRIGGER trigger_auto_update_is_combined_form
BEFORE INSERT OR UPDATE ON words
FOR EACH ROW
EXECUTE FUNCTION auto_update_is_combined_form();

COMMENT ON TRIGGER trigger_auto_update_is_combined_form ON words IS 'Automatically updates is_combined_form when hebrew or root changes';

-- ============================================================================
-- 5. Verify results
-- ============================================================================
-- Run this to check Genesis 1:1 results:
/*
SELECT
  w.hebrew,
  w.meaning,
  w.root,
  w.is_combined_form,
  CASE
    WHEN w.is_combined_form THEN '✅ 결합형 (형태소 분석 표시)'
    ELSE '❌ 단독형 (형태소 분석 숨김)'
  END as display_status
FROM words w
JOIN verses v ON w.verse_id = v.id
WHERE v.book_id = 'genesis'
  AND v.chapter = 1
  AND v.verse_number = 1
ORDER BY w.position;
*/

-- ============================================================================
-- Expected Results for Genesis 1:1:
-- בְּרֵאשִׁית (태초에) - root: רֵאשִׁית → TRUE (ב is prefix)
-- בָּרָא (창조하셨다) - root: ב-ר-א → FALSE (ב is part of root)
-- אֱלֹהִים (하나님) - root: אֱלֹהַּ → FALSE (no prefix)
-- אֵת (~을/를) - root: אֵת → FALSE (no prefix)
-- הַשָּׁמַיִם (하늘들) - root: שָׁמַיִם → TRUE (ה is prefix)
-- וְאֵת (그리고 ~을/를) - root: וְ + אֵת → TRUE (has +)
-- הָאָרֶץ (땅) - root: אֶרֶץ → TRUE (ה is prefix)
-- ============================================================================

-- ============================================================================
-- Rollback Instructions
-- ============================================================================
/*
DROP TRIGGER IF EXISTS trigger_auto_update_is_combined_form ON words;
DROP FUNCTION IF EXISTS auto_update_is_combined_form();
DROP FUNCTION IF EXISTS is_word_combined_accurate(TEXT, TEXT);
UPDATE words SET is_combined_form = false;
*/

-- ============================================================================
-- End of Migration
-- ============================================================================
