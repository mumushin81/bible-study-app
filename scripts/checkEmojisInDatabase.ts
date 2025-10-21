#!/usr/bin/env tsx
/**
 * 데이터베이스의 이모지 상태 확인
 */

import 'dotenv/config'
import { createSupabaseClient } from './utils/supabase.js'
import { log } from './utils/logger.js'

const supabase = createSupabaseClient()

async function checkEmojis() {
  log.info('📊 데이터베이스 이모지 상태 확인\n')

  try {
    // 창세기 1장의 처음 10개 단어 확인
    const { data: words, error } = await supabase
      .from('words')
      .select(`
        hebrew,
        meaning,
        emoji,
        verses!inner (
          book_id,
          chapter,
          verse_number
        )
      `)
      .eq('verses.book_id', 'genesis')
      .eq('verses.chapter', 1)
      .limit(10)

    if (error) {
      log.error('조회 실패:', error.message)
      return
    }

    if (!words || words.length === 0) {
      log.warn('⚠️  단어가 없습니다.')
      return
    }

    log.info(`✅ ${words.length}개 단어 확인:\n`)

    words.forEach((word: any, index: number) => {
      const verse = word.verses
      log.info(`${index + 1}. ${word.hebrew} (${word.meaning})`)
      log.info(`   이모지: ${word.emoji || '❌ 없음'}`)
      log.info(`   위치: 창세기 ${verse.chapter}:${verse.verse_number}\n`)
    })

  } catch (error: any) {
    log.error('오류:', error.message)
  }
}

checkEmojis()
