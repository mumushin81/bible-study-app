# 🔊 한글 발음 개선 계획

## 📊 현황 분석

### 주요 문제점

히브리어는 한글로 정확히 표기하기 어려운 소리들이 많습니다:

| 히브리어 음소 | IPA | 현재 한글 | 문제점 | 예시 |
|-------------|-----|---------|--------|------|
| **א** (알레프) | ʔ | 무표기 | 성문 파열음이 누락됨 | אֱלֹהִים → 엘로힘 |
| **ע** (아인) | ʕ | ㅇ | 인두 마찰음을 일반 ㅇ으로 표기 | עַל → 알 |
| **ח** (헤트) | ħ | ㅎ | 인두 마찰음을 ㅎ으로 표기 | חֹשֶׁךְ → 호쉐흐 |
| **כ/ך** (카프 약음) | χ | ㅎ | 연구개 마찰음을 ㅎ으로 표기 | לֶךְ → 레흐 |
| **ְ** (슈와) | ə | ㅔ/ㅡ | 중성 모음을 명확히 구분 못함 | בְּ → 베 |

### 통계 (Genesis 1:1 기준)
- **총 7개 단어** 중
- **57.1%** (4개)가 ʔ 포함
- **28.6%** (2개)가 ə 포함
- **100%** 정확한 한글 표기 불가능

---

## 🎯 개선 방안

### Option 1: 개선된 한글 표기법 (즉시 적용 가능) ⭐

**방법:** 특수 기호와 색상을 활용한 정확한 표기

#### 개선 예시

**Before:**
```
אֱלֹהִים → 엘로힘
```

**After (방법 A - 특수 표기):**
```
אֱלֹהִים → ʔ엘로힘
עַל → ʕ알
חֹשֶׁךְ → ħ오쉐ך
```

**After (방법 B - 설명 추가):**
```
אֱלֹהִים
├─ 한글: 엘로힘
├─ 발음: [ʔ]엘로힘
└─ 💡 'ʔ'는 목구멍을 막았다 터뜨리는 소리
```

**After (방법 C - UI 개선):**
```
┌──────────────────────────┐
│ אֱלֹהִים                  │
│                          │
│ 🔤 IPA: ʔɛloˈhim         │
│ 🇰🇷 한글: 엘로힘          │
│ 💡 ʔ = 성문파열음         │
│    ('어' 발음 전 목구멍을 │
│     잠깐 막는 소리)       │
└──────────────────────────┘
```

#### 구현 계획

```typescript
interface ImprovedPronunciation {
  korean: string;              // "엘로힘"
  koreanWithSymbols: string;   // "ʔ엘로힘"
  phoneticGuide?: {
    symbol: string;            // "ʔ"
    position: number;          // 0
    description: string;       // "성문 파열음"
    howTo: string;            // "'어'를 발음하기 직전 목구멍을 막는 소리"
  }[];
}
```

---

### Option 2: 음성 합성 API (중기 - 2-3주) 🔊

**방법:** Web Speech API 또는 외부 TTS 서비스 활용

#### A. Web Speech API (무료, 브라우저 내장)

```typescript
function speakHebrew(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'he-IL';  // 히브리어 (이스라엘)
  utterance.rate = 0.8;      // 속도 조절
  window.speechSynthesis.speak(utterance);
}
```

**장점:**
- ✅ 무료, 설치 불필요
- ✅ 브라우저 내장
- ✅ 즉시 구현 가능

**단점:**
- ⚠️ 브라우저마다 품질 차이
- ⚠️ 오프라인 불가능
- ⚠️ 음성 선택 제한적

#### B. Google Cloud Text-to-Speech (유료, 고품질)

```typescript
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

async function synthesizeHebrew(text: string) {
  const client = new TextToSpeechClient();

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: 'he-IL',
      name: 'he-IL-Wavenet-A',  // 고품질 음성
      ssmlGender: 'NEUTRAL'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.9,
      pitch: 0
    }
  });

  // MP3 재생
  const audio = new Audio(`data:audio/mp3;base64,${response.audioContent}`);
  audio.play();
}
```

**장점:**
- ✅ 매우 높은 품질 (Wavenet)
- ✅ 정확한 히브리어 발음
- ✅ 속도/피치 조절 가능

**단점:**
- ❌ 비용 발생 (~$4/100만 글자)
- ❌ API 키 필요
- ❌ 네트워크 필수

#### C. Azure Cognitive Services (유료, 중간)

```typescript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

function speakWithAzure(text: string) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY!,
    process.env.AZURE_REGION!
  );

  speechConfig.speechSynthesisLanguage = 'he-IL';
  speechConfig.speechSynthesisVoiceName = 'he-IL-HilaNeural';

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  synthesizer.speakTextAsync(text,
    result => console.log('✅ 발음 완료'),
    error => console.error('❌ 발음 실패:', error)
  );
}
```

**비용 비교:**
- **Web Speech API**: 무료
- **Google TTS**: $4/100만 글자 (~$0.06/1,533 구절)
- **Azure TTS**: $16/100만 글자 (~$0.25/1,533 구절)

---

### Option 3: 원어민 오디오 클립 (장기 - 1-2개월) 🎤

**방법:** 실제 히브리어 원어민 발음 녹음

#### A. 오픈소스 오디오 찾기

**추천 소스:**
1. **Bible.is** - 무료 오디오 성경
   - URL: https://www.bible.is/
   - 라이선스: CC BY-SA
   - 품질: 전문 성우 녹음

2. **Faith Comes By Hearing**
   - URL: https://www.faithcomesbyhearing.com/
   - 라이선스: 비영리 사용 가능
   - 품질: 극상

3. **Sefaria**
   - 일부 구절 오디오 제공
   - API 접근 가능

#### B. 직접 녹음

**프로세스:**
1. 히브리어 원어민 섭외 (Fiverr, Upwork)
2. 1,533개 구절 녹음 ($500-1,000)
3. 오디오 파일 편집 및 정규화
4. Supabase Storage 업로드

**파일 구조:**
```
audio/
├── genesis/
│   ├── 1/
│   │   ├── 1.mp3  (Genesis 1:1)
│   │   ├── 2.mp3  (Genesis 1:2)
│   │   └── ...
│   └── 2/
│       └── ...
```

**구현:**
```typescript
function playVerseAudio(verseId: string) {
  const audioUrl = `${SUPABASE_URL}/storage/v1/object/public/audio/${verseId}.mp3`;
  const audio = new Audio(audioUrl);
  audio.play();
}
```

---

### Option 4: 하이브리드 접근 (추천) ⭐⭐⭐

**단계별 구현:**

#### Phase 1: 즉시 (1-2일)
1. **발음 가이드 추가**
   ```tsx
   <div className="pronunciation-guide">
     <span className="korean">엘로힘</span>
     <span className="hint">💡 앞에 목구멍 막는 소리 ʔ</span>
   </div>
   ```

2. **색상 코딩**
   - ʔ (알레프) → 🟡 노란색
   - ʕ (아인) → 🟢 녹색
   - ħ (헤트) → 🔵 파란색
   - χ (카프) → 🟣 보라색

#### Phase 2: 단기 (1주)
3. **Web Speech API 추가**
   ```tsx
   <button onClick={() => speak(word.hebrew)}>
     🔊 듣기
   </button>
   ```

#### Phase 3: 중기 (2-3주)
4. **개선된 한글 표기 DB 업데이트**
   - 기존: "엘로힘"
   - 개선: "ʔ엘로힘" + 발음 가이드

5. **Google TTS 통합** (선택)
   - 고품질 발음 제공
   - 비용: ~$0.06 (전체 Genesis)

#### Phase 4: 장기 (1-2개월)
6. **원어민 오디오 수집**
   - 오픈소스 오디오 찾기
   - 또는 직접 녹음 ($500-1,000)

---

## 🛠️ 구체적 구현 예시

### 1. 발음 가이드 컴포넌트

```tsx
// src/components/PronunciationGuide.tsx
interface Props {
  hebrew: string;
  ipa: string;
  korean: string;
  darkMode: boolean;
}

export function PronunciationGuide({ hebrew, ipa, korean, darkMode }: Props) {
  const guides = parsePhoneticGuides(ipa, korean);

  return (
    <div className="space-y-2">
      {/* 기본 한글 표기 */}
      <div className="text-lg">{korean}</div>

      {/* 발음 힌트 */}
      {guides.map((guide, idx) => (
        <div key={idx} className="flex items-start gap-2 text-sm">
          <span className={`font-mono px-2 py-1 rounded ${
            guide.type === 'glottal' ? 'bg-yellow-100 text-yellow-900' :
            guide.type === 'pharyngeal' ? 'bg-green-100 text-green-900' :
            'bg-blue-100 text-blue-900'
          }`}>
            {guide.symbol}
          </span>
          <span className="text-gray-600">{guide.description}</span>
        </div>
      ))}

      {/* 발음 듣기 버튼 */}
      <button
        onClick={() => speak(hebrew)}
        className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg"
      >
        🔊 발음 듣기
      </button>
    </div>
  );
}

function parsePhoneticGuides(ipa: string, korean: string) {
  const guides = [];

  if (ipa.includes('ʔ')) {
    guides.push({
      symbol: 'ʔ',
      type: 'glottal',
      description: '성문 파열음: 목구멍을 막았다 터뜨리는 소리'
    });
  }

  if (ipa.includes('ʕ')) {
    guides.push({
      symbol: 'ʕ',
      type: 'pharyngeal',
      description: '아인: 목 깊은 곳에서 나는 소리'
    });
  }

  if (ipa.includes('ħ')) {
    guides.push({
      symbol: 'ħ',
      type: 'pharyngeal',
      description: '헤트: ㅎ보다 더 거친 목소리'
    });
  }

  if (ipa.includes('χ')) {
    guides.push({
      symbol: 'χ',
      type: 'velar',
      description: '카프: ㅋ과 ㅎ 사이 소리'
    });
  }

  return guides;
}

function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'he-IL';
  utterance.rate = 0.75;  // 천천히
  window.speechSynthesis.speak(utterance);
}
```

### 2. DB 스키마 확장

```sql
-- Verses 테이블에 컬럼 추가
ALTER TABLE verses ADD COLUMN korean_pronunciation_improved TEXT;
ALTER TABLE verses ADD COLUMN pronunciation_guides JSONB;

-- 예시 데이터
UPDATE verses SET
  korean_pronunciation_improved = 'ʔ엘로힘',
  pronunciation_guides = '[
    {
      "symbol": "ʔ",
      "position": 0,
      "type": "glottal",
      "description": "성문 파열음",
      "howTo": "''어''를 발음하기 직전 목구멍을 잠깐 막는 소리"
    }
  ]'::jsonb
WHERE id = 'genesis_1_1';
```

### 3. 개선된 한글 생성 스크립트

```typescript
// scripts/improveKoreanPronunciation.ts
function improveKoreanPronunciation(ipa: string): string {
  let improved = ipa;

  // 1. ʔ (알레프) 표시
  improved = improved.replace(/ʔ([aeioəɛ])/g, 'ʔ$1');

  // 2. ʕ (아인) 구분
  improved = improved.replace(/ʕ/g, 'ʕ');

  // 3. ħ (헤트) 구분
  improved = improved.replace(/ħ/g, 'ħ');

  // 4. χ (카프) 구분
  improved = improved.replace(/χ/g, 'ך');

  // 5. ə (슈와) 정확히
  improved = improved.replace(/ə/g, 'ㅡ');

  // 6. IPA → 한글 변환
  const korean = ipaToKorean(improved);

  return korean;
}

function ipaToKorean(ipa: string): string {
  const mapping: Record<string, string> = {
    'b': 'ㅂ', 'p': 'ㅍ', 'm': 'ㅁ',
    'd': 'ㄷ', 't': 'ㅌ', 'n': 'ㄴ',
    'g': 'ㄱ', 'k': 'ㅋ',
    'l': 'ㄹ', 'r': 'ㄹ',
    's': 'ㅅ', 'z': 'ㅈ',
    'ʃ': 'ㅅ', 'ʒ': 'ㅈ',
    'h': 'ㅎ',
    'v': 'ㅂ', 'f': 'ㅍ',

    // 모음
    'a': 'ㅏ', 'e': 'ㅔ', 'i': 'ㅣ',
    'o': 'ㅗ', 'u': 'ㅜ',
    'ə': 'ㅡ',
    'ɛ': 'ㅔ', 'ɔ': 'ㅗ',

    // 특수
    'ʔ': 'ʔ',  // 유지
    'ʕ': 'ʕ',  // 유지
    'ħ': 'ħ',  // 유지
    'χ': 'ך',  // 카프 최종형
  };

  // 변환 로직 (간단 예시)
  let korean = '';
  for (const char of ipa) {
    korean += mapping[char] || char;
  }

  return korean;
}
```

---

## 📊 비용 및 시간 추정

| 방안 | 비용 | 시간 | 품질 | 난이도 |
|------|------|------|------|--------|
| **발음 가이드 추가** | 무료 | 1-2일 | ⭐⭐⭐ | 쉬움 |
| **Web Speech API** | 무료 | 2-3일 | ⭐⭐ | 쉬움 |
| **Google TTS** | ~$0.06 | 1주 | ⭐⭐⭐⭐⭐ | 중간 |
| **Azure TTS** | ~$0.25 | 1주 | ⭐⭐⭐⭐ | 중간 |
| **원어민 오디오** | $500-1,000 | 1-2개월 | ⭐⭐⭐⭐⭐ | 어려움 |

---

## 🎯 추천 실행 계획

### 🏃 즉시 실행 (이번 주)
1. ✅ **발음 가이드 UI 추가**
   - 특수 음소 표시 (ʔ, ʕ, ħ, χ)
   - 색상 코딩
   - 설명 툴팁

2. ✅ **Web Speech API 통합**
   - 🔊 버튼 추가
   - 히브리어 TTS 재생

### 📅 다음 주
3. **개선된 한글 표기 DB 업데이트**
   - 스크립트 작성
   - Genesis 1-3장 업데이트
   - 검증

### 🔮 다음 달
4. **Google TTS 검토** (선택)
   - 품질 테스트
   - 비용 검토
   - 사용자 피드백

5. **원어민 오디오 조사**
   - 오픈소스 찾기
   - 라이선스 확인
   - 통합 계획

---

## 💡 결론

**즉시 구현 가능한 최선의 방법:**

1. **발음 가이드 + Web Speech API** (무료, 1-2일)
   - ✅ 즉시 효과
   - ✅ 비용 없음
   - ✅ 사용자 경험 대폭 개선

2. **장기적으로 Google TTS 추가** (저렴, 고품질)
   - 비용: ~$0.06 (일회성)
   - 품질: 매우 높음
   - ROI: 높음

**바로 시작하시겠습니까?** 🚀
