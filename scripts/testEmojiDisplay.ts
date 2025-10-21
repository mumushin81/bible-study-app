#!/usr/bin/env tsx
/**
 * 이모지가 실제로 표시되는지 테스트
 */

import 'dotenv/config'
import { createSupabaseClient } from './utils/supabase.js'
import { log } from './utils/logger.js'

const supabase = createSupabaseClient()

async function testEmojis() {
  log.info('🧪 이모지 표시 테스트\n')

  // 구절과 단어를 함께 가져오기 (실제 앱과 동일한 쿼리)
  const { data, error } = await supabase
    .from('verses')
    .select(`
      id,
      reference,
      words (
        hebrew,
        meaning,
        emoji,
        position
      )
    `)
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single()

  if (error) {
    log.error('조회 실패:', error.message)
    return
  }

  if (!data) {
    log.warn('데이터 없음')
    return
  }

  log.info(`📖 구절: ${data.reference}\n`)
  log.info(`단어들 (위치 순서):\n`)

  const sortedWords = (data.words || []).sort((a: any, b: any) => a.position - b.position)

  sortedWords.forEach((word: any, index: number) => {
    log.info(`${index + 1}. ${word.hebrew} (${word.meaning})`)
    log.info(`   이모지: ${word.emoji || '❌ NULL/없음'}\n`)
  })
}

testEmojis()
