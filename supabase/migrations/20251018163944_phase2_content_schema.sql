-- Phase 2.1: Content Database Schema
-- Bible Study App - Books, Verses, Words, and Commentaries

-- ============================================================================
-- Books Table
-- ============================================================================
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  total_chapters INTEGER NOT NULL,
  testament TEXT CHECK (testament IN ('old', 'new')),
  category TEXT NOT NULL,
  category_emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE books IS 'Bible books metadata';
COMMENT ON COLUMN books.id IS 'Book identifier (e.g., "genesis", "exodus")';
COMMENT ON COLUMN books.name IS 'Hebrew or original language name';
COMMENT ON COLUMN books.english_name IS 'English name of the book';
COMMENT ON COLUMN books.testament IS 'Old or New Testament';
COMMENT ON COLUMN books.category IS 'Book category (e.g., "Torah", "Prophets")';

-- ============================================================================
-- Verses Table
-- ============================================================================
CREATE TABLE verses (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  reference TEXT NOT NULL,
  hebrew TEXT NOT NULL,
  ipa TEXT NOT NULL,
  korean_pronunciation TEXT NOT NULL,
  literal TEXT,
  translation TEXT,
  modern TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE verses IS 'Bible verses with translations and pronunciations';
COMMENT ON COLUMN verses.id IS 'Verse identifier (e.g., "genesis_1_1")';
COMMENT ON COLUMN verses.reference IS 'Human-readable reference (e.g., "Genesis 1:1")';
COMMENT ON COLUMN verses.hebrew IS 'Hebrew text';
COMMENT ON COLUMN verses.ipa IS 'IPA pronunciation';
COMMENT ON COLUMN verses.korean_pronunciation IS 'Korean pronunciation guide';
COMMENT ON COLUMN verses.literal IS 'Literal translation';
COMMENT ON COLUMN verses.translation IS 'Standard translation';
COMMENT ON COLUMN verses.modern IS 'Modern/simplified translation';

-- ============================================================================
-- Words Table (Fully Normalized)
-- ============================================================================
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id TEXT REFERENCES verses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  hebrew TEXT NOT NULL,
  meaning TEXT NOT NULL,
  ipa TEXT NOT NULL,
  korean TEXT NOT NULL,
  root TEXT NOT NULL,
  grammar TEXT NOT NULL,
  structure TEXT,
  emoji TEXT,
  category TEXT CHECK (category IN ('noun', 'verb', 'adjective', 'preposition', 'particle')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE words IS 'Individual Hebrew words with grammatical analysis';
COMMENT ON COLUMN words.position IS 'Position of word in verse (0-indexed)';
COMMENT ON COLUMN words.root IS 'Hebrew root word';
COMMENT ON COLUMN words.grammar IS 'Grammatical description';
COMMENT ON COLUMN words.structure IS 'Morphological structure';
COMMENT ON COLUMN words.category IS 'Part of speech category';

-- ============================================================================
-- Word Relations Table
-- ============================================================================
CREATE TABLE word_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  related_word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE word_relations IS 'Related words for vocabulary building';
COMMENT ON COLUMN word_relations.word_id IS 'Reference to parent word';
COMMENT ON COLUMN word_relations.related_word IS 'Related Hebrew word';

-- ============================================================================
-- Commentaries Table
-- ============================================================================
CREATE TABLE commentaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id TEXT UNIQUE REFERENCES verses(id) ON DELETE CASCADE,
  intro TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE commentaries IS 'Commentary introductions for verses';
COMMENT ON COLUMN commentaries.intro IS 'Introductory text for the commentary';

-- ============================================================================
-- Commentary Sections Table
-- ============================================================================
CREATE TABLE commentary_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commentary_id UUID REFERENCES commentaries(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points JSONB NOT NULL,
  color TEXT CHECK (color IN ('purple', 'blue', 'green', 'pink', 'orange', 'yellow')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE commentary_sections IS 'Structured sections within commentaries';
COMMENT ON COLUMN commentary_sections.position IS 'Display order of section';
COMMENT ON COLUMN commentary_sections.points IS 'Array of key points (JSONB array of strings)';
COMMENT ON COLUMN commentary_sections.color IS 'UI color theme for section';

-- ============================================================================
-- Why Questions Table
-- ============================================================================
CREATE TABLE why_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commentary_id UUID UNIQUE REFERENCES commentaries(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  bible_references JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE why_questions IS 'Why questions and answers for deeper study';
COMMENT ON COLUMN why_questions.bible_references IS 'Array of related Bible references (JSONB array of strings)';

-- ============================================================================
-- Commentary Conclusions Table
-- ============================================================================
CREATE TABLE commentary_conclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commentary_id UUID UNIQUE REFERENCES commentaries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE commentary_conclusions IS 'Concluding thoughts for commentaries';

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Books indexes
CREATE INDEX idx_books_testament ON books(testament);
CREATE INDEX idx_books_category ON books(category);

-- Verses indexes
CREATE INDEX idx_verses_book_chapter ON verses(book_id, chapter);
CREATE INDEX idx_verses_book_id ON verses(book_id);
CREATE INDEX idx_verses_reference ON verses(reference);

-- Words indexes
CREATE INDEX idx_words_verse_id ON words(verse_id);
CREATE INDEX idx_words_verse_position ON words(verse_id, position);
CREATE INDEX idx_words_category ON words(category);
CREATE INDEX idx_words_root ON words(root);

-- Word relations indexes
CREATE INDEX idx_word_relations_word_id ON word_relations(word_id);

-- Commentaries indexes
CREATE INDEX idx_commentaries_verse_id ON commentaries(verse_id);

-- Commentary sections indexes
CREATE INDEX idx_commentary_sections_commentary_id ON commentary_sections(commentary_id);
CREATE INDEX idx_commentary_sections_position ON commentary_sections(commentary_id, position);

-- Why questions indexes
CREATE INDEX idx_why_questions_commentary_id ON why_questions(commentary_id);

-- Commentary conclusions indexes
CREATE INDEX idx_commentary_conclusions_commentary_id ON commentary_conclusions(commentary_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentary_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE why_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentary_conclusions ENABLE ROW LEVEL SECURITY;

-- Books policies (read-only for all users)
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert books"
  ON books FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update books"
  ON books FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete books"
  ON books FOR DELETE
  USING (false);

-- Verses policies (read-only for all users)
CREATE POLICY "Verses are viewable by everyone"
  ON verses FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert verses"
  ON verses FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update verses"
  ON verses FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete verses"
  ON verses FOR DELETE
  USING (false);

-- Words policies (read-only for all users)
CREATE POLICY "Words are viewable by everyone"
  ON words FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert words"
  ON words FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update words"
  ON words FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete words"
  ON words FOR DELETE
  USING (false);

-- Word relations policies (read-only for all users)
CREATE POLICY "Word relations are viewable by everyone"
  ON word_relations FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert word relations"
  ON word_relations FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update word relations"
  ON word_relations FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete word relations"
  ON word_relations FOR DELETE
  USING (false);

-- Commentaries policies (read-only for all users)
CREATE POLICY "Commentaries are viewable by everyone"
  ON commentaries FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert commentaries"
  ON commentaries FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update commentaries"
  ON commentaries FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete commentaries"
  ON commentaries FOR DELETE
  USING (false);

-- Commentary sections policies (read-only for all users)
CREATE POLICY "Commentary sections are viewable by everyone"
  ON commentary_sections FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert commentary sections"
  ON commentary_sections FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update commentary sections"
  ON commentary_sections FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete commentary sections"
  ON commentary_sections FOR DELETE
  USING (false);

-- Why questions policies (read-only for all users)
CREATE POLICY "Why questions are viewable by everyone"
  ON why_questions FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert why questions"
  ON why_questions FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update why questions"
  ON why_questions FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete why questions"
  ON why_questions FOR DELETE
  USING (false);

-- Commentary conclusions policies (read-only for all users)
CREATE POLICY "Commentary conclusions are viewable by everyone"
  ON commentary_conclusions FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert commentary conclusions"
  ON commentary_conclusions FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update commentary conclusions"
  ON commentary_conclusions FOR UPDATE
  USING (false);

CREATE POLICY "Only service role can delete commentary conclusions"
  ON commentary_conclusions FOR DELETE
  USING (false);
