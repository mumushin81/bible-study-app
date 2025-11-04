-- 이미지 URL 마이그레이션 통합 스크립트

-- 1. 기존 icon_url 컬럼이 있는지 확인 및 데이터 마이그레이션
DO $$
BEGIN
    -- icon_url 컬럼이 존재하는지 확인
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'words' AND column_name = 'icon_url'
    ) THEN
        -- flashcard_img_url 컬럼이 없다면 추가
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'words' AND column_name = 'flashcard_img_url'
        ) THEN
            ALTER TABLE words
            ADD COLUMN flashcard_img_url TEXT;
        END IF;

        -- icon_url에서 flashcard_img_url로 데이터 마이그레이션
        UPDATE words
        SET flashcard_img_url = icon_url
        WHERE flashcard_img_url IS NULL AND icon_url IS NOT NULL;

        -- icon_url 컬럼 제거
        ALTER TABLE words
        DROP COLUMN icon_url;
    ELSE
        -- icon_url 컬럼이 없다면 flashcard_img_url 컬럼만 확실히 존재하도록 함
        ALTER TABLE words
        ADD COLUMN IF NOT EXISTS flashcard_img_url TEXT;
    END IF;
END $$;

-- 2. flashcard_img_url 컬럼에 대한 인덱스 추가 (선택적)
CREATE INDEX IF NOT EXISTS idx_words_flashcard_img_url ON words(flashcard_img_url);

-- 3. SVG 관련 컬럼 제거 (필요한 경우)
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

-- 4. 컬럼 설명 추가
COMMENT ON COLUMN words.flashcard_img_url IS 'AI 생성 플래시카드 이미지 URL (단어당 하나의 대표 이미지)';