#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// 환경 변수 로드
config({ path: '.env.local' })

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkFlashcardImages() {
  console.log('🔍 플래시카드 이미지 디버깅')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 창세기 1장의 모든 단어 조회
  const { data, error } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url, icon_svg, verses!inner(book_id, chapter)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .order('position', { ascending: true })

  if (error) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ 창세기 1장의 단어가 없습니다.')
    return
  }

  console.log(`🔢 총 ${data.length}개 단어 발견\n`)

  data.forEach((word, index) => {
    console.log(`🔍 단어 ${index + 1}: ${word.hebrew} (${word.meaning})`)

    if (word.icon_url) {
      console.log(`   🖼️ 이미지 URL: ${word.icon_url}`)

      // URL 패턴 확인
      const urlPattern = /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/(icons|word_icons)\/word_[a-f0-9_]+\.(?:jpg|gif)$/
      const isValidUrl = urlPattern.test(word.icon_url)

      console.log(`   ✅ URL 패턴 유효성: ${isValidUrl ? '적합' : '부적합'}`)
    } else {
      console.warn(`   ⚠️ 이미지 URL 없음`)
    }

    if (word.icon_svg) {
      console.log(`   🎨 SVG 아이콘 존재 (길이: ${word.icon_svg.length} 문자)`)
    } else {
      console.warn(`   ⚠️ SVG 아이콘 없음`)
    }

    console.log('') // 단어 간 구분
  })

  console.log('🏁 플래시카드 이미지 디버깅 완료')
}

checkFlashcardImages().catch(console.error)