-- Add icon_svg and letters columns to words table

-- Add letters column (글자별 발음 분해)
ALTER TABLE words
ADD COLUMN IF NOT EXISTS letters TEXT;

-- Add icon_svg column (커스텀 SVG 아이콘)
ALTER TABLE words
ADD COLUMN IF NOT EXISTS icon_svg TEXT;

-- Add comment for documentation
COMMENT ON COLUMN words.letters IS '글자별 발음 분해 (예: "ש(sh) + ל(l) + ו(o) + ם(m)")';
COMMENT ON COLUMN words.icon_svg IS '화려한 커스텀 SVG 아이콘 코드 (3-4+ 그라디언트, 4-6 색상)';
