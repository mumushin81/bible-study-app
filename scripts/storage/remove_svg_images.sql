-- Remove SVG images from hebrew_words and word_etymology tables
UPDATE hebrew_words SET icon_url = NULL WHERE icon_url LIKE '<%svg%>';
UPDATE word_etymology SET icon_url = NULL WHERE icon_url LIKE '<%svg%>';

-- Optionally, log removed SVG image URLs (for record-keeping)
CREATE TEMPORARY TABLE removed_svg_images AS
SELECT 'hebrew_words' AS table_name, word, icon_url
FROM hebrew_words
WHERE icon_url LIKE '<%svg%>'
UNION
SELECT 'word_etymology' AS table_name, word, icon_url
FROM word_etymology
WHERE icon_url LIKE '<%svg%>';

-- Display removed SVG image URLs (optional)
SELECT * FROM removed_svg_images;

-- Drop the temporary table
DROP TABLE removed_svg_images;