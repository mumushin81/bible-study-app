#!/usr/bin/env tsx

/**
 * 창세기 1장 2-31절의 고유 단어 추출 (1절 제외)
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

async function getGenesis1Verse2Plus() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 창세기 1장 2-31절 고유 단어 추출')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 창세기 1장 2-31절 단어 가져오기
  const { data: words, error } = await supabase
    .from('words')
    .select(`
      hebrew,
      meaning,
      korean,
      grammar,
      root,
      icon_url,
      ipa,
      verses!inner (
        chapter,
        verse_number
      )
    `)
    .eq('verses.chapter', 1)
    .gte('verses.verse_number', 2)  // 2절부터

  if (error) {
    console.error('❌ 오류:', error)
    return
  }

  console.log(`📊 총 ${words.length}개 단어 레코드 (2-31절)\n`)

  // 고유 단어 추출 (meaning 기준)
  const uniqueWordsMap = new Map<string, any>()

  words.forEach(word => {
    if (!word.meaning) return

    if (!uniqueWordsMap.has(word.meaning)) {
      uniqueWordsMap.set(word.meaning, word)
    }
  })

  const uniqueWords = Array.from(uniqueWordsMap.values())

  console.log(`✅ 고유 단어: ${uniqueWords.length}개\n`)

  // 품사별 통계
  const grammarStats: Record<string, number> = {}
  uniqueWords.forEach(w => {
    const grammar = w.grammar || '미분류'
    grammarStats[grammar] = (grammarStats[grammar] || 0) + 1
  })

  console.log('📊 품사별 분포:')
  Object.entries(grammarStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([grammar, count]) => {
      console.log(`   ${grammar}: ${count}개`)
    })
  console.log()

  // WordInfo 형식으로 변환
  const wordsToGenerate = uniqueWords.map(w => ({
    hebrew: w.hebrew,
    meaning: w.meaning,
    korean: w.korean,
    ipa: w.ipa || '',
    root: w.root || w.hebrew,
    grammar: w.grammar || '명사',
  }))

  // JSON 파일로 저장
  const outputPath = join(process.cwd(), 'scripts', 'images', 'genesis1-verse2-31.json')
  writeFileSync(outputPath, JSON.stringify({
    total: uniqueWords.length,
    wordsToGenerate
  }, null, 2))

  console.log(`💾 저장 완료: ${outputPath}`)
  console.log()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 다음 단계:')
  console.log(`   1. 생성할 이미지: ${uniqueWords.length}개`)
  console.log(`   2. 예상 비용: $${(uniqueWords.length * 0.003).toFixed(3)}`)
  console.log(`   3. 예상 시간: ${Math.ceil(uniqueWords.length * 6 / 60)}분`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

getGenesis1Verse2Plus()
