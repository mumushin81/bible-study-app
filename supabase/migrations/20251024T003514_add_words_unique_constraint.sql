-- Add unique constraint to prevent duplicate words
-- Created: 2025-10-24T00:35:14.676Z
-- Purpose: Ensure (hebrew, verse_id) combinations are unique

ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_unique
UNIQUE (hebrew, verse_id);

-- Rollback:
-- ALTER TABLE words DROP CONSTRAINT IF EXISTS words_hebrew_verse_unique;
