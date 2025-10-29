#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStatus() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 창세기 1장 최종 이미지 상태')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const { data: allWords } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, meaning, icon_url')
    .like('verse_id', 'genesis_1_%')
    .order('verse_id')
    .order('position')

  if (!allWords) {
    console.error('데이터를 가져올 수 없습니다')
    return
  }

  const withImages = allWords.filter(w => w.icon_url)
  const withoutImages = allWords.filter(w => !w.icon_url)
  const percentage = (withImages.length / allWords.length * 100).toFixed(1)

  console.log(`총 단어 수: ${allWords.length}`)
  console.log(`✅ 이미지 있음: ${withImages.length} (${percentage}%)`)
  console.log(`❌ 이미지 없음: ${withoutImages.length} (${(100 - parseFloat(percentage)).toFixed(1)}%)\n`)

  // Group by verse
  const byVerse = new Map<string, { total: number; withImage: number }>()

  allWords.forEach(word => {
    if (!byVerse.has(word.verse_id)) {
      byVerse.set(word.verse_id, { total: 0, withImage: 0 })
    }
    const verse = byVerse.get(word.verse_id)!
    verse.total++
    if (word.icon_url) {
      verse.withImage++
    }
  })

  console.log('구절별 상태:\n')
  const sortedVerses = Array.from(byVerse.entries()).sort((a, b) => {
    const aNum = parseInt(a[0].match(/genesis_1_(\d+)/)![1])
    const bNum = parseInt(b[0].match(/genesis_1_(\d+)/)![1])
    return aNum - bNum
  })

  sortedVerses.forEach(([verseId, stats]) => {
    const pct = (stats.withImage / stats.total * 100).toFixed(0)
    const status = stats.withImage === stats.total ? '✅' : '⚠️ '
    const bar = '█'.repeat(Math.floor(stats.withImage / stats.total * 20))
    const empty = '░'.repeat(20 - Math.floor(stats.withImage / stats.total * 20))
    console.log(`${status} ${verseId.padEnd(15)} ${bar}${empty} ${stats.withImage}/${stats.total} (${pct}%)`)
  })

  if (withoutImages.length > 0) {
    console.log(`\n⚠️  이미지가 없는 단어 (${withoutImages.length}개):\n`)
    withoutImages.slice(0, 10).forEach(word => {
      console.log(`  ${word.verse_id} [${word.position}] ${word.hebrew} (${word.meaning})`)
    })
    if (withoutImages.length > 10) {
      console.log(`  ... 외 ${withoutImages.length - 10}개`)
    }
  } else {
    console.log('\n🎉 창세기 1장의 모든 단어에 이미지가 있습니다!')
  }
}

checkStatus().catch(console.error)
