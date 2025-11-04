#!/usr/bin/env tsx

/**
 * 창세기 1장 전체 단어 분석
 * - 중요 단어 vs 비중요 단어 분류
 * - 중요: 핵심 명사, 동사
 * - 비중요: 전치사, 접속사, 관사
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 중요 단어 판별 기준
function isImportantWord(word: { meaning: string; grammar: string }): boolean {
  const { meaning, grammar } = word

  // 전치사, 접속사, 관사는 비중요
  if (grammar?.includes('전치사') || grammar?.includes('접속사') || grammar?.includes('관사')) {
    return false
  }

  // 매우 짧은 문법 표지는 비중요
  if (meaning.includes('목적격 표지') || meaning.includes('~을/를') || meaning.includes('~와/과')) {
    return false
  }

  // 핵심 신학 개념은 중요
  const keyTheologicalTerms = [
    '하나님', '엘로힘', '창조', '빛', '어둠', '하늘', '땅', '물', '식물', '동물',
    '사람', '남자', '여자', '영', '생명', '선', '악', '복', '거하다', '다스리다',
    '열매', '씨', '나무', '풀', '짐승', '새', '물고기', '형상', '모양'
  ]

  if (keyTheologicalTerms.some(term => meaning.includes(term))) {
    return true
  }

  // 명사, 동사는 일반적으로 중요
  if (grammar?.includes('명사') || grammar?.includes('동사')) {
    return true
  }

  return false
}

async function analyzeGenesis1Words() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 창세기 1장 단어 분석')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 창세기 1장 전체 verses 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')

  if (!verses) {
    console.error('❌ 창세기 1장을 찾을 수 없습니다.')
    return
  }

  console.log(`📖 총 ${verses.length}개 절\n`)

  let totalWords = 0
  let importantWords = 0
  let unimportantWords = 0
  let wordsWithImages = 0
  let wordsWithoutImages = 0

  const importantWordsList: any[] = []
  const unimportantWordsList: any[] = []

  for (const verse of verses) {
    const { data: words } = await supabase
      .from('words')
      .select('id, hebrew, meaning, grammar, icon_url')
      .eq('verse_id', verse.id)
      .order('position')

    if (!words) continue

    totalWords += words.length

    for (const word of words) {
      if (word.icon_url) {
        wordsWithImages++
      } else {
        wordsWithoutImages++
      }

      if (isImportantWord(word)) {
        importantWords++
        if (!word.icon_url) {
          importantWordsList.push({
            verse: verse.verse_number,
            hebrew: word.hebrew,
            meaning: word.meaning,
            grammar: word.grammar
          })
        }
      } else {
        unimportantWords++
        if (!word.icon_url) {
          unimportantWordsList.push({
            verse: verse.verse_number,
            hebrew: word.hebrew,
            meaning: word.meaning,
            grammar: word.grammar
          })
        }
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 전체 통계')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`총 단어 수: ${totalWords}개`)
  console.log(`  ⭐ 중요 단어: ${importantWords}개 (${Math.round(importantWords/totalWords*100)}%)`)
  console.log(`  ➖ 비중요 단어: ${unimportantWords}개 (${Math.round(unimportantWords/totalWords*100)}%)`)
  console.log()
  console.log(`이미지 현황:`)
  console.log(`  ✅ 있음: ${wordsWithImages}개`)
  console.log(`  ❌ 없음: ${wordsWithoutImages}개`)
  console.log()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⭐ 이미지 없는 중요 단어 (GIF 생성 대상)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`총 ${importantWordsList.length}개\n`)

  // 절별로 그룹핑
  const byVerse = new Map<number, any[]>()
  importantWordsList.forEach(w => {
    if (!byVerse.has(w.verse)) byVerse.set(w.verse, [])
    byVerse.get(w.verse)!.push(w)
  })

  for (const [verse, words] of Array.from(byVerse.entries()).sort((a, b) => a[0] - b[0])) {
    console.log(`📖 1:${verse} (${words.length}개)`)
    words.forEach(w => {
      console.log(`   ${w.hebrew} - ${w.meaning} (${w.grammar})`)
    })
    console.log()
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('➖ 이미지 없는 비중요 단어 (JPG 생성 대상)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`총 ${unimportantWordsList.length}개\n`)

  const byVerseUnimportant = new Map<number, any[]>()
  unimportantWordsList.forEach(w => {
    if (!byVerseUnimportant.has(w.verse)) byVerseUnimportant.set(w.verse, [])
    byVerseUnimportant.get(w.verse)!.push(w)
  })

  for (const [verse, words] of Array.from(byVerseUnimportant.entries()).sort((a, b) => a[0] - b[0])) {
    console.log(`📖 1:${verse} (${words.length}개)`)
    words.forEach(w => {
      console.log(`   ${w.hebrew} - ${w.meaning} (${w.grammar})`)
    })
    console.log()
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 생성 계획')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`🎬 GIF 생성: ${importantWordsList.length}개 (중요 단어)`)
  console.log(`📷 JPG 생성: ${unimportantWordsList.length}개 (비중요 단어)`)
  console.log(`\n총 ${importantWordsList.length + unimportantWordsList.length}개 이미지 생성 필요`)
}

analyzeGenesis1Words().catch(console.error)
