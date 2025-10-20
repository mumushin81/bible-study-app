/**
 * Genesis 패턴을 한국어(창세기)로 변경
 * Genesis 1:5 → 창세기 1:5
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateGenesisReferences() {
  console.log('🔄 Genesis 패턴을 한국어로 변경 중...\n')

  // Genesis 패턴 구절 조회
  const { data: verses, error: fetchError } = await supabase
    .from('verses')
    .select('id, reference, book_id, chapter, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .like('reference', 'Genesis%')

  if (fetchError) {
    console.error('❌ 조회 실패:', fetchError.message)
    return
  }

  if (!verses || verses.length === 0) {
    console.log('✅ 변경할 구절이 없습니다.')
    return
  }

  console.log(`📝 ${verses.length}개 구절을 변경합니다:\n`)

  let successCount = 0
  let errorCount = 0

  for (const verse of verses) {
    const newReference = verse.reference.replace('Genesis', '창세기')

    console.log(`  ${verse.reference} → ${newReference}`)

    const { error: updateError } = await supabase
      .from('verses')
      .update({ reference: newReference })
      .eq('id', verse.id)

    if (updateError) {
      console.log(`    ❌ 실패: ${updateError.message}`)
      errorCount++
    } else {
      console.log(`    ✅ 완료`)
      successCount++
    }
  }

  console.log(`\n📊 결과:`)
  console.log(`  성공: ${successCount}개`)
  console.log(`  실패: ${errorCount}개`)

  // 변경 후 확인
  console.log('\n✅ 변경 후 확인...')
  const { data: allVerses, error: checkError } = await supabase
    .from('verses')
    .select('reference, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number', { ascending: true })

  if (checkError) {
    console.error('❌ 확인 실패:', checkError.message)
  } else if (allVerses) {
    const genesisPattern = allVerses.filter(v => v.reference.startsWith('Genesis'))
    const koreanPattern = allVerses.filter(v => v.reference.startsWith('창세기'))

    console.log(`\n  총 구절: ${allVerses.length}개`)
    console.log(`  "Genesis" 패턴: ${genesisPattern.length}개`)
    console.log(`  "창세기" 패턴: ${koreanPattern.length}개`)

    if (genesisPattern.length === 0) {
      console.log('\n✅ 모든 구절이 한국어로 변경되었습니다!')
    } else {
      console.log(`\n⚠️  아직 ${genesisPattern.length}개의 "Genesis" 패턴이 남아있습니다:`)
      genesisPattern.forEach(v => console.log(`    - ${v.reference}`))
    }
  }
}

updateGenesisReferences().catch(console.error)
