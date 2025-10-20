import { supabase } from '../utils/supabase.js'
import { log } from '../utils/logger.js'
import type { EmptyVerse } from './types.js'

/**
 * Supabase에서 컨텐츠가 없는 구절들을 조회
 * (hebrew는 있지만 ipa, korean_pronunciation, modern 중 하나라도 비어있는 구절)
 */
export async function fetchEmptyVerses(
  bookId?: string,
  chapter?: number,
  limit?: number
): Promise<EmptyVerse[]> {
  try {
    let query = supabase
      .from('verses')
      .select('id, book_id, chapter, verse_number, reference, hebrew')
      .or('ipa.eq.,korean_pronunciation.eq.,modern.eq.')
      .order('book_id', { ascending: true })
      .order('chapter', { ascending: true })
      .order('verse_number', { ascending: true })

    // 필터 적용
    if (bookId) {
      query = query.eq('book_id', bookId)
    }
    if (chapter) {
      query = query.eq('chapter', chapter)
    }
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      log.error(`빈 구절 조회 실패: ${error.message}`)
      throw error
    }

    if (!data || data.length === 0) {
      log.warn('컨텐츠가 없는 구절을 찾을 수 없습니다')
      return []
    }

    log.success(`${data.length}개의 빈 구절을 찾았습니다`)
    return data as EmptyVerse[]
  } catch (err) {
    log.error(`빈 구절 조회 중 오류 발생: ${err}`)
    throw err
  }
}

/**
 * 특정 구절 ID 목록으로 조회
 */
export async function fetchVersesByIds(verseIds: string[]): Promise<EmptyVerse[]> {
  try {
    const { data, error } = await supabase
      .from('verses')
      .select('id, book_id, chapter, verse_number, reference, hebrew')
      .in('id', verseIds)
      .order('chapter', { ascending: true })
      .order('verse_number', { ascending: true })

    if (error) {
      log.error(`구절 조회 실패: ${error.message}`)
      throw error
    }

    if (!data || data.length === 0) {
      log.warn('구절을 찾을 수 없습니다')
      return []
    }

    return data as EmptyVerse[]
  } catch (err) {
    log.error(`구절 조회 중 오류 발생: ${err}`)
    throw err
  }
}

/**
 * 빈 구절 개수 확인
 */
export async function countEmptyVerses(bookId?: string, chapter?: number): Promise<number> {
  try {
    let query = supabase
      .from('verses')
      .select('id', { count: 'exact', head: true })
      .or('ipa.eq.,korean_pronunciation.eq.,modern.eq.')

    if (bookId) {
      query = query.eq('book_id', bookId)
    }
    if (chapter) {
      query = query.eq('chapter', chapter)
    }

    const { count, error } = await query

    if (error) {
      log.error(`구절 개수 조회 실패: ${error.message}`)
      throw error
    }

    return count || 0
  } catch (err) {
    log.error(`구절 개수 조회 중 오류 발생: ${err}`)
    throw err
  }
}
