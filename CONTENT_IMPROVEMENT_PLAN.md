# 콘텐츠 개선 계획

## 🎯 개선 목표

### 문제점 분석

#### 1. 히브리어 원문 니쿠드(바름기호) 정확도
**현재 상황**:
- 출처: 불명확 (수동 입력으로 추정)
- 정확도: 검증 불가
- 예시: `בְּרֵאשִׁית, בָּרָא אֱלֹהִים`

**문제점**:
- ❌ 니쿠드 오류 시 발음이 완전히 달라짐
- ❌ 학습자가 잘못된 발음 암기
- ❌ 확장 시 품질 보장 불가

#### 2. 단어장 UI/UX 문제
**현재 데이터 구조**:
```typescript
{
  hebrew: 'בָּרָא',
  meaning: '창조하셨다',
  ipa: 'baˈra',
  korean: '바라',
  root: 'ב-ר-א (bara)',              // ❓ 일반인에게 의미 불명
  grammar: '동사 Qal 완료형 3인칭 남성 단수',  // ❌ 너무 복잡, 가독성 낮음
  structure: '어근 ב-ר-א로 오직 하나님만이 하시는 창조'  // ✅ 좋음
}
```

**문제점**:
- ❌ **root**: 히브리어 어근(ב-ר-א)은 초보자에게 무의미
- ❌ **grammar**: 전문 용어 과다 ("Qal", "완료형", "3인칭 남성 단수")
- ❌ **가독성**: 정보 과부하로 핵심 메시지 파악 어려움
- ❓ **학습 효과**: 단순 정보 나열, 암기에 도움 안 됨

#### 3. 단어 암기 시스템 부재
**현재**:
- 단어 목록만 표시
- 플래시카드 기능 미약
- 반복 학습 시스템 없음
- 진도 추적 부족

---

## ✅ 해결 방안

## Part 1: 니쿠드 100% 정확도 달성

### 데이터 소스: Open Scriptures Hebrew Bible (OSHB)

**선택 이유**:
- ✅ **출처**: Westminster Leningrad Codex (가장 권위 있는 마소라 본문)
- ✅ **정확도**: 100% 검증된 니쿠드
- ✅ **라이선스**: Public Domain (WLC), CC BY 4.0 (OSHB)
- ✅ **형태소 분석**: 각 단어마다 품사, Strong's 번호 포함
- ✅ **접근성**: GitHub에서 무료 다운로드

**데이터 샘플** (창세기 1:1):
```xml
<verse osisID="Gen.1.1">
  <w lemma="b/7225" morph="HR/Ncfsa">בְּ/רֵאשִׁ֖ית</w>
  <w lemma="1254 a" morph="HVqp3ms">בָּרָ֣א</w>
  <w lemma="430" morph="HNcmpa">אֱלֹהִ֑ים</w>
  <w lemma="853" morph="HTo">אֵ֥ת</w>
  <w lemma="d/8064" morph="HTd/Ncmpa">הַ/שָּׁמַ֖יִם</w>
  <w lemma="c/853" morph="HC/To">וְ/אֵ֥ת</w>
  <w lemma="d/776" morph="HTd/Ncbsa">הָ/אָֽרֶץ</w>
</verse>
```

**활용 방법**:
1. GitHub에서 창세기 XML 다운로드
2. XML 파서로 구절별 추출
3. 니쿠드 포함 히브리어 텍스트 사용
4. 형태소 분석(morph) 활용하여 품사 자동 추출

### 구현 스크립트

**scripts/fetchAccurateHebrew.ts**:
```typescript
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';

interface OSHBWord {
  _: string;              // בְּ/רֵאשִׁ֖ית
  $: {
    lemma: string;        // b/7225
    morph: string;        // HR/Ncfsa
  };
}

interface OSHBVerse {
  $: { osisID: string };  // Gen.1.1
  w: OSHBWord[];
}

async function downloadGenesisXML() {
  const url = 'https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/Gen.xml';
  const response = await axios.get(url);
  return response.data;
}

async function parseXML(xml: string) {
  const result = await parseStringPromise(xml);
  const book = result.osis.osisText[0].div[0].chapter;

  const verses = [];
  for (const chapter of book) {
    const chapterNum = parseInt(chapter.$.osisID.split('.')[1]);

    for (const verse of chapter.verse) {
      const verseNum = parseInt(verse.$.osisID.split('.')[2]);
      const words = verse.w || [];

      // 니쿠드 포함 히브리어 추출
      const hebrewText = words
        .map((w: OSHBWord) => w._)
        .join(' ')
        .replace(/\//g, '')  // 형태소 구분자 제거
        .replace(/[֑־׃׀]/g, '');  // 특수 기호 제거

      verses.push({
        id: `gen${chapterNum}-${verseNum}`,
        chapter: chapterNum,
        verseNumber: verseNum,
        hebrew: hebrewText,
        words: words.map((w: OSHBWord) => ({
          hebrew: w._.replace(/[\/־]/g, ''),
          lemma: w.$.lemma,
          morph: w.$.morph
        }))
      });
    }
  }

  return verses;
}

async function main() {
  console.log('📥 OSHB 창세기 다운로드 중...');
  const xml = await downloadGenesisXML();

  console.log('🔍 XML 파싱 중...');
  const verses = await parseXML(xml);

  console.log(`✅ ${verses.length}개 구절 추출 완료`);

  // JSON 저장
  fs.writeFileSync(
    'data/genesis-oshb.json',
    JSON.stringify(verses, null, 2)
  );

  console.log('💾 data/genesis-oshb.json 저장 완료');
}

main();
```

**예상 결과**:
```json
{
  "id": "gen1-1",
  "chapter": 1,
  "verseNumber": 1,
  "hebrew": "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
  "words": [
    {
      "hebrew": "בְּרֵאשִׁית",
      "lemma": "b/7225",
      "morph": "HR/Ncfsa"
    },
    ...
  ]
}
```

---

## Part 2: 단어장 UI/UX 개선

### 새로운 단어 데이터 구조

**개선 원칙**:
1. ❌ **제거**: 일반 학습자에게 무의미한 정보 삭제
2. ✅ **추가**: 암기에 도움되는 정보 강화
3. 🎨 **개선**: 시각적 표현 강화

**Before (기존)**:
```typescript
{
  hebrew: 'בָּרָא',
  meaning: '창조하셨다',
  ipa: 'baˈra',
  korean: '바라',
  root: 'ב-ר-א (bara)',                         // ❌ 삭제
  grammar: '동사 Qal 완료형 3인칭 남성 단수',      // ❌ 삭제
  structure: '어근 ב-ר-א로 오직 하나님만이...'   // ✅ 유지
}
```

**After (개선)**:
```typescript
{
  hebrew: 'בָּרָא',
  meaning: '창조하셨다',

  // 발음
  ipa: 'baˈra',
  korean: '바라',
  audioUrl: '/audio/bara.mp3',  // 🆕 음성 파일

  // 품사 (간단하게)
  partOfSpeech: '동사',           // 🆕 간소화
  tense: '과거',                 // 🆕 쉬운 표현

  // 핵심 의미
  coreIdea: '무에서 유를 만들다',  // 🆕 한 문장 요약

  // 기억 돕기
  mnemonic: '바-라 → 바로 만들다 → 창조',  // 🆕 암기 힌트

  // 스토리텔링
  story: '하나님만 사용하는 특별한 단어예요. 사람은 "만들 수" 있지만 "창조할 수"는 없어요!',

  // 비주얼
  emoji: '✨',                    // 🆕 이모지
  color: '#4F46E5',              // 🆕 테마 색상

  // 예문 (실제 성경 구절)
  examples: [
    {
      reference: '창세기 1:1',
      hebrew: 'בָּרָא אֱלֹהִים',
      translation: '하나님이 창조하셨다'
    },
    {
      reference: '창세기 1:21',
      hebrew: 'בָּרָא אֱלֹהִים אֶת־הַתַּנִּינִם',
      translation: '하나님이 큰 바다 짐승들을 창조하셨다'
    }
  ],

  // 관련 단어
  related: ['עָשָׂה (만들다)', 'יָצַר (빚다)'],

  // 학습 데이터
  difficulty: 1,      // 1-5 난이도
  frequency: 48,      // 성경 전체 등장 횟수
  importance: 5       // 1-5 중요도
}
```

### 단어 카드 UI 개선

#### Before (현재):
```
┌─────────────────────────────┐
│ בָּרָא                       │
│ 바라 (baˈra)                │
│                             │
│ 의미: 창조하셨다              │
│ 어근: ב-ר-א (bara)          │
│ 품사: 동사 Qal 완료형         │
│      3인칭 남성 단수          │
└─────────────────────────────┘
```
❌ 정보 과부하, 시각적 매력 없음

#### After (개선):
```
┌─────────────────────────────────────┐
│  ✨ בָּרָא                          │
│  바-라 🔊                           │
│                                     │
│  💡 무에서 유를 만들다               │
│                                     │
│  📖 창조하셨다                       │
│  🏷️ 동사 · 과거                     │
│                                     │
│  💭 하나님만 쓰는 특별한 단어!        │
│                                     │
│  ❝ בָּרָא אֱלֹהִים ❞                │
│    하나님이 창조하셨다 (창 1:1)      │
│                                     │
│  🔗 관련: עָשָׂה (만들다)            │
└─────────────────────────────────────┘
```
✅ 시각적, 직관적, 스토리텔링

### 인터랙티브 기능

**1. 발음 듣기**
- 🔊 아이콘 클릭 → 음성 재생
- Text-to-Speech API 활용 (Google Cloud TTS)
- 느린 속도 / 빠른 속도 옵션

**2. 플립 카드**
- 앞면: 히브리어 + 발음
- 뒷면: 의미 + 스토리
- 클릭/스와이프로 뒤집기

**3. 암기 힌트**
- "바-라 → 바로 만들다"
- 발음 연상법, 시각적 연상

**4. 진도 표시**
- 💚 완전히 암기함
- 💛 익숙함
- 🤍 모름
- 간격 반복 학습 (Spaced Repetition)

---

## Part 3: 단어 암기 시스템

### 학습 방법론: 간격 반복 학습 (SRS)

**알고리즘**: SuperMemo SM-2 (간소화 버전)

**원리**:
1. 새 단어: 1일 후 복습
2. 쉬움: 4일 후
3. 보통: 2일 후
4. 어려움: 다시 복습

### 플래시카드 시스템

**컴포넌트**: `<FlashcardDeck />`

**기능**:
1. **학습 모드**
   - 새 단어 학습
   - 복습 대기 단어 표시
   - 진도 추적

2. **퀴즈 모드**
   - 히브리어 → 한국어
   - 한국어 → 히브리어
   - 발음 듣고 맞추기

3. **게임화**
   - 연속 정답 카운트
   - 일일 목표 달성
   - 배지 획득
   - 레벨 업

### UI/UX Flow

```
┌─────────────────────────────────┐
│  📚 오늘의 복습                  │
│                                 │
│  🆕 새 단어: 5개                │
│  🔄 복습: 12개                  │
│  ✅ 완료: 18개                  │
│                                 │
│  [학습 시작] [퀴즈 풀기]         │
└─────────────────────────────────┘

          ↓ 학습 시작 클릭

┌─────────────────────────────────┐
│           1 / 17                │
│                                 │
│      ✨ בָּרָא                  │
│      바-라 🔊                   │
│                                 │
│  [카드 뒤집기]                   │
│                                 │
│  ─────────────────────          │
│  [← 이전]          [다음 →]    │
└─────────────────────────────────┘

          ↓ 뒤집기 클릭

┌─────────────────────────────────┐
│  💡 무에서 유를 만들다           │
│  📖 창조하셨다                   │
│                                 │
│  💭 하나님만 쓰는 특별한 단어!    │
│                                 │
│  이 단어를 얼마나 잘 알고 있나요? │
│                                 │
│  [😰 어려움] [😐 보통] [😊 쉬움] │
└─────────────────────────────────┘
```

### 데이터베이스 스키마

**새 테이블**: `user_word_progress`

```sql
CREATE TABLE user_word_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,  -- 'bara', 'elohim' 등
  verse_id TEXT,          -- 'gen1-1'

  -- 학습 상태
  status TEXT DEFAULT 'new',  -- new, learning, reviewing, mastered
  difficulty INTEGER DEFAULT 3,  -- 1-5

  -- 간격 반복
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL DEFAULT 2.5,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_user_word_review ON user_word_progress(user_id, next_review_at);
```

### React Hook: `useFlashcards`

```typescript
export function useFlashcards(verseId?: string) {
  const { user } = useAuth();

  const fetchDueWords = async () => {
    const { data } = await supabase
      .from('user_word_progress')
      .select('*')
      .eq('user_id', user.id)
      .lte('next_review_at', new Date().toISOString())
      .order('next_review_at', { ascending: true });

    return data;
  };

  const updateWordProgress = async (
    wordId: string,
    difficulty: 'hard' | 'medium' | 'easy'
  ) => {
    // SM-2 알고리즘 적용
    const factor = difficulty === 'easy' ? 2.5 : difficulty === 'medium' ? 1.2 : 0.5;
    const newInterval = Math.round(currentInterval * factor);
    const nextReview = addDays(new Date(), newInterval);

    await supabase
      .from('user_word_progress')
      .update({
        last_reviewed_at: new Date(),
        next_review_at: nextReview,
        review_count: increment(1),
        interval_days: newInterval,
        status: newInterval > 21 ? 'mastered' : 'reviewing'
      })
      .eq('word_id', wordId)
      .eq('user_id', user.id);
  };

  return {
    dueWords,
    updateWordProgress,
    newWords,
    masteredWords
  };
}
```

---

## 🎨 시각적 개선

### 단어 카테고리별 색상

| 카테고리 | 색상 | 예시 |
|---------|------|------|
| 하나님 이름 | 보라 #8B5CF6 | אֱלֹהִים, יְהוָה |
| 창조 동사 | 파랑 #3B82F6 | בָּרָא, עָשָׂה |
| 자연 명사 | 초록 #10B981 | שָׁמַיִם, אֶרֶץ |
| 시간 표현 | 주황 #F59E0B | יוֹם, לַיְלָה |
| 전치사/조사 | 회색 #6B7280 | אֵת, בְּ |

### 이모지 시스템

| 품사 | 이모지 |
|------|-------|
| 명사 | 📦 |
| 동사 | ⚡ |
| 형용사 | 🎨 |
| 전치사 | 🔗 |
| 접속사 | ➕ |

### 애니메이션

- **카드 진입**: fade-in + slide-up
- **카드 뒤집기**: 3D flip
- **정답**: 초록 펄스
- **오답**: 빨강 흔들림
- **레벨업**: 폭죽 효과

---

## 📊 측정 지표

### 학습 효과
- 일일 학습 단어 수
- 복습 정확도 (%)
- 장기 기억률 (1주 후, 1개월 후)
- 평균 암기 시간

### 사용자 참여
- 일일 활성 사용자 (DAU)
- 학습 세션 시간
- 완료율 (시작 vs 완료)
- 연속 학습 일수 (Streak)

---

## 🚀 구현 계획

### Phase 1: 니쿠드 정확도 (1주)
- [ ] OSHB XML 파서 스크립트 작성
- [ ] 창세기 전체 다운로드 및 추출
- [ ] 기존 데이터와 비교 검증
- [ ] DB 업데이트

### Phase 2: 단어장 개선 (2주)
- [ ] 새 단어 데이터 스키마 설계
- [ ] AI로 암기 힌트, 스토리 생성
- [ ] 단어 카드 UI 리디자인
- [ ] 발음 오디오 통합 (TTS API)

### Phase 3: 플래시카드 시스템 (2주)
- [ ] `user_word_progress` 테이블 생성
- [ ] SM-2 알고리즘 구현
- [ ] `useFlashcards` 훅 개발
- [ ] FlashcardDeck 컴포넌트
- [ ] 퀴즈 모드 구현

### Phase 4: 게임화 (1주)
- [ ] 배지 시스템
- [ ] 일일 목표 / 연속 일수
- [ ] 리더보드
- [ ] 애니메이션 효과

**총 소요 시간**: 6주

---

## 💡 혁신 아이디어

### 1. 시각적 연상 학습
각 단어마다 **일러스트** 추가
- בָּרָא (창조) → 빅뱅 이미지
- אֱלֹהִים (하나님) → 왕관 이미지
- AI 이미지 생성 (DALL-E, Midjourney)

### 2. 스토리 모드
**"창세기 1장 정복하기"**
- 7일 챌린지 (하루 = 하루)
- 각 날마다 단어 5-7개 학습
- 스토리와 함께 단어 암기
- 완료 시 "창조주의 제자" 배지

### 3. 음성 인식 학습
**발음 연습 모드**
- 히브리어 단어 보고 발음
- 음성 인식으로 정확도 평가
- 발음 피드백 제공
- Web Speech API 활용

### 4. 단어 조합 게임
**"히브리어 레고"**
- 어근(ב-ר-א) + 패턴 조합
- 단어 만들기 게임
- 어근 학습 게이미피케이션

### 5. 소셜 기능
**학습 그룹**
- 친구와 함께 학습
- 진도 공유
- 경쟁 / 협력 모드
- 학습 격려 메시지

---

## 🎯 기대 효과

### 학습자
- ✅ 정확한 히브리어 발음 학습
- ✅ 단어 암기율 2배 향상
- ✅ 재미있고 몰입도 높은 학습
- ✅ 장기 기억 형성

### 앱 품질
- ✅ 데이터 정확도 100%
- ✅ 전문성 신뢰도 향상
- ✅ 사용자 리텐션 증가
- ✅ 확장 가능한 시스템

---

## 📝 다음 단계

1. **즉시 시작 가능**: OSHB 데이터 다운로드
2. **사용자 피드백**: 현재 단어장의 불편한 점
3. **우선순위 결정**: 어떤 기능부터 구현할지

어떤 부분부터 시작할까요?
