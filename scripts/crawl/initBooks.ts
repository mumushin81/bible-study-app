/**
 * Books 테이블 초기화
 *
 * Torah 5권의 메타데이터를 Supabase에 저장합니다.
 *
 * 사용법:
 *   tsx scripts/crawl/initBooks.ts
 */

import { createSupabaseClient } from '../utils/supabase'
import { TORAH_BOOKS } from '../utils/constants'
import { log } from '../utils/logger'

async function main() {
  log.step('📚 Books 테이블 초기화 시작')

  const supabase = createSupabaseClient()
  log.success('Supabase 연결 완료')

  log.info(`총 ${TORAH_BOOKS.length}권의 책을 추가합니다.`)

  let success = 0
  let failed = 0

  for (const book of TORAH_BOOKS) {
    const bookData = {
      id: book.id,
      name: book.hebrewName,
      english_name: book.englishName,
      total_chapters: book.totalChapters,
      testament: book.testament,
      category: book.category,
      category_emoji: book.categoryEmoji
    }

    const { error } = await supabase
      .from('books')
      .upsert(bookData, { onConflict: 'id' })

    if (error) {
      log.error(`${book.name} 추가 실패: ${error.message}`)
      failed++
    } else {
      log.success(`${book.name} (${book.hebrewName}) - ${book.totalChapters}장`)
      success++
    }
  }

  log.step('📊 결과')
  log.info(`성공: ${success}개`)
  if (failed > 0) {
    log.warn(`실패: ${failed}개`)
  } else {
    log.success('Books 테이블 초기화 완료! 🎉')
  }
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  process.exit(1)
})
