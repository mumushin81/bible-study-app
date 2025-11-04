#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// 환경 변수 로드
config({ path: '.env.local' })

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Genesis 1:1의 단어들
const GENESIS_1_1_WORDS = [
  'בְּרֵאשִׁית',   // 태초에
  'בָּרָא',       // 창조하다
  'אֱלֹהִים',     // 하나님
  'אֵת',         // ~을, ~를
  'הַשָּׁמַיִם',   // 하늘들
  'וְאֵת',       // 그리고 ~을, ~를
  'הָאָרֶץ'       // 땅
]

async function verifyGenesis1_1Images() {
  console.log('🔍 창세기 1:1 이미지 검증')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  for (const word of GENESIS_1_1_WORDS) {
    console.log(`🧐 단어 확인: ${word}`)

    // 단어 조회
    const { data: words, error: selectError } = await supabase
      .from('words')
      .select('id, hebrew, icon_url')
      .ilike('hebrew', `%${word}%`)
      .limit(1)

    if (selectError) {
      console.error(`❌ 단어 조회 실패: ${selectError.message}`)
      continue
    }

    if (!words || words.length === 0) {
      console.warn(`⚠️ 데이터베이스에서 단어를 찾을 수 없음: ${word}`)
      continue
    }

    const wordData = words[0]

    // 이미지 URL 검증
    if (!wordData.icon_url) {
      console.error(`❌ 이미지 URL 없음: ${word}`)
      continue
    }

    console.log('✅ 이미지 URL 존재:')
    console.log(`   단어: ${wordData.hebrew}`)
    console.log(`   URL: ${wordData.icon_url}`)

    // URL 유효성 검사
    try {
      const response = await fetch(wordData.icon_url)
      if (!response.ok) {
        console.error(`❌ 이미지 로딩 실패 (HTTP ${response.status}): ${wordData.icon_url}`)
        continue
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.startsWith('image/')) {
        console.error(`❌ 유효하지 않은 이미지 형식: ${contentType}`)
        continue
      }

      const buffer = await response.arrayBuffer()
      const sizeKB = Math.round(buffer.byteLength / 1024)

      console.log(`📊 이미지 크기: ${sizeKB} KB`)

      // 크기 제한 확인 (100KB 이하)
      if (sizeKB > 100) {
        console.warn(`⚠️ 이미지 크기 초과: ${sizeKB} KB`)
      }

    } catch (error) {
      console.error(`❌ 이미지 URL 검증 중 오류: ${error}`)
    }

    console.log('') // 단어 간 구분
  }

  console.log('🏁 창세기 1:1 이미지 검증 완료')
}

verifyGenesis1_1Images().catch(console.error)