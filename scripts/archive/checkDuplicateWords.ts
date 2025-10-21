/**
 * 중복 히브리어 단어의 이모지 일관성 확인
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDuplicateWords() {
  console.log('🔍 중복 히브리어 단어 이모지 일관성 확인...\n')

  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning, emoji')
    .order('hebrew', { ascending: true })

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  if (!words || words.length === 0) {
    console.log('⚠️  단어가 없습니다.')
    return
  }

  // 히브리어별로 그룹화
  const wordGroups = new Map<string, Array<{meaning: string, emoji: string}>>()
  
  words.forEach(word => {
    if (!wordGroups.has(word.hebrew)) {
      wordGroups.set(word.hebrew, [])
    }
    wordGroups.get(word.hebrew)!.push({
      meaning: word.meaning,
      emoji: word.emoji
    })
  })

  // 2개 이상 나오는 단어 찾기
  const duplicates = Array.from(wordGroups.entries())
    .filter(([_, items]) => items.length > 1)

  console.log(`📊 전체 고유 히브리어 단어: ${wordGroups.size}개`)
  console.log(`🔄 중복 사용된 히브리어 단어: ${duplicates.length}개\n`)

  if (duplicates.length > 0) {
    console.log('중복 단어 상세 (처음 10개):')
    duplicates.slice(0, 10).forEach(([hebrew, items]) => {
      console.log(`\n${hebrew} - ${items.length}번 사용됨`)
      
      // 이모지 일관성 확인
      const emojis = new Set(items.map(i => i.emoji))
      if (emojis.size === 1) {
        console.log(`  ✅ 이모지 일관성: ${items[0].emoji}`)
      } else {
        console.log(`  ❌ 이모지 불일치:`)
        items.forEach((item, i) => {
          console.log(`     ${i + 1}. ${item.meaning} → ${item.emoji}`)
        })
      }
    })
  }
}

checkDuplicateWords().catch(console.error)
