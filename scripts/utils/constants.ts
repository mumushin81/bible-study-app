/**
 * 성경 책 정보 및 상수
 */

export interface BookInfo {
  id: string
  name: string
  englishName: string
  hebrewName: string
  totalChapters: number
  testament: 'old' | 'new'
  category: string
  categoryEmoji: string
  urlPattern: string
}

/**
 * Torah (모세오경) 5권
 */
export const TORAH_BOOKS: BookInfo[] = [
  {
    id: 'genesis',
    name: '창세기',
    englishName: 'Genesis',
    hebrewName: 'בראשית',
    totalChapters: 50,
    testament: 'old',
    category: 'Torah',
    categoryEmoji: '📜',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt01{chapter:02d}.htm'
  },
  {
    id: 'exodus',
    name: '출애굽기',
    englishName: 'Exodus',
    hebrewName: 'שמות',
    totalChapters: 40,
    testament: 'old',
    category: 'Torah',
    categoryEmoji: '📜',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt02{chapter:02d}.htm'
  },
  {
    id: 'leviticus',
    name: '레위기',
    englishName: 'Leviticus',
    hebrewName: 'ויקרא',
    totalChapters: 27,
    testament: 'old',
    category: 'Torah',
    categoryEmoji: '📜',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt03{chapter:02d}.htm'
  },
  {
    id: 'numbers',
    name: '민수기',
    englishName: 'Numbers',
    hebrewName: 'במדבר',
    totalChapters: 36,
    testament: 'old',
    category: 'Torah',
    categoryEmoji: '📜',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt04{chapter:02d}.htm'
  },
  {
    id: 'deuteronomy',
    name: '신명기',
    englishName: 'Deuteronomy',
    hebrewName: 'דברים',
    totalChapters: 34,
    testament: 'old',
    category: 'Torah',
    categoryEmoji: '📜',
    urlPattern: 'https://mechon-mamre.org/p/pt/pt05{chapter:02d}.htm'
  }
]

/**
 * 모든 책 정보
 */
export const ALL_BOOKS: BookInfo[] = [
  ...TORAH_BOOKS
  // TODO: 나중에 다른 책들 추가
]

/**
 * 책 ID로 정보 찾기
 */
export function getBookInfo(bookId: string): BookInfo | undefined {
  return ALL_BOOKS.find(book => book.id === bookId)
}

/**
 * 구절 ID 생성
 */
export function makeVerseId(bookId: string, chapter: number, verse: number): string {
  return `${bookId}_${chapter}_${verse}`
}

/**
 * 구절 참조 생성 (예: "창세기 1:1")
 */
export function makeReference(bookName: string, chapter: number, verse: number): string {
  return `${bookName} ${chapter}:${verse}`
}
