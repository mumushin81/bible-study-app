#!/usr/bin/env tsx

/**
 * 창세기 1:1 추상적 의미 표현 이미지 생성
 * FLUX Schnell - 깔끔한 파스텔 + 추상적 의미 시각화
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
 * 추상적 의미 표현 프롬프트 생성
 */
function generateAbstractMeaningPrompt(word: WordInfo): string {
  let abstractConcept = ''
  let visualForm = ''
  let colors = ''

  switch (word.filename) {
    case 'bereshit': // 태초, 시작
      abstractConcept = `
ABSTRACT MEANING: THE BEGINNING - Origin point, first moment

ABSTRACT VISUAL FORM:
- Central point of light as the origin
- Radiating gentle rays in multiple pastel colors
- Sense of expansion from a single point
- Dawn-like gradient spreading outward
- Soft starburst pattern in pastels
- Abstract representation of "first moment"`

      visualForm = `Soft radial gradient with gentle light rays in pastel colors`
      colors = `Golden yellow (#FFE66D), rose pink (#FFB3C6), sky blue (#A8D8FF), mint (#B5E7D0), lavender (#DCC6FF), cream (#FFF9E6)`
      break

    case 'bara': // 창조하다
      abstractConcept = `
ABSTRACT MEANING: CREATED - Formation, bringing into being

ABSTRACT VISUAL FORM:
- Abstract flowing forms coming together
- Colorful pastel shapes in gentle motion
- Sense of formation and emergence
- Soft swirling abstract patterns
- Multiple pastel colors blending harmoniously
- Visual representation of "making" or "forming"`

      visualForm = `Abstract flowing shapes and soft color blends in motion`
      colors = `Coral (#FFB5B5), turquoise (#A8E6E6), sunny yellow (#FFF48F), mint (#98E8C8), peach (#FFCCB8), lilac (#D7B5FF)`
      break

    case 'elohim': // 하나님
      abstractConcept = `
ABSTRACT MEANING: GOD - Divine presence, sacred power

ABSTRACT VISUAL FORM:
- Luminous abstract center representing divine presence
- Soft golden radiance emanating outward
- Gentle light without specific form
- Sacred atmosphere through pure light
- Abstract representation of holy presence
- Peaceful glowing essence`

      visualForm = `Soft glowing abstract light in golden pastels`
      colors = `Soft gold (#FFE8A3), warm cream (#FFF9E6), pale yellow (#FFF8B8), light amber (#FFD699), powder blue (#E6F3FF)`
      break

    case 'et': // 목적격 표지
      abstractConcept = `
ABSTRACT MEANING: OBJECT MARKER - Direction, connection

ABSTRACT VISUAL FORM:
- Abstract flowing wave or ribbon
- Sense of directional movement
- Soft curved form suggesting "toward"
- Simple flowing shape in pastel gradients
- Visual representation of connection
- Gentle directional flow`

      visualForm = `Abstract curved ribbon in soft pastel gradient`
      colors = `Pink (#FFD4E5), sky blue (#C4E3FF), mint (#C8F5E8), lavender (#E5D4FF), peach (#FFE0CC)`
      break

    case 'hashamayim': // 하늘
      abstractConcept = `
ABSTRACT MEANING: HEAVENS - Sky, celestial expanse

ABSTRACT VISUAL FORM:
- Abstract soft cloud-like forms
- Airy, light, ethereal atmosphere
- Gentle floating shapes
- Sky gradient with soft elements
- Peaceful celestial feeling
- Open, expansive atmosphere`

      visualForm = `Soft cloud forms in sky blue and pink pastels`
      colors = `Sky blue (#B3E0FF), powder blue (#D4F1FF), soft pink (#FFE5F0), cloud white (#FFFFFF), cream (#FFF9E6)`
      break

    case 'veet': // 그리고 ~을/를
      abstractConcept = `
ABSTRACT MEANING: AND - Unity, bringing together

ABSTRACT VISUAL FORM:
- Two abstract flows merging gently
- Sense of coming together
- Harmonious blending of colors
- Soft meeting point of two elements
- Visual representation of union
- Gentle integration`

      visualForm = `Two soft flowing forms joining in pastel gradient`
      colors = `Pink (#FFD9E8), mint (#C3F5E4), sky blue (#C8E6FF), peach (#FFE5CC), lavender (#E8DCFF)`
      break

    case 'haaretz': // 땅
      abstractConcept = `
ABSTRACT MEANING: EARTH - Ground, land

ABSTRACT VISUAL FORM:
- Abstract rolling landscape forms
- Gentle wave-like contours suggesting terrain
- Soft layered shapes representing earth
- Natural pastel earth tones
- Peaceful ground-level feeling
- Gentle undulating forms`

      visualForm = `Soft rolling abstract landscape in earth-tone pastels`
      colors = `Mint green (#C1F0DD), sage (#D4E8D4), cream (#FFF9E6), soft beige (#FFE8D6), powder blue (#E6F3FF)`
      break
  }

  return `
ABSTRACT MEANING EXPRESSION - CLEAN PASTEL ART

${abstractConcept}

VISUAL APPROACH:
${visualForm}

STYLE REQUIREMENTS:
- Clean digital pastel gradients
- Abstract shapes and forms (NOT literal objects)
- Smooth soft gradients
- NO watercolor texture
- NO text or letters of any kind
- Pure abstract visual representation
- Modern minimalist aesthetic
- Meaning expressed through form, color, and composition

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Abstract visual content centered
- Bottom 20%: SOLID bright pastel color (cream #FFF9E6)
- NO content in bottom 20%
- Peaceful, balanced composition

COLORS:
${colors}
- Bright vibrant pastel palette
- ALL colors brightness > 180/255
- Smooth gradients and transitions
- Harmonious color relationships
- Clean modern pastel look

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty solid pastel
✅ Abstract forms only (no literal representations)
✅ NO text, letters, or words of any kind
✅ Bright pastel colors only
✅ Clean smooth gradients
✅ Meaning through abstract visual language

STRICTLY FORBIDDEN:
❌ NO dark colors (no navy, black, dark gray, dark blue, dark red)
❌ NO text or typography
❌ NO literal objects or realistic elements
❌ NO watercolor effects
❌ NO content in bottom 20%

Abstract pastel art expressing the meaning of "${word.meaning}" through pure form, color, and light.
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
  console.log(`추상적 의미 표현: ${word.meaning}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const prompt = generateAbstractMeaningPrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 추상 파스텔 생성 중...\n`)

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
  console.log('🎨 창세기 1:1 추상적 의미 파스텔 이미지 생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`총 ${GENESIS_1_1_WORDS.length}개 단어`)
  console.log(`스타일: 깔끔한 파스텔 + 추상적 의미 표현`)
  console.log(`조건: 텍스트 없음, 밝은 색상만\n`)

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
  console.log(`📊 추상적 의미 파스텔 결과`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  console.log(`✅ 성공: ${successCount}/${GENESIS_1_1_WORDS.length}`)
  console.log(`⏱️  총 시간: ${totalDuration.toFixed(2)}초`)
  console.log(`⏱️  평균 시간: ${(totalDuration / successCount).toFixed(2)}초/이미지`)
  console.log(`📦 평균 크기: ${avgSize.toFixed(2)} KB`)
  console.log(`💰 총 비용: $${(successCount * 0.003).toFixed(3)}`)
  console.log(`📁 저장 위치: output/genesis1_1_comparison/schnell/`)

  console.log(`\n\n🎉 추상적 의미 파스텔 이미지 생성 완료!\n`)
}

main().catch(console.error)
