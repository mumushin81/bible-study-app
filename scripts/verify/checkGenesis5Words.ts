import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouzlnriafovnxlkywerk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGenesis5Words() {
  console.log('📖 Checking Genesis 5 word analysis coverage...\n')

  // Get all Genesis 5 verses
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, verse_number, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .order('verse_number', { ascending: true })

  if (versesError) {
    console.error('❌ Error:', versesError)
    return
  }

  console.log(`✅ Found ${verses.length} verses in Genesis 5\n`)

  // Check which verses have words
  const versesWithWords: string[] = []
  const versesWithoutWords: string[] = []

  for (const verse of verses) {
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id')
      .eq('verse_id', verse.id)

    if (wordsError) {
      console.error(`❌ Error checking ${verse.reference}:`, wordsError)
      continue
    }

    if (words && words.length > 0) {
      versesWithWords.push(`${verse.reference} (${words.length} words)`)
    } else {
      versesWithoutWords.push(verse.reference)
    }
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 Word Analysis Coverage:`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Total verses: ${verses.length}`)
  console.log(`With word analysis: ${versesWithWords.length}`)
  console.log(`Without word analysis: ${versesWithoutWords.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (versesWithWords.length > 0) {
    console.log(`✅ Verses with word analysis:`)
    versesWithWords.forEach(v => console.log(`   ${v}`))
    console.log()
  }

  if (versesWithoutWords.length > 0) {
    console.log(`⚠️  Verses WITHOUT word analysis (${versesWithoutWords.length}):`)
    versesWithoutWords.forEach(v => console.log(`   ${v}`))
  }

  // Check commentaries
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 Commentary Coverage:`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  const versesWithCommentary: string[] = []
  const versesWithoutCommentary: string[] = []

  for (const verse of verses) {
    const { data: commentary, error: commentaryError } = await supabase
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

  console.log(`With commentary: ${versesWithCommentary.length}`)
  console.log(`Without commentary: ${versesWithoutCommentary.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

checkGenesis5Words()
