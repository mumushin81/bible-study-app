-- Add pronunciation field to hebrew_roots table
ALTER TABLE hebrew_roots
ADD COLUMN IF NOT EXISTS pronunciation TEXT;

-- Add comment
COMMENT ON COLUMN hebrew_roots.pronunciation IS 'IPA or Korean pronunciation guide for the root';

-- Update existing roots with pronunciation
UPDATE hebrew_roots SET pronunciation = 'ba-ra' WHERE root = 'ב-ר-א';
UPDATE hebrew_roots SET pronunciation = 'a-sa' WHERE root = 'ע-ש-ה';
UPDATE hebrew_roots SET pronunciation = 'a-mar' WHERE root = 'א-מ-ר';
UPDATE hebrew_roots SET pronunciation = 'ha-ya' WHERE root = 'ה-י-ה';
UPDATE hebrew_roots SET pronunciation = 'ra-a' WHERE root = 'ר-א-ה';
UPDATE hebrew_roots SET pronunciation = 'ya-da' WHERE root = 'י-ד-ע';
UPDATE hebrew_roots SET pronunciation = 'na-tan' WHERE root = 'נ-ת-ן';
UPDATE hebrew_roots SET pronunciation = 'la-kach' WHERE root = 'ל-ק-ח';
UPDATE hebrew_roots SET pronunciation = 'ha-lach' WHERE root = 'ה-ל-ך';
UPDATE hebrew_roots SET pronunciation = 'bo' WHERE root = 'ב-ו-א';
UPDATE hebrew_roots SET pronunciation = 'ya-tsa' WHERE root = 'י-צ-א';
UPDATE hebrew_roots SET pronunciation = 'cha-ya' WHERE root = 'ח-י-ה';
UPDATE hebrew_roots SET pronunciation = 'mut' WHERE root = 'מ-ו-ת';
UPDATE hebrew_roots SET pronunciation = 'ka-ra' WHERE root = 'ק-ר-א';
UPDATE hebrew_roots SET pronunciation = 'da-bar' WHERE root = 'ד-ב-ר';
UPDATE hebrew_roots SET pronunciation = 'ba-rach' WHERE root = 'ב-ר-ך';
UPDATE hebrew_roots SET pronunciation = 'a-rar' WHERE root = 'א-ר-ר';
UPDATE hebrew_roots SET pronunciation = 'sha-ma' WHERE root = 'ש-מ-ע';
UPDATE hebrew_roots SET pronunciation = 'a-hav' WHERE root = 'א-ה-ב';
UPDATE hebrew_roots SET pronunciation = 'sa-ne' WHERE root = 'ש-נ-א';
UPDATE hebrew_roots SET pronunciation = 'za-char' WHERE root = 'ז-כ-ר';
UPDATE hebrew_roots SET pronunciation = 'sha-chach' WHERE root = 'ש-כ-ח';
UPDATE hebrew_roots SET pronunciation = 'ya-shav' WHERE root = 'י-ש-ב';
UPDATE hebrew_roots SET pronunciation = 'a-la' WHERE root = 'ע-ל-ה';
UPDATE hebrew_roots SET pronunciation = 'ya-rad' WHERE root = 'י-ר-ד';
UPDATE hebrew_roots SET pronunciation = 'a-chal' WHERE root = 'א-כ-ל';
UPDATE hebrew_roots SET pronunciation = 'sha-ta' WHERE root = 'ש-ת-ה';
UPDATE hebrew_roots SET pronunciation = 'tov' WHERE root = 'ט-ו-ב';
UPDATE hebrew_roots SET pronunciation = 'ra-a' WHERE root = 'ר-ע-ע';
UPDATE hebrew_roots SET pronunciation = 'a-vad' WHERE root = 'ע-ב-ד';
UPDATE hebrew_roots SET pronunciation = 'sha-vat' WHERE root = 'ש-ב-ת';
UPDATE hebrew_roots SET pronunciation = 'bi-kesh' WHERE root = 'ב-ק-ש';
UPDATE hebrew_roots SET pronunciation = 'ma-tsa' WHERE root = 'מ-צ-א';
UPDATE hebrew_roots SET pronunciation = 'ya-re' WHERE root = 'י-ר-א';
UPDATE hebrew_roots SET pronunciation = 'a-men' WHERE root = 'א-מ-ן';
UPDATE hebrew_roots SET pronunciation = 'ba-char' WHERE root = 'ב-ח-ר';
UPDATE hebrew_roots SET pronunciation = 'ma-as' WHERE root = 'מ-א-ס';
UPDATE hebrew_roots SET pronunciation = 'sha-mar' WHERE root = 'ש-מ-ר';
UPDATE hebrew_roots SET pronunciation = 'ra-va' WHERE root = 'ר-ב-ה';
UPDATE hebrew_roots SET pronunciation = 'pa-ra' WHERE root = 'פ-ר-ה';
UPDATE hebrew_roots SET pronunciation = 'ma-lach' WHERE root = 'מ-ל-ך';
UPDATE hebrew_roots SET pronunciation = 'ra-da' WHERE root = 'ר-ד-ה';
