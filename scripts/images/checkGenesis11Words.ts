#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkWords() {
  // 창세기 1:1 관련 단어들 조회
  const { data, error} = await supabase
    .from('words')
    .select('hebrew, meaning, verse_id')
    .eq('verse_id', 'genesis_1_1')
    .order('position')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\n📖 창세기 1:1 단어들 (총 ${data?.length}개):\n`)
  data?.forEach((word, i) => {
    console.log(`${i + 1}. ${word.hebrew} - "${word.meaning}"`)
  })

  console.log('\n\n검색할 의미: "시작", "창조하다"')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // "시작"과 유사한 단어 찾기
  const { data: beginning } = await supabase
    .from('words')
    .select('hebrew, meaning')
    .or('meaning.ilike.%시작%,meaning.ilike.%태초%,meaning.ilike.%처음%,hebrew.eq.בְּרֵאשִׁית')
    .limit(5)

  console.log('\n"시작" 관련 단어:')
  beginning?.forEach(w => console.log(`  - ${w.hebrew}: ${w.meaning}`))
}

checkWords().catch(console.error)
