-- ============================================================================
-- Etymology Expansion Migration
-- Date: 2025-10-27
-- Purpose: Add advanced etymology fields to hebrew_roots table
-- ============================================================================

-- ============================================================================
-- 1. Expand hebrew_roots table with etymology fields
-- ============================================================================

-- Add etymology-related columns
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS etymology TEXT;
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS strong_number TEXT;
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS bdb_reference TEXT;
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS cognates JSONB DEFAULT '{}';
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS theological_significance TEXT;
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS historical_usage TEXT;
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS proto_semitic TEXT;
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS ancient_script TEXT;
ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS pictographic_meaning TEXT;

COMMENT ON COLUMN hebrew_roots.etymology IS 'Detailed etymological explanation including Proto-Semitic origins';
COMMENT ON COLUMN hebrew_roots.strong_number IS 'Strong''s Concordance number (e.g., H1254)';
COMMENT ON COLUMN hebrew_roots.bdb_reference IS 'Brown-Driver-Briggs lexicon reference';
COMMENT ON COLUMN hebrew_roots.cognates IS 'Related words in cognate languages: {arabic: "", aramaic: "", akkadian: "", syriac: ""}';
COMMENT ON COLUMN hebrew_roots.theological_significance IS 'Theological and spiritual significance in Scripture';
COMMENT ON COLUMN hebrew_roots.historical_usage IS 'Historical usage patterns in ancient Hebrew texts';
COMMENT ON COLUMN hebrew_roots.proto_semitic IS 'Proto-Semitic root reconstruction';
COMMENT ON COLUMN hebrew_roots.ancient_script IS 'Paleo-Hebrew script representation';
COMMENT ON COLUMN hebrew_roots.pictographic_meaning IS 'Pictographic/symbolic meaning of ancient letters';

-- Add index for Strong's number lookup
CREATE INDEX IF NOT EXISTS idx_hebrew_roots_strong_number ON hebrew_roots(strong_number);

-- ============================================================================
-- 2. Create root_usage_examples table for biblical usage examples
-- ============================================================================

CREATE TABLE IF NOT EXISTS root_usage_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_id UUID REFERENCES hebrew_roots(id) ON DELETE CASCADE,

  -- Biblical reference
  verse_reference TEXT NOT NULL,
  verse_text_hebrew TEXT,
  verse_text_english TEXT,

  -- Context
  context_note TEXT,
  theological_note TEXT,

  -- Metadata
  is_first_occurrence BOOLEAN DEFAULT FALSE,
  is_significant BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_root_usage_examples_root_id ON root_usage_examples(root_id);
CREATE INDEX IF NOT EXISTS idx_root_usage_examples_first_occurrence ON root_usage_examples(root_id, is_first_occurrence);

COMMENT ON TABLE root_usage_examples IS 'Significant biblical usage examples for each root';
COMMENT ON COLUMN root_usage_examples.is_first_occurrence IS 'Whether this is the first occurrence of the root in Scripture';
COMMENT ON COLUMN root_usage_examples.is_significant IS 'Whether this is a theologically significant usage';

-- ============================================================================
-- 3. Create root_semantic_network table for related roots
-- ============================================================================

CREATE TABLE IF NOT EXISTS root_semantic_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_id UUID REFERENCES hebrew_roots(id) ON DELETE CASCADE,
  related_root_id UUID REFERENCES hebrew_roots(id) ON DELETE CASCADE,

  -- Relationship type
  relationship_type TEXT CHECK (relationship_type IN (
    'synonym',      -- Similar meaning
    'antonym',      -- Opposite meaning
    'cognate',      -- Related etymologically
    'conceptual',   -- Conceptually related
    'phonetic'      -- Similar sounding
  )),

  -- Relationship description
  relationship_note TEXT,
  strength INTEGER DEFAULT 1 CHECK (strength BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(root_id, related_root_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_root_semantic_network_root ON root_semantic_network(root_id);
CREATE INDEX IF NOT EXISTS idx_root_semantic_network_related ON root_semantic_network(related_root_id);
CREATE INDEX IF NOT EXISTS idx_root_semantic_network_type ON root_semantic_network(relationship_type);

COMMENT ON TABLE root_semantic_network IS 'Semantic relationships between Hebrew roots';
COMMENT ON COLUMN root_semantic_network.strength IS 'Relationship strength (1=weak, 5=strong)';

-- ============================================================================
-- 4. Enhanced word_derivations table (add more metadata)
-- ============================================================================

ALTER TABLE word_derivations ADD COLUMN IF NOT EXISTS derivation_type TEXT;
ALTER TABLE word_derivations ADD COLUMN IF NOT EXISTS morphological_pattern TEXT;
ALTER TABLE word_derivations ADD COLUMN IF NOT EXISTS semantic_shift TEXT;

COMMENT ON COLUMN word_derivations.derivation_type IS 'Type of derivation: direct, prefixed, suffixed, compound';
COMMENT ON COLUMN word_derivations.morphological_pattern IS 'Specific morphological pattern (e.g., CaCaC, CiCeC)';
COMMENT ON COLUMN word_derivations.semantic_shift IS 'How the meaning shifted from root to derivative';

-- ============================================================================
-- 5. Create derivative_words table for comprehensive derivative info
-- ============================================================================

CREATE TABLE IF NOT EXISTS derivative_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_id UUID REFERENCES hebrew_roots(id) ON DELETE CASCADE,

  -- Word information
  hebrew TEXT NOT NULL,
  ipa TEXT,
  korean TEXT,
  meaning TEXT NOT NULL,
  grammar TEXT,

  -- Morphology
  binyan TEXT,
  pattern TEXT,
  derivation_note TEXT,

  -- Frequency and importance
  bible_frequency INTEGER DEFAULT 0,
  importance INTEGER DEFAULT 1 CHECK (importance BETWEEN 1 AND 5),

  -- Learning
  example_verse_reference TEXT,
  mnemonic TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(root_id, hebrew)
);

CREATE INDEX IF NOT EXISTS idx_derivative_words_root ON derivative_words(root_id);
CREATE INDEX IF NOT EXISTS idx_derivative_words_hebrew ON derivative_words(hebrew);
CREATE INDEX IF NOT EXISTS idx_derivative_words_frequency ON derivative_words(bible_frequency DESC);

COMMENT ON TABLE derivative_words IS 'Comprehensive list of derivative words for each root';
COMMENT ON COLUMN derivative_words.binyan IS 'Hebrew verb stem/binyan (Qal, Piel, Hiphil, etc.)';
COMMENT ON COLUMN derivative_words.pattern IS 'Morphological pattern of derivation';

-- ============================================================================
-- 6. Helper functions
-- ============================================================================

-- Function to get all derivatives for a root
CREATE OR REPLACE FUNCTION get_root_derivatives(p_root_id UUID)
RETURNS TABLE (
  hebrew TEXT,
  ipa TEXT,
  korean TEXT,
  meaning TEXT,
  grammar TEXT,
  frequency INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dw.hebrew,
    dw.ipa,
    dw.korean,
    dw.meaning,
    dw.grammar,
    dw.bible_frequency as frequency
  FROM derivative_words dw
  WHERE dw.root_id = p_root_id
  ORDER BY dw.bible_frequency DESC, dw.importance DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get root etymology data
CREATE OR REPLACE FUNCTION get_root_etymology(p_root_text TEXT)
RETURNS TABLE (
  root TEXT,
  root_hebrew TEXT,
  etymology TEXT,
  strong_number TEXT,
  proto_semitic TEXT,
  cognates JSONB,
  theological_significance TEXT,
  story TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    hr.root,
    hr.root_hebrew,
    hr.etymology,
    hr.strong_number,
    hr.proto_semitic,
    hr.cognates,
    hr.theological_significance,
    hr.story
  FROM hebrew_roots hr
  WHERE hr.root = p_root_text OR hr.root_hebrew = p_root_text
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Sample data for testing (will be replaced by Firecrawl data)
-- ============================================================================

-- Update ב-ר-א with sample etymology
UPDATE hebrew_roots
SET
  etymology = 'Proto-Semitic *br'' (to create, cut, shape). Found in Akkadian barû (to build, create), Arabic bara''a (to create, shape). The root conveys the concept of bringing something into existence that did not exist before, particularly through divine action.',
  strong_number = 'H1254',
  bdb_reference = 'BDB 135',
  cognates = '{
    "arabic": "بَرَأَ (bara''a) - to create",
    "aramaic": "בְּרָא (b''ra) - to create",
    "akkadian": "barû - to build, create",
    "syriac": "ܒܪܐ (bra) - to create"
  }'::JSONB,
  theological_significance = 'This root is exclusively used for God''s creative activity in the Old Testament. It emphasizes creation ex nihilo (out of nothing), distinguishing divine creation from human making (עשה). The theological weight of ברא establishes God as the sole source of all existence.',
  historical_usage = 'First appears in Genesis 1:1, establishing the foundational narrative of creation. Used 54 times in the Hebrew Bible, primarily in Genesis and Isaiah. In post-exilic literature, it emphasizes God''s ongoing creative power.',
  proto_semitic = '*br'' (create, cut, separate)',
  ancient_script = '𐤁𐤓𐤀',
  pictographic_meaning = 'Bet (house/tent) + Resh (head) + Aleph (ox/strength) = The strong head of the house creating'
WHERE root = 'ב-ר-א';

-- ============================================================================
-- 8. RLS Policies (read-only for all users)
-- ============================================================================

ALTER TABLE root_usage_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE root_semantic_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE derivative_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Root usage examples are viewable by everyone"
  ON root_usage_examples FOR SELECT
  USING (true);

CREATE POLICY "Root semantic network is viewable by everyone"
  ON root_semantic_network FOR SELECT
  USING (true);

CREATE POLICY "Derivative words are viewable by everyone"
  ON derivative_words FOR SELECT
  USING (true);

-- ============================================================================
-- End of Migration
-- ============================================================================
