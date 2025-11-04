#!/usr/bin/env tsx

/**
 * 창세기 1:1 깔끔한 파스텔 이미지 생성
 * FLUX Schnell - 수채화 없이 밝고 다양한 파스텔 색감
 */

import Replicate from 'replicate'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  grammar: string
  filename: string
}

// 창세기 1:1 단어 정보
const GENESIS_1_1_WORDS: WordInfo[] = [
  {
    hebrew: 'בְּרֵאשִׁית',
    meaning: '태초에, 처음에, 시작',
    korean: '베레쉬트',
    grammar: '명사',
    filename: 'bereshit'
  },
  {
    hebrew: 'בָּרָא',
    meaning: '창조하셨다',
    korean: '바라',
    grammar: '동사',
    filename: 'bara'
  },
  {
    hebrew: 'אֱלֹהִים',
    meaning: '하나님',
    korean: '엘로힘',
    grammar: '명사',
    filename: 'elohim'
  },
  {
    hebrew: 'אֵת',
    meaning: '~을/를 (목적격 표지)',
    korean: '에트',
    grammar: '전치사',
    filename: 'et'
  },
  {
    hebrew: 'הַשָּׁמַיִם',
    meaning: '하늘들',
    korean: '하샤마임',
    grammar: '명사',
    filename: 'hashamayim'
  },
  {
    hebrew: 'וְאֵת',
    meaning: '그리고 ~을/를',
    korean: '베에트',
    grammar: '접속사',
    filename: 'veet'
  },
  {
    hebrew: 'הָאָרֶץ',
    meaning: '땅',
    korean: '하아레츠',
    grammar: '명사',
    filename: 'haaretz'
  }
]

/**
 * 단어별 맞춤 깔끔한 파스텔 프롬프트 생성
 */
function generateCleanPastelPrompt(word: WordInfo): string {
  let meaningVisualization = ''
  let colors = ''

  // 단어 의미별 시각화
  switch (word.filename) {
    case 'bereshit': // 태초, 시작
      meaningVisualization = `
MEANING: THE BEGINNING - First moment of creation
- Radial light burst from center
- Smooth pastel rays spreading outward
- Clean geometric light rays
- Bright beginning energy`
      colors = `Golden yellow (#FFE66D), baby pink (#FFB3C6), sky blue (#A8D8FF), mint green (#B5E7D0), lavender (#DCC6FF)`
      break

    case 'bara': // 창조하다
      meaningVisualization = `
MEANING: CREATED - Divine act of creation
- Dynamic burst of creative particles
- Smooth flowing shapes and light
- Colorful energy explosion
- Vibrant formation`
      colors = `Coral pink (#FFB5B5), turquoise (#7FE5E5), sunny yellow (#FFF48F), mint (#98E8C8), peach (#FFCCB8), lilac (#D7B5FF)`
      break

    case 'elohim': // 하나님
      meaningVisualization = `
MEANING: GOD - Divine presence and majesty
- Luminous radial glow
- Holy light rays
- Sacred bright atmosphere
- Powerful divine presence`
      colors = `Soft gold (#FFE8A3), cream (#FFF9E6), pale yellow (#FFF8B8), light amber (#FFD699), powder blue (#C8E6FF)`
      break

    case 'et': // 목적격 표지
      meaningVisualization = `
MEANING: OBJECT MARKER - Connection and flow
- Flowing ribbon shape
- Smooth directional flow
- Connecting colorful elements
- Gentle movement`
      colors = `Pastel rainbow - pink (#FFD4E5), blue (#C4E3FF), mint (#C8F5E8), lavender (#E5D4FF), peach (#FFE0CC)`
      break

    case 'hashamayim': // 하늘
      meaningVisualization = `
MEANING: HEAVENS - Celestial realm
- Soft clouds in bright colors
- Heavenly atmosphere
- Peaceful sky gradient
- Serene celestial expanse`
      colors = `Sky blue (#B3E0FF), powder blue (#D4F1FF), soft pink (#FFE5F0), cream (#FFF9E6), lavender (#E8DCFF)`
      break

    case 'veet': // 그리고 ~을/를
      meaningVisualization = `
MEANING: AND - Connection and unity
- Linking colorful ribbon
- Smooth flowing connection
- Harmonious color blend
- Bright unifying wave`
      colors = `Rainbow pastel - pink (#FFD9E8), mint (#C3F5E4), blue (#C8E6FF), peach (#FFE5CC), yellow (#FFF5C2)`
      break

    case 'haaretz': // 땅
      meaningVisualization = `
MEANING: EARTH - Ground and land
- Gentle rolling hills
- Soft landscape shapes
- Natural pastel elements
- Peaceful terrain`
      colors = `Mint green (#C1F0DD), sage (#D4E8D4), cream (#FFF9E6), soft beige (#FFE8D6), sky blue (#D4F1FF), peach (#FFE5CC)`
      break
  }

  return `
CLEAN BRIGHT PASTEL ART - NO WATERCOLOR

${meaningVisualization}

ART STYLE (IMPORTANT):
- Smooth digital pastel gradient art
- Clean, vibrant pastel colors
- Soft shapes with smooth edges
- NO watercolor texture or effects
- NO painting brush strokes
- NO paper texture
- Modern clean aesthetic
- Dreamy soft gradients
- High saturation pastel colors

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Main colorful content centered
- Bottom 20%: SOLID BRIGHT PASTEL COLOR (cream #FFF9E6 or pale pink #FFE5F0)
- NO content in bottom 20% - completely empty
- Clean separation between areas

BACKGROUND (ENTIRE IMAGE):
- Soft pastel gradient background:
  * Creamy vanilla (#FFF9E6)
  * Pale blush pink (#FFE5F0)
  * Baby powder blue (#E6F3FF)
- Choose ONE for background
- Background brightness: minimum 240/255
- Smooth clean gradient

BRIGHT PASTEL COLORS IN UPPER 80%:
${colors}
- Vibrant but soft pastel palette
- Brightness > 180/255 minimum
- High saturation pastels
- Smooth color transitions
- Multiple bright colors (4-6 colors)
- Clean, modern look

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty and bright solid color
✅ BRIGHT vibrant pastel colors
✅ Smooth digital gradients (NO watercolor)
✅ Clean modern aesthetic
✅ Multiple diverse colors (4-6 different pastels)
✅ High brightness throughout

FORBIDDEN:
❌ NO dark colors (no navy, black, dark gray, dark teal)
❌ NO content in bottom 20%
❌ NO watercolor effects or texture
❌ NO painting brush strokes
❌ NO paper texture
❌ NO sketchy or rough edges

CLEAN PASTEL STYLE:
- Modern digital pastel art
- Smooth soft gradients
- Bright vibrant pastel colors
- Clean elegant composition
- Dreamy ethereal feel
- Biblical sacred art with modern style
- Peaceful, gentle, high quality
- No watercolor or painting effects

Pure abstract pastel gradient art - smooth shapes, bright diverse pastel colors, clean soft light, modern aesthetic.
`.trim()
}

/**
 * 단일 이미지 생성
 */
async function generateImage(
  word: WordInfo,
  index: number,
  total: number
): Promise<{ success: boolean; filepath: string; sizeKB: number; duration: number }> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`[${index}/${total}] ${word.hebrew} (${word.korean})`)
  console.log(`Model: FLUX Schnell (깔끔한 파스텔)`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const prompt = generateCleanPastelPrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 밝은 파스텔 생성 중...\n`)

  const startTime = Date.now()

  try {
    const output: any = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: '9:16',
        output_format: 'jpg',
        output_quality: 90,
      }
    })

    const duration = (Date.now() - startTime) / 1000
    const imageUrl = Array.isArray(output) ? output[0] : output

    console.log(`⏱️  생성 완료! (${duration.toFixed(2)}초)`)

    // 이미지 다운로드
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()

    const filepath = join(
      process.cwd(),
      `output/genesis1_1_comparison/schnell/${word.filename}.jpg`
    )

    writeFileSync(filepath, Buffer.from(buffer))

    const sizeKB = buffer.byteLength / 1024

    console.log(`✅ 저장: ${word.filename}.jpg`)
    console.log(`📊 크기: ${sizeKB.toFixed(2)} KB`)

    return { success: true, filepath, sizeKB, duration }
  } catch (error: any) {
    console.error(`❌ 실패: ${error.message}`)
    return { success: false, filepath: '', sizeKB: 0, duration: 0 }
  }
}

/**
 * 메인 실행
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎨 창세기 1:1 깔끔한 파스텔 이미지 생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`총 ${GENESIS_1_1_WORDS.length}개 단어`)
  console.log(`모델: FLUX Schnell`)
  console.log(`스타일: 밝고 다양한 파스텔 (수채화 없음)\n`)

  const results: any[] = []
  const startTime = Date.now()

  for (let i = 0; i < GENESIS_1_1_WORDS.length; i++) {
    const word = GENESIS_1_1_WORDS[i]
    const result = await generateImage(word, i + 1, GENESIS_1_1_WORDS.length)
    results.push(result)

    // Rate limit 방지
    if (i < GENESIS_1_1_WORDS.length - 1) {
      console.log('\n⏸️  2초 대기...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const totalDuration = (Date.now() - startTime) / 1000
  const successCount = results.filter(r => r.success).length
  const totalSize = results.reduce((sum, r) => sum + r.sizeKB, 0)
  const avgSize = totalSize / successCount

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 FLUX Schnell 깔끔한 파스텔 결과`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  console.log(`✅ 성공: ${successCount}/${GENESIS_1_1_WORDS.length}`)
  console.log(`⏱️  총 시간: ${totalDuration.toFixed(2)}초`)
  console.log(`⏱️  평균 시간: ${(totalDuration / successCount).toFixed(2)}초/이미지`)
  console.log(`📦 평균 크기: ${avgSize.toFixed(2)} KB`)
  console.log(`💰 총 비용: $${(successCount * 0.003).toFixed(3)}`)
  console.log(`📁 저장 위치: output/genesis1_1_comparison/schnell/`)

  console.log(`\n\n🎉 깔끔한 파스텔 이미지 생성 완료!`)
  console.log(`\n이미지를 확인하세요:`)
  console.log(`  - output/genesis1_1_comparison/schnell/\n`)
}

main().catch(console.error)
