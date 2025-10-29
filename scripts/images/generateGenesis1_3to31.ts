#!/usr/bin/env tsx

import Replicate from 'replicate'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface WordData {
  id: string
  verse_id: string
  position: number
  hebrew: string
  meaning: string
}

function generateVisualConcept(meaning: string, hebrew: string): string {
  // 의미 기반으로 시각적 개념 생성
  const meaningLower = meaning.toLowerCase()

  // 빛 관련
  if (meaningLower.includes('빛') || meaningLower.includes('light')) {
    return `Radiant light rays spreading outward
- Bright golden and yellow pastel gradients
- Sunburst patterns with soft edges
- Luminous glow effect
- Warm and uplifting feeling`
  }

  // 하늘, 궁창 관련
  if (meaningLower.includes('하늘') || meaningLower.includes('궁창') || meaningLower.includes('sky') || meaningLower.includes('heaven')) {
    return `Expansive sky atmosphere
- Soft blue and white pastel gradients
- Gentle clouds floating
- Open and airy feeling
- Peaceful horizon line`
  }

  // 물 관련
  if (meaningLower.includes('물') || meaningLower.includes('water') || meaningLower.includes('바다') || meaningLower.includes('sea')) {
    return `Flowing water patterns
- Aqua, cyan, and turquoise pastels
- Soft wave movements
- Rippling water surface
- Transparent overlapping layers`
  }

  // 땅 관련
  if (meaningLower.includes('땅') || meaningLower.includes('earth') || meaningLower.includes('육지') || meaningLower.includes('land')) {
    return `Solid ground formations
- Cream, brown, and beige pastels
- Rolling hills silhouette
- Stable horizontal layers
- Grounded and earthy feeling`
  }

  // 식물 관련
  if (meaningLower.includes('풀') || meaningLower.includes('나무') || meaningLower.includes('열매') ||
      meaningLower.includes('씨') || meaningLower.includes('plant') || meaningLower.includes('tree') ||
      meaningLower.includes('fruit') || meaningLower.includes('seed')) {
    return `Natural growth and vegetation
- Green, mint, and lime pastels
- Organic flowing shapes
- Growing upward patterns
- Living and fresh feeling`
  }

  // 해, 달, 별 관련
  if (meaningLower.includes('해') || meaningLower.includes('달') || meaningLower.includes('별') ||
      meaningLower.includes('sun') || meaningLower.includes('moon') || meaningLower.includes('star')) {
    return `Celestial bodies in space
- Golden, silver, and pale yellow pastels
- Circular glowing forms
- Cosmic atmosphere
- Mystical and ethereal feeling`
  }

  // 날짜, 시간 관련
  if (meaningLower.includes('날') || meaningLower.includes('밤') || meaningLower.includes('낮') ||
      meaningLower.includes('day') || meaningLower.includes('night') || meaningLower.includes('evening')) {
    return `Passage of time
- Gradient from light to dark pastels
- Circular clock-like patterns
- Flowing transition
- Temporal movement feeling`
  }

  // 생물 관련
  if (meaningLower.includes('생물') || meaningLower.includes('물고기') || meaningLower.includes('새') ||
      meaningLower.includes('짐승') || meaningLower.includes('living') || meaningLower.includes('fish') ||
      meaningLower.includes('bird') || meaningLower.includes('animal')) {
    return `Living creatures abstract form
- Flowing organic shapes
- Multiple pastel colors
- Dynamic movement patterns
- Life and energy feeling`
  }

  // 사람, 형상 관련
  if (meaningLower.includes('사람') || meaningLower.includes('형상') || meaningLower.includes('모양') ||
      meaningLower.includes('man') || meaningLower.includes('image') || meaningLower.includes('likeness')) {
    return `Human form and divine image
- Graceful flowing silhouette
- Harmonious proportions
- Centered symmetrical composition
- Dignified and noble feeling`
  }

  // 하나님 관련
  if (meaningLower.includes('하나님') || meaningLower.includes('god') || meaningLower.includes('엘로힘')) {
    return `Divine presence and majesty
- Radiant golden and white pastels
- Ethereal glowing forms
- Sacred geometric patterns
- Powerful yet gentle feeling`
  }

  // 보다, 보았다
  if (meaningLower.includes('보') || meaningLower.includes('see') || meaningLower.includes('saw')) {
    return `Vision and observation
- Clear eye-like concentric circles
- Radiating awareness patterns
- Bright clarity
- Focused attention feeling`
  }

  // 좋다, 선하다
  if (meaningLower.includes('좋') || meaningLower.includes('good') || meaningLower.includes('선')) {
    return `Goodness and harmony
- Balanced pastel rainbow
- Peaceful geometric harmony
- Warm embracing colors
- Positive uplifting feeling`
  }

  // 만들다, 창조하다
  if (meaningLower.includes('만들') || meaningLower.includes('create') || meaningLower.includes('make')) {
    return `Creative formation process
- Emerging shapes from void
- Dynamic constructive patterns
- Building upward movement
- Creative energy feeling`
  }

  // 말씀하다
  if (meaningLower.includes('말씀') || meaningLower.includes('말하') || meaningLower.includes('said') || meaningLower.includes('speak')) {
    return `Divine speech and command
- Radiating sound wave patterns
- Flowing communication lines
- Powerful gentle waves
- Authoritative yet peaceful feeling`
  }

  // 축복하다
  if (meaningLower.includes('축복') || meaningLower.includes('bless')) {
    return `Blessing flowing down
- Descending gentle streams
- Warm golden light rays
- Nurturing embrace
- Loving and caring feeling`
  }

  // 기본 추상 패턴 (매칭되지 않는 경우)
  return `Abstract symbolic representation
- Flowing pastel gradients
- Soft geometric patterns
- Harmonious color blend
- Peaceful balanced composition`
}

function generatePrompt(word: WordData): string {
  const visualConcept = generateVisualConcept(word.meaning, word.hebrew)

  return `
ABSTRACT PASTEL ART - ABSOLUTELY NO TEXT

MEANING: ${word.meaning.toUpperCase()}

VISUAL CONCEPT:
${visualConcept}

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

async function generateImage(word: WordData, index: number, total: number) {
  const filename = `word_${word.id.replace(/-/g, '_')}`

  console.log(`\n[${index + 1}/${total}] 생성 중: ${word.hebrew}`)
  console.log(`   의미: ${word.meaning}`)
  console.log(`   구절: ${word.verse_id} [${word.position}]`)
  console.log(`   파일: ${filename}.jpg`)

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
    const outputDir = join(process.cwd(), 'output/genesis1_3to31')
    mkdirSync(outputDir, { recursive: true })

    const filepath = join(outputDir, `${filename}.jpg`)
    writeFileSync(filepath, Buffer.from(buffer))

    const sizeKB = (buffer.byteLength / 1024).toFixed(2)
    console.log(`   ✅ 완료: ${sizeKB} KB`)

    return { success: true, word, filename, size: buffer.byteLength }
  } catch (error: any) {
    console.error(`   ❌ 실패: ${error.message}`)
    return { success: false, word, filename, error: error.message }
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎨 창세기 1:3-31절 이미지 생성 (FLUX Schnell)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 데이터베이스에서 단어 가져오기
  console.log('\n📊 데이터베이스에서 단어 가져오는 중...')

  const { data: words, error } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, meaning, icon_url')
    .like('verse_id', 'genesis_1_%')
    .order('verse_id')
    .order('position')

  if (error) {
    console.error('❌ Error fetching words:', error)
    return
  }

  // Filter for verses 3-31 only, and words without images
  const wordsToGenerate = words.filter(word => {
    const verseMatch = word.verse_id.match(/genesis_1_(\d+)/)
    if (verseMatch) {
      const verseNum = parseInt(verseMatch[1])
      return verseNum >= 3 && verseNum <= 31 && !word.icon_url
    }
    return false
  }) as WordData[]

  console.log(`\n총 ${wordsToGenerate.length}개 이미지 생성 예정`)
  console.log(`모델: FLUX Schnell`)
  console.log(`비율: 9:16 (모바일 세로)`)
  console.log(`예상 비용: $${(wordsToGenerate.length * 0.003).toFixed(2)}`)
  console.log(`예상 시간: ${Math.ceil(wordsToGenerate.length * 10 / 60)} 분`)

  // 사용자 확인
  console.log('\n⚠️  260개의 이미지를 생성하면 약 $0.78의 비용이 발생합니다.')
  console.log('⚠️  진행하려면 스크립트를 계속 실행하세요.\n')

  const results = []
  let totalSize = 0
  const startTime = Date.now()

  // 배치로 처리 (10개씩)
  const BATCH_SIZE = 10
  for (let i = 0; i < wordsToGenerate.length; i += BATCH_SIZE) {
    const batch = wordsToGenerate.slice(i, Math.min(i + BATCH_SIZE, wordsToGenerate.length))

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`배치 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(wordsToGenerate.length / BATCH_SIZE)}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    for (let j = 0; j < batch.length; j++) {
      const result = await generateImage(batch[j], i + j, wordsToGenerate.length)
      results.push(result)

      if (result.success && result.size) {
        totalSize += result.size
      }

      // Rate limit 방지 (1초 대기)
      if (i + j < wordsToGenerate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 배치 간 진행상황 저장
    if ((i + BATCH_SIZE) < wordsToGenerate.length) {
      const elapsed = (Date.now() - startTime) / 1000 / 60
      const remaining = (wordsToGenerate.length - (i + BATCH_SIZE)) / ((i + BATCH_SIZE) / elapsed)
      console.log(`\n⏱️  경과 시간: ${elapsed.toFixed(1)}분, 예상 남은 시간: ${remaining.toFixed(1)}분`)
    }
  }

  const totalTime = (Date.now() - startTime) / 1000 / 60

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 생성 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const successCount = results.filter(r => r.success).length
  const avgSize = successCount > 0 ? totalSize / successCount / 1024 : 0

  console.log(`✅ 성공: ${successCount}/${wordsToGenerate.length}`)
  console.log(`📁 평균 크기: ${avgSize.toFixed(2)} KB`)
  console.log(`💰 실제 비용: $${(successCount * 0.003).toFixed(3)}`)
  console.log(`⏱️  총 소요 시간: ${totalTime.toFixed(1)}분`)

  if (successCount === wordsToGenerate.length) {
    console.log('\n🎉 모든 이미지 생성 완료!')
    console.log('\n📂 저장 위치: output/genesis1_3to31/')
    console.log('\n다음 단계:')
    console.log('  1. 이미지 검증 (텍스트, 어두운 색상 확인)')
    console.log('  2. Supabase Storage 업로드')
    console.log('  3. 데이터베이스 icon_url 업데이트\n')
  } else {
    console.log('\n⚠️  일부 이미지 생성 실패')
    const failed = results.filter(r => !r.success)
    console.log(`\n실패한 이미지 (${failed.length}개):`)
    failed.forEach(f => {
      console.log(`  - ${f.word.hebrew} (${f.word.meaning}): ${f.error}`)
    })
  }

  // 성공한 이미지 목록 저장
  const successResults = results.filter(r => r.success)
  const manifest = successResults.map(r => ({
    id: r.word.id,
    verse_id: r.word.verse_id,
    position: r.word.position,
    hebrew: r.word.hebrew,
    meaning: r.word.meaning,
    filename: r.filename
  }))

  const manifestPath = join(process.cwd(), 'output/genesis1_3to31/manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\n📝 매니페스트 저장: ${manifestPath}`)
}

main().catch(console.error)
