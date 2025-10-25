#!/usr/bin/env tsx

/**
 * icon_url 디버깅 스크립트
 * DB에 실제로 icon_url이 저장되어 있는지, URL이 접근 가능한지 확인
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function debugIconUrl() {
  console.log('🔍 icon_url 근본 디버깅 시작\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1️⃣ DB에서 창세기 1장 구절 가져오기
  console.log('1️⃣ 창세기 1장 구절 조회...\n')
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')
    .limit(3)

  if (versesError) {
    console.error('❌ 구절 조회 실패:', versesError)
    return
  }

  console.log(`✅ ${verses?.length}개 구절 발견\n`)

  for (const verse of verses || []) {
    console.log(`\n📖 ${verse.reference}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 2️⃣ 각 구절의 단어들 조회 (icon_url 포함)
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, hebrew, meaning, icon_url, icon_svg')
      .eq('verse_id', verse.id)
      .order('position')
      .limit(5)

    if (wordsError) {
      console.error('❌ 단어 조회 실패:', wordsError)
      continue
    }

    console.log(`단어 개수: ${words?.length}개\n`)

    for (const word of words || []) {
      console.log(`히브리어: ${word.hebrew} (${word.meaning})`)
      console.log(`  ID: ${word.id}`)
      console.log(`  icon_url: ${word.icon_url ? '✅ 있음' : '❌ 없음'}`)
      console.log(`  icon_svg: ${word.icon_svg ? '✅ 있음' : '❌ 없음'}`)

      if (word.icon_url) {
        console.log(`  URL: ${word.icon_url}`)

        // 3️⃣ URL 접근 테스트
        try {
          const response = await fetch(word.icon_url, { method: 'HEAD' })
          if (response.ok) {
            console.log(`  접근: ✅ 성공 (${response.status})`)
          } else {
            console.log(`  접근: ❌ 실패 (${response.status})`)
          }
        } catch (err) {
          console.log(`  접근: ❌ 오류 - ${err}`)
        }
      }
      console.log('')
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('4️⃣ 전체 통계\n')

  // 4️⃣ 전체 통계
  const { data: allWords } = await supabase
    .from('words')
    .select('id, icon_url, icon_svg')
    .limit(1000)

  const withIconUrl = allWords?.filter(w => w.icon_url).length || 0
  const withIconSvg = allWords?.filter(w => w.icon_svg).length || 0
  const withBoth = allWords?.filter(w => w.icon_url && w.icon_svg).length || 0

  console.log(`총 샘플: ${allWords?.length}개`)
  console.log(`icon_url 있음: ${withIconUrl}개`)
  console.log(`icon_svg 있음: ${withIconSvg}개`)
  console.log(`둘 다 있음: ${withBoth}개`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 5️⃣ useVerses와 동일한 쿼리 테스트
  console.log('5️⃣ useVerses 쿼리 시뮬레이션\n')

  const { data: versesData, error: queryError } = await supabase
    .from('verses')
    .select(`
      *,
      words (
        hebrew,
        meaning,
        icon_url,
        icon_svg,
        position
      )
    `)
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')
    .limit(2)

  if (queryError) {
    console.error('❌ 쿼리 실패:', queryError)
    return
  }

  console.log(`✅ ${versesData?.length}개 구절 조회 성공\n`)

  for (const verse of versesData || []) {
    console.log(`${verse.reference}:`)
    const firstThreeWords = verse.words.slice(0, 3)
    for (const word of firstThreeWords) {
      console.log(`  ${word.hebrew}: icon_url=${word.icon_url ? '✅' : '❌'}`)
    }
    console.log('')
  }
}

debugIconUrl()
