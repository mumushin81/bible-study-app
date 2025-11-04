#!/usr/bin/env tsx

/**
 * 규칙 위반 이미지 재생성
 * bara (텍스트), bereshit (미니멀), et (미니멀)
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
  filename: string
}

// 재생성할 단어들
const WORDS_TO_REGENERATE: WordInfo[] = [
  {
    hebrew: 'בְּרֵאשִׁית',
    meaning: '태초에, 처음에, 시작',
    korean: '베레쉬트',
    filename: 'bereshit'
  },
  {
    hebrew: 'בָּרָא',
    meaning: '창조하셨다',
    korean: '바라',
    filename: 'bara'
  },
  {
    hebrew: 'אֵת',
    meaning: '~을/를 (목적격 표지)',
    korean: '에트',
    filename: 'et'
  }
]

/**
 * 강화된 추상적 의미 프롬프트 생성
 */
function generateEnhancedPrompt(word: WordInfo): string {
  let abstractConcept = ''
  let visualForm = ''
  let colors = ''

  switch (word.filename) {
    case 'bereshit': // 태초, 시작
      abstractConcept = `
ABSTRACT MEANING: THE BEGINNING - First moment, origin

CLEAR ABSTRACT VISUAL:
- VISIBLE radial light burst from center point
- Multiple distinct pastel rays spreading outward
- Clear starburst or sunburst pattern
- Dawn gradient with defined rays
- Recognizable "beginning" energy
- NOT just solid gradient - needs visible rays`

      visualForm = `Radial starburst with 12-16 visible light rays in multiple pastel colors`
      colors = `Golden yellow (#FFE66D), rose pink (#FFB3C6), sky blue (#A8D8FF), mint (#B5E7D0), lavender (#DCC6FF), peach (#FFCCB8)`
      break

    case 'bara': // 창조하다
      abstractConcept = `
ABSTRACT MEANING: CREATED - Formation, creative action

CLEAR ABSTRACT VISUAL:
- VISIBLE flowing abstract forms
- Multiple colorful shapes in gentle motion
- Recognizable swirling or flowing patterns
- Distinct pastel color shapes blending
- Clear sense of formation
- NOT just blur - needs defined soft shapes`

      visualForm = `Abstract flowing shapes and soft color forms with visible movement`
      colors = `Coral (#FFB5B5), turquoise (#A8E6E6), sunny yellow (#FFF48F), mint (#98E8C8), peach (#FFCCB8), lilac (#D7B5FF), rose (#FFD4E5)`
      break

    case 'et': // 목적격 표지
      abstractConcept = `
ABSTRACT MEANING: OBJECT MARKER - Direction, flow toward

CLEAR ABSTRACT VISUAL:
- VISIBLE curved ribbon or wave shape
- Clear directional flow pattern
- Recognizable flowing form
- Multi-colored gradient ribbon
- Distinct shape showing movement
- NOT just gradient - needs visible curved form`

      visualForm = `Curved flowing ribbon with clear shape in pastel gradient`
      colors = `Pink (#FFD4E5), sky blue (#C4E3FF), mint (#C8F5E8), lavender (#E5D4FF), peach (#FFE0CC), yellow (#FFF5C2)`
      break
  }

  return `
ENHANCED ABSTRACT PASTEL ART - CLEAR VISUAL FORMS

${abstractConcept}

VISUAL APPROACH:
${visualForm}

CRITICAL REQUIREMENTS:
- CLEAR recognizable abstract shapes (not just gradients)
- VISIBLE forms with soft edges
- DISTINCT visual elements
- Multiple pastel colors
- Abstract representation with clear form

STYLE:
- Clean digital pastel gradients
- Abstract shapes with VISIBLE definition
- Smooth soft edges but CLEAR forms
- NO watercolor texture
- ABSOLUTELY NO text, letters, or words
- Pure abstract visual representation
- Modern minimalist with content

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Abstract visual content with CLEAR forms
- Bottom 20%: SOLID bright pastel color (cream #FFF9E6)
- NO content in bottom 20%
- Balanced, meaningful composition

COLORS:
${colors}
- Bright vibrant pastel palette
- ALL colors brightness > 180/255
- Smooth transitions
- Harmonious relationships
- Clean modern pastel look

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty solid pastel
✅ CLEAR abstract forms (not just gradients)
✅ ABSOLUTELY NO text, letters, or typography
✅ Bright pastel colors only
✅ Visible meaningful content
✅ Clean smooth style

STRICTLY FORBIDDEN:
❌ NO dark colors whatsoever
❌ NO text, letters, words, or typography of any kind
❌ NO watercolor effects
❌ NO overly minimal/empty compositions
❌ NO content in bottom 20%

Abstract pastel art with CLEAR VISIBLE forms expressing "${word.meaning}".
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
  console.log(`규칙 위반 재생성: ${word.meaning}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const prompt = generateEnhancedPrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 재생성 중...\n`)

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
  console.log('🔄 규칙 위반 이미지 재생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`재생성 대상: ${WORDS_TO_REGENERATE.length}개`)
  console.log(`- bara: 텍스트 위반`)
  console.log(`- bereshit: 내용 부족`)
  console.log(`- et: 내용 부족\n`)

  const results: any[] = []
  const startTime = Date.now()

  for (let i = 0; i < WORDS_TO_REGENERATE.length; i++) {
    const word = WORDS_TO_REGENERATE[i]
    const result = await generateImage(word, i + 1, WORDS_TO_REGENERATE.length)
    results.push(result)

    // Rate limit 방지
    if (i < WORDS_TO_REGENERATE.length - 1) {
      console.log('\n⏸️  2초 대기...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const totalDuration = (Date.now() - startTime) / 1000
  const successCount = results.filter(r => r.success).length

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 재생성 결과`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  console.log(`✅ 성공: ${successCount}/${WORDS_TO_REGENERATE.length}`)
  console.log(`⏱️  총 시간: ${totalDuration.toFixed(2)}초`)
  console.log(`💰 총 비용: $${(successCount * 0.003).toFixed(3)}`)

  console.log(`\n\n🎉 재생성 완료!\n`)
}

main().catch(console.error)
