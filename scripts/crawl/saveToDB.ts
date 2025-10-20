/**
 * 구절을 Supabase에 저장
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../src/lib/database.types'
import { log } from '../utils/logger'
import { makeVerseId, makeReference } from '../utils/constants'

export interface VerseToSave {
  bookId: string
  bookName: string
  chapter: number
  verseNumber: number
  hebrew: string
}

/**
 * 단일 구절 저장
 */
export async function saveVerse(
  supabase: SupabaseClient<Database>,
  verse: VerseToSave
): Promise<boolean> {
  const { bookId, bookName, chapter, verseNumber, hebrew } = verse

  const verseData = {
    id: makeVerseId(bookId, chapter, verseNumber),
    book_id: bookId,
    chapter,
    verse_number: verseNumber,
    reference: makeReference(bookName, chapter, verseNumber),
    hebrew,
    ipa: '',
    korean_pronunciation: '',
    literal: null,
    translation: null,
    modern: ''
  }

  const { error } = await supabase
    .from('verses')
    .upsert(verseData, { onConflict: 'id' })

  if (error) {
    log.error(`구절 저장 실패 [${verseData.reference}]: ${error.message}`)
    return false
  }

  return true
}

/**
 * 여러 구절 일괄 저장
 */
export async function saveVerses(
  supabase: SupabaseClient<Database>,
  verses: VerseToSave[]
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const verse of verses) {
    const result = await saveVerse(supabase, verse)
    if (result) {
      success++
      log.success(`저장 완료: ${verse.bookName} ${verse.chapter}:${verse.verseNumber}`)
    } else {
      failed++
    }
  }

  return { success, failed }
}
