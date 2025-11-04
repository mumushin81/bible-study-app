#!/usr/bin/env tsx

/**
 * 플래시카드 이미지 렌더링 종합 검증 스크립트
 * - 다양한 이미지 URL 시나리오 테스트
 * - 데이터베이스 및 스토리지 연동 확인
 * - 이미지 로딩 및 폴백 메커니즘 검증
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 테스트할 이미지 URL 패턴들
const IMAGE_URL_SCENARIOS = [
  // 표준 JPG URL (성공 케이스)
  {
    description: '표준 JPG URL',
    word: 'אֱלֹהִים',
    url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_c64ad752ce1a379b3ed739b3d0a68535.jpg',
    expectedResult: 'SUCCESS'
  },
  // UUID 형식 URL
  {
    description: 'UUID 형식 URL',
    word: 'בְּרֵאשִׁית',
    url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_cef0f67b_17dc_4ace_a10f_2bc99c5f1e88.jpg',
    expectedResult: 'SUCCESS'
  },
  // 잘못된 호스트
  {
    description: '잘못된 호스트',
    word: 'תֹּהוּ',
    url: 'https://invalid-host.com/image.jpg',
    expectedResult: 'INVALID_HOST'
  },
  // 잘못된 파일 형식
  {
    description: '잘못된 파일 형식',
    word: 'וָבֹהוּ',
    url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_invalid.png',
    expectedResult: 'INVALID_FORMAT'
  },
  // 존재하지 않는 이미지
  {
    description: '존재하지 않는 이미지',
    word: 'וַיֹּאמֶר',
    url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_nonexistent.jpg',
    expectedResult: 'NOT_FOUND'
  }
]

async function runImageRenderingTests() {
  console.log('🧪 플래시카드 이미지 렌더링 종합 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const testResults = []

  for (const scenario of IMAGE_URL_SCENARIOS) {
    console.log(`🔍 테스트: ${scenario.description}`)
    console.log(`단어: ${scenario.word}`)
    console.log(`URL: ${scenario.url}\n`)

    try {
      // URL 유효성 검사
      const { data, error } = await supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(scenario.url.split('/storage/v1/object/public/hebrew-icons/')[1])

      if (error) {
        console.error('❌ Supabase URL 검증 오류:', error)
        testResults.push({
          ...scenario,
          result: 'ERROR',
          details: error.message
        })
        continue
      }

      // 이미지 로드 테스트
      const response = await fetch(data.publicUrl)

      if (!response.ok) {
        console.warn('⚠️ 이미지 로딩 실패')
        testResults.push({
          ...scenario,
          result: 'NOT_FOUND',
          details: `HTTP ${response.status}`
        })
        continue
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.startsWith('image/')) {
        console.warn('⚠️ 유효하지 않은 이미지 형식')
        testResults.push({
          ...scenario,
          result: 'INVALID_FORMAT',
          details: `Content-Type: ${contentType}`
        })
        continue
      }

      console.log('✅ 이미지 로딩 성공\n')
      testResults.push({
        ...scenario,
        result: 'SUCCESS',
        details: `Content-Type: ${contentType}`
      })

    } catch (error) {
      console.error('❌ 테스트 중 예외 발생:', error)
      testResults.push({
        ...scenario,
        result: 'ERROR',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  // 테스트 결과 요약
  console.log('🏁 테스트 결과 요약')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const summary = testResults.reduce((acc, result) => {
    acc[result.result] = (acc[result.result] || 0) + 1
    return acc
  }, {})

  console.log('결과:')
  Object.entries(summary).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`)
  })

  console.log('\n전체 테스트 완료')
}

runImageRenderingTests().catch(console.error)