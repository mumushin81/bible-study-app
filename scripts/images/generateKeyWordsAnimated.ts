#!/usr/bin/env tsx

/**
 * 창세기 1:1 핵심 단어들만 선택적으로 GIF 생성
 * - 하나님 (אֱלֹהִים)
 * - 창조하셨다 (בָּרָא)
 * - 하늘들 (הַשָּׁמַיִם)
 * - 땅 (הָאָרֶץ)
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

const OUTPUT_DIR = join(process.cwd(), 'output', 'animated_gifs')
const STORAGE_BUCKET = 'animated-icons'
const STORAGE_PATH = 'gifs'

// 중요 단어 한국어 뜻 리스트
const KEY_MEANINGS = ['하나님', '창조하셨다', '하늘들', '땅']

// MD5 해시 생성
function generateHash(text: string): string {
  return createHash('md5').update(text).digest('hex')
}

// 니쿠드 제거
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').trim()
}

// 단어에 대한 애니메이션 프롬프트 생성 (새 규칙 적용)
function generatePrompt(word: { hebrew: string; meaning: string; grammar: string }): string {
  const meaning = word.meaning

  let basePrompt = ''

  if (meaning.includes('하나님') || meaning.includes('엘로힘')) {
    basePrompt = 'Divine glowing light radiating from heaven, golden ethereal rays, sacred atmosphere, gentle flowing movement, holy presence, heavenly throne, divine majesty'
  } else if (meaning.includes('창조') || meaning.includes('만들')) {
    basePrompt = 'Cosmic creation energy, swirling galaxies forming, stars being born, divine creative power, light bursting from darkness, universe expanding, cosmic dust swirling'
  } else if (meaning.includes('하늘')) {
    basePrompt = 'Vast heavens expanding, clouds flowing peacefully, sky stretching infinitely, celestial realm, stars twinkling in the firmament, cosmic expanse, heavenly atmosphere'
  } else if (meaning.includes('땅') || meaning.includes('지구')) {
    basePrompt = 'Earth forming from void, land emerging from waters, ground solidifying, fertile soil appearing, foundation being laid, terrestrial realm taking shape'
  } else if (meaning.includes('태초') || meaning.includes('처음')) {
    basePrompt = 'Beginning of time, cosmic dawn, first moment of creation, universe birth, primordial light breaking through darkness, genesis explosion, time starting to flow'
  } else {
    basePrompt = `${meaning} visualization, gentle flowing motion, sacred atmosphere, spiritual symbolism`
  }

  // 색상 지시 (새 규칙: 밝은 파스텔, 4-6가지 색상, 어두운 색상 금지)
  const colorPrompt = 'bright pastel colors, multi-colored palette with soft pink blue purple yellow mint, vibrant gradients, NO dark colors, NO black, NO dark gray, cheerful atmosphere'

  // 레이아웃 지시 (새 규칙: 하단 20% 공백)
  const layoutPrompt = '16:9 cinematic aspect ratio, bottom 20% empty space, main content in upper 80%, centered composition'

  // 공통 스타일
  const style = 'ethereal glow, biblical sacred art, professional color grading, majestic atmosphere, high quality, detailed, soft lighting'

  return `${basePrompt}, ${colorPrompt}, ${layoutPrompt}, ${style}`
}

async function generateKeyWordsAnimated() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⭐ 창세기 1:1 핵심 단어 GIF 생성')
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

  // 핵심 단어만 필터링 (이미지가 없고 중요한 뜻을 가진 단어)
  const keyWords = allWords.filter(w =>
    !w.icon_url && KEY_MEANINGS.some(meaning => w.meaning.includes(meaning))
  )

  console.log(`📋 전체 단어: ${allWords.length}개`)
  console.log(`⭐ 핵심 단어: ${keyWords.length}개\n`)

  keyWords.forEach((w, i) => {
    console.log(`   ${i + 1}. ${w.hebrew} - ${w.meaning}`)
  })
  console.log()

  if (keyWords.length === 0) {
    console.log('✅ 모든 핵심 단어에 이미 이미지가 있습니다!')
    return
  }

  let successCount = 0
  let failCount = 0

  for (const [index, word] of keyWords.entries()) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`🎬 [${index + 1}/${keyWords.length}] ${word.hebrew} (${word.meaning})`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    try {
      const prompt = generatePrompt(word)
      console.log(`💭 프롬프트:\n   ${prompt}\n`)

      console.log('⏳ GIF 생성 중... (약 1-2분 소요)')

      // Replicate API 호출
      const output = await replicate.run(
        "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f" as any,
        {
          input: {
            prompt: prompt,
            steps: 25,
            guidance_scale: 7.5,
            num_frames: 16,
            fps: 8,
          }
        }
      ) as string

      console.log(`✅ GIF 생성 완료: ${output}\n`)

      // GIF 다운로드
      console.log('📥 GIF 다운로드 중...')
      const response = await fetch(output)
      const buffer = await response.arrayBuffer()

      const normalized = removeNikkud(word.hebrew)
      const hash = generateHash(normalized)
      const filename = `word_${hash}.gif`
      const localPath = join(OUTPUT_DIR, filename)

      writeFileSync(localPath, Buffer.from(buffer))
      console.log(`💾 로컬 저장: ${filename}`)

      // Supabase Storage 업로드
      console.log('☁️  Supabase Storage 업로드 중...')
      const storagePath = `${STORAGE_PATH}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, Buffer.from(buffer), {
          contentType: 'image/gif',
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

      // Rate limit 방지 (마지막 단어가 아니면 대기)
      if (index < keyWords.length - 1) {
        console.log('⏸️  다음 GIF 생성 전 10초 대기...\n')
        await new Promise(resolve => setTimeout(resolve, 10000))
      }

    } catch (error) {
      console.error(`❌ 오류 발생:`, error)
      failCount++

      // 실패해도 다음 단어로 계속 진행
      if (index < keyWords.length - 1) {
        console.log('⏭️  다음 단어로 계속 진행...\n')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 최종 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log(`📁 저장 경로: ${OUTPUT_DIR}`)
  console.log('\n🎉 핵심 단어 GIF 생성 완료!')
}

generateKeyWordsAnimated().catch(console.error)
