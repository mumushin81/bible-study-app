# 🎨 JPG 아이콘 디자인 가이드라인

**최종 업데이트**: 2025-10-25
**방식**: Canvas API로 직접 JPG 생성
**목표**: 파스텔 색감, 화려함, 예술적 표현

---

## 📋 목차
1. [개요](#개요)
2. [핵심 원칙](#핵심-원칙)
3. [색상 팔레트](#색상-팔레트)
4. [디자인 패턴](#디자인-패턴)
5. [Canvas 기법](#canvas-기법)
6. [단어별 디자인 전략](#단어별-디자인-전략)
7. [품질 기준](#품질-기준)

---

## 🎯 개요

### 새로운 접근 방식

**기존 방식 (SVG)**:
- Claude API로 SVG 코드 텍스트 생성
- gradient ID 충돌 문제
- 제한된 색상 표현

**새로운 방식 (JPG)**:
- ✨ Canvas API로 직접 그림
- 🎨 풍부한 색감과 그라디언트
- 🖼️ 더 예술적인 표현 가능
- 💾 외부 API 불필요

### 목표

Eden 앱의 히브리어 단어 아이콘은:
- **파스텔 색감**으로 부드럽고 따뜻한 느낌
- **화려함**으로 시각적 즐거움 제공
- **밝은 색상**으로 긍정적 학습 경험
- **예술적 표현**으로 단어를 영원히 기억

---

## 🌟 핵심 원칙

### 1. 파스텔 색감 (Pastel Colors)

**정의**: 흰색이 섞인 듯한 부드러운 색상

```javascript
// ❌ 진한 색상 (피할 것)
const darkColors = {
  red: '#FF0000',      // 너무 강렬
  blue: '#0000FF',     // 너무 진함
  black: '#000000'     // 절대 금지
}

// ✅ 파스텔 색상 (권장)
const pastelColors = {
  pink: '#FFB6C1',           // 파스텔 핑크
  lavender: '#E1BEE7',       // 파스텔 라벤더
  mint: '#A8EDEA',           // 파스텔 민트
  peach: '#FFE5B4',          // 파스텔 피치
  skyBlue: '#B0E0E6',        // 파스텔 스카이블루
  lemon: '#FFF9E6',          // 파스텔 레몬
  coral: '#FFB6A3',          // 파스텔 코랄
  lilac: '#DDA0DD'           // 파스텔 라일락
}
```

### 2. 화려함 (Vibrant & Colorful)

**전략**:
- 🌈 **다채로운 그라디언트**: 2-4개 색상 혼합
- ✨ **빛나는 효과**: 방사형 그라디언트, 후광
- 🎭 **대비**: 밝은 배경 + 화려한 중심
- 💫 **입체감**: 레이어, 그림자, 하이라이트

```javascript
// 화려한 그라디언트 예시
const vibrantGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
vibrantGradient.addColorStop(0, '#FFFFFF')      // 중심: 순백
vibrantGradient.addColorStop(0.3, '#FFD700')    // 골드
vibrantGradient.addColorStop(0.6, '#FF69B4')    // 핑크
vibrantGradient.addColorStop(1, '#E1BEE7')      // 라벤더
```

### 3. 밝은 색상 선호

**밝기 기준**: 최소 70% 밝기

```javascript
// 색상 밝기 체크
function isBrightEnough(r, g, b) {
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness >= 180  // 최소 180/255 = 70%
}

// ✅ 항상 밝은 색상 사용
const brightColors = [
  '#FFFFFF', '#FFF9E6', '#FFE5B4',  // 화이트 계열
  '#FFD700', '#FFA500', '#FFB84D',  // 골드 계열
  '#FFB6C1', '#FFB6A3', '#FFC0CB',  // 핑크 계열
  '#87CEEB', '#B0E0E6', '#E0F6FF',  // 블루 계열
  '#90EE90', '#98FB98', '#A8EDEA',  // 그린 계열
  '#E1BEE7', '#DDA0DD', '#F3E5F5'   // 퍼플 계열
]
```

### 4. 예술적 표현

**접근법**:
- 🎨 **은유적 표현**: 직접적이지 않은 상징적 표현
- 🌸 **자연적 요소**: 꽃, 나무, 별, 구름 등
- 🌅 **풍경적 요소**: 하늘, 땅, 물, 빛
- ✨ **추상적 패턴**: 파동, 리본, 입자

---

## 🎨 색상 팔레트

### 기본 파스텔 팔레트

#### 1. 신성함 / 하나님 (Divine)
```javascript
const divine = {
  primary: '#FFD700',      // 골드
  secondary: '#FFA500',    // 오렌지 골드
  accent: '#FFF9E6',       // 크림
  highlight: '#FFFFFF',    // 순백
  background: '#FFE5B4'    // 파스텔 피치
}
```

#### 2. 하늘 / 영적 (Celestial)
```javascript
const celestial = {
  primary: '#87CEEB',      // 스카이블루
  secondary: '#B0E0E6',    // 파우더블루
  accent: '#E0F6FF',       // 아이스블루
  highlight: '#FFFFFF',    // 순백
  background: '#F0F8FF'    // 앨리스블루
}
```

#### 3. 생명 / 탄생 (Life)
```javascript
const life = {
  primary: '#FFB6C1',      // 라이트핑크
  secondary: '#FF69B4',    // 핫핑크 (파스텔)
  accent: '#FFC0CB',       // 핑크
  highlight: '#FFFFFF',    // 순백
  background: '#FFF0F5'    // 라벤더블러시
}
```

#### 4. 자연 / 땅 (Nature)
```javascript
const nature = {
  primary: '#90EE90',      // 라이트그린
  secondary: '#98FB98',    // 페일그린
  accent: '#A8EDEA',       // 민트
  highlight: '#FFFFFF',    // 순백
  background: '#F0FFF0'    // 하니듀
}
```

#### 5. 물 / 바다 (Water)
```javascript
const water = {
  primary: '#00CED1',      // 터콰이즈
  secondary: '#7FDBFF',    // 아쿠아
  accent: '#A8EDEA',       // 민트
  highlight: '#FFFFFF',    // 순백
  background: '#E0FFFF'    // 라이트시안
}
```

#### 6. 사랑 / 열정 (Love)
```javascript
const love = {
  primary: '#FFB6A3',      // 파스텔 코랄
  secondary: '#FF7F50',    // 코랄
  accent: '#FFA07A',       // 라이트살몬
  highlight: '#FFFFFF',    // 순백
  background: '#FFF5EE'    // 씨셸
}
```

#### 7. 신비 / 영성 (Mystical)
```javascript
const mystical = {
  primary: '#E1BEE7',      // 파스텔 라벤더
  secondary: '#DDA0DD',    // 플럼
  accent: '#BA68C8',       // 미디엄 오키드
  highlight: '#FFFFFF',    // 순백
  background: '#F3E5F5'    // 라벤더 미스트
}
```

---

## 🎭 디자인 패턴

### 패턴 1: 방사형 후광 (Radial Halo)

**용도**: 신성함, 중요함, 빛

```javascript
function drawRadialHalo(ctx, x, y, maxRadius, colors) {
  // 여러 겹의 후광
  for (let i = colors.length; i > 0; i--) {
    const gradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, maxRadius * (i / colors.length)
    )
    gradient.addColorStop(0, colors[i - 1])
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

// 사용 예: 하나님 단어
drawRadialHalo(ctx, centerX, centerY, 200, [
  '#FFD700',  // 골드
  '#FFA500',  // 오렌지
  '#FFE5B4'   // 피치
])
```

### 패턴 2: 그라디언트 배경 (Gradient Background)

**용도**: 풍경, 분위기

```javascript
function drawGradientBackground(ctx, colors, direction = 'vertical') {
  const gradient = direction === 'vertical'
    ? ctx.createLinearGradient(0, 0, 0, canvas.height)
    : ctx.createLinearGradient(0, 0, canvas.width, 0)

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// 사용 예: 하늘 → 땅
drawGradientBackground(ctx, [
  '#87CEEB',  // 스카이블루
  '#B0E0E6',  // 파우더블루
  '#98FB98',  // 페일그린
  '#90EE90'   // 라이트그린
])
```

### 패턴 3: 입자 효과 (Particle Effect)

**용도**: 창조, 에너지, 별

```javascript
function drawParticles(ctx, centerX, centerY, count, colors, maxDistance) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const distance = Math.random() * maxDistance
    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance
    const size = Math.random() * 8 + 4
    const color = colors[i % colors.length]

    // 빛나는 입자
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
    gradient.addColorStop(0, '#FFFFFF')
    gradient.addColorStop(0.5, color)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}
```

### 패턴 4: 흐르는 리본 (Flowing Ribbon)

**용도**: 연결, 흐름, 움직임

```javascript
function drawFlowingRibbon(ctx, colors, amplitude, frequency) {
  const height = canvas.height
  const width = canvas.width

  colors.forEach((color, index) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 20
    ctx.lineCap = 'round'

    ctx.beginPath()
    const offsetY = height * 0.2 + index * height * 0.15
    const phase = index * Math.PI * 0.5

    for (let x = 0; x <= width; x += 5) {
      const y = offsetY + Math.sin(x * frequency + phase) * amplitude
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}
```

---

## 🖌️ Canvas 기법

### 1. 그라디언트 생성

#### 선형 그라디언트
```javascript
// 수직 (위 → 아래)
const verticalGrad = ctx.createLinearGradient(0, 0, 0, height)

// 수평 (왼쪽 → 오른쪽)
const horizontalGrad = ctx.createLinearGradient(0, 0, width, 0)

// 대각선
const diagonalGrad = ctx.createLinearGradient(0, 0, width, height)

// 색상 추가
verticalGrad.addColorStop(0, '#FFD700')
verticalGrad.addColorStop(0.5, '#FF69B4')
verticalGrad.addColorStop(1, '#E1BEE7')
```

#### 방사형 그라디언트
```javascript
// 중심 후광
const radialGrad = ctx.createRadialGradient(
  centerX, centerY, 0,           // 내부 원
  centerX, centerY, maxRadius    // 외부 원
)

radialGrad.addColorStop(0, '#FFFFFF')    // 중심: 순백
radialGrad.addColorStop(0.5, '#FFD700')  // 중간: 골드
radialGrad.addColorStop(1, '#FFA500')    // 외곽: 오렌지
```

### 2. 투명도 활용

```javascript
// 레이어 효과
ctx.globalAlpha = 0.3  // 30% 투명도
ctx.fillStyle = '#FFD700'
ctx.fillRect(0, 0, width, height)

ctx.globalAlpha = 1.0  // 원래대로
```

### 3. 합성 모드

```javascript
// 빛나는 효과
ctx.globalCompositeOperation = 'lighter'  // 밝기 더하기
ctx.fillStyle = '#FFD700'
ctx.arc(x, y, radius, 0, Math.PI * 2)
ctx.fill()

// 원래대로
ctx.globalCompositeOperation = 'source-over'
```

### 4. 그림자 효과

```javascript
// 부드러운 그림자
ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
ctx.shadowBlur = 10
ctx.shadowOffsetX = 0
ctx.shadowOffsetY = 4

// 빛나는 후광
ctx.shadowColor = 'rgba(255, 215, 0, 0.8)'
ctx.shadowBlur = 20
ctx.shadowOffsetX = 0
ctx.shadowOffsetY = 0
```

---

## 📖 단어별 디자인 전략

### 신성/하나님 관련 단어

**색상**: 골드, 화이트, 오렌지
**패턴**: 방사형 후광, 십자가, 별
**효과**: 빛나는 그림자, 다층 후광

```javascript
// 예: אֱלֹהִים (엘로힘 - 하나님)
- 순백 배경
- 황금 방사형 후광 (3-5겹)
- 중앙에 빛나는 별 또는 십자가
- 황금 빛 그림자
```

### 창조/시작 관련 단어

**색상**: 골드, 핑크, 블루, 그린
**패턴**: 폭발하는 입자, 파동
**효과**: 에너지 흐름, 다채로운 입자

```javascript
// 예: בָּרָא (바라 - 창조하다)
- 파스텔 그라디언트 배경
- 중심에서 폭발하는 다채로운 입자
- 파동 효과
- 빛나는 중심핵
```

### 자연/땅 관련 단어

**색상**: 그린, 브라운(밝게), 블루
**패턴**: 언덕, 나무, 꽃, 태양
**효과**: 지평선, 자연 요소

```javascript
// 예: הָאָרֶץ (하아레츠 - 땅)
- 스카이블루 → 그린 그라디언트
- 언덕 실루엣
- 나무와 꽃
- 밝은 태양
```

### 하늘/공간 관련 단어

**색상**: 스카이블루, 화이트, 라벤더
**패턴**: 구름, 별, 빛
**효과**: 부드러운 구름, 반짝이는 별

```javascript
// 예: הַשָּׁמַיִם (하샤마임 - 하늘)
- 밝은 블루 그라디언트
- 흰 구름
- 반짝이는 별
- 햇빛 효과
```

### 연결/관계 단어

**색상**: 파스텔 무지개 색상
**패턴**: 흐르는 리본, 연결선
**효과**: 유기적 곡선, 연결점

```javascript
// 예: אֵת (에트 - 목적격 조사)
- 파스텔 그라디언트 배경
- 여러 색상의 흐르는 리본
- 빛나는 연결점
```

---

## ✅ 품질 기준

### 기술 요구사항

| 항목 | 기준 | 비고 |
|------|------|------|
| **해상도** | 512x512px | 표준 크기 |
| **포맷** | JPG | quality: 95 |
| **파일 크기** | 15-50 KB | 최적화 |
| **색상 프로파일** | sRGB | 웹 표준 |

### 디자인 체크리스트

- [ ] **파스텔 색감**: 모든 색상이 밝고 부드러운가?
- [ ] **화려함**: 2개 이상의 그라디언트 사용했는가?
- [ ] **밝은 색상**: 어두운 색상이 없는가?
- [ ] **예술적 표현**: 단어의 의미를 창의적으로 표현했는가?
- [ ] **입체감**: 레이어, 그림자로 깊이감이 있는가?
- [ ] **균형**: 전체적으로 조화로운가?
- [ ] **독창성**: 다른 아이콘과 구별되는가?

### 금지 사항

❌ **절대 사용 금지**:
- 검은색 (`#000000`)
- 진한 회색 (`#1C1C1C`, `#2C2C2C` 등)
- 진한 네이비 (`#000428`, `#001a33` 등)
- 진한 브라운 (`#3E2723` 등)
- 모든 어두운 계열 색상

✅ **대신 사용**:
- 밝은 그레이 (`#D3D3D3`, `#E5E5E5`)
- 밝은 브라운 (`#D2691E`, `#CD853F`)
- 파스텔 네이비 (`#B0C4DE`)

---

## 🎯 성공 사례

### 우수 사례 1: בְּרֵאשִׁית (베레시트 - 태초에)

**색상**: 골드 → 오렌지 → 피치
**패턴**: 방사형 태양, 방사선, 별
**효과**: 다층 후광, 빛나는 중심

**특징**:
- ✅ 파스텔 배경 (#FFF9E6)
- ✅ 화려한 황금 후광
- ✅ 밝고 따뜻한 느낌
- ✅ 시작의 찬란함 표현

### 우수 사례 2: בָּרָא (바라 - 창조하다)

**색상**: 핑크, 블루, 골드, 퍼플
**패턴**: 폭발하는 입자, 파동
**효과**: 에너지 입자, 다채로운 그라디언트

**특징**:
- ✅ 다채로운 색상 (4가지)
- ✅ 역동적인 구성
- ✅ 창조의 에너지 표현
- ✅ 입자 효과로 생동감

---

## 🔧 개발 도구

### 스크립트 실행

```bash
# JPG 아이콘 생성
npx tsx scripts/icons/generateDirectJpg.ts

# 단일 단어 테스트
npx tsx scripts/icons/generateDirectJpg.ts --word="בְּרֵאשִׁית"
```

### 색상 테스트

```javascript
// 색상 밝기 확인
function testColorBrightness(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  console.log(`${hex}: ${brightness}/255 (${brightness > 180 ? '✅' : '❌'})`)
}
```

---

## 📚 참고 자료

### Canvas API
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Canvas Gradients](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)

### 색상 이론
- [Pastel Color Palette](https://colorhunt.co/palettes/pastel)
- [Color Psychology](https://www.colorpsychology.org/)

### 디자인 영감
- [Dribbble Pastel Icons](https://dribbble.com/tags/pastel-icons)
- [Behance Icon Design](https://www.behance.net/search/projects?search=pastel+icons)

---

**최종 업데이트**: 2025-10-25
**작성자**: Claude Code
**버전**: 1.0 (JPG 직접 생성)
