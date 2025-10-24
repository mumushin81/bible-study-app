# 📊 SVG 기술 분석 보고서

**작성일**: 2025-10-24
**작성자**: Claude Code
**목적**: SVG 파일의 작동 원리, 내부 구조, 렌더링 방식, 웹 동작 흐름 분석

---

## 📚 목차

1. [SVG 개요](#1-svg-개요)
2. [SVG 내부 구조](#2-svg-내부-구조)
3. [렌더링 파이프라인](#3-렌더링-파이프라인)
4. [웹에서의 동작 흐름](#4-웹에서의-동작-흐름)
5. [고급 기능](#5-고급-기능)
6. [성능 최적화](#6-성능-최적화)
7. [실전 예제 분석](#7-실전-예제-분석)
8. [트러블슈팅](#8-트러블슈팅)

---

## 1. SVG 개요

### 1.1 SVG란?

**SVG (Scalable Vector Graphics)**
- XML 기반의 벡터 그래픽 포맷
- W3C 표준 (1999년 첫 발표)
- 해상도 독립적 (확대/축소 시 품질 유지)
- 텍스트 기반 (검색 가능, 편집 가능)

### 1.2 벡터 vs 래스터 비교

| 특성 | SVG (벡터) | PNG/JPG (래스터) |
|------|-----------|------------------|
| **저장 방식** | 수학적 좌표/경로 | 픽셀 배열 |
| **확대 시** | 선명 유지 ✅ | 흐려짐 ❌ |
| **파일 크기** | 작음 (복잡도에 따라) | 큼 (해상도에 비례) |
| **편집** | 쉬움 (텍스트) | 어려움 |
| **애니메이션** | CSS/JS 지원 | GIF만 가능 |
| **SEO** | 검색 가능 | 불가능 |

### 1.3 SVG의 장단점

#### 장점 ✅
- **해상도 독립적**: Retina 디스플레이에서도 완벽
- **작은 파일 크기**: 단순한 그래픽은 KB 단위
- **CSS 스타일링**: 색상, 크기 동적 변경 가능
- **JavaScript 조작**: DOM API로 실시간 수정
- **애니메이션**: CSS/SMIL로 부드러운 애니메이션
- **접근성**: 스크린 리더 지원 (title, desc 태그)

#### 단점 ❌
- **복잡한 이미지**: 사진은 PNG/JPG가 더 효율적
- **브라우저 호환성**: 구형 IE 제한적 지원
- **렌더링 비용**: 매우 복잡한 경로는 성능 저하

---

## 2. SVG 내부 구조

### 2.1 기본 구조

```xml
<svg
  width="200"
  height="200"
  viewBox="0 0 100 100"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- 내용 -->
</svg>
```

#### 주요 속성

| 속성 | 설명 | 예시 |
|------|------|------|
| **width/height** | 실제 표시 크기 (CSS 단위) | `"200px"`, `"50%"` |
| **viewBox** | 내부 좌표계 (minX minY width height) | `"0 0 100 100"` |
| **xmlns** | XML 네임스페이스 (필수) | `"http://www.w3.org/2000/svg"` |
| **preserveAspectRatio** | 비율 유지 방식 | `"xMidYMid meet"` |

### 2.2 좌표계 (Coordinate System)

```
     0                  100 (viewBox width)
  0  ┌─────────────────────┐
     │                     │
     │     (50, 50)        │
     │         •           │
     │                     │
100  └─────────────────────┘
     (viewBox height)
```

**특징**:
- 원점: 왼쪽 상단 (0, 0)
- X축: 오른쪽으로 증가
- Y축: **아래쪽**으로 증가 (일반 좌표계와 반대!)

### 2.3 ViewBox의 마법

#### ViewBox 작동 원리

```xml
<!-- Case 1: viewBox = width/height -->
<svg width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40"/>
</svg>
<!-- 결과: 1:1 비율, 원이 정확히 맞음 -->

<!-- Case 2: viewBox < width/height -->
<svg width="200" height="200" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40"/>
</svg>
<!-- 결과: 2배 확대, 원이 크게 보임 -->

<!-- Case 3: viewBox > width/height -->
<svg width="100" height="100" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="80"/>
</svg>
<!-- 결과: 0.5배 축소, 원이 작게 보임 -->
```

**공식**:
```
확대 비율 = width / viewBox.width
```

### 2.4 기본 도형 (Primitives)

#### 원 (Circle)
```xml
<circle cx="50" cy="50" r="40" fill="red"/>
```
- `cx, cy`: 중심 좌표
- `r`: 반지름

#### 사각형 (Rectangle)
```xml
<rect x="10" y="10" width="80" height="60" rx="5" fill="blue"/>
```
- `x, y`: 왼쪽 상단 좌표
- `rx, ry`: 모서리 반경 (둥근 모서리)

#### 타원 (Ellipse)
```xml
<ellipse cx="50" cy="50" rx="40" ry="25" fill="green"/>
```
- `rx`: X축 반지름
- `ry`: Y축 반지름

#### 선 (Line)
```xml
<line x1="10" y1="10" x2="90" y2="90" stroke="black" stroke-width="2"/>
```

#### 다각형 (Polygon)
```xml
<polygon points="50,10 90,90 10,90" fill="yellow"/>
```

#### 경로 (Path) - 가장 강력함
```xml
<path d="M 10 10 L 90 10 L 50 90 Z" fill="orange"/>
```

### 2.5 Path 명령어 상세

Path는 SVG의 핵심! 모든 복잡한 도형은 Path로 표현됨.

#### 이동 명령어

| 명령 | 의미 | 예시 | 설명 |
|------|------|------|------|
| **M** | Move To (절대) | `M 10 20` | 펜을 (10, 20)으로 이동 |
| **m** | Move To (상대) | `m 5 5` | 현재 위치에서 (5, 5) 이동 |

#### 선 그리기

| 명령 | 의미 | 예시 | 설명 |
|------|------|------|------|
| **L** | Line To (절대) | `L 50 50` | (50, 50)까지 직선 |
| **l** | Line To (상대) | `l 20 20` | 현재에서 (20, 20) 직선 |
| **H** | Horizontal Line | `H 100` | X=100까지 수평선 |
| **V** | Vertical Line | `V 50` | Y=50까지 수직선 |

#### 곡선 그리기

| 명령 | 의미 | 예시 | 설명 |
|------|------|------|------|
| **C** | Cubic Bézier | `C x1 y1 x2 y2 x y` | 3차 베지어 곡선 |
| **S** | Smooth Cubic | `S x2 y2 x y` | 부드러운 베지어 |
| **Q** | Quadratic Bézier | `Q x1 y1 x y` | 2차 베지어 곡선 |
| **A** | Arc (호) | `A rx ry rotation large sweep x y` | 타원 호 |

#### 닫기

| 명령 | 의미 | 설명 |
|------|------|------|
| **Z** | Close Path | 시작점으로 직선 연결 |

#### 실전 예제: 하트 ❤️

```xml
<path d="
  M 50,60
  C 50,45 40,35 30,35
  C 20,35 15,45 15,55
  C 15,65 25,75 50,90
  C 75,75 85,65 85,55
  C 85,45 80,35 70,35
  C 60,35 50,45 50,60
  Z
" fill="red"/>
```

**해석**:
1. `M 50,60`: 중앙 시작
2. `C 50,45 40,35 30,35`: 왼쪽 상단 곡선
3. `C 20,35 15,45 15,55`: 왼쪽 둥근 부분
4. `C 15,65 25,75 50,90`: 왼쪽 아래 곡선
5. 오른쪽도 대칭으로 그림
6. `Z`: 닫기

---

## 3. 렌더링 파이프라인

### 3.1 브라우저 렌더링 과정

```
SVG 파싱
   ↓
DOM 트리 생성
   ↓
스타일 계산 (CSS)
   ↓
레이아웃 (Reflow)
   ↓
페인트 준비
   ↓
래스터화 (Rasterization)
   ↓
합성 (Compositing)
   ↓
화면 출력
```

### 3.2 각 단계 상세

#### 1단계: SVG 파싱 (Parsing)
```javascript
// 브라우저 내부 동작 (의사 코드)
function parseSVG(svgString) {
  const xmlDoc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  return xmlDoc.documentElement;
}
```

**처리 내용**:
- XML 구문 분석
- 태그 유효성 검증
- 속성 파싱

#### 2단계: DOM 트리 생성
```
svg (root)
 ├─ defs
 │   └─ linearGradient
 │       ├─ stop (offset=0%)
 │       └─ stop (offset=100%)
 ├─ circle
 └─ path
```

#### 3단계: 스타일 계산
```css
/* CSS 스타일이 적용됨 */
svg circle {
  fill: red;
  stroke: black;
  stroke-width: 2px;
}
```

**우선순위**:
1. Inline 스타일 (`style="fill: red"`)
2. SVG 속성 (`fill="red"`)
3. CSS 규칙
4. 브라우저 기본값

#### 4단계: 레이아웃 (Reflow)
- ViewBox 변환 행렬 계산
- 좌표 변환
- Bounding Box 계산

**변환 행렬**:
```
viewBox="0 0 100 100" → width="200" height="200"

Transform Matrix:
[2  0  0]   (X 좌표 2배 확대)
[0  2  0]   (Y 좌표 2배 확대)
[0  0  1]   (이동 없음)
```

#### 5단계: 페인트 준비
- Fill/Stroke 색상 결정
- Gradient 계산
- Filter 효과 준비

#### 6단계: 래스터화 (Rasterization)
**벡터 → 픽셀 변환**

```
Path: M 0 0 L 100 0 L 100 100 Z

래스터화:
■ ■ ■ ■ ■ ... (100개)
■ □ □ □ ■
■ □ □ □ ■
■ □ □ □ ■
■ ■ ■ ■ ■
```

**Anti-aliasing**: 경계를 부드럽게
```
Before:          After:
■ ■ □ □          ■ ▓ ░ □
■ ■ □ □          ■ ▓ ░ □
```

#### 7단계: 합성 (Compositing)
- 레이어 합성
- Opacity 적용
- Blend modes 처리

### 3.3 렌더링 최적화 기법

#### GPU 가속
```css
/* CSS로 GPU 레이어 생성 */
svg {
  transform: translateZ(0);  /* GPU 가속 활성화 */
  will-change: transform;    /* 브라우저에게 힌트 */
}
```

#### Reflow 최소화
```javascript
// ❌ 나쁜 예: 반복적인 Reflow
for (let i = 0; i < 100; i++) {
  circle.setAttribute('r', i);  // 100번 Reflow!
}

// ✅ 좋은 예: 애니메이션 프레임 사용
function animate() {
  circle.setAttribute('r', radius);
  requestAnimationFrame(animate);
}
```

---

## 4. 웹에서의 동작 흐름

### 4.1 SVG 삽입 방법

#### 방법 1: Inline SVG (권장)
```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>
```

**장점**:
- CSS 스타일링 가능
- JavaScript 조작 가능
- HTTP 요청 없음

**단점**:
- HTML 파일 크기 증가

#### 방법 2: `<img>` 태그
```html
<img src="icon.svg" alt="Icon">
```

**장점**:
- 캐싱 가능
- 간단함

**단점**:
- CSS 스타일링 불가
- JavaScript 조작 불가

#### 방법 3: CSS Background
```css
.icon {
  background-image: url('icon.svg');
}
```

**장점**:
- 반복 패턴에 유용

**단점**:
- 스타일링 제한적

#### 방법 4: `<object>` 태그
```html
<object data="icon.svg" type="image/svg+xml"></object>
```

**장점**:
- SVG 내부 스크립트 실행 가능

**단점**:
- 복잡함

#### 방법 5: Data URI
```html
<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0i...">
```

**장점**:
- HTTP 요청 없음

**단점**:
- 캐싱 불가
- Base64 인코딩 오버헤드 (~33%)

### 4.2 React에서의 SVG 사용

#### 방법 1: 컴포넌트로 직접 렌더링
```typescript
function Icon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="blue"/>
    </svg>
  );
}
```

#### 방법 2: dangerouslySetInnerHTML
```typescript
function Icon({ svgString }: { svgString: string }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: svgString }} />
  );
}
```

**주의**: XSS 위험! 신뢰할 수 있는 소스만 사용

#### 방법 3: SVG to React Component
```bash
npx @svgr/cli icon.svg > Icon.tsx
```

**결과**:
```typescript
function Icon(props) {
  return (
    <svg width={64} height={64} {...props}>
      <circle cx={32} cy={32} r={28} fill="currentColor" />
    </svg>
  );
}
```

### 4.3 동적 SVG 생성 흐름

```
사용자 요청
   ↓
서버/클라이언트에서 SVG 생성
   ↓
문자열 → DOM 파싱
   ↓
React 컴포넌트 렌더링
   ↓
브라우저 렌더링 파이프라인
   ↓
화면 출력
```

#### 실전 예제 (Eden 프로젝트)

```typescript
// 1. SVG 생성 (서버 또는 빌드 타임)
function generateSVG(word: Word): string {
  return `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${word.id}-gradient">
          <stop offset="0%" stop-color="#FFD700"/>
          <stop offset="100%" stop-color="#FFA500"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28"
        fill="url(#${word.id}-gradient)"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
    </svg>
  `;
}

// 2. 데이터베이스 저장
await supabase
  .from('words')
  .update({ icon_svg: generateSVG(word) })
  .eq('id', word.id);

// 3. React 컴포넌트에서 렌더링
function HebrewIcon({ iconSvg }: { iconSvg: string }) {
  const uniqueId = useId();  // React 18 SSR-safe ID

  // Gradient ID 충돌 방지
  const processedSvg = iconSvg.replace(
    /id="([^"]+)"/g,
    `id="$1-${uniqueId}"`
  );

  return (
    <div dangerouslySetInnerHTML={{ __html: processedSvg }} />
  );
}
```

---

## 5. 고급 기능

### 5.1 Gradients (그라디언트)

#### Linear Gradient (선형)
```xml
<defs>
  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="red"/>
    <stop offset="50%" stop-color="yellow"/>
    <stop offset="100%" stop-color="green"/>
  </linearGradient>
</defs>

<rect fill="url(#grad1)" width="200" height="100"/>
```

**그라디언트 방향**:
- `x1="0%" y1="0%" x2="100%" y2="0%"`: 왼쪽 → 오른쪽
- `x1="0%" y1="0%" x2="0%" y2="100%"`: 위 → 아래
- `x1="0%" y1="0%" x2="100%" y2="100%"`: 대각선

#### Radial Gradient (방사형)
```xml
<defs>
  <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="white"/>
    <stop offset="100%" stop-color="blue"/>
  </radialGradient>
</defs>

<circle cx="50" cy="50" r="40" fill="url(#grad2)"/>
```

### 5.2 Filters (필터)

#### Drop Shadow (그림자)
```xml
<defs>
  <filter id="shadow">
    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.5"/>
  </filter>
</defs>

<circle cx="50" cy="50" r="40" fill="red" filter="url(#shadow)"/>
```

#### Blur (흐림)
```xml
<filter id="blur">
  <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
</filter>
```

#### Glow (발광)
```xml
<filter id="glow">
  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
  <feMerge>
    <feMergeNode in="coloredBlur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

### 5.3 Clipping & Masking

#### Clip Path (클리핑)
```xml
<defs>
  <clipPath id="clip1">
    <circle cx="50" cy="50" r="40"/>
  </clipPath>
</defs>

<rect x="0" y="0" width="100" height="100"
      fill="red" clip-path="url(#clip1)"/>
<!-- 결과: 원 모양으로 잘린 사각형 -->
```

#### Mask (마스킹)
```xml
<defs>
  <mask id="mask1">
    <circle cx="50" cy="50" r="40" fill="white"/>
  </mask>
</defs>

<rect x="0" y="0" width="100" height="100"
      fill="blue" mask="url(#mask1)"/>
```

### 5.4 Patterns (패턴)

```xml
<defs>
  <pattern id="pattern1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="5" fill="red"/>
  </pattern>
</defs>

<rect x="0" y="0" width="200" height="100" fill="url(#pattern1)"/>
<!-- 결과: 빨간 점이 반복되는 패턴 -->
```

### 5.5 Transforms (변환)

```xml
<!-- 이동 -->
<rect transform="translate(50, 50)" width="40" height="40"/>

<!-- 회전 -->
<rect transform="rotate(45 50 50)" width="40" height="40"/>

<!-- 확대/축소 -->
<rect transform="scale(2)" width="20" height="20"/>

<!-- 기울이기 -->
<rect transform="skewX(20)" width="40" height="40"/>

<!-- 조합 -->
<rect transform="translate(50,50) rotate(45) scale(1.5)"
      width="40" height="40"/>
```

---

## 6. 성능 최적화

### 6.1 파일 크기 최적화

#### Before (최적화 전)
```xml
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="red" stroke="black" stroke-width="2"/>
  <!-- 주석도 포함 -->
  <rect x="10" y="10" width="20" height="20" fill="blue"/>
</svg>
```
**크기**: 245 bytes

#### After (최적화 후)
```xml
<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red" stroke="#000" stroke-width="2"/><rect x="10" y="10" width="20" height="20" fill="blue"/></svg>
```
**크기**: 155 bytes (-37%)

#### SVGO (자동 최적화 도구)
```bash
npm install -g svgo
svgo input.svg -o output.svg
```

**최적화 항목**:
- 불필요한 공백 제거
- 주석 제거
- 기본값 속성 제거 (`fill="black"` → 생략)
- 소수점 반올림 (`50.00000` → `50`)
- Path 최적화

### 6.2 렌더링 성능

#### 1. 복잡도 줄이기
```xml
<!-- ❌ 나쁜 예: Path가 너무 복잡 -->
<path d="M0,0 L0.1,0.1 L0.2,0.2 ... L100,100"/>
<!-- 10,000개 좌표 → 렌더링 느림 -->

<!-- ✅ 좋은 예: Path 단순화 -->
<path d="M0,0 L25,25 L50,50 L75,75 L100,100"/>
<!-- 5개 좌표 → 빠름 -->
```

#### 2. 레이어 분리
```xml
<!-- 정적 요소 -->
<svg id="static">
  <rect width="1000" height="1000" fill="blue"/>
</svg>

<!-- 동적 요소 (별도 레이어) -->
<svg id="dynamic" style="position: absolute;">
  <circle cx="50" cy="50" r="10" fill="red"/>
</svg>
```

#### 3. `will-change` 사용
```css
.animated-svg {
  will-change: transform;
}
```

### 6.3 캐싱 전략

#### HTTP 캐싱
```
Cache-Control: public, max-age=31536000, immutable
```

#### Service Worker 캐싱
```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.svg')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

#### React memo
```typescript
const SvgIcon = React.memo(({ iconSvg }: { iconSvg: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: iconSvg }} />;
});
```

---

## 7. 실전 예제 분석

### 7.1 Eden 프로젝트 SVG 구조

#### 실제 SVG 코드
```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bara-abc123-gradient-1">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFA500"/>
    </linearGradient>
  </defs>
  <path
    d="M 32 12 L 40 28 L 56 30 L 44 42 L 48 58 L 32 48 L 16 58 L 20 42 L 8 30 L 24 28 Z"
    fill="url(#bara-abc123-gradient-1)"
    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
  />
</svg>
```

#### 렌더링 흐름 분석

```
1. 파싱 단계:
   - viewBox="0 0 64 64" 인식
   - linearGradient 정의 파싱
   - path 명령어 파싱

2. DOM 트리:
   svg
    └─ defs
        └─ linearGradient (id="bara-abc123-gradient-1")
            ├─ stop (0%, #FFD700)
            └─ stop (100%, #FFA500)
    └─ path
        ├─ fill="url(#bara-abc123-gradient-1)"
        └─ filter="drop-shadow(...)"

3. 스타일 계산:
   - Gradient: Gold → Orange (선형)
   - Filter: 그림자 (dx=0, dy=2, blur=4)

4. 레이아웃:
   - Path 경로 계산 (별 모양)
   - Bounding Box: (8, 12) ~ (56, 58)

5. 페인트:
   - Gradient 렌더링 (픽셀별로 색상 보간)
   - Drop shadow 렌더링 (흐림 효과)

6. 래스터화:
   - 별 모양을 픽셀로 변환
   - Anti-aliasing 적용 (경계 부드럽게)

7. 합성:
   - 그림자 레이어 + 별 레이어 합성

8. 출력:
   - 64x64 픽셀 이미지로 화면 표시
```

### 7.2 Gradient ID 충돌 문제

#### 문제 상황
```html
<!-- 플래시카드 1 -->
<svg>
  <defs>
    <linearGradient id="gradient-1">...</linearGradient>
  </defs>
  <circle fill="url(#gradient-1)"/>
</svg>

<!-- 플래시카드 2 (같은 ID!) -->
<svg>
  <defs>
    <linearGradient id="gradient-1">...</linearGradient>
  </defs>
  <circle fill="url(#gradient-1)"/>  <!-- 플래시카드 1의 gradient 사용! -->
</svg>
```

**브라우저 동작**:
```javascript
document.getElementById('gradient-1');  // 첫 번째 것만 반환
```

#### 해결 방법 1: Unique ID 생성 (DB)
```typescript
const uniqueId = `${word.meaning.slice(0,3)}-${word.id.slice(-8)}-${Date.now().toString(36).slice(-4)}`;

const svg = `
  <linearGradient id="${uniqueId}-gradient">
    ...
  </linearGradient>
  <circle fill="url(#${uniqueId}-gradient)"/>
`;
```

#### 해결 방법 2: React useId() (렌더링 시)
```typescript
function HebrewIcon({ iconSvg }: { iconSvg: string }) {
  const reactId = useId();  // :r1:, :r2:, ...

  const processedSvg = iconSvg.replace(
    /id="([^"]+)"/g,
    (match, id) => `id="${id}-${reactId}"`
  ).replace(
    /url\(#([^)]+)\)/g,
    (match, id) => `url(#${id}-${reactId})`
  );

  return <div dangerouslySetInnerHTML={{ __html: processedSvg }} />;
}
```

### 7.3 SSR Hydration Mismatch 문제

#### 문제 원인
```typescript
// ❌ 서버와 클라이언트에서 다른 ID 생성
const uniqueId = `icon-${Math.random().toString(36)}`;

// 서버 렌더링: icon-abc123
// 클라이언트 Hydration: icon-xyz789

// SVG에서 url(#icon-abc123)을 참조하지만
// 클라이언트 DOM에는 #icon-xyz789만 존재
// → Gradient 렌더링 실패!
```

#### React 18 useId() 동작 원리
```typescript
// 서버 렌더링
function MyComponent() {
  const id = useId();  // :r1:
  return <div id={id}>...</div>;
}
// HTML: <div id=":r1:">...</div>

// 클라이언트 Hydration
function MyComponent() {
  const id = useId();  // :r1: (서버와 동일!)
  return <div id={id}>...</div>;
}
// DOM: <div id=":r1:">...</div>

// ✅ 일치! Hydration 성공
```

---

## 8. 트러블슈팅

### 8.1 일반적인 문제

#### 문제 1: SVG가 표시되지 않음

**체크리스트**:
- [ ] `xmlns="http://www.w3.org/2000/svg"` 있는지
- [ ] `viewBox` 설정 확인
- [ ] `width`/`height` 0이 아닌지
- [ ] `display: none` 또는 `visibility: hidden` 아닌지

```xml
<!-- ❌ xmlns 누락 -->
<svg viewBox="0 0 64 64">...</svg>

<!-- ✅ xmlns 포함 -->
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">...</svg>
```

#### 문제 2: Gradient가 표시되지 않음

**원인**: ID 충돌 또는 잘못된 참조

**해결**:
```xml
<!-- ❌ 잘못된 참조 -->
<linearGradient id="grad1">...</linearGradient>
<circle fill="url(#grad2)"/>  <!-- grad1이 아니라 grad2! -->

<!-- ✅ 올바른 참조 -->
<linearGradient id="grad1">...</linearGradient>
<circle fill="url(#grad1)"/>
```

#### 문제 3: Filter가 적용되지 않음

**원인**: Filter 정의가 `<defs>` 안에 없음

```xml
<!-- ❌ 잘못된 위치 -->
<svg>
  <filter id="shadow">...</filter>
  <circle filter="url(#shadow)"/>
</svg>

<!-- ✅ 올바른 위치 -->
<svg>
  <defs>
    <filter id="shadow">...</filter>
  </defs>
  <circle filter="url(#shadow)"/>
</svg>
```

### 8.2 성능 문제

#### 문제: 수백 개의 SVG가 느림

**해결 방법**:
1. **가상화 (Virtualization)**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={words.length}
  itemSize={100}
>
  {({ index, style }) => (
    <div style={style}>
      <HebrewIcon iconSvg={words[index].iconSvg} />
    </div>
  )}
</FixedSizeList>
```

2. **Lazy Loading**
```typescript
<img
  src="icon.svg"
  loading="lazy"  // 뷰포트에 들어올 때만 로드
/>
```

3. **Image Sprite**
```xml
<!-- 하나의 SVG에 모든 아이콘 -->
<svg>
  <defs>
    <symbol id="icon1" viewBox="0 0 64 64">...</symbol>
    <symbol id="icon2" viewBox="0 0 64 64">...</symbol>
  </defs>
</svg>

<!-- 사용 -->
<svg><use href="#icon1"/></svg>
```

### 8.3 브라우저 호환성

| 기능 | Chrome | Firefox | Safari | IE11 |
|------|--------|---------|--------|------|
| Basic SVG | ✅ | ✅ | ✅ | ✅ |
| Inline SVG | ✅ | ✅ | ✅ | ✅ |
| CSS Styling | ✅ | ✅ | ✅ | ⚠️ 제한적 |
| Filters | ✅ | ✅ | ✅ | ❌ |
| Animations | ✅ | ✅ | ✅ | ❌ |
| SMIL | ⚠️ 지원 중단 | ✅ | ✅ | ❌ |

**Polyfill**:
```html
<!-- IE11 지원 -->
<script src="https://cdn.jsdelivr.net/npm/svg4everybody@2.1.9/dist/svg4everybody.min.js"></script>
<script>svg4everybody();</script>
```

---

## 📚 참고 자료

### 공식 문서
- [W3C SVG Specification](https://www.w3.org/TR/SVG2/)
- [MDN SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)

### 도구
- [SVGO](https://github.com/svg/svgo) - SVG 최적화
- [SVGR](https://react-svgr.com/) - SVG to React Component
- [SVG Path Editor](https://yqnn.github.io/svg-path-editor/) - Path 시각화 편집

### 성능 분석
- Chrome DevTools → Performance 탭
- Chrome DevTools → Rendering → Paint flashing

---

## 🎯 핵심 요약

### SVG 작동 원리
1. **XML 기반**: 텍스트로 저장, 파싱 가능
2. **벡터 그래픽**: 수학적 경로로 표현, 확대 가능
3. **DOM 통합**: JavaScript/CSS로 조작 가능

### 렌더링 파이프라인
```
파싱 → DOM → 스타일 → 레이아웃 → 페인트 → 래스터화 → 출력
```

### 웹에서의 사용
- **Inline SVG**: 가장 유연, CSS/JS 조작 가능
- **React**: `dangerouslySetInnerHTML` 또는 컴포넌트
- **최적화**: 파일 크기, 렌더링 성능, 캐싱

### 주의사항
- **ID 충돌**: Gradient/Filter ID는 전역 스코프
- **SSR Hydration**: `useId()` 사용 필수
- **성능**: 복잡도 제한, 가상화 고려

---

**작성일**: 2025-10-24
**버전**: 1.0
**작성자**: Claude Code
