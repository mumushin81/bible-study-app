-- ============================================
-- User Preferences Table
-- Stores user UI/UX preferences
-- ============================================

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- UI Preferences
  dark_mode BOOLEAN DEFAULT false,
  show_hebrew_hint BOOLEAN DEFAULT true,
  font_size INTEGER DEFAULT 16 CHECK (font_size >= 12 AND font_size <= 24),

  -- Audio Preferences
  audio_speed DECIMAL(2,1) DEFAULT 1.0 CHECK (audio_speed >= 0.5 AND audio_speed <= 2.0),
  auto_play BOOLEAN DEFAULT false,

  -- Study Preferences
  daily_goal_verses INTEGER DEFAULT 3 CHECK (daily_goal_verses >= 1 AND daily_goal_verses <= 50),
  show_pronunciation BOOLEAN DEFAULT true,
  show_translation BOOLEAN DEFAULT true,

  -- Sync metadata
  device_id TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_device_id ON user_preferences(device_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Auto-create preferences on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences on user signup
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE user_preferences IS 'User interface and study preferences';
COMMENT ON COLUMN user_preferences.dark_mode IS 'Enable dark mode UI';
COMMENT ON COLUMN user_preferences.show_hebrew_hint IS 'Show Hebrew text hints';
COMMENT ON COLUMN user_preferences.font_size IS 'Font size in pixels (12-24)';
COMMENT ON COLUMN user_preferences.audio_speed IS 'Audio playback speed (0.5-2.0)';
COMMENT ON COLUMN user_preferences.daily_goal_verses IS 'Daily study goal in number of verses';
