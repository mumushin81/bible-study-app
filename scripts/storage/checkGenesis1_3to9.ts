#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
)

const { data } = await supabase
  .from('words')
  .select('id, verse_id, position, hebrew, icon_url')
  .in('verse_id', ['genesis_1_3', 'genesis_1_4', 'genesis_1_5', 'genesis_1_6', 'genesis_1_7', 'genesis_1_8', 'genesis_1_9'])
  .order('verse_id')
  .order('position')

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔍 Genesis 1:3-9 단어 상태')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const byVerse: any = {}
data?.forEach(w => {
  if (!byVerse[w.verse_id]) byVerse[w.verse_id] = { total: 0, withImage: 0, words: [] }
  byVerse[w.verse_id].total++
  byVerse[w.verse_id].words.push(w)
  if (w.icon_url) byVerse[w.verse_id].withImage++
})

Object.entries(byVerse).forEach(([v, s]: any) => {
  const status = s.withImage > 0 ? '✅' : '❌'
  console.log(`${status} ${v}: ${s.withImage}/${s.total} 단어`)
  if (s.withImage === 0) {
    console.log(`    첫 단어: ${s.words[0].hebrew} (${s.words[0].meaning || 'N/A'})`)
    console.log(`    ID: ${s.words[0].id}\n`)
  }
})

const totalWithImage = data?.filter(w => w.icon_url).length || 0
console.log(`\n총 ${data?.length}개 단어 중 ${totalWithImage}개에 이미지 있음`)
