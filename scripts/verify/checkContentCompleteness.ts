/**
 * 콘텐츠 완성도 검사
 *
 * verses 테이블의 원문만이 아니라, words, commentaries 등의 실질적 콘텐츠 완성도를 검사합니다.
 *
 * 사용법:
 *   tsx scripts/verify/checkContentCompleteness.ts genesis
 */

import { createSupabaseClient } from '../utils/supabase'
import { log } from '../utils/logger'

interface ChapterStatus {
  chapter: number
  totalVerses: number
  versesWithWords: number
  versesWithCommentaries: number
  isComplete: boolean
}

async function checkContentCompleteness(bookId: string = 'genesis') {
  const supabase = createSupabaseClient()

  log.step(`📊 ${bookId} 콘텐츠 완성도 검사`)

  // 1. 전체 구절 목록 가져오기
  const { data: allVerses, error: versesError } = await supabase
    .from('verses')
    .select('id, chapter, verse_number')
    .eq('book_id', bookId)
    .order('chapter, verse_number')

  if (versesError) {
    log.error(`구절 조회 실패: ${versesError.message}`)
    return
  }

  if (!allVerses || allVerses.length === 0) {
    log.warn('구절이 없습니다.')
    return
  }

  log.info(`총 ${allVerses.length}개 구절 발견`)

  // 2. words가 있는 구절 확인
  const { data: versesWithWords, error: wordsError } = await supabase
    .from('words')
    .select('verse_id')
    .in('verse_id', allVerses.map(v => v.id))

  if (wordsError) {
    log.error(`단어 조회 실패: ${wordsError.message}`)
    return
  }

  const verseIdsWithWords = new Set(versesWithWords?.map(w => w.verse_id) || [])

  // 3. commentaries가 있는 구절 확인
  const { data: versesWithCommentaries, error: commentariesError } = await supabase
    .from('commentaries')
    .select('verse_id')
    .in('verse_id', allVerses.map(v => v.id))

  if (commentariesError) {
    log.error(`해설 조회 실패: ${commentariesError.message}`)
    return
  }

  const verseIdsWithCommentaries = new Set(versesWithCommentaries?.map(c => c.verse_id) || [])

  // 4. 장별로 그룹화하여 분석
  const chapterMap = new Map<number, ChapterStatus>()

  allVerses.forEach(verse => {
    if (!chapterMap.has(verse.chapter)) {
      chapterMap.set(verse.chapter, {
        chapter: verse.chapter,
        totalVerses: 0,
        versesWithWords: 0,
        versesWithCommentaries: 0,
        isComplete: false
      })
    }

    const status = chapterMap.get(verse.chapter)!
    status.totalVerses++

    if (verseIdsWithWords.has(verse.id)) {
      status.versesWithWords++
    }

    if (verseIdsWithCommentaries.has(verse.id)) {
      status.versesWithCommentaries++
    }

    // 완성 조건: words와 commentaries가 모두 있어야 함
    status.isComplete = (status.versesWithWords === status.totalVerses) &&
                       (status.versesWithCommentaries === status.totalVerses)
  })

  // 5. 결과 출력
  const chapters = Array.from(chapterMap.values()).sort((a, b) => a.chapter - b.chapter)

  console.log('\n📋 장별 콘텐츠 완성도:')
  console.log('─'.repeat(80))
  console.log('장 | 구절 수 | Words | Commentaries | 상태')
  console.log('─'.repeat(80))

  let completeChapters = 0
  let totalVersesWithContent = 0

  chapters.forEach(status => {
    const wordsProgress = `${status.versesWithWords}/${status.totalVerses}`
    const commentariesProgress = `${status.versesWithCommentaries}/${status.totalVerses}`
    const statusIcon = status.isComplete ? '✅' : '❌'

    console.log(
      `${status.chapter.toString().padStart(2)} | ` +
      `${status.totalVerses.toString().padStart(6)} | ` +
      `${wordsProgress.padEnd(8)} | ` +
      `${commentariesProgress.padEnd(12)} | ` +
      `${statusIcon}`
    )

    if (status.isComplete) {
      completeChapters++
      totalVersesWithContent += status.totalVerses
    }
  })

  console.log('─'.repeat(80))

  // 6. 최종 요약
  log.step('\n📊 최종 요약')
  console.log(`총 장 수: ${chapters.length}`)
  console.log(`완성된 장: ${completeChapters}/${chapters.length}`)
  console.log(`완성된 구절: ${totalVersesWithContent}/${allVerses.length}`)
  console.log(`완성률: ${((completeChapters / chapters.length) * 100).toFixed(1)}%`)

  // 7. 미완성 장 목록
  const incompleteChapters = chapters.filter(c => !c.isComplete)
  if (incompleteChapters.length > 0) {
    log.warn(`\n⚠️  미완성 장: ${incompleteChapters.map(c => c.chapter).join(', ')}`)

    console.log('\n상세 정보:')
    incompleteChapters.forEach(status => {
      const missingWords = status.totalVerses - status.versesWithWords
      const missingCommentaries = status.totalVerses - status.versesWithCommentaries

      if (missingWords > 0) {
        console.log(`  - ${status.chapter}장: Words ${missingWords}개 구절 누락`)
      }
      if (missingCommentaries > 0) {
        console.log(`  - ${status.chapter}장: Commentaries ${missingCommentaries}개 구절 누락`)
      }
    })
  } else {
    log.success('\n🎉 모든 장이 완성되었습니다!')
  }

  return {
    totalChapters: chapters.length,
    completeChapters,
    totalVerses: allVerses.length,
    totalVersesWithContent,
    incompleteChapters: incompleteChapters.map(c => c.chapter)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const bookId = args[0] || 'genesis'

  await checkContentCompleteness(bookId)
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  console.error(error)
  process.exit(1)
})
