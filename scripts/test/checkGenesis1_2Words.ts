#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  console.log('🔍 창세기 1:2절 단어 조회\n')

  // 창세기 1:2 구절 조회
  const { data: verse, error: verseError } = await supabase
    .from('verses')
    .select('id, reference, hebrew')
    .eq('id', 'genesis_1_2')
    .single()

  if (verseError || !verse) {
    console.error('❌ 구절을 찾을 수 없습니다:', verseError?.message)
    return
  }

  console.log(`✅ 구절: ${verse.reference}`)
  console.log(`   히브리어: ${verse.hebrew}\n`)

  // 해당 구절의 단어들 조회
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('hebrew, korean, meaning, icon_url, position')
    .eq('verse_id', verse.id)
    .order('position')

  if (wordsError || !words) {
    console.error('❌ 단어를 찾을 수 없습니다:', wordsError?.message)
    return
  }

  console.log(`📝 총 ${words.length}개 단어\n`)

  words.forEach((word, i) => {
    console.log(`[${i + 1}] ${word.hebrew} (${word.korean})`)
    console.log(`    의미: ${word.meaning}`)
    console.log(`    icon_url: ${word.icon_url ? '✅ 있음' : '❌ 없음'}`)
    console.log()
  })

  // 아이콘이 없는 단어 카운트
  const missingIcons = words.filter(w => !w.icon_url).length
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 아이콘 없음: ${missingIcons}/${words.length}`)

  if (missingIcons > 0) {
    console.log(`\n✅ ${missingIcons}개 단어에 대한 이미지 생성이 필요합니다.`)
  } else {
    console.log(`\n✅ 모든 단어에 이미지가 있습니다.`)
  }
}

main().catch(console.error)
