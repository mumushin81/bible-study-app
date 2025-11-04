import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ouzlnriafovnxlkywerk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE'
)

async function checkAllChapters() {
  const { data, error } = await supabase
    .from('verses')
    .select('chapter, verse_number, id')
    .eq('book_id', 'genesis')
    .order('chapter')
    .order('verse_number')

  if (error) throw error

  const grouped = data.reduce((acc: Record<number, string[]>, v) => {
    if (!acc[v.chapter]) acc[v.chapter] = []
    acc[v.chapter].push(v.id)
    return acc
  }, {})

  console.log('\nGenesis Chapters Content Status:\n')
  console.log('Chapter | Verses | Words | Status')
  console.log('--------|--------|-------|--------')

  for (let ch = 1; ch <= 50; ch++) {
    const verseIds = grouped[ch] || []
    const verseCount = verseIds.length

    let wordCount = 0
    if (verseIds.length > 0) {
      const { data: words } = await supabase
        .from('words')
        .select('id')
        .in('verse_id', verseIds)

      wordCount = words?.length || 0
    }

    const status = wordCount > 0 ? 'HAS_WORDS' : verseCount > 0 ? 'NO_WORDS' : 'NO_VERSES'
    const icon = wordCount > 0 ? '✓' : verseCount > 0 ? '!' : 'X'

    console.log(`  ${ch.toString().padStart(2)}    |   ${verseCount.toString().padStart(2)}   |  ${wordCount.toString().padStart(4)} | ${icon} ${status}`)
  }
}

checkAllChapters()
