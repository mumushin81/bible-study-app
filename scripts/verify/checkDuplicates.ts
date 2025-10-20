/**
 * 중복 구절 검사
 *
 * 동일한 verse_id나 동일한 hebrew 텍스트를 가진 중복 구절을 찾습니다.
 *
 * 사용법:
 *   tsx scripts/verify/checkDuplicates.ts [bookId]
 *
 * 예시:
 *   tsx scripts/verify/checkDuplicates.ts          # 모든 책 검사
 *   tsx scripts/verify/checkDuplicates.ts genesis  # 창세기만 검사
 */

import { createSupabaseClient } from '../utils/supabase'
import { ALL_BOOKS, getBookInfo } from '../utils/constants'
import { log } from '../utils/logger'

interface DuplicateVerse {
  id: string
  reference: string
  hebrew: string
  count: number
}

async function checkBookDuplicates(bookId: string) {
  const book = getBookInfo(bookId)
  if (!book) {
    log.error(`알 수 없는 책: ${bookId}`)
    return
  }

  const supabase = createSupabaseClient()

  log.step(`📖 ${book.name} 중복 구절 검사`)

  // 모든 구절 조회
  const { data: verses, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew')
    .eq('book_id', bookId)

  if (error) {
    log.error(`구절 조회 실패: ${error.message}`)
    return
  }

  if (!verses || verses.length === 0) {
    log.warn('구절이 없습니다.')
    return
  }

  // ID 중복 검사
  const idMap = new Map<string, number>()
  verses.forEach(v => {
    idMap.set(v.id, (idMap.get(v.id) || 0) + 1)
  })

  const duplicateIds = Array.from(idMap.entries())
    .filter(([_, count]) => count > 1)
    .map(([id, count]) => {
      const verse = verses.find(v => v.id === id)!
      return { id, reference: verse.reference, hebrew: verse.hebrew, count }
    })

  // Hebrew 텍스트 중복 검사
  const hebrewMap = new Map<string, string[]>()
  verses.forEach(v => {
    if (!hebrewMap.has(v.hebrew)) {
      hebrewMap.set(v.hebrew, [])
    }
    hebrewMap.get(v.hebrew)!.push(v.reference)
  })

  const duplicateHebrew = Array.from(hebrewMap.entries())
    .filter(([_, refs]) => refs.length > 1)
    .map(([hebrew, refs]) => ({ hebrew, references: refs, count: refs.length }))

  // 결과 출력
  log.step('📊 검사 결과')
  log.info(`총 구절: ${verses.length}개`)

  if (duplicateIds.length === 0) {
    log.success('✅ ID 중복 없음')
  } else {
    log.warn(`⚠️  ID 중복: ${duplicateIds.length}개`)
    console.log('\nID 중복 목록:')
    duplicateIds.forEach(d => {
      console.log(`  - ${d.id} (${d.reference}) - ${d.count}회 중복`)
    })
  }

  if (duplicateHebrew.length === 0) {
    log.success('✅ 히브리어 텍스트 중복 없음')
  } else {
    log.warn(`⚠️  히브리어 텍스트 중복: ${duplicateHebrew.length}개`)
    console.log('\n히브리어 텍스트 중복 목록:')
    duplicateHebrew.slice(0, 5).forEach(d => {
      console.log(`  - "${d.hebrew.substring(0, 30)}..." - ${d.count}회 중복`)
      console.log(`    위치: ${d.references.join(', ')}`)
    })
    if (duplicateHebrew.length > 5) {
      console.log(`  ... 외 ${duplicateHebrew.length - 5}개`)
    }
  }

  return {
    totalVerses: verses.length,
    duplicateIds: duplicateIds.length,
    duplicateHebrew: duplicateHebrew.length
  }
}

async function main() {
  const args = process.argv.slice(2)
  const bookId = args[0]

  if (bookId) {
    // 특정 책만 검사
    await checkBookDuplicates(bookId)
  } else {
    // 모든 책 검사
    log.step('📚 전체 책 중복 구절 검사')

    let totalDuplicateIds = 0
    let totalDuplicateHebrew = 0

    for (const book of ALL_BOOKS) {
      const result = await checkBookDuplicates(book.id)
      if (result) {
        totalDuplicateIds += result.duplicateIds
        totalDuplicateHebrew += result.duplicateHebrew
      }
      console.log() // 줄바꿈
    }

    log.step('📊 전체 결과')
    if (totalDuplicateIds === 0 && totalDuplicateHebrew === 0) {
      log.success('✅ 모든 책에서 중복 없음!')
    } else {
      if (totalDuplicateIds > 0) {
        log.warn(`⚠️  총 ${totalDuplicateIds}개 ID 중복`)
      }
      if (totalDuplicateHebrew > 0) {
        log.warn(`⚠️  총 ${totalDuplicateHebrew}개 히브리어 텍스트 중복`)
      }
    }
  }
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  process.exit(1)
})
