/**
 * 빈 구절 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEmptyVerses() {
  console.log('📊 빈 구절 확인 중...\n')

  // 창세기 1장 확인
  const { data: gen1, error: gen1Error } = await supabase
    .from('verses')
    .select('id, verse_number, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number', { ascending: true })

  if (gen1Error) {
    console.error('❌ 에러:', gen1Error.message)
    return
  }

  console.log('창세기 1장 (31개 구절):')
  let completeCount = 0
  let emptyCount = 0

  gen1?.forEach(v => {
    const hasIpa = !!v.ipa
    const hasKorean = !!v.korean_pronunciation
    const hasModern = !!v.modern
    const isComplete = hasIpa && hasKorean && hasModern

    if (isComplete) {
      completeCount++
    } else {
      emptyCount++
      console.log(`  ⚠️  ${v.verse_number}절 - 비어있음 (ipa: ${hasIpa}, korean: ${hasKorean}, modern: ${hasModern})`)
    }
  })

  console.log(`\n✅ 완료: ${completeCount}개`)
  console.log(`⚠️  비어있음: ${emptyCount}개\n`)

  // fetchEmptyVerses 로직 시뮬레이션
  console.log('🔍 fetchEmptyVerses 함수가 찾을 구절:')
  const { data: emptyVerses, error: emptyError } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .or('ipa.eq.,korean_pronunciation.eq.,modern.eq.')
    .order('verse_number', { ascending: true })

  if (emptyError) {
    console.error('❌ 에러:', emptyError.message)
    return
  }

  if (!emptyVerses || emptyVerses.length === 0) {
    console.log('✅ 창세기 1장은 모든 컨텐츠가 완료되었습니다!')
    console.log('   → generate:prompt를 실행하면 이 장은 스킵됩니다.\n')
  } else {
    console.log(`⚠️  ${emptyVerses.length}개 구절이 빈 상태입니다:`)
    emptyVerses.forEach(v => {
      console.log(`   - ${v.reference}`)
    })
  }

  // 창세기 2장 확인
  console.log('\n창세기 2장 확인:')
  const { count, error: countError } = await supabase
    .from('verses')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', 'genesis')
    .eq('chapter', 2)
    .or('ipa.eq.,korean_pronunciation.eq.,modern.eq.')

  if (countError) {
    console.error('❌ 에러:', countError.message)
    return
  }

  console.log(`  빈 구절: ${count}개`)
  if (count && count > 0) {
    console.log(`  → generate:prompt genesis 2 명령으로 ${count}개 구절 생성 가능`)
  }
}

checkEmptyVerses().catch(console.error)
