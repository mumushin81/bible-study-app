import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouzlnriafovnxlkywerk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyGenesis5Verses() {
  console.log('📖 Checking Genesis 5:2-5:32 in database...\n')

  const { data, error } = await supabase
    .from('verses')
    .select('verse_number, reference, hebrew, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .gte('verse_number', 2)
    .lte('verse_number', 32)
    .order('verse_number', { ascending: true })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Found ${data.length} verses\n`)

  // Show verses 22-24
  console.log('Verses 22-24 (Enoch):')
  data.filter(v => [22, 23, 24].includes(v.verse_number)).forEach((verse) => {
    console.log(`\n${verse.reference}`)
    console.log(`Hebrew: ${verse.hebrew}`)
    console.log(`Modern: ${verse.modern}`)
  })

  // Check which verses have Korean content
  const withKorean = data.filter(v => v.modern && !v.modern.includes('[TODO'))
  const withoutKorean = data.filter(v => !v.modern || v.modern.includes('[TODO'))

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 Status:`)
  console.log(`Total verses: ${data.length}`)
  console.log(`With Korean: ${withKorean.length}`)
  console.log(`Without Korean: ${withoutKorean.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  if (withoutKorean.length > 0) {
    console.log(`\n⚠️  Verses missing Korean content:`)
    withoutKorean.forEach(v => {
      console.log(`   ${v.reference} - verse ${v.verse_number}`)
    })
  }
}

verifyGenesis5Verses()
