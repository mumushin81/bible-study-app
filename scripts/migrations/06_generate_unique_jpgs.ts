#!/usr/bin/env tsx

/**
 * 고유한 JPG 아이콘 생성 (중복 해결)
 * - 각 단어 ID를 해시하여 고유한 시각적 변형 생성
 * - 같은 카테고리라도 모두 다른 이미지
 */

import { createClient } from '@supabase/supabase-js'
import { createCanvas, Canvas } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const OUTPUT_DIR = join(process.cwd(), 'output', 'all_words_jpg_v2')

interface WordInfo {
  id: string
  hebrew: string
  meaning: string
  korean: string
  grammar?: string
}

interface VisualSeed {
  hue: number        // 0-360 (색상 변형)
  saturation: number // 0-1 (채도)
  brightness: number // 0-1 (밝기)
  seed1: number      // 0-1 (위치/크기)
  seed2: number      // 0-1 (각도/개수)
  seed3: number      // 0-1 (패턴 변형)
}

/**
 * 단어 ID를 해시하여 고유한 시각적 seeds 생성
 */
function generateVisualSeed(wordId: string): VisualSeed {
  const hash = createHash('md5').update(wordId).digest('hex')

  // 해시를 6개의 0-1 사이 숫자로 변환
  const values = []
  for (let i = 0; i < 6; i++) {
    const hex = hash.substring(i * 5, i * 5 + 5)
    values.push(parseInt(hex, 16) / 0xfffff)
  }

  return {
    hue: values[0] * 360,           // 0-360도
    saturation: 0.3 + values[1] * 0.4,  // 30-70%
    brightness: 0.7 + values[2] * 0.3,  // 70-100%
    seed1: values[3],
    seed2: values[4],
    seed3: values[5]
  }
}

/**
 * HSL to RGB 변환
 */
function hslToRgb(h: number, s: number, l: number): string {
  h = h / 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0
  if (h < 1/6) { r = c; g = x; b = 0 }
  else if (h < 2/6) { r = x; g = c; b = 0 }
  else if (h < 3/6) { r = 0; g = c; b = x }
  else if (h < 4/6) { r = 0; g = x; b = c }
  else if (h < 5/6) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 카테고리 판별
 */
function categorizeWord(meaning: string, korean: string): string {
  const text = (meaning + ' ' + korean).toLowerCase()

  if (text.match(/하나님|신|주|거룩|성전|제단/)) return 'divine'
  if (text.match(/하늘|궁창|공간|별|구름/)) return 'celestial'
  if (text.match(/땅|흙|대지|장소|지역/)) return 'earth'
  if (text.match(/물|바다|강|호수|샘/)) return 'water'
  if (text.match(/빛|밝|광명|햇빛/)) return 'light'
  if (text.match(/어둠|밤|어두/)) return 'darkness'
  if (text.match(/생명|탄생|낳|출산|아들|딸/)) return 'life'
  if (text.match(/창조|만들|형성|지으/)) return 'creation'
  if (text.match(/사람|인간|남자|여자|아담|이브/)) return 'person'
  if (text.match(/동물|짐승|새|물고기|생물/)) return 'animal'
  if (text.match(/나무|풀|식물|열매/)) return 'plant'
  if (text.match(/시간|날|년|때|처음|태초/)) return 'time'

  return 'default'
}

/**
 * 카테고리별 JPG 생성 (고유한 변형 적용)
 */
function generateUniqueJpg(canvas: Canvas, category: string, word: WordInfo) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2

  const seed = generateVisualSeed(word.id)

  switch (category) {
    case 'divine':
      drawDivinePattern(ctx, size, centerX, centerY, seed)
      break
    case 'celestial':
      drawCelestialPattern(ctx, size, centerX, centerY, seed)
      break
    case 'earth':
      drawEarthPattern(ctx, size, centerX, centerY, seed)
      break
    case 'water':
      drawWaterPattern(ctx, size, centerX, centerY, seed)
      break
    case 'light':
      drawLightPattern(ctx, size, centerX, centerY, seed)
      break
    case 'life':
      drawLifePattern(ctx, size, centerX, centerY, seed)
      break
    case 'creation':
      drawCreationPattern(ctx, size, centerX, centerY, seed)
      break
    default:
      drawDefaultPattern(ctx, size, centerX, centerY, seed)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 개선된 패턴 함수들 (고유성 추가)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function drawDivinePattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 고유 색상 생성 (금색 계열 유지하되 변형)
  const baseHue = 45 + (seed.hue % 60 - 30) // 금색 근처 (15-75)
  const color1 = hslToRgb(baseHue, seed.saturation, 0.95)
  const color2 = hslToRgb(baseHue, seed.saturation, 0.85)
  const color3 = hslToRgb(baseHue, seed.saturation * 0.8, 0.7)

  // 배경 그라디언트 (각도 변형)
  const angle = seed.seed1 * Math.PI * 2
  const x1 = cx + Math.cos(angle) * size
  const y1 = cy + Math.sin(angle) * size
  const x2 = cx - Math.cos(angle) * size
  const y2 = cy - Math.sin(angle) * size

  const bg = ctx.createLinearGradient(x1, y1, x2, y2)
  bg.addColorStop(0, color1)
  bg.addColorStop(1, color2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 후광 (개수와 크기 변형)
  const layers = 3 + Math.floor(seed.seed2 * 4) // 3-6겹
  for (let i = layers; i > 0; i--) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.1 * i * (1 + seed.seed3 * 0.5))
    grad.addColorStop(0, color3)
    grad.addColorStop(1, `rgba(255, 215, 0, 0)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }

  // 중앙 구 (위치 약간 변형)
  const offsetX = (seed.seed1 - 0.5) * size * 0.1
  const offsetY = (seed.seed2 - 0.5) * size * 0.1
  const sunX = cx + offsetX
  const sunY = cy + offsetY

  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, size * 0.12)
  sun.addColorStop(0, '#FFFFFF')
  sun.addColorStop(0.5, color3)
  sun.addColorStop(1, hslToRgb(baseHue, seed.saturation, 0.6))
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(sunX, sunY, size * 0.12 * (0.8 + seed.seed3 * 0.4), 0, Math.PI * 2)
  ctx.fill()
}

function drawCelestialPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 하늘색 계열 (변형)
  const baseHue = 200 + (seed.hue % 80 - 40) // 파란색 근처
  const color1 = hslToRgb(baseHue, seed.saturation, 0.85)
  const color2 = hslToRgb(baseHue, seed.saturation * 0.7, 0.9)

  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, color1)
  bg.addColorStop(1, color2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 구름 (위치와 크기 변형)
  const cloudCount = 2 + Math.floor(seed.seed1 * 3) // 2-4개
  for (let i = 0; i < cloudCount; i++) {
    const x = size * (0.2 + ((seed.seed1 + i * 0.3) % 1) * 0.6)
    const y = size * (0.2 + ((seed.seed2 + i * 0.25) % 1) * 0.5)
    const r = size * (0.05 + seed.seed3 * 0.05)
    drawCloud(ctx, x, y, r)
  }

  // 별 (개수와 위치 변형)
  const starCount = 8 + Math.floor(seed.seed2 * 15) // 8-22개
  for (let i = 0; i < starCount; i++) {
    const hash = createHash('md5').update(`${seed.seed1}${i}`).digest('hex')
    const x = (parseInt(hash.substring(0, 8), 16) / 0xffffffff) * size
    const y = (parseInt(hash.substring(8, 16), 16) / 0xffffffff) * size * 0.7
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + seed.seed3 * 0.4})`
    ctx.beginPath()
    ctx.arc(x, y, 1.5 + seed.seed3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawEarthPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 녹색 계열
  const skyHue = 190 + (seed.hue % 40 - 20)
  const earthHue = 120 + (seed.hue % 60 - 30)

  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, hslToRgb(skyHue, seed.saturation * 0.6, 0.85))
  bg.addColorStop(0.5, hslToRgb(earthHue, seed.saturation, 0.85))
  bg.addColorStop(1, hslToRgb(earthHue, seed.saturation, 0.75))
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 언덕 (곡선 변형)
  ctx.fillStyle = hslToRgb(earthHue, seed.saturation * 0.9, 0.7)
  ctx.beginPath()
  ctx.moveTo(0, size * (0.6 + seed.seed1 * 0.2))
  const cp1x = size * (0.2 + seed.seed2 * 0.2)
  const cp1y = size * (0.4 + seed.seed1 * 0.3)
  const midx = size * 0.5
  const midy = size * (0.65 + seed.seed3 * 0.15)
  ctx.quadraticCurveTo(cp1x, cp1y, midx, midy)

  const cp2x = size * (0.7 + seed.seed2 * 0.2)
  const cp2y = size * (0.8 + seed.seed1 * 0.15)
  ctx.quadraticCurveTo(cp2x, cp2y, size, size * (0.65 + seed.seed3 * 0.15))
  ctx.lineTo(size, size)
  ctx.lineTo(0, size)
  ctx.fill()

  // 태양 (위치 변형)
  const sunX = size * (0.65 + seed.seed1 * 0.25)
  const sunY = size * (0.15 + seed.seed2 * 0.2)
  const sunR = size * (0.06 + seed.seed3 * 0.04)

  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
  sun.addColorStop(0, '#FFFFFF')
  sun.addColorStop(0.5, hslToRgb(45, 0.9, 0.7))
  sun.addColorStop(1, hslToRgb(35, 0.8, 0.6))
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()
}

function drawWaterPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 물 색상
  const baseHue = 180 + (seed.hue % 60 - 30)
  const color1 = hslToRgb(baseHue, seed.saturation * 0.8, 0.7)
  const color2 = hslToRgb(baseHue, seed.saturation * 0.6, 0.85)

  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, color1)
  bg.addColorStop(1, color2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 물결 (개수와 진폭 변형)
  const waveCount = 2 + Math.floor(seed.seed1 * 3) // 2-4개
  for (let i = 0; i < waveCount; i++) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + seed.seed3 * 0.3})`
    ctx.lineWidth = 10 + seed.seed2 * 10
    ctx.lineCap = 'round'
    ctx.beginPath()

    const offsetY = size * (0.2 + i * 0.25 + seed.seed1 * 0.1)
    const frequency = 0.02 + seed.seed2 * 0.02
    const amplitude = 20 + seed.seed3 * 30

    for (let x = 0; x <= size; x += 5) {
      const y = offsetY + Math.sin(x * frequency + i + seed.seed1 * Math.PI) * amplitude
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

function drawLightPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 밝은 색상
  const baseHue = 50 + (seed.hue % 40 - 20)
  const bgColor = hslToRgb(baseHue, seed.saturation * 0.4, 0.95)

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  // 방사 (레이어 수와 색상 변형)
  const layers = 4 + Math.floor(seed.seed1 * 4) // 4-7겹
  for (let i = layers; i > 0; i--) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.08 * i)
    const hue = baseHue + (seed.seed2 - 0.5) * 20
    grad.addColorStop(0, '#FFFFFF')
    grad.addColorStop(0.5, hslToRgb(hue, seed.saturation * 0.9, 0.8))
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }
}

function drawLifePattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 핑크/생명색
  const baseHue = 330 + (seed.hue % 60 - 30)
  const color1 = hslToRgb(baseHue, seed.saturation * 0.3, 0.97)
  const color2 = hslToRgb(baseHue, seed.saturation * 0.6, 0.85)

  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, color1)
  bg.addColorStop(1, color2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 하트 (위치와 크기 변형)
  const heartX = cx + (seed.seed1 - 0.5) * size * 0.2
  const heartY = cy + (seed.seed2 - 0.5) * size * 0.2
  const heartR = size * (0.1 + seed.seed3 * 0.05)

  const heart = ctx.createRadialGradient(heartX, heartY, 0, heartX, heartY, heartR * 1.5)
  heart.addColorStop(0, hslToRgb(baseHue, seed.saturation * 0.8, 0.7))
  heart.addColorStop(1, hslToRgb(baseHue, seed.saturation * 0.6, 0.8))

  ctx.fillStyle = heart
  ctx.beginPath()
  ctx.arc(heartX - heartR * 0.5, heartY - heartR * 0.2, heartR, 0, Math.PI * 2)
  ctx.arc(heartX + heartR * 0.5, heartY - heartR * 0.2, heartR, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(heartX - heartR * 1.3, heartY)
  ctx.lineTo(heartX, heartY + heartR * 1.5)
  ctx.lineTo(heartX + heartR * 1.3, heartY)
  ctx.fill()
}

function drawCreationPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 무지개색
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size)
  const baseHue = seed.hue
  bg.addColorStop(0, '#FFFFFF')
  bg.addColorStop(0.5, hslToRgb(baseHue, seed.saturation * 0.5, 0.9))
  bg.addColorStop(1, hslToRgb((baseHue + 60) % 360, seed.saturation * 0.6, 0.85))
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 폭발 파동 (색상과 개수 변형)
  const layers = 6 + Math.floor(seed.seed1 * 4) // 6-9겹
  for (let i = layers; i > 0; i--) {
    const grad = ctx.createRadialGradient(cx, cy, size * 0.03 * i, cx, cy, size * 0.08 * i)
    const hue = (baseHue + i * (360 / layers)) % 360
    grad.addColorStop(0, hslToRgb(hue, seed.saturation * 0.7, 0.75))
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }

  // 입자 (개수와 위치 변형)
  const particleCount = 20 + Math.floor(seed.seed2 * 20) // 20-40개
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + seed.seed3 * Math.PI
    const dist = size * (0.12 + seed.seed1 * 0.18)
    const x = cx + Math.cos(angle) * dist
    const y = cy + Math.sin(angle) * dist
    const hue = (baseHue + i * (360 / particleCount)) % 360
    ctx.fillStyle = hslToRgb(hue, seed.saturation * 0.8, 0.65)
    ctx.beginPath()
    ctx.arc(x, y, 3 + seed.seed2 * 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawDefaultPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number, seed: VisualSeed) {
  // 파스텔 그라디언트 (각 단어마다 다른 색상)
  const hue1 = seed.hue
  const hue2 = (seed.hue + 60) % 360
  const hue3 = (seed.hue + 120) % 360

  const angle = seed.seed1 * Math.PI * 2
  const x1 = size * (0.5 + Math.cos(angle) * 0.5)
  const y1 = size * (0.5 + Math.sin(angle) * 0.5)
  const x2 = size * (0.5 - Math.cos(angle) * 0.5)
  const y2 = size * (0.5 - Math.sin(angle) * 0.5)

  const bg = ctx.createLinearGradient(x1, y1, x2, y2)
  bg.addColorStop(0, hslToRgb(hue1, seed.saturation * 0.5, 0.9))
  bg.addColorStop(0.5, hslToRgb(hue2, seed.saturation * 0.4, 0.92))
  bg.addColorStop(1, hslToRgb(hue3, seed.saturation * 0.5, 0.88))
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 중앙 원 (크기와 위치 변형)
  const offsetX = (seed.seed2 - 0.5) * size * 0.15
  const offsetY = (seed.seed3 - 0.5) * size * 0.15
  const circleX = cx + offsetX
  const circleY = cy + offsetY
  const circleR = size * (0.15 + seed.seed1 * 0.1)

  const center = ctx.createRadialGradient(circleX, circleY, 0, circleX, circleY, circleR)
  center.addColorStop(0, '#FFFFFF')
  center.addColorStop(1, hslToRgb((hue1 + 30) % 360, seed.saturation * 0.6, 0.85))
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2)
  ctx.fill()
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.arc(x + r * 0.7, y - r * 0.3, r * 0.8, 0, Math.PI * 2)
  ctx.arc(x - r * 0.7, y - r * 0.3, r * 0.8, 0, Math.PI * 2)
  ctx.fill()
}

function hebrewToFilename(id: string): string {
  return `word_${createHash('md5').update(id).digest('hex')}`
}

/**
 * 메인 생성 함수
 */
async function generateUniqueJpgs() {
  console.log('🎨 고유한 JPG 아이콘 생성 시작\n')

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, korean, grammar')
    .order('verse_id')

  if (error || !words) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  console.log(`📊 총 ${words.length}개 단어 발견\n`)

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const category = categorizeWord(word.meaning, word.korean)
    const filename = hebrewToFilename(word.id) + '.jpg'
    const filepath = join(OUTPUT_DIR, filename)

    try {
      const canvas = createCanvas(512, 512)
      generateUniqueJpg(canvas, category, word)

      const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 })
      writeFileSync(filepath, jpgBuffer)

      const sizeKB = Math.round(jpgBuffer.length / 1024)
      console.log(`✅ [${i + 1}/${words.length}] ${word.hebrew} (${category}) → ${filename} (${sizeKB} KB)`)

    } catch (err: any) {
      console.error(`❌ [${i + 1}/${words.length}] ${word.hebrew} 실패:`, err.message)
    }
  }

  console.log(`\n🎉 고유 JPG 생성 완료!`)
  console.log(`📁 출력 위치: ${OUTPUT_DIR}`)
}

generateUniqueJpgs()
