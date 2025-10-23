/**
 * 데이터베이스와 동기화되지 않은 로컬 구절 파일 찾기
 *
 * words와 commentaries가 모두 있는 구절만 "동기화됨"으로 간주
 */

import { createSupabaseClient } from '../utils/supabase'
import { log } from '../utils/logger'
import * as fs from 'fs'
import * as path from 'path'

async function getVersesWithContent(bookId: string = 'genesis') {
  const supabase = createSupabaseClient()

  log.step(`📊 ${bookId} 콘텐츠 완성 구절 확인`)

  // 1. 전체 구절 가져오기
  const { data: allVerses, error: versesError } = await supabase
    .from('verses')
    .select('id, chapter, verse_number')
    .eq('book_id', bookId)
    .order('chapter, verse_number')

  if (versesError) {
    log.error(`구절 조회 실패: ${versesError.message}`)
    return new Set<string>()
  }

  if (!allVerses || allVerses.length === 0) {
    log.warn('구절이 없습니다.')
    return new Set<string>()
  }

  // 2. words가 있는 구절 확인
  const { data: versesWithWords } = await supabase
    .from('words')
    .select('verse_id')
    .in('verse_id', allVerses.map(v => v.id))

  const verseIdsWithWords = new Set(versesWithWords?.map(w => w.verse_id) || [])

  // 3. commentaries가 있는 구절 확인
  const { data: versesWithCommentaries } = await supabase
    .from('commentaries')
    .select('verse_id')
    .in('verse_id', allVerses.map(v => v.id))

  const verseIdsWithCommentaries = new Set(versesWithCommentaries?.map(c => c.verse_id) || [])

  // 4. words와 commentaries가 모두 있는 구절만 필터링
  const completedVerseIds = new Set<string>()

  allVerses.forEach(verse => {
    if (verseIdsWithWords.has(verse.id) && verseIdsWithCommentaries.has(verse.id)) {
      completedVerseIds.add(`${bookId}_${verse.chapter}_${verse.verse_number}`)
    }
  })

  log.success(`콘텐츠 완성 구절: ${completedVerseIds.size}개`)

  return completedVerseIds
}

function getLocalFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  const files = fs.readdirSync(directory)
  return files
    .filter(f => f.endsWith('.json') && f.startsWith('genesis_'))
    .map(f => path.join(directory, f))
}

function extractVerseIdFromFilename(filename: string): string[] {
  const basename = path.basename(filename, '.json')

  // 배치 파일 (예: genesis_11_1-3.json)
  const rangeMatch = basename.match(/^genesis_(\d+)_(\d+)-(\d+)$/)
  if (rangeMatch) {
    const chapter = parseInt(rangeMatch[1])
    const startVerse = parseInt(rangeMatch[2])
    const endVerse = parseInt(rangeMatch[3])
    const verses: string[] = []
    for (let v = startVerse; v <= endVerse; v++) {
      verses.push(`genesis_${chapter}_${v}`)
    }
    return verses
  }

  // 개별 파일 (예: genesis_1_1.json)
  const singleMatch = basename.match(/^genesis_(\d+)_(\d+)$/)
  if (singleMatch) {
    return [basename]
  }

  // 기타 파일 (예: genesis_1_batch1.json, genesis_5_comprehensive_check.json)
  return []
}

async function main() {
  log.step('🔍 데이터베이스와 동기화되지 않은 로컬 파일 찾기')

  // 1. DB에서 콘텐츠 완성 구절 가져오기
  const completedVerses = await getVersesWithContent('genesis')

  // 2. 로컬 파일 목록
  const generatedFiles = getLocalFiles('data/generated')
  const generatedV2Files = getLocalFiles('data/generated_v2')

  log.info(`\ndata/generated: ${generatedFiles.length}개 파일`)
  log.info(`data/generated_v2: ${generatedV2Files.length}개 파일`)

  // 3. 동기화되지 않은 파일 찾기
  const unsyncedFiles: string[] = []
  const specialFiles: string[] = [] // batch, mapping, check 등의 특수 파일

  ;[...generatedFiles, ...generatedV2Files].forEach(file => {
    const verseIds = extractVerseIdFromFilename(file)

    if (verseIds.length === 0) {
      // 특수 파일 (batch, mapping, comprehensive_check 등)
      specialFiles.push(file)
      return
    }

    // 모든 verseId가 DB에 완성된 상태인지 확인
    const allSynced = verseIds.every(id => completedVerses.has(id))

    if (!allSynced) {
      unsyncedFiles.push(file)
    }
  })

  // 4. 결과 출력
  console.log('\n📋 분석 결과:')
  console.log('─'.repeat(80))
  console.log(`총 로컬 파일: ${generatedFiles.length + generatedV2Files.length}개`)
  console.log(`동기화된 파일: ${generatedFiles.length + generatedV2Files.length - unsyncedFiles.length - specialFiles.length}개`)
  console.log(`동기화 안된 파일: ${unsyncedFiles.length}개`)
  console.log(`특수 파일: ${specialFiles.length}개`)

  if (unsyncedFiles.length > 0) {
    console.log('\n❌ 동기화 안된 파일 목록:')
    unsyncedFiles.forEach(file => {
      const verseIds = extractVerseIdFromFilename(file)
      console.log(`  ${file}`)
      if (verseIds.length > 0 && verseIds.length <= 5) {
        console.log(`    → ${verseIds.join(', ')}`)
      } else if (verseIds.length > 5) {
        console.log(`    → ${verseIds.slice(0, 3).join(', ')}... (총 ${verseIds.length}개)`)
      }
    })
  }

  if (specialFiles.length > 0) {
    console.log('\n⚠️  특수 파일 (수동 검토 필요):')
    specialFiles.forEach(file => {
      console.log(`  ${file}`)
    })
  }

  // 5. 삭제할 파일 목록 저장
  const deleteListPath = 'data/files_to_delete.txt'
  fs.writeFileSync(
    deleteListPath,
    [...unsyncedFiles, ...specialFiles].join('\n'),
    'utf-8'
  )

  log.success(`\n삭제 대상 파일 목록 저장: ${deleteListPath}`)
  log.info('\n다음 명령으로 삭제할 수 있습니다:')
  log.info('  npx tsx scripts/cleanup/deleteUnsyncedFiles.ts')

  return { unsyncedFiles, specialFiles }
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  console.error(error)
  process.exit(1)
})
