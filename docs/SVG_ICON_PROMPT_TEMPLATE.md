# SVG 아이콘 생성 프롬프트 템플릿

## 사용 방법

히브리어 단어의 SVG 아이콘을 생성할 때 이 템플릿을 사용하세요.

---

## 프롬프트 템플릿

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 히브리어 단어 SVG 아이콘 생성 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 단어 정보

**히브리어**: {hebrew_word}
**의미**: {meaning}
**한글 발음**: {korean_pronunciation}
**문법**: {grammar_type}
**문맥**: {context_if_any}

## 작업 요구사항

### 🎯 목표
위 히브리어 단어의 의미를 시각적으로 표현하는 **인라인 SVG 문자열**을 생성하세요.

### 📐 필수 기술 규격 (SVG_ICON_GUIDELINES.md 준수)

#### 1. 기본 구조
```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs>[gradients]</defs>[content]</svg>
```

**필수 항목:**
- ✅ `viewBox="0 0 64 64"` (반드시 이 크기)
- ✅ `xmlns="http://www.w3.org/2000/svg"`
- ✅ 한 줄로 작성 (줄바꿈 없음)
- ✅ `<defs>` 태그로 그라디언트 정의
- ❌ `width`, `height` 속성 사용 금지

#### 2. Gradient ID 명명 규칙

**형식**: `{word_context}-{element}-{number}`

**예시:**
```xml
<linearGradient id="bereshit-sun-1">
<radialGradient id="elohim-crown-1">
<linearGradient id="earth-ground-1">
```

**중요**: 절대로 일반적인 ID 사용 금지!
❌ `gradient1`, `gradient`, `grad1`, `g1`, `linear1` 등

#### 3. 그라디언트 사용 (필수)

**LinearGradient** (방향성 있는 오브젝트):
```xml
<linearGradient id="{unique-id}-1" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="#FFD700"/>
  <stop offset="100%" stop-color="#FFA500"/>
</linearGradient>
```

**RadialGradient** (후광, 중심 오브젝트):
```xml
<radialGradient id="{unique-id}-glow-1">
  <stop offset="0%" stop-color="#FFFFFF"/>
  <stop offset="100%" stop-color="#FFD700"/>
</radialGradient>
```

#### 4. Filter 효과 (필수)

**표준 drop-shadow**:
```xml
filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
```

**색상 후광** (신성한 오브젝트):
```xml
filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"
```

#### 5. 색상 가이드

| 의미 | 추천 색상 |
|------|----------|
| 하나님, 신성 | #FFD700 (골드) |
| 하늘, 영적 | #4A90E2 (블루), #7B68EE (퍼플) |
| 사랑, 생명 | #e74c3c (레드), #FF69B4 (핑크) |
| 자연, 성장 | #2ECC71 (그린) |
| 인간, 땅 | #8B4513 (브라운) |
| 금속, 도구 | #C0C0C0 (실버) |

**자주 사용되는 색상 (검증된 색상):**
- #FFD700 (골드, 83회 사용)
- #FFFFFF (하이라이트, 66회 사용)
- #4A90E2, #7B68EE (블루/퍼플 계열)
- #e74c3c (레드)

### 🎨 디자인 원칙

#### 1. 시각적 계층
- **메인 심볼**: 가장 크고 눈에 띄게
- **보조 요소**: 의미 보완
- **배경/효과**: 분위기 연출

#### 2. 단순성과 명확성
- 복잡한 path보다는 circle, rect, polygon 우선
- 핵심 의미를 직관적으로 표현
- 3-5개 주요 요소로 구성

#### 3. 일관된 스타일
- 부드러운 라운드 코너 (`stroke-linecap="round"`)
- 그라디언트로 입체감 표현
- drop-shadow로 레이어 분리

### 📏 품질 기준

- ✅ 파일 크기: 500-1500자 (최대 3000자)
- ✅ 그라디언트 2-3개 사용
- ✅ drop-shadow 효과 필수
- ✅ 고유한 gradient ID
- ✅ opacity 활용하여 깊이감 표현

### 출력 형식

**오직 SVG 문자열만 출력하세요 (한 줄로):**

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="unique-id-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient><radialGradient id="unique-id-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><circle cx="32" cy="32" r="24" fill="url(#unique-id-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="8" fill="url(#unique-id-glow-1)" opacity="0.6"/></svg>
```

### ⚠️ 주의사항

1. **절대 금지:**
   - 일반적인 gradient ID (`gradient1`, `grad1` 등)
   - 줄바꿈 포함
   - `width`, `height` 속성
   - 주석

2. **필수 포함:**
   - `viewBox="0 0 64 64"`
   - `xmlns="http://www.w3.org/2000/svg"`
   - `<defs>` 태그
   - 최소 1개 이상의 gradient
   - 최소 1개 이상의 filter

3. **권장:**
   - 2-3개의 그라디언트
   - drop-shadow 효과
   - opacity로 깊이감
   - 의미와 어울리는 색상

### 예시

**입력:** "הָאָרֶץ" (땅) - 브라운 계열
**출력:**
```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="haaretz-earth-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D2691E"/><stop offset="100%" stop-color="#8B4513"/></linearGradient><radialGradient id="haaretz-core-1"><stop offset="0%" stop-color="#FF8C00"/><stop offset="100%" stop-color="#8B4513"/></radialGradient></defs><circle cx="32" cy="32" r="26" fill="url(#haaretz-earth-1)" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="12" fill="url(#haaretz-core-1)" opacity="0.7"/><path d="M 12 32 Q 22 28 32 32 Q 42 36 52 32" stroke="#654321" stroke-width="2" fill="none"/></svg>
```

---

**단어**: {hebrew_word} ({meaning})
**목표**: 이 단어의 의미를 강력하게 전달하는 SVG 아이콘!
```

---

## 빠른 참조

### 자주 사용하는 SVG 요소

```xml
<!-- 원 -->
<circle cx="32" cy="32" r="20" fill="url(#grad)" filter="drop-shadow(...)"/>

<!-- 사각형 -->
<rect x="16" y="16" width="32" height="32" rx="4" fill="url(#grad)"/>

<!-- 경로 (별) -->
<path d="M 32 12 L 36 26 L 50 26 L 39 34 L 43 48 L 32 40 L 21 48 L 25 34 L 14 26 L 28 26 Z" fill="url(#grad)"/>

<!-- 타원 -->
<ellipse cx="32" cy="32" rx="20" ry="12" fill="url(#grad)"/>

<!-- 선 -->
<line x1="16" y1="32" x2="48" y2="32" stroke="#color" stroke-width="4"/>

<!-- 다각형 -->
<polygon points="32,12 48,48 16,48" fill="url(#grad)"/>
```

### 그라디언트 방향

```xml
<!-- 위 → 아래 -->
<linearGradient x1="0%" y1="0%" x2="0%" y2="100%">

<!-- 왼쪽 → 오른쪽 -->
<linearGradient x1="0%" y1="0%" x2="100%" y2="0%">

<!-- 대각선 -->
<linearGradient x1="0%" y1="0%" x2="100%" y2="100%">

<!-- 방사형 (중심 → 외곽) -->
<radialGradient>
```

### Drop Shadow 변형

```xml
<!-- 부드러운 그림자 -->
filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"

<!-- 강한 그림자 -->
filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))"

<!-- 색상 후광 -->
filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"

<!-- 큰 후광 -->
filter="drop-shadow(0 0 12px rgba(123, 104, 238, 0.7))"
```

---

## 검증 방법

생성된 SVG를 검증하려면:

```bash
# 단일 파일 검증
node scripts/validate-svg-icons.cjs path/to/file.json

# 전체 검증
node scripts/validate-svg-icons.cjs
```

---

## 관련 문서

- **상세 가이드라인**: `docs/SVG_ICON_GUIDELINES.md`
- **검증 스크립트**: `scripts/validate-svg-icons.cjs`
- **분석 스크립트**: `scripts/analyze-svg-consistency.cjs`
