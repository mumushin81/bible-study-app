import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Verse, Word, Commentary, CommentarySection } from '../types'

// Supabase 쿼리 결과 타입 (일부 필드는 쿼리에 따라 누락될 수 있음)
interface VerseWithWords {
  id: string
  book_id: string | null
  chapter: number
  verse_number: number
  reference: string
  hebrew: string
  ipa: string
  korean_pronunciation: string
  modern: string
  literal: string | null
  translation: string | null
  words: Array<{
    hebrew: string
    meaning: string
    ipa: string
    korean: string
    letters: string | null
    root: string
    grammar: string
    structure: string | null
    emoji: string | null
    icon_svg: string | null
    category: string | null
    position: number
  }>
}

interface CommentaryWithRelations {
  verse_id: string | null
  id: string
  intro: string
  commentary_sections: Array<{
    emoji: string
    title: string
    description: string
    points: any
    color: string | null
    position: number
  }>
  why_questions: {
    question: string
    answer: string
    bible_references: any
  } | null
  commentary_conclusions: {
    title: string
    content: string
  } | null
}

interface UseVersesOptions {
  bookId?: string
  chapter?: number
}

export function useVerses(options?: UseVersesOptions) {
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingStatic, setIsUsingStatic] = useState(false)

  useEffect(() => {
    async function fetchVerses() {
      try {
        setLoading(true)
        setError(null)

        // 1️⃣ Verses + Words 가져오기
        let versesQuery = supabase
          .from('verses')
          .select(`
            *,
            words (
              hebrew,
              meaning,
              ipa,
              korean,
              letters,
              root,
              grammar,
              structure,
              emoji,
              icon_svg,
              category,
              position
            )
          `)
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
          // DB에 데이터가 없으면 빈 배열
          console.warn('⚠️  DB에 구절이 없습니다.')
          setVerses([])
          setLoading(false)
          return
        }

        // 2️⃣ Verse IDs 추출
        const verseIds = versesData.map((v: any) => v.id)

        // 3️⃣ Commentaries + 중첩 테이블 별도 조회
        const { data: commentariesData } = await supabase
          .from('commentaries')
          .select(`
            verse_id,
            id,
            intro,
            commentary_sections (
              emoji,
              title,
              description,
              points,
              color,
              position
            ),
            why_questions (
              question,
              answer,
              bible_references
            ),
            commentary_conclusions (
              title,
              content
            )
          `)
          .in('verse_id', verseIds)

        // 4️⃣ Commentary를 verse_id로 매핑
        const commentariesMap = new Map<string, CommentaryWithRelations>()
        commentariesData?.forEach((c: CommentaryWithRelations) => {
          if (c.verse_id) {
            commentariesMap.set(c.verse_id, c)
          }
        })

        // 5️⃣ 데이터 병합 및 변환
        const versesWithDetails: Verse[] = versesData.map((verse: VerseWithWords) => {
          // Word 타입으로 변환 (position으로 정렬)
          const words: Word[] = (verse.words || [])
            .sort((a, b) => a.position - b.position)
            .map((w) => ({
              hebrew: w.hebrew,
              meaning: w.meaning,
              ipa: w.ipa,
              korean: w.korean,
              letters: w.letters || '',
              root: w.root,
              grammar: w.grammar,
              emoji: w.emoji || '📜',
              iconSvg: w.icon_svg || '',
              structure: w.structure || undefined,
              category: (w.category as 'noun' | 'verb' | 'adjective' | 'preposition' | 'particle' | null) || undefined,
            }))

          // Commentary 타입으로 변환
          let commentary: Commentary | undefined
          const commentaryData = commentariesMap.get(verse.id)

          if (commentaryData) {
            const sections: CommentarySection[] = (commentaryData.commentary_sections || [])
              .sort((a, b) => a.position - b.position)
              .map((s) => ({
                emoji: s.emoji,
                title: s.title,
                description: s.description,
                points: s.points as string[],
                color: s.color as 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'yellow',
              }))

            // why_questions and commentary_conclusions are objects (one-to-one), not arrays
            const whyQuestion = commentaryData.why_questions
            const conclusion = commentaryData.commentary_conclusions

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
          return {
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
        })

        setVerses(versesWithDetails)
        setIsUsingStatic(false)
        console.log(`✅ DB에서 ${versesWithDetails.length}개 구절 로드 완료 (commentaries: ${commentariesData?.length || 0}개)`)
      } catch (err) {
        console.error('❌ DB에서 구절 가져오기 실패:', err)
        setError(err as Error)
        setVerses([])
      } finally {
        setLoading(false)
      }
    }

    fetchVerses()
  }, [options?.bookId, options?.chapter])

  return { verses, loading, error, isUsingStatic }
}
