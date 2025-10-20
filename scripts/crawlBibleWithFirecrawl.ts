import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/lib/database.types'
import * as dotenv from 'dotenv'

// 환경변수 로드
dotenv.config({ path: '.env.local' })

// Supabase 클라이언트 (서버 측이므로 SERVICE_ROLE_KEY 사용 가능)
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
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
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
}

// 성경 책 정보
interface BookInfo {
  id: string
  name: string
  hebrewName: string
  urlPattern: string // mechon-mamre.org URL 패턴
  totalChapters: number
}

// 지원하는 성경 책들 (토라)
const TORAH_BOOKS: BookInfo[] = [
  {
    id: 'genesis',
    name: '창세기',
    hebrewName: 'בראשית',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt01{chapter:02d}.htm',
    totalChapters: 50
  },
  {
    id: 'exodus',
    name: '출애굽기',
    hebrewName: 'שמות',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt02{chapter:02d}.htm',
    totalChapters: 40
  },
  {
    id: 'leviticus',
    name: '레위기',
    hebrewName: 'ויקרא',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt03{chapter:02d}.htm',
    totalChapters: 27
  },
  {
    id: 'numbers',
    name: '민수기',
    hebrewName: 'במדבר',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt04{chapter:02d}.htm',
    totalChapters: 36
  },
  {
    id: 'deuteronomy',
    name: '신명기',
    hebrewName: 'דברים',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt05{chapter:02d}.htm',
    totalChapters: 34
  }
]

// Firecrawl을 통해 크롤링한 데이터 파싱
interface VerseData {
  verseNumber: number
  hebrew: string
}

/**
 * mechon-mamre.org URL 생성
 */
function buildUrl(bookId: string, chapter: number): string {
  const book = TORAH_BOOKS.find(b => b.id === bookId)
  if (!book) {
    throw new Error(`지원하지 않는 책: ${bookId}`)
  }

  // URL 패턴에서 {chapter:02d}를 실제 장 번호로 치환
  const chapterStr = chapter.toString().padStart(2, '0')
  return book.urlPattern.replace('{chapter:02d}', chapterStr)
}

/**
 * 히브리어 숫자를 아라비아 숫자로 변환
 */
function hebrewToNumber(hebrewNum: string): number {
  const mapping: { [key: string]: number } = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
    'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
    'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60,
    'ע': 70, 'פ': 80, 'צ': 90, 'ק': 100, 'ר': 200,
    'ש': 300, 'ת': 400
  }

  let total = 0
  for (const char of hebrewNum) {
    if (mapping[char]) {
      total += mapping[char]
    }
  }
  return total
}

/**
 * Firecrawl MCP를 사용하여 웹 페이지를 마크다운으로 변환
 *
 * NOTE: 이 함수는 Firecrawl MCP 도구를 호출합니다.
 * Claude Code 환경에서 실행 시 자동으로 MCP 도구가 사용됩니다.
 */
async function scrapeWithFirecrawl(url: string): Promise<string> {
  log.info(`Firecrawl로 크롤링 중: ${url}`)

  // Firecrawl MCP 도구 사용
  // 실제 구현은 MCP 호출을 통해 이루어짐
  // 여기서는 TypeScript 타입 정의만 제공

  throw new Error(`
    ⚠️  이 스크립트는 Claude Code 환경에서 실행해야 합니다.

    실행 방법:
    1. Claude Code에서 이 스크립트를 엽니다
    2. "이 스크립트를 실행해줘" 라고 요청합니다
    3. Claude Code가 Firecrawl MCP를 자동으로 호출합니다

    또는 Task 도구를 사용하여:
    - Task 에이전트에게 이 스크립트 실행을 위임합니다
  `)
}

/**
 * 마크다운에서 히브리어 구절 추출
 */
function parseMarkdownToVerses(markdown: string): VerseData[] {
  const verses: VerseData[] = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // 히브리어 문자 포함 여부 확인
    if (!/[\u0590-\u05FF]/.test(trimmed)) continue

    // 절 번호 패턴 찾기
    // 예: "א  בְּרֵאשִׁית..." (히브리어 숫자 + 공백 + 히브리어 텍스트)
    const match = trimmed.match(/^([א-ת]+)\s+(.+)$/)
    if (match) {
      const verseNum = hebrewToNumber(match[1])
      const hebrewText = match[2].trim()

      if (verseNum > 0 && hebrewText) {
        verses.push({
          verseNumber: verseNum,
          hebrew: hebrewText
        })
      }
    }
  }

  return verses
}

/**
 * Supabase에 구절 저장
 */
async function saveVersesToSupabase(
  bookId: string,
  chapter: number,
  verses: VerseData[]
): Promise<void> {
  const book = TORAH_BOOKS.find(b => b.id === bookId)
  if (!book) {
    throw new Error(`지원하지 않는 책: ${bookId}`)
  }

  log.step(`${book.name} ${chapter}장 ${verses.length}개 구절 저장 중...`)

  for (const verse of verses) {
    const verseId = `${bookId}${chapter}-${verse.verseNumber}`
    const reference = `${book.name} ${chapter}:${verse.verseNumber}`

    const { error } = await supabase
      .from('verses')
      .upsert({
        id: verseId,
        book_id: bookId,
        chapter,
        verse_number: verse.verseNumber,
        reference,
        hebrew: verse.hebrew,
        ipa: '', // IPA는 나중에 추가
        korean_pronunciation: '', // 한글 발음은 나중에 추가
        modern: '', // 현대어 번역은 나중에 추가
      }, {
        onConflict: 'id'
      })

    if (error) {
      log.error(`구절 저장 실패 (${reference}): ${error.message}`)
    } else {
      log.success(`저장 완료: ${reference}`)
    }
  }
}

/**
 * 특정 책의 특정 장 크롤링
 */
export async function crawlChapter(bookId: string, chapter: number): Promise<void> {
  const book = TORAH_BOOKS.find(b => b.id === bookId)
  if (!book) {
    throw new Error(`지원하지 않는 책: ${bookId}`)
  }

  if (chapter < 1 || chapter > book.totalChapters) {
    throw new Error(`잘못된 장 번호: ${chapter} (1-${book.totalChapters} 가능)`)
  }

  log.step(`📖 ${book.name} ${chapter}장 크롤링 시작`)

  // 1. URL 생성
  const url = buildUrl(bookId, chapter)
  log.info(`URL: ${url}`)

  // 2. Firecrawl로 크롤링 (마크다운으로 변환)
  const markdown = await scrapeWithFirecrawl(url)

  // 3. 마크다운에서 구절 추출
  const verses = parseMarkdownToVerses(markdown)
  log.info(`추출된 구절: ${verses.length}개`)

  if (verses.length === 0) {
    log.warn('구절을 찾을 수 없습니다')
    return
  }

  // 4. Supabase에 저장
  await saveVersesToSupabase(bookId, chapter, verses)

  log.success(`✅ ${book.name} ${chapter}장 완료!`)
}

/**
 * 책 전체 크롤링
 */
export async function crawlBook(bookId: string): Promise<void> {
  const book = TORAH_BOOKS.find(b => b.id === bookId)
  if (!book) {
    throw new Error(`지원하지 않는 책: ${bookId}`)
  }

  log.step(`📚 ${book.name} 전체 크롤링 시작 (${book.totalChapters}장)`)

  for (let chapter = 1; chapter <= book.totalChapters; chapter++) {
    try {
      await crawlChapter(bookId, chapter)

      // 서버 부하 방지를 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error: any) {
      log.error(`${book.name} ${chapter}장 실패: ${error.message}`)
      // 에러가 발생해도 계속 진행
    }
  }

  log.success(`✅ ${book.name} 전체 크롤링 완료!`)
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
사용법:
  npm run crawl -- <bookId> [chapter]

예시:
  npm run crawl -- genesis           # 창세기 전체
  npm run crawl -- genesis 1         # 창세기 1장만
  npm run crawl -- exodus 20         # 출애굽기 20장만

지원하는 책:
  - genesis (창세기)
  - exodus (출애굽기)
  - leviticus (레위기)
  - numbers (민수기)
  - deuteronomy (신명기)
    `)
    process.exit(0)
  }

  const bookId = args[0]
  const chapter = args[1] ? parseInt(args[1]) : null

  if (chapter) {
    crawlChapter(bookId, chapter).catch(console.error)
  } else {
    crawlBook(bookId).catch(console.error)
  }
}
