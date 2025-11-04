#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
)

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 Genesis 1장 최종 상태 요약')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const { data: allWords } = await supabase
  .from('words')
  .select('id, verse_id, position, hebrew, meaning, icon_url')
  .like('verse_id', 'genesis_1_%')
  .order('verse_id')
  .order('position')

if (!allWords) {
  console.error('❌ 데이터 조회 실패')
  process.exit(1)
}

// Verse 별로 그룹화
const verses: any = {}
for (let i = 1; i <= 31; i++) {
  verses[`genesis_1_${i}`] = { total: 0, withImage: 0 }
}

allWords.forEach(w => {
  if (verses[w.verse_id]) {
    verses[w.verse_id].total++
    if (w.icon_url) verses[w.verse_id].withImage++
  }
})

console.log('구절별 이미지 상태:\n')

Object.keys(verses).forEach(verseId => {
  const s = verses[verseId]
  if (s.total === 0) return

  const pct = (s.withImage / s.total * 100).toFixed(0)
  const status = s.withImage === s.total ? '✅' : s.withImage > 0 ? '⚠️ ' : '❌'

  console.log(`${status} ${verseId.padEnd(16)} ${s.withImage}/${s.total} (${pct}%)`)
})

const totalWithImages = allWords.filter(w => w.icon_url).length
const totalWithoutImages = allWords.length - totalWithImages

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 전체 요약')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log(`총 단어 수: ${allWords.length}`)
console.log(`✅ 이미지 있음: ${totalWithImages} (${(totalWithImages / allWords.length * 100).toFixed(1)}%)`)
console.log(`❌ 이미지 없음: ${totalWithoutImages} (${(totalWithoutImages / allWords.length * 100).toFixed(1)}%)`)

// Genesis 1:3-31 specifically
const v3to31 = allWords.filter(w => {
  const match = w.verse_id.match(/genesis_1_(\d+)/)
  return match && parseInt(match[1]) >= 3 && parseInt(match[1]) <= 31
})
const v3to31WithImages = v3to31.filter(w => w.icon_url)

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`📍 Genesis 1:3-31 (금번 작업 대상)`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

console.log(`총 단어: ${v3to31.length}`)
console.log(`✅ 이미지 있음: ${v3to31WithImages.length} (${(v3to31WithImages.length / v3to31.length * 100).toFixed(1)}%)`)
console.log(`❌ 이미지 없음: ${v3to31.length - v3to31WithImages.length}`)

console.log(`\n`)
