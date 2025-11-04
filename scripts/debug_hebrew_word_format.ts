#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugHebrewWordFormat() {
  // 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning')
    .limit(50)

  if (error) {
    console.error('단어 조회 실패:', error)
    return
  }

  console.log('📝 히브리어 단어 형식 분석:')
  words.forEach((word, index) => {
    console.log(`[${index + 1}]`)
    console.log(`히브리어: "${word.hebrew}"`)
    console.log(`의미: "${word.meaning}"`)
    console.log('특수 문자/기호:')
    console.log(`  길이: ${word.hebrew.length}`)
    console.log(`  특수문자 존재: ${/[^\u0590-\u05FF]/.test(word.hebrew)}`)
    console.log('---')
  })
}

debugHebrewWordFormat().catch(console.error)