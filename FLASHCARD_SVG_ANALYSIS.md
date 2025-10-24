# 🎴 플래시카드 SVG 적용 여부 차이점 분석

**생성일**: 2025-10-23
**목적**: SVG 이미지가 적용/미적용되는 플래시카드의 코드 차이 분석

---

## 📋 목차

1. [데이터 흐름 전체 구조](#데이터-흐름-전체-구조)
2. [SVG 적용 조건](#svg-적용-조건)
3. [코드별 상세 분석](#코드별-상세-분석)
4. [SVG가 표시되지 않는 경우](#svg가-표시되지-않는-경우)
5. [해결 방법](#해결-방법)

---

## 🔄 데이터 흐름 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    1. DATABASE LAYER                         │
│                   (Supabase PostgreSQL)                      │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ SQL Query (JOIN)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. API HOOK LAYER                         │
│                    src/hooks/useWords.ts                     │
│                                                              │
│  SELECT words.*, verses.reference                           │
│  FROM words                                                  │
│  INNER JOIN verses ON verses.id = words.verse_id            │
│  WHERE verses.book_id = 'genesis'                           │
│                                                              │
│  중요 필드:                                                   │
│  - hebrew: "בְּרֵאשִׁית"                                      │
│  - meaning: "태초에, 처음에"                                  │
│  - icon_svg: "<svg>...</svg>" ✅ 또는 NULL ❌                │
│  - emoji: "🌅" (fallback)                                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ WordWithContext[]
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  3. PARENT COMPONENT LAYER                   │
│                 src/components/VocabularyTab.tsx             │
│                                                              │
│  const { words } = useWords({ bookId: 'genesis' });        │
│                                                              │
│  words.map(word => (                                         │
│    <FlashCard                                                │
│      word={word}  // ← WordWithContext 전달                 │
│      darkMode={darkMode}                                     │
│      isFlipped={...}                                         │
│      onFlip={...}                                            │
│    />                                                        │
│  ))                                                          │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ word prop
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 4. FLASHCARD COMPONENT LAYER                 │
│                src/components/shared/FlashCard.tsx           │
│                                                              │
│  interface FlashCardProps {                                  │
│    word: Word | WordWithContext  // 두 타입 모두 지원       │
│    ...                                                       │
│  }                                                           │
│                                                              │
│  ┌─────────────────────────────────────────────┐            │
│  │ 앞면 (Front):                               │            │
│  │   <HebrewIcon                               │            │
│  │     word={word.hebrew}                      │            │
│  │     iconSvg={word.iconSvg}  ← 여기!         │            │
│  │     size={96}                               │            │
│  │   />                                        │            │
│  └─────────────────────────────────────────────┘            │
│                                                              │
│  ┌─────────────────────────────────────────────┐            │
│  │ 뒷면 (Back):                                │            │
│  │   <HebrewIcon                               │            │
│  │     word={word.hebrew}                      │            │
│  │     iconSvg={word.iconSvg}  ← 여기도!       │            │
│  │     size={80}                               │            │
│  │   />                                        │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ iconSvg prop
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 5. ICON RENDERING LAYER                      │
│              src/components/shared/HebrewIcon.tsx            │
│                                                              │
│  interface HebrewIconProps {                                 │
│    word: string           // "בְּרֵאשִׁית"                   │
│    iconSvg?: string       // "<svg>...</svg>" 또는 undefined│
│    size: number           // 96 or 80                       │
│    color: string          // "#ffffff" or "#1f2937"         │
│  }                                                           │
│                                                              │
│  렌더링 우선순위:                                             │
│  1️⃣ iconSvg가 있으면 → SVG 렌더링 ✅                        │
│  2️⃣ 레거시 아이콘 있으면 → 커스텀 컴포넌트 렌더링            │
│  3️⃣ 둘 다 없으면 → FileText 기본 아이콘 ❌                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ SVG 적용 조건

### 조건 1: 데이터베이스에 `icon_svg` 존재

```sql
-- ✅ SVG 있는 경우
SELECT hebrew, meaning, icon_svg
FROM words
WHERE hebrew = 'בְּרֵאשִׁית';

-- 결과:
hebrew          | meaning         | icon_svg
----------------|-----------------|----------------------------------
בְּרֵאשִׁית      | 태초에, 처음에   | <svg viewBox="0 0 64 64">...</svg>
```

```sql
-- ❌ SVG 없는 경우
SELECT hebrew, meaning, icon_svg
FROM words
WHERE hebrew = 'אֵת';

-- 결과:
hebrew | meaning | icon_svg
-------|---------|----------
אֵת    | ~를     | NULL      ← 문제!
```

### 조건 2: useWords Hook이 올바르게 매핑

**src/hooks/useWords.ts:117**
```typescript
iconSvg: item.icon_svg || undefined,  // ← DB의 icon_svg를 iconSvg로 매핑
```

**중요**:
- DB 컬럼명: `icon_svg` (snake_case)
- TypeScript 타입: `iconSvg` (camelCase)
- 이 변환이 **반드시** 이루어져야 함

### 조건 3: FlashCard가 HebrewIcon에 전달

**src/components/shared/FlashCard.tsx:96**
```typescript
<HebrewIcon
  word={word.hebrew}
  iconSvg={word.iconSvg}  // ← 여기서 전달
  size={96}
  color={darkMode ? '#ffffff' : '#1f2937'}
  className="w-full h-full"
/>
```

### 조건 4: HebrewIcon이 SVG 렌더링

**src/components/shared/HebrewIcon.tsx:22-52**
```typescript
// 1️⃣ iconSvg가 있는지 확인
if (!iconSvg || iconSvg.trim().length === 0) {
  console.log(`[HebrewIcon] No SVG for word: ${word}, iconSvg:`, iconSvg);
  return null;  // ← SVG 없으면 null 반환
}

// 2️⃣ 고유 ID 생성 (gradient 충돌 방지)
const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;

// 3️⃣ SVG 내부 ID를 고유하게 변경
let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);
processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

// 4️⃣ SVG 렌더링
return (
  <div
    className={className}
    dangerouslySetInnerHTML={{ __html: processedSvg }}  // ← 실제 렌더링
  />
);
```

---

## 🔍 코드별 상세 분석

### 1. 데이터베이스 → Hook 변환

#### **src/hooks/useWords.ts**

```typescript
// Line 44-67: SQL 쿼리
let query = supabase
  .from('words')
  .select(`
    id,
    hebrew,
    meaning,
    ipa,
    korean,
    letters,
    root,
    grammar,
    structure,
    emoji,
    icon_svg,    // ← DB 컬럼명 (snake_case)
    category,
    position,
    verses!inner (
      id,
      reference,
      book_id,
      chapter,
      verse_number
    )
  `)
```

```typescript
// Line 96-126: 데이터 변환
const wordMap = new Map<string, WordWithContext>()

data.forEach((item: any) => {
  const verse = item.verses

  if (!wordMap.has(item.hebrew)) {
    // 🔍 로그: iconSvg 존재 여부 확인
    const hasIconSvg = !!item.icon_svg;
    console.log(`[useWords] ${item.hebrew} (${item.meaning}): icon_svg=${hasIconSvg ? 'EXISTS' : 'NULL'}`);

    wordMap.set(item.hebrew, {
      id: item.id,
      hebrew: item.hebrew,
      meaning: item.meaning,
      ipa: item.ipa,
      korean: item.korean,
      letters: item.letters || undefined,
      root: item.root,
      grammar: item.grammar,
      structure: item.structure || undefined,
      emoji: item.emoji || undefined,
      iconSvg: item.icon_svg || undefined,  // ✅ camelCase로 변환
      category: item.category as any || undefined,
      verseReference: verse.reference,
      verseId: verse.id,
      bookId: verse.book_id,
      chapter: verse.chapter,
      verseNumber: verse.verse_number,
    })
  }
})
```

**출력 예시:**
```
✅ [useWords] בְּרֵאשִׁית (태초에, 처음에): icon_svg=EXISTS, emoji=🌅
✅ [useWords] בָּרָא (창조하다): icon_svg=EXISTS, emoji=✨
❌ [useWords] אֵת (~를): icon_svg=NULL, emoji=🎯
```

---

### 2. VocabularyTab → FlashCard 전달

#### **src/components/VocabularyTab.tsx**

```typescript
// Line 772-786: 플래시카드 렌더링
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredWords.map((word, index) => (
    <FlashCard
      key={word.hebrew}
      word={word}  // ← WordWithContext 객체 전체 전달
      darkMode={darkMode}
      isFlipped={flippedCards.has(word.hebrew)}
      onFlip={() => toggleFlip(word.hebrew)}
      isBookmarked={bookmarkedWords.has(word.hebrew)}
      onBookmark={() => toggleBookmark(word.hebrew)}
      reference={word.verseReference}
      index={index}
    />
  ))}
</div>
```

**word 객체 구조:**
```typescript
{
  hebrew: "בְּרֵאשִׁית",
  meaning: "태초에, 처음에",
  korean: "베레쉬트",
  iconSvg: "<svg viewBox=\"0 0 64 64\">...</svg>",  // ✅ 또는 undefined ❌
  emoji: "🌅",
  // ... 기타 필드
}
```

---

### 3. FlashCard 컴포넌트 SVG 사용

#### **src/components/shared/FlashCard.tsx**

```typescript
// Line 13-22: Props 정의
interface FlashCardProps {
  word: Word | WordWithContext;  // ← 두 타입 모두 지원
  darkMode: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  reference: string;
  index?: number;
}
```

#### **앞면 (Front) - Line 92-101**
```typescript
{/* 1. SVG 아이콘 - 반응형 크기 */}
<div className="flex justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
  <HebrewIcon
    word={word.hebrew}       // "בְּרֵאשִׁית"
    iconSvg={word.iconSvg}   // ← 핵심! undefined이면 기본 아이콘
    size={96}
    color={darkMode ? '#ffffff' : '#1f2937'}
    className="w-full h-full"
  />
</div>
```

#### **뒷면 (Back) - Line 185-193**
```typescript
{/* 1. SVG 아이콘 - 반응형 */}
<div className="flex justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20">
  <HebrewIcon
    word={word.hebrew}
    iconSvg={word.iconSvg}   // ← 앞면과 동일
    size={80}                // ← 뒷면은 약간 작음
    color={darkMode ? '#ffffff' : '#1f2937'}
    className="w-full h-full"
  />
</div>
```

**차이점:**
- 앞면: `size={96}`, 큰 아이콘
- 뒷면: `size={80}`, 약간 작은 아이콘
- **둘 다 동일한 `iconSvg` 사용**

---

### 4. HebrewIcon 렌더링 로직

#### **src/components/shared/HebrewIcon.tsx**

```typescript
// Line 5-8: Props 정의
interface HebrewIconProps extends IconProps {
  word: string;         // 히브리어 단어
  iconSvg?: string;     // ← 선택적! undefined 가능
}
```

#### **렌더링 우선순위 (Line 17-119)**

```typescript
const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  size = 32,
  className = '',
  color = 'currentColor'
}) => {
  const reactId = useId();  // React 18 고유 ID (SSR safe)

  // 1️⃣ SVG 전처리 (gradient ID 충돌 방지)
  const uniqueSvg = useMemo(() => {
    // ❌ iconSvg가 없으면 null 반환
    if (!iconSvg || iconSvg.trim().length === 0) {
      console.log(`[HebrewIcon] No SVG for word: ${word}, iconSvg:`, iconSvg);
      return null;
    }

    // ✅ iconSvg가 있으면 고유 ID 생성
    const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;

    // SVG 내부 ID를 고유하게 변경
    let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);
    processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

    console.log(`[HebrewIcon] ✅ SVG generated for word: ${word}, length: ${processedSvg.length}`);
    return processedSvg;
  }, [iconSvg, word, reactId]);

  // 1️⃣ 최우선: iconSvg가 있으면 SVG 렌더링
  if (uniqueSvg) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
        }}
        dangerouslySetInnerHTML={{ __html: uniqueSvg }}  // ← 실제 SVG 출력
      />
    );
  }

  // 2️⃣ 레거시: 커스텀 아이콘 컴포넌트 (BereshitIcon 등)
  const hasCustomIcon = word in HebrewIcons;

  if (hasCustomIcon) {
    const iconName = HebrewIcons[word as HebrewWord];

    switch (iconName) {
      case 'BereshitIcon':
        return <BereshitIcon size={size} className={className} color={color} />;
      case 'ElohimIcon':
        return <ElohimIcon size={size} className={className} color={color} />;
      // ...
    }
  }

  // 3️⃣ 기본 아이콘: FileText (문서 아이콘)
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FileText
        size={size * 0.8}
        color={color}
        strokeWidth={1.5}
      />
    </div>
  );
};
```

---

## ❌ SVG가 표시되지 않는 경우

### Case 1: 데이터베이스에 `icon_svg`가 NULL

**문제:**
```sql
SELECT hebrew, meaning, icon_svg
FROM words
WHERE hebrew = 'אֵת';

-- 결과:
hebrew | meaning | icon_svg
-------|---------|----------
אֵת    | ~를     | NULL      ← 문제!
```

**증상:**
```
[HebrewIcon] No SVG for word: אֵת, iconSvg: undefined
```

**렌더링 결과:**
```
📄 (FileText 기본 아이콘 표시)
```

**해결:**
```sql
-- SVG 생성 및 업데이트
UPDATE words
SET icon_svg = '<svg viewBox="0 0 64 64">...</svg>'
WHERE hebrew = 'אֵת';
```

---

### Case 2: useWords Hook이 `icon_svg`를 매핑하지 않음

**문제:**
```typescript
// ❌ 잘못된 매핑
wordMap.set(item.hebrew, {
  // ...
  iconSvg: undefined,  // icon_svg를 무시함
})
```

**해결:**
```typescript
// ✅ 올바른 매핑
wordMap.set(item.hebrew, {
  // ...
  iconSvg: item.icon_svg || undefined,  // DB 컬럼 올바르게 매핑
})
```

---

### Case 3: FlashCard가 iconSvg를 전달하지 않음

**문제:**
```typescript
// ❌ iconSvg를 전달하지 않음
<HebrewIcon
  word={word.hebrew}
  // iconSvg 누락!
  size={96}
/>
```

**해결:**
```typescript
// ✅ iconSvg 명시적 전달
<HebrewIcon
  word={word.hebrew}
  iconSvg={word.iconSvg}  // ← 추가!
  size={96}
/>
```

---

### Case 4: SVG 형식 오류

**문제:**
```typescript
// ❌ 잘못된 SVG
iconSvg: "Not a valid SVG"
iconSvg: "<svg>incomplete"
iconSvg: ""  // 빈 문자열
```

**HebrewIcon 반응:**
```typescript
if (!iconSvg || iconSvg.trim().length === 0) {
  console.log(`[HebrewIcon] No SVG for word: ${word}, iconSvg:`, iconSvg);
  return null;  // ← SVG 렌더링 안 함
}
```

**해결:**
```typescript
// ✅ 올바른 SVG 형식
iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFA500"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="url(#grad1)"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`
```

---

### Case 5: Gradient ID 충돌

**문제:**
```html
<!-- 카드 1 -->
<svg>
  <defs>
    <linearGradient id="grad1">...</linearGradient>
  </defs>
  <circle fill="url(#grad1)"/>
</svg>

<!-- 카드 2 (같은 ID!) -->
<svg>
  <defs>
    <linearGradient id="grad1">...</linearGradient>  ← 충돌!
  </defs>
  <circle fill="url(#grad1)"/>
</svg>
```

**결과:**
- 두 번째 SVG가 첫 번째 gradient를 참조
- 색상이 의도와 다르게 표시

**HebrewIcon 해결책:**
```typescript
// ✅ 고유 ID 생성
const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;

// id="grad1" → id="בראשית-r12-grad1"
let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);

// url(#grad1) → url(#בראשית-r12-grad1)
processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);
```

---

## 🔧 해결 방법

### 1. 데이터베이스 레벨

#### A. NULL SVG 확인
```sql
-- SVG 없는 단어 조회
SELECT hebrew, meaning, icon_svg
FROM words
WHERE icon_svg IS NULL
ORDER BY hebrew;
```

#### B. SVG 일괄 업데이트
```bash
# 스크립트 실행
npx tsx scripts/migrations/improveDefaultSVGs.ts
```

---

### 2. 코드 레벨

#### A. useWords Hook 검증
```typescript
// src/hooks/useWords.ts:117
iconSvg: item.icon_svg || undefined,  // ✅ 올바른 매핑 확인
```

#### B. FlashCard Props 검증
```typescript
// src/components/shared/FlashCard.tsx:96, 188
iconSvg={word.iconSvg}  // ✅ 전달 확인
```

#### C. HebrewIcon 렌더링 검증
```typescript
// src/components/shared/HebrewIcon.tsx:41-53
if (uniqueSvg) {
  return (
    <div dangerouslySetInnerHTML={{ __html: uniqueSvg }} />
  );
}
```

---

### 3. 디버깅 방법

#### A. 브라우저 콘솔 확인
```
[useWords] בְּרֵאשִׁית (태초에, 처음에): icon_svg=EXISTS ✅
[HebrewIcon] ✅ SVG generated for word: בְּרֵאשִׁית, length: 523

[useWords] אֵת (~를): icon_svg=NULL ❌
[HebrewIcon] No SVG for word: אֵת, iconSvg: undefined
```

#### B. React DevTools 확인
```
<FlashCard>
  props:
    word:
      hebrew: "בְּרֵאשִׁית"
      meaning: "태초에, 처음에"
      iconSvg: "<svg>...</svg>" ✅  ← 확인!
```

#### C. 데이터베이스 직접 확인
```sql
SELECT
  hebrew,
  meaning,
  CASE
    WHEN icon_svg IS NULL THEN '❌ NULL'
    WHEN icon_svg = '' THEN '❌ EMPTY'
    WHEN LENGTH(icon_svg) < 50 THEN '⚠️ TOO SHORT'
    ELSE '✅ OK'
  END as svg_status,
  LENGTH(icon_svg) as svg_length
FROM words
WHERE book_id = 'genesis'
  AND chapter = 1
ORDER BY position;
```

---

## 📊 현재 상태 요약

### VocabularyTab (단어장 플래시카드)

**데이터 흐름:**
```
DB → useWords() → VocabularyTab → FlashCard → HebrewIcon
                    ↓
                  iconSvg 전달
```

**SVG 표시:**
- ✅ `word.iconSvg`가 있으면 → SVG 표시
- ❌ `word.iconSvg`가 없으면 → FileText 기본 아이콘

---

### RootFlashcardDeck (어근 플래시카드)

**데이터 흐름:**
```
DB → useRootDerivations() → RootFlashcardDeck → FlashCard → HebrewIcon
                              ↓
                            icon_svg → iconSvg 변환 필요
```

**Line 186-189:**
```typescript
<FlashCard
  word={{
    ...currentCard.word,
    iconSvg: currentCard.word.icon_svg,  // ← snake_case → camelCase 변환
    relatedWords: [],
  }}
/>
```

**SVG 표시:**
- ✅ DB에 `icon_svg` 있고 변환 성공 → SVG 표시
- ❌ 변환 안 됨 → FileText 기본 아이콘

---

## ✅ 체크리스트

### 데이터 검증
- [ ] DB에 `icon_svg` NULL 개수 확인
- [ ] NULL인 단어 목록 추출
- [ ] SVG 형식 검증 (viewBox, xmlns, 길이 등)

### 코드 검증
- [ ] `useWords.ts`에서 `icon_svg` → `iconSvg` 매핑 확인
- [ ] `FlashCard.tsx`에서 `iconSvg` prop 전달 확인
- [ ] `HebrewIcon.tsx`에서 렌더링 로직 확인
- [ ] `RootFlashcardDeck.tsx`에서 변환 로직 확인

### 렌더링 검증
- [ ] 브라우저 콘솔에서 `[HebrewIcon]` 로그 확인
- [ ] React DevTools에서 props 확인
- [ ] 실제 화면에서 SVG vs FileText 확인

### 개선 작업
- [ ] NULL SVG 생성 스크립트 실행
- [ ] 디폴트 SVG 개선 (gradient, shadow 추가)
- [ ] 중복 SVG 차별화
- [ ] 빌드 및 배포

---

## 🎯 결론

### SVG가 표시되는 조건

1. ✅ DB에 `icon_svg` 존재
2. ✅ useWords가 `iconSvg`로 올바르게 매핑
3. ✅ FlashCard가 `iconSvg` prop 전달
4. ✅ HebrewIcon이 SVG 렌더링

**하나라도 실패하면 → 📄 FileText 기본 아이콘 표시**

### 가장 흔한 문제

1. **DB NULL** (22.1% - 984개 단어)
   - 해결: SVG 생성 스크립트 실행

2. **디폴트 SVG** (27.1% - 271개 단어)
   - 해결: AI 기반 SVG 개선

3. **Gradient 충돌**
   - 해결: HebrewIcon의 `uniqueId` 시스템이 자동 처리 ✅

---

**작성:** Claude (AI Assistant)
**최종 수정:** 2025-10-23
