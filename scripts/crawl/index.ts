/**
 * 크롤링 메인 진입점
 *
 * 사용법:
 *   tsx scripts/crawl/index.ts <bookId> [startChapter] [endChapter]
 *
 * 예시:
 *   tsx scripts/crawl/index.ts genesis          # 창세기 전체
 *   tsx scripts/crawl/index.ts genesis 1        # 창세기 1장
 *   tsx scripts/crawl/index.ts genesis 1 10     # 창세기 1-10장
 */

import { createSupabaseClient } from '../utils/supabase'
import { getBookInfo } from '../utils/constants'
import { log } from '../utils/logger'
import { crawlBook } from './crawlBook'
import { crawlChapter } from './crawlChapter'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    log.error('사용법: tsx scripts/crawl/index.ts <bookId> [startChapter] [endChapter]')
    log.info('예시:')
    log.info('  tsx scripts/crawl/index.ts genesis')
    log.info('  tsx scripts/crawl/index.ts genesis 1')
    log.info('  tsx scripts/crawl/index.ts genesis 1 10')
    process.exit(1)
  }

  const bookId = args[0]
  const startChapter = args[1] ? parseInt(args[1]) : undefined
  const endChapter = args[2] ? parseInt(args[2]) : undefined

  // 책 정보 가져오기
  const book = getBookInfo(bookId)
  if (!book) {
    log.error(`알 수 없는 책: ${bookId}`)
    log.info('지원하는 책: genesis, exodus, leviticus, numbers, deuteronomy')
    process.exit(1)
  }

  // Supabase 클라이언트 생성
  const supabase = createSupabaseClient()
  log.success('Supabase 연결 완료')

  // 단일 장 크롤링
  if (startChapter && !endChapter) {
    await crawlChapter(supabase, book, startChapter)
  }
  // 범위 크롤링 또는 전체 크롤링
  else {
    await crawlBook(supabase, book, {
      startChapter,
      endChapter
    })
  }
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  process.exit(1)
})
