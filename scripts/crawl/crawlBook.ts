/**
 * 책 전체 크롤링
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../src/lib/database.types'
import { BookInfo } from '../utils/constants'
import { log } from '../utils/logger'
import { crawlChapter } from './crawlChapter'

export interface CrawlBookOptions {
  startChapter?: number
  endChapter?: number
  delayMs?: number // 각 장 사이 대기 시간
}

export interface CrawlBookResult {
  success: boolean
  chaptersProcessed: number
  totalVerses: number
  errors: string[]
}

/**
 * 책 전체 크롤링
 */
export async function crawlBook(
  supabase: SupabaseClient<Database>,
  book: BookInfo,
  options: CrawlBookOptions = {}
): Promise<CrawlBookResult> {
  const {
    startChapter = 1,
    endChapter = book.totalChapters,
    delayMs = 2000
  } = options

  log.step(`📚 ${book.name} 크롤링 시작 (${startChapter}장~${endChapter}장)`)

  const result: CrawlBookResult = {
    success: true,
    chaptersProcessed: 0,
    totalVerses: 0,
    errors: []
  }

  for (let chapter = startChapter; chapter <= endChapter; chapter++) {
    log.progress(chapter - startChapter + 1, endChapter - startChapter + 1, `${book.name} ${chapter}장`)

    try {
      const chapterResult = await crawlChapter(supabase, book, chapter)

      if (chapterResult.success) {
        result.chaptersProcessed++
        result.totalVerses += chapterResult.versesCount
      } else {
        result.errors.push(`${book.name} ${chapter}장: ${chapterResult.error}`)
        log.error(`${book.name} ${chapter}장 실패: ${chapterResult.error}`)
      }
    } catch (error: any) {
      result.errors.push(`${book.name} ${chapter}장: ${error.message}`)
      log.error(`${book.name} ${chapter}장 예외 발생: ${error.message}`)
    }

    // Rate limiting: 다음 장으로 넘어가기 전 대기
    if (chapter < endChapter) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  // 최종 결과
  log.step('📊 크롤링 결과')
  log.info(`처리된 장: ${result.chaptersProcessed}/${endChapter - startChapter + 1}`)
  log.info(`총 구절: ${result.totalVerses}개`)

  if (result.errors.length > 0) {
    result.success = false
    log.warn(`에러 발생: ${result.errors.length}건`)
    result.errors.forEach(err => log.error(err))
  } else {
    log.success(`${book.name} 크롤링 완료! 🎉`)
  }

  return result
}
