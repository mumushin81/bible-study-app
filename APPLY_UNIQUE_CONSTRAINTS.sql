-- ============================================================================
-- Apply Unique Constraints (중복 제거 후 실행)
-- Date: 2025-10-30
-- ============================================================================

-- 이 SQL은 중복 데이터 제거 후에 실행하세요!
-- 스크립트 scripts/migrations/fixDuplicates.ts 실행 완료 후 적용

-- ============================================================================
-- Unique 제약 조건 추가
-- ============================================================================

-- words 테이블: (verse_id, position) 중복 방지
ALTER TABLE words
  ADD CONSTRAINT unique_word_position
  UNIQUE (verse_id, position);

-- verses 테이블: (book_id, chapter, verse_number) 중복 방지
ALTER TABLE verses
  ADD CONSTRAINT unique_verse_reference
  UNIQUE (book_id, chapter, verse_number);

-- ============================================================================
-- Check 제약 조건 추가
-- ============================================================================

-- words.position은 0 이상이어야 함
ALTER TABLE words
  ADD CONSTRAINT check_word_position_nonnegative
  CHECK (position >= 0);

-- verses.verse_number는 1 이상이어야 함
ALTER TABLE verses
  ADD CONSTRAINT check_verse_number_positive
  CHECK (verse_number > 0);

-- verses.chapter는 1 이상이어야 함
ALTER TABLE verses
  ADD CONSTRAINT check_chapter_positive
  CHECK (chapter > 0);

-- ============================================================================
-- 검증 쿼리
-- ============================================================================

-- Unique constraint 확인
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name
FROM pg_constraint
WHERE contype = 'u'
  AND conrelid::regclass::text IN ('words', 'verses')
ORDER BY table_name, constraint_name;

-- Expected output:
-- constraint_name           | table_name
-- -------------------------+------------
-- unique_verse_reference   | verses
-- unique_word_position     | words

-- Check constraint 확인
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name
FROM pg_constraint
WHERE contype = 'c'
  AND conrelid::regclass::text IN ('words', 'verses')
ORDER BY table_name, constraint_name;

-- Expected output:
-- constraint_name                    | table_name
-- ----------------------------------+------------
-- check_chapter_positive            | verses
-- check_verse_number_positive       | verses
-- check_word_position_nonnegative   | words
