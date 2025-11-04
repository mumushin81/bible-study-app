#!/usr/bin/env tsx

import Replicate from 'replicate'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

interface WordInfo {
  filename: string
  hebrew: string
  korean: string
  meaning: string
  visualForm: string
}

const GENESIS_1_2_WORDS: WordInfo[] = [
  {
    filename: 'vehaaretz',
    hebrew: 'וְהָאָרֶץ',
    korean: '베하아레츠',
    meaning: '그리고 땅은',
    visualForm: `Soft horizontal gradient layers creating earth-like formations
- Gentle rolling hills silhouette in pastel
- Horizontal bands of cream, peach, and soft brown tones
- Stable, grounded feeling with smooth curves
- Multiple pastel layers suggesting depth`
  },
  {
    filename: 'tohu_vavohu',
    hebrew: 'תֹהוּ וָבֹהוּ',
    korean: '토후 바보후',
    meaning: '혼돈과 공허',
    visualForm: `Abstract swirling patterns suggesting chaos and void
- Irregular flowing shapes in bright pastels
- Scattered fragments floating in space
- Soft spirals and curves in random directions
- Light lavender, mint, and pale yellow mixing
- Sense of formlessness but still bright and gentle`
  },
  {
    filename: 'vechoshech',
    hebrew: 'וְחֹשֶׁךְ',
    korean: '베호쉐크',
    meaning: '그리고 어둠',
    visualForm: `Deep space feeling with bright pastel tones (NOT dark colors)
- Deep lavender and periwinkle gradients
- Soft purple and blue-violet tones
- Mysterious but luminous atmosphere
- Glowing pastel aura suggesting twilight
- Remember: NO black or dark colors, use BRIGHT pastels only`
  },
  {
    filename: 'tehom',
    hebrew: 'תְהוֹם',
    korean: '테홈',
    meaning: '깊은 물, 심연',
    visualForm: `Abstract representation of deep waters
- Flowing wave-like gradients
- Concentric circles suggesting depth
- Aqua, cyan, and soft turquoise pastels
- Layered ripples expanding outward
- Sense of endless depth with bright colors`
  },
  {
    filename: 'ruach_elohim',
    hebrew: 'רוּחַ אֱלֹהִים',
    korean: '루아흐 엘로힘',
    meaning: '하나님의 영',
    visualForm: `Divine breath and spirit in motion
- Gentle flowing curves suggesting wind
- Ethereal wisps and flowing ribbons
- Bright white mixed with pale gold and sky blue
- Sense of life-giving movement
- Luminous and uplifting feeling`
  },
  {
    filename: 'merachefet',
    hebrew: 'מְרַחֶפֶת',
    korean: '메라헤페트',
    meaning: '운행하다, 맴돌다',
    visualForm: `Circular motion and hovering movement
- Soft spiral patterns
- Gentle rotating gradients
- Pastel rainbow flowing in circular motion
- Sense of graceful hovering
- Smooth continuous curves`
  },
  {
    filename: 'hamayim',
    hebrew: 'הַמָּיִם',
    korean: '하마임',
    meaning: '물들',
    visualForm: `Flowing water in gentle waves
- Soft horizontal wave patterns
- Blue, cyan, and aqua pastels
- Ripples and flowing streams
- Transparent overlapping layers
- Peaceful water movement`
  }
]

function generatePrompt(word: WordInfo): string {
  return `
ABSTRACT PASTEL ART - ABSOLUTELY NO TEXT

MEANING: ${word.meaning.toUpperCase()}

VISUAL CONCEPT:
${word.visualForm}

STYLE:
- Clean digital pastel gradients
- Soft flowing forms
- Modern minimalist aesthetic
- Pure visual representation
- NO TYPOGRAPHY EVER

COMPOSITION (9:16 PORTRAIT - MOBILE):
- Upper 80%: Abstract visual content centered
- Bottom 20%: SOLID bright pastel color (cream #FFF9E6)
- NO content in bottom 20%

COLORS (BRIGHT PASTELS ONLY):
- Golden yellow (#FFE66D), rose pink (#FFB3C6), sky blue (#A8D8FF)
- Mint (#B5E7D0), lavender (#DCC6FF), peach (#FFCCB8)
- Aqua (#A8E6E3), periwinkle (#CCCCFF)
- ALL brightness MUST BE > 180/255
- Use multiple pastel colors blending smoothly

CRITICAL RULES:
✅ 9:16 portrait vertical (ABSOLUTE REQUIREMENT)
✅ Bottom 20% empty solid pastel
✅ Bright pastels only - NO DARK COLORS
✅ Clear visible visual patterns
✅ NO TEXT - NO LETTERS - NO WORDS - NO TYPOGRAPHY WHATSOEVER

STRICTLY FORBIDDEN:
❌ ABSOLUTELY NO TEXT OR LETTERS OF ANY KIND IN ANY LANGUAGE
❌ NO WORDS OR TYPOGRAPHY
❌ NO dark colors (no black, navy, dark blue, dark red, dark brown)
❌ NO watercolor bleeding effects
❌ NO realistic objects

Pure abstract pastel visual - shapes and gradients only, never text.
`.trim()
}

async function generateImage(word: WordInfo, index: number, total: number) {
  console.log(`\n[${ index + 1}/${total}] 생성 중: ${word.hebrew} (${word.korean})`)
  console.log(`   의미: ${word.meaning}`)
  console.log(`   파일: ${word.filename}.jpg`)

  const prompt = generatePrompt(word)

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

    const imageUrl = Array.isArray(output) ? output[0] : output
    console.log(`   ⏱️  이미지 생성 완료, 다운로드 중...`)

    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()

    // 디렉토리 생성
    const outputDir = join(process.cwd(), 'output/genesis1_2')
    mkdirSync(outputDir, { recursive: true })

    const filepath = join(outputDir, `${word.filename}.jpg`)
    writeFileSync(filepath, Buffer.from(buffer))

    const sizeKB = (buffer.byteLength / 1024).toFixed(2)
    console.log(`   ✅ 완료: ${sizeKB} KB`)

    return { success: true, word, size: buffer.byteLength }
  } catch (error: any) {
    console.error(`   ❌ 실패: ${error.message}`)
    return { success: false, word, error: error.message }
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎨 창세기 1:2절 이미지 생성 (FLUX Schnell)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n총 ${GENESIS_1_2_WORDS.length}개 이미지 생성 예정`)
  console.log(`모델: FLUX Schnell`)
  console.log(`비율: 9:16 (모바일 세로)`)
  console.log(`비용: $${(GENESIS_1_2_WORDS.length * 0.003).toFixed(3)}\n`)

  const results = []
  let totalSize = 0

  for (let i = 0; i < GENESIS_1_2_WORDS.length; i++) {
    const result = await generateImage(GENESIS_1_2_WORDS[i], i, GENESIS_1_2_WORDS.length)
    results.push(result)

    if (result.success && result.size) {
      totalSize += result.size
    }

    // Rate limit 방지
    if (i < GENESIS_1_2_WORDS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 생성 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const successCount = results.filter(r => r.success).length
  const avgSize = totalSize / successCount / 1024

  console.log(`✅ 성공: ${successCount}/${GENESIS_1_2_WORDS.length}`)
  console.log(`📁 평균 크기: ${avgSize.toFixed(2)} KB`)
  console.log(`💰 총 비용: $${(successCount * 0.003).toFixed(3)}`)

  if (successCount === GENESIS_1_2_WORDS.length) {
    console.log('\n🎉 모든 이미지 생성 완료!')
    console.log('\n📂 저장 위치: output/genesis1_2/')
    console.log('\n다음 단계:')
    console.log('  1. 이미지 검증 (텍스트, 어두운 색상 확인)')
    console.log('  2. Supabase Storage 업로드')
    console.log('  3. 데이터베이스 icon_url 업데이트\n')
  } else {
    console.log('\n⚠️  일부 이미지 생성 실패')
    const failed = results.filter(r => !r.success)
    console.log('\n실패한 이미지:')
    failed.forEach(f => {
      console.log(`  - ${f.word.hebrew} (${f.word.korean}): ${f.error}`)
    })
  }
}

main().catch(console.error)
