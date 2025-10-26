# 플래시카드 이미지 렌더링 전체 분석 보고서

## 📊 현재 상태

### ✅ 데이터베이스 (Supabase)
- **icon_url**: ✅ 모든 단어에 JPG URL 존재
- **icon_svg**: ✅ 모든 단어에 SVG 코드 존재
- 예시: `https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/...`

### ⚠️ 렌더링 문제
이미지가 화면에 표시되지 않는 원인을 분석합니다.

---

## 🔍 전체 렌더링 흐름 (코드 기준)

### 1️⃣ 데이터 흐름: DB → Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│ Supabase Database (words 테이블)                                │
├─────────────────────────────────────────────────────────────────┤
│ • icon_url (TEXT): JPG 이미지 URL                               │
│ • icon_svg (TEXT): SVG 코드 (fallback)                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ useWords Hook (src/hooks/useWords.ts:42-64)                     │
├─────────────────────────────────────────────────────────────────┤
│ SELECT query:                                                    │
│   - icon_url (line 53)                                          │
│   - icon_svg (line 54)                                          │
│                                                                  │
│ 데이터 변환 (line 103-120):                                     │
│   iconUrl: item.icon_url || undefined,  // line 112             │
│   iconSvg: item.icon_svg || undefined,  // line 113             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FlashCard Component (src/components/shared/FlashCard.tsx)       │
├─────────────────────────────────────────────────────────────────┤
│ Props:                                                           │
│   word: Word | WordWithContext                                  │
│   ├─ word.iconUrl?: string                                      │
│   └─ word.iconSvg?: string                                      │
│                                                                  │
│ HebrewIcon 호출 (line 82-89):                                   │
│   <HebrewIcon                                                    │
│     iconUrl={word.iconUrl}      // ✅ JPG URL                   │
│     iconSvg={word.iconSvg}      // ✅ SVG code                  │
│     className="w-full h-full object-contain"                    │
│   />                                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ HebrewIcon Component (src/components/shared/HebrewIcon.tsx)     │
├─────────────────────────────────────────────────────────────────┤
│ 우선순위 시스템:                                                │
│                                                                  │
│ 1️⃣ iconUrl (line 22-36) - 최우선                               │
│    if (iconUrl) {                                               │
│      return <img src={iconUrl} ... />                           │
│    }                                                             │
│                                                                  │
│ 2️⃣ iconSvg (line 65-80) - 두 번째                              │
│    if (uniqueSvg) {                                             │
│      return <div dangerouslySetInnerHTML={...} />               │
│    }                                                             │
│                                                                  │
│ 3️⃣ Legacy Components (line 83-125)                             │
│    BereshitIcon, ElohimIcon, etc.                               │
│                                                                  │
│ 4️⃣ Default (line 128-145)                                      │
│    <FileText /> (Lucide icon)                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 FlashCard 레이어 구조 (Z-Index 분석)

### 현재 DOM 구조

```html
<motion.div perspective="1000px">  <!-- 외부 컨테이너 -->
  <motion.div transform="rotateY(...)">  <!-- 3D 회전 컨테이너 -->

    <!-- ① SVG/이미지 레이어 (z-20, NO isolation) -->
    <div class="absolute top-2 left-2 right-2 h-[calc(80%-0.5rem)] z-20">
      <HebrewIcon
        iconUrl={word.iconUrl}  <!-- JPG 이미지 -->
        className="w-full h-full object-contain"
      />
    </div>

    <!-- ② 카드 앞면 (z-0, isolation: isolate) -->
    <div class="absolute inset-0 bg-{grammar}-500/90 border">
      <!-- ②-1 광택 오버레이 (z-0) -->
      <div class="absolute inset-0"
           style="background: linear-gradient(135deg, rgba(255,255,255,0.15) ...)">
      </div>

      <!-- ②-2 상단 버튼들 (z-20) -->
      <div class="absolute top-0 left-0 right-0 z-20">
        <div>품사 배지</div>
        <button>북마크 버튼</button>
      </div>

      <!-- ②-3 이미지 영역 (빈 공간, 80% 높이) -->
      <div class="relative w-full h-[80%]" />

      <!-- ②-4 하단 컨텐츠 (z-10) -->
      <div class="relative z-10">
        <div>히브리어</div>
        <div>발음</div>
      </div>
    </div>

    <!-- ③ 카드 뒷면 (동일 구조) -->
  </motion.div>
</motion.div>
```

### Z-Index 계층 (숫자가 클수록 위)

```
Layer                                  Z-Index   Isolation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SVG/이미지 레이어 (HebrewIcon)           z-20     ❌ NONE
  └─ <img src={iconUrl} />

상단 버튼 레이어                         z-20     ❌ NONE
  └─ 품사 배지, 북마크 버튼

하단 컨텐츠 레이어                       z-10     ❌ NONE
  └─ 히브리어, 발음

광택 오버레이                            z-0      ❌ NONE
  └─ linear-gradient

카드 배경                                z-0      ✅ isolate
  └─ bg-{grammar}-500/90

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 Key Point:
- SVG 레이어와 카드 배경이 별도의 stacking context
- SVG 레이어의 isolation 제거로 z-20이 제대로 작동해야 함
```

---

## 🚨 이미지가 안 보이는 원인 분석

### ❌ 가능한 원인들

#### 1. CSS Stacking Context 문제
**상태**: ✅ 해결됨 (이전 세션)
- SVG 레이어에서 `isolation: 'isolate'` 제거함
- 현재 FlashCard.tsx:79에 `isolation` 없음

#### 2. 광택 오버레이 덮음 문제
**상태**: ⚠️ 여전히 가능성 있음

```tsx
// FlashCard.tsx:108-114
<div
  className="absolute inset-0 pointer-events-none"
  style={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
  }}
/>
```

**문제점**:
- `absolute inset-0` = 카드 전체를 덮음 (top:0, left:0, right:0, bottom:0)
- z-index가 명시되지 않음 → 기본값 `auto` (DOM 순서대로)
- SVG 레이어(z-20)가 먼저 선언되었지만, 카드 배경이 `isolation: 'isolate'`를 사용
- **카드 배경의 자식인 광택 오버레이는 카드 배경의 stacking context 내부에만 존재**
- SVG 레이어는 카드 배경의 부모 레벨에 있음

**실험 필요**:
```tsx
// 광택 오버레이에 z-index 명시
<div
  className="absolute inset-0 pointer-events-none z-0"  // ← 추가
  style={{ background: '...' }}
/>
```

#### 3. 배경 투명도 90% 문제
**상태**: ⚠️ 가능성 낮음

```tsx
// FlashCard.tsx:94-99
className={`absolute inset-0 ${
  word.grammar
    ? getGrammarCardBackground(word.grammar, darkMode)
    : 'bg-gray-800/90'  // ← /90 = 90% opacity
}`}
```

**분석**:
- 배경이 90% 불투명 = 10% 투명
- 하지만 배경은 z-0, 이미지는 z-20이므로 이미지가 위에 있어야 함
- **카드 배경에 `isolation: 'isolate'`가 있어서 별도의 stacking context**
- SVG 레이어는 카드 배경과 **형제 관계**이므로 서로 독립적

#### 4. SVG 레이어 위치 문제
**상태**: ⚠️ 검증 필요

```tsx
// FlashCard.tsx:76-90
<div
  className="absolute top-2 left-2 right-2 h-[calc(80%-0.5rem)] z-20"
  style={{ willChange: 'contents' }}
>
```

**분석**:
- `top-2 left-2 right-2` = 카드 테두리에서 8px 안쪽
- `h-[calc(80%-0.5rem)]` = 카드 높이의 80% - 8px
- **위치는 정상**, 이미지 영역과 일치함

#### 5. HebrewIcon img 태그 스타일 문제
**상태**: ⚠️ 가능성 높음

```tsx
// HebrewIcon.tsx:24-34
<img
  src={iconUrl}
  alt={word}
  className={className}  // ← "w-full h-full object-contain"
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }}
  loading="lazy"
/>
```

**잠재적 문제**:
- `className="w-full h-full"` + `style={{ width: '100%', height: '100%' }}`
  → Tailwind와 inline style 중복
- `loading="lazy"` → 이미지가 뷰포트 밖에 있으면 로드 안 됨
- **부모 컨테이너의 크기가 0일 수 있음**

**실험 필요**:
```tsx
// 1. 부모 크기 확인
<div className="... z-20" style={{ border: '2px solid red' }}>
  {/* 빨간 테두리가 보이면 컨테이너는 정상 */}
</div>

// 2. img 크기 강제 지정
<img
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    minWidth: '100px',  // ← 최소 크기 보장
    minHeight: '100px',
  }}
/>
```

#### 6. 3D Transform 문제
**상태**: ⚠️ 가능성 중간

```tsx
// FlashCard.tsx:67-73
<motion.div
  style={{
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  }}
>
```

**문제점**:
- `preserve-3d` + `isolation` 조합 시 렌더링 버그 발생 가능
- SVG 레이어가 3D 공간에서 카드 앞/뒤면과 독립적
- **SVG 레이어가 회전하지 않음** (앞/뒤 공통이므로)

**실험 필요**:
- SVG 레이어를 카드 앞면 **내부**로 이동
- 앞면과 뒷면에 각각 별도 HebrewIcon 배치

---

## 🧪 디버깅 체크리스트

### 브라우저 개발자 도구 확인

1. **Network 탭**
   ```
   ✅ icon_url로 요청이 가는가?
   ✅ HTTP 200 응답인가?
   ❌ 404/403 에러?
   ❌ CORS 에러?
   ```

2. **Elements 탭**
   ```html
   <!-- 이미지 레이어가 렌더링되는가? -->
   <div class="... z-20" style="...">
     <img src="https://..." alt="בְּרֵאשִׁית" />
   </div>

   <!-- img 태그의 computed style 확인 -->
   width: ???px (0이면 문제!)
   height: ???px (0이면 문제!)
   display: block
   visibility: visible
   opacity: 1
   ```

3. **Console 탭**
   ```javascript
   // useWords Hook 로그
   [useWords] בְּרֵאשִׁית (태초에, 처음에): icon_svg=EXISTS

   // HebrewIcon 로그
   // (현재 iconUrl 사용 시 로그 없음)
   ```

4. **Computed 탭 (img 태그 선택)**
   ```
   Position: static/absolute?
   Z-Index: auto/0/20?
   Width: 0px? (문제!)
   Height: 0px? (문제!)
   Display: none? (문제!)
   Opacity: 0? (문제!)
   ```

---

## 🔧 해결 방안 (우선순위별)

### 1️⃣ 즉시 시도: 부모 컨테이너 크기 확인

```tsx
// FlashCard.tsx:76
<div
  className="absolute top-2 left-2 right-2 h-[calc(80%-0.5rem)] z-20"
  style={{
    willChange: 'contents',
    backgroundColor: 'rgba(255,0,0,0.2)',  // ← 디버그용 빨간 배경
    border: '2px solid yellow',            // ← 디버그용 노란 테두리
  }}
>
```

**예상 결과**:
- 빨간 배경/노란 테두리 보임 → 컨테이너 크기 정상
- 아무것도 안 보임 → 컨테이너 크기가 0 (문제!)

### 2️⃣ HebrewIcon에 로깅 추가

```tsx
// HebrewIcon.tsx:22
if (iconUrl) {
  console.log(`[HebrewIcon] 🖼️  Rendering JPG: ${word}`, {
    iconUrl: iconUrl.substring(0, 60) + '...',
    className,
    size,
  });

  return (
    <img
      src={iconUrl}
      alt={word}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
      loading="lazy"
      onLoad={() => console.log(`✅ Image loaded: ${word}`)}
      onError={(e) => console.error(`❌ Image error: ${word}`, e)}
    />
  );
}
```

### 3️⃣ img 태그 강제 크기 지정

```tsx
// HebrewIcon.tsx:24
<img
  src={iconUrl}
  alt={word}
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    minWidth: '200px',   // ← 강제 최소 크기
    minHeight: '200px',  // ← 강제 최소 크기
  }}
  loading="eager"  // ← lazy 대신 즉시 로드
/>
```

### 4️⃣ SVG 레이어를 카드 내부로 이동

```tsx
// FlashCard.tsx:92-142 (앞면 내부)
<div className="absolute inset-0 ... flex flex-col">
  {/* 광택 오버레이 */}
  <div className="absolute inset-0 z-0" ... />

  {/* ✨ 이미지를 앞면 내부로 이동 */}
  <div className="relative w-full h-[80%] z-30">
    <HebrewIcon ... className="w-full h-full" />
  </div>

  {/* 상단 버튼들 */}
  <div className="absolute top-0 z-40" ... />

  {/* 하단 컨텐츠 */}
  <div className="relative h-[20%] z-10" ... />
</div>
```

### 5️⃣ 광택 오버레이 z-index 명시

```tsx
// FlashCard.tsx:108
<div
  className="absolute inset-0 pointer-events-none z-0"  // ← z-0 추가
  style={{ background: 'linear-gradient(...)' }}
/>
```

### 6️⃣ isolation 완전 제거 (최후 수단)

```tsx
// FlashCard.tsx:104 제거
style={{
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  // isolation: 'isolate',  ← 완전 제거
  transform: 'translateZ(0)',
}}
```

---

## 📝 요약

### 데이터 흐름 (정상)
✅ DB에 icon_url 존재
✅ useWords Hook이 iconUrl 전달
✅ FlashCard가 HebrewIcon에 props 전달
✅ HebrewIcon이 img 태그 렌더링

### 렌더링 구조 (의심)
⚠️ SVG 레이어가 카드와 형제 관계 (독립적)
⚠️ 광택 오버레이가 SVG를 덮을 가능성
⚠️ img 태그의 부모 크기가 0일 가능성
⚠️ 3D transform과 isolation 충돌 가능성

### 다음 단계
1. 브라우저 개발자 도구에서 img 태그 크기 확인
2. HebrewIcon에 onLoad/onError 로그 추가
3. SVG 레이어에 디버그용 배경색 추가
4. 이미지가 실제로 로드되는지 Network 탭 확인

---

## 🎯 최종 진단

**이미지가 안 보이는 가장 가능성 높은 원인**:

1. **img 태그의 부모 컨테이너 크기가 0** (60% 확률)
   - `h-[calc(80%-0.5rem)]`가 0으로 계산됨
   - 부모 컨테이너의 높이가 설정되지 않음

2. **3D transform + 독립 레이어 구조** (30% 확률)
   - SVG 레이어가 3D 공간에서 뒤로 밀림
   - `preserve-3d`와 `z-index` 충돌

3. **CSS 중복 또는 Tailwind purge** (10% 확률)
   - Tailwind의 `w-full h-full`이 적용 안 됨
   - inline style과 className 충돌

**권장 순서**:
1. 디버그용 배경색/테두리 추가 (1분)
2. 브라우저 개발자 도구 확인 (2분)
3. onLoad/onError 로그 추가 (3분)
4. 문제 원인 특정 후 해결 (5-10분)
