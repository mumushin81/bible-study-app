#!/usr/bin/env tsx

/**
 * 창세기 1장 JPG 아이콘 생성 (가이드라인 준수)
 *
 * 핵심 원칙:
 * ⭐⭐⭐⭐⭐ 파스텔 색감 (흰색 섞인 부드러운 색상)
 * ⭐⭐⭐⭐⭐ 화려함 (2-4개 색상 그라디언트)
 * ⭐⭐⭐⭐⭐ 밝은 색상 (최소 180/255 밝기)
 * ⭐⭐⭐⭐ 예술적 표현 (단어 의미 상징)
 */

import { createCanvas, Canvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const OUTPUT_DIR = join(process.cwd(), 'output', 'genesis1_artistic_jpgs')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 파스텔 색상 팔레트 (가이드라인)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COLORS = {
  // 신성함 (Divine)
  divine: {
    primary: '#FFD700',     // 골드
    secondary: '#FFA500',   // 오렌지 골드
    accent: '#FFF9E6',      // 크림
    highlight: '#FFFFFF',   // 순백
    background: '#FFE5B4'   // 피치
  },

  // 하늘 (Celestial)
  celestial: {
    primary: '#87CEEB',     // 스카이블루
    secondary: '#B0E0E6',   // 파우더블루
    accent: '#E0F6FF',      // 아이스블루
    highlight: '#FFFFFF',   // 순백
    background: '#F0F8FF'   // 앨리스블루
  },

  // 생명 (Life)
  life: {
    primary: '#FFB6C1',     // 라이트핑크
    secondary: '#FF69B4',   // 핫핑크 (파스텔)
    accent: '#FFC0CB',      // 핑크
    highlight: '#FFFFFF',   // 순백
    background: '#FFF0F5'   // 라벤더블러시
  },

  // 자연 (Nature)
  nature: {
    primary: '#90EE90',     // 라이트그린
    secondary: '#98FB98',   // 페일그린
    accent: '#A8EDEA',      // 민트
    highlight: '#FFFFFF',   // 순백
    background: '#F0FFF0'   // 하니듀
  },

  // 땅 (Earth)
  earth: {
    primary: '#D2691E',     // 초콜렛 (밝게)
    secondary: '#CD853F',   // 페루
    accent: '#F5DEB3',      // 밀색
    highlight: '#FFFFFF',   // 순백
    background: '#FFF8DC'   // 콘실크
  },

  // 창조 (Creation)
  creation: {
    primary: '#FF69B4',     // 핫핑크
    secondary: '#4FC3F7',   // 블루
    accent: '#FFD700',      // 골드
    highlight: '#FFFFFF',   // 순백
    background: '#F3E5F5'   // 라벤더
  },

  // 빛 (Light)
  light: {
    primary: '#FFD700',     // 골드
    secondary: '#FFE4B5',   // 모카신
    accent: '#FFF9E6',      // 크림
    highlight: '#FFFFFF',   // 순백
    background: '#FFFACD'   // 레몬쉬폰
  },

  // 어둠 (Darkness) - 밝게!
  darkness: {
    primary: '#9370DB',     // 미디엄퍼플 (밝음)
    secondary: '#BA55D3',   // 미디엄오키드
    accent: '#DDA0DD',      // 플럼
    highlight: '#FFFFFF',   // 순백
    background: '#E6E6FA'   // 라벤더
  },

  // 물 (Water)
  water: {
    primary: '#00CED1',     // 터콰이즈
    secondary: '#7FDBFF',   // 아쿠아
    accent: '#A8EDEA',      // 민트
    highlight: '#FFFFFF',   // 순백
    background: '#E0FFFF'   // 라이트시안
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 디자인 패턴 함수들
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 방사형 후광 패턴 (신성함, 빛)
 */
function drawRadialHalo(canvas: Canvas, colors: string[]) {
  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const maxRadius = Math.min(canvas.width, canvas.height) / 2

  // 배경
  ctx.fillStyle = colors[colors.length - 1]
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 여러 겹의 후광
  for (let i = colors.length - 1; i >= 0; i--) {
    const radius = maxRadius * ((i + 1) / colors.length)
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    )

    gradient.addColorStop(0, '#FFFFFF')
    gradient.addColorStop(0.5, colors[i])
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // 빛나는 중심
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 80
  )
  coreGradient.addColorStop(0, '#FFFFFF')
  coreGradient.addColorStop(1, colors[0])

  ctx.fillStyle = coreGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * 그라디언트 배경 (하늘, 땅, 자연)
 */
function drawGradientBackground(canvas: Canvas, colors: string[], direction: 'vertical' | 'horizontal' = 'vertical') {
  const ctx = canvas.getContext('2d')

  const gradient = direction === 'vertical'
    ? ctx.createLinearGradient(0, 0, 0, canvas.height)
    : ctx.createLinearGradient(0, 0, canvas.width, 0)

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

/**
 * 입자 폭발 효과 (창조, 에너지)
 */
function drawParticleExplosion(canvas: Canvas, colors: string[], particleCount: number = 120) {
  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // 배경 그라디언트
  const bgGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, canvas.width / 2
  )
  bgGradient.addColorStop(0, colors[colors.length - 1])
  bgGradient.addColorStop(1, colors[colors.length - 2] || colors[0])
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 입자들
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2
    const distance = 50 + Math.random() * 200
    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance
    const size = 4 + Math.random() * 12
    const color = colors[Math.floor(Math.random() * (colors.length - 1))]

    const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
    particleGradient.addColorStop(0, '#FFFFFF')
    particleGradient.addColorStop(0.5, color)
    particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = particleGradient
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // 빛나는 중심핵
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 100
  )
  coreGradient.addColorStop(0, '#FFFFFF')
  coreGradient.addColorStop(0.5, colors[0])
  coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = coreGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, 100, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * 흐르는 리본 (연결, 흐름)
 */
function drawFlowingRibbon(canvas: Canvas, colors: string[]) {
  const ctx = canvas.getContext('2d')

  // 배경
  ctx.fillStyle = colors[colors.length - 1]
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 여러 리본
  colors.slice(0, -1).forEach((color, index) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 30
    ctx.lineCap = 'round'

    const amplitude = 60
    const frequency = 0.01
    const offsetY = canvas.height * 0.2 + index * canvas.height * 0.18
    const phase = index * Math.PI * 0.5

    ctx.beginPath()
    for (let x = 0; x <= canvas.width; x += 5) {
      const y = offsetY + Math.sin(x * frequency + phase) * amplitude
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  })
}

/**
 * 자연 풍경 (언덕, 나무)
 */
function drawNaturalLandscape(canvas: Canvas, skyColors: string[], earthColors: string[]) {
  const ctx = canvas.getContext('2d')

  // 하늘 그라디언트
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6)
  skyColors.forEach((color, i) => {
    skyGradient.addColorStop(i / (skyColors.length - 1), color)
  })
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6)

  // 땅 (언덕)
  const earthGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height)
  earthColors.forEach((color, i) => {
    earthGradient.addColorStop(i / (earthColors.length - 1), color)
  })

  ctx.fillStyle = earthGradient
  ctx.beginPath()
  ctx.moveTo(0, canvas.height * 0.6)

  // 부드러운 언덕
  for (let x = 0; x <= canvas.width; x += 20) {
    const y = canvas.height * 0.6 + Math.sin(x * 0.01) * 40
    ctx.lineTo(x, y)
  }

  ctx.lineTo(canvas.width, canvas.height)
  ctx.lineTo(0, canvas.height)
  ctx.closePath()
  ctx.fill()

  // 태양
  const sunX = canvas.width * 0.75
  const sunY = canvas.height * 0.25
  const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60)
  sunGradient.addColorStop(0, '#FFFFFF')
  sunGradient.addColorStop(0.5, '#FFD700')
  sunGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')

  ctx.fillStyle = sunGradient
  ctx.beginPath()
  ctx.arc(sunX, sunY, 60, 0, Math.PI * 2)
  ctx.fill()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 카테고리별 렌더러
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function renderDivine(canvas: Canvas) {
  const c = COLORS.divine
  drawRadialHalo(canvas, [c.primary, c.secondary, c.accent, c.background])
}

function renderCelestial(canvas: Canvas) {
  const c = COLORS.celestial
  drawGradientBackground(canvas, [c.primary, c.secondary, c.accent, c.background])

  // 별 추가
  const ctx = canvas.getContext('2d')
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height * 0.7
    const size = 2 + Math.random() * 4

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function renderCreation(canvas: Canvas) {
  const c = COLORS.creation
  drawParticleExplosion(canvas, [c.primary, c.secondary, c.accent, c.background], 150)
}

function renderEarth(canvas: Canvas) {
  const c = COLORS.earth
  const sky = COLORS.celestial
  drawNaturalLandscape(
    canvas,
    [sky.primary, sky.secondary, sky.accent],
    [c.primary, c.secondary, c.accent]
  )
}

function renderWater(canvas: Canvas) {
  const c = COLORS.water
  // 물결 패턴
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, c.primary)
  gradient.addColorStop(0.5, c.secondary)
  gradient.addColorStop(1, c.accent)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 물결
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = c.highlight
    ctx.globalAlpha = 0.3
    ctx.lineWidth = 3
    ctx.beginPath()

    const offsetY = canvas.height * 0.2 + i * 60
    for (let x = 0; x <= canvas.width; x += 5) {
      const y = offsetY + Math.sin((x + i * 50) * 0.02) * 15
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1.0
}

function renderLight(canvas: Canvas) {
  const c = COLORS.light
  drawRadialHalo(canvas, [c.primary, c.secondary, c.accent, c.background])
}

function renderDarkness(canvas: Canvas) {
  const c = COLORS.darkness
  // 밝은 보라색 그라디언트 (어둡지 않음!)
  drawGradientBackground(canvas, [c.primary, c.secondary, c.accent, c.background])

  // 별들
  const ctx = canvas.getContext('2d')
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = 1 + Math.random() * 3

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function renderLife(canvas: Canvas) {
  const c = COLORS.life
  drawParticleExplosion(canvas, [c.primary, c.secondary, c.accent, c.background], 100)
}

function renderDefault(canvas: Canvas) {
  // 파스텔 무지개
  const colors = [
    '#FFB6C1', // 핑크
    '#FFD700', // 골드
    '#87CEEB', // 스카이블루
    '#90EE90', // 라이트그린
    '#E1BEE7'  // 라벤더
  ]
  drawFlowingRibbon(canvas, colors)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 카테고리 매핑
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getCategoryRenderer(grammar: string, meaning: string, hebrew: string): (canvas: Canvas) => void {
  const g = grammar.toLowerCase()
  const m = meaning.toLowerCase()
  const h = hebrew

  // 하나님
  if (h.includes('אֱלֹהִים') || m.includes('하나님') || m.includes('신')) {
    return renderDivine
  }

  // 창조
  if (m.includes('창조') || m.includes('만들') || h.includes('בָּרָא')) {
    return renderCreation
  }

  // 시작, 태초
  if (m.includes('태초') || m.includes('시작') || h.includes('בְּרֵאשִׁית')) {
    return renderLight
  }

  // 하늘
  if (m.includes('하늘') || h.includes('שָּׁמַיִם') || h.includes('רָקִיעַ')) {
    return renderCelestial
  }

  // 땅
  if (m.includes('땅') || h.includes('אָרֶץ') || h.includes('אֲדָמָה')) {
    return renderEarth
  }

  // 물
  if (m.includes('물') || m.includes('바다') || h.includes('מַיִם') || h.includes('יָם')) {
    return renderWater
  }

  // 빛
  if (m.includes('빛') || h.includes('אוֹר')) {
    return renderLight
  }

  // 어둠
  if (m.includes('어둠') || h.includes('חֹשֶׁךְ') || m.includes('밤') || h.includes('לַיְלָה')) {
    return renderDarkness
  }

  // 생명
  if (m.includes('생명') || m.includes('살아') || h.includes('חַיָּה') || h.includes('נֶפֶשׁ')) {
    return renderLife
  }

  return renderDefault
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메인 함수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function generateGenesis1Jpgs() {
  console.log('🎨 창세기 1장 예술적 JPG 아이콘 생성\n')

  // 출력 디렉토리 생성
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // 창세기 1장 구절 조회
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')

  if (versesError || !verses) {
    console.error('❌ 구절 조회 실패:', versesError)
    return
  }

  console.log(`📖 창세기 1장: ${verses.length}개 구절\n`)

  let totalGenerated = 0
  let totalSkipped = 0

  for (const verse of verses) {
    // 각 구절의 단어들 조회
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, hebrew, meaning, ipa, korean, grammar')
      .eq('verse_id', verse.id)
      .order('position')

    if (wordsError || !words) continue

    for (const word of words) {
      try {
        // 파일명
        const filename = `word_${word.id.replace(/-/g, '_')}.jpg`
        const filepath = join(OUTPUT_DIR, filename)

        // Canvas 생성
        const canvas = createCanvas(512, 512)

        // 카테고리별 렌더링
        const renderer = getCategoryRenderer(word.grammar, word.meaning, word.hebrew)
        renderer(canvas)

        // JPG 저장
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 })
        writeFileSync(filepath, buffer)

        totalGenerated++
        const sizeKB = Math.round(buffer.length / 1024)

        if (totalGenerated % 10 === 0) {
          console.log(`✅ [${totalGenerated}/${words.length * verses.length}] ${word.hebrew} → ${sizeKB} KB`)
        }

      } catch (err: any) {
        console.error(`❌ ${word.hebrew} 생성 실패:`, err.message)
        totalSkipped++
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🎉 생성 완료: ${totalGenerated}개`)
  console.log(`⚠️  스킵: ${totalSkipped}개`)
  console.log(`📁 출력: ${OUTPUT_DIR}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

generateGenesis1Jpgs()
