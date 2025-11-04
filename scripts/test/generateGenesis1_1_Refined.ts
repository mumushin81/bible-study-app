#!/usr/bin/env tsx

/**
 * 창세기 1:1 절제된 수채화 파스텔 이미지 생성
 * FLUX Schnell - 물감 번짐 효과 감소 버전
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
 * 단어별 맞춤 절제된 수채화 프롬프트 생성
 */
function generateRefinedPrompt(word: WordInfo): string {
  let meaningVisualization = ''
  let colors = ''

  // 단어 의미별 시각화
  switch (word.filename) {
    case 'bereshit': // 태초, 시작
      meaningVisualization = `
MEANING: THE BEGINNING - First moment of creation
- Subtle light burst from center
- Soft pastel rays with controlled edges
- Gentle beginning energy
- Clean, refined composition`
      colors = `Soft golden yellow, baby pink, powder blue, mint green - in controlled pastel tones`
      break

    case 'bara': // 창조하다
      meaningVisualization = `
MEANING: CREATED - Divine act of creation
- Controlled burst of creative energy
- Soft particles with defined shapes
- Gentle movement and formation
- Refined artistic composition`
      colors = `Pastel pink, baby blue, soft yellow, mint, peach - well-defined shapes`
      break

    case 'elohim': // 하나님
      meaningVisualization = `
MEANING: GOD - Divine presence and majesty
- Luminous central glow with soft edges
- Holy radiance in pastel tones
- Sacred atmosphere
- Clean, peaceful presence`
      colors = `Soft gold, cream, pale yellow, light amber, powder blue - refined gradients`
      break

    case 'et': // 목적격 표지
      meaningVisualization = `
MEANING: OBJECT MARKER - Connection and flow
- Simple flowing ribbon with clear edges
- Gentle directional flow
- Minimalist connecting elements
- Clean, elegant design`
      colors = `Pastel rainbow - pink, blue, mint, lavender with controlled blending`
      break

    case 'hashamayim': // 하늘
      meaningVisualization = `
MEANING: HEAVENS - Celestial realm
- Soft clouds with gentle definition
- Light atmospheric feel
- Peaceful sky composition
- Clean, serene design`
      colors = `Sky blue, powder blue, soft pink, cream - subtle gradients`
      break

    case 'veet': // 그리고 ~을/를
      meaningVisualization = `
MEANING: AND - Connection and unity
- Simple linking ribbon with clear form
- Gentle flowing connection
- Harmonious pastel blend
- Refined, minimalist style`
      colors = `Pastel rainbow - pink, mint, blue, peach with gentle transitions`
      break

    case 'haaretz': // 땅
      meaningVisualization = `
MEANING: EARTH - Ground and land
- Gentle rolling hills with soft definition
- Natural pastel landscape
- Peaceful terrain
- Clean, elegant composition`
      colors = `Mint green, sage, cream, soft beige, powder blue - controlled earth tones`
      break
  }

  return `
REFINED WATERCOLOR PASTEL PAINTING - CONTROLLED TECHNIQUE

${meaningVisualization}

WATERCOLOR STYLE (REFINED):
- Soft watercolor aesthetic with controlled blending
- Gentle pastel washes with subtle edges
- Light transparent layers (not heavy)
- Minimal color bleeding - keep shapes defined
- Delicate artistic quality without excessive blurring
- Clean, refined watercolor feel
- Soft but controlled brush work

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Main content centered with clean composition
- Bottom 20%: SOLID BRIGHT PASTEL COLOR (cream or pale pink)
- NO content in bottom 20% - completely empty and clean
- Clear separation between content and bottom area

BACKGROUND (ENTIRE IMAGE):
- Soft watercolor wash base:
  * Creamy vanilla (#FFF9E6, #FFFAF0)
  * Pale blush pink (#FFF0F5, #FFE4E1)
  * Baby powder blue (#F0F8FF, #E6F3FF)
- Choose ONE for entire background
- Background brightness: minimum 240/255
- Very subtle paper texture

COLORS IN UPPER 80%:
${colors}
- Delicate pastel palette
- Brightness > 180/255 minimum
- Soft but controlled tones
- Gentle gradients without heavy bleeding
- Shapes remain recognizable

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty solid pastel wash
✅ Bright pastel colors only
✅ Controlled watercolor blending (not excessive)
✅ Clean, refined composition
✅ Shapes have gentle definition
✅ Peaceful, elegant atmosphere

FORBIDDEN:
❌ NO dark colors (no navy, black, dark gray)
❌ NO content in bottom 20%
❌ NO excessive color bleeding or blurring
❌ NO overly dramatic wet-on-wet effects
❌ NO heavy paint texture

REFINED WATERCOLOR STYLE:
- Soft pastel watercolor with controlled blending
- Gentle, elegant brush work (not dramatic)
- Light transparent washes (not heavy layers)
- Subtle color transitions (not extreme bleeding)
- Clean, refined aesthetic
- Minimalist watercolor approach
- Dreamy but controlled
- Biblical sacred art with refined elegance
- Peaceful, gentle, high quality

Pure abstract watercolor art - soft shapes with gentle definition, delicate pastel washes, clean light, refined composition.
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
  console.log(`Model: FLUX Schnell (절제된 수채화)`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const prompt = generateRefinedPrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 절제된 수채화 생성 중...\n`)

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
  console.log('🎨 창세기 1:1 절제된 수채화 파스텔 이미지 생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`총 ${GENESIS_1_1_WORDS.length}개 단어`)
  console.log(`모델: FLUX Schnell`)
  console.log(`스타일: 절제된 수채화 (물감 번짐 효과 감소)\n`)

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
  console.log(`📊 FLUX Schnell 절제된 수채화 결과`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  console.log(`✅ 성공: ${successCount}/${GENESIS_1_1_WORDS.length}`)
  console.log(`⏱️  총 시간: ${totalDuration.toFixed(2)}초`)
  console.log(`⏱️  평균 시간: ${(totalDuration / successCount).toFixed(2)}초/이미지`)
  console.log(`📦 평균 크기: ${avgSize.toFixed(2)} KB`)
  console.log(`💰 총 비용: $${(successCount * 0.003).toFixed(3)}`)
  console.log(`📁 저장 위치: output/genesis1_1_comparison/schnell/`)

  console.log(`\n\n🎉 절제된 수채화 이미지 생성 완료!`)
  console.log(`\n비교를 위해 이미지를 확인하세요:`)
  console.log(`  - output/genesis1_1_comparison/schnell/\n`)
}

main().catch(console.error)
