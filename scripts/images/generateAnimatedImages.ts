#!/usr/bin/env tsx

/**
 * 창세기 1:1 단어들의 움직이는 이미지 생성
 * Replicate minimax/video-01 모델 사용
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

const OUTPUT_DIR = join(process.cwd(), 'output', 'animated_words')
const STORAGE_BUCKET = 'hebrew-icons'
const STORAGE_PATH = 'animated'

// MD5 해시 생성
function generateHash(text: string): string {
  return createHash('md5').update(text).digest('hex')
}

// 니쿠드 제거
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').trim()
}

// 단어에 대한 애니메이션 프롬프트 생성
function generatePrompt(word: { hebrew: string; meaning: string; grammar: string }): string {
  const meaning = word.meaning
  const grammar = word.grammar

  // 품사와 의미에 따른 프롬프트 생성
  let basePrompt = ''

  if (meaning.includes('하나님') || meaning.includes('엘로힘')) {
    basePrompt = 'Divine light radiating from heaven, glowing golden rays, ethereal clouds, sacred atmosphere, gentle movement, heavenly glow, spiritual energy flowing, majestic divine presence'
  } else if (meaning.includes('창조') || meaning.includes('만들')) {
    basePrompt = 'Cosmic creation energy, swirling galaxies forming, stars being born, universe expanding, divine creative power, light emerging from darkness, cosmic dust swirling, formation of matter'
  } else if (meaning.includes('태초') || meaning.includes('처음')) {
    basePrompt = 'The beginning of time, cosmic clock starting, primordial void transforming, first moment of existence, time flowing forward, genesis moment, eternal light emerging from darkness'
  } else if (meaning.includes('하늘')) {
    basePrompt = 'Vast heavens expanding, clouds flowing peacefully, sky stretching infinitely, celestial realm, stars twinkling, cosmic expanse, ethereal atmosphere'
  } else if (meaning.includes('땅') || meaning.includes('지구')) {
    basePrompt = 'Earth forming from cosmic dust, land emerging, ground solidifying, fertile soil, foundation being laid, terrestrial realm taking shape'
  } else {
    basePrompt = `${meaning} concept visualization, gentle motion, Hebrew calligraphy style, sacred text atmosphere, spiritual symbolism, soft flowing movement`
  }

  // 공통 스타일 추가
  const style = 'cinematic lighting, 16:9 aspect ratio, smooth camera movement, professional color grading, ethereal atmosphere, biblical theme, sacred art style, high quality, detailed, majestic'

  return `${basePrompt}, ${style}`
}

async function generateAnimatedImages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎬 창세기 1:1 움직이는 이미지 생성')
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
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, korean')
    .eq('verse_id', verse.id)
    .order('position')

  if (!words || words.length === 0) {
    console.error('❌ 단어를 찾을 수 없습니다.')
    return
  }

  // 테스트: 첫 번째 단어만 처리
  const TEST_MODE = true
  const testWords = TEST_MODE ? words.slice(0, 1) : words

  console.log(`🔤 총 ${testWords.length}개 단어 처리${TEST_MODE ? ' (테스트 모드)' : ''}\n`)

  let successCount = 0
  let failCount = 0

  for (const [index, word] of testWords.entries()) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📹 [${index + 1}/${testWords.length}] ${word.hebrew} (${word.meaning})`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    try {
      const prompt = generatePrompt(word)
      console.log(`💭 프롬프트:\n   ${prompt}\n`)

      console.log('⏳ 비디오 생성 중... (약 2-3분 소요)')

      // Replicate API 호출 - minimax video-01
      const output = await replicate.run(
        "minimax/video-01" as any,
        {
          input: {
            prompt: prompt,
            prompt_optimizer: true,
          }
        }
      ) as string

      console.log(`✅ 비디오 생성 완료: ${output}\n`)

      // 비디오 다운로드
      console.log('📥 비디오 다운로드 중...')
      const response = await fetch(output)
      const buffer = await response.arrayBuffer()

      const normalized = removeNikkud(word.hebrew)
      const hash = generateHash(normalized)
      const filename = `word_${hash}.mp4`
      const localPath = join(OUTPUT_DIR, filename)

      writeFileSync(localPath, Buffer.from(buffer))
      console.log(`💾 로컬 저장: ${filename}`)

      // Supabase Storage 업로드
      console.log('☁️  Supabase Storage 업로드 중...')
      const storagePath = `${STORAGE_PATH}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, Buffer.from(buffer), {
          contentType: 'video/mp4',
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

      // DB 업데이트 (animated_url 컬럼이 있다면)
      // 일단 icon_url에 저장
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('id', word.id)

      if (updateError) {
        throw new Error(`DB 업데이트 실패: ${updateError.message}`)
      }

      console.log('✅ DB 업데이트 완료\n')
      successCount++

      // Rate limit 방지 (Replicate API는 요청 간 대기 필요)
      if (index < words.length - 1) {
        console.log('⏸️  다음 비디오 생성 전 10초 대기...\n')
        await new Promise(resolve => setTimeout(resolve, 10000))
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
  console.log('\n🎉 작업 완료!')
}

generateAnimatedImages().catch(console.error)
