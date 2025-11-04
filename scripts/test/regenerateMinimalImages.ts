#!/usr/bin/env tsx

/**
 * 너무 미니멀한 이미지 재생성
 * elohim, hashamayim - 의미 있는 내용 추가
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
    hebrew: 'אֱלֹהִים',
    meaning: '하나님',
    korean: '엘로힘',
    filename: 'elohim'
  },
  {
    hebrew: 'הַשָּׁמַיִם',
    meaning: '하늘들',
    korean: '하샤마임',
    filename: 'hashamayim'
  }
]

/**
 * 의미 있는 단순 프롬프트 생성
 */
function generateMeaningfulPrompt(word: WordInfo): string {
  let visualization = ''
  let colors = ''

  switch (word.filename) {
    case 'elohim': // 하나님
      visualization = `
MEANING: GOD - Divine presence and majesty

VISUAL CONCEPT:
- Central luminous orb of divine light
- Soft golden rays radiating outward
- Gentle glow representing holy presence
- Peaceful yet powerful atmosphere
- Sacred radiance and glory

SIMPLE BUT MEANINGFUL:
- Clear central light source
- Smooth radiating beams
- Clean, elegant composition
- Divine atmosphere`
      colors = `Soft gold (#FFE8A3), warm cream (#FFF9E6), pale yellow (#FFF8B8), light amber (#FFD699), powder blue (#C8E6FF), soft pink (#FFE5F0)`
      break

    case 'hashamayim': // 하늘
      visualization = `
MEANING: HEAVENS - Celestial realm

VISUAL CONCEPT:
- Soft fluffy clouds in pastel colors
- Peaceful sky atmosphere
- Gentle celestial elements
- Serene heavenly expanse
- Light and airy feel

SIMPLE BUT MEANINGFUL:
- Clear cloud shapes
- Soft sky gradient
- Clean composition
- Peaceful atmosphere`
      colors = `Sky blue (#B3E0FF), powder blue (#D4F1FF), soft pink (#FFE5F0), peach (#FFE0CC), cream (#FFF9E6), lavender (#E8DCFF)`
      break
  }

  return `
SIMPLE YET MEANINGFUL PASTEL ART

${visualization}

ART STYLE:
- Clean digital pastel gradients
- Simple but clear visual elements
- Smooth soft shapes with gentle definition
- NO watercolor texture
- Modern minimalist aesthetic
- Meaningful content (not empty)

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Main visual content centered
- Bottom 20%: SOLID bright pastel color (cream #FFF9E6)
- NO content in bottom 20%
- Clear focal point in upper area

BACKGROUND & COLORS:
${colors}
- Bright pastel palette
- Smooth gradients
- Brightness > 180/255
- Multiple harmonious colors
- Clean modern look

ABSOLUTE REQUIREMENTS:
✅ 9:16 portrait (vertical mobile)
✅ Bottom 20% empty solid pastel
✅ CLEAR visual element (not just gradient)
✅ Simple but meaningful content
✅ Bright vibrant pastels
✅ Smooth clean gradients

FORBIDDEN:
❌ NO dark colors
❌ NO content in bottom 20%
❌ NO watercolor effects
❌ NO completely empty/minimal look
❌ Must have recognizable visual element

Simple, clean, meaningful pastel art with clear visual focus.
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
  console.log(`재생성: 의미 있는 내용 추가`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const prompt = generateMeaningfulPrompt(word)

  console.log(`💭 의미: ${word.meaning}`)
  console.log(`🎨 생성 중...\n`)

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
  console.log('🔄 미니멀 이미지 재생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`재생성 대상: ${WORDS_TO_REGENERATE.length}개`)
  console.log(`목표: 단순하지만 의미 있는 내용\n`)

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
  console.log(`📁 저장 위치: output/genesis1_1_comparison/schnell/`)

  console.log(`\n\n🎉 재생성 완료!\n`)
}

main().catch(console.error)
