-- Add derivatives column to hebrew_roots table
-- Stores derivative words as JSONB array

ALTER TABLE hebrew_roots 
ADD COLUMN IF NOT EXISTS derivatives JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN hebrew_roots.derivatives IS 'Array of derivative words with hebrew, ipa, korean, meaning, grammar fields';
