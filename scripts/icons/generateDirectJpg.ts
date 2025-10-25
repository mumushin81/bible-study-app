#!/usr/bin/env tsx

/**
 * Canvas API로 직접 JPG 이미지 생성
 * - 외부 API 없이 프로그래밍으로 직접 그림
 * - 밝고 화려한 색상만 사용
 * - 각 단어의 의미를 시각적으로 표현
 */

import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  ipa?: string
  context?: string
}

interface GenerateOptions {
  outputDir?: string
  size?: number
  quality?: number
}

/**
 * 히브리어를 파일명으로 변환
 */
function hebrewToFilename(hebrew: string): string {
  const mappings: Record<string, string> = {
    'בְּרֵאשִׁית': 'bereshit',
    'בָּרָא': 'bara',
    'אֱלֹהִים': 'elohim',
    'אֵת': 'et',
    'הַשָּׁמַיִם': 'hashamayim',
    'וְאֵת': 'veet',
    'הָאָרֶץ': 'haaretz',
  }

  // 니쿠드 제거
  const normalized = hebrew.replace(/[\u0591-\u05C7]/g, '')

  for (const [key, value] of Object.entries(mappings)) {
    const normalizedKey = key.replace(/[\u0591-\u05C7]/g, '')
    if (normalized === normalizedKey || hebrew === key) {
      return value
    }
  }

  return 'word_' + Math.random().toString(36).substring(2, 8)
}

/**
 * 방사형 그라디언트 그리기
 */
function drawRadialGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  colors: string[]
) {
  const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius)

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })

  return gradient
}

/**
 * 선형 그라디언트 그리기
 */
function drawLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colors: string[]
) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })

  return gradient
}

/**
 * 별 그리기
 */
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
    if (i === 0) {
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }
  }
  ctx.closePath()
}

/**
 * בְּרֵאשִׁית (bereshit) - "태초에"
 * 빛나는 새벽, 시작의 찬란함
 */
function drawBereshit(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width

  // 배경: 따뜻한 골드 그라디언트
  const bgGradient = drawLinearGradient(ctx, 0, 0, 0, size, [
    '#FFF9E6',
    '#FFE5B4',
    '#FFD700'
  ])
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  // 중앙 태양
  const centerX = size / 2
  const centerY = size / 2

  // 태양 후광 (여러 겹)
  for (let i = 5; i > 0; i--) {
    const haloGradient = drawRadialGradient(
      ctx,
      centerX,
      centerY,
      0,
      size * 0.15 * i,
      ['#FFD700', '#FFA500', 'rgba(255, 165, 0, 0)']
    )
    ctx.fillStyle = haloGradient
    ctx.fillRect(0, 0, size, size)
  }

  // 방사선
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

  // 중앙 빛나는 구
  const sunGradient = drawRadialGradient(
    ctx,
    centerX,
    centerY,
    0,
    size * 0.15,
    ['#FFFFFF', '#FFD700', '#FFA500']
  )
  ctx.fillStyle = sunGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, size * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // 반짝이는 별들
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

/**
 * בָּרָא (bara) - "창조하다"
 * 폭발적인 창조의 에너지
 */
function drawBara(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2

  // 배경: 밝은 파스텔 그라디언트
  const bgGradient = drawRadialGradient(
    ctx,
    centerX,
    centerY,
    0,
    size,
    ['#FFFFFF', '#FFE5B4', '#FFD580']
  )
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  // 창조의 폭발 - 방사형 파동
  for (let i = 8; i > 0; i--) {
    const waveGradient = drawRadialGradient(
      ctx,
      centerX,
      centerY,
      size * 0.1 * i,
      size * 0.15 * i,
      i % 2 === 0
        ? ['#FF69B4', 'rgba(255, 105, 180, 0)']
        : ['#4FC3F7', 'rgba(79, 195, 247, 0)']
    )
    ctx.fillStyle = waveGradient
    ctx.fillRect(0, 0, size, size)
  }

  // 에너지 입자들
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2
    const distance = size * 0.2 + Math.random() * size * 0.2
    const px = centerX + Math.cos(angle) * distance
    const py = centerY + Math.sin(angle) * distance
    const particleSize = Math.random() * 8 + 4

    const colors = ['#FF69B4', '#4FC3F7', '#FFD700', '#7B68EE', '#2ECC71']
    ctx.fillStyle = colors[i % colors.length]
    ctx.beginPath()
    ctx.arc(px, py, particleSize, 0, Math.PI * 2)
    ctx.fill()

    // 빛나는 효과
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.beginPath()
    ctx.arc(px, py, particleSize * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 중앙 핵
  const coreGradient = drawRadialGradient(
    ctx,
    centerX,
    centerY,
    0,
    size * 0.1,
    ['#FFFFFF', '#FFD700', '#FF69B4']
  )
  ctx.fillStyle = coreGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, size * 0.1, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * אֱלֹהִים (elohim) - "하나님"
 * 신성한 후광과 거룩함
 */
function drawElohim(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2

  // 배경: 순백의 신성한 빛
  const bgGradient = drawRadialGradient(
    ctx,
    centerX,
    centerY,
    0,
    size,
    ['#FFFFFF', '#FFF9E6', '#FFE5B4']
  )
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  // 여러 겹의 황금 후광
  for (let i = 5; i > 0; i--) {
    const haloGradient = drawRadialGradient(
      ctx,
      centerX,
      centerY,
      size * 0.1 * i,
      size * 0.12 * i,
      ['#FFD700', 'rgba(255, 215, 0, 0)']
    )
    ctx.fillStyle = haloGradient
    ctx.fillRect(0, 0, size, size)
  }

  // 빛의 십자가
  ctx.save()
  ctx.translate(centerX, centerY)

  // 수직선
  const vertGradient = ctx.createLinearGradient(0, -size * 0.35, 0, size * 0.35)
  vertGradient.addColorStop(0, 'rgba(255, 215, 0, 0)')
  vertGradient.addColorStop(0.5, '#FFD700')
  vertGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
  ctx.fillStyle = vertGradient
  ctx.fillRect(-size * 0.03, -size * 0.35, size * 0.06, size * 0.7)

  // 수평선
  const horizGradient = ctx.createLinearGradient(-size * 0.35, 0, size * 0.35, 0)
  horizGradient.addColorStop(0, 'rgba(255, 215, 0, 0)')
  horizGradient.addColorStop(0.5, '#FFD700')
  horizGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
  ctx.fillStyle = horizGradient
  ctx.fillRect(-size * 0.35, -size * 0.03, size * 0.7, size * 0.06)

  ctx.restore()

  // 중앙 별 (다윗의 별)
  ctx.save()
  ctx.translate(centerX, centerY)

  // 두 개의 삼각형
  for (let tri = 0; tri < 2; tri++) {
    ctx.rotate((tri * Math.PI) / 3)
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2
      const x = Math.cos(angle) * size * 0.1
      const y = Math.sin(angle) * size * 0.1
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()

  // 빛나는 점들
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const distance = size * 0.35
    const px = centerX + Math.cos(angle) * distance
    const py = centerY + Math.sin(angle) * distance

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(px, py, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * הַשָּׁמַיִם (hashamayim) - "하늘"
 * 푸른 하늘과 구름
 */
function drawHashamayim(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width

  // 배경: 밝은 하늘 그라디언트
  const skyGradient = drawLinearGradient(ctx, 0, 0, 0, size, [
    '#4FC3F7',
    '#87CEEB',
    '#B0E0E6',
    '#E0F6FF'
  ])
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, size, size)

  // 햇빛 효과
  const sunGradient = drawRadialGradient(
    ctx,
    size * 0.8,
    size * 0.2,
    0,
    size * 0.4,
    ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0)']
  )
  ctx.fillStyle = sunGradient
  ctx.fillRect(0, 0, size, size)

  // 구름들
  const clouds = [
    { x: size * 0.2, y: size * 0.25, scale: 1 },
    { x: size * 0.6, y: size * 0.4, scale: 1.2 },
    { x: size * 0.4, y: size * 0.65, scale: 0.9 },
    { x: size * 0.75, y: size * 0.7, scale: 1.1 }
  ]

  clouds.forEach(cloud => {
    drawCloud(ctx, cloud.x, cloud.y, size * 0.15 * cloud.scale)
  })

  // 반짝이는 별들
  for (let i = 0; i < 15; i++) {
    const sx = Math.random() * size
    const sy = Math.random() * size * 0.5
    const starSize = Math.random() * 2 + 1

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    drawStar(ctx, sx, sy, starSize, 5, starSize * 0.4)
    ctx.fill()
  }
}

/**
 * 구름 그리기
 */
function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'

  // 구름은 여러 원으로 구성
  ctx.beginPath()
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

/**
 * הָאָרֶץ (haaretz) - "땅"
 * 푸른 대지와 생명
 */
function drawHaaretz(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width

  // 배경: 하늘에서 땅으로
  const bgGradient = drawLinearGradient(ctx, 0, 0, 0, size, [
    '#87CEEB',
    '#98FB98',
    '#90EE90',
    '#7FE5A8'
  ])
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  // 지평선
  const horizonY = size * 0.6
  ctx.fillStyle = '#2ECC71'
  ctx.fillRect(0, horizonY, size, size - horizonY)

  // 언덕들
  const hills = [
    { x: size * 0.2, y: horizonY, width: size * 0.4, height: size * 0.15, color: '#4CAF50' },
    { x: size * 0.5, y: horizonY, width: size * 0.5, height: size * 0.2, color: '#2ECC71' },
    { x: size * 0, y: horizonY, width: size * 0.3, height: size * 0.1, color: '#7FE5A8' }
  ]

  hills.forEach(hill => {
    ctx.fillStyle = hill.color
    ctx.beginPath()
    ctx.moveTo(hill.x, hill.y)
    ctx.quadraticCurveTo(
      hill.x + hill.width / 2,
      hill.y - hill.height,
      hill.x + hill.width,
      hill.y
    )
    ctx.lineTo(hill.x + hill.width, size)
    ctx.lineTo(hill.x, size)
    ctx.closePath()
    ctx.fill()
  })

  // 태양
  const sunGradient = drawRadialGradient(
    ctx,
    size * 0.75,
    size * 0.3,
    0,
    size * 0.1,
    ['#FFFFFF', '#FFD700', '#FFA500']
  )
  ctx.fillStyle = sunGradient
  ctx.beginPath()
  ctx.arc(size * 0.75, size * 0.3, size * 0.1, 0, Math.PI * 2)
  ctx.fill()

  // 나무들
  for (let i = 0; i < 5; i++) {
    const treeX = size * 0.15 + i * size * 0.15
    const treeY = size * 0.7
    drawTree(ctx, treeX, treeY, size * 0.05)
  }

  // 꽃들
  for (let i = 0; i < 10; i++) {
    const flowerX = Math.random() * size
    const flowerY = size * 0.75 + Math.random() * size * 0.2
    const colors = ['#FF69B4', '#FFD700', '#FF6347', '#BA68C8']
    drawFlower(ctx, flowerX, flowerY, 5, colors[i % colors.length])
  }
}

/**
 * 나무 그리기
 */
function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // 줄기
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(x - size * 0.2, y, size * 0.4, size * 2)

  // 잎사귀 (3개 원)
  ctx.fillStyle = '#2ECC71'
  ctx.beginPath()
  ctx.arc(x, y - size, size * 1.5, 0, Math.PI * 2)
  ctx.arc(x - size, y - size * 0.5, size * 1.2, 0, Math.PI * 2)
  ctx.arc(x + size, y - size * 0.5, size * 1.2, 0, Math.PI * 2)
  ctx.fill()

  // 밝은 하이라이트
  ctx.fillStyle = 'rgba(127, 229, 168, 0.6)'
  ctx.beginPath()
  ctx.arc(x - size * 0.5, y - size * 1.2, size * 0.8, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * 꽃 그리기
 */
function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  // 줄기
  ctx.strokeStyle = '#2ECC71'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + size * 2)
  ctx.stroke()

  // 꽃잎들
  ctx.fillStyle = color
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

/**
 * אֵת (et) / וְאֵת (veet) - 목적격 조사
 * 연결과 흐름
 */
function drawConnector(canvas: Canvas) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width

  // 배경: 부드러운 파스텔 그라디언트
  const bgGradient = drawLinearGradient(ctx, 0, 0, size, size, [
    '#E1BEE7',
    '#F3E5F5',
    '#FFF9E6',
    '#FFE5B4'
  ])
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  // 흐르는 리본
  ctx.save()
  ctx.lineWidth = size * 0.05

  const ribbonColors = ['#FF69B4', '#4FC3F7', '#FFD700', '#7B68EE']

  for (let r = 0; r < 4; r++) {
    ctx.strokeStyle = ribbonColors[r]
    ctx.beginPath()

    const offsetY = size * 0.2 + r * size * 0.15
    const offsetPhase = r * Math.PI * 0.5

    for (let x = 0; x <= size; x += 5) {
      const y = offsetY + Math.sin(x * 0.02 + offsetPhase) * size * 0.08
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  ctx.restore()

  // 연결점들
  for (let i = 0; i < 8; i++) {
    const x = size * 0.15 + i * size * 0.1
    const y = size * 0.3 + Math.sin(i * 0.5) * size * 0.2

    const dotGradient = drawRadialGradient(
      ctx,
      x,
      y,
      0,
      size * 0.04,
      ['#FFFFFF', ribbonColors[i % 4]]
    )
    ctx.fillStyle = dotGradient
    ctx.beginPath()
    ctx.arc(x, y, size * 0.04, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * 단어별 그리기 함수 매핑
 */
const WORD_RENDERERS: Record<string, (canvas: Canvas) => void> = {
  'bereshit': drawBereshit,
  'bara': drawBara,
  'elohim': drawElohim,
  'hashamayim': drawHashamayim,
  'haaretz': drawHaaretz,
  'et': drawConnector,
  'veet': drawConnector,
}

/**
 * JPG 아이콘 직접 생성
 */
export async function generateDirectJpg(
  word: WordInfo,
  options: GenerateOptions = {}
): Promise<string> {
  const {
    outputDir = join(process.cwd(), 'output', 'direct_jpg'),
    size = 512,
    quality = 95
  } = options

  const filename = hebrewToFilename(word.hebrew)
  const filepath = join(outputDir, filename + '.jpg')

  // 출력 디렉토리 생성
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`🎨 ${word.hebrew} (${word.meaning})`)
  console.log(`📝 파일명: ${filename}.jpg`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  try {
    // Canvas 생성
    const canvas = createCanvas(size, size)

    // 단어에 맞는 렌더러 선택
    const renderer = WORD_RENDERERS[filename] || drawBereshit

    console.log(`🖌️  Canvas로 직접 그리는 중...`)
    renderer(canvas)

    // JPG로 저장
    const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: quality / 100 })
    writeFileSync(filepath, jpgBuffer)

    console.log(`✅ JPG 저장: ${filepath}`)
    console.log(`📊 파일 크기: ${Math.round(jpgBuffer.length / 1024)} KB`)

    return filepath
  } catch (error: any) {
    console.error(`❌ 오류 발생: ${error.message}`)
    throw error
  }
}

/**
 * 일괄 생성
 */
export async function generateDirectJpgBatch(
  words: WordInfo[],
  options: GenerateOptions = {}
): Promise<string[]> {
  console.log(`\n🚀 ${words.length}개 JPG 직접 생성 시작\n`)

  const results: string[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    console.log(`\n[${i + 1}/${words.length}] 처리 중...`)

    try {
      const filepath = await generateDirectJpg(word, options)
      results.push(filepath)
    } catch (error: any) {
      console.error(`❌ 실패: ${word.hebrew}`)
      console.error(error.message)
      results.push(`ERROR: ${word.hebrew}`)
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 완료: ${results.filter(r => !r.startsWith('ERROR')).length}/${words.length}`)
  console.log(`❌ 실패: ${results.filter(r => r.startsWith('ERROR')).length}/${words.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return results
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 창세기 1:1 직접 JPG 생성기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ 특징:
- Canvas API로 직접 그림
- 외부 API 불필요
- 밝고 화려한 색상
- 각 단어의 의미를 시각적으로 표현

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)

  // 창세기 1:1 데이터 읽기
  import('./readGenesis1_1.js').then(async ({ genesis1_1Words }) => {
    const options: GenerateOptions = {
      outputDir: join(process.cwd(), 'output', 'direct_jpg'),
      size: 512,
      quality: 95
    }

    await generateDirectJpgBatch(genesis1_1Words, options)
    console.log('\n🎉 모든 JPG 직접 생성 완료!')
  }).catch(err => {
    console.error('\n❌ 오류 발생:', err)
    process.exit(1)
  })
}
