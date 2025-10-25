#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDuplicates() {
  console.log('🔍 중복 구절 검사 시작...\n')

  // 1. 모든 Genesis 1-3장 구절 가져오기
  const { data: verses } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number, reference, translation')
    .eq('book_id', 'genesis')
    .gte('chapter', 1)
    .lte('chapter', 3)
    .order('chapter')
    .order('verse_number')

  if (!verses) {
    console.error('❌ 구절 조회 실패')
    return
  }

  console.log(`📊 총 ${verses.length}개 구절 조회됨\n`)

  // 2. 중복 체크 (book_id + chapter + verse_number)
  const map = new Map<string, any[]>()

  verses.forEach(v => {
    const key = `${v.book_id}-${v.chapter}-${v.verse_number}`
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(v)
  })

  // 3. 중복 발견
  let duplicateCount = 0
  let nullTranslationCount = 0

  map.forEach((rows, key) => {
    if (rows.length > 1) {
      duplicateCount++
      console.log(`\n❌ 중복: ${key} (${rows.length}개)`)
      rows.forEach((r, idx) => {
        console.log(`   [${idx + 1}] ID: ${r.id.substring(0, 8)}, reference: ${r.reference}, translation: ${r.translation ? '✅' : '❌'}`)
      })
    }

    // translation null 체크
    rows.forEach(r => {
      if (!r.translation) {
        nullTranslationCount++
      }
    })
  })

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 통계:`)
  console.log(`   총 구절 수: ${verses.length}개`)
  console.log(`   고유 구절 수: ${map.size}개`)
  console.log(`   중복된 구절: ${duplicateCount}개`)
  console.log(`   translation null: ${nullTranslationCount}개`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (duplicateCount > 0) {
    console.log('⚠️  중복 구절이 발견되었습니다!')
  } else {
    console.log('✅ 중복 없음')
  }
}

checkDuplicates()
