-- Add etymology_simple column to hebrew_roots table
-- Simple etymology explanation for flashcard display (2-3 sentences)

ALTER TABLE hebrew_roots
ADD COLUMN IF NOT EXISTS etymology_simple TEXT;

COMMENT ON COLUMN hebrew_roots.etymology_simple IS 'Simple etymology explanation for flashcard display (2-3 sentences)';
