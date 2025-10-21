import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouzlnriafovnxlkywerk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE'

const supabase = createClient(supabaseUrl, supabaseKey)

interface ChapterStatus {
  chapter: number
  totalVerses: number
  withKorean: number
  withWords: number
  withCommentary: number
  missingKorean: string[]
  missingWords: string[]
  missingCommentary: string[]
}

async function checkGenesis6to10Status() {
  console.log('📖 Checking Genesis 6-10 Status...\n')

  const chapters = [6, 7, 8, 9, 10]
  const results: ChapterStatus[] = []

  for (const chapter of chapters) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📖 Genesis Chapter ${chapter}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Get all verses for this chapter
    const { data: verses, error: versesError } = await supabase
      .from('verses')
      .select('id, verse_number, reference, hebrew, modern')
      .eq('book_id', 'genesis')
      .eq('chapter', chapter)
      .order('verse_number', { ascending: true })

    if (versesError) {
      console.error(`❌ Error:`, versesError)
      continue
    }

    console.log(`📊 Total verses: ${verses.length}`)

    // Check Korean translations
    const withKorean = verses.filter(v => v.modern && !v.modern.includes('[TODO'))
    const missingKorean = verses.filter(v => !v.modern || v.modern.includes('[TODO'))

    console.log(`✅ With Korean: ${withKorean.length}/${verses.length} (${Math.round(withKorean.length / verses.length * 100)}%)`)
    if (missingKorean.length > 0) {
      console.log(`⚠️  Missing Korean: ${missingKorean.length}`)
      missingKorean.slice(0, 5).forEach(v => console.log(`   - ${v.reference}`))
      if (missingKorean.length > 5) console.log(`   ... and ${missingKorean.length - 5} more`)
    }

    // Check words
    const versesWithWords: string[] = []
    const versesWithoutWords: string[] = []

    for (const verse of verses) {
      const { data: words } = await supabase
        .from('words')
        .select('id')
        .eq('verse_id', verse.id)

      if (words && words.length > 0) {
        versesWithWords.push(verse.reference)
      } else {
        versesWithoutWords.push(verse.reference)
      }
    }

    console.log(`🔤 With word analysis: ${versesWithWords.length}/${verses.length} (${Math.round(versesWithWords.length / verses.length * 100)}%)`)
    if (versesWithoutWords.length > 0) {
      console.log(`⚠️  Missing words: ${versesWithoutWords.length}`)
    }

    // Check commentaries
    const versesWithCommentary: string[] = []
    const versesWithoutCommentary: string[] = []

    for (const verse of verses) {
      const { data: commentary } = await supabase
        .from('commentaries')
        .select('id')
        .eq('verse_id', verse.id)
        .single()

      if (commentary) {
        versesWithCommentary.push(verse.reference)
      } else {
        versesWithoutCommentary.push(verse.reference)
      }
    }

    console.log(`💬 With commentary: ${versesWithCommentary.length}/${verses.length} (${Math.round(versesWithCommentary.length / verses.length * 100)}%)`)
    if (versesWithoutCommentary.length > 0) {
      console.log(`⚠️  Missing commentary: ${versesWithoutCommentary.length}`)
    }

    results.push({
      chapter,
      totalVerses: verses.length,
      withKorean: withKorean.length,
      withWords: versesWithWords.length,
      withCommentary: versesWithCommentary.length,
      missingKorean: missingKorean.map(v => v.reference),
      missingWords: versesWithoutWords,
      missingCommentary: versesWithoutCommentary
    })
  }

  // Summary table
  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 SUMMARY: Genesis 6-10`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  console.log(`Chapter │ Verses │ Korean │ Words │ Commentary │ Status`)
  console.log(`────────┼────────┼────────┼───────┼────────────┼────────`)

  let totalVerses = 0
  let totalKorean = 0
  let totalWords = 0
  let totalCommentary = 0

  results.forEach(r => {
    totalVerses += r.totalVerses
    totalKorean += r.withKorean
    totalWords += r.withWords
    totalCommentary += r.withCommentary

    const koreanPct = Math.round(r.withKorean / r.totalVerses * 100)
    const wordsPct = Math.round(r.withWords / r.totalVerses * 100)
    const commentaryPct = Math.round(r.withCommentary / r.totalVerses * 100)

    const status = (koreanPct === 100 && wordsPct === 100 && commentaryPct === 100) ? '✅' : '⚠️ '

    console.log(`Gen ${r.chapter}   │   ${r.totalVerses}   │ ${r.withKorean}/${r.totalVerses} (${koreanPct}%) │ ${r.withWords}/${r.totalVerses} (${wordsPct}%) │ ${r.withCommentary}/${r.totalVerses} (${commentaryPct}%) │ ${status}`)
  })

  console.log(`────────┼────────┼────────┼───────┼────────────┼────────`)
  console.log(`TOTAL   │  ${totalVerses}  │ ${totalKorean}/${totalVerses} │ ${totalWords}/${totalVerses} │ ${totalCommentary}/${totalVerses} │`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const overallPct = Math.round(totalKorean / totalVerses * 100)
  console.log(`📈 Overall Progress: ${totalKorean}/${totalVerses} verses (${overallPct}%) with Korean`)
  console.log(`🔤 Words Analysis: ${totalWords}/${totalVerses} verses (${Math.round(totalWords / totalVerses * 100)}%)`)
  console.log(`💬 Commentary: ${totalCommentary}/${totalVerses} verses (${Math.round(totalCommentary / totalVerses * 100)}%)`)

  const remaining = totalVerses - totalKorean
  if (remaining > 0) {
    console.log(`\n⏳ Work Remaining: ${remaining} verses need complete content`)
  } else {
    console.log(`\n🎉 All verses have Korean translations!`)
  }

  // Save results to JSON
  const summary = {
    date: new Date().toISOString(),
    chapters: results,
    totals: {
      verses: totalVerses,
      korean: totalKorean,
      words: totalWords,
      commentary: totalCommentary
    }
  }

  return summary
}

checkGenesis6to10Status()
