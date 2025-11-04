#!/usr/bin/env tsx

/**
 * 창세기 1:1 수채화 파스텔 이미지 생성 비교 테스트
 * FLUX Schnell vs FLUX 1.1 Pro - Enhanced Watercolor Pastel
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
 * 단어별 맞춤 수채화 프롬프트 생성
 */
function generateWatercolorPrompt(word: WordInfo): string {
  let meaningVisualization = ''
  let colors = ''
  let watercolorTechnique = ''

  // 단어 의미별 시각화
  switch (word.filename) {
    case 'bereshit': // 태초, 시작
      meaningVisualization = `
MEANING: THE BEGINNING - First moment of creation
- Delicate watercolor light burst from center
- Soft pastel rays spreading like watercolor wash
- Gentle brush strokes radiating outward
- Ethereal beginning energy with wet-on-wet blending`
      colors = `Soft golden yellow, baby pink, powder blue, mint green, lavender - all in delicate watercolor washes`
      watercolorTechnique = `Gentle radial gradient with soft edges, wet-on-wet blending technique, light transparent layers`
      break

    case 'bara': // 창조하다
      meaningVisualization = `
MEANING: CREATED - Divine act of creation
- Flowing watercolor particles and light
- Gentle brush stroke movements
- Soft pastel energy bursts
- Delicate artistic formation`
      colors = `Pastel pink, baby blue, soft yellow, mint, peach, lavender - watercolor palette`
      watercolorTechnique = `Dynamic but soft brush strokes, layered transparent washes, artistic watercolor texture`
      break

    case 'elohim': // 하나님
      meaningVisualization = `
MEANING: GOD - Divine presence and majesty
- Luminous watercolor orb with soft edges
- Holy radiance in gentle pastel tones
- Sacred atmosphere with delicate washes
- Peaceful divine presence`
      colors = `Soft gold, cream, pale yellow, light amber, powder blue - watercolor gradients`
      watercolorTechnique = `Soft central glow with watercolor blending, gentle radial washes, ethereal transparency`
      break

    case 'et': // 목적격 표지
      meaningVisualization = `
MEANING: OBJECT MARKER - Connection and flow
- Abstract flowing watercolor ribbon
- Gentle directional wash
- Soft connecting elements with brush strokes
- Delicate pastel movement`
      colors = `Pastel rainbow - pink, blue, mint, lavender, peach in soft watercolor tones`
      watercolorTechnique = `Flowing brush strokes, wet-on-wet blending, soft gradient transitions`
      break

    case 'hashamayim': // 하늘
      meaningVisualization = `
MEANING: HEAVENS - Celestial realm
- Soft watercolor clouds and sky
- Delicate atmospheric washes
- Gentle heavenly expanse
- Peaceful sky with artistic brush strokes`
      colors = `Sky blue, powder blue, soft pink, cream, lavender - watercolor sky palette`
      watercolorTechnique = `Cloud-like soft washes, gentle sky gradients, ethereal watercolor atmosphere`
      break

    case 'veet': // 그리고 ~을/를
      meaningVisualization = `
MEANING: AND - Connection and unity
- Gentle watercolor ribbon or bridge
- Soft flowing connection with brush strokes
- Harmonious pastel blend
- Delicate unifying elements`
      colors = `Pastel rainbow blend - pink, mint, blue, peach, yellow in soft watercolor`
      watercolorTechnique = `Flowing ribbons with soft edges, wet-on-wet transitions, gentle color blending`
      break

    case 'haaretz': // 땅
      meaningVisualization = `
MEANING: EARTH - Ground and land
- Gentle watercolor rolling hills
- Soft landscape with brush strokes
- Natural elements in pastel tones
- Peaceful terrain with artistic washes`
      colors = `Mint green, sage, cream, soft beige, powder blue, peach - watercolor earth palette`
      watercolorTechnique = `Soft rolling shapes, layered washes, gentle earth tones with watercolor texture`
      break
  }

  return `
WATERCOLOR PASTEL PAINTING - PROFESSIONAL TECHNIQUE

${meaningVisualization}

WATERCOLOR TECHNIQUE (ESSENTIAL):
${watercolorTechnique}
- Wet-on-wet watercolor blending
- Soft brush stroke texture visible
- Delicate transparent layers
- Artistic watercolor paper texture
- Gentle color bleeding and gradients
- Hand-painted aesthetic

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Main watercolor content centered
- Bottom 20%: SOLID BRIGHT PASTEL WASH (cream or pale pink watercolor)
- NO content in bottom 20% - completely empty solid color
- Leave bottom area bright and blank for text

WATERCOLOR BACKGROUND (ENTIRE IMAGE):
- Soft watercolor wash base:
  * Creamy vanilla (#FFF9E6, #FFFAF0)
  * Pale blush pink (#FFF0F5, #FFE4E1)
  * Baby powder blue (#F0F8FF, #E6F3FF)
- Choose ONE for entire background wash
- Background brightness: minimum 240/255
- Subtle watercolor paper texture

WATERCOLOR COLORS IN UPPER 80%:
${colors}
- Delicate pastel watercolor palette
- Brightness > 180/255 minimum
- Soft, transparent washes
- Gentle artistic brush strokes
- Layered watercolor effects

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty solid pastel wash
✅ Bright pastel watercolor colors only
✅ Visible watercolor brush stroke texture
✅ Soft wet-on-wet blending technique
✅ Hand-painted artistic quality
✅ Peaceful, ethereal atmosphere

FORBIDDEN:
❌ NO dark colors (no navy, black, dark gray)
❌ NO content in bottom 20%
❌ NO harsh edges (use soft watercolor blending)
❌ NO digital/flat look (must be watercolor painting)

WATERCOLOR PAINTING STYLE:
- Professional watercolor painting technique
- Soft pastel color palette with gentle brush strokes
- Wet-on-wet watercolor blending and gradients
- Delicate pastel hues with artistic texture
- Hand-painted watercolor aesthetic
- Dreamy, ethereal Biblical sacred art
- Gentle, peaceful, high quality watercolor
- Visible paper texture and paint transparency

Pure abstract watercolor art - soft shapes, delicate pastel washes, gentle light, artistic brush strokes.
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

  const prompt = generateWatercolorPrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 수채화 파스텔 생성 중...\n`)

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
  tsx scripts/test/generateGenesis1_1_Watercolor.ts <schnell|pro|both>

예시:
  tsx scripts/test/generateGenesis1_1_Watercolor.ts schnell  # FLUX Schnell만
  tsx scripts/test/generateGenesis1_1_Watercolor.ts pro      # FLUX 1.1 Pro만
  tsx scripts/test/generateGenesis1_1_Watercolor.ts both     # 둘 다
    `)
    process.exit(1)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎨 창세기 1:1 수채화 파스텔 이미지 생성 비교')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`총 ${GENESIS_1_1_WORDS.length}개 단어`)
  console.log(`모델: ${model === 'both' ? 'FLUX Schnell + FLUX 1.1 Pro' : model}`)
  console.log(`스타일: 수채화 파스텔 (강화)\n`)

  const models: ('schnell' | 'pro')[] = model === 'both' ? ['schnell', 'pro'] : [model]

  for (const currentModel of models) {
    console.log(`\n\n🚀 ${currentModel === 'schnell' ? 'FLUX Schnell' : 'FLUX 1.1 Pro'} 수채화 생성 시작\n`)

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
    console.log(`📊 ${currentModel === 'schnell' ? 'FLUX Schnell' : 'FLUX 1.1 Pro'} 수채화 결과`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    console.log(`✅ 성공: ${successCount}/${GENESIS_1_1_WORDS.length}`)
    console.log(`⏱️  총 시간: ${totalDuration.toFixed(2)}초`)
    console.log(`⏱️  평균 시간: ${(totalDuration / successCount).toFixed(2)}초/이미지`)
    console.log(`📦 평균 크기: ${avgSize.toFixed(2)} KB`)
    console.log(`💰 총 비용: $${(successCount * (currentModel === 'schnell' ? 0.003 : 0.04)).toFixed(3)}`)
    console.log(`📁 저장 위치: output/genesis1_1_comparison/${currentModel}/`)
  }

  console.log(`\n\n🎉 모든 수채화 이미지 생성 완료!`)
  console.log(`\n비교를 위해 두 폴더의 이미지를 확인하세요:`)
  console.log(`  - output/genesis1_1_comparison/schnell/`)
  console.log(`  - output/genesis1_1_comparison/pro/\n`)
}

main().catch(console.error)
