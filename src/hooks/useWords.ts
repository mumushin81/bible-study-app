import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RootEtymology, RootLetterAnalysis } from '../types'
import { useHebrewRoots } from '../contexts/HebrewRootsContext'

export interface WordWithContext {
  id: string
  hebrew: string
  meaning: string
  ipa: string
  korean: string
  letters?: string
  root: string
  grammar: string
  flashcardImgUrl?: string  // 플래시카드 이미지 URL (우선순위 1)
  iconSvg?: string  // 레거시 SVG 아이콘 코드 (fallback)
  category?: 'noun' | 'verb' | 'adjective' | 'preposition' | 'particle'
  isCombinedForm?: boolean  // 결합형 여부 (접두사 포함)
  rootIpa?: string  // 어근의 IPA 발음
  rootEtymology?: RootEtymology  // ✨ 어근 어원 정보
  rootAnalysis?: RootLetterAnalysis[]  // ✨ 어근 글자별 발음 분석 (Codex 피드백)
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

  // ✨ Use cached Hebrew roots from context
  const { rootsMap, loading: rootsLoading } = useHebrewRoots()

  useEffect(() => {
    // Wait for roots to load before fetching words
    if (rootsLoading) return

    async function fetchWords() {
      try {
        setLoading(true)
        setError(null)

        // 1. words와 verses를 JOIN해서 가져오기 (roots는 이미 context에서 로드됨)
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
            flashcard_img_url,
            icon_svg,
            category,
            is_combined_form,
            root_ipa,
            root_analysis,
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

        data.forEach((item: any, index: number) => {
          const verse = item.verses

          // 최신 icon_url로 업데이트
          const existingWord = wordMap.get(item.hebrew);
          const hasIconSvg = !!item.icon_svg;
          const hasFlashcardImgUrl = !!item.flashcard_img_url;
          const hasKoreanInRoot = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(item.root);

          console.log(`[useWords] ${item.hebrew} (${item.meaning}): flashcard_img_url=${hasFlashcardImgUrl ? 'EXISTS' : 'NULL'}, icon_svg=${hasIconSvg ? 'EXISTS' : 'NULL'}, root="${item.root}", hasKorean=${hasKoreanInRoot}`);

          if (hasFlashcardImgUrl) {
            console.log(`  → flashcardImgUrl: ${item.flashcard_img_url}`);
          }

          // 어근 히브리어 추출 (word.root 필드에서)
          // 1. 하이픈 패턴 찾기 (ㅁ-ㅁ-ㅁ)
          const hyphenMatch = item.root.match(/([א-ת]-[א-ת]-[א-ת])/);
          let rootHebrew = hyphenMatch ? hyphenMatch[0] : '';

          // 2. 하이픈 패턴이 없으면 괄호 앞의 히브리어 사용
          if (!rootHebrew) {
            rootHebrew = item.root.split('(')[0].trim();
          }

          const rootEtymology = rootsMap.get(rootHebrew);

          // 디버깅 (처음 3개만)
          if (index === 0) {
            console.log(`[useWords DEBUG] ${item.hebrew}:`)
            console.log(`  word.root: "${item.root}"`)
            console.log(`  extracted rootHebrew: "${rootHebrew}"`)
            console.log(`  rootEtymology: ${rootEtymology ? 'FOUND ✅' : 'NOT FOUND ❌'}`)
            if (rootEtymology) {
              console.log(`  story preview: ${rootEtymology.story.substring(0, 50)}...`)
            }
          }

          // 최신 데이터로 단어 정보 업데이트
          const wordData = {
            id: item.id,
            hebrew: item.hebrew,
            meaning: item.meaning,
            ipa: item.ipa,
            korean: item.korean,
            letters: item.letters ?? existingWord?.letters ?? undefined,  // 기존 값 보존
            root: item.root,
            grammar: item.grammar,
            flashcardImgUrl: item.flashcard_img_url || existingWord?.flashcardImgUrl || undefined,  // 최신 URL 우선
            iconSvg: item.icon_svg || existingWord?.iconSvg || undefined,
            category: item.category as any || undefined,
            isCombinedForm: item.is_combined_form || false,
            rootIpa: item.root_ipa || undefined,
            rootEtymology,
            rootAnalysis: item.root_analysis ?? existingWord?.rootAnalysis ?? undefined,  // 기존 값 보존
            verseReference: verse.reference,
            verseId: verse.id,
            bookId: verse.book_id,
            chapter: verse.chapter,
            verseNumber: verse.verse_number,
          }

          wordMap.set(item.hebrew, wordData);
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
  }, [options?.bookId, options?.chapter, options?.searchQuery, options?.limit, rootsLoading, rootsMap])

  return { words, loading, error }
}
