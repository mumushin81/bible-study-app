#!/usr/bin/env tsx

/**
 * 창세기 1:1 이미지 생성 비교 테스트
 * FLUX Schnell vs FLUX 1.1 Pro
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
 * 단어별 맞춤 프롬프트 생성
 */
function generatePrompt(word: WordInfo): string {
  let meaningVisualization = ''
  let colors = ''

  // 단어 의미별 시각화
  switch (word.filename) {
    case 'bereshit': // 태초, 시작
      meaningVisualization = `
MEANING: THE BEGINNING - First moment of creation
- Gentle radial light burst from center
- Soft rays spreading outward
- Divine spark of creation
- Cosmic beginning energy`
      colors = `Golden yellow, soft pink, powder blue, mint green, lavender`
      break

    case 'bara': // 창조하다
      meaningVisualization = `
MEANING: CREATED - Divine act of creation
- Dynamic burst of creative energy
- Flowing particles and light
- Movement and formation
- Divine craftsmanship`
      colors = `Vibrant pastels - pink, blue, yellow, mint, peach, lavender`
      break

    case 'elohim': // 하나님
      meaningVisualization = `
MEANING: GOD - Divine presence and majesty
- Luminous central orb
- Holy radiance and glory
- Sacred atmosphere
- Gentle powerful presence`
      colors = `Soft gold, cream, pale yellow, light amber, powder blue`
      break

    case 'et': // 목적격 표지
      meaningVisualization = `
MEANING: OBJECT MARKER - Connection and flow
- Abstract flowing ribbon
- Gentle directional flow
- Connecting elements
- Soft movement`
      colors = `Pastel rainbow - pink, blue, mint, lavender, peach`
      break

    case 'hashamayim': // 하늘
      meaningVisualization = `
MEANING: HEAVENS - Celestial realm
- Soft clouds and sky
- Ethereal atmosphere
- Heavenly expanse
- Peaceful sky gradient`
      colors = `Sky blue, powder blue, soft pink, cream, lavender`
      break

    case 'veet': // 그리고 ~을/를
      meaningVisualization = `
MEANING: AND - Connection and unity
- Linking ribbon or bridge
- Gentle flowing connection
- Harmonious blend
- Soft unifying element`
      colors = `Pastel rainbow blend - pink, mint, blue, peach, yellow`
      break

    case 'haaretz': // 땅
      meaningVisualization = `
MEANING: EARTH - Ground and land
- Gentle rolling hills
- Soft landscape
- Natural elements
- Peaceful terrain`
      colors = `Mint green, sage, cream, soft brown, powder blue, peach`
      break
  }

  return `
${meaningVisualization}

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Main content centered
- Bottom 20%: SOLID BRIGHT PASTEL COLOR (cream or pale pink)
- NO content in bottom 20% - completely empty
- Leave bottom bright and blank

BACKGROUND (ENTIRE IMAGE):
- Soft cream (#FFF9E6, #FFFAF0)
- Pale blush pink (#FFF0F5, #FFE4E1)
- Baby powder blue (#F0F8FF, #E6F3FF)
- Choose ONE for entire background
- Background brightness: minimum 240/255

COLORS IN UPPER 80%:
${colors}
- ALL pastel shades
- Brightness > 180/255 minimum
- Soft, gentle tones

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty and bright
✅ Bright pastel colors only
✅ High key lighting
✅ Peaceful atmosphere

FORBIDDEN:
❌ NO dark colors
❌ NO content in bottom 20%
❌ NO black, dark gray, navy

STYLE:
- Soft pastel watercolor
- Dreamy, ethereal
- Biblical sacred art
- Gentle, peaceful
- High quality

Pure abstract visual art - soft shapes, pastel colors, gentle light.
`.trim()
}

/**
 * 단일 이미지 생성
 */
async function generateImage(
  word: WordInfo,
  model: 'schnell' | 'pro',
  index: number,
  total: number
): Promise<{ success: boolean; filepath: string; sizeKB: number; duration: number }> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`[${index}/${total}] ${word.hebrew} (${word.korean})`)
  console.log(`Model: ${model === 'schnell' ? 'FLUX Schnell' : 'FLUX 1.1 Pro'}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const prompt = generatePrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 생성 중...\n`)

  const startTime = Date.now()

  try {
    let output: any

    if (model === 'schnell') {
      output = await replicate.run('black-forest-labs/flux-schnell', {
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: '9:16',
          output_format: 'jpg',
          output_quality: 90,
        }
      })
    } else {
      output = await replicate.run('black-forest-labs/flux-1.1-pro', {
        input: {
          prompt,
          aspect_ratio: '9:16',
          output_format: 'jpg',
          output_quality: 90,
        }
      })
    }

    const duration = (Date.now() - startTime) / 1000
    const imageUrl = Array.isArray(output) ? output[0] : output

    console.log(`⏱️  생성 완료! (${duration.toFixed(2)}초)`)

    // 이미지 다운로드
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()

    const dir = model === 'schnell' ? 'schnell' : 'pro'
    const filepath = join(
      process.cwd(),
      `output/genesis1_1_comparison/${dir}/${word.filename}.jpg`
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
  const model = process.argv[2] as 'schnell' | 'pro' | 'both'

  if (!model || !['schnell', 'pro', 'both'].includes(model)) {
    console.log(`
사용법:
  tsx scripts/test/generateGenesis1_1_Comparison.ts <schnell|pro|both>

예시:
  tsx scripts/test/generateGenesis1_1_Comparison.ts schnell  # FLUX Schnell만
  tsx scripts/test/generateGenesis1_1_Comparison.ts pro      # FLUX 1.1 Pro만
  tsx scripts/test/generateGenesis1_1_Comparison.ts both     # 둘 다
    `)
    process.exit(1)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 창세기 1:1 이미지 생성 비교')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`총 ${GENESIS_1_1_WORDS.length}개 단어`)
  console.log(`모델: ${model === 'both' ? 'FLUX Schnell + FLUX 1.1 Pro' : model}\n`)

  const models: ('schnell' | 'pro')[] = model === 'both' ? ['schnell', 'pro'] : [model]

  for (const currentModel of models) {
    console.log(`\n\n🚀 ${currentModel === 'schnell' ? 'FLUX Schnell' : 'FLUX 1.1 Pro'} 생성 시작\n`)

    const results: any[] = []
    const startTime = Date.now()

    for (let i = 0; i < GENESIS_1_1_WORDS.length; i++) {
      const word = GENESIS_1_1_WORDS[i]
      const result = await generateImage(word, currentModel, i + 1, GENESIS_1_1_WORDS.length)
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
    console.log(`📊 ${currentModel === 'schnell' ? 'FLUX Schnell' : 'FLUX 1.1 Pro'} 결과`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    console.log(`✅ 성공: ${successCount}/${GENESIS_1_1_WORDS.length}`)
    console.log(`⏱️  총 시간: ${totalDuration.toFixed(2)}초`)
    console.log(`📦 평균 크기: ${avgSize.toFixed(2)} KB`)
    console.log(`💰 총 비용: $${(successCount * (currentModel === 'schnell' ? 0.003 : 0.04)).toFixed(3)}`)
    console.log(`📁 저장 위치: output/genesis1_1_comparison/${currentModel}/`)
  }

  console.log(`\n\n🎉 모든 이미지 생성 완료!`)
  console.log(`\n비교를 위해 두 폴더의 이미지를 확인하세요:`)
  console.log(`  - output/genesis1_1_comparison/schnell/`)
  console.log(`  - output/genesis1_1_comparison/pro/\n`)
}

main().catch(console.error)
