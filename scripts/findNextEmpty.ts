import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function findNext() {
  console.log('🔍 창세기에서 빈 장 찾는 중...\n')
  
  for (let chapter = 1; chapter <= 50; chapter++) {
    const { count } = await supabase
      .from('verses')
      .select('id', { count: 'exact', head: true })
      .eq('book_id', 'genesis')
      .eq('chapter', chapter)
      .or('ipa.is.null,korean_pronunciation.is.null,modern.is.null')

    if (count && count > 0) {
      console.log(`📝 창세기 ${chapter}장: ${count}개 빈 구절`)
      
      const { data } = await supabase
        .from('verses')
        .select('verse_number')
        .eq('book_id', 'genesis')
        .eq('chapter', chapter)
        .or('ipa.is.null,korean_pronunciation.is.null,modern.is.null')
        .order('verse_number')
      
      const verseNumbers = data?.map(v => v.verse_number).join(', ')
      console.log(`   구절: ${verseNumbers}`)
      console.log(`   명령어: npm run generate:prompt genesis ${chapter}\n`)
    } else if (count === 0) {
      console.log(`✅ 창세기 ${chapter}장: 완료`)
    }
  }
}

findNext().catch(console.error)
