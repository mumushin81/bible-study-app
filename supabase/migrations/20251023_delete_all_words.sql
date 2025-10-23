-- =====================================================
-- Words 테이블 전체 데이터 삭제
-- =====================================================
-- 목적: 데이터 구조 불일치 문제 해결을 위해 모든 단어 삭제
-- 작성일: 2025-10-23
-- =====================================================

-- 1. 백업 테이블 생성 (혹시 몰라서)
CREATE TABLE IF NOT EXISTS words_backup_20251023 AS
SELECT * FROM words;

-- 2. Words 테이블의 모든 데이터 삭제
DELETE FROM words;

-- 3. 삭제 결과 확인
SELECT COUNT(*) as remaining_words FROM words;

-- =====================================================
-- 재입력 시 참고 사항:
--
-- 필수 필드 (VERSE_CREATION_GUIDELINES.md 기준):
-- - hebrew: string
-- - meaning: string
-- - ipa: string
-- - korean: string
-- - letters: string ⭐ 반드시 포함
-- - root: string
-- - grammar: string
-- - emoji: string
-- - icon_svg: string ⭐ 반드시 포함
--
-- 선택 필드:
-- - related_words: string[]
-- - structure: string
-- - category: string
-- =====================================================

-- 백업 복원이 필요한 경우:
-- INSERT INTO words SELECT * FROM words_backup_20251023;
