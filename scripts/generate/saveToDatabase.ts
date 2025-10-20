import { supabase } from '../utils/supabase.js'
import { log } from '../utils/logger.js'
import type { GeneratedContent } from './types.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * 생성된 컨텐츠를 Supabase에 저장
 */
export async function saveToDatabase(content: GeneratedContent): Promise<boolean> {
  try {
    const { verseId } = content

    // 1. verses 테이블 업데이트
    const { error: verseError } = await supabase
      .from('verses')
      .update({
        ipa: content.ipa,
        korean_pronunciation: content.koreanPronunciation,
        modern: content.modern,
        literal: content.literal || null,
        translation: content.translation || null,
      })
      .eq('id', verseId)

    if (verseError) {
      log.error(`verses 업데이트 실패: ${verseError.message}`)
      return false
    }

    // 2. 기존 words 삭제 (재생성 시)
    await supabase.from('words').delete().eq('verse_id', verseId)

    // 3. words 테이블 삽입
    if (content.words && content.words.length > 0) {
      const wordsData = content.words.map((word, idx) => ({
        id: uuidv4(),
        verse_id: verseId,
        position: idx,
        hebrew: word.hebrew,
        meaning: word.meaning,
        ipa: word.ipa,
        korean: word.korean,
        root: word.root,
        grammar: word.grammar,
        structure: word.structure || null,
        emoji: word.emoji,
        category: word.category || null,
      }))

      const { error: wordsError } = await supabase.from('words').insert(wordsData)

      if (wordsError) {
        log.error(`words 삽입 실패: ${wordsError.message}`)
        return false
      }
    }

    // 4. 기존 commentary 관련 데이터 삭제 (재생성 시)
    const { data: existingCommentary } = await supabase
      .from('commentaries')
      .select('id')
      .eq('verse_id', verseId)
      .single()

    if (existingCommentary) {
      // 관련 테이블 삭제 (외래키 제약 고려)
      await supabase.from('commentary_sections').delete().eq('commentary_id', existingCommentary.id)
      await supabase.from('why_questions').delete().eq('commentary_id', existingCommentary.id)
      await supabase.from('commentary_conclusions').delete().eq('commentary_id', existingCommentary.id)
      await supabase.from('commentaries').delete().eq('id', existingCommentary.id)
    }

    // 5. commentaries 테이블 삽입
    if (content.commentary) {
      const commentaryId = uuidv4()

      const { error: commentaryError } = await supabase.from('commentaries').insert({
        id: commentaryId,
        verse_id: verseId,
        intro: content.commentary.intro,
      })

      if (commentaryError) {
        log.error(`commentaries 삽입 실패: ${commentaryError.message}`)
        return false
      }

      // 6. commentary_sections 테이블 삽입
      if (content.commentary.sections && content.commentary.sections.length > 0) {
        const sectionsData = content.commentary.sections.map((section, idx) => ({
          id: uuidv4(),
          commentary_id: commentaryId,
          position: idx,
          emoji: section.emoji,
          title: section.title,
          description: section.description,
          points: section.points,
          color: section.color,
        }))

        const { error: sectionsError } = await supabase
          .from('commentary_sections')
          .insert(sectionsData)

        if (sectionsError) {
          log.error(`commentary_sections 삽입 실패: ${sectionsError.message}`)
          return false
        }
      }

      // 7. why_questions 테이블 삽입
      if (content.commentary.whyQuestion) {
        const { error: whyError } = await supabase.from('why_questions').insert({
          id: uuidv4(),
          commentary_id: commentaryId,
          question: content.commentary.whyQuestion.question,
          answer: content.commentary.whyQuestion.answer,
          bible_references: content.commentary.whyQuestion.bibleReferences,
        })

        if (whyError) {
          log.error(`why_questions 삽입 실패: ${whyError.message}`)
          return false
        }
      }

      // 8. commentary_conclusions 테이블 삽입
      if (content.commentary.conclusion) {
        const { error: conclusionError } = await supabase.from('commentary_conclusions').insert({
          id: uuidv4(),
          commentary_id: commentaryId,
          title: content.commentary.conclusion.title,
          content: content.commentary.conclusion.content,
        })

        if (conclusionError) {
          log.error(`commentary_conclusions 삽입 실패: ${conclusionError.message}`)
          return false
        }
      }
    }

    log.success(`DB 저장 완료: ${verseId}`)
    return true
  } catch (err) {
    log.error(`DB 저장 중 오류 발생: ${err}`)
    return false
  }
}

/**
 * 배치로 여러 컨텐츠 저장
 */
export async function saveBatch(
  contents: Map<string, GeneratedContent>
): Promise<{ success: number; failure: number }> {
  let success = 0
  let failure = 0

  for (const [verseId, content] of contents) {
    const result = await saveToDatabase(content)
    if (result) {
      success++
    } else {
      failure++
      log.error(`저장 실패: ${verseId}`)
    }
  }

  return { success, failure }
}
