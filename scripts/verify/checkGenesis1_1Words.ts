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

// 창세기 1:1 히브리어 구절
const GENESIS_1_1_VERSE = 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ'

async function verifyGenesis1_1Words() {
  console.log('🔍 창세기 1:1 단어 검증')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 구절의 단어들 분리
  const words = GENESIS_1_1_VERSE.split(/\s+/)

  console.log('📜 원문: ', GENESIS_1_1_VERSE)
  console.log('📊 단어 수: ', words.length)
  console.log('\n단어별 상세 정보:\n')

  for (const hebrewWord of words) {
    console.log(`🔍 단어 조회: ${hebrewWord}`)

    // 단어 조회
    const { data: wordData, error: selectError } = await supabase
      .from('words')
      .select('id, hebrew, meaning, korean, ipa, root, grammar, icon_url, icon_svg')
      .ilike('hebrew', `%${hebrewWord}%`)
      .limit(1)

    if (selectError) {
      console.error(`❌ 단어 조회 실패: ${selectError.message}`)
      continue
    }

    if (!wordData || wordData.length === 0) {
      console.warn(`⚠️ 데이터베이스에서 단어를 찾을 수 없음: ${hebrewWord}`)
      continue
    }

    const word = wordData[0]

    console.log('📋 단어 정보:')
    console.log(`   - 히브리어: ${word.hebrew}`)
    console.log(`   - 의미: ${word.meaning}`)
    console.log(`   - 한국어: ${word.korean}`)
    console.log(`   - IPA: ${word.ipa}`)
    console.log(`   - 어근: ${word.root}`)
    console.log(`   - 문법: ${word.grammar}`)

    // 이미지 URL 검증
    if (word.icon_url) {
      console.log(`🖼️ 이미지 URL: ${word.icon_url}`)

      try {
        const response = await fetch(word.icon_url)
        if (!response.ok) {
          console.error(`❌ 이미지 로딩 실패 (HTTP ${response.status}): ${word.icon_url}`)
        } else {
          console.log('✅ 이미지 URL 유효')
        }
      } catch (error) {
        console.error(`❌ 이미지 URL 검증 중 오류: ${error}`)
      }
    } else {
      console.warn(`⚠️ 이미지 URL 없음`)
    }

    // SVG 아이콘 확인
    if (word.icon_svg) {
      console.log('🎨 SVG 아이콘 존재')
    } else {
      console.warn('⚠️ SVG 아이콘 없음')
    }

    console.log('') // 단어 간 구분
  }

  console.log('🏁 창세기 1:1 단어 검증 완료')
}

verifyGenesis1_1Words().catch(console.error)