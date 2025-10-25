#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkGenesis1Icons() {
  console.log('🔍 창세기 1장 단어들의 icon_url 확인\n')

  const { data: verses } = await supabase
    .from('verses')
    .select('id, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')
    .limit(5)

  if (!verses || verses.length === 0) {
    console.log('❌ 창세기 1장 구절을 찾을 수 없습니다')
    return
  }

  for (const verse of verses) {
    const { data: words } = await supabase
      .from('words')
      .select('id, hebrew, meaning, icon_url, icon_svg')
      .eq('verse_id', verse.id)
      .limit(5)

    console.log(`창세기 1:${verse.verse_number}`)
    if (!words || words.length === 0) {
      console.log('  ⚠️  단어 없음\n')
      continue
    }

    words.forEach((word, idx) => {
      console.log(`  [${idx + 1}] ${word.hebrew} (${word.meaning})`)
      console.log(`      icon_url: ${word.icon_url ? '✅ 있음' : '❌ 없음'}`)
      console.log(`      icon_svg: ${word.icon_svg ? '✅ 있음' : '❌ 없음'}`)
      if (word.icon_url) {
        console.log(`      URL: ${word.icon_url.substring(0, 90)}...`)
      }
    })
    console.log('')
  }

  // 통계
  const { data: allWords } = await supabase
    .from('words')
    .select('id, icon_url')
    .limit(1000)

  const withIconUrl = allWords?.filter(w => w.icon_url).length || 0
  const withoutIconUrl = allWords?.filter(w => !w.icon_url).length || 0

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 전체 통계 (샘플 1000개):`)
  console.log(`  icon_url 있음: ${withIconUrl}개`)
  console.log(`  icon_url 없음: ${withoutIconUrl}개`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

checkGenesis1Icons()
