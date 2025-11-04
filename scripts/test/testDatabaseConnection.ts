#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

// 실제 앱과 동일하게 ANON KEY 사용
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔌 데이터베이스 연동 테스트 (앱과 동일한 방식)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📡 Supabase URL:', supabaseUrl)
  console.log('🔑 Using ANON KEY (앱과 동일)\n')

  // 창세기 1:1 단어 조회 (앱에서 사용하는 방식과 동일)
  console.log('🔍 창세기 1:1 단어 조회 중...\n')

  const { data: verses, error: verseError } = await supabase
    .from('verses')
    .select('id, reference, book_id, chapter, verse_number')
    .eq('id', 'genesis_1_1')
    .single()

  if (verseError) {
    console.error('❌ Verse 조회 실패:', verseError.message)
    return
  }

  console.log('✅ Verse 조회 성공:')
  console.log(`   ${verses.reference} (${verses.book_id} ${verses.chapter}:${verses.verse_number})\n`)

  // 해당 구절의 단어들 조회
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, icon_url, position')
    .eq('verse_id', verses.id)
    .order('position')

  if (wordsError) {
    console.error('❌ Words 조회 실패:', wordsError.message)
    return
  }

  console.log(`✅ Words 조회 성공: ${words?.length || 0}개 단어\n`)

  if (words && words.length > 0) {
    words.forEach((word, i) => {
      console.log(`[${i + 1}] ${word.hebrew} (${word.korean})`)
      console.log(`    뜻: ${word.meaning}`)
      console.log(`    position: ${word.position}`)
      if (word.icon_url) {
        console.log(`    ✅ icon_url: ${word.icon_url.substring(0, 80)}...`)
      } else {
        console.log(`    ❌ icon_url: NULL`)
      }
      console.log()
    })
  }

  // 이미지 URL 접근성 테스트
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🌐 이미지 URL 접근성 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  let accessibleCount = 0
  for (const word of words || []) {
    if (word.icon_url) {
      try {
        const response = await fetch(word.icon_url)
        if (response.ok) {
          console.log(`✅ ${word.hebrew}: ${response.status} OK`)
          accessibleCount++
        } else {
          console.log(`❌ ${word.hebrew}: ${response.status} ${response.statusText}`)
        }
      } catch (error: any) {
        console.log(`❌ ${word.hebrew}: ${error.message}`)
      }
    } else {
      console.log(`⚠️  ${word.hebrew}: No icon_url`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 테스트 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const totalWords = words?.length || 0
  console.log(`✅ DB 연동: 성공 (${totalWords}개 단어 조회)`)
  console.log(`✅ 이미지 접근: ${accessibleCount}/${totalWords} 성공`)

  if (accessibleCount === totalWords && totalWords === 7) {
    console.log('\n🎉 모든 테스트 통과! 앱에서 정상 작동할 것입니다.\n')
  } else {
    console.log('\n⚠️  일부 문제가 있습니다.\n')
  }
}

main().catch(console.error)
