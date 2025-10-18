import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { bibleBooks as staticBooks, BookInfo } from '../data/bibleBooks'

export function useBooks() {
  const [books, setBooks] = useState<BookInfo[]>(staticBooks)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingStatic, setIsUsingStatic] = useState(false)

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: booksError } = await supabase
          .from('books')
          .select('*')
          .order('id', { ascending: true })

        if (booksError) throw booksError
        if (!data || data.length === 0) {
          console.warn('⚠️  DB에 책 정보가 없습니다. 정적 데이터를 사용합니다.')
          setIsUsingStatic(true)
          setBooks(staticBooks)
          setLoading(false)
          return
        }

        // BookInfo 타입으로 변환
        const booksData: BookInfo[] = data.map(book => ({
          id: book.id,
          name: book.name,
          englishName: book.english_name,
          totalChapters: book.total_chapters,
          testament: book.testament as 'old' | 'new',
          category: book.category,
          categoryEmoji: book.category_emoji || '',
        }))

        setBooks(booksData)
        setIsUsingStatic(false)
        console.log(`✅ DB에서 ${booksData.length}권 책 정보 로드 완료`)
      } catch (err) {
        console.error('❌ DB에서 책 정보 가져오기 실패:', err)
        console.log('⚠️  정적 데이터를 사용합니다.')
        setError(err as Error)
        setIsUsingStatic(true)
        setBooks(staticBooks)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // 유틸리티 함수들
  const getBookById = (id: string) => books.find(book => book.id === id)
  const getBookByName = (name: string) => books.find(book => book.name === name || book.englishName === name)
  const getOldTestamentBooks = () => books.filter(book => book.testament === 'old')
  const getNewTestamentBooks = () => books.filter(book => book.testament === 'new')

  return {
    books,
    loading,
    error,
    isUsingStatic,
    getBookById,
    getBookByName,
    getOldTestamentBooks,
    getNewTestamentBooks,
  }
}
