# SVG 아이콘 디자인 가이드라인

## 📋 목차
1. [개요](#개요)
2. [필수 규격](#필수-규격)
3. [디자인 원칙](#디자인-원칙)
4. [색상 가이드](#색상-가이드)
5. [그라디언트 사용](#그라디언트-사용)
6. [효과 사용](#효과-사용)
7. [일관성 체크리스트](#일관성-체크리스트)
8. [나쁜 예시와 좋은 예시](#나쁜-예시와-좋은-예시)

---

## 🎯 개요

Eden 앱의 히브리어 단어 아이콘은 사용자에게 단어의 의미를 시각적으로 전달하는 중요한 요소입니다. 모든 아이콘은 일관된 스타일을 유지하여 사용자 경험을 향상시켜야 합니다.

### 분석 결과
- ✅ 100% viewBox 일관성
- ✅ 100% defs 사용
- ✅ 100% gradient 사용
- ✅ 99%+ filter 사용

---

## 📐 필수 규격

### 1. SVG 기본 속성

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- 내용 -->
</svg>
```

**필수 항목:**
- ✅ `viewBox="0 0 64 64"` - 모든 아이콘은 64x64 캔버스 사용
- ✅ `xmlns="http://www.w3.org/2000/svg"` - XML namespace 선언
- ❌ `width`와 `height` 속성은 사용하지 않음 (반응형을 위해)

### 2. 파일 크기
- **최소**: 100자 이상
- **최대**: 3000자 이하
- **권장**: 500-1500자

---

## 🎨 디자인 원칙

### 1. 시각적 계층 구조

아이콘은 단어의 의미를 직관적으로 전달해야 합니다.

```
중요도 순서:
1️⃣ 메인 심볼 (가장 크고 눈에 띄게)
2️⃣ 보조 요소 (의미 보완)
3️⃣ 배경/효과 (분위기 연출)
```

### 2. 복잡도 수준

- **단순**: 명사(사물) - 단일 오브젝트로 표현
- **중간**: 동사(행동) - 동작을 나타내는 요소 추가
- **복잡**: 추상 개념 - 여러 요소 조합

### 3. 스타일 일관성

- **라운드 코너**: 부드러운 느낌 (`stroke-linecap="round"`)
- **그라디언트**: 입체감과 깊이 표현
- **그림자**: 레이어 분리 효과

---

## 🌈 색상 가이드

### 1. 기본 색상 팔레트

#### 골드/옐로우 계열 (신성함, 중요함)
```
#FFD700 - 황금색 (가장 많이 사용, 83회)
#FFA500 - 주황색
#FF8C00 - 진한 주황색
```

#### 블루/퍼플 계열 (영적, 하늘)
```
#4A90E2 - 하늘색
#7B68EE - 보라색
#3498db - 청색
#667eea - 연보라
#764ba2 - 진보라
```

#### 레드/핑크 계열 (생명, 사랑)
```
#e74c3c - 빨강
#c0392b - 진한 빨강
#FF69B4 - 핑크
#FF1493 - 진한 핑크
```

#### 그린 계열 (자연, 생명)
```
#2ECC71 - 초록
#27AE60 - 진한 초록
#4CAF50 - 밝은 초록
```

#### 브라운 계열 (땅, 인간)
```
#8B4513 - 갈색
#654321 - 진한 갈색
#D2691E - 밝은 갈색
```

#### 회색 계열 (중립, 금속)
```
#2c3e50 - 다크 그레이
#C0C0C0 - 실버
#808080 - 회색
```

#### 하이라이트
```
#FFFFFF - 하이라이트용 (66회 사용)
```

### 2. 색상 매칭 가이드

| 단어 의미 | 추천 색상 |
|----------|----------|
| 하나님, 신성 | 골드 (#FFD700) |
| 하늘, 영적 | 블루/퍼플 (#4A90E2, #7B68EE) |
| 사랑, 생명 | 레드/핑크 (#e74c3c, #FF69B4) |
| 자연, 성장 | 그린 (#2ECC71) |
| 인간, 땅 | 브라운 (#8B4513) |
| 금속, 도구 | 그레이 (#C0C0C0) |

---

## 🎨 그라디언트 사용

### 1. 그라디언트 ID 명명 규칙

**형식**: `{단어}-{요소}-{번호}`

```xml
<defs>
  <linearGradient id="word-main-1" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#FFD700" />
    <stop offset="100%" stop-color="#FFA500" />
  </linearGradient>
  <radialGradient id="word-glow-1">
    <stop offset="0%" stop-color="#FFFFFF" />
    <stop offset="100%" stop-color="#FFD700" />
  </radialGradient>
</defs>
```

**중요**: 각 아이콘의 gradient ID는 고유해야 합니다!

### 2. 그라디언트 타입

#### Linear Gradient (선형)
- **용도**: 방향성이 있는 오브젝트
- **각도**: 대각선 (0% 0% → 100% 100%) 권장

```xml
<linearGradient id="example-linear-1" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="#4A90E2" />
  <stop offset="100%" stop-color="#7B68EE" />
</linearGradient>
```

#### Radial Gradient (방사형)
- **용도**: 빛, 후광, 중심이 있는 오브젝트
- **중심**: 기본값 사용 (cx="50%" cy="50%")

```xml
<radialGradient id="example-radial-1">
  <stop offset="0%" stop-color="#FFFFFF" />
  <stop offset="100%" stop-color="#FFD700" />
</radialGradient>
```

### 3. 그라디언트 색상 조합

**좋은 조합:**
- 골드 → 오렌지: `#FFD700` → `#FFA500`
- 블루 → 퍼플: `#4A90E2` → `#7B68EE`
- 레드 → 다크레드: `#e74c3c` → `#c0392b`
- 화이트 → 골드: `#FFFFFF` → `#FFD700` (후광)

**피해야 할 조합:**
- 보색 조합 (파랑 → 주황)
- 너무 큰 명도 차이
- 3개 이상의 stop

---

## ✨ 효과 사용

### 1. Drop Shadow (그림자)

**표준 포맷:**
```xml
filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
```

**파라미터 가이드:**
- `offset-x`: 0 (중앙)
- `offset-y`: 2-4px (아래로)
- `blur-radius`: 4-8px
- `color`: `rgba(0, 0, 0, 0.2-0.4)`

**사용 예시:**
```xml
<!-- 부드러운 그림자 -->
<circle cx="32" cy="32" r="20"
  fill="url(#gradient)"
  filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" />

<!-- 강한 그림자 (강조) -->
<path d="..."
  fill="#FFD700"
  filter="drop-shadow(0 4px 8px rgba(255, 215, 0, 0.5))" />
```

### 2. 색상 그림자 (Colored Shadow)

특정 색상의 후광 효과:
```xml
filter="drop-shadow(0 0 6px rgba(123, 104, 238, 0.8))"
```

**용도:**
- 신성한 오브젝트: 골드 그림자 `rgba(255, 215, 0, 0.8)`
- 영적 요소: 블루/퍼플 그림자
- 생명: 그린/레드 그림자

### 3. Opacity (투명도)

```xml
<!-- 배경 요소 -->
<circle cx="32" cy="32" r="28" fill="#FFD700" opacity="0.2" />

<!-- 오버레이 -->
<rect x="0" y="0" width="64" height="64" fill="#FFFFFF" opacity="0.1" />
```

**가이드:**
- 배경: `opacity="0.1-0.3"`
- 보조 요소: `opacity="0.4-0.6"`
- 메인 요소: `opacity="0.8-1.0"`

---

## ✅ 일관성 체크리스트

### 필수 항목

- [ ] `viewBox="0 0 64 64"` 사용
- [ ] `xmlns="http://www.w3.org/2000/svg"` 포함
- [ ] `<defs>` 태그로 그라디언트 정의
- [ ] 고유한 gradient ID 사용
- [ ] drop-shadow 효과 적용
- [ ] 파일 크기 100-3000자

### 디자인 일관성

- [ ] 메인 심볼이 명확함
- [ ] 색상이 단어 의미와 일치
- [ ] 그라디언트 방향이 자연스러움
- [ ] 그림자가 적절함
- [ ] 전체적으로 균형잡힘

### 코드 품질

- [ ] 불필요한 속성 없음
- [ ] 중복 요소 없음
- [ ] 주석 없음 (최종 버전)
- [ ] 들여쓰기 없음 (한 줄)

---

## 📚 나쁜 예시와 좋은 예시

### ❌ 나쁜 예시 1: viewBox 누락

```xml
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="20" fill="blue" />
</svg>
```

**문제점:**
- width/height로 고정 크기 지정
- 반응형 불가능
- viewBox 누락

### ✅ 좋은 예시 1: 올바른 기본 구조

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="example-main-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#7B68EE"/></linearGradient></defs><circle cx="32" cy="32" r="20" fill="url(#example-main-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>
```

---

### ❌ 나쁜 예시 2: 중복 Gradient ID

```xml
<!-- 아이콘 1 -->
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient1">...</linearGradient>
  </defs>
  <circle fill="url(#gradient1)" />
</svg>

<!-- 아이콘 2 - 같은 페이지에 있으면 충돌! -->
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient1">...</linearGradient>
  </defs>
  <rect fill="url(#gradient1)" />
</svg>
```

**문제점:**
- 같은 ID를 다른 아이콘에서 사용
- 한 페이지에 여러 아이콘 표시 시 충돌

### ✅ 좋은 예시 2: 고유한 Gradient ID

```xml
<!-- 아이콘 1 -->
<linearGradient id="word1-main-1">...</linearGradient>

<!-- 아이콘 2 -->
<linearGradient id="word2-main-1">...</linearGradient>
```

---

### ❌ 나쁜 예시 3: 과도한 복잡도

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M 10 10 L 54 10 L 54 54 L 10 54 Z M 15 15 L 20 20 L 25 15 L 30 20 L 35 15 L 40 20 L 45 15 L 50 20 L 50 50 L 45 45 L 40 50 L 35 45 L 30 50 L 25 45 L 20 50 L 15 45 Z" />
  <!-- 너무 많은 path 포인트 -->
</svg>
```

**문제점:**
- 불필요하게 복잡한 path
- 파일 크기 증가
- 렌더링 성능 저하

### ✅ 좋은 예시 3: 단순하고 명확

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="simple-main-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#simple-main-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="8" fill="#FFFFFF" opacity="0.6"/></svg>
```

---

## 🔧 검증 도구

### 자동 검증 스크립트

```bash
node scripts/validate-svg-icons.cjs
```

**검증 항목:**
- viewBox 일관성
- xmlns 존재
- gradient ID 중복
- 파일 크기
- 필수 효과 적용

---

## 📖 참고 자료

### SVG 스펙
- [MDN SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
- [SVG Gradients](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients)
- [SVG Filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Filter_effects)

### 디자인 원칙
- [Material Design Icons](https://material.io/design/iconography/system-icons.html)
- [iOS Icon Design](https://developer.apple.com/design/human-interface-guidelines/sf-symbols/overview/)

---

## 📝 버전 히스토리

- **v1.0** (2025-10-22): 초기 가이드라인 작성
  - Genesis 11-15장 아이콘 분석 결과 반영
  - 112개 아이콘 패턴 분석
  - 필수 규격 및 색상 가이드 정립
