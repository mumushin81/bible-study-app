#!/usr/bin/env tsx

/**
 * 창세기 1:1 단어 데이터 조회
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkGenesis1_1() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 창세기 1:1 단어 데이터 조회')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 창세기 1:1 verse 조회
  const { data: verse } = await supabase
    .from('verses')
    .select('id, hebrew')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single()

  if (!verse) {
    console.error('❌ 창세기 1:1을 찾을 수 없습니다.')
    return
  }

  console.log(`📜 히브리어 원문:\n   ${verse.hebrew}\n`)

  // 단어들 조회
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, ipa, korean, icon_url')
    .eq('verse_id', verse.id)
    .order('position')

  if (!words || words.length === 0) {
    console.error('❌ 단어를 찾을 수 없습니다.')
    return
  }

  console.log(`🔤 총 ${words.length}개 단어:\n`)

  words.forEach((word, idx) => {
    const hasImage = word.icon_url ? '✅' : '❌'
    console.log(`${idx + 1}. ${word.hebrew}`)
    console.log(`   뜻: ${word.meaning}`)
    console.log(`   품사: ${word.grammar || 'N/A'}`)
    console.log(`   발음: ${word.korean || 'N/A'} [${word.ipa || 'N/A'}]`)
    console.log(`   이미지: ${hasImage} ${word.icon_url || '없음'}`)
    console.log()
  })

  const withImages = words.filter(w => w.icon_url).length
  console.log(`\n📊 이미지 현황: ${withImages}/${words.length} (${Math.round(withImages/words.length*100)}%)`)
}

checkGenesis1_1().catch(console.error)
