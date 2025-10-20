/**
 * Genesis 패턴 중복 제거
 * Genesis 1:5, 1:8, 1:13, 1:19, 1:23, 1:31 삭제
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// 삭제할 구절 ID 목록
const idsToDelete = [
  'genesis_1_5',   // Genesis 1:5
  'genesis_1_8',   // Genesis 1:8
  'genesis_1_13',  // Genesis 1:13
  'genesis_1_19',  // Genesis 1:19
  'genesis_1_23',  // Genesis 1:23
  'genesis_1_31',  // Genesis 1:31
]

async function removeGenesisDuplicates() {
  console.log('🗑️  Genesis 패턴 중복 제거 시작...\n')

  // 삭제 전 확인
  console.log('삭제할 구절:')
  for (const id of idsToDelete) {
    const { data, error } = await supabase
      .from('verses')
      .select('id, reference, verse_number')
      .eq('id', id)
      .single()

    if (error) {
      console.log(`  ❌ ${id}: 찾을 수 없음`)
    } else if (data) {
      console.log(`  ✓ ${data.id}: ${data.reference} (절 ${data.verse_number})`)
    }
  }

  console.log('\n계속하시겠습니까? (Y/n)')

  // 삭제 실행
  console.log('\n삭제 중...')

  let successCount = 0
  let errorCount = 0

  for (const id of idsToDelete) {
    const { error } = await supabase
      .from('verses')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(`  ❌ ${id} 삭제 실패: ${error.message}`)
      errorCount++
    } else {
      console.log(`  ✅ ${id} 삭제 완료`)
      successCount++
    }
  }

  console.log(`\n📊 결과:`)
  console.log(`  성공: ${successCount}개`)
  console.log(`  실패: ${errorCount}개`)

  // 삭제 후 확인
  console.log('\n✅ 삭제 후 창세기 1장 구절 확인...')
  const { data: remainingVerses, error } = await supabase
    .from('verses')
    .select('reference, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number', { ascending: true })

  if (error) {
    console.error('❌ 확인 실패:', error.message)
  } else if (remainingVerses) {
    console.log(`총 ${remainingVerses.length}개 구절 남음`)

    // Genesis 패턴 확인
    const genesisPattern = remainingVerses.filter(v => v.reference.startsWith('Genesis'))
    if (genesisPattern.length === 0) {
      console.log('✅ 모든 "Genesis" 패턴이 제거되었습니다!')
    } else {
      console.log(`⚠️  아직 ${genesisPattern.length}개의 "Genesis" 패턴이 남아있습니다:`)
      genesisPattern.forEach(v => console.log(`  - ${v.reference}`))
    }

    // 누락된 구절 확인
    const verseNumbers = remainingVerses.map(v => v.verse_number).sort((a, b) => a - b)
    const missing = []
    for (let i = 1; i <= 31; i++) {
      if (!verseNumbers.includes(i)) {
        missing.push(i)
      }
    }

    if (missing.length > 0) {
      console.log(`⚠️  누락된 구절: ${missing.join(', ')}`)
    } else {
      console.log('✅ 1-31절 모두 존재합니다!')
    }
  }
}

removeGenesisDuplicates().catch(console.error)
