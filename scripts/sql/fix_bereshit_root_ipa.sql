-- ============================================================================
-- Fix בְּרֵאשִׁית (태초에) 어근 IPA 발음
-- ============================================================================

-- 현재 문제:
-- 어근 IPA: reʃit (강세 표시 없음)
-- 올바른 IPA: reˈʃit (강세 표시 ˈ 포함)

-- 수정
UPDATE words
SET root_ipa = 'reˈʃit'
WHERE hebrew = 'בְּרֵאשִׁית'
  AND meaning LIKE '%태초%';

-- 확인
SELECT
  hebrew,
  meaning,
  root,
  ipa as full_ipa,
  root_ipa,
  is_combined_form
FROM words
WHERE hebrew = 'בְּרֵאשִׁית';

-- 예상 결과:
-- hebrew: בְּרֵאשִׁית
-- meaning: 태초에, 처음에
-- root: רֵאשִׁית (레쉬트)
-- full_ipa: bəreʃit
-- root_ipa: reˈʃit ✅ (강세 표시 포함)
-- is_combined_form: true
