-- ============================================================================
-- Vocabulary Improvement v2.0 Migration (Safe Mode)
-- Date: 2025-10-22
-- Purpose: Add advanced vocabulary learning features (with IF NOT EXISTS checks)
-- ============================================================================

-- ============================================================================
-- 1. user_book_progress: Track learning progress per book
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_book_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,

  -- Statistics
  total_words INTEGER DEFAULT 0,
  learned_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  progress_percentage DECIMAL DEFAULT 0,

  -- Learning goals
  daily_goal INTEGER DEFAULT 10,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_studied_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

-- Indexes (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_book_progress_user') THEN
    CREATE INDEX idx_user_book_progress_user ON user_book_progress(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_book_progress_book') THEN
    CREATE INDEX idx_user_book_progress_book ON user_book_progress(book_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_book_progress_user_book') THEN
    CREATE INDEX idx_user_book_progress_user_book ON user_book_progress(user_id, book_id);
  END IF;
END $$;

-- ============================================================================
-- 2. hebrew_roots: Hebrew triliteral root system
-- ============================================================================
CREATE TABLE IF NOT EXISTS hebrew_roots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  root TEXT NOT NULL UNIQUE,
  root_hebrew TEXT NOT NULL,

  -- Meaning
  core_meaning TEXT NOT NULL,
  core_meaning_korean TEXT NOT NULL,
  semantic_field TEXT,

  -- Metadata
  frequency INTEGER DEFAULT 0,
  importance INTEGER DEFAULT 1,

  -- Learning materials
  mnemonic TEXT,
  story TEXT,
  emoji TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hebrew_roots_root') THEN
    CREATE INDEX idx_hebrew_roots_root ON hebrew_roots(root);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hebrew_roots_frequency') THEN
    CREATE INDEX idx_hebrew_roots_frequency ON hebrew_roots(frequency DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hebrew_roots_importance') THEN
    CREATE INDEX idx_hebrew_roots_importance ON hebrew_roots(importance DESC);
  END IF;
END $$;

-- ============================================================================
-- 3. word_derivations: Root-to-word derivation relationships
-- ============================================================================
CREATE TABLE IF NOT EXISTS word_derivations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  root_id UUID REFERENCES hebrew_roots(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,

  -- Derivation info
  binyan TEXT,
  pattern TEXT,
  derivation_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(root_id, word_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_word_derivations_root') THEN
    CREATE INDEX idx_word_derivations_root ON word_derivations(root_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_word_derivations_word') THEN
    CREATE INDEX idx_word_derivations_word ON word_derivations(word_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_word_derivations_binyan') THEN
    CREATE INDEX idx_word_derivations_binyan ON word_derivations(binyan);
  END IF;
END $$;

-- ============================================================================
-- 4. word_metadata: Objective word difficulty, frequency, importance
-- ============================================================================
CREATE TABLE IF NOT EXISTS word_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_hebrew TEXT NOT NULL UNIQUE,

  -- Frequency
  bible_frequency INTEGER DEFAULT 0,
  genesis_frequency INTEGER DEFAULT 0,
  frequency_rank INTEGER,

  -- Difficulty (1-5)
  objective_difficulty INTEGER DEFAULT 3,
  difficulty_factors JSONB DEFAULT '{}',

  -- Importance (1-5)
  theological_importance INTEGER DEFAULT 3,
  pedagogical_priority INTEGER DEFAULT 3,

  -- Word characteristics
  is_proper_noun BOOLEAN DEFAULT FALSE,
  is_theological_term BOOLEAN DEFAULT FALSE,
  is_common_word BOOLEAN DEFAULT FALSE,

  -- Learning recommendations
  recommended_review_count INTEGER DEFAULT 10,
  min_exposures INTEGER DEFAULT 5,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_word_metadata_hebrew') THEN
    CREATE INDEX idx_word_metadata_hebrew ON word_metadata(word_hebrew);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_word_metadata_frequency') THEN
    CREATE INDEX idx_word_metadata_frequency ON word_metadata(bible_frequency DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_word_metadata_importance') THEN
    CREATE INDEX idx_word_metadata_importance ON word_metadata(theological_importance DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_word_metadata_difficulty') THEN
    CREATE INDEX idx_word_metadata_difficulty ON word_metadata(objective_difficulty);
  END IF;
END $$;

-- ============================================================================
-- 5. user_word_progress_v2: Enhanced SRS tracking with SM-2+
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_word_progress_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_hebrew TEXT NOT NULL,

  -- Core SM-2 fields
  next_review TIMESTAMPTZ NOT NULL,
  interval_days DECIMAL NOT NULL DEFAULT 0,
  ease_factor DECIMAL NOT NULL DEFAULT 2.5,
  review_count INTEGER NOT NULL DEFAULT 0,

  -- NEW: Difficulty tracking
  difficulty_level DECIMAL DEFAULT 3,
  initial_difficulty DECIMAL,

  -- NEW: Detailed performance tracking
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  accuracy_rate DECIMAL DEFAULT 0,

  -- NEW: Learning context
  last_study_context TEXT,
  study_methods JSONB DEFAULT '[]',

  -- NEW: Time tracking
  total_study_time_seconds INTEGER DEFAULT 0,
  average_response_time_seconds DECIMAL DEFAULT 0,

  -- NEW: Leveling system
  mastery_level INTEGER DEFAULT 0,
  last_level_up_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_studied_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,

  UNIQUE(user_id, word_hebrew)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_word_progress_v2_user') THEN
    CREATE INDEX idx_user_word_progress_v2_user ON user_word_progress_v2(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_word_progress_v2_next_review') THEN
    CREATE INDEX idx_user_word_progress_v2_next_review ON user_word_progress_v2(user_id, next_review);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_word_progress_v2_mastery') THEN
    CREATE INDEX idx_user_word_progress_v2_mastery ON user_word_progress_v2(user_id, mastery_level);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_word_progress_v2_difficulty') THEN
    CREATE INDEX idx_user_word_progress_v2_difficulty ON user_word_progress_v2(user_id, difficulty_level);
  END IF;
END $$;

-- ============================================================================
-- Functions for automatic updates
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_book_progress_updated_at ON user_book_progress;
CREATE TRIGGER update_user_book_progress_updated_at
  BEFORE UPDATE ON user_book_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hebrew_roots_updated_at ON hebrew_roots;
CREATE TRIGGER update_hebrew_roots_updated_at
  BEFORE UPDATE ON hebrew_roots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_word_metadata_updated_at ON word_metadata;
CREATE TRIGGER update_word_metadata_updated_at
  BEFORE UPDATE ON word_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_word_progress_v2_updated_at ON user_word_progress_v2;
CREATE TRIGGER update_user_word_progress_v2_updated_at
  BEFORE UPDATE ON user_word_progress_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Helper function: Calculate derived word count for a root
-- ============================================================================
CREATE OR REPLACE FUNCTION get_derived_word_count(p_root_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM word_derivations
    WHERE root_id = p_root_id
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper function: Calculate book progress percentage
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_book_progress_percentage(
  p_user_id UUID,
  p_book_id TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  v_total INTEGER;
  v_learned INTEGER;
BEGIN
  -- Get total words in book
  SELECT COUNT(DISTINCT w.hebrew)
  INTO v_total
  FROM words w
  INNER JOIN verses v ON w.verse_id = v.id
  WHERE v.book_id = p_book_id;

  -- Get learned words count
  SELECT COUNT(DISTINCT uwp.word_hebrew)
  INTO v_learned
  FROM user_word_progress_v2 uwp
  INNER JOIN words w ON uwp.word_hebrew = w.hebrew
  INNER JOIN verses v ON w.verse_id = v.id
  WHERE uwp.user_id = p_user_id
    AND v.book_id = p_book_id
    AND uwp.mastery_level >= 1;

  IF v_total = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((v_learned::DECIMAL / v_total) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Sample Data for Testing
-- ============================================================================
INSERT INTO hebrew_roots (root, root_hebrew, core_meaning, core_meaning_korean, semantic_field, frequency, importance, mnemonic, story, emoji)
VALUES
  ('ב-ר-א', 'ברא', 'to create', '창조하다', 'creation, formation', 54, 5,
   '바-라 → 바로 무에서 유를 만들다',
   '이 어근은 오직 하나님만이 할 수 있는 "무에서 유를 창조하는" 행위를 나타냅니다. 창세기 1:1에서 처음 등장하며, 성경 전체에서 54번 사용됩니다.',
   '✨'),

  ('ע-ש-ה', 'עשה', 'to make, to do', '만들다, 행하다', 'making, doing, acting', 2632, 5,
   '아-사 → 만들다 (ברא보다 일반적)',
   '브라(ברא)가 "무에서 유를 창조"라면, 아사(עשה)는 "이미 있는 재료로 만들다"입니다. 인간도 사용할 수 있는 단어입니다.',
   '🔨'),

  ('א-מ-ר', 'אמר', 'to say, to speak', '말하다', 'speaking, communication', 5316, 5,
   '아-마르 → 말하다',
   '성경에서 가장 자주 등장하는 동사 중 하나. "하나님이 말씀하시되"에서 사용됩니다.',
   '💬'),

  ('ה-י-ה', 'היה', 'to be, to become', '되다, 존재하다', 'being, existence', 3576, 5,
   '하-야 → 되다, 존재하다',
   '존재와 생성을 나타내는 기본 동사. "있으라 하시매 있었고"에서 사용됩니다.',
   '🌟')
ON CONFLICT (root) DO NOTHING;

-- ============================================================================
-- End of Migration
-- ============================================================================
