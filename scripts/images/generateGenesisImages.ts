#!/usr/bin/env tsx

/**
 * Genesis 1:1 단어 이미지 자동 생성 스크립트
 * - FLUX 1.1 Pro를 사용한 고품질 플래시카드 이미지 생성
 * - Supabase 스토리지에 직접 업로드
 * - 이미지 크기 최적화
 */

import { createClient } from '@supabase/supabase-js'
import Replicate from 'replicate'
import { config } from 'dotenv'
import { createHash } from 'crypto'
import sharp from 'sharp'

// 환경 변수 로드
config({ path: '.env.local' })

// Supabase 및 Replicate 클라이언트 초기화
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN || ''
})

// Genesis 1:1 주요 단어들
const GENESIS_1_1_WORDS = [
  {
    hebrew: 'בְּרֵאשִׁית',
    meaning: '태초에, 시작',
    context: '창세기 첫 단어, 시간의 시작'
  },
  {
    hebrew: 'בָּרָא',
    meaning: '창조하다',
    context: '하나님의 창조 행위'
  },
  {
    hebrew: 'אֱלֹהִים',
    meaning: '하나님',
    context: '유일하신 창조주'
  },
  {
    hebrew: 'אֵת',
    meaning: '~을, ~를',
    context: '목적어 표시 전치사'
  },
  {
    hebrew: 'הַשָּׁמַיִם',
    meaning: '하늘들',
    context: '우주와 천국의 영역'
  },
  {
    hebrew: 'וְאֵת',
    meaning: '그리고 ~을, ~를',
    context: '연결 및 목적어 표시'
  },
  {
    hebrew: 'הָאָרֶץ',
    meaning: '땅',
    context: '지구, 인간이 살아가는 공간'
  }
]

// 프롬프트 생성 함수
function generateWordPrompt(word: { hebrew: string, meaning: string, context: string }): string {
  return `Abstract visual representation of the Hebrew word "${word.hebrew}" meaning "${word.meaning}".
  Context: ${word.context}.
  Symbolic, ethereal imagery with soft pastel colors,
  representing biblical creation and divine essence.
  9:16 aspect ratio, bright and hopeful atmosphere,
  no dark colors, centered composition with ethereal light.
  Symbolize creation, spiritual awakening, and divine power.
  High quality, detailed, professional illustration.`
}

// 이미지 크기 최적화 함수
async function optimizeImage(buffer: ArrayBuffer, maxSizeKB: number = 100): Promise<Buffer> {
  const optimizedBuffer = await sharp(Buffer.from(buffer))
    .resize({
      width: 600,  // 고정 너비
      height: 1067,  // 9:16 비율 유지
      fit: 'cover'
    })
    .jpeg({
      quality: 80,  // 품질 조절
      mozjpeg: true
    })
    .toBuffer()

  return optimizedBuffer
}

// 이미지 업로드 및 DB 업데이트 함수
async function generateAndUploadImage(word: { hebrew: string, meaning: string, context: string }) {
  try {
    console.log(`🎨 "${word.hebrew}" 이미지 생성 중...`)

    // 프롬프트 생성
    const prompt = generateWordPrompt(word)

    // Replicate API 호출
    const output = await replicate.run(
      'black-forest-labs/flux-1.1-pro',
      {
        input: {
          prompt,
          aspect_ratio: '9:16',
          output_format: 'jpg',
          output_quality: 80
        }
      }
    )

    // 이미지 URL 확보
    const imageUrl = Array.isArray(output) ? output[0] : output

    // 이미지 다운로드
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()

    // 이미지 최적화
    const optimizedBuffer = await optimizeImage(buffer)

    // MD5 해시로 파일명 생성
    const hash = createHash('md5').update(word.hebrew).digest('hex')
    const storageFilename = `word_${hash}.jpg`

    // Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('hebrew-icons')
      .upload(`icons/${storageFilename}`, optimizedBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ 스토리지 업로드 실패 (${word.hebrew}):`, uploadError)
      return null
    }

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('hebrew-icons')
      .getPublicUrl(`icons/${storageFilename}`)

    // 데이터베이스 업데이트
    const { data: matchedWords, error: selectError } = await supabase
      .from('words')
      .select('id')
      .ilike('hebrew', `%${word.hebrew}%`)
      .limit(10)

    if (selectError) {
      console.error(`❌ 단어 검색 실패 (${word.hebrew}):`, selectError)
      return null
    }

    if (matchedWords.length > 0) {
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .in('id', matchedWords.map(w => w.id))

      if (updateError) {
        console.error(`❌ DB 업데이트 실패 (${word.hebrew}):`, updateError)
        return null
      }
    }

    console.log(`✅ "${word.hebrew}" 이미지 생성 및 업로드 완료`)
    return publicUrl

  } catch (error) {
    console.error(`🚨 "${word.hebrew}" 처리 중 오류:`, error)
    return null
  }
}

// 메인 실행 함수
async function generateGenesis1_1Images() {
  console.log('🌟 창세기 1:1 이미지 생성 시작')

  const results = await Promise.all(
    GENESIS_1_1_WORDS.map(generateAndUploadImage)
  )

  console.log('\n🏁 전체 이미지 생성 완료')
  console.log('결과:', results)
}

generateGenesis1_1Images().catch(console.error)