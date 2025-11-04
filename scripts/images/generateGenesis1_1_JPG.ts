#!/usr/bin/env tsx

/**
 * 창세기 1:1 비중요 단어 JPG 생성
 * - 전치사, 접속사 등 문법 요소
 * - FLUX Schnell API 사용
 */

import Replicate from 'replicate'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const OUTPUT_DIR = join(process.cwd(), 'output', 'genesis1_1_jpg')
const STORAGE_BUCKET = 'hebrew-icons'
const STORAGE_PATH = 'icons'

// MD5 해시 생성
function generateHash(text: string): string {
  return createHash('md5').update(text).digest('hex')
}

// 니쿠드 제거
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').trim()
}

// 비중요 단어 판별
function isUnimportantWord(word: { meaning: string; grammar: string }): boolean {
  const { meaning, grammar } = word

  if (grammar?.includes('전치사') || grammar?.includes('접속사') || grammar?.includes('관사')) {
    return true
  }

  if (meaning.includes('목적격 표지') || meaning.includes('~을/를') || meaning.includes('~와/과')) {
    return true
  }

  return false
}

// 단어에 대한 JPG 프롬프트 생성 (새 규칙 적용)
function generatePrompt(word: { hebrew: string; meaning: string; grammar: string }): string {
  const meaning = word.meaning
  const grammar = word.grammar

  // 전치사/접속사는 추상적 개념으로 표현
  let basePrompt = ''

  if (meaning.includes('목적격') || meaning.includes('~을/를')) {
    basePrompt = 'Abstract flowing arrow pointing to target, minimalist design, biblical manuscript style, subtle golden accents'
  } else if (meaning.includes('그리고') || grammar.includes('접속사')) {
    basePrompt = 'Connection symbol, linking elements, bridge concept, flowing lines connecting, sacred geometric design'
  } else {
    basePrompt = `${meaning} abstract visualization, minimalist sacred art style, gentle symbolism`
  }

  // 색상 지시 (새 규칙: 밝은 파스텔, 4-6가지 색상, 어두운 색상 금지)
  const colorPrompt = 'bright pastel colors, multi-colored with soft pink blue purple yellow, vibrant gradients, NO dark colors, NO black, NO dark gray, cheerful atmosphere'

  // 레이아웃 지시 (새 규칙: 하단 20% 공백)
  const layoutPrompt = '16:9 aspect ratio, bottom 20% empty space, main content in upper 80%, centered composition'

  // 공통 스타일
  const style = 'clean composition, biblical art aesthetic, professional lighting, high quality, detailed'

  return `${basePrompt}, ${colorPrompt}, ${layoutPrompt}, ${style}`
}

async function generateGenesis1_1_JPG() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📷 창세기 1:1 비중요 단어 JPG 생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 출력 디렉토리 생성
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // 창세기 1:1 verse 조회
  const { data: verse } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single()

  if (!verse) {
    console.error('❌ 창세기 1:1을 찾을 수 없습니다.')
    return
  }

  // 단어들 조회
  const { data: allWords } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, korean, icon_url')
    .eq('verse_id', verse.id)
    .order('position')

  if (!allWords || allWords.length === 0) {
    console.error('❌ 단어를 찾을 수 없습니다.')
    return
  }

  // 비중요 단어만 필터링 (이미지가 없는)
  const unimportantWords = allWords.filter(w => !w.icon_url && isUnimportantWord(w))

  console.log(`📋 전체 단어: ${allWords.length}개`)
  console.log(`📷 JPG 생성 대상: ${unimportantWords.length}개\n`)

  unimportantWords.forEach((w, i) => {
    console.log(`   ${i + 1}. ${w.hebrew} - ${w.meaning} (${w.grammar})`)
  })
  console.log()

  if (unimportantWords.length === 0) {
    console.log('✅ 모든 단어에 이미 이미지가 있습니다!')
    return
  }

  let successCount = 0
  let failCount = 0

  for (const [index, word] of unimportantWords.entries()) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📷 [${index + 1}/${unimportantWords.length}] ${word.hebrew} (${word.meaning})`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    try {
      const prompt = generatePrompt(word)
      console.log(`💭 프롬프트:\n   ${prompt}\n`)

      console.log('⏳ JPG 생성 중... (약 30초 소요)')

      // Replicate API 호출 - FLUX 1.1 Pro
      const output = await replicate.run(
        "black-forest-labs/flux-1.1-pro" as any,
        {
          input: {
            prompt: prompt,
            aspect_ratio: "16:9",
            output_format: "jpg",
            output_quality: 90,
          }
        }
      ) as string

      const imageUrl = output
      console.log(`✅ JPG 생성 완료: ${imageUrl}\n`)

      // JPG 다운로드
      console.log('📥 JPG 다운로드 중...')
      const response = await fetch(imageUrl)
      const buffer = await response.arrayBuffer()

      const normalized = removeNikkud(word.hebrew)
      const hash = generateHash(normalized)
      const filename = `word_${hash}.jpg`
      const localPath = join(OUTPUT_DIR, filename)

      writeFileSync(localPath, Buffer.from(buffer))
      console.log(`💾 로컬 저장: ${filename}`)

      // Supabase Storage 업로드
      console.log('☁️  Supabase Storage 업로드 중...')
      const storagePath = `${STORAGE_PATH}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, Buffer.from(buffer), {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError && !uploadError.message.includes('already exists')) {
        throw new Error(`업로드 실패: ${uploadError.message}`)
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)

      console.log(`🔗 Public URL: ${publicUrl}`)

      // DB 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('id', word.id)

      if (updateError) {
        throw new Error(`DB 업데이트 실패: ${updateError.message}`)
      }

      console.log('✅ DB 업데이트 완료\n')
      successCount++

      // Rate limit 방지
      if (index < unimportantWords.length - 1) {
        console.log('⏸️  다음 JPG 생성 전 5초 대기...\n')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }

    } catch (error) {
      console.error(`❌ 오류 발생:`, error)
      failCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 최종 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log(`📁 저장 경로: ${OUTPUT_DIR}`)
  console.log('\n🎉 창세기 1:1 JPG 생성 완료!')
}

generateGenesis1_1_JPG().catch(console.error)
