-- 기존 icon_url 데이터 확인 및 마이그레이션
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'words' AND column_name = 'icon_url'
    ) THEN
        UPDATE words
        SET flashcard_img_url = icon_url
        WHERE flashcard_img_url IS NULL;

        ALTER TABLE words
        DROP COLUMN icon_url;
    END IF;
END $$;