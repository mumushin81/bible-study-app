import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/lib/database.types'
import { bibleBooks } from '../src/data/bibleBooks'
import { verses } from '../src/data/verses'

// Supabase 클라이언트 생성 (환경변수 사용)
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 로그 헬퍼
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (step: number, total: number, msg: string) => console.log(`\n[${step}/${total}] ${msg}`)
}

// Step 1: books 테이블에 성경 66권 마이그레이션
async function migrateBibleBooks() {
  log.step(1, 5, '성경 66권 데이터 마이그레이션 중...')

  const booksData = bibleBooks.map(book => ({
    id: book.id,
    name: book.name,
    english_name: book.englishName,
    total_chapters: book.totalChapters,
    testament: book.testament,
    category: book.category,
    category_emoji: book.categoryEmoji
  }))

  const { data, error } = await supabase
    .from('books')
    .upsert(booksData, { onConflict: 'id' })
    .select()

  if (error) {
    log.error(`books 테이블 마이그레이션 실패: ${error.message}`)
    throw error
  }

  log.success(`${data?.length || 0}권의 성경 데이터 삽입 완료`)
  return data
}

// Step 2: verses 테이블에 구절 마이그레이션
async function migrateVerses() {
  log.step(2, 5, '구절 데이터 마이그레이션 중...')

  const versesData = verses.map(verse => {
    // reference에서 book_id 추출 (예: "창세기 1:1" → "genesis")
    const bookName = verse.reference.split(' ')[0]
    const book = bibleBooks.find(b => b.name === bookName)

    // chapter와 verse_number 추출
    const chapterVerse = verse.reference.split(' ')[1] || '1:1'
    const [chapter, verseNumber] = chapterVerse.split(':').map(Number)

    return {
      id: verse.id,
      book_id: book?.id || 'genesis',
      chapter: chapter || 1,
      verse_number: verseNumber || 1,
      reference: verse.reference,
      hebrew: verse.hebrew,
      ipa: verse.ipa,
      korean_pronunciation: verse.koreanPronunciation,
      modern: verse.modern,
      translation: verse.modern, // modern을 translation으로도 사용
      literal: null // 나중에 추가할 수 있음
    }
  })

  const { data, error } = await supabase
    .from('verses')
    .upsert(versesData, { onConflict: 'id' })
    .select()

  if (error) {
    log.error(`verses 테이블 마이그레이션 실패: ${error.message}`)
    throw error
  }

  log.success(`${data?.length || 0}개의 구절 데이터 삽입 완료`)
  return data
}

// Step 3: words 테이블에 히브리어 단어 마이그레이션
async function migrateWords() {
  log.step(3, 5, '히브리어 단어 데이터 마이그레이션 중...')

  const wordsData: any[] = []

  verses.forEach(verse => {
    if (verse.words && Array.isArray(verse.words)) {
      verse.words.forEach((word, index) => {
        wordsData.push({
          verse_id: verse.id,
          position: index + 1,
          hebrew: word.hebrew,
          meaning: word.meaning,
          ipa: word.ipa,
          korean: word.korean,
          root: word.root,
          grammar: word.grammar,
          structure: word.structure || null,
          category: null, // 나중에 분류 추가 가능
          emoji: null // 나중에 이모지 추가 가능
        })
      })
    }
  })

  // 배치로 삽입 (한 번에 너무 많이 하면 실패할 수 있음)
  const batchSize = 100
  let totalInserted = 0

  for (let i = 0; i < wordsData.length; i += batchSize) {
    const batch = wordsData.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('words')
      .insert(batch)
      .select()

    if (error) {
      log.error(`words 테이블 배치 ${i / batchSize + 1} 마이그레이션 실패: ${error.message}`)
      throw error
    }

    totalInserted += data?.length || 0
    log.info(`  배치 ${i / batchSize + 1}: ${data?.length || 0}개 단어 삽입`)
  }

  log.success(`총 ${totalInserted}개의 히브리어 단어 데이터 삽입 완료`)
  return totalInserted
}

// Step 4: commentaries 테이블에 주석 마이그레이션
async function migrateCommentaries() {
  log.step(4, 5, '주석 데이터 마이그레이션 중...')

  const commentariesData = verses
    .filter(verse => verse.commentary)
    .map(verse => ({
      verse_id: verse.id,
      intro: verse.commentary!.intro
    }))

  const { data, error } = await supabase
    .from('commentaries')
    .insert(commentariesData)
    .select()

  if (error) {
    log.error(`commentaries 테이블 마이그레이션 실패: ${error.message}`)
    throw error
  }

  log.success(`${data?.length || 0}개의 주석 intro 데이터 삽입 완료`)
  return data
}

// Step 5: commentary_sections, why_questions, commentary_conclusions 마이그레이션
async function migrateCommentaryDetails(commentaries: any[]) {
  log.step(5, 5, '주석 상세 데이터 마이그레이션 중...')

  // commentary_id 맵 생성
  const commentaryMap = new Map<string, string>()
  commentaries.forEach(c => {
    if (c.verse_id && c.id) {
      commentaryMap.set(c.verse_id, c.id)
    }
  })

  // 5-1: commentary_sections
  const sectionsData: any[] = []
  verses.forEach(verse => {
    if (verse.commentary?.sections) {
      const commentaryId = commentaryMap.get(verse.id)
      if (commentaryId) {
        verse.commentary.sections.forEach((section, index) => {
          sectionsData.push({
            commentary_id: commentaryId,
            position: index + 1,
            emoji: section.emoji,
            title: section.title,
            description: section.description,
            points: section.points, // JSONB
            color: section.color
          })
        })
      }
    }
  })

  const { data: sectionsResult, error: sectionsError } = await supabase
    .from('commentary_sections')
    .insert(sectionsData)
    .select()

  if (sectionsError) {
    log.error(`commentary_sections 마이그레이션 실패: ${sectionsError.message}`)
    throw sectionsError
  }

  log.success(`${sectionsResult?.length || 0}개의 주석 섹션 데이터 삽입 완료`)

  // 5-2: why_questions
  const questionsData: any[] = []
  verses.forEach(verse => {
    if (verse.commentary?.whyQuestion) {
      const commentaryId = commentaryMap.get(verse.id)
      if (commentaryId) {
        questionsData.push({
          commentary_id: commentaryId,
          question: verse.commentary.whyQuestion.question,
          answer: verse.commentary.whyQuestion.answer,
          bible_references: verse.commentary.whyQuestion.bibleReferences // JSONB
        })
      }
    }
  })

  const { data: questionsResult, error: questionsError } = await supabase
    .from('why_questions')
    .insert(questionsData)
    .select()

  if (questionsError) {
    log.error(`why_questions 마이그레이션 실패: ${questionsError.message}`)
    throw questionsError
  }

  log.success(`${questionsResult?.length || 0}개의 'Why?' 질문 데이터 삽입 완료`)

  // 5-3: commentary_conclusions
  const conclusionsData: any[] = []
  verses.forEach(verse => {
    if (verse.commentary?.conclusion) {
      const commentaryId = commentaryMap.get(verse.id)
      if (commentaryId) {
        conclusionsData.push({
          commentary_id: commentaryId,
          title: verse.commentary.conclusion.title,
          content: verse.commentary.conclusion.content
        })
      }
    }
  })

  const { data: conclusionsResult, error: conclusionsError } = await supabase
    .from('commentary_conclusions')
    .insert(conclusionsData)
    .select()

  if (conclusionsError) {
    log.error(`commentary_conclusions 마이그레이션 실패: ${conclusionsError.message}`)
    throw conclusionsError
  }

  log.success(`${conclusionsResult?.length || 0}개의 결론 데이터 삽입 완료`)
}

// 데이터 검증
async function verifyMigration() {
  console.log('\n📊 데이터 마이그레이션 검증 중...\n')

  const checks = [
    { table: 'books', expected: bibleBooks.length },
    { table: 'verses', expected: verses.length },
    { table: 'words', expected: verses.reduce((sum, v) => sum + (v.words?.length || 0), 0) },
    { table: 'commentaries', expected: verses.filter(v => v.commentary).length },
  ]

  for (const check of checks) {
    const { count, error } = await supabase
      .from(check.table as any)
      .select('*', { count: 'exact', head: true })

    if (error) {
      log.error(`${check.table} 검증 실패: ${error.message}`)
    } else {
      const match = count === check.expected
      const icon = match ? '✅' : '⚠️'
      console.log(`${icon} ${check.table}: ${count}/${check.expected} ${match ? '' : '(불일치)'}`)
    }
  }
}

// 메인 실행 함수
async function main() {
  console.log('\n🚀 Supabase 데이터 마이그레이션 시작\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Step 1: Books
    await migrateBibleBooks()

    // Step 2: Verses
    await migrateVerses()

    // Step 3: Words
    await migrateWords()

    // Step 4: Commentaries
    const commentaries = await migrateCommentaries()

    // Step 5: Commentary Details
    await migrateCommentaryDetails(commentaries || [])

    // Verify
    await verifyMigration()

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ 데이터 마이그레이션이 성공적으로 완료되었습니다!\n')
  } catch (error) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('\n💥 마이그레이션 중 오류 발생:', error)
    process.exit(1)
  }
}

// 실행
main()
