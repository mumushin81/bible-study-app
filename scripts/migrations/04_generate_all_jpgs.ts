#!/usr/bin/env tsx

/**
 * 모든 단어의 JPG 아이콘 생성
 * - DB에서 단어 조회
 * - 의미 분석 후 자동으로 디자인 선택
 * - JPG 생성
 */

import { createClient } from '@supabase/supabase-js'
import { createCanvas, Canvas } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const OUTPUT_DIR = join(process.cwd(), 'output', 'all_words_jpg')

interface WordInfo {
  id: string
  hebrew: string
  meaning: string
  korean: string
  grammar?: string
}

/**
 * 단어 의미로 카테고리 판별
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
 * 카테고리별 JPG 생성
 */
function generateJpgByCategory(canvas: Canvas, category: string, word: WordInfo) {
  const ctx = canvas.getContext('2d')
  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2

  switch (category) {
    case 'divine': // 신성함
      drawDivinePattern(ctx, size, centerX, centerY)
      break
    case 'celestial': // 하늘
      drawCelestialPattern(ctx, size, centerX, centerY)
      break
    case 'earth': // 땅
      drawEarthPattern(ctx, size, centerX, centerY)
      break
    case 'water': // 물
      drawWaterPattern(ctx, size, centerX, centerY)
      break
    case 'light': // 빛
      drawLightPattern(ctx, size, centerX, centerY)
      break
    case 'life': // 생명
      drawLifePattern(ctx, size, centerX, centerY)
      break
    case 'creation': // 창조
      drawCreationPattern(ctx, size, centerX, centerY)
      break
    default: // 기본 파스텔 그라디언트
      drawDefaultPattern(ctx, size, centerX, centerY)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 패턴 함수들
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function drawDivinePattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 배경: 크림색
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#FFF9E6')
  bg.addColorStop(1, '#FFE5B4')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 황금 후광 (5겹)
  for (let i = 5; i > 0; i--) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15 * i)
    grad.addColorStop(0, '#FFD700')
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }

  // 중앙 빛나는 구
  const sun = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.12)
  sun.addColorStop(0, '#FFFFFF')
  sun.addColorStop(0.5, '#FFD700')
  sun.addColorStop(1, '#FFA500')
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

function drawCelestialPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 배경: 하늘색 그라디언트
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#87CEEB')
  bg.addColorStop(1, '#B0E0E6')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 구름들
  drawCloud(ctx, size * 0.2, size * 0.3, size * 0.08)
  drawCloud(ctx, size * 0.6, size * 0.4, size * 0.1)
  drawCloud(ctx, size * 0.4, size * 0.7, size * 0.07)

  // 별들
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * size
    const y = Math.random() * size * 0.6
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawEarthPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 배경: 하늘 → 그린
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#87CEEB')
  bg.addColorStop(0.5, '#98FB98')
  bg.addColorStop(1, '#90EE90')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 언덕
  ctx.fillStyle = '#7FE5A8'
  ctx.beginPath()
  ctx.moveTo(0, size * 0.7)
  ctx.quadraticCurveTo(size * 0.25, size * 0.5, size * 0.5, size * 0.7)
  ctx.quadraticCurveTo(size * 0.75, size * 0.9, size, size * 0.7)
  ctx.lineTo(size, size)
  ctx.lineTo(0, size)
  ctx.fill()

  // 태양
  const sun = ctx.createRadialGradient(size * 0.75, size * 0.25, 0, size * 0.75, size * 0.25, size * 0.08)
  sun.addColorStop(0, '#FFFFFF')
  sun.addColorStop(0.5, '#FFD700')
  sun.addColorStop(1, '#FFA500')
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(size * 0.75, size * 0.25, size * 0.08, 0, Math.PI * 2)
  ctx.fill()
}

function drawWaterPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 배경: 터콰이즈 그라디언트
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#00CED1')
  bg.addColorStop(1, '#A8EDEA')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 물결 (3개)
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - i * 0.1})`
    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.beginPath()
    const offsetY = size * 0.3 + i * size * 0.2
    for (let x = 0; x <= size; x += 5) {
      const y = offsetY + Math.sin(x * 0.03 + i) * 30
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

function drawLightPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 배경: 밝은 노란색
  ctx.fillStyle = '#FFFACD'
  ctx.fillRect(0, 0, size, size)

  // 빛의 방사
  for (let i = 5; i > 0; i--) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.1 * i)
    grad.addColorStop(0, '#FFFFFF')
    grad.addColorStop(0.5, '#FFD700')
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }
}

function drawLifePattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 배경: 핑크 그라디언트
  const bg = ctx.createLinearGradient(0, 0, 0, size)
  bg.addColorStop(0, '#FFF0F5')
  bg.addColorStop(1, '#FFB6C1')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 하트 (간단한 버전: 2개 원 + 삼각형)
  const heart = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15)
  heart.addColorStop(0, '#FF69B4')
  heart.addColorStop(1, '#FFB6C1')

  ctx.fillStyle = heart
  ctx.beginPath()
  ctx.arc(size * 0.4, size * 0.4, size * 0.12, 0, Math.PI * 2)
  ctx.arc(size * 0.6, size * 0.4, size * 0.12, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(size * 0.3, size * 0.45)
  ctx.lineTo(size * 0.5, size * 0.65)
  ctx.lineTo(size * 0.7, size * 0.45)
  ctx.fill()
}

function drawCreationPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 배경: 파스텔 그라디언트
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size)
  bg.addColorStop(0, '#FFFFFF')
  bg.addColorStop(0.5, '#FFE5B4')
  bg.addColorStop(1, '#E1BEE7')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 폭발 파동
  for (let i = 8; i > 0; i--) {
    const grad = ctx.createRadialGradient(cx, cy, size * 0.05 * i, cx, cy, size * 0.1 * i)
    const colors = ['#FF69B4', '#4FC3F7', '#FFD700', '#E1BEE7']
    grad.addColorStop(0, colors[i % 4])
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }

  // 입자들
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2
    const dist = size * 0.15 + Math.random() * size * 0.15
    const x = cx + Math.cos(angle) * dist
    const y = cy + Math.sin(angle) * dist
    const colors = ['#FF69B4', '#4FC3F7', '#FFD700', '#7B68EE']
    ctx.fillStyle = colors[i % 4]
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawDefaultPattern(ctx: CanvasRenderingContext2D, size: number, cx: number, cy: number) {
  // 기본: 파스텔 그라디언트
  const bg = ctx.createLinearGradient(0, 0, size, size)
  bg.addColorStop(0, '#E1BEE7')
  bg.addColorStop(0.5, '#FFE5B4')
  bg.addColorStop(1, '#B0E0E6')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // 중앙 부드러운 원
  const center = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.2)
  center.addColorStop(0, '#FFFFFF')
  center.addColorStop(1, '#E1BEE7')
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2)
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

/**
 * 히브리어를 파일명으로 변환
 */
function hebrewToFilename(id: string, hebrew: string): string {
  // ID 기반 파일명 (안전)
  return `word_${id.replace(/-/g, '_')}`
}

/**
 * 메인 생성 함수
 */
async function generateAllJpgs() {
  console.log('🎨 모든 단어의 JPG 아이콘 생성 시작\n')

  // 출력 디렉토리 생성
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // 1. DB에서 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, korean, grammar')
    .order('verse_id')

  if (error || !words) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  console.log(`📊 총 ${words.length}개 단어 발견\n`)

  // 2. 각 단어별 JPG 생성
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const category = categorizeWord(word.meaning, word.korean)
    const filename = hebrewToFilename(word.id, word.hebrew) + '.jpg'
    const filepath = join(OUTPUT_DIR, filename)

    try {
      // Canvas 생성
      const canvas = createCanvas(512, 512)

      // 패턴 그리기
      generateJpgByCategory(canvas, category, word)

      // JPG 저장
      const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 })
      writeFileSync(filepath, jpgBuffer)

      const sizeKB = Math.round(jpgBuffer.length / 1024)
      console.log(`✅ [${i + 1}/${words.length}] ${word.hebrew} (${category}) → ${filename} (${sizeKB} KB)`)

    } catch (err: any) {
      console.error(`❌ [${i + 1}/${words.length}] ${word.hebrew} 실패:`, err.message)
    }
  }

  console.log(`\n🎉 JPG 생성 완료!`)
  console.log(`📁 출력 위치: ${OUTPUT_DIR}`)
}

generateAllJpgs()
