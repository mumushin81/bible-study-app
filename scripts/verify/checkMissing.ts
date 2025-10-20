/**
 * 누락 구절 검사
 *
 * 각 책의 예상 구절 수와 실제 구절 수를 비교하여 누락된 구절을 찾습니다.
 *
 * 사용법:
 *   tsx scripts/verify/checkMissing.ts [bookId]
 *
 * 예시:
 *   tsx scripts/verify/checkMissing.ts          # 모든 책 검사
 *   tsx scripts/verify/checkMissing.ts genesis  # 창세기만 검사
 */

import { createSupabaseClient } from '../utils/supabase'
import { ALL_BOOKS, getBookInfo } from '../utils/constants'
import { log } from '../utils/logger'

interface MissingVerse {
  book: string
  chapter: number
  verse: number
  expectedId: string
}

/**
 * 장별 예상 구절 수 (하드코딩 - 나중에 데이터로 관리)
 */
const EXPECTED_VERSES_PER_CHAPTER: Record<string, number[]> = {
  genesis: [
    31, 25, 24, 26, 32, 22, 24, 22, 29, 32, // 1-10
    32, 20, 18, 24, 21, 16, 27, 33, 38, 18, // 11-20
    34, 24, 20, 67, 34, 35, 46, 22, 35, 43, // 21-30
    54, 33, 20, 31, 29, 43, 36, 30, 23, 23, // 31-40
    57, 38, 34, 34, 28, 34, 31, 22, 33, 26  // 41-50
  ],
  exodus: [
    22, 25, 22, 31, 23, 30, 29, 28, 35, 29, // 1-10
    10, 51, 22, 31, 27, 36, 16, 27, 25, 26, // 11-20
    37, 30, 33, 18, 40, 37, 21, 43, 46, 38, // 21-30
    18, 35, 23, 35, 35, 38, 29, 31, 43, 38  // 31-40
  ],
  leviticus: [
    17, 16, 17, 35, 26, 23, 38, 36, 24, 20, // 1-10
    47, 8, 59, 57, 33, 34, 16, 30, 37, 27,  // 11-20
    24, 33, 44, 23, 55, 46, 34              // 21-27
  ],
  numbers: [
    54, 34, 51, 49, 31, 27, 89, 26, 23, 36, // 1-10
    35, 16, 33, 45, 41, 35, 28, 32, 22, 29, // 11-20
    35, 41, 30, 25, 19, 65, 23, 31, 39, 17, // 21-30
    54, 42, 56, 29, 34, 13                  // 31-36
  ],
  deuteronomy: [
    46, 37, 29, 49, 33, 25, 26, 20, 29, 22, // 1-10
    32, 31, 19, 29, 23, 22, 20, 22, 21, 20, // 11-20
    23, 29, 26, 22, 19, 19, 26, 69, 28, 20, // 21-30
    30, 52, 29, 12                          // 31-34
  ]
}

async function checkBookMissing(bookId: string) {
  const book = getBookInfo(bookId)
  if (!book) {
    log.error(`알 수 없는 책: ${bookId}`)
    return
  }

  const supabase = createSupabaseClient()

  log.step(`📖 ${book.name} 누락 구절 검사`)

  const expectedVersesPerChapter = EXPECTED_VERSES_PER_CHAPTER[bookId]
  if (!expectedVersesPerChapter) {
    log.warn(`${book.name}의 예상 구절 수 데이터가 없습니다.`)
    return
  }

  const missing: MissingVerse[] = []
  let totalExpected = 0
  let totalActual = 0

  // 각 장별로 검사
  for (let chapter = 1; chapter <= book.totalChapters; chapter++) {
    const expectedVersesInChapter = expectedVersesPerChapter[chapter - 1]
    totalExpected += expectedVersesInChapter

    // 실제 구절 조회
    const { data: verses, error } = await supabase
      .from('verses')
      .select('verse_number')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .order('verse_number')

    if (error) {
      log.error(`${book.name} ${chapter}장 조회 실패: ${error.message}`)
      continue
    }

    totalActual += verses?.length || 0

    // 누락 검사
    const actualVerseNumbers = new Set(verses?.map(v => v.verse_number) || [])
    for (let verse = 1; verse <= expectedVersesInChapter; verse++) {
      if (!actualVerseNumbers.has(verse)) {
        missing.push({
          book: book.name,
          chapter,
          verse,
          expectedId: `${bookId}_${chapter}_${verse}`
        })
      }
    }
  }

  // 결과 출력
  log.step('📊 검사 결과')
  log.info(`총 예상 구절: ${totalExpected}개`)
  log.info(`실제 구절: ${totalActual}개`)

  if (missing.length === 0) {
    log.success(`✅ ${book.name} - 누락 없음!`)
  } else {
    log.warn(`⚠️  누락된 구절: ${missing.length}개`)
    console.log('\n누락 목록:')
    missing.forEach(m => {
      console.log(`  - ${m.book} ${m.chapter}:${m.verse} (ID: ${m.expectedId})`)
    })
  }

  return { totalExpected, totalActual, missing }
}

async function main() {
  const args = process.argv.slice(2)
  const bookId = args[0]

  if (bookId) {
    // 특정 책만 검사
    await checkBookMissing(bookId)
  } else {
    // 모든 책 검사
    log.step('📚 전체 책 누락 구절 검사')

    let totalMissing = 0
    for (const book of ALL_BOOKS) {
      const result = await checkBookMissing(book.id)
      if (result) {
        totalMissing += result.missing.length
      }
      console.log() // 줄바꿈
    }

    log.step('📊 전체 결과')
    if (totalMissing === 0) {
      log.success('✅ 모든 책에서 누락 없음!')
    } else {
      log.warn(`⚠️  총 ${totalMissing}개 구절 누락`)
    }
  }
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  process.exit(1)
})
