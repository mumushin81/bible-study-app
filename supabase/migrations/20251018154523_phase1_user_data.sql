-- ============================================
-- Phase 1: User Data Schema
-- Bible Study App - User Authentication & Progress Tracking
-- ============================================

-- Enable UUID extension (pgcrypto is enabled by default in Supabase)
-- Using gen_random_uuid() instead of uuid_generate_v4()

-- ============================================
-- 1. USER PROFILES
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  total_exp INTEGER DEFAULT 0 CHECK (total_exp >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USER PROGRESS (학습 진도)
-- ============================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- ============================================
-- 3. USER FAVORITES (즐겨찾기)
-- ============================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- ============================================
-- 4. QUIZ RESULTS (퀴즈 결과)
-- ============================================
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  exp_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. USER NOTES (사용자 노트)
-- ============================================
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_verse ON user_progress(verse_id);
CREATE INDEX idx_user_progress_completed ON user_progress(user_id, completed);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_verse ON quiz_results(verse_id);
CREATE INDEX idx_user_notes_user_verse ON user_notes(user_id, verse_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Progress Policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- User Favorites Policies
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  USING (auth.uid() = user_id);

-- Quiz Results Policies
CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Notes Policies
CREATE POLICY "Users can view own notes"
  ON user_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON user_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON user_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON user_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_verses_studied', COUNT(DISTINCT verse_id),
    'total_verses_completed', COUNT(DISTINCT verse_id) FILTER (WHERE completed = true),
    'total_reviews', SUM(review_count),
    'total_quizzes_taken', (SELECT COUNT(*) FROM quiz_results WHERE user_id = user_uuid),
    'total_quizzes_correct', (SELECT COUNT(*) FROM quiz_results WHERE user_id = user_uuid AND correct = true),
    'total_favorites', (SELECT COUNT(*) FROM user_favorites WHERE user_id = user_uuid),
    'total_notes', (SELECT COUNT(*) FROM user_notes WHERE user_id = user_uuid)
  ) INTO result
  FROM user_progress
  WHERE user_id = user_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE user_profiles IS 'User profile information and gamification stats';
COMMENT ON TABLE user_progress IS 'User learning progress for each verse';
COMMENT ON TABLE user_favorites IS 'User favorite verses with optional notes';
COMMENT ON TABLE quiz_results IS 'Quiz attempt history and scores';
COMMENT ON TABLE user_notes IS 'User personal notes for verses';
