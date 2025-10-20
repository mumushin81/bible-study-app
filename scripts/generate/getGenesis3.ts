import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function getGenesis3Verses() {
  const { data: verses, error } = await supabase
    .from('verses')
    .select('verse_number, hebrew')
    .eq('book_id', 'genesis')
    .eq('chapter', 3)
    .order('verse_number')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('창세기 3장 구절 데이터:')
  verses?.forEach(v => {
    console.log(`${v.verse_number}: ${v.hebrew || '(비어있음)'}`)
  })
}

getGenesis3Verses()
