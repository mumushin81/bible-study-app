import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function getVerseList() {
  const { data: verses, error } = await supabase
    .from('verses')
    .select('id, reference, chapter, verse_number, hebrew')
    .eq('book_id', 'genesis')
    .in('chapter', [1, 2, 3])
    .order('chapter', { ascending: true })
    .order('verse_number', { ascending: true })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`\n📖 창세기 1-3장 구절 목록 (총 ${verses?.length}개)\n`)

  // Group by chapter
  const byChapter = verses?.reduce((acc, verse) => {
    if (!acc[verse.chapter]) {
      acc[verse.chapter] = []
    }
    acc[verse.chapter].push(verse)
    return acc
  }, {} as Record<number, typeof verses>)

  for (const chapter of [1, 2, 3]) {
    const chapterVerses = byChapter?.[chapter] || []
    console.log(`\n## 창세기 ${chapter}장 (${chapterVerses.length}개 구절)`)
    chapterVerses.forEach(verse => {
      console.log(`  ${verse.reference}: ${verse.hebrew.substring(0, 50)}...`)
    })
  }

  // Return verse IDs for batch processing
  return verses?.map(v => ({
    id: v.id,
    reference: v.reference,
    chapter: v.chapter,
    verse_number: v.verse_number,
    hebrew: v.hebrew
  }))
}

import { writeFile } from 'fs/promises'

getVerseList().then(async (verses) => {
  if (verses) {
    console.log(`\n✅ 총 ${verses.length}개 구절을 찾았습니다.`)
    console.log(`\n📊 배치 계획:`)
    const batches = Math.ceil(verses.length / 10)
    console.log(`  - 배치 크기: 10개`)
    console.log(`  - 필요한 배치 수: ${batches}`)

    // Save to JSON
    await writeFile(
      'data/verse_list_gen1-3.json',
      JSON.stringify(verses, null, 2),
      'utf-8'
    )
    console.log(`\n💾 구절 목록을 data/verse_list_gen1-3.json에 저장했습니다.`)
  }
})
