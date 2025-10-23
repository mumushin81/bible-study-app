# HebrewIcon useMemo 문제 시각화

## 🔍 Math.random() SSR/Hydration Mismatch 문제

### 시나리오: SSR 환경 (Next.js, Vercel SSR 등)

```
┌─────────────────────────────────────────────────────────────┐
│                    1️⃣ SSR Phase (서버)                        │
│                                                             │
│  Server Side Rendering                                      │
│  ┌───────────────────────────────────────────┐              │
│  │ HebrewIcon Component                      │              │
│  │                                           │              │
│  │ word: "בְּרֵאשִׁית"                       │              │
│  │ iconSvg: "<svg>...</svg>"                │              │
│  │                                           │              │
│  │ ❌ Math.random() 호출                     │              │
│  │    → uniqueId: "-abc123xyz-sun"          │              │
│  │                                           │              │
│  │ 생성된 HTML:                              │              │
│  │ <radialGradient id="-abc123xyz-sun">     │              │
│  │ <circle fill="url(#-abc123xyz-sun)"/>    │              │
│  └───────────────────────────────────────────┘              │
│                         │                                    │
│                         ▼                                    │
│            📤 HTML을 클라이언트로 전송                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 2️⃣ Hydration Phase (클라이언트)               │
│                                                             │
│  Client Side Hydration                                      │
│  ┌───────────────────────────────────────────┐              │
│  │ HebrewIcon Component (다시 렌더링)        │              │
│  │                                           │              │
│  │ word: "בְּרֵאשִׁית" (동일)               │              │
│  │ iconSvg: "<svg>...</svg>" (동일)         │              │
│  │                                           │              │
│  │ ❌ Math.random() 다시 호출 (새로운 값!)   │              │
│  │    → uniqueId: "-xyz789def-sun"          │ ⚠️  다름!    │
│  │                                           │              │
│  │ 생성하려는 HTML:                          │              │
│  │ <radialGradient id="-xyz789def-sun">     │ 🆚 불일치!   │
│  │ <circle fill="url(#-xyz789def-sun)"/>    │              │
│  └───────────────────────────────────────────┘              │
│                         │                                    │
│                         ▼                                    │
│            ❌ React Hydration Mismatch!                      │
│            ⚠️  Warning in Console                            │
└─────────────────────────────────────────────────────────────┘
```

### 결과: 브라우저 콘솔 에러

```
Warning: Prop `dangerouslySetInnerHTML` did not match.
Server: "<radialGradient id="-abc123xyz-sun">..."
Client: "<radialGradient id="-xyz789def-sun">..."
```

---

## ✅ useId() 해결 방법

### 시나리오: useId 사용 시

```
┌─────────────────────────────────────────────────────────────┐
│                    1️⃣ SSR Phase (서버)                        │
│                                                             │
│  Server Side Rendering                                      │
│  ┌───────────────────────────────────────────┐              │
│  │ HebrewIcon Component                      │              │
│  │                                           │              │
│  │ word: "בְּרֵאשִׁית"                       │              │
│  │ iconSvg: "<svg>...</svg>"                │              │
│  │                                           │              │
│  │ ✅ useId() 호출                           │              │
│  │    → reactId: ":r1:"                     │              │
│  │    → uniqueId: "r1"                      │              │
│  │                                           │              │
│  │ 생성된 HTML:                              │              │
│  │ <radialGradient id="r1-sun">             │              │
│  │ <circle fill="url(#r1-sun)"/>            │              │
│  └───────────────────────────────────────────┘              │
│                         │                                    │
│                         ▼                                    │
│            📤 HTML을 클라이언트로 전송                        │
│            📦 React는 ":r1:" 정보도 함께 전송                │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 2️⃣ Hydration Phase (클라이언트)               │
│                                                             │
│  Client Side Hydration                                      │
│  ┌───────────────────────────────────────────┐              │
│  │ HebrewIcon Component (다시 렌더링)        │              │
│  │                                           │              │
│  │ word: "בְּרֵאשִׁית" (동일)               │              │
│  │ iconSvg: "<svg>...</svg>" (동일)         │              │
│  │                                           │              │
│  │ ✅ useId() 호출 (서버와 동기화됨!)        │              │
│  │    → reactId: ":r1:" (서버와 동일!)      │ ✅ 동일!     │
│  │    → uniqueId: "r1"                      │              │
│  │                                           │              │
│  │ 생성하려는 HTML:                          │              │
│  │ <radialGradient id="r1-sun">             │ ✅ 일치!     │
│  │ <circle fill="url(#r1-sun)"/>            │              │
│  └───────────────────────────────────────────┘              │
│                         │                                    │
│                         ▼                                    │
│            ✅ Hydration 성공!                                │
│            ✨ 에러 없음                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 여러 컴포넌트 인스턴스 비교

### Math.random() 사용 시

```
페이지에 3개의 HebrewIcon이 있을 때:

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  HebrewIcon #1   │      │  HebrewIcon #2   │      │  HebrewIcon #3   │
│                  │      │                  │      │                  │
│  בְּרֵאשִׁית      │      │  בָּרָא           │      │  אֱלֹהִים         │
│                  │      │                  │      │                  │
│  Math.random()   │      │  Math.random()   │      │  Math.random()   │
│  → "-abc123"     │      │  → "-xyz789"     │      │  → "-def456"     │
│                  │      │                  │      │                  │
│  ⚠️ 모두 빈 prefix │      │  ⚠️ 모두 빈 prefix │      │  ⚠️ 모두 빈 prefix │
│  (히브리어 제거)  │      │  (히브리어 제거)  │      │  (히브리어 제거)  │
└──────────────────┘      └──────────────────┘      └──────────────────┘

문제점:
- 매번 다른 random ID
- 히브리어 단어 구분 불가
- 디버깅 어려움
```

### useId() 사용 시

```
페이지에 3개의 HebrewIcon이 있을 때:

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  HebrewIcon #1   │      │  HebrewIcon #2   │      │  HebrewIcon #3   │
│                  │      │                  │      │                  │
│  בְּרֵאשִׁית      │      │  בָּרָא           │      │  אֱלֹהִים         │
│                  │      │                  │      │                  │
│  useId()         │      │  useId()         │      │  useId()         │
│  → "r1"          │      │  → "r2"          │      │  → "r3"          │
│                  │      │                  │      │                  │
│  ✅ 고유 ID      │      │  ✅ 고유 ID      │      │  ✅ 고유 ID      │
│  ✅ 일관성 보장  │      │  ✅ 일관성 보장  │      │  ✅ 일관성 보장  │
└──────────────────┘      └──────────────────┘      └──────────────────┘

장점:
- 각 컴포넌트마다 고유 ID
- SSR/CSR 일관성
- 디버깅 쉬움
```

---

## 🎨 SVG ID 충돌 문제

### 문제: ID 없이 여러 SVG 사용 시

```html
<!-- 첫 번째 단어 -->
<svg>
  <defs>
    <radialGradient id="sun">
      <stop offset="0%" stop-color="#FFD700"/>
    </radialGradient>
  </defs>
  <circle fill="url(#sun)"/>
</svg>

<!-- 두 번째 단어 (동일한 ID!) -->
<svg>
  <defs>
    <radialGradient id="sun">  ⚠️ 충돌!
      <stop offset="0%" stop-color="#FF0000"/>  ← 빨간색
    </radialGradient>
  </defs>
  <circle fill="url(#sun)"/>
</svg>

결과:
- 두 번째 gradient가 첫 번째를 덮어씀
- 모든 "sun" gradient가 빨간색으로 표시됨
```

### 해결: Unique ID 적용

```html
<!-- 첫 번째 단어 -->
<svg>
  <defs>
    <radialGradient id="r1-sun">
      <stop offset="0%" stop-color="#FFD700"/>
    </radialGradient>
  </defs>
  <circle fill="url(#r1-sun)"/>
</svg>

<!-- 두 번째 단어 -->
<svg>
  <defs>
    <radialGradient id="r2-sun">  ✅ 고유!
      <stop offset="0%" stop-color="#FF0000"/>
    </radialGradient>
  </defs>
  <circle fill="url(#r2-sun)"/>
</svg>

결과:
- 각 gradient가 독립적
- 정확한 색상 표시
```

---

## 📊 정규식 처리 흐름

### ID 치환 과정

```
원본 SVG:
<svg>
  <defs>
    <radialGradient id="sun_bereshit">
      <stop offset="0%" stop-color="#FFD700"/>
    </radialGradient>
    <linearGradient id="sky_bereshit">
      <stop offset="0%" stop-color="#FF6B9D"/>
    </linearGradient>
  </defs>
  <circle fill="url(#sun_bereshit)"/>
  <rect fill="url(#sky_bereshit)"/>
</svg>

        ⬇️ Step 1: ID 치환 정규식 실행

replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`)

찾기: id="sun_bereshit"
교체: id="r1-sun_bereshit"

찾기: id="sky_bereshit"
교체: id="r1-sky_bereshit"

결과:
<svg>
  <defs>
    <radialGradient id="r1-sun_bereshit">
      <stop offset="0%" stop-color="#FFD700"/>
    </radialGradient>
    <linearGradient id="r1-sky_bereshit">
      <stop offset="0%" stop-color="#FF6B9D"/>
    </linearGradient>
  </defs>
  <circle fill="url(#sun_bereshit)"/>  ⬅️ 아직 원본!
  <rect fill="url(#sky_bereshit)"/>    ⬅️ 아직 원본!
</svg>

        ⬇️ Step 2: URL 참조 치환 정규식 실행

replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`)

찾기: url(#sun_bereshit)
교체: url(#r1-sun_bereshit)

찾기: url(#sky_bereshit)
교체: url(#r1-sky_bereshit)

최종 결과:
<svg>
  <defs>
    <radialGradient id="r1-sun_bereshit">
      <stop offset="0%" stop-color="#FFD700"/>
    </radialGradient>
    <linearGradient id="r1-sky_bereshit">
      <stop offset="0%" stop-color="#FF6B9D"/>
    </linearGradient>
  </defs>
  <circle fill="url(#r1-sun_bereshit)"/>  ✅ 매칭됨!
  <rect fill="url(#r1-sky_bereshit)"/>    ✅ 매칭됨!
</svg>
```

---

## 🔧 코드 변경 비교

### AS-IS (현재)

```typescript
const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  ...
}) => {
  const uniqueSvg = useMemo(() => {
    if (!iconSvg || iconSvg.trim().length === 0) return null;

    // ❌ Math.random() 사용
    const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;
    //                                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                                                       문제: 매번 다른 값!

    let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);
    processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);
    //                                       ^^^^^^^^^^^^^
    //                                       문제: 공백 처리 안됨

    return processedSvg;
  }, [iconSvg, word]);

  // ...
};
```

### TO-BE (개선)

```typescript
import { useId } from 'react';  // ✅ useId import 추가

const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  ...
}) => {
  const reactId = useId();  // ✅ useId 호출 (SSR-safe)

  const uniqueSvg = useMemo(() => {
    if (!iconSvg || iconSvg.trim().length === 0) return null;

    // ✅ React의 unique ID 사용
    const uniqueId = reactId.replace(/:/g, '');
    //               ^^^^^^^^^^^^^^^^^^^^^^^^
    //               해결: SSR/CSR 동일한 값!

    let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);
    processedSvg = processedSvg.replace(/url\(\s*#([^)]+?)\s*\)/g, `url(#${uniqueId}-$1)`);
    //                                       ^^^           ^^^
    //                                       해결: 공백 처리 추가!

    return processedSvg;
  }, [iconSvg, reactId]);  // ✅ word 대신 reactId 사용

  // ...
};
```

---

## 📈 영향 범위

```
HebrewIcon.tsx
    ├── FlashCard.tsx (앞면 96px, 뒷면 64px)
    │   └── VocabularyTab.tsx (전체/북마크/암기 탭)
    │   └── StudyTab.tsx (학습 모드)
    │
    └── 기타 사용처
        └── 미래의 컴포넌트들

총 영향:
- 📱 FlashCard에서 사용되는 모든 SVG 아이콘
- 📚 VocabularyTab의 모든 단어 카드
- 📖 StudyTab의 학습 카드
- 🎨 약 100+ 개의 히브리어 단어 아이콘
```

---

## ✅ 요약

### 현재 상태
```
┌─────────────────────┐
│  Math.random()      │
│  ❌ Non-deterministic │
│  ❌ SSR 문제 있음     │
│  ⚠️  히브리어 빈 prefix │
│  ⚠️  공백 처리 안됨    │
└─────────────────────┘
```

### 개선 후
```
┌─────────────────────┐
│  useId()            │
│  ✅ Deterministic   │
│  ✅ SSR-safe       │
│  ✅ 고유 ID 보장    │
│  ✅ 공백 처리 추가  │
└─────────────────────┘
```

**결론: 즉시 개선 권장! 🚀**
