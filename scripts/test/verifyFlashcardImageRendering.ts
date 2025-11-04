#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// 환경 변수 로드
config({ path: '.env.local' })

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

// 테스트할 단어들 (창세기 1:1)
const TEST_WORDS = [
  'בְּרֵאשִׁית',   // 태초에
  'בָּרָא',       // 창조하다
  'אֱלֹהִים',     // 하나님
  'אֵת',         // ~을, ~를
  'הַשָּׁמַיִם',   // 하늘들
  'וְאֵת',       // 그리고 ~을, ~를
  'הָאָרֶץ'       // 땅
]

async function verifyFlashcardImageRendering() {
  console.log('🧪 플래시카드 이미지 렌더링 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const testResults = []

  for (const hebrewWord of TEST_WORDS) {
    console.log(`🔍 단어 테스트: ${hebrewWord}`)

    // 단어 조회
    const { data: words, error } = await supabase
      .from('words')
      .select('id, hebrew, meaning, korean, ipa, icon_url, icon_svg')
      .ilike('hebrew', `%${hebrewWord}%`)
      .limit(1)

    if (error) {
      console.error(`❌ 단어 검색 실패: ${error.message}`)
      testResults.push({
        word: hebrewWord,
        status: 'ERROR',
        message: error.message
      })
      continue
    }

    if (!words || words.length === 0) {
      console.warn(`⚠️ 단어를 찾을 수 없음: ${hebrewWord}`)
      testResults.push({
        word: hebrewWord,
        status: 'NOT_FOUND',
        message: '데이터베이스에 단어 없음'
      })
      continue
    }

    const word = words[0]

    console.log('📋 단어 정보:')
    console.log(`   - ID: ${word.id}`)
    console.log(`   - 히브리어: ${word.hebrew}`)
    console.log(`   - 의미: ${word.meaning}`)

    // 이미지 URL 검증
    if (word.icon_url) {
      console.log(`🖼️ 이미지 URL: ${word.icon_url}`)

      try {
        const response = await fetch(word.icon_url)

        if (!response.ok) {
          console.error(`❌ 이미지 로딩 실패 (HTTP ${response.status})`)
          testResults.push({
            word: hebrewWord,
            status: 'IMAGE_LOAD_FAILED',
            message: `HTTP ${response.status}`,
            url: word.icon_url
          })
          continue
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.startsWith('image/')) {
          console.warn(`⚠️ 유효하지 않은 이미지 형식: ${contentType}`)
          testResults.push({
            word: hebrewWord,
            status: 'INVALID_IMAGE_TYPE',
            message: `Content-Type: ${contentType}`,
            url: word.icon_url
          })
          continue
        }

        // 이미지 크기 체크
        const buffer = await response.arrayBuffer()
        const sizeKB = Math.round(buffer.byteLength / 1024)
        console.log(`📊 이미지 크기: ${sizeKB} KB`)

        if (sizeKB > 100) {
          console.warn(`⚠️ 이미지 크기 초과: ${sizeKB} KB`)
          testResults.push({
            word: hebrewWord,
            status: 'IMAGE_SIZE_LARGE',
            message: `이미지 크기: ${sizeKB} KB`,
            url: word.icon_url
          })
        }

        testResults.push({
          word: hebrewWord,
          status: 'SUCCESS',
          message: `이미지 성공 (${sizeKB} KB)`,
          url: word.icon_url
        })

      } catch (error) {
        console.error(`❌ 이미지 URL 검증 중 오류: ${error}`)
        testResults.push({
          word: hebrewWord,
          status: 'IMAGE_VALIDATION_ERROR',
          message: String(error),
          url: word.icon_url
        })
      }
    } else {
      console.warn(`⚠️ 이미지 URL 없음`)
      testResults.push({
        word: hebrewWord,
        status: 'NO_IMAGE_URL',
        message: '이미지 URL 없음'
      })
    }

    console.log('') // 단어 간 구분
  }

  // 테스트 결과 요약
  console.log('🏁 테스트 결과 요약')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const summary = testResults.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1
    return acc
  }, {})

  Object.entries(summary).forEach(([status, count]) => {
    console.log(`   - ${status}: ${count}`)
  })

  // 상세 결과 출력
  console.log('\n📝 상세 결과:')
  testResults.forEach(result => {
    console.log(`   - ${result.word}: ${result.status} (${result.message})`)
  })
}

verifyFlashcardImageRendering().catch(console.error)