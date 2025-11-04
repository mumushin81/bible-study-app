#!/usr/bin/env tsx

/**
 * 창세기 1:1 모든 단어 JPG 생성
 * - 중요/비중요 구분 없이 모든 단어를 JPG로 생성
 * - FLUX Schnell API 사용
 * - 새 규칙 적용: 16:9, 하단 20% 공백, 밝은 파스텔 색상
 */

import Replicate from 'replicate'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import sharp from 'sharp'

config({ path: '.env.local' })

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const OUTPUT_DIR = join(process.cwd(), 'output', 'genesis1_1_all_jpg')
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

// 단어에 대한 JPG 프롬프트 생성 (새 규칙: 추상적 파스텔 색상)
function generatePrompt(word: { hebrew: string; meaning: string; grammar: string }): string {
  const meaning = word.meaning

  return `
Abstract pastel artwork representing: ${meaning}

Style: Abstract expressionism with bright pastel colors
Colors: Use MULTIPLE bright pastel colors - soft pink, sky blue, mint green,
        lavender, peach, coral, butter yellow, powder blue, lilac, rose,
        aqua, cream, apricot, seafoam
Technique: Smooth color gradients, soft color blending, luminous atmosphere
Composition: 9:16 vertical format, centered, generous negative space
Mood: Peaceful, spiritual, uplifting, joyful

Create a simple abstract composition with rich pastel colors.
Use many different colors to express the meaning.
Bright, colorful, and beautiful.
`.trim()
}

async function generateGenesis1_1_AllJPG() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📷 창세기 1:1 모든 단어 JPG 생성')
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

  // 모든 단어 조회
  const { data: allWords } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, korean, icon_url')
    .eq('verse_id', verse.id)
    .order('position')

  if (!allWords || allWords.length === 0) {
    console.error('❌ 단어를 찾을 수 없습니다.')
    return
  }

  // 이미지가 없는 모든 단어 필터링
  const wordsToGenerate = allWords.filter(w => !w.icon_url)

  console.log(`📋 전체 단어: ${allWords.length}개`)
  console.log(`📷 JPG 생성 대상: ${wordsToGenerate.length}개\n`)

  wordsToGenerate.forEach((w, i) => {
    console.log(`   ${i + 1}. ${w.hebrew} - ${w.meaning} (${w.grammar})`)
  })
  console.log()

  if (wordsToGenerate.length === 0) {
    console.log('✅ 모든 단어에 이미 이미지가 있습니다!')
    return
  }

  let successCount = 0
  let failCount = 0

  for (const [index, word] of wordsToGenerate.entries()) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📷 [${index + 1}/${wordsToGenerate.length}] ${word.hebrew} (${word.meaning})`)
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
            aspect_ratio: "9:16",   // ⚠️ 세로형 (모바일)
            output_format: "jpg",   // ⚠️ 필수: JPG만 생성
            output_quality: 100,    // ⚠️ 최고 품질
          }
        }
      )

      // 응답 전체를 로깅
      console.log('🔍 API 응답:', JSON.stringify(output, null, 2))
      console.log('🔍 API 응답 타입:', typeof output)
      console.log('🔍 Is Array:', Array.isArray(output))

      // FLUX 1.1 Pro는 문자열 URL을 직접 반환 (또는 배열의 첫 번째 요소)
      let imageUrl: string

      if (typeof output === 'string') {
        // Direct string response
        imageUrl = output
      } else if (Array.isArray(output) && output.length > 0) {
        // Array response (FLUX Schnell style)
        imageUrl = output[0]
      } else if (typeof output === 'object' && output !== null) {
        // Try to extract from object
        imageUrl = (output as any).url || (output as any)[0]
      } else {
        throw new Error(`예상하지 못한 응답 형식: ${JSON.stringify(output)}`)
      }

      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error(`이미지 URL을 받지 못했습니다. 응답: ${JSON.stringify(output)}`)
      }

      console.log(`✅ JPG 생성 완료: ${imageUrl}\n`)

      // JPG 다운로드
      console.log('📥 JPG 다운로드 중...')
      const response = await fetch(imageUrl)
      const buffer = await response.arrayBuffer()

      // Sharp로 1080x1920 (9:16 전체)으로 리사이즈
      console.log('🔄 이미지 리사이즈 중 (1080x1920 - 전체 배경)...')
      const resizedBuffer = await sharp(Buffer.from(buffer))
        .resize(1080, 1920, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 100 })  // 최고 품질
        .toBuffer()

      const normalized = removeNikkud(word.hebrew)
      const hash = generateHash(normalized)
      const filename = `word_${hash}.jpg`
      const localPath = join(OUTPUT_DIR, filename)

      writeFileSync(localPath, resizedBuffer)
      console.log(`💾 로컬 저장: ${filename} (1080x1920)`)

      // Supabase Storage 업로드
      console.log('☁️  Supabase Storage 업로드 중...')
      const storagePath = `${STORAGE_PATH}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, resizedBuffer, {
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
      if (index < wordsToGenerate.length - 1) {
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

generateGenesis1_1_AllJPG().catch(console.error)
