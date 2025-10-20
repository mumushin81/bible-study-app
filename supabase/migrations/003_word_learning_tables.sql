-- 단어 북마크 테이블
CREATE TABLE IF NOT EXISTS user_word_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_hebrew TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 중복 방지
  UNIQUE(user_id, word_hebrew)
);

-- 인덱스 추가 (빠른 조회)
CREATE INDEX idx_user_word_bookmarks_user_id ON user_word_bookmarks(user_id);
CREATE INDEX idx_user_word_bookmarks_hebrew ON user_word_bookmarks(word_hebrew);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_word_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 북마크만 조회/수정 가능
CREATE POLICY "Users can view their own bookmarks"
  ON user_word_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON user_word_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON user_word_bookmarks FOR DELETE
  USING (auth.uid() = user_id);


-- 단어 학습 진행도 (SRS) 테이블
CREATE TABLE IF NOT EXISTS user_word_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_hebrew TEXT NOT NULL,

  -- SRS 알고리즘 데이터
  next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  interval_days INTEGER NOT NULL DEFAULT 0,
  ease_factor DECIMAL(3,2) NOT NULL DEFAULT 2.5,
  review_count INTEGER NOT NULL DEFAULT 0,

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 중복 방지
  UNIQUE(user_id, word_hebrew)
);

-- 인덱스 추가
CREATE INDEX idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_hebrew ON user_word_progress(word_hebrew);
CREATE INDEX idx_user_word_progress_next_review ON user_word_progress(next_review);
CREATE INDEX idx_user_word_progress_user_review ON user_word_progress(user_id, next_review);

-- RLS 활성화
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view their own word progress"
  ON user_word_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own word progress"
  ON user_word_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own word progress"
  ON user_word_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own word progress"
  ON user_word_progress FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_word_progress_updated_at
  BEFORE UPDATE ON user_word_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE user_word_bookmarks IS '사용자별 단어 북마크';
COMMENT ON TABLE user_word_progress IS '사용자별 단어 학습 진행도 (SRS 알고리즘)';
COMMENT ON COLUMN user_word_progress.interval_days IS 'SRS 복습 간격 (일 단위)';
COMMENT ON COLUMN user_word_progress.ease_factor IS 'SRS 난이도 계수 (1.3 ~ 2.5)';
COMMENT ON COLUMN user_word_progress.review_count IS '총 복습 횟수';
