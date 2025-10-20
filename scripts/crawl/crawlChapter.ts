/**
 * 단일 장 크롤링
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../src/lib/database.types'
import { BookInfo } from '../utils/constants'
import { log } from '../utils/logger'
import { fetchPageWithFirecrawl } from './fetchPage'
import { parseVerses } from './parseVerses'
import { saveVerses, VerseToSave } from './saveToDB'

export interface CrawlChapterResult {
  success: boolean
  versesCount: number
  error?: string
}

/**
 * 단일 장 크롤링
 */
export async function crawlChapter(
  supabase: SupabaseClient<Database>,
  book: BookInfo,
  chapter: number
): Promise<CrawlChapterResult> {
  log.step(`📖 ${book.name} ${chapter}장 크롤링 시작`)

  // URL 생성
  const url = book.urlPattern.replace('{chapter:02d}', chapter.toString().padStart(2, '0'))
  log.info(`URL: ${url}`)

  // 페이지 가져오기
  const fetchResult = await fetchPageWithFirecrawl(url)
  if (!fetchResult.success || !fetchResult.markdown) {
    return {
      success: false,
      versesCount: 0,
      error: fetchResult.error
    }
  }

  // 구절 파싱
  const parsedVerses = parseVerses(fetchResult.markdown)

  if (parsedVerses.length === 0) {
    log.warn('구절을 찾을 수 없습니다.')
    return {
      success: false,
      versesCount: 0,
      error: 'No verses found'
    }
  }

  // Supabase에 저장할 형식으로 변환
  const versesToSave: VerseToSave[] = parsedVerses.map(verse => ({
    bookId: book.id,
    bookName: book.name,
    chapter,
    verseNumber: verse.verseNumber,
    hebrew: verse.hebrew
  }))

  // Supabase에 저장
  log.step(`${book.name} ${chapter}장 ${versesToSave.length}개 구절 저장 중...`)
  const { success, failed } = await saveVerses(supabase, versesToSave)

  if (failed > 0) {
    log.warn(`${failed}개 구절 저장 실패`)
  }

  log.success(`✅ ${book.name} ${chapter}장 완료! (성공: ${success}, 실패: ${failed})`)

  return {
    success: failed === 0,
    versesCount: success
  }
}
