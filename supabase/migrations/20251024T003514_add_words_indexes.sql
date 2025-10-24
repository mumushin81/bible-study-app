-- Add indexes to words table for better performance
-- Created: 2025-10-24T00:35:14.678Z
-- Purpose: Optimize queries on words table

CREATE INDEX IF NOT EXISTS idx_words_verse_id ON words(verse_id);

CREATE INDEX IF NOT EXISTS idx_words_hebrew ON words(hebrew);

CREATE INDEX IF NOT EXISTS idx_words_hebrew_verse ON words(hebrew, verse_id);

-- Rollback:
-- DROP INDEX IF EXISTS idx_words_verse_id;
-- DROP INDEX IF EXISTS idx_words_hebrew;
-- DROP INDEX IF EXISTS idx_words_hebrew_verse;
