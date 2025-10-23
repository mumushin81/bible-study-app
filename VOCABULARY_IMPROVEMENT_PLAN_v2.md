# 단어장 개선 종합 계획서 v2.0

**작성일**: 2025-10-22
**목표**: 과학적 SRS 시스템 + 어근 중심 학습 + 성경책별 필터링

---

## 📊 현재 시스템 분석

### ✅ 구현된 기능
- **데이터베이스**: words, verses, user_word_progress, user_word_bookmarks 테이블
- **기본 필터링**: bookId, chapter 기반 (useWords hook)
- **간단한 SRS**: 3단계 quality (0:모르겠어요, 1:애매해요, 2:알고있어요)
- **북마크 시스템**: 단어 즐겨찾기
- **서브탭**: 전체 / 북마크 / 암기하기

### ❌ 개선 필요 영역
1. **성경책별 필터**: UI에 genesis만 하드코딩 → 모든 책 선택 가능하게
2. **어근 활용**: root 필드 존재하지만 학습에 미활용
3. **복습 시스템**: 단순 SRS → 난이도/빈도/중요도/맥락 고려 안함
4. **학습 효율**: 모든 단어를 무작위로 복습 → 비효율적

---

## 🎯 3대 핵심 개선 사항

---

## 1️⃣ 성경책별 단어 보여주기

### 목표
사용자가 성경 각 책별로 단어를 학습하고, 진도를 추적할 수 있게 한다.

### 데이터베이스 수정

**기존 구조 (변경 없음)**:
```sql
-- words 테이블은 이미 verse_id FK 보유
-- verses 테이블은 이미 book_id FK 보유
-- 추가 테이블 불필요
```

### 새로운 테이블: `user_book_progress` (선택사항)
사용자가 각 책의 단어 학습 진도를 추적합니다.

```sql
CREATE TABLE user_book_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,

  -- 통계
  total_words INTEGER DEFAULT 0,
  learned_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  progress_percentage DECIMAL DEFAULT 0,

  -- 학습 목표
  daily_goal INTEGER DEFAULT 10,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- 타임스탬프
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_studied_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_user_book ON user_book_progress(user_id, book_id);
```

### UI 개선

#### 1) 헤더에 책 선택 드롭다운 추가

```tsx
// VocabularyTab.tsx
const [selectedBook, setSelectedBook] = useState<string>('genesis');
const { books } = useBooks(); // 모든 책 목록 가져오기

<div className="mb-4">
  <label className="text-sm font-medium">📚 책 선택</label>
  <select
    value={selectedBook}
    onChange={(e) => setSelectedBook(e.target.value)}
    className="w-full mt-2 p-2 rounded-lg"
  >
    {books.map(book => (
      <option key={book.id} value={book.id}>
        {book.name} ({book.english_name})
      </option>
    ))}
  </select>
</div>

// useWords 호출 시 선택된 책 전달
const { words } = useWords({ bookId: selectedBook });
```

#### 2) 책별 진도 대시보드

```tsx
// 각 책의 학습 진도를 시각화
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {bookProgress.map(book => (
    <div key={book.id} className="p-4 rounded-xl bg-gradient-to-br">
      <h3>{book.name}</h3>

      {/* 진도 바 */}
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-purple-600 rounded-full"
          style={{ width: `${book.progressPercentage}%` }}
        />
      </div>

      {/* 통계 */}
      <div className="mt-2 flex gap-2 text-sm">
        <span>📖 {book.learnedWords}/{book.totalWords}</span>
        <span>🏆 {book.masteredWords} 완벽암기</span>
      </div>

      {/* 연속 학습일 */}
      <div className="mt-1 text-xs">
        🔥 {book.currentStreak}일 연속 학습
      </div>
    </div>
  ))}
</div>
```

#### 3) 새로운 필터 옵션

```tsx
// 기존: "전체", "북마크", "암기하기"
// 추가: "새 단어", "복습 대기", "완벽암기", "어려운 단어"

type SubTab = 'all' | 'bookmarked' | 'study' | 'new' | 'review' | 'mastered' | 'difficult';

const filterOptions = [
  { id: 'all', label: '📚 전체', icon: '📚' },
  { id: 'new', label: '🆕 새 단어', icon: '🆕' },
  { id: 'review', label: '🔄 복습 대기', icon: '🔄' },
  { id: 'difficult', label: '😓 어려운 단어', icon: '😓' },
  { id: 'bookmarked', label: '⭐ 북마크', icon: '⭐' },
  { id: 'mastered', label: '🏆 완벽암기', icon: '🏆' },
];
```

### React Hook: `useBookProgress`

```typescript
export function useBookProgress(bookId: string) {
  const { user } = useAuth();

  const fetchProgress = async () => {
    const { data } = await supabase
      .from('user_book_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single();

    return data;
  };

  const updateProgress = async (stats: {
    learnedWords: number;
    masteredWords: number;
  }) => {
    await supabase
      .from('user_book_progress')
      .upsert({
        user_id: user.id,
        book_id: bookId,
        ...stats,
        progressPercentage: (stats.learnedWords / totalWords) * 100,
        lastStudiedAt: new Date(),
      });
  };

  return { progress, updateProgress };
}
```

---

## 2️⃣ 어근 중심 학습 컨텐츠

### 목표
히브리어 어근(root)을 중심으로 파생 단어들을 그룹화하여 패턴 학습을 강화한다.

### 히브리어 어근 시스템 이해

**Triliteral Roots (3자 어근)**:
- 대부분의 히브리어 단어는 3개 자음으로 구성된 어근에서 파생
- 예: `ב-ר-א` (b-r-a) → 창조 관련 단어들
  - `בָּרָא` (bara) - 창조하다 (동사 Qal)
  - `בְּרִיאָה` (beriah) - 창조물 (명사)
  - `בָּרוּא` (barua) - 창조된 (형용사)

**Binyanim (7가지 동사 패턴)**:
1. **Qal** (קַל) - 기본형: 단순 능동
2. **Niphal** (נִפְעַל) - 수동/재귀
3. **Piel** (פִּעֵל) - 강조/타동사화
4. **Pual** (פֻּעַל) - Piel 수동형
5. **Hiphil** (הִפְעִיל) - 사역형
6. **Hophal** (הָפְעַל) - Hiphil 수동형
7. **Hithpael** (הִתְפַּעֵל) - 재귀/상호

### 데이터베이스 확장

#### 새 테이블: `hebrew_roots`

```sql
CREATE TABLE hebrew_roots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  root TEXT NOT NULL UNIQUE,  -- 'ב-ר-א'
  root_hebrew TEXT NOT NULL,   -- 'ברא' (without hyphens)

  -- 의미
  core_meaning TEXT NOT NULL,  -- '창조하다, 만들다'
  semantic_field TEXT,         -- '창조, 형성, 생산'

  -- 메타데이터
  frequency INTEGER DEFAULT 0,  -- 성경 전체 등장 횟수
  importance INTEGER DEFAULT 1, -- 1-5 (신학적 중요도)

  -- 학습 자료
  mnemonic TEXT,               -- 암기 힌트
  story TEXT,                  -- 어근 스토리
  emoji TEXT,                  -- 대표 이모지

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_root ON hebrew_roots(root);
```

#### 새 테이블: `word_derivations`

어근과 단어의 파생 관계를 명시합니다.

```sql
CREATE TABLE word_derivations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  root_id UUID REFERENCES hebrew_roots(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,

  -- 파생 정보
  binyan TEXT,  -- 'Qal', 'Niphal', 'Piel', etc.
  pattern TEXT, -- 'CaCaC', 'maCCeC', etc. (C = consonant)

  -- 관계 설명
  derivation_note TEXT,  -- '어근 ב-ר-א의 기본 동사형'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(root_id, word_id)
);

CREATE INDEX idx_derivation_root ON word_derivations(root_id);
CREATE INDEX idx_derivation_word ON word_derivations(word_id);
```

### UI 컴포넌트: 어근 플래시카드 덱

#### RootFlashcardDeck.tsx

```tsx
interface RootFlashcardDeckProps {
  root: string;  // 'ב-ר-א'
  darkMode: boolean;
}

export function RootFlashcardDeck({ root, darkMode }: RootFlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { rootData, derivedWords } = useRoot(root);

  return (
    <div className="root-deck">
      {/* 어근 소개 카드 */}
      <div className="root-intro-card">
        <h2 className="text-3xl">{root}</h2>
        <p className="text-xl">{rootData.coreMeaning}</p>

        <div className="semantic-field">
          <span>의미 영역: {rootData.semanticField}</span>
        </div>

        <div className="mnemonic">
          💡 암기 힌트: {rootData.mnemonic}
        </div>

        <div className="story">
          📖 {rootData.story}
        </div>
      </div>

      {/* 파생 단어 카드들 */}
      <div className="derived-words-carousel">
        <h3>이 어근에서 파생된 {derivedWords.length}개 단어</h3>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <FlashCard word={derivedWords[currentIndex]} />

            {/* 파생 정보 추가 */}
            <div className="derivation-info">
              <span>Binyan: {derivedWords[currentIndex].binyan}</span>
              <span>Pattern: {derivedWords[currentIndex].pattern}</span>
              <p>{derivedWords[currentIndex].derivationNote}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 네비게이션 */}
        <div className="navigation">
          <button onClick={() => setCurrentIndex(i => i - 1)}>← 이전</button>
          <span>{currentIndex + 1} / {derivedWords.length}</span>
          <button onClick={() => setCurrentIndex(i => i + 1)}>다음 →</button>
        </div>
      </div>

      {/* 어근 패밀리 맵 */}
      <div className="root-family-map">
        <h3>어근 패밀리 맵</h3>
        <div className="grid grid-cols-2 gap-2">
          {derivedWords.map(word => (
            <div key={word.id} className="family-member">
              <span className="hebrew">{word.hebrew}</span>
              <span className="binyan">{word.binyan}</span>
              <span className="meaning">{word.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### React Hook: `useRoot`

```typescript
export function useRoot(root: string) {
  const [rootData, setRootData] = useState<RootData | null>(null);
  const [derivedWords, setDerivedWords] = useState<WordWithContext[]>([]);

  useEffect(() => {
    async function fetchRootData() {
      // 어근 정보 가져오기
      const { data: rootInfo } = await supabase
        .from('hebrew_roots')
        .select('*')
        .eq('root', root)
        .single();

      setRootData(rootInfo);

      // 파생 단어들 가져오기 (binyan 순서대로)
      const { data: derivations } = await supabase
        .from('word_derivations')
        .select(`
          binyan,
          pattern,
          derivation_note,
          words (*)
        `)
        .eq('root_id', rootInfo.id)
        .order('binyan', { ascending: true });

      const words = derivations.map(d => ({
        ...d.words,
        binyan: d.binyan,
        pattern: d.pattern,
        derivationNote: d.derivation_note,
      }));

      setDerivedWords(words);
    }

    fetchRootData();
  }, [root]);

  return { rootData, derivedWords };
}
```

### 새로운 탭: "어근 학습"

```tsx
// VocabularyTab.tsx에 추가
type MainTab = 'words' | 'roots';

<div className="main-tabs">
  <button onClick={() => setMainTab('words')}>
    📚 단어 학습
  </button>
  <button onClick={() => setMainTab('roots')}>
    🌳 어근 학습
  </button>
</div>

{mainTab === 'words' && (
  // 기존 단어 카드 그리드
)}

{mainTab === 'roots' && (
  <RootsView darkMode={darkMode} />
)}
```

### RootsView 컴포넌트

```tsx
function RootsView({ darkMode }: { darkMode: boolean }) {
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const { roots, loading } = useRoots();

  if (selectedRoot) {
    return <RootFlashcardDeck root={selectedRoot} darkMode={darkMode} />;
  }

  return (
    <div className="roots-grid">
      <h2>히브리어 어근 탐험</h2>
      <p>어근을 선택하면 파생 단어들을 함께 학습할 수 있습니다</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {roots.map(root => (
          <motion.div
            key={root.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRoot(root.root)}
            className="root-card cursor-pointer"
          >
            <div className="text-4xl mb-2">{root.emoji}</div>
            <div className="text-2xl font-bold hebrew">{root.root}</div>
            <div className="text-sm">{root.coreMeaning}</div>

            {/* 통계 */}
            <div className="mt-2 flex gap-2 text-xs">
              <span>📖 {root.derivedCount}개 파생</span>
              <span>⭐ 중요도 {root.importance}/5</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

### 어근 데이터 생성 스크립트

```typescript
// scripts/generateRoots.ts
const commonRoots = [
  {
    root: 'ב-ר-א',
    rootHebrew: 'ברא',
    coreMeaning: '창조하다',
    semanticField: '창조, 형성, 생산',
    frequency: 54,
    importance: 5,
    mnemonic: '바-라 → 바로 무에서 유를 만들다',
    story: '이 어근은 오직 하나님만이 할 수 있는 "무에서 유를 창조하는" 행위를 나타냅니다. 창세기 1:1에서 처음 등장하며, 성경 전체에서 54번 사용됩니다.',
    emoji: '✨',
  },
  {
    root: 'ע-ש-ה',
    rootHebrew: 'עשה',
    coreMeaning: '만들다, 행하다',
    semanticField: '제작, 행동, 수행',
    frequency: 2632,
    importance: 5,
    mnemonic: '아-사 → 만들다 (ברא보다 일반적)',
    story: '브라(ברא)가 "무에서 유를 창조"라면, 아사(עשה)는 "이미 있는 재료로 만들다"입니다. 인간도 사용할 수 있는 단어입니다.',
    emoji: '🔨',
  },
  // ... 더 많은 어근들
];
```

---

## 3️⃣ 복습 시스템 상세 설계

### 목표
모든 단어를 무작위로 복습하는 것이 아니라, **난이도**, **빈도**, **중요도**, **맥락**, **개인 학습 이력**을 고려한 지능형 복습 시스템을 구축한다.

### 현재 SRS의 한계

**기존 시스템**:
- Quality 3단계만 (0, 1, 2)
- 모든 단어를 동일하게 취급
- 단어의 난이도, 중요도 미고려
- 맥락 없는 단순 암기

### 학습 과학 기반 원칙

**2024 연구 결과**:
1. **노출 빈도**: 5-16회 노출 필요, 무의식 학습은 15회+
2. **맥락 학습**: 구절 내에서 단어 학습이 효과적
3. **다감각 학습**: 발음 + 시각 + 이모지 + SVG 아이콘
4. **능동적 학습**: 단순 암기보다 상호작용

### 확장된 SRS 알고리즘: SM-2+

#### 새로운 테이블: `user_word_progress_v2`

```sql
CREATE TABLE user_word_progress_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_hebrew TEXT NOT NULL,

  -- 기존 SM-2 필드
  next_review TIMESTAMPTZ NOT NULL,
  interval_days DECIMAL NOT NULL DEFAULT 0,
  ease_factor DECIMAL NOT NULL DEFAULT 2.5,
  review_count INTEGER NOT NULL DEFAULT 0,

  -- 신규: 난이도 추적
  difficulty_level INTEGER DEFAULT 3,  -- 1(매우쉬움) ~ 5(매우어려움)
  initial_difficulty INTEGER,          -- 처음 학습 시 난이도 (변경 없음)

  -- 신규: 상세 성능 추적
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  accuracy_rate DECIMAL DEFAULT 0,     -- correct / (correct + incorrect)

  -- 신규: 학습 맥락
  last_study_context TEXT,             -- 'verse_review' | 'flashcard' | 'root_family' | 'quiz'
  study_methods JSONB DEFAULT '[]',    -- 사용한 학습 방법들

  -- 신규: 시간 추적
  total_study_time_seconds INTEGER DEFAULT 0,
  average_response_time_seconds DECIMAL DEFAULT 0,

  -- 신규: 레벨링
  mastery_level INTEGER DEFAULT 0,     -- 0(새 단어) ~ 10(완벽 마스터)
  last_level_up_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_studied_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,

  UNIQUE(user_id, word_hebrew)
);

CREATE INDEX idx_user_word_v2_user ON user_word_progress_v2(user_id);
CREATE INDEX idx_user_word_v2_next_review ON user_word_progress_v2(user_id, next_review);
CREATE INDEX idx_user_word_v2_mastery ON user_word_progress_v2(user_id, mastery_level);
```

#### 새로운 테이블: `word_metadata`

각 단어의 객관적 난이도, 빈도, 중요도를 저장합니다.

```sql
CREATE TABLE word_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_hebrew TEXT NOT NULL UNIQUE,

  -- 빈도 (Frequency)
  bible_frequency INTEGER DEFAULT 0,    -- 성경 전체 등장 횟수
  genesis_frequency INTEGER DEFAULT 0,  -- 창세기 내 등장 횟수
  frequency_rank INTEGER,               -- 1 = 가장 많이 등장

  -- 난이도 (Difficulty)
  -- 객관적 난이도 (1-5)
  objective_difficulty INTEGER DEFAULT 3,
  difficulty_factors JSONB DEFAULT '{}',  -- { "length": 4, "rareness": 2, "grammatical_complexity": 3 }

  -- 중요도 (Importance)
  theological_importance INTEGER DEFAULT 3,  -- 1-5 (신학적 중요도)
  pedagogical_priority INTEGER DEFAULT 3,    -- 1-5 (교육적 우선순위)

  -- 단어 특성
  is_proper_noun BOOLEAN DEFAULT FALSE,
  is_theological_term BOOLEAN DEFAULT FALSE,
  is_common_word BOOLEAN DEFAULT FALSE,

  -- 학습 권장사항
  recommended_review_count INTEGER DEFAULT 10,  -- 권장 복습 횟수
  min_exposures INTEGER DEFAULT 5,              -- 최소 노출 횟수

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_word_meta_hebrew ON word_metadata(word_hebrew);
CREATE INDEX idx_word_meta_frequency ON word_metadata(bible_frequency DESC);
CREATE INDEX idx_word_meta_importance ON word_metadata(theological_importance DESC);
```

### 지능형 복습 알고리즘: Adaptive SRS

#### 단어 우선순위 점수 계산

```typescript
/**
 * 복습 우선순위 점수 계산
 * 점수가 높을수록 먼저 복습해야 함
 */
function calculateReviewPriority(
  word: WordWithProgress,
  metadata: WordMetadata,
  userLevel: number
): number {
  let score = 0;

  // 1. 시간 긴급도 (0-40점)
  const daysSinceLastReview = getDaysDiff(word.lastReviewedAt, new Date());
  const daysOverdue = getDaysDiff(word.nextReview, new Date());

  if (daysOverdue > 0) {
    // 기한 지남 → 급함
    score += Math.min(40, daysOverdue * 4);
  } else {
    // 기한 안 지남 → 덜 급함
    score += Math.max(0, 20 - Math.abs(daysOverdue) * 2);
  }

  // 2. 학습 성과 (0-20점)
  // 정확도가 낮으면 더 자주 복습
  const accuracy = word.correctCount / (word.correctCount + word.incorrectCount) || 0.5;
  score += (1 - accuracy) * 20;  // 낮은 정확도 → 높은 점수

  // 3. 난이도 (0-15점)
  // 어려운 단어일수록 더 자주 복습
  score += (word.difficultyLevel / 5) * 15;

  // 4. 중요도 (0-15점)
  // 신학적으로 중요한 단어 우선
  score += (metadata.theologicalImportance / 5) * 15;

  // 5. 마스터리 레벨 (0-10점)
  // 낮은 레벨일수록 더 자주 복습
  score += (10 - word.masteryLevel) * 1;

  // 6. 빈도 보너스 (-5 ~ +5점)
  // 자주 나오는 단어는 약간 우선순위
  if (metadata.bibleFrequency > 100) {
    score += 5;
  } else if (metadata.bibleFrequency < 10) {
    score -= 5;
  }

  return Math.round(score);
}
```

#### 학습 세션 구성 알고리즘

```typescript
/**
 * 최적의 복습 세션 생성
 * 난이도, 중요도, 긴급도를 균형있게 배치
 */
function createStudySession(
  allWords: WordWithProgress[],
  metadata: Map<string, WordMetadata>,
  sessionSize: number = 20
): StudySession {
  // 1. 우선순위 점수 계산
  const wordScores = allWords.map(word => ({
    word,
    score: calculateReviewPriority(word, metadata.get(word.hebrew)!, userLevel),
    metadata: metadata.get(word.hebrew)!,
  }));

  // 2. 점수순 정렬
  wordScores.sort((a, b) => b.score - a.score);

  // 3. 다양성 보장 세션 구성
  const session: StudySession = {
    words: [],
    distribution: {
      new: 0,
      review: 0,
      difficult: 0,
      mastered: 0,
    },
  };

  // 3-1. 새 단어 (20%)
  const newWords = wordScores.filter(w => w.word.reviewCount === 0);
  const newCount = Math.ceil(sessionSize * 0.2);
  session.words.push(...newWords.slice(0, newCount).map(w => w.word));
  session.distribution.new = session.words.length;

  // 3-2. 어려운 단어 (40%)
  const difficultWords = wordScores.filter(
    w => w.word.difficultyLevel >= 4 && w.word.accuracy < 0.6
  );
  const difficultCount = Math.ceil(sessionSize * 0.4);
  session.words.push(...difficultWords.slice(0, difficultCount).map(w => w.word));
  session.distribution.difficult = session.words.length - session.distribution.new;

  // 3-3. 일반 복습 (30%)
  const reviewWords = wordScores.filter(
    w => w.word.reviewCount > 0 && !session.words.includes(w.word)
  );
  const reviewCount = Math.ceil(sessionSize * 0.3);
  session.words.push(...reviewWords.slice(0, reviewCount).map(w => w.word));
  session.distribution.review = session.words.length - session.distribution.new - session.distribution.difficult;

  // 3-4. 완벽 암기 재확인 (10%)
  const masteredWords = wordScores.filter(
    w => w.word.masteryLevel >= 8 && !session.words.includes(w.word)
  );
  const masteredCount = sessionSize - session.words.length;
  session.words.push(...masteredWords.slice(0, masteredCount).map(w => w.word));
  session.distribution.mastered = masteredCount;

  // 4. 순서 섞기 (같은 어근 연속 방지)
  session.words = shuffleWithConstraints(session.words, (a, b) => {
    return a.root !== b.root; // 같은 어근이 연속되지 않도록
  });

  return session;
}
```

#### 확장된 SRS 업데이트 로직

```typescript
/**
 * SM-2+ 알고리즘
 * 기존 SM-2에 난이도/중요도/맥락을 추가
 */
function updateSRSv2(
  wordHebrew: string,
  quality: number,  // 0-3 (0:틀림, 1:어려움, 2:보통, 3:쉬움)
  context: StudyContext,
  responseTime: number  // 응답 시간 (초)
): UpdatedSRSData {
  const today = new Date();
  const current = srsData.get(wordHebrew);
  const metadata = wordMetadata.get(wordHebrew);

  let newData: SRSDataV2;

  // 난이도 업데이트
  let newDifficulty = current?.difficultyLevel || 3;
  if (quality === 0) {
    newDifficulty = Math.min(5, newDifficulty + 0.5);
  } else if (quality === 3) {
    newDifficulty = Math.max(1, newDifficulty - 0.5);
  }

  // SM-2 계산
  let newInterval: number;
  let newEaseFactor = current?.easeFactor || 2.5;

  if (quality === 0) {
    // 틀림: 처음부터
    newInterval = 0;
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
  } else {
    // 맞춤: 간격 증가
    if (current?.interval === 0 || !current) {
      newInterval = 1;
    } else if (current.interval === 1) {
      newInterval = quality === 3 ? 4 : 3;
    } else {
      // 난이도 보정
      const difficultyMultiplier = 1 - ((newDifficulty - 3) * 0.1);
      // 중요도 보정 (중요한 단어는 더 자주)
      const importanceMultiplier = 1 - ((metadata.theologicalImportance - 3) * 0.05);

      newInterval = Math.floor(
        current.interval * newEaseFactor * difficultyMultiplier * importanceMultiplier
      );
    }

    if (quality === 3) {
      newEaseFactor = newEaseFactor + 0.15;
    } else if (quality === 2) {
      newEaseFactor = newEaseFactor + 0.1;
    }
  }

  // 정확도 계산
  const totalCorrect = (current?.correctCount || 0) + (quality > 0 ? 1 : 0);
  const totalIncorrect = (current?.incorrectCount || 0) + (quality === 0 ? 1 : 0);
  const accuracy = totalCorrect / (totalCorrect + totalIncorrect);

  // 마스터리 레벨 계산
  let masteryLevel = current?.masteryLevel || 0;
  if (quality >= 2 && accuracy > 0.8 && newInterval >= 7) {
    masteryLevel = Math.min(10, masteryLevel + 1);
  } else if (quality === 0) {
    masteryLevel = Math.max(0, masteryLevel - 1);
  }

  newData = {
    wordHebrew,
    nextReview: new Date(today.getTime() + newInterval * 24 * 60 * 60 * 1000),
    intervalDays: newInterval,
    easeFactor: Math.min(2.5, Math.max(1.3, newEaseFactor)),
    reviewCount: (current?.reviewCount || 0) + 1,

    difficultyLevel: newDifficulty,
    initialDifficulty: current?.initialDifficulty || newDifficulty,

    correctCount: totalCorrect,
    incorrectCount: totalIncorrect,
    accuracyRate: accuracy,

    lastStudyContext: context,
    studyMethods: [...(current?.studyMethods || []), context],

    totalStudyTimeSeconds: (current?.totalStudyTimeSeconds || 0) + responseTime,
    averageResponseTimeSeconds:
      ((current?.averageResponseTimeSeconds || 0) * (current?.reviewCount || 0) + responseTime)
      / ((current?.reviewCount || 0) + 1),

    masteryLevel,
    lastLevelUpAt: masteryLevel > (current?.masteryLevel || 0) ? today : current?.lastLevelUpAt,

    lastReviewedAt: today,
    updatedAt: today,
  };

  return newData;
}
```

### UI 개선: 복습 대시보드

```tsx
function ReviewDashboard({ darkMode }: { darkMode: boolean }) {
  const { studySession, loading } = useStudySession();

  if (!studySession) return <LoadingSpinner />;

  return (
    <div className="review-dashboard">
      {/* 오늘의 복습 요약 */}
      <div className="summary-card">
        <h2>🎯 오늘의 맞춤 학습</h2>

        <div className="distribution-chart">
          <div className="bar">
            <div
              className="segment new"
              style={{ width: `${(studySession.distribution.new / 20) * 100}%` }}
            >
              🆕 새 단어 {studySession.distribution.new}
            </div>
            <div
              className="segment difficult"
              style={{ width: `${(studySession.distribution.difficult / 20) * 100}%` }}
            >
              😓 어려운 단어 {studySession.distribution.difficult}
            </div>
            <div
              className="segment review"
              style={{ width: `${(studySession.distribution.review / 20) * 100}%` }}
            >
              🔄 복습 {studySession.distribution.review}
            </div>
            <div
              className="segment mastered"
              style={{ width: `${(studySession.distribution.mastered / 20) * 100}%` }}
            >
              🏆 재확인 {studySession.distribution.mastered}
            </div>
          </div>
        </div>

        <p className="explanation">
          AI가 당신의 학습 패턴을 분석하여 최적의 단어 조합을 선택했습니다
        </p>
      </div>

      {/* 학습 통계 */}
      <div className="stats-grid">
        <StatCard
          icon="🔥"
          label="연속 학습"
          value={`${currentStreak}일`}
        />
        <StatCard
          icon="📊"
          label="평균 정확도"
          value={`${Math.round(averageAccuracy * 100)}%`}
        />
        <StatCard
          icon="⏱️"
          label="평균 응답시간"
          value={`${averageResponseTime.toFixed(1)}초`}
        />
        <StatCard
          icon="🎓"
          label="마스터리 레벨"
          value={`Lv ${userMasteryLevel}`}
        />
      </div>

      {/* 학습 시작 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={startStudySession}
        className="start-button"
      >
        🚀 학습 시작하기 ({studySession.words.length}개 단어)
      </motion.button>
    </div>
  );
}
```

### 학습 모드 확장

```tsx
/**
 * 다양한 학습 모드
 */
type StudyMode =
  | 'flashcard'       // 기존: 플래시카드
  | 'verse_context'   // 신규: 구절 맥락에서 학습
  | 'root_family'     // 신규: 어근 패밀리 학습
  | 'quiz'            // 신규: 퀴즈 모드
  | 'typing'          // 신규: 타이핑 연습
  | 'listening'       // 신규: 듣기 연습

function StudyModeSelector({ onSelect }: { onSelect: (mode: StudyMode) => void }) {
  const modes = [
    {
      id: 'flashcard',
      name: '플래시카드',
      icon: '🃏',
      description: '기본 암기 모드',
      recommended: true,
    },
    {
      id: 'verse_context',
      name: '구절 맥락',
      icon: '📖',
      description: '실제 구절에서 단어 학습',
      recommended: true,
    },
    {
      id: 'root_family',
      name: '어근 패밀리',
      icon: '🌳',
      description: '관련 단어들과 함께 학습',
      recommended: false,
    },
    {
      id: 'quiz',
      name: '퀴즈',
      icon: '🎯',
      description: '선택형/단답형 퀴즈',
      recommended: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {modes.map(mode => (
        <motion.div
          key={mode.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(mode.id as StudyMode)}
          className={`mode-card ${mode.recommended ? 'recommended' : ''}`}
        >
          <div className="icon">{mode.icon}</div>
          <div className="name">{mode.name}</div>
          <div className="description">{mode.description}</div>
          {mode.recommended && (
            <div className="badge">추천</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
```

---

## 📊 구현 로드맵

### Phase 1: 기반 작업 (1주)
- [x] 현재 시스템 분석
- [ ] 데이터베이스 스키마 확장
  - user_book_progress
  - hebrew_roots
  - word_derivations
  - word_metadata
  - user_word_progress_v2
- [ ] 마이그레이션 스크립트 작성

### Phase 2: 성경책별 단어 (1주)
- [ ] useBookProgress hook 구현
- [ ] 책 선택 드롭다운 UI
- [ ] 책별 진도 대시보드
- [ ] 새로운 필터 옵션 (새 단어, 복습 대기, 어려운 단어 등)

### Phase 3: 어근 학습 (2주)
- [ ] hebrew_roots 데이터 생성 (스크립트)
- [ ] word_derivations 관계 매핑
- [ ] useRoot hook 구현
- [ ] RootFlashcardDeck 컴포넌트
- [ ] RootsView 컴포넌트
- [ ] "어근 학습" 탭 추가

### Phase 4: 지능형 복습 시스템 (2주)
- [ ] word_metadata 데이터 생성
- [ ] calculateReviewPriority 함수
- [ ] createStudySession 알고리즘
- [ ] updateSRSv2 구현
- [ ] ReviewDashboard UI
- [ ] StudyModeSelector 구현

### Phase 5: 테스트 및 최적화 (1주)
- [ ] Playwright E2E 테스트 작성
- [ ] 성능 최적화
- [ ] 사용자 피드백 수집
- [ ] 버그 수정

**총 소요 시간**: 7주

---

## 🎯 핵심 성과 지표 (KPIs)

### 학습 효율
- **복습 정확도**: 70% → 85%+ 목표
- **단어 암기율**: 1주일 후 50% → 75%+ 목표
- **평균 학습 시간**: 20분/일 유지

### 사용자 참여
- **일일 활성 사용자**: 20% 증가 목표
- **연속 학습일**: 평균 3일 → 7일+ 목표
- **학습 완료율**: 40% → 70%+ 목표

### 시스템 효율
- **불필요한 복습 감소**: 30% 감소 목표
- **어려운 단어 집중도**: 2배 증가
- **맥락 학습 비율**: 0% → 50%+ 목표

---

## 💡 혁신 포인트

### 1. 어근 기반 학습
- 히브리어의 특성(triliteral roots)을 활용한 패턴 학습
- 하나의 어근에서 여러 단어를 동시에 학습 → 효율 극대화

### 2. AI 기반 맞춤 복습
- 개인의 학습 패턴 분석
- 난이도/중요도/긴급도를 균형있게 배치
- 지루하지 않은 다양한 학습 모드

### 3. 맥락 학습 강화
- 실제 성경 구절에서 단어 학습
- 신학적 의미와 함께 암기
- 장기 기억 형성 촉진

### 4. 게임화 요소
- 연속 학습일 트래킹
- 마스터리 레벨 시스템
- 책별 진도 추적
- 시각적 성취감

---

## 📚 참고 자료

### 히브리어 학습
- Biblical Hebrew Morphology & Verb Patterns
- Gesenius' Hebrew Grammar - Roots & Stems
- Binyanim (7 Verb Patterns) System

### SRS 알고리즘
- SuperMemo SM-2 (1980s)
- Anki's Modified SM-2
- FSRS (Free Spaced Repetition Scheduler, 2025)

### 어휘 학습 연구
- Frontiers in Education (2024): Vocabulary Learning Strategies
- Sage Journals (2024): Working Memory & Vocabulary
- MDPI (2025): Systematic Review of Vocabulary Instruction

---

**다음 단계**: Phase 1 데이터베이스 스키마 확장부터 시작할까요?
