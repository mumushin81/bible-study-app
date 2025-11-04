import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { createHash } from 'crypto'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const STORAGE_BASE_URL = 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons'

function generateCorrectFilename(wordId: string): string {
  const hash = createHash('md5').update(wordId).digest('hex')
  return `word_${hash}.jpg`
}

async function verifyImageUrls() {
  console.log('🔍 Verifying Genesis 1:1 word image URLs\n')

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url, verses!inner(reference)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('📊 Checking icon_url for each word:\n')

  for (const word of words) {
    const correctFilename = generateCorrectFilename(word.id)
    const correctUrl = `${STORAGE_BASE_URL}/${correctFilename}`
    const matches = word.icon_url === correctUrl

    console.log(`${matches ? '✅' : '❌'} ${word.hebrew} (${word.meaning})`)
    console.log(`   DB URL: ${word.icon_url}`)
    console.log(`   Expected: ${correctUrl}`)
    console.log(`   Match: ${matches ? 'YES' : 'NO'}`)
    console.log()

    // Test if image is accessible
    try {
      const response = await fetch(word.icon_url || '')
      const accessible = response.ok
      console.log(`   📡 HTTP Status: ${response.status} ${accessible ? '✅ Accessible' : '❌ Not Found'}`)
    } catch (err) {
      console.log(`   📡 HTTP Status: ❌ Failed to fetch`)
    }
    console.log()
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Verification complete!')
}

verifyImageUrls()
