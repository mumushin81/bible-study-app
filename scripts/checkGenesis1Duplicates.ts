/**
 * 창세기 1장 중복 체크
 * Genesis (영어) vs 창세기 (한글) reference 중복 확인
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGenesis1Duplicates() {
  console.log('📖 창세기 1장 중복 확인 중...\n')

  // 창세기 1장 모든 구절 조회
  const { data: verses, error } = await supabase
    .from('verses')
    .select('id, reference, book_id, chapter, verse_number, hebrew')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number', { ascending: true })

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  if (!verses || verses.length === 0) {
    console.log('⚠️  구절이 없습니다.')
    return
  }

  console.log(`총 ${verses.length}개 구절 발견\n`)

  // reference 패턴별 그룹화
  const genesisPattern = verses.filter(v => v.reference.startsWith('Genesis'))
  const koreanPattern = verses.filter(v => v.reference.startsWith('창세기'))

  console.log('📊 Reference 패턴 분석:')
  console.log(`  - "Genesis" 패턴: ${genesisPattern.length}개`)
  console.log(`  - "창세기" 패턴: ${koreanPattern.length}개\n`)

  if (genesisPattern.length > 0) {
    console.log('🔍 "Genesis" 패턴 구절 목록:')
    genesisPattern.forEach(v => {
      console.log(`  ${v.reference} (verse_number: ${v.verse_number})`)
    })
    console.log()
  }

  if (koreanPattern.length > 0) {
    console.log('🔍 "창세기" 패턴 구절 목록:')
    koreanPattern.forEach(v => {
      console.log(`  ${v.reference} (verse_number: ${v.verse_number})`)
    })
    console.log()
  }

  // verse_number 기준 중복 검사
  const verseNumberMap = new Map<number, any[]>()
  verses.forEach(v => {
    if (!verseNumberMap.has(v.verse_number)) {
      verseNumberMap.set(v.verse_number, [])
    }
    verseNumberMap.get(v.verse_number)!.push(v)
  })

  const duplicates = Array.from(verseNumberMap.entries())
    .filter(([_, verses]) => verses.length > 1)

  if (duplicates.length > 0) {
    console.log('⚠️  중복된 verse_number 발견:')
    duplicates.forEach(([verseNum, dupVerses]) => {
      console.log(`\n  구절 ${verseNum}번: ${dupVerses.length}개 중복`)
      dupVerses.forEach(v => {
        console.log(`    - ${v.id}: ${v.reference}`)
      })
    })
  } else {
    console.log('✅ verse_number 중복 없음')
  }

  // 삭제 대상 ID 출력
  if (genesisPattern.length > 0) {
    console.log('\n🗑️  삭제 추천 (Genesis 패턴):')
    console.log('삭제할 ID 목록:')
    genesisPattern.forEach(v => {
      console.log(`  '${v.id}', // ${v.reference}`)
    })
  }
}

checkGenesis1Duplicates().catch(console.error)
