import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface WordWithContext {
  id: string
  hebrew: string
  meaning: string
  ipa: string
  korean: string
  letters?: string
  root: string
  grammar: string
  iconUrl?: string  // ✨ JPG 아이콘 URL (우선순위 1)
  iconSvg?: string  // 레거시 SVG 아이콘 코드 (fallback)
  category?: 'noun' | 'verb' | 'adjective' | 'preposition' | 'particle'
  verseReference: string
  verseId: string
  bookId: string
  chapter: number
  verseNumber: number
}

interface UseWordsOptions {
  bookId?: string
  chapter?: number
  searchQuery?: string
  limit?: number
}

export function useWords(options?: UseWordsOptions) {
  const [words, setWords] = useState<WordWithContext[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchWords() {
      try {
        setLoading(true)
        setError(null)

        // words와 verses를 JOIN해서 가져오기
        let query = supabase
          .from('words')
          .select(`
            id,
            hebrew,
            meaning,
            ipa,
            korean,
            letters,
            root,
            grammar,
            icon_url,
            icon_svg,
            category,
            position,
            verses!inner (
              id,
              reference,
              book_id,
              chapter,
              verse_number
            )
          `)
          .order('position', { ascending: true })

        // 필터 적용
        if (options?.bookId) {
          query = query.eq('verses.book_id', options.bookId)
        }
        if (options?.chapter) {
          query = query.eq('verses.chapter', options.chapter)
        }
        if (options?.searchQuery && options.searchQuery.trim()) {
          const searchTerm = `%${options.searchQuery}%`
          query = query.or(`hebrew.ilike.${searchTerm},meaning.ilike.${searchTerm},korean.ilike.${searchTerm}`)
        }
        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        if (!data || data.length === 0) {
          console.warn('⚠️  DB에 단어가 없습니다.')
          setWords([])
          setLoading(false)
          return
        }

        // 데이터 변환 및 중복 제거 (히브리어 기준)
        const wordMap = new Map<string, WordWithContext>()

        data.forEach((item: any) => {
          const verse = item.verses

          if (!wordMap.has(item.hebrew)) {
            const hasIconSvg = !!item.icon_svg;
            const hasIconUrl = !!item.icon_url;
            console.log(`[useWords] ${item.hebrew} (${item.meaning}): icon_url=${hasIconUrl ? 'EXISTS' : 'NULL'}, icon_svg=${hasIconSvg ? 'EXISTS' : 'NULL'}`);
            if (hasIconUrl) {
              console.log(`  → iconUrl: ${item.icon_url}`);
            }

            wordMap.set(item.hebrew, {
              id: item.id,
              hebrew: item.hebrew,
              meaning: item.meaning,
              ipa: item.ipa,
              korean: item.korean,
              letters: item.letters || undefined,
              root: item.root,
              grammar: item.grammar,
              iconUrl: item.icon_url || undefined,  // ✨ 추가
              iconSvg: item.icon_svg || undefined,
              category: item.category as any || undefined,
              verseReference: verse.reference,
              verseId: verse.id,
              bookId: verse.book_id,
              chapter: verse.chapter,
              verseNumber: verse.verse_number,
            })
          }
        })

        const uniqueWords = Array.from(wordMap.values())

        setWords(uniqueWords)
        console.log(`✅ DB에서 ${uniqueWords.length}개 고유 단어 로드 완료 (총 ${data.length}개 단어)`)
      } catch (err) {
        console.error('❌ DB에서 단어 가져오기 실패:', err)
        setError(err as Error)
        setWords([])
      } finally {
        setLoading(false)
      }
    }

    fetchWords()
  }, [options?.bookId, options?.chapter, options?.searchQuery, options?.limit])

  return { words, loading, error }
}
