-- ============================================================================
-- Add Missing RLS Policies
-- Date: 2025-10-29
-- Purpose: Add Row Level Security policies for tables created in
--          20251022_vocabulary_improvement_v2.sql that were missing RLS
-- ============================================================================

-- ============================================================================
-- 1. user_book_progress: User-specific data (CRUD permissions)
-- ============================================================================
ALTER TABLE user_book_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own book progress
CREATE POLICY "Users can view own book progress"
  ON user_book_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own book progress
CREATE POLICY "Users can insert own book progress"
  ON user_book_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own book progress
CREATE POLICY "Users can update own book progress"
  ON user_book_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own book progress
CREATE POLICY "Users can delete own book progress"
  ON user_book_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. user_word_progress_v2: User-specific SRS data (CRUD permissions)
-- ============================================================================
ALTER TABLE user_word_progress_v2 ENABLE ROW LEVEL SECURITY;

-- Users can view their own word progress
CREATE POLICY "Users can view own word progress v2"
  ON user_word_progress_v2 FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own word progress
CREATE POLICY "Users can insert own word progress v2"
  ON user_word_progress_v2 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own word progress
CREATE POLICY "Users can update own word progress v2"
  ON user_word_progress_v2 FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own word progress
CREATE POLICY "Users can delete own word progress v2"
  ON user_word_progress_v2 FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. hebrew_roots: Read-only public data
-- ============================================================================
ALTER TABLE hebrew_roots ENABLE ROW LEVEL SECURITY;

-- Everyone can view hebrew roots (public content)
CREATE POLICY "Hebrew roots are viewable by everyone"
  ON hebrew_roots FOR SELECT
  USING (true);

-- Only service role can insert hebrew roots
CREATE POLICY "Only service role can insert hebrew roots"
  ON hebrew_roots FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service role can update hebrew roots
CREATE POLICY "Only service role can update hebrew roots"
  ON hebrew_roots FOR UPDATE
  USING (auth.role() = 'service_role');

-- Only service role can delete hebrew roots
CREATE POLICY "Only service role can delete hebrew roots"
  ON hebrew_roots FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 4. word_derivations: Read-only public data
-- ============================================================================
ALTER TABLE word_derivations ENABLE ROW LEVEL SECURITY;

-- Everyone can view word derivations (public content)
CREATE POLICY "Word derivations are viewable by everyone"
  ON word_derivations FOR SELECT
  USING (true);

-- Only service role can insert word derivations
CREATE POLICY "Only service role can insert word derivations"
  ON word_derivations FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service role can update word derivations
CREATE POLICY "Only service role can update word derivations"
  ON word_derivations FOR UPDATE
  USING (auth.role() = 'service_role');

-- Only service role can delete word derivations
CREATE POLICY "Only service role can delete word derivations"
  ON word_derivations FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 5. word_metadata: Read-only public data
-- ============================================================================
ALTER TABLE word_metadata ENABLE ROW LEVEL SECURITY;

-- Everyone can view word metadata (public content)
CREATE POLICY "Word metadata is viewable by everyone"
  ON word_metadata FOR SELECT
  USING (true);

-- Only service role can insert word metadata
CREATE POLICY "Only service role can insert word metadata"
  ON word_metadata FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service role can update word metadata
CREATE POLICY "Only service role can update word metadata"
  ON word_metadata FOR UPDATE
  USING (auth.role() = 'service_role');

-- Only service role can delete word metadata
CREATE POLICY "Only service role can delete word metadata"
  ON word_metadata FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON POLICY "Users can view own book progress" ON user_book_progress
  IS 'Users can only view their own book learning progress';

COMMENT ON POLICY "Users can view own word progress v2" ON user_word_progress_v2
  IS 'Users can only view their own word SRS progress';

COMMENT ON POLICY "Hebrew roots are viewable by everyone" ON hebrew_roots
  IS 'Hebrew root data is public educational content';

COMMENT ON POLICY "Word derivations are viewable by everyone" ON word_derivations
  IS 'Word derivation data is public educational content';

COMMENT ON POLICY "Word metadata is viewable by everyone" ON word_metadata
  IS 'Word metadata is public educational content';
