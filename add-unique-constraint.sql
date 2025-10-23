-- ========================================
-- UNIQUE 제약조건 추가
-- ========================================
-- 목적: verses 테이블에서 (book_id, chapter, verse_number) 조합이
--       고유하도록 보장하여 중복 데이터 삽입 방지
--
-- 실행 방법:
-- 1. Supabase Dashboard 로그인
-- 2. SQL Editor 열기
-- 3. 이 SQL 실행
--
-- 예상 결과:
-- - 이후 동일한 (book_id, chapter, verse_number)로 INSERT 시도 시 에러 발생
-- - 데이터 무결성 보장
-- ========================================

ALTER TABLE verses
ADD CONSTRAINT unique_verse
UNIQUE (book_id, chapter, verse_number);
