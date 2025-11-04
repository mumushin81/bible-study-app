#!/usr/bin/env tsx

/**
 * 창세기 1:1 의미 강조 이미지 생성
 * FLUX Schnell - 단어 의미를 더 명확하게 시각화
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
 * 의미 강조 프롬프트 생성
 */
function generateMeaningEmphasisPrompt(word: WordInfo): string {
  let meaningVisualization = ''
  let visualElements = ''
  let colors = ''

  switch (word.filename) {
    case 'bereshit': // 태초, 시작
      meaningVisualization = `
CORE MEANING: THE BEGINNING - The very first moment of creation

VISUAL CONCEPT (EMPHASIZED):
- STRONG radial light burst from center point
- CLEAR defined rays of light spreading outward in all directions
- Central bright point representing "the beginning"
- Multiple colored rays (golden, pink, blue, mint)
- Visible starburst pattern
- Dynamic "moment of beginning" energy`

      visualElements = `
- Central focal point: bright light source
- 12-16 defined light rays radiating outward
- Each ray in different pastel color
- Clear geometric starburst shape`

      colors = `Golden yellow (#FFE66D), rose pink (#FFB3C6), sky blue (#A8D8FF), mint (#B5E7D0), lavender (#DCC6FF), peach (#FFCCB8)`
      break

    case 'bara': // 창조하다
      meaningVisualization = `
CORE MEANING: CREATED - Active divine creation, bringing into existence

VISUAL CONCEPT (EMPHASIZED):
- DYNAMIC explosion of creative energy
- Multiple colored particles bursting outward
- Visible flow and movement
- Colorful energetic formation
- Clear sense of "making" and "forming"
- Vibrant creative power`

      visualElements = `
- Central burst point
- Flowing colorful particles and shapes
- Multiple pastel colors in motion
- Dynamic swirling patterns`

      colors = `Coral (#FFB5B5), turquoise (#7FE5E5), sunny yellow (#FFF48F), mint (#98E8C8), peach (#FFCCB8), lilac (#D7B5FF), rose (#FFD4E5)`
      break

    case 'elohim': // 하나님
      meaningVisualization = `
CORE MEANING: GOD - Divine presence, holy majesty, creator

VISUAL CONCEPT (EMPHASIZED):
- POWERFUL radiant divine light from center
- STRONG glowing orb of holy presence
- Clear rays of divine glory
- Sacred golden radiance
- Majestic powerful atmosphere
- Unmistakable divine presence`

      visualElements = `
- Large central glowing orb
- Strong radiating light beams
- Golden sacred atmosphere
- Clear divine power visualization`

      colors = `Soft gold (#FFE8A3), bright cream (#FFF9E6), pale yellow (#FFF8B8), light amber (#FFD699), golden (#FFD666)`
      break

    case 'et': // 목적격 표지
      meaningVisualization = `
CORE MEANING: OBJECT MARKER - Connecting word, directional pointer

VISUAL CONCEPT (EMPHASIZED):
- CLEAR flowing ribbon or wave
- VISIBLE direction and movement
- Distinct connecting shape
- Colorful flowing band
- Obvious sense of "pointing to" or "toward"
- Smooth directional flow`

      visualElements = `
- Curved flowing ribbon shape
- Clear direction of flow
- Multi-colored gradient ribbon
- Visible connecting element`

      colors = `Pink (#FFD4E5), sky blue (#C4E3FF), mint (#C8F5E8), lavender (#E5D4FF), peach (#FFE0CC), yellow (#FFF5C2)`
      break

    case 'hashamayim': // 하늘
      meaningVisualization = `
CORE MEANING: HEAVENS - Sky, celestial realm, atmospheric expanse

VISUAL CONCEPT (EMPHASIZED):
- CLEAR fluffy clouds
- DISTINCT sky atmosphere
- Visible soft cloud formations
- Peaceful heavenly expanse
- Light airy feeling
- Obvious "sky" element`

      visualElements = `
- 2-3 distinct soft cloud shapes
- Sky blue background
- Pink/white cloud colors
- Clear celestial atmosphere`

      colors = `Sky blue (#B3E0FF), powder blue (#D4F1FF), cloud white (#FFFFFF), soft pink (#FFE5F0), peach (#FFE0CC), cream (#FFF9E6)`
      break

    case 'veet': // 그리고 ~을/를
      meaningVisualization = `
CORE MEANING: AND - Conjunction, bringing together, unity

VISUAL CONCEPT (EMPHASIZED):
- TWO flowing ribbons connecting/merging
- CLEAR sense of "bringing together"
- Visible joining or linking
- Harmonious color blend where they meet
- Obvious connection and unity
- Smooth flowing together`

      visualElements = `
- Two curved ribbons meeting
- Different colors blending together
- Clear connection point
- Flowing unity visualization`

      colors = `Pink (#FFD9E8), mint (#C3F5E4), sky blue (#C8E6FF), peach (#FFE5CC), yellow (#FFF5C2), lavender (#E8DCFF)`
      break

    case 'haaretz': // 땅
      meaningVisualization = `
CORE MEANING: EARTH - Ground, land, terrestrial realm

VISUAL CONCEPT (EMPHASIZED):
- CLEAR rolling hills or landscape
- VISIBLE earth/ground shapes
- Distinct landform contours
- Peaceful terrain
- Obvious "earth" or "land" element
- Gentle natural landscape`

      visualElements = `
- 2-3 distinct rolling hill shapes
- Clear horizon line
- Layered landscape forms
- Natural earth contours`

      colors = `Mint green (#C1F0DD), sage (#D4E8D4), cream (#FFF9E6), soft beige (#FFE8D6), powder blue (#D4F1FF), peach (#FFE5CC)`
      break
  }

  return `
MEANING-EMPHASIZED CLEAN PASTEL ART

${meaningVisualization}

SPECIFIC VISUAL ELEMENTS TO INCLUDE:
${visualElements}

ART STYLE:
- Clean digital pastel gradients
- CLEAR recognizable shapes and forms
- Smooth soft edges but VISIBLE elements
- NO watercolor texture
- Modern aesthetic with strong meaning
- Simple but MEANINGFUL content

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Main visual content CLEARLY centered
- Visual elements should be OBVIOUS and RECOGNIZABLE
- Bottom 20%: SOLID bright pastel color (cream #FFF9E6)
- NO content in bottom 20%
- Strong focal point in upper area

COLORS & BRIGHTNESS:
${colors}
- Bright vibrant pastel palette
- Smooth gradients
- ALL colors brightness > 180/255
- Multiple harmonious colors
- Clean modern look

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty solid pastel
✅ CLEAR visual element representing the meaning
✅ NOT just gradients - must have recognizable shapes
✅ Strong emphasis on word meaning
✅ Bright vibrant pastels
✅ Smooth clean style

FORBIDDEN:
❌ NO dark colors
❌ NO content in bottom 20%
❌ NO watercolor effects
❌ NO abstract-only compositions
❌ NO minimal/empty look
❌ Visual meaning must be CLEAR

EMPHASIS: Make the meaning of "${word.meaning}" VISUALLY OBVIOUS through clear shapes, forms, and composition.
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
  console.log(`의미 강조 재생성: ${word.meaning}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const prompt = generateMeaningEmphasisPrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 의미 강조 생성 중...\n`)

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
  console.log('🎯 창세기 1:1 의미 강조 이미지 생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`총 ${GENESIS_1_1_WORDS.length}개 단어`)
  console.log(`목표: 단어 의미를 명확하게 시각화\n`)

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
  console.log(`📊 의미 강조 이미지 생성 결과`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  console.log(`✅ 성공: ${successCount}/${GENESIS_1_1_WORDS.length}`)
  console.log(`⏱️  총 시간: ${totalDuration.toFixed(2)}초`)
  console.log(`⏱️  평균 시간: ${(totalDuration / successCount).toFixed(2)}초/이미지`)
  console.log(`📦 평균 크기: ${avgSize.toFixed(2)} KB`)
  console.log(`💰 총 비용: $${(successCount * 0.003).toFixed(3)}`)
  console.log(`📁 저장 위치: output/genesis1_1_comparison/schnell/`)

  console.log(`\n\n🎉 의미 강조 이미지 생성 완료!\n`)
}

main().catch(console.error)
