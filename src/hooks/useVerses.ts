import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { verses as staticVerses } from '../data/verses'
import { Verse, Word, Commentary, CommentarySection } from '../types'

interface UseVersesOptions {
  bookId?: string
  chapter?: number
}

export function useVerses(options?: UseVersesOptions) {
  const [verses, setVerses] = useState<Verse[]>(staticVerses)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingStatic, setIsUsingStatic] = useState(false)

  useEffect(() => {
    async function fetchVerses() {
      try {
        setLoading(true)
        setError(null)

        // 1. Verses 기본 데이터 가져오기
        let versesQuery = supabase
          .from('verses')
          .select('*')
          .order('chapter', { ascending: true })
          .order('verse_number', { ascending: true })

        // 필터 적용
        if (options?.bookId) {
          versesQuery = versesQuery.eq('book_id', options.bookId)
        }
        if (options?.chapter) {
          versesQuery = versesQuery.eq('chapter', options.chapter)
        }

        const { data: versesData, error: versesError } = await versesQuery

        if (versesError) throw versesError
        if (!versesData || versesData.length === 0) {
          // DB에 데이터가 없으면 정적 데이터 사용
          console.warn('⚠️  DB에 구절이 없습니다. 정적 데이터를 사용합니다.')
          setIsUsingStatic(true)
          setVerses(staticVerses)
          setLoading(false)
          return
        }

        // 2. 각 구절에 대한 단어, 주석 데이터 가져오기
        const versesWithDetails = await Promise.all(
          versesData.map(async (verse) => {
            // 단어 가져오기
            const { data: wordsData } = await supabase
              .from('words')
              .select('*')
              .eq('verse_id', verse.id)
              .order('position', { ascending: true })

            // 주석 가져오기
            const { data: commentaryData } = await supabase
              .from('commentaries')
              .select(`
                id,
                intro,
                commentary_sections (*),
                why_questions (*),
                commentary_conclusions (*)
              `)
              .eq('verse_id', verse.id)
              .single()

            // Word 타입으로 변환
            const words: Word[] = (wordsData || []).map(w => ({
              hebrew: w.hebrew,
              meaning: w.meaning,
              ipa: w.ipa,
              korean: w.korean,
              root: w.root,
              grammar: w.grammar,
              structure: w.structure || undefined,
              emoji: w.emoji || undefined,
              category: w.category as any || undefined,
            }))

            // Commentary 타입으로 변환
            let commentary: Commentary | undefined
            if (commentaryData) {
              const sections: CommentarySection[] = (commentaryData.commentary_sections || [])
                .sort((a: any, b: any) => a.position - b.position)
                .map((s: any) => ({
                  emoji: s.emoji,
                  title: s.title,
                  description: s.description,
                  points: s.points as string[],
                  color: s.color as any,
                }))

              // why_questions와 commentary_conclusions는 1:1 관계이므로 단일 객체
              const whyQuestion = commentaryData.why_questions as any
              const conclusion = commentaryData.commentary_conclusions as any

              commentary = {
                intro: commentaryData.intro,
                sections,
                whyQuestion: whyQuestion ? {
                  question: whyQuestion.question,
                  answer: whyQuestion.answer,
                  bibleReferences: whyQuestion.bible_references as string[],
                } : undefined,
                conclusion: conclusion ? {
                  title: conclusion.title,
                  content: conclusion.content,
                } : undefined,
              }
            }

            // Verse 타입으로 변환
            const verseObj: Verse = {
              id: verse.id,
              reference: verse.reference,
              hebrew: verse.hebrew,
              ipa: verse.ipa,
              koreanPronunciation: verse.korean_pronunciation,
              modern: verse.modern,
              literal: verse.literal || undefined,
              translation: verse.translation || undefined,
              words,
              commentary,
            }

            return verseObj
          })
        )

        setVerses(versesWithDetails)
        setIsUsingStatic(false)
        console.log(`✅ DB에서 ${versesWithDetails.length}개 구절 로드 완료`)
      } catch (err) {
        console.error('❌ DB에서 구절 가져오기 실패:', err)
        console.log('⚠️  정적 데이터를 사용합니다.')
        setError(err as Error)
        setIsUsingStatic(true)
        setVerses(staticVerses)
      } finally {
        setLoading(false)
      }
    }

    fetchVerses()
  }, [options?.bookId, options?.chapter])

  return { verses, loading, error, isUsingStatic }
}
