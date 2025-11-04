#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readdirSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listWordsAndFilenames() {
  const IMAGE_DIR = join(process.cwd(), 'public', 'images', 'words')
  const images = readdirSync(IMAGE_DIR).filter(f => f.endsWith('.jpg') && f !== 'default_word_icon.jpg')

  // 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning')
    .order('id')

  if (error) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  console.log('🖼️ 이미지 파일 목록:')
  images.forEach(filename => {
    console.log(`- ${filename}`)
  })

  console.log('\n📝 데이터베이스 단어 목록:')
  words.forEach(word => {
    console.log(`- ${word.hebrew} (${word.meaning})`)
  })
}

listWordsAndFilenames().catch(console.error)