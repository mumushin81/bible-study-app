import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, emoji, icon_svg, verses!inner(verse_number)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 4)
    .order('verses.verse_number')
    .limit(20)

  console.log('창세기 4장 단어 샘플 (처음 20개):\n')
  words?.forEach((w: any) => {
    console.log(`${w.verses.verse_number}절 - ${w.hebrew}`)
    console.log('  이모지:', w.emoji || '(없음)')
    console.log('  iconSvg:', w.icon_svg ? '있음 ✅' : '없음 ❌')
    console.log()
  })
}

check().catch(console.error)
