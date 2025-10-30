-- ============================================================================
-- Fix Remaining Duplicates (Service Role로 실행)
-- Date: 2025-10-30
-- ============================================================================

-- Supabase SQL Editor는 service_role 권한으로 실행되므로 RLS를 무시하고 모든 데이터를 볼 수 있습니다.

-- ============================================================================
-- Step 1: 현재 남아있는 중복 확인
-- ============================================================================

SELECT
  verse_id,
  position,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY created_at) as word_ids,
  ARRAY_AGG(hebrew ORDER BY created_at) as hebrew_words,
  ARRAY_AGG(created_at ORDER BY created_at) as created_dates
FROM words
GROUP BY verse_id, position
HAVING COUNT(*) > 1
ORDER BY verse_id, position;

-- ============================================================================
-- Step 2: 중복 삭제 (가장 오래된 것만 유지)
-- ============================================================================

WITH duplicates AS (
  SELECT
    id,
    verse_id,
    position,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY verse_id, position ORDER BY created_at ASC) as row_num
  FROM words
)
DELETE FROM words
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE row_num > 1
);

-- 삭제된 행 수가 표시됩니다

-- ============================================================================
-- Step 3: 검증 (0 rows가 나와야 함)
-- ============================================================================

SELECT
  verse_id,
  position,
  COUNT(*) as duplicate_count
FROM words
GROUP BY verse_id, position
HAVING COUNT(*) > 1
ORDER BY verse_id, position;

-- Expected: 0 rows

-- ============================================================================
-- Step 4: 전체 데이터 무결성 확인
-- ============================================================================

-- 총 단어 수 확인
SELECT COUNT(*) as total_words FROM words;

-- 구절별 단어 수 확인 (상위 10개)
SELECT
  verse_id,
  COUNT(*) as word_count,
  STRING_AGG(hebrew, ' ' ORDER BY position) as verse_text
FROM words
GROUP BY verse_id
ORDER BY verse_id
LIMIT 10;

-- position 값 확인 (음수나 이상한 값이 있는지)
SELECT
  verse_id,
  position,
  hebrew
FROM words
WHERE position < 0
ORDER BY verse_id, position;

-- Expected: 0 rows
