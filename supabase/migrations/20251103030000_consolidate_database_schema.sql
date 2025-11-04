-- 데이터베이스 스키마 통합 마이그레이션

-- 1. flashcard_img_url 컬럼 추가 및 데이터 마이그레이션
DO $$
BEGIN
    -- flashcard_img_url 컬럼 추가 (이미 존재하면 건너뜀)
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'words' AND column_name = 'flashcard_img_url'
    ) THEN
        ALTER TABLE words
        ADD COLUMN flashcard_img_url TEXT;
    END IF;

    -- icon_url이 존재하면 데이터 마이그레이션
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'words' AND column_name = 'icon_url'
    ) THEN
        UPDATE words
        SET flashcard_img_url = icon_url
        WHERE flashcard_img_url IS NULL;

        -- icon_url 컬럼 제거
        ALTER TABLE words
        DROP COLUMN icon_url;
    END IF;
END $$;

-- 2. hebrew_roots 테이블 생성 (존재하지 않는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'hebrew_roots'
    ) THEN
        CREATE TABLE hebrew_roots (
            root TEXT PRIMARY KEY,
            root_hebrew TEXT,
            story TEXT,
            etymology_simple TEXT,
            emoji TEXT,
            core_meaning TEXT,
            core_meaning_korean TEXT,
            pronunciation TEXT
        );
    END IF;
END $$;

-- 3. 기존 icon_svg 컬럼 제거
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'words' AND column_name = 'icon_svg'
    ) THEN
        ALTER TABLE words
        DROP COLUMN icon_svg;
    END IF;
END $$;

-- 4. 컬럼 및 테이블 설명 추가
COMMENT ON COLUMN words.flashcard_img_url IS 'AI 생성 플래시카드 이미지 URL (단어당 하나의 대표 이미지)';
COMMENT ON TABLE hebrew_roots IS '히브리어 어근 정보 및 어원 테이블';