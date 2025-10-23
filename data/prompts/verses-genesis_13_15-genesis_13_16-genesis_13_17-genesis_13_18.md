━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 구절 컨텐츠 생성 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 생성 대상 구절


**Genesis 13:15** (ID: genesis_13_15)
- Hebrew: כִּ֧י אֶת כָּל הָאָ֛רֶץ אֲשֶׁר אַתָּ֥ה רֹאֶ֖ה לְךָ֣ אֶתְּנֶ֑נָּה וּֽלְזַרְעֲךָ֖ עַד עוֹלָֽם
- IPA (기존): [TODO: IPA]
- Korean Pronunciation (기존): [TODO: 한글 발음]
- Modern (기존): [TODO: 한글 현대어 의역]


**Genesis 13:16** (ID: genesis_13_16)
- Hebrew: וְשַׂמְתִּ֥י אֶֽת זַרְעֲךָ֖ כַּעֲפַ֣ר הָאָ֑רֶץ אֲשֶׁ֣ר אִם יוּכַ֣ל אִ֗ישׁ לִמְנוֹת֙ אֶת עֲפַ֣ר הָאָ֔רֶץ גַּֽם זַרְעֲךָ֖ יִמָּנֶֽה
- IPA (기존): [TODO: IPA]
- Korean Pronunciation (기존): [TODO: 한글 발음]
- Modern (기존): [TODO: 한글 현대어 의역]


**Genesis 13:17** (ID: genesis_13_17)
- Hebrew: ק֚וּם הִתְהַלֵּ֣ךְ בָּאָ֔רֶץ לְאָרְכָּ֖הּ וּלְרָחְבָּ֑הּ כִּ֥י לְךָ֖ אֶתְּנֶֽנָּה
- IPA (기존): [TODO: IPA]
- Korean Pronunciation (기존): [TODO: 한글 발음]
- Modern (기존): [TODO: 한글 현대어 의역]


**Genesis 13:18** (ID: genesis_13_18)
- Hebrew: וַיֶּאֱהַ֣ל אַבְרָ֗ם וַיָּבֹ֛א וַיֵּ֛שֶׁב בְּאֵלֹנֵ֥י מַמְרֵ֖א אֲשֶׁ֣ר בְּחֶבְר֑וֹן וַיִּֽבֶן שָׁ֥ם מִזְבֵּ֖חַ לַֽיהוָֽה
- IPA (기존): [TODO: IPA]
- Korean Pronunciation (기존): [TODO: 한글 발음]
- Modern (기존): [TODO: 한글 현대어 의역]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 작업 요청

다음 구절들에 대해 **전체 컨텐츠**를 생성해주세요:
1. IPA 발음 (없는 경우)
2. 한글 발음 (없는 경우)
3. 현대어 의역 (없는 경우)
4. 단어 분석 (words)
5. 주석 (commentary)

각 구절마다 다음 형식의 JSON을 생성해주세요:

```json
{
  "verse_id": "gen2-4",
  "ipa": "히브리어 전체의 IPA 발음",
  "korean_pronunciation": "히브리어 전체의 한글 발음",
  "modern": "현대어 자연스러운 의역 (한 문장)",
  "words": [
    {
      "hebrew": "히브리어 단어",
      "meaning": "한국어 의미",
      "ipa": "IPA 발음",
      "korean": "한글 발음",
      "root": "히브리어 어근 (한글)",
      "grammar": "문법 정보",
      "emoji": "이모지",
      "structure": "구조 설명 (선택)",
      "category": "카테고리 (선택)",
      "relatedWords": ["관련 단어 1", "관련 단어 2"]
    }
  ],
  "commentary": {
    "intro": "서론 2-3문장",
    "sections": [
      {
        "emoji": "1️⃣",
        "title": "히브리어 (한글 발음) - 설명",
        "description": "단어/개념 설명 2-3문장",
        "points": ["포인트1", "포인트2", "포인트3"],
        "color": "purple"
      }
    ],
    "whyQuestion": {
      "question": "어린이를 위한 질문",
      "answer": "어린이가 이해할 수 있는 답변 3-5문장",
      "bibleReferences": [
        "책 장:절 - '인용문'",
        "책 장:절 - '인용문'"
      ]
    },
    "conclusion": {
      "title": "💡 신학적 의미",
      "content": "신학적 의미 2-3문장"
    }
  }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 가이드라인 (필독!)

<details>
<summary>VERSE_CREATION_GUIDELINES.md</summary>

```markdown
# 창세기 구절 컨텐츠 작성 지침 (컨텐츠 제작 에이전트용)

> ⚠️ **이 문서는 컨텐츠 제작 에이전트 전용입니다**
>
> **에이전트 역할 분리:**
> - **크롤링 에이전트**: 히브리어 원문 수집 → Supabase 저장 (참조: `docs/CRAWLING_AGENT.md`)
> - **컨텐츠 제작 에이전트** (이 문서): Claude 4.5 Haiku로 IPA 발음, 한글 발음, 현대어 번역, 단어 분석, 주석 생성 → Supabase 저장 (참조: `docs/CONTENT_GENERATION_AGENT.md`)

## 목차
1. [개요](#개요)
2. [구절 데이터 구조](#구절-데이터-구조)
3. [히브리어 표기 규칙](#히브리어-표기-규칙)
4. [단어 분석 작성 규칙](#단어-분석-작성-규칙)
5. [깊이 읽기(Commentary) 작성 규칙](#깊이-읽기commentary-작성-규칙)
6. [체크리스트](#체크리스트)
7. [자주 하는 실수](#자주-하는-실수)

---

## 개요

이 문서는 **컨텐츠 제작 에이전트**가 Claude 4.5 Haiku를 사용하여 구절 컨텐츠를 생성할 때 지켜야 할 규칙과 형식을 정의합니다.

**작업 범위:**
- ✅ IPA 발음 생성
- ✅ 한글 발음 생성
- ✅ 현대어 의역 생성
- ✅ 단어 분석 (words 테이블)
- ✅ 주석 (commentaries 관련 테이블)
- ❌ 히브리어 원문 수집 (크롤링 에이전트 담당)

**전제 조건:**
- 히브리어 원문은 크롤링 에이전트에 의해 이미 `verses` 테이블에 저장되어 있어야 합니다.
- 컨텐츠 제작 에이전트는 원문을 읽어와서 나머지 필드를 채웁니다.

---

## 구절 데이터 구조

각 구절은 다음 필드를 포함해야 합니다:

```typescript
{
  id: string;                    // '{책ID}_{장}_{절}' 형식 (예: 'genesis_1_1')
  reference: string;             // '창세기 1:1' 형식
  hebrew: string;                // 히브리어 원문 (크롤링 에이전트가 이미 저장함)
  ipa: string;                   // 국제 음성 기호 표기 (생성 필요)
  koreanPronunciation: string;   // 한글 발음 표기 (생성 필요)
  modern: string;                // 현대어 의역 (생성 필요)
  words: Word[];                 // 단어별 상세 분석 (생성 필요)
  commentary: Commentary;        // 깊이 읽기 (생성 필요, 필수)
}
```

### 필수 vs 선택 필드

**필수 필드:**
- `id`, `reference`, `hebrew`, `ipa`, `koreanPronunciation`, `modern`, `words`, `commentary`
  - 모든 구절은 깊이 있는 학습을 위해 commentary를 반드시 포함해야 합니다

---

## 히브리어 표기 규칙

### 1. 히브리어 원문 (hebrew)
- **정확한 히브리어 문자** 사용
- **니쿠드(모음 부호)** 포함
- **마케프(-)** 및 기타 구두점 정확히 표기
- RTL(우→좌) 방향은 자동 처리됨

**예시:**
```typescript
hebrew: 'בְּרֵאשִׁית, בָּרָא אֱלֹהִים, אֵת הַשָּׁמַיִם, וְאֵת הָאָרֶץ.'
```

### 2. IPA 표기 (ipa)
- **국제 음성 기호 표준** 준수
- 강세는 `ˈ`로 표시
- 음절 구분은 공백으로

**예시:**
```typescript
ipa: 'bəreʃit baˈra ʔɛloˈhim ʔet haʃaˈmajim vəʔet haˈʔarɛts'
```

### 3. 한글 발음 (koreanPronunciation)
- 한국인이 읽기 쉬운 형태로 표기
- 음절 단위로 공백 구분
- 하이픈(-)이나 쉼표 사용 최소화

**예시:**
```typescript
koreanPronunciation: '베레쉬트 바라 엘로힘 에트 하샤마임 베에트 하아레츠'
```

---

## 단어 분석 작성 규칙

각 `Word` 객체는 다음 구조를 따릅니다:

```typescript
{
  hebrew: string;          // 히브리어 단어
  meaning: string;         // 한국어 의미
  ipa: string;             // IPA 발음
  korean: string;          // 한글 발음
  letters: string;         // 글자별 분해 (예: "ש(sh) + ָ + ל(l) + ו(o) + ם(m)")
  root: string;            // 어근 (히브리어 + 한글)
  grammar: string;         // 간단한 품사 (명사/동사/형용사/전치사/접속사/부사/대명사)
  emoji: string;           // 단어를 시각적으로 표현하는 이모지 (필수, fallback)
  iconSvg: string;         // 화려한 커스텀 SVG 아이콘 (필수) ⭐ 새로 추가!
  relatedWords?: string[]; // 관련 단어들 (선택)
}
```

### 필수 vs 선택 필드

**필수 필드:**
- `hebrew`, `meaning`, `ipa`, `korean`, `letters`, `root`, `grammar`, `emoji`, `iconSvg`

**선택 필드:**
- `relatedWords` - 어근이 같거나 의미적으로 연관된 단어들

### 1. 단어 선택 기준
- **의미 단위**로 묶어서 분석
- 전치사+명사, 접속사+동사 등은 하나의 단위로 처리 가능
- 중요한 단어는 개별 분석

### 2. letters 필드 작성 (새로 추가)
히브리어 초보자를 위해 각 글자의 발음을 분해하여 표시합니다.

**형식:** `글자1(발음1) + 글자2(발음2) + ...`

**작성 원칙:**
- 히브리어 글자와 그에 대응하는 발음을 괄호 안에 표시
- `+` 기호로 각 글자를 연결
- 모음 부호(니쿠드)는 발음에 포함시키되, 단독으로는 표시 안 함
- 복잡한 경우 의미 단위로 묶을 수 있음

**예시:**
```typescript
// שָׁלוֹם (샬롬 - 평안)
letters: "ש(sh) + ָ(a) + ל(l) + וֹ(o) + ם(m)"

// בְּרֵאשִׁית (베레쉬트 - 처음에)
letters: "בְּ(be) + רֵא(re) + שִׁ(shi) + ית(t)"

// אֱלֹהִים (엘로힘 - 하나님)
letters: "אֱ(e) + לֹ(lo) + הִ(hi) + ים(m)"

// הַשָּׁמַיִם (하샤마임 - 하늘들)
letters: "הַ(ha) + שָּׁ(sha) + מַ(ma) + יִם(yim)"
```

### 3. grammar 필드 작성 (간소화됨)
**형식:** 단순한 품사만 표시

**허용되는 값:**
- `명사` - 사람, 사물, 개념
- `동사` - 행동, 상태
- `형용사` - 성질, 상태
- `전치사` - 위치, 방향, 관계
- `접속사` - 단어/문장 연결
- `부사` - 동사/형용사 수식
- `대명사` - 명사 대체
- `기타` - 위에 해당하지 않는 경우

**예시:**
```typescript
grammar: '명사'       // בְּרֵאשִׁית (처음)
grammar: '동사'       // בָּרָא (창조하다)
grammar: '형용사'     // טוֹב (좋은)
grammar: '전치사'     // בְּ (~에)
grammar: '접속사'     // וְ (그리고)
```

> **참고:** 상세한 문법 정보(Qal, 완료형, 3인칭 등)는 제거되었습니다. 단순하게 품사만 표시합니다.

### 4. root 필드 작성
**형식:** `히브리어 어근 (한글 발음)`

**예시:**
```typescript
root: 'ב-ר-א (bara)'
root: 'רֵאשִׁית (레쉬트)'
root: 'אֱלֹהַּ (엘로아)'
```

### 5. emoji 필드 (필수, fallback용)
각 단어의 의미를 직관적으로 표현하는 이모지를 선택합니다.

**선택 원칙:**
- 단어의 핵심 의미를 시각적으로 표현
- 학습자가 단어를 쉽게 기억할 수 있도록 도움
- 한 개의 이모지만 사용

**예시:**
```typescript
emoji: '🌅'  // 베레쉬트(처음, 시작)
emoji: '✨'  // 바라(창조하다)
emoji: '👑'  // 엘로힘(하나님)
emoji: '🌥️' // 하샤마임(하늘들)
emoji: '🌎'  // 하아레츠(땅)
emoji: '💡'  // 오르(빛)
emoji: '🌙'  // 라일라(밤)
```

### 6. iconSvg 필드 (필수) ⭐ 새로 추가!

**중요**: 각 단어마다 화려하고 웅장한 커스텀 SVG 아이콘을 직접 생성해야 합니다!

단어의 의미를 시각적으로 표현하는 **64x64 SVG 코드**를 생성합니다.

#### 디자인 요구사항

**필수 특징:**
- 🎨 **화려함**: 최소 3-4가지 그라디언트 사용
- 💎 **웅장함**: 임팩트 있고 기억에 남는 디자인
- 🎯 **상징성**: 단어 의미를 직관적으로 표현
- 🌈 **풍부한 색상**: 4-6가지 색상으로 다채롭게

#### SVG 구조 템플릿

```typescript
iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FFA500" />
    </linearGradient>
    <radialGradient id="grad2">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FF6B35" />
    </radialGradient>
  </defs>

  <!-- 메인 비주얼 요소들 -->
  <circle cx="32" cy="32" r="20" fill="url(#grad1)"
    filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))" />

  <!-- 추가 디테일 -->
  <path d="M..." fill="url(#grad2)" opacity="0.8" />
</svg>`
```

#### 실제 예시

**בְּרֵאשִׁית (베레쉬트) - 처음, 태초**
```typescript
iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sun1">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FF6B35" />
    </radialGradient>
    <linearGradient id="sky1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF6B9D" />
      <stop offset="100%" stop-color="#8B3A62" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#sky1)" opacity="0.3" rx="8" />
  <circle cx="32" cy="28" r="12" fill="url(#sun1)"
    filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))" />
  <g stroke="#FFD700" stroke-width="2">
    <line x1="32" y1="12" x2="32" y2="18" />
    <line x1="44" y1="16" x2="40" y2="20" />
    <line x1="48" y1="28" x2="42" y2="28" />
  </g>
</svg>`
```

**אֱלֹהִים (엘로힘) - 하나님**
```typescript
iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="crown1">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FF8C00" />
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="rgba(255, 215, 0, 0.1)" />
  <path d="M 12 48 L 16 36 L 22 40 L 32 28 L 42 40 L 48 36 L 52 48 Z"
    fill="url(#crown1)" stroke="#FF8C00" stroke-width="2"
    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" />
  <rect x="12" y="48" width="40" height="6" fill="url(#crown1)" />
  <circle cx="32" cy="32" r="3" fill="#FF1493"
    filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" />
</svg>`
```

**נָחָשׁ (나하쉬) - 뱀**
```typescript
iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="snake1" x1="0%" x2="100%">
      <stop offset="0%" stop-color="#00C853" />
      <stop offset="100%" stop-color="#FFD700" />
    </linearGradient>
  </defs>
  <path d="M 48 52 Q 52 44 48 36 Q 44 28 48 20 Q 52 12 48 4"
    stroke="url(#snake1)" stroke-width="12" stroke-linecap="round" fill="none"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <ellipse cx="48" cy="4" rx="8" ry="6" fill="url(#snake1)"
    transform="rotate(-30 48 4)" />
  <circle cx="45" cy="3" r="2" fill="#FFD700" />
  <circle cx="20" cy="32" r="8" fill="#C41E3A"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
</svg>`
```

#### 작성 지침

1. **그라디언트 필수**: 최소 2개 이상의 그라디언트 정의
2. **색상 선택**: 단어 의미와 어울리는 색상 팔레트
   - 하나님/거룩: 금색, 흰색, 보라
   - 창조/생명: 초록, 청록, 금색
   - 빛: 노랑, 주황, 흰색
   - 어둠: 보라, 검정, 남색
   - 물: 파랑, 청록, 흰색
   - 불: 빨강, 주황, 노랑
3. **특수 효과**: `filter="drop-shadow(...)"` 적극 활용
4. **투명도**: `opacity` 속성으로 깊이감 표현
5. **간결성**: 너무 복잡하지 않게, 핵심 요소만

#### 주의사항

⚠️ **인라인 스타일**: SVG 문자열 형태로 저장되므로 외부 CSS 참조 불가
⚠️ **ID 충돌 방지 (중요!)**: 각 단어마다 **완전히 고유한** gradient ID 사용
   - ❌ 잘못된 예: `id="grad1"`, `id="sun1"`, `id="point1"` (다른 단어와 중복 가능)
   - ✅ 올바른 예: `id="bereshit-sun1"`, `id="elohim-crown1"`, `id="nashash-snake1"`
   - **규칙**: `{히브리어단어영문}-{고유식별자}` 형식 사용
   - **이유**: HebrewIcon 컴포넌트가 자동으로 고유 ID를 생성하지만, 원본에도 고유 ID 사용 권장
⚠️ **따옴표**: SVG 속성값에 `"` 사용, 전체 문자열은 백틱(\`) 사용
⚠️ **API 사용 금지**: 외부 API를 호출하지 말고, 직접 SVG 코드를 작성할 것!

#### 🐛 알려진 에러 및 해결법

**에러 1: SVG Gradient ID 충돌**
- **증상**: 로컬에서는 SVG 아이콘이 표시되지만 Vercel 배포 후 ❓로 표시됨
- **원인**: 여러 단어에서 동일한 gradient ID (예: `id="grad1"`) 사용 시 DOM 충돌
- **해결**: 각 단어마다 고유한 prefix 사용 (예: `id="bereshit-grad1"`, `id="bara-grad1"`)
- **자동 처리**: HebrewIcon.tsx에서 자동으로 고유 ID 생성하지만, 원본도 고유하게 작성 권장

### 7. relatedWords 필드 (선택)
어근이 같거나 의미적으로 연관된 히브리어 단어들을 배열로 제공합니다.
학습자가 어휘를 확장하고 단어 간의 관계를 이해하는 데 도움이 됩니다.

**작성 원칙:**
- 2-3개 정도의 관련 단어 제공
- "히브리어 (한글 발음 - 한국어 의미)" 형식 사용
- 중요한 단어나 학습 초기 단계의 단어에 주로 사용

**예시:**
```typescript
relatedWords: [
  'רֹאשׁ (로쉬 - 머리)',
  'רִאשׁוֹן (리쇼온 - 첫째)'
]
relatedWords: [
  'בְּרִיאָה (브리아 - 창조물)',
  'בּוֹרֵא (보레 - 창조주)'
]
relatedWords: [
  'אֵל (엘 - 하나님)',
  'יְהוָה (여호와 - 주님)'
]
```

---

## 깊이 읽기(Commentary) 작성 규칙

### ⚠️ 가장 중요: 섹션 제목 형식

**반드시 다음 형식을 따라야 합니다:**

```
히브리어 단어 (한글 발음) - 한국어 설명
```

### ✅ 올바른 예시:
```typescript
title: "בְּרֵאשִׁית (베레쉬트) - 절대적인 시작"
title: "בָּרָא (바라) - 무에서 유를 창조하다"
title: "צְבָאָם (체바암) - 만물의 군대"
title: "הַשָּׁמַיִם וְהָאָרֶץ (하샤마임 베하아레츠) - 하늘과 땅, 창조의 전체성"
```

### ❌ 잘못된 예시:
```typescript
title: "하늘과 땅 - 창조의 전체성"              // ❌ 히브리어 없음
title: "절대적인 시작"                          // ❌ 히브리어와 발음 없음
title: "만물의 군대 - צְבָאָם"                  // ❌ 순서가 반대
```

---

### Commentary 구조

```typescript
commentary: {
  intro: string;                 // 서론 (2-3문장) - 필수
  sections: CommentarySection[]; // 2-4개 섹션 - 필수
  whyQuestion: {                 // 어린이를 위한 질문 - 필수
    question: string;
    answer: string;              // 3-5문장
    bibleReferences: string[];   // 관련 구절 2-4개
  };
  conclusion: {                  // 신학적 의미 - 필수
    title: string;               // 항상 "💡 신학적 의미"
    content: string;             // 2-3문장
  };
}
```

**모든 필드가 필수입니다.** 각 구절은 완전한 학습 경험을 제공하기 위해 intro, sections, whyQuestion, conclusion을 모두 포함해야 합니다.

### 1. intro (서론)
- 구절의 **전체적인 의미**를 2-3문장으로 요약
- 신학적/역사적 맥락 제공
- 구절이 왜 중요한지 설명

**예시:**
```typescript
intro: "창세기 2장 1절은 6일간의 창조 사역의 완성을 선언합니다. '완성되었다'는 히브리어 '칼라'는 단순히 끝났다는 의미가 아니라, 완전하고 완벽하게 이루어졌다는 의미를 담고 있습니다."
```

### 2. sections (색상 카드 섹션)
각 섹션은 **하나의 주요 히브리어 단어나 개념**을 깊이 있게 설명합니다.

#### CommentarySection 구조:
```typescript
{
  emoji: string;           // "1️⃣", "2️⃣", "3️⃣", "4️⃣"
  title: string;           // ⚠️ 반드시 "히브리어 (발음) - 설명" 형식
  description: string;     // 단어/개념 설명 (2-3문장)
  points: string[];        // 핵심 포인트 3-4개
  color: 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'yellow';
}
```

#### 섹션 수 가이드:
- **2-4개 섹션** 작성
  - 간단한 구절: 2개
  - 일반적인 구절: 3개
  - 복잡하거나 중요한 구절: 4개

#### 색상 선택 가이드:
- 각 섹션에 **다른 색상** 사용
- 권장 순서: purple → blue → green → pink (또는 orange, yellow)
- 색상 뒤에 **`as const` 타입 단언** 필요 (TypeScript 타입 안정성)

**예시:**
```typescript
sections: [
  {
    emoji: "1️⃣",
    title: "וַיְכֻלּוּ (바예쿨루) - 완성의 선언",
    description: "히브리어 '칼라'는 '완성하다', '끝내다'를 의미하는 동사입니다. 수동태 형태(Pual)로 사용되어 하나님의 창조 사역이 완전히 이루어졌음을 강조합니다.",
    points: [
      "창조는 무작위나 진행 중인 과정이 아니라 완성된 사건입니다",
      "하나님의 계획은 완벽하게 실현되었습니다",
      "모든 피조물이 제자리를 찾고 목적을 갖게 되었습니다"
    ],
    color: "purple" as const
  },
  {
    emoji: "2️⃣",
    title: "צְבָאָם (체바암) - 만물의 군대",
    description: "'체바'는 본래 '군대', '군사력'을 의미하는 단어입니다. 여기서는 하늘과 땅의 모든 피조물을 지칭하며, 창조 세계의 질서와 조직성을 나타냅니다.",
    points: [
      "별들, 천사들, 동물들, 식물들 모두가 하나님의 '군대'입니다",
      "각 피조물은 창조주의 명령에 따라 움직이는 조직된 전체입니다",
      "'만군의 여호와'라는 표현의 배경이 됩니다"
    ],
    color: "blue" as const
  },
  {
    emoji: "3️⃣",
    title: "הַשָּׁמַיִם וְהָאָרֶץ (하샤마임 베하아레츠) - 하늘과 땅, 창조의 전체성",
    description: "'하늘과 땅'이라는 표현은 히브리어의 '메리즘'(merism) 기법으로, 두 극단을 언급함으로써 그 사이의 모든 것을 포함하는 수사법입니다.",
    points: [
      "보이는 것과 보이지 않는 것 모두가 완성되었습니다",
      "영적 세계와 물질 세계가 모두 포함됩니다",
      "우주의 모든 영역이 하나님의 창조 안에 있습니다"
    ],
    color: "green" as const
  }
]
```

### 3. whyQuestion (어린이를 위한 질문)
**목적:** 어린이들이 구절을 이해하도록 돕는 간단한 질문과 답변

```typescript
whyQuestion: {
  question: "왜 하나님은 하늘과 땅을 '완성'하셨을까요?",
  answer: "하나님은 우리가 살아갈 세상을 완벽하게 준비하고 싶으셨어요. 마치 부모님이 아기가 태어나기 전에 집을 깨끗이 정리하고 필요한 모든 것을 준비하는 것처럼, 하나님도 우리를 위해 모든 것을 완벽하게 만들어주셨답니다.",
  bibleReferences: [
    "시편 33:6 - '여호와의 말씀으로 하늘이 지음이 되었으며'",
    "골로새서 1:16 - '만물이 그에게서 창조되되 하늘과 땅에서 보이는 것들과 보이지 않는 것들'",
    "요한복음 1:3 - '만물이 그로 말미암아 지은 바 되었으니'"
  ]
}
```

**작성 원칙:**
- **question:** 간단하고 직접적인 질문
- **answer:** 3-5문장, 어린이가 이해할 수 있는 비유 사용
- **bibleReferences:** 2-4개의 관련 구절, `책 장:절 - "인용문"` 형식

### 4. conclusion (신학적 의미)
**목적:** 구절의 더 깊은 신학적 의미나 적용을 제시

```typescript
conclusion: {
  title: "💡 신학적 의미",
  content: "창조의 완성은 하나님의 신실하심을 보여줍니다. 하나님이 시작하신 일은 반드시 완성하십니다. 이는 구원의 역사에도 적용됩니다 - '너희 속에서 착한 일을 시작하신 이가 그리스도 예수의 날까지 이루실 줄을 우리는 확신하노라'(빌립보서 1:6)."
}
```

**작성 원칙:**
- **title:** 항상 `"💡 신학적 의미"` 고정
- **content:** 2-3문장, 신학적 통찰이나 그리스도 중심적 해석

---

## 현대어 의역 작성 규칙

### modern 필드
- **의역(paraphrase)** 형태로 작성
- 직역이 아닌 현대 한국어로 자연스럽게 의미 전달
- 한 문장으로 작성 (UI에서 한 줄로 표시됨)

### ✅ 좋은 예시 (의역):
```typescript
modern: '이렇게 하늘과 땅과 그 안의 모든 것이 완성되었습니다'
modern: '태초에 하나님께서 하늘과 땅을 창조하셨습니다'
modern: '땅은 혼돈하고 공허하며 어둠이 깊음 위에 있고, 하나님의 영은 수면 위에 운행하고 계셨습니다'
```

### ❌ 잘못된 예시 (직역):
```typescript
modern: '완성되었다 하늘들이 그리고 땅이 그리고 모든-그것들의 군대가'  // ❌ 직역체
modern: '하늘과 땅과 그 만물이 다 이루니라'                              // ❌ 고어체
```

---

## 체크리스트

새 구절을 추가하기 전에 다음 항목을 확인하세요:

### 기본 정보
- [ ] `id`가 `{책ID}_{장}_{절}` 형식인가? (예: `genesis_1_1`, `genesis_2_10`)
- [ ] `reference`가 `창세기 {장}:{절}` 형식인가?
- [ ] 히브리어 원문이 정확하고 니쿠드가 포함되어 있는가?
- [ ] IPA 표기가 정확한가?
- [ ] 한글 발음이 읽기 쉬운가?
- [ ] 현대어 의역이 자연스러운가? (직역이 아닌가?)

### 단어 분석
- [ ] 의미 단위로 적절하게 묶였는가?
- [ ] 모든 단어에 `hebrew`, `meaning`, `ipa`, `korean`, `root`, `grammar`, `emoji`가 있는가?
- [ ] `root` 필드가 `히브리어 (한글)` 형식인가?
- [ ] `grammar` 필드가 명확하고 일관된 형식인가?
- [ ] `emoji`가 단어의 의미를 적절하게 표현하는가?
- [ ] `relatedWords`를 추가할 만한 중요한 단어인가? (선택사항)

### 깊이 읽기 (Commentary) - 모든 필드 필수
- [ ] `intro`가 구절의 전체 의미를 잘 요약하는가? (2-3문장)
- [ ] 섹션이 2-4개 있는가?
- [ ] **모든 섹션 제목이 "히브리어 (한글 발음) - 설명" 형식인가?** ⚠️ 가장 중요!
- [ ] 각 섹션에 다른 색상을 사용했는가?
- [ ] 각 섹션의 color에 `as const` 타입 단언이 있는가?
- [ ] 각 섹션의 `points` 배열에 3-4개의 핵심 포인트가 있는가?
- [ ] `whyQuestion`이 있고, 답변이 어린이가 이해할 수 있는가?
- [ ] `bibleReferences`가 2-4개 있고 `책 장:절 - "인용문"` 형식인가?
- [ ] `conclusion`이 있고, title이 정확히 `"💡 신학적 의미"`인가?
- [ ] `conclusion.content`가 2-3문장으로 신학적 의미를 잘 설명하는가?

### TypeScript 형식
- [ ] 모든 문자열이 따옴표로 감싸져 있는가?
- [ ] color에 `as const` 타입 단언이 있는가?
- [ ] 배열과 객체가 올바르게 닫혔는가?
- [ ] 쉼표가 올바른 위치에 있는가?

---

## 자주 하는 실수

### 0. ❌ commentary를 생략
**잘못된 예:**
```typescript
{
  id: 'genesis_1_1',
  reference: '창세기 1:1',
  // ... 기본 필드들
  // commentary가 없음 ❌
}
```

**올바른 예:**
```typescript
{
  id: 'genesis_1_1',
  reference: '창세기 1:1',
  // ... 기본 필드들
  commentary: {
    intro: "...",
    sections: [...],
    whyQuestion: {...},
    conclusion: {...}
  } // ✅ 모든 구절에 필수
}
```

### 1. ❌ 섹션 제목에 히브리어 누락
**잘못된 예:**
```typescript
title: "하늘과 땅 - 창조의 전체성"
title: "완성의 선언"
```

**올바른 예:**
```typescript
title: "הַשָּׁמַיִם וְהָאָרֶץ (하샤마임 베하아레츠) - 하늘과 땅, 창조의 전체성"
title: "וַיְכֻלּוּ (바예쿨루) - 완성의 선언"
```

### 2. ❌ 현대어 의역을 직역으로 작성
**잘못된 예:**
```typescript
modern: '그리고 완성되었다 하늘들이 그리고 땅이'  // 직역체
```

**올바른 예:**
```typescript
modern: '이렇게 하늘과 땅과 그 안의 모든 것이 완성되었습니다'  // 자연스러운 의역
```

### 3. ❌ root 필드에 한글 발음 누락
**잘못된 예:**
```typescript
root: 'ב-ר-א'       // 한글 없음
root: '(bara)'      // 히브리어 없음
```

**올바른 예:**
```typescript
root: 'ב-ר-א (bara)'
```

### 4. ❌ color에 as const 누락
**잘못된 예:**
```typescript
color: "purple"     // TypeScript 타입 에러 발생 가능
```

**올바른 예:**
```typescript
color: "purple" as const
```

### 5. ❌ 섹션의 points가 너무 적거나 많음
**잘못된 예:**
```typescript
points: [
  "하나님의 능력을 보여줍니다"  // 1개만 - 너무 적음
]
```

```typescript
points: [
  "첫 번째 포인트",
  "두 번째 포인트",
  "세 번째 포인트",
  "네 번째 포인트",
  "다섯 번째 포인트",
  "여섯 번째 포인트"  // 6개 - 너무 많음
]
```

**올바른 예:**
```typescript
points: [
  "창조는 무작위나 진행 중인 과정이 아니라 완성된 사건입니다",
  "하나님의 계획은 완벽하게 실현되었습니다",
  "모든 피조물이 제자리를 찾고 목적을 갖게 되었습니다"
]  // 3개 - 적절함
```

### 6. ❌ bibleReferences 형식 오류
**잘못된 예:**
```typescript
bibleReferences: [
  "시편 33:6",                    // 인용문 없음
  "여호와의 말씀으로 하늘이...",  // 출처 없음
]
```

**올바른 예:**
```typescript
bibleReferences: [
  "시편 33:6 - '여호와의 말씀으로 하늘이 지음이 되었으며'",
  "골로새서 1:16 - '만물이 그에게서 창조되되 하늘과 땅에서 보이는 것들과 보이지 않는 것들'"
]
```

### 7. ❌ 단어에 emoji 누락
**잘못된 예:**
```typescript
{
  hebrew: 'בָּרָא',
  meaning: '창조하셨다',
  ipa: 'baˈra',
  korean: '바라',
  root: 'ב-ר-א (bara)',
  grammar: '동사 Qal 완료형 3인칭 남성 단수'
  // emoji 없음 ❌
}
```

**올바른 예:**
```typescript
{
  hebrew: 'בָּרָא',
  meaning: '창조하셨다',
  ipa: 'baˈra',
  korean: '바라',
  root: 'ב-ר-א (bara)',
  grammar: '동사 Qal 완료형 3인칭 남성 단수',
  emoji: '✨'  // ✅ 필수
}
```

### 8. ❌ whyQuestion 또는 conclusion 누락
**잘못된 예:**
```typescript
commentary: {
  intro: "...",
  sections: [...]
  // whyQuestion과 conclusion이 없음 ❌
}
```

**올바른 예:**
```typescript
commentary: {
  intro: "...",
  sections: [...],
  whyQuestion: {  // ✅ 필수
    question: "왜 하나님은 세상을 만드셨을까요?",
    answer: "하나님은 우리를 사랑하시기 때문에...",
    bibleReferences: [...]
  },
  conclusion: {  // ✅ 필수
    title: "💡 신학적 의미",
    content: "창조의 완성은 하나님의 신실하심을 보여줍니다..."
  }
}
```

### 9. ❌ 섹션 수가 너무 적거나 많음
**잘못된 예:**
```typescript
sections: [
  // 섹션이 1개만 - 너무 적음 ❌
]

sections: [
  // 섹션이 5개 이상 - 너무 많음 ❌
]
```

**올바른 예:**
```typescript
sections: [
  // 2-4개가 적절 ✅
  // 간단한 구절: 2개
  // 일반적인 구절: 3개
  // 복잡한 구절: 4개
]
```

---

## AI 도구 사용 지침 (컨텐츠 제작 에이전트)

**컨텐츠 제작 에이전트**는 Claude 4.5 Haiku를 사용하여 구절 컨텐츠를 자동 생성합니다.

### 사용 모델
- **Claude 4.5 Haiku** (Anthropic API)
  - 빠른 응답 속도
  - 히브리어 및 신학적 컨텐츠 처리에 적합
  - 비용 효율적 (~$4 for Genesis 전체 1,533 구절)

### 웹 리서치 도구
**선택 사항: 온라인 참고 자료**

컨텐츠 생성 시 필요에 따라 온라인 참고 자료를 조회할 수 있습니다:

#### 참고 가능한 소스:
1. **IPA 발음 조사**
   - Wiktionary, 언어학 사이트에서 IPA 표기 확인

2. **신학적 배경 연구**
   - Matthew Henry Commentary, Keil & Delitzsch 등 온라인 주석서
   - 참고만 하되, 그대로 번역하지 않고 한국어로 재작성

3. **관련 성경 구절 찾기**
   - Bible Gateway, Bible Hub 등에서 교차 참조 확인
   - whyQuestion의 bibleReferences 작성 시 활용

> ⚠️ **주의**: 히브리어 원문은 크롤링 에이전트가 이미 Supabase에 저장했으므로, 컨텐츠 제작 에이전트는 DB에서 읽어와서 사용합니다.

### AI 작업 프로세스

1. **데이터 조회 단계**
   - Supabase에서 히브리어 원문만 있는 구절 조회
   - `WHERE ipa = '' OR korean_pronunciation = ''`

2. **작성 단계** (Claude 4.5 Haiku가 직접 작성)
   - 수집한 정보 기반으로 구절 데이터 작성
   - **commentary를 AI가 직접 작성** (리서치 자료 참고)
     - intro: 구절의 신학적/역사적 맥락 설명
     - sections: 주요 히브리어 단어 분석
     - whyQuestion: 어린이 눈높이 질문과 답변
     - conclusion: 신학적 의미 정리
   - words 배열의 모든 필드 작성

3. **검토 및 수정**
   - 이 가이드라인의 체크리스트로 검증
   - 창세기 1장 예시와 형식 비교
   - 섹션 제목 형식 확인: "히브리어 (발음) - 설명"
   - 모든 필수 필드 존재 확인

### Commentary 작성 시 주의사항

**AI가 직접 작성해야 하는 이유:**
- 일관된 어조와 스타일 유지
- 한국어 학습자에게 최적화된 설명
- 어린이와 성인 모두를 위한 균형잡힌 내용
- 창세기 1장 예시와 동일한 품질 유지

**작성 원칙:**
- 리서치한 주석서는 **참고만** 하되, 그대로 번역하지 않음
- 한국 교회 전통과 문화를 고려한 설명
- 학술적이면서도 쉬운 언어 사용
- 신학적 정확성과 목회적 적용의 균형

---

## 참고 자료

### 히브리어 참고 도구
- **Blue Letter Bible** (https://www.blueletterbible.org) - 히브리어 원문 및 Strong's 번호
- **Mechon Mamre** (https://mechon-mamre.org) - 정확한 히브리어 원문
- **Wiktionary** (https://en.wiktionary.org) - IPA 발음 기호
- **Bible Hub** (https://biblehub.com) - 다양한 히브리어 도구 및 주석

### 신학 참고 자료
- **Matthew Henry Commentary** (https://www.biblestudytools.com/commentaries/matthew-henry-complete/)
- **Keil & Delitzsch Commentary**
- **Word Biblical Commentary**
- **Bible Gateway** (https://www.biblegateway.com) - 다양한 번역본 및 교차 참조

### TypeScript 타입 정의
전체 타입 정의는 `src/types/index.ts`를 참조하세요.

---

## 창세기 1장 실제 예시

실제 작성된 창세기 1장의 구절들을 참고하면 큰 도움이 됩니다.

### 추천 참고 구절:
1. **창세기 1:1** - 4개 섹션, 매우 상세한 commentary 예시
2. **창세기 1:2** - 2개 섹션, 간단한 구절 예시
3. **창세기 1:3** - 3개 섹션, 일반적인 구절 예시
4. **창세기 1:4** - 2개 섹션, 간단한 구절 예시
5. **창세기 1:5** - 3개 섹션, relatedWords 사용 예시

### 창세기 1:3 완전한 예시

이 예시는 일반적인 구절의 표준 형식을 잘 보여줍니다:

```typescript
{
  id: 'genesis_1_3',
  reference: '창세기 1:3',
  hebrew: 'וַיֹּאמֶר אֱלֹהִים, יְהִי אוֹר; וַיְהִי-אוֹר.',
  ipa: 'ˈʔor vajəˈhi ˈʔor jəˈhi ʔɛloˈhim vajˈjomɛr',
  koreanPronunciation: '오르 바예히, 오르 예히, 엘로힘 바요메르',
  modern: '하나님께서 말씀하시기를 "빛이 있으라" 하시니 빛이 있었습니다',
  words: [
    {
      hebrew: 'וַיֹּאמֶר',
      meaning: '그리고 말씀하셨다',
      ipa: 'vajˈjomɛr',
      korean: '바요메르',
      root: 'א-מ-ר (아마르)',
      grammar: '동사 Qal 미완료형 전환형(Wayyiqtol) 3인칭 남성 단수',
      structure: '연속된 동작을 나타내는 내러티브 시제',
      emoji: '💬'
    },
    {
      hebrew: 'יְהִי',
      meaning: '~이 있으라, ~이 되라',
      ipa: 'jəˈhi',
      korean: '예히',
      root: 'ה-י-ה (하야)',
      grammar: '동사 Qal 단형 미완료형 3인칭 남성 단수',
      structure: '명령이나 소원을 나타내는 단축형 동사',
      emoji: '💫'
    },
    {
      hebrew: 'אוֹר',
      meaning: '빛',
      ipa: 'ˈʔor',
      korean: '오르',
      root: 'אוֹר (오르)',
      grammar: '명사 남성 단수',
      structure: '물리적 빛과 영적 빛을 모두 의미할 수 있는 용어',
      emoji: '💡'
    }
  ],
  commentary: {
    intro: "창조의 첫 말씀이자 가장 극적인 순간입니다. 하나님의 말씀이 즉시 현실이 되는 창조적 능력을 보여줍니다.",
    sections: [
      {
        emoji: "1️⃣",
        title: "יְהִי אוֹר (예히 오르) - 빛이 있으라",
        description: "단 두 단어로 이루어진 간결하고 강력한 명령입니다. 하나님께서 말씀하시자마자 즉시 빛이 생겨났으며, 이는 해와 달이 창조되기 전(4일째)의 빛으로 물리적 광원과 독립된 빛 자체를 의미합니다.",
        points: [
          "하나님 말씀의 즉각적이고 절대적인 능력",
          "광원 이전에 존재하는 빛 자체",
          "요한복음 1:1-5의 영적 빛과 연결됨"
        ],
        color: "purple" as const
      },
      {
        emoji: "2️⃣",
        title: "וַיֹּאמֶר...וַיְהִי (바요메르...바예히) - 말씀과 성취",
        description: "'바요메르(말씀하셨다)'와 '바예히(되었다)'의 즉각적 연결은 하나님 말씀의 창조적 능력을 보여줍니다. 말씀이 곧 실재가 되는 신적 권능을 나타냅니다.",
        points: [
          "말씀과 성취 사이에 지연이 없음",
          "하나님의 말씀은 실재를 창조하는 능력",
          "우리 삶에도 역사하는 말씀의 능력"
        ],
        color: "blue" as const
      },
      {
        emoji: "3️⃣",
        title: "אוֹר (오르) - 첫 창조, 어둠에서 빛으로",
        description: "빛의 창조는 모든 후속 창조의 기초입니다. 빛은 생명의 전제조건이며, 하나님의 임재와 계시를 상징합니다.",
        points: [
          "모든 생명의 기초가 되는 빛",
          "하나님의 임재와 계시의 상징",
          "어둠(무질서)에서 빛(질서)으로의 전환"
        ],
        color: "green" as const
      }
    ],
    whyQuestion: {
      question: "하나님이 '빛이 있으라'고 하시면 바로 빛이 생겼나요?",
      answer: "네, 맞아요! 하나님은 너무나 능력이 크셔서 말씀만 하시면 바로 이루어져요. 우리는 무언가를 만들 때 손으로 만들어야 하지만, 하나님은 말씀만 하셔도 뚝딱 만들어지신답니다. '빛이 있으라' 하시자 바로 환하게 빛이 생겼어요. 이것이 바로 하나님의 놀라운 능력이에요!",
      bibleReferences: [
        "시편 33:9 - 그가 말씀하시매 이루어졌으며",
        "히브리서 11:3 - 말씀으로 지어진 줄을 우리가 아나니",
        "요한복음 1:3 - 만물이 그로 말미암아 지은 바 되었으니"
      ]
    },
    conclusion: {
      title: "💡 신학적 의미",
      content: "하나님의 말씀은 단순한 소리가 아니라 실재를 창조하는 능력입니다. '빛이 있으라'는 명령은 물리적 빛뿐 아니라 영적 계시와 진리의 시작을 의미합니다. 우리가 하나님의 말씀을 들을 때, 그것은 우리 삶의 어둠을 물리치고 새로운 창조를 시작하는 능력이 됩니다."
    }
  }
}
```

---

## 질문이나 문제가 있을 때

1. **창세기 1장의 기존 구절들**을 참고하여 형식을 확인하세요
   - 특히 창세기 1:1 (복잡한 구절), 1:2 (간단한 구절), 1:3 (일반적인 구절)
2. 이 가이드라인의 **체크리스트**를 다시 확인하세요
3. 특히 **섹션 제목 형식**을 철저히 확인하세요: `히브리어 (한글) - 설명` ⚠️
4. **모든 필수 필드**가 있는지 확인하세요: commentary, whyQuestion, conclusion, emoji

---

**마지막 업데이트:** 2025년 1월
**버전:** 2.0 (commentary 필수화, emoji/relatedWords 추가, 창세기 1장 예시 기반)

```

</details>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Genesis 1장 참고 예시

<details>
<summary>Genesis 1장 예시 코드</summary>

```typescript

```

</details>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 중요 체크리스트

생성 시 반드시 확인해주세요:

### 기본 정보
- [ ] IPA 발음이 정확한가?
- [ ] 한글 발음이 읽기 쉬운가?
- [ ] 현대어 의역이 자연스러운가? (직역이 아닌 의역)

### 단어 분석
- [ ] 모든 단어에 emoji가 있는가?
- [ ] 섹션 제목이 "히브리어 (발음) - 설명" 형식인가?
- [ ] sections가 2-4개인가?
- [ ] 각 섹션의 points가 3-4개인가?
- [ ] color는 "purple", "blue", "green", "pink", "orange", "yellow" 중 하나인가?
- [ ] whyQuestion과 conclusion이 있는가?
- [ ] bibleReferences가 "책 장:절 - '인용문'" 형식인가?
- [ ] conclusion.title이 "💡 신학적 의미"인가?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 출력 형식

여러 구절인 경우, JSON 배열로 출력해주세요:

```json
[
  { "verse_id": "gen2-4", "words": [...], "commentary": {...} },
  { "verse_id": "gen2-5", "words": [...], "commentary": {...} },
  { "verse_id": "gen2-6", "words": [...], "commentary": {...} }
]
```

생성이 완료되면, 결과를 `data/generated/verses-{timestamp}.json` 형식으로
저장하고, 다음 명령어로 Supabase에 업로드하세요:

```bash
npm run save:verse -- data/generated/verses-{timestamp}.json
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이제 위 구절들에 대한 컨텐츠를 생성해주세요! 🙏