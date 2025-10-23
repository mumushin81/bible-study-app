/**
 * 특정 장들의 콘텐츠 빠른 확인
 */

import { createSupabaseClient } from '../utils/supabase'
import { log } from '../utils/logger'

async function quickCheck(chapters: number[]) {
  const supabase = createSupabaseClient()

  for (const chapter of chapters) {
    // 1. 해당 장의 구절 수
    const { data: verses, error: vError } = await supabase
      .from('verses')
      .select('id, verse_number')
      .eq('book_id', 'genesis')
      .eq('chapter', chapter)
      .order('verse_number')

    if (vError || !verses) {
      console.log(`Genesis ${chapter}: ❌ 오류 - ${vError?.message}`)
      continue
    }

    if (verses.length === 0) {
      console.log(`Genesis ${chapter}: ❌ 구절 없음`)
      continue
    }

    // 2. words 있는 구절 수
    const { count: wordsCount } = await supabase
      .from('words')
      .select('verse_id', { count: 'exact', head: true })
      .in('verse_id', verses.map(v => v.id))

    // 3. commentaries 있는 구절 수
    const { count: commCount } = await supabase
      .from('commentaries')
      .select('verse_id', { count: 'exact', head: true })
      .in('verse_id', verses.map(v => v.id))

    const status =
      (wordsCount === verses.length && commCount === verses.length) ? '✅ 완성' :
      (wordsCount === 0 && commCount === 0) ? '❌ 콘텐츠 없음' :
      `⚠️  부분 (words: ${wordsCount}/${verses.length}, comm: ${commCount}/${verses.length})`

    console.log(`Genesis ${chapter}: ${verses.length}절 | ${status}`)
  }
}

async function main() {
  console.log('📊 Genesis 2-10장 콘텐츠 확인\n')
  await quickCheck([2, 3, 4, 5, 6, 7, 8, 9, 10])
}

main().catch(console.error)
