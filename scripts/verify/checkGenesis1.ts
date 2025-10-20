#!/usr/bin/env tsx

import { supabase } from '../utils/supabase.js'

async function checkGenesis1() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 창세기 1장 컨텐츠 완성도 확인')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // 1. 구절 데이터 확인
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, verse_number, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')

  if (versesError) {
    console.error('❌ 구절 조회 실패:', versesError)
    process.exit(1)
  }

  console.log('📖 구절 데이터 (총 31개 구절)')
  console.log('')

  let completedCount = 0
  let emptyCount = 0

  verses?.forEach((verse) => {
    const hasContent = verse.ipa && verse.korean_pronunciation && verse.modern
    const status = hasContent ? '✅' : '❌'

    if (hasContent) {
      completedCount++
    } else {
      emptyCount++
    }

    console.log(`${status} ${verse.id.padEnd(15)} (절 ${verse.verse_number})`)
  })

  console.log('')
  console.log(`✅ 완료: ${completedCount}/31`)
  console.log(`❌ 미완료: ${emptyCount}/31`)
  console.log('')

  // 2. 단어 데이터 확인
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('verse_id, hebrew, emoji')
    .like('verse_id', 'genesis_1_%')

  if (wordsError) {
    console.error('❌ 단어 조회 실패:', wordsError)
    process.exit(1)
  }

  const wordsByVerse = words?.reduce((acc, word) => {
    if (!acc[word.verse_id]) {
      acc[word.verse_id] = []
    }
    acc[word.verse_id].push(word)
    return acc
  }, {} as Record<string, any[]>) || {}

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 단어 분석 데이터')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  let totalWords = 0
  verses?.forEach((verse) => {
    const hasContent = verse.ipa && verse.korean_pronunciation && verse.modern
    if (hasContent) {
      const verseWords = wordsByVerse[verse.id] || []
      totalWords += verseWords.length
      console.log(`${verse.id}: ${verseWords.length}개 단어`)
    }
  })

  console.log('')
  console.log(`총 단어 수: ${totalWords}개`)
  console.log('')

  // 3. 주석 데이터 확인
  const { data: commentaries, error: commentariesError } = await supabase
    .from('commentaries')
    .select('verse_id, intro')
    .like('verse_id', 'genesis_1_%')

  if (commentariesError) {
    console.error('❌ 주석 조회 실패:', commentariesError)
    process.exit(1)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💬 주석 데이터')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  const commentaryByVerse = commentaries?.reduce((acc, c) => {
    acc[c.verse_id] = c
    return acc
  }, {} as Record<string, any>) || {}

  let commentaryCount = 0
  verses?.forEach((verse) => {
    const hasContent = verse.ipa && verse.korean_pronunciation && verse.modern
    if (hasContent) {
      const commentary = commentaryByVerse[verse.id]
      const status = commentary ? '✅' : '❌'
      commentaryCount += commentary ? 1 : 0
      console.log(`${status} ${verse.id}`)
    }
  })

  console.log('')
  console.log(`총 주석 수: ${commentaryCount}개`)
  console.log('')

  // 4. 최종 요약
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 최종 요약')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log(`✅ 완료된 구절: ${completedCount}/31 (${Math.round(completedCount/31*100)}%)`)
  console.log(`📝 단어 분석: ${totalWords}개`)
  console.log(`💬 주석: ${commentaryCount}개`)
  console.log('')

  if (completedCount === 31) {
    console.log('🎉 창세기 1장 전체 완료!')
  } else {
    console.log(`⚠️  미완료 구절: ${emptyCount}개`)
  }
  console.log('')
}

checkGenesis1().catch(console.error)
