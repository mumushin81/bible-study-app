import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/lib/database.types'
import * as dotenv from 'dotenv'
import axios from 'axios'
import * as cheerio from 'cheerio'

// 환경변수 로드
dotenv.config({ path: '.env.local' })

// Firecrawl API 키
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-650c644774d3424fa7e1c49fdfdbd444'

// Supabase 클라이언트
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL이 설정되지 않았습니다.')
  process.exit(1)
}

// Supabase 클라이언트 생성 (SERVICE_ROLE_KEY가 있으면 사용, 없으면 ANON_KEY 사용)
const supabaseKey = supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
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
  urlPattern: string
  totalChapters: number
}

// 지원하는 성경 책들
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

interface VerseData {
  verseNumber: number
  hebrew: string
}

/**
 * URL 생성
 */
function buildUrl(bookId: string, chapter: number): string {
  const book = TORAH_BOOKS.find(b => b.id === bookId)
  if (!book) {
    throw new Error(`지원하지 않는 책: ${bookId}`)
  }

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
 * axios + cheerio를 사용하여 웹 페이지를 직접 크롤링
 */
async function scrapeWithCheerio(url: string): Promise<string> {
  log.info(`Cheerio로 크롤링 중: ${url}`)

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    if (!response.data) {
      throw new Error('HTML 응답이 비어있습니다')
    }

    const $ = cheerio.load(response.data)

    // <p> 태그에서 히브리어 구절 추출
    const verses: string[] = []
    $('p').each((index, element) => {
      const text = $(element).text().trim()
      // 히브리어 문자가 포함되어 있고, 절 번호 패턴이 있는 경우만
      if (/[\u0590-\u05FF]/.test(text) && /^([א-ת]{1,3}|(\d+))\s/.test(text)) {
        verses.push(text)
      }
    })

    if (verses.length === 0) {
      log.warn('⚠ <p> 태그에서 구절을 찾지 못했습니다. 전체 body 텍스트에서 검색 시도...')

      // 대체 방법: body 전체에서 히브리어 라인 찾기
      const bodyText = $('body').text()
      const lines = bodyText.split('\n').filter(line => {
        const trimmed = line.trim()
        return /[\u0590-\u05FF]/.test(trimmed) && /^([א-ת]{1,3}|(\d+))\s/.test(trimmed)
      })

      verses.push(...lines)
    }

    const result = verses.join('\n')
    log.success(`크롤링 성공: ${verses.length}개 라인, ${result.length} 바이트`)
    return result

  } catch (error: any) {
    if (error.response) {
      log.error(`HTTP 에러: ${error.response.status} - ${error.response.statusText}`)
    } else {
      log.error(`크롤링 실패: ${error.message}`)
    }
    throw error
  }
}

/**
 * 텍스트에서 히브리어 구절 추출
 */
function parseTextToVerses(text: string): VerseData[] {
  const verses: VerseData[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // 히브리어 문자 포함 여부 확인
    if (!/[\u0590-\u05FF]/.test(trimmed)) continue

    // 패턴 1: "א  בְּרֵאשִׁית..." (히브리어 숫자 + 공백 + 히브리어 텍스트)
    const match1 = trimmed.match(/^([א-ת]{1,3})\s+(.+)$/)
    if (match1) {
      const verseNum = hebrewToNumber(match1[1])
      const hebrewText = match1[2].trim()

      if (verseNum > 0 && hebrewText) {
        verses.push({
          verseNumber: verseNum,
          hebrew: hebrewText
        })
        continue
      }
    }

    // 패턴 2: "1  בְּרֵאשִׁית..." (아라비아 숫자 + 공백 + 히브리어 텍스트)
    const match2 = trimmed.match(/^(\d+)\s+(.+)$/)
    if (match2) {
      const verseNum = parseInt(match2[1])
      const hebrewText = match2[2].trim()

      if (verseNum > 0 && hebrewText && /[\u0590-\u05FF]/.test(hebrewText)) {
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

  try {
    // 1. URL 생성
    const url = buildUrl(bookId, chapter)
    log.info(`URL: ${url}`)

    // 2. Cheerio로 크롤링
    const text = await scrapeWithCheerio(url)

    // 3. 텍스트에서 구절 추출
    const verses = parseTextToVerses(text)
    log.info(`추출된 구절: ${verses.length}개`)

    if (verses.length === 0) {
      log.warn('구절을 찾을 수 없습니다')
      return
    }

    // 4. Supabase에 저장
    await saveVersesToSupabase(bookId, chapter, verses)

    log.success(`✅ ${book.name} ${chapter}장 완료!`)
  } catch (error: any) {
    log.error(`${book.name} ${chapter}장 실패: ${error.message}`)
    throw error
  }
}

/**
 * 책 전체 크롤링
 */
export async function crawlBook(bookId: string, startChapter: number = 1, endChapter?: number): Promise<void> {
  const book = TORAH_BOOKS.find(b => b.id === bookId)
  if (!book) {
    throw new Error(`지원하지 않는 책: ${bookId}`)
  }

  const lastChapter = endChapter || book.totalChapters

  log.step(`📚 ${book.name} ${startChapter}-${lastChapter}장 크롤링 시작`)

  for (let chapter = startChapter; chapter <= lastChapter; chapter++) {
    try {
      await crawlChapter(bookId, chapter)

      // API 제한 방지를 위해 대기
      if (chapter < lastChapter) {
        log.info('2초 대기 중...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error: any) {
      log.error(`${book.name} ${chapter}장 실패: ${error.message}`)
      // 에러가 발생해도 계속 진행
    }
  }

  log.success(`✅ ${book.name} 크롤링 완료!`)
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
📖 Firecrawl 성경 크롤러

사용법:
  npm run crawl:firecrawl -- <bookId> [chapter] [endChapter]

예시:
  npm run crawl:firecrawl -- genesis           # 창세기 전체 (1-50장)
  npm run crawl:firecrawl -- genesis 1         # 창세기 1장만
  npm run crawl:firecrawl -- genesis 1 10      # 창세기 1-10장
  npm run crawl:firecrawl -- exodus 20         # 출애굽기 20장만

지원하는 책:
  - genesis (창세기, 50장)
  - exodus (출애굽기, 40장)
  - leviticus (레위기, 27장)
  - numbers (민수기, 36장)
  - deuteronomy (신명기, 34장)

환경변수:
  FIRECRAWL_API_KEY: Firecrawl API 키 (기본값: fc-650c644774d3424fa7e1c49fdfdbd444)
  VITE_SUPABASE_URL: Supabase URL
  VITE_SUPABASE_ANON_KEY: Supabase Anon Key
    `)
    process.exit(0)
  }

  const bookId = args[0]
  const chapter = args[1] ? parseInt(args[1]) : null
  const endChapter = args[2] ? parseInt(args[2]) : null

  if (chapter && !endChapter) {
    // 단일 장 크롤링
    crawlChapter(bookId, chapter).catch(error => {
      console.error(error)
      process.exit(1)
    })
  } else if (chapter && endChapter) {
    // 범위 크롤링
    crawlBook(bookId, chapter, endChapter).catch(error => {
      console.error(error)
      process.exit(1)
    })
  } else {
    // 전체 크롤링
    crawlBook(bookId).catch(error => {
      console.error(error)
      process.exit(1)
    })
  }
}
