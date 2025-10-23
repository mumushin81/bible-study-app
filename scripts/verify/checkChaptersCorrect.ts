/**
 * 올바른 방식으로 장별 콘텐츠 확인
 *
 * words는 여러 개가 있을 수 있으므로 DISTINCT verse_id로 확인
 */

import { createSupabaseClient } from '../utils/supabase'
import { log } from '../utils/logger'

async function checkChapters(chapters: number[]) {
  const supabase = createSupabaseClient()

  console.log('장 | 구절 수 | Words 구절 | Comm 구절 | 상태')
  console.log('─'.repeat(60))

  for (const chapter of chapters) {
    // 1. 해당 장의 구절들
    const { data: verses } = await supabase
      .from('verses')
      .select('id')
      .eq('book_id', 'genesis')
      .eq('chapter', chapter)

    if (!verses || verses.length === 0) {
      console.log(`${chapter.toString().padStart(2)} | 0절 | - | - | ❌ 구절 없음`)
      continue
    }

    const verseIds = verses.map(v => v.id)

    // 2. words가 있는 구절 수 (DISTINCT verse_id)
    const { data: wordsVerses } = await supabase
      .from('words')
      .select('verse_id')
      .in('verse_id', verseIds)

    const uniqueWordsVerses = new Set(wordsVerses?.map(w => w.verse_id) || []).size

    // 3. commentaries가 있는 구절 수
    const { data: commVerses } = await supabase
      .from('commentaries')
      .select('verse_id')
      .in('verse_id', verseIds)

    const uniqueCommVerses = new Set(commVerses?.map(c => c.verse_id) || []).size

    // 4. 상태 판단
    const isComplete = (uniqueWordsVerses === verses.length) && (uniqueCommVerses === verses.length)
    const hasNoContent = (uniqueWordsVerses === 0) && (uniqueCommVerses === 0)

    const status = isComplete ? '✅ 완성' :
                   hasNoContent ? '❌ 없음' :
                   '⚠️  부분'

    console.log(
      `${chapter.toString().padStart(2)} | ` +
      `${verses.length.toString().padStart(6)}절 | ` +
      `${uniqueWordsVerses.toString().padStart(9)} | ` +
      `${uniqueCommVerses.toString().padStart(9)} | ` +
      `${status}`
    )
  }
}

async function main() {
  console.log('📊 Genesis 1-15장 콘텐츠 상세 확인\n')
  await checkChapters([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
}

main().catch(console.error)
