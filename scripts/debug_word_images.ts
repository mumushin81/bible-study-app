#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugWordImages() {
  // 이미지 URL이 있는 단어들 조회
  const { data: wordsWithImages, error } = await supabase
    .from('words')
    .select('hebrew, icon_url, meaning')
    .not('icon_url', 'is', null)
    .limit(20)

  if (error) {
    console.error('❌ 단어 조회 중 오류 발생:', error)
    return
  }

  console.log('🖼️ 이미지 URL이 있는 단어들:')
  wordsWithImages.forEach((word, index) => {
    console.log(`[${index + 1}] 히브리어: ${word.hebrew}`)
    console.log(`   의미: ${word.meaning}`)
    console.log(`   이미지 URL: ${word.icon_url}`)
    console.log('---')
  })

  console.log(`\n📊 총 이미지가 있는 단어 수: ${wordsWithImages.length}`)
}

debugWordImages().catch(console.error)