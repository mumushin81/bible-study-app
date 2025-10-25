#!/usr/bin/env tsx

/**
 * 창세기 1장의 고유 단어 목록 추출
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { writeFileSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getGenesis1Words() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 창세기 1장 고유 단어 추출')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 창세기 1장의 모든 단어 가져오기 (verses 조인)
  const { data: words, error } = await supabase
    .from('words')
    .select(`
      hebrew,
      meaning,
      korean,
      grammar,
      root,
      icon_url,
      verses!inner (
        chapter,
        verse_number
      )
    `)
    .eq('verses.chapter', 1)

  if (error) {
    console.error('❌ 오류:', error)
    return
  }

  console.log(`📊 총 ${words.length}개 단어 레코드\n`)

  // 고유 단어 추출 (meaning 기준)
  const uniqueWordsMap = new Map<string, any>()

  words.forEach(word => {
    if (!word.meaning) return

    // 이미 같은 의미가 있으면 스킵 (첫 번째 것 유지)
    if (!uniqueWordsMap.has(word.meaning)) {
      uniqueWordsMap.set(word.meaning, word)
    }
  })

  const uniqueWords = Array.from(uniqueWordsMap.values())

  // 이미 이미지가 있는 단어와 없는 단어 분류
  const wordsWithImage = uniqueWords.filter(w => w.icon_url)
  const wordsWithoutImage = uniqueWords.filter(w => !w.icon_url)

  console.log(`✅ 고유 단어: ${uniqueWords.length}개`)
  console.log(`   - 이미지 있음: ${wordsWithImage.length}개`)
  console.log(`   - 이미지 없음: ${wordsWithoutImage.length}개\n`)

  // 품사별 통계
  const grammarStats: Record<string, number> = {}
  wordsWithoutImage.forEach(w => {
    const grammar = w.grammar || '미분류'
    grammarStats[grammar] = (grammarStats[grammar] || 0) + 1
  })

  console.log('📊 이미지 미생성 단어 품사별 분포:')
  Object.entries(grammarStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([grammar, count]) => {
      console.log(`   ${grammar}: ${count}개`)
    })
  console.log()

  // JSON 파일로 저장
  const outputPath = join(process.cwd(), 'scripts', 'images', 'genesis1-words.json')
  writeFileSync(outputPath, JSON.stringify({
    total: uniqueWords.length,
    withImage: wordsWithImage.length,
    withoutImage: wordsWithoutImage.length,
    wordsToGenerate: wordsWithoutImage.map(w => ({
      hebrew: w.hebrew,
      meaning: w.meaning,
      korean: w.korean,
      grammar: w.grammar,
      root: w.root
    }))
  }, null, 2))

  console.log(`💾 저장 완료: ${outputPath}`)
  console.log()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 다음 단계:')
  console.log(`   1. 생성할 이미지: ${wordsWithoutImage.length}개`)
  console.log(`   2. 예상 비용: $${(wordsWithoutImage.length * 0.003).toFixed(3)}`)
  console.log(`   3. 예상 시간: ${Math.ceil(wordsWithoutImage.length * 6 / 60)}분`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

getGenesis1Words()
