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

async function checkDBUpdates() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 Genesis 1장 DB 업데이트 상태 확인')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Get all Genesis 1 words
  const { data: allWords, error } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, meaning, icon_url')
    .like('verse_id', 'genesis_1_%')
    .order('verse_id')
    .order('position')

  if (error) {
    console.error('❌ DB 조회 실패:', error)
    return
  }

  console.log(`총 Genesis 1장 단어 수: ${allWords.length}\n`)

  // Group by verse
  const byVerse = new Map<string, { total: number; withImage: number; words: any[] }>()

  allWords.forEach(word => {
    if (!byVerse.has(word.verse_id)) {
      byVerse.set(word.verse_id, { total: 0, withImage: 0, words: [] })
    }
    const verse = byVerse.get(word.verse_id)!
    verse.total++
    verse.words.push(word)
    if (word.icon_url) {
      verse.withImage++
    }
  })

  // Sort verses
  const sortedVerses = Array.from(byVerse.entries()).sort((a, b) => {
    const aNum = parseInt(a[0].match(/genesis_1_(\d+)/)![1])
    const bNum = parseInt(b[0].match(/genesis_1_(\d+)/)![1])
    return aNum - bNum
  })

  console.log('구절별 icon_url 상태:\n')

  sortedVerses.forEach(([verseId, stats]) => {
    const verseNum = parseInt(verseId.match(/genesis_1_(\d+)/)![1])
    const pct = (stats.withImage / stats.total * 100).toFixed(0)
    const status = stats.withImage === stats.total ? '✅' : stats.withImage > 0 ? '⚠️ ' : '❌'

    console.log(`${status} ${verseId.padEnd(16)} ${stats.withImage}/${stats.total} (${pct}%)`)

    // Show sample words without images
    if (verseNum >= 3 && verseNum <= 31 && stats.withImage === 0) {
      console.log(`    샘플: ${stats.words[0].hebrew} - ${stats.words[0].meaning}`)
      console.log(`    ID: ${stats.words[0].id}`)
    }
  })

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 요약')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const totalWithImages = allWords.filter(w => w.icon_url).length
  const totalWithoutImages = allWords.length - totalWithImages

  console.log(`✅ 이미지 있음: ${totalWithImages} (${(totalWithImages / allWords.length * 100).toFixed(1)}%)`)
  console.log(`❌ 이미지 없음: ${totalWithoutImages} (${(totalWithoutImages / allWords.length * 100).toFixed(1)}%)`)

  // Check Genesis 1:3-31 specifically
  const v3to31 = allWords.filter(w => {
    const match = w.verse_id.match(/genesis_1_(\d+)/)
    return match && parseInt(match[1]) >= 3 && parseInt(match[1]) <= 31
  })

  const v3to31WithImages = v3to31.filter(w => w.icon_url)

  console.log(`\n📍 Genesis 1:3-31 상태:`)
  console.log(`   총 단어: ${v3to31.length}`)
  console.log(`   이미지 있음: ${v3to31WithImages.length} (${(v3to31WithImages.length / v3to31.length * 100).toFixed(1)}%)`)
  console.log(`   이미지 없음: ${v3to31.length - v3to31WithImages.length}`)

  if (v3to31WithImages.length === 0) {
    console.log(`\n❌ Genesis 1:3-31 단어에 icon_url이 전혀 없습니다!`)
    console.log(`   → 업로드 스크립트가 DB 업데이트를 하지 못했습니다.`)
  }
}

checkDBUpdates().catch(console.error)
