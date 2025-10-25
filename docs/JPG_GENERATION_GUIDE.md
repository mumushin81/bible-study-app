# 🖼️ JPG 아이콘 생성 실무 가이드

**최종 업데이트**: 2025-10-25
**대상**: 개발자
**목적**: Canvas API로 직접 JPG 아이콘 생성하기

---

## 📋 목차

1. [빠른 시작](#빠른-시작)
2. [기본 구조](#기본-구조)
3. [단어별 렌더러 작성](#단어별-렌더러-작성)
4. [파스텔 색상 활용](#파스텔-색상-활용)
5. [화려한 효과 추가](#화려한-효과-추가)
6. [예술적 패턴 라이브러리](#예술적-패턴-라이브러리)
7. [테스트 및 검증](#테스트-및-검증)

---

## 🚀 빠른 시작

### 설치

```bash
npm install canvas
```

### 기본 사용법

```bash
# 전체 단어 생성
npx tsx scripts/icons/generateDirectJpg.ts

# 결과 확인
ls -lh output/direct_jpg/
```

---

## 🏗️ 기본 구조

### 1. Canvas 생성

```typescript
import { createCanvas } from 'canvas'

const canvas = createCanvas(512, 512)
const ctx = canvas.getContext('2d')
```

### 2. 렌더링 함수 작성

```typescript
function drawMyWord(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width

  // 1. 배경 그리기
  drawBackground(ctx, size)

  // 2. 메인 요소 그리기
  drawMainElement(ctx, size)

  // 3. 장식 요소 추가
  drawDecorations(ctx, size)
}
```

### 3. JPG 저장

```typescript
const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 })
writeFileSync('output.jpg', jpgBuffer)
```

---

## 🎨 단어별 렌더러 작성

### 템플릿 구조

```typescript
/**
 * [히브리어] ([의미])
 * 색상: [주요 색상]
 * 패턴: [디자인 패턴]
 */
function draw단어명(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 1단계: 배경
  // ━━━━━━━━━━━━━━━━━━━━━━
  const bgGradient = ctx.createLinearGradient(0, 0, 0, size)
  bgGradient.addColorStop(0, '#파스텔색1')
  bgGradient.addColorStop(1, '#파스텔색2')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 2단계: 메인 요소
  // ━━━━━━━━━━━━━━━━━━━━━━
  const mainGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, size * 0.3
  )
  mainGradient.addColorStop(0, '#화려한색1')
  mainGradient.addColorStop(1, '#화려한색2')

  ctx.fillStyle = mainGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 3단계: 장식 요소
  // ━━━━━━━━━━━━━━━━━━━━━━
  // ... 추가 디테일
}
```

### 실제 예시: "태초에" (בְּרֵאשִׁית)

```typescript
function drawBereshit(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 배경: 따뜻한 골드 그라디언트
  // ━━━━━━━━━━━━━━━━━━━━━━
  const bgGradient = ctx.createLinearGradient(0, 0, 0, size)
  bgGradient.addColorStop(0, '#FFF9E6')  // 파스텔 크림
  bgGradient.addColorStop(0.5, '#FFE5B4') // 파스텔 피치
  bgGradient.addColorStop(1, '#FFD700')   // 골드

  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 태양 후광 (5겹)
  // ━━━━━━━━━━━━━━━━━━━━━━
  for (let i = 5; i > 0; i--) {
    const haloGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, size * 0.15 * i
    )
    haloGradient.addColorStop(0, '#FFD700')
    haloGradient.addColorStop(0.5, '#FFA500')
    haloGradient.addColorStop(1, 'rgba(255, 165, 0, 0)')

    ctx.fillStyle = haloGradient
    ctx.fillRect(0, 0, size, size)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 방사선 (12개)
  // ━━━━━━━━━━━━━━━━━━━━━━
  ctx.save()
  ctx.translate(centerX, centerY)

  for (let i = 0; i < 12; i++) {
    ctx.rotate((Math.PI * 2) / 12)

    const rayGradient = ctx.createLinearGradient(0, 0, size * 0.4, 0)
    rayGradient.addColorStop(0, '#FFD700')
    rayGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')

    ctx.fillStyle = rayGradient
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.05)
    ctx.lineTo(size * 0.4, -size * 0.02)
    ctx.lineTo(size * 0.4, size * 0.02)
    ctx.lineTo(0, size * 0.05)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 중앙 빛나는 구
  // ━━━━━━━━━━━━━━━━━━━━━━
  const sunGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, size * 0.15
  )
  sunGradient.addColorStop(0, '#FFFFFF')
  sunGradient.addColorStop(0.5, '#FFD700')
  sunGradient.addColorStop(1, '#FFA500')

  ctx.fillStyle = sunGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, size * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // ━━━━━━━━━━━━━━━━━━━━━━
  // 반짝이는 별들 (20개)
  // ━━━━━━━━━━━━━━━━━━━━━━
  for (let i = 0; i < 20; i++) {
    const sx = Math.random() * size
    const sy = Math.random() * size
    const starSize = Math.random() * 3 + 2

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(sx, sy, starSize, 0, Math.PI * 2)
    ctx.fill()
  }
}
```

---

## 🌈 파스텔 색상 활용

### 파스텔 색상 상수

```typescript
const PASTEL_COLORS = {
  // 핑크 계열
  pink: '#FFB6C1',
  lightPink: '#FFC0CB',
  lavenderBlush: '#FFF0F5',

  // 블루 계열
  skyBlue: '#87CEEB',
  powderBlue: '#B0E0E6',
  aliceBlue: '#F0F8FF',

  // 그린 계열
  lightGreen: '#90EE90',
  paleGreen: '#98FB98',
  mintCream: '#F5FFFA',

  // 옐로우/골드 계열
  lemonChiffon: '#FFFACD',
  lightGoldenrod: '#FAFAD2',
  peach: '#FFE5B4',

  // 퍼플 계열
  lavender: '#E1BEE7',
  plum: '#DDA0DD',
  thistle: '#D8BFD8',

  // 오렌지 계열
  peachPuff: '#FFDAB9',
  coral: '#FFB6A3',
  lightSalmon: '#FFA07A',

  // 화이트 계열
  white: '#FFFFFF',
  ivory: '#FFFFF0',
  seashell: '#FFF5EE'
} as const
```

### 파스텔 그라디언트 생성

```typescript
function createPastelGradient(
  ctx: CanvasRenderingContext2D,
  type: 'linear' | 'radial',
  colors: string[]
) {
  let gradient

  if (type === 'linear') {
    gradient = ctx.createLinearGradient(0, 0, 0, 512)
  } else {
    gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
  }

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })

  return gradient
}

// 사용 예
const pastelBg = createPastelGradient(ctx, 'linear', [
  PASTEL_COLORS.lavenderBlush,
  PASTEL_COLORS.peach,
  PASTEL_COLORS.lightGoldenrod
])
```

### 색상 밝게 만들기

```typescript
/**
 * 어떤 색상이든 파스텔로 변환
 */
function toPastel(hex: string, whiteMix: number = 0.5): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const pr = Math.round(r + (255 - r) * whiteMix)
  const pg = Math.round(g + (255 - g) * whiteMix)
  const pb = Math.round(b + (255 - b) * whiteMix)

  return `#${pr.toString(16).padStart(2, '0')}${pg.toString(16).padStart(2, '0')}${pb.toString(16).padStart(2, '0')}`
}

// 사용 예
const darkRed = '#8B0000'
const pastelRed = toPastel(darkRed, 0.7)  // '#E5B8B8'
```

---

## ✨ 화려한 효과 추가

### 1. 다층 후광

```typescript
function drawMultiLayerHalo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxRadius: number,
  colors: string[]
) {
  for (let i = colors.length; i > 0; i--) {
    const gradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, maxRadius * (i / colors.length)
    )

    gradient.addColorStop(0, colors[i - 1])
    gradient.addColorStop(0.5, colors[i - 1])
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
  }
}

// 사용 예
drawMultiLayerHalo(ctx, 256, 256, 200, [
  '#FFD700',  // 골드
  '#FF69B4',  // 핑크
  '#87CEEB',  // 스카이블루
  '#E1BEE7'   // 라벤더
])
```

### 2. 빛나는 입자

```typescript
function drawGlowingParticles(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  count: number,
  colors: string[]
) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const distance = 100 + Math.random() * 100
    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance
    const size = Math.random() * 8 + 4
    const color = colors[i % colors.length]

    // 빛나는 그라디언트
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

### 3. 무지개 리본

```typescript
function drawRainbowRibbon(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  amplitude: number = 40
) {
  colors.forEach((color, index) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 20
    ctx.lineCap = 'round'

    ctx.beginPath()
    const offsetY = 100 + index * 80
    const phase = index * Math.PI * 0.5

    for (let x = 0; x <= 512; x += 5) {
      const y = offsetY + Math.sin(x * 0.02 + phase) * amplitude
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.stroke()
  })
}

// 사용 예
drawRainbowRibbon(ctx, [
  PASTEL_COLORS.pink,
  PASTEL_COLORS.skyBlue,
  PASTEL_COLORS.lightGoldenrod,
  PASTEL_COLORS.lavender
])
```

---

## 🎭 예술적 패턴 라이브러리

### 패턴 1: 신성한 십자가

```typescript
function drawDivineCross(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string
) {
  ctx.save()
  ctx.translate(centerX, centerY)

  // 수직선
  const vertGrad = ctx.createLinearGradient(0, -size, 0, size)
  vertGrad.addColorStop(0, 'rgba(255, 215, 0, 0)')
  vertGrad.addColorStop(0.5, color)
  vertGrad.addColorStop(1, 'rgba(255, 215, 0, 0)')

  ctx.fillStyle = vertGrad
  ctx.fillRect(-size * 0.06, -size, size * 0.12, size * 2)

  // 수평선
  const horizGrad = ctx.createLinearGradient(-size, 0, size, 0)
  horizGrad.addColorStop(0, 'rgba(255, 215, 0, 0)')
  horizGrad.addColorStop(0.5, color)
  horizGrad.addColorStop(1, 'rgba(255, 215, 0, 0)')

  ctx.fillStyle = horizGrad
  ctx.fillRect(-size, -size * 0.06, size * 2, size * 0.12)

  ctx.restore()
}
```

### 패턴 2: 구름

```typescript
function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()

  // 구름은 여러 원으로 구성
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.arc(x + radius * 0.7, y - radius * 0.3, radius * 0.8, 0, Math.PI * 2)
  ctx.arc(x - radius * 0.7, y - radius * 0.3, radius * 0.8, 0, Math.PI * 2)
  ctx.arc(x + radius * 0.4, y + radius * 0.3, radius * 0.6, 0, Math.PI * 2)
  ctx.arc(x - radius * 0.4, y + radius * 0.3, radius * 0.6, 0, Math.PI * 2)

  ctx.fill()

  // 그림자 효과
  ctx.fillStyle = 'rgba(200, 220, 255, 0.5)'
  ctx.beginPath()
  ctx.arc(x, y + radius * 0.2, radius * 0.8, 0, Math.PI * 2)
  ctx.fill()
}
```

### 패턴 3: 나무

```typescript
function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  // 줄기
  ctx.fillStyle = '#D2691E'  // 밝은 브라운
  ctx.fillRect(x - size * 0.2, y, size * 0.4, size * 2)

  // 잎사귀 (파스텔 그린)
  ctx.fillStyle = '#90EE90'
  ctx.beginPath()
  ctx.arc(x, y - size, size * 1.5, 0, Math.PI * 2)
  ctx.arc(x - size, y - size * 0.5, size * 1.2, 0, Math.PI * 2)
  ctx.arc(x + size, y - size * 0.5, size * 1.2, 0, Math.PI * 2)
  ctx.fill()

  // 하이라이트
  ctx.fillStyle = 'rgba(200, 255, 200, 0.6)'
  ctx.beginPath()
  ctx.arc(x - size * 0.5, y - size * 1.2, size * 0.8, 0, Math.PI * 2)
  ctx.fill()
}
```

### 패턴 4: 꽃

```typescript
function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  petalColor: string
) {
  // 줄기
  ctx.strokeStyle = '#90EE90'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + size * 2)
  ctx.stroke()

  // 꽃잎 (5개)
  ctx.fillStyle = petalColor
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    const petalX = x + Math.cos(angle) * size * 0.8
    const petalY = y + Math.sin(angle) * size * 0.8

    ctx.beginPath()
    ctx.arc(petalX, petalY, size * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }

  // 중심
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
  ctx.fill()
}
```

### 패턴 5: 별

```typescript
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  points: number,
  innerRadius: number
) {
  ctx.beginPath()

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? radius : innerRadius
    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r

    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }

  ctx.closePath()
}

// 사용 예: 빛나는 별
function drawGlowingStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  // 후광
  const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
  glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.5)')
  glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)')

  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(x, y, size * 2, 0, Math.PI * 2)
  ctx.fill()

  // 별
  ctx.fillStyle = '#FFD700'
  drawStar(ctx, x, y, size, 5, size * 0.4)
  ctx.fill()

  // 하이라이트
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(x, y, size * 0.3, 0, Math.PI * 2)
  ctx.fill()
}
```

---

## ✅ 테스트 및 검증

### 단일 단어 테스트

```typescript
// 테스트 스크립트 예시
const testWord: WordInfo = {
  hebrew: 'בְּרֵאשִׁית',
  meaning: '태초에',
  korean: '베레시트'
}

const canvas = createCanvas(512, 512)
drawBereshit(canvas)

const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 })
writeFileSync('test_bereshit.jpg', buffer)

console.log('✅ 테스트 이미지 생성 완료')
```

### 색상 밝기 검증

```typescript
function validateBrightness(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  if (brightness < 180) {
    console.warn(`⚠️  색상 ${hex}가 너무 어둡습니다 (${brightness}/255)`)
    return false
  }

  console.log(`✅ 색상 ${hex} 밝기 검증 통과 (${brightness}/255)`)
  return true
}

// 모든 색상 검증
Object.entries(PASTEL_COLORS).forEach(([name, color]) => {
  validateBrightness(color)
})
```

### 파일 크기 확인

```typescript
function checkFileSize(filepath: string) {
  const stats = statSync(filepath)
  const sizeKB = stats.size / 1024

  if (sizeKB > 50) {
    console.warn(`⚠️  파일 크기가 큽니다: ${sizeKB.toFixed(1)} KB`)
  } else if (sizeKB < 15) {
    console.warn(`⚠️  파일 크기가 작습니다: ${sizeKB.toFixed(1)} KB (품질 낮을 수 있음)`)
  } else {
    console.log(`✅ 파일 크기 적정: ${sizeKB.toFixed(1)} KB`)
  }
}
```

---

## 🔧 유틸리티 함수

### 헬퍼 함수들

```typescript
/**
 * 선형 그라디언트 쉽게 만들기
 */
function easyLinearGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  direction: 'vertical' | 'horizontal' | 'diagonal' = 'vertical'
): CanvasGradient {
  let x0 = 0, y0 = 0, x1 = 0, y1 = 512

  if (direction === 'horizontal') {
    x1 = 512
    y1 = 0
  } else if (direction === 'diagonal') {
    x1 = 512
    y1 = 512
  }

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })

  return gradient
}

/**
 * 방사형 그라디언트 쉽게 만들기
 */
function easyRadialGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colors: string[],
  radius: number = 256
): CanvasGradient {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })

  return gradient
}

/**
 * 투명도와 함께 색상 반환
 */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
```

---

## 📚 실전 예제 모음

### 예제 1: 생명 (חַי)

```typescript
function drawLife(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width

  // 배경: 핑크 → 피치
  const bg = easyLinearGradient(ctx, [
    PASTEL_COLORS.lavenderBlush,
    PASTEL_COLORS.peach
  ])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 심장 모양 (심플하게 두 원 + 삼각형)
  const heartGrad = easyRadialGradient(ctx, size / 2, size / 2, [
    '#FFB6C1',
    '#FF69B4'
  ], 150)

  ctx.fillStyle = heartGrad
  // 왼쪽 원
  ctx.beginPath()
  ctx.arc(size * 0.4, size * 0.4, size * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // 오른쪽 원
  ctx.beginPath()
  ctx.arc(size * 0.6, size * 0.4, size * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // 하단 삼각형
  ctx.beginPath()
  ctx.moveTo(size * 0.27, size * 0.47)
  ctx.lineTo(size * 0.5, size * 0.7)
  ctx.lineTo(size * 0.73, size * 0.47)
  ctx.fill()
}
```

### 예제 2: 빛 (אוֹר)

```typescript
function drawLight(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2

  // 배경: 순백
  ctx.fillStyle = '#FFFACD'
  ctx.fillRect(0, 0, size, size)

  // 빛의 방사 (여러 겹)
  for (let i = 5; i > 0; i--) {
    const lightGrad = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, size * 0.1 * i
    )

    lightGrad.addColorStop(0, '#FFFFFF')
    lightGrad.addColorStop(0.3, '#FFD700')
    lightGrad.addColorStop(1, withAlpha('#FFD700', 0))

    ctx.fillStyle = lightGrad
    ctx.fillRect(0, 0, size, size)
  }

  // 빛줄기
  ctx.save()
  ctx.translate(centerX, centerY)

  for (let i = 0; i < 8; i++) {
    ctx.rotate((Math.PI * 2) / 8)

    const rayGrad = ctx.createLinearGradient(0, 0, size * 0.5, 0)
    rayGrad.addColorStop(0, '#FFFFFF')
    rayGrad.addColorStop(1, withAlpha('#FFFFFF', 0))

    ctx.fillStyle = rayGrad
    ctx.fillRect(0, -size * 0.02, size * 0.5, size * 0.04)
  }

  ctx.restore()
}
```

---

## 🎯 체크리스트

새 렌더러 작성 시 확인:

- [ ] 파스텔 색상만 사용 (밝기 > 180)
- [ ] 2개 이상의 그라디언트 사용
- [ ] 배경도 밝은 색상
- [ ] 입체감 있는 레이어 구성
- [ ] 단어 의미와 일치하는 디자인
- [ ] 파일 크기 15-50 KB
- [ ] 512x512 해상도
- [ ] Quality 95로 저장

---

**최종 업데이트**: 2025-10-25
**작성자**: Claude Code
**버전**: 1.0 (Canvas API)
