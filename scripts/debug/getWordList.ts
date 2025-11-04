#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getWordList() {
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning')
    .order('id')

  if (error) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  console.log('📊 단어 목록:')
  words.forEach((word, index) => {
    console.log(`[${index + 1}] ${word.hebrew} (ID: ${word.id}, Meaning: ${word.meaning})`)
  })

  console.log(`\n총 ${words.length}개의 단어`)
}

getWordList().catch(console.error)