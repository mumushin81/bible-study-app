import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { count } = await supabase
    .from('verses')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', 'genesis')
    .eq('chapter', 4)
    .or('ipa.is.null,korean_pronunciation.is.null,modern.is.null')

  console.log('창세기 4장 빈 구절:', count, '개')
  
  if (count && count > 0) {
    const { data } = await supabase
      .from('verses')
      .select('verse_number, reference')
      .eq('book_id', 'genesis')
      .eq('chapter', 4)
      .or('ipa.is.null,korean_pronunciation.is.null,modern.is.null')
      .order('verse_number')
    
    console.log('\n빈 구절 목록:')
    data?.forEach(v => console.log(`  - ${v.reference}`))
    console.log('\n명령어: npm run generate:prompt genesis 4')
  } else {
    console.log('✅ 창세기 4장은 모두 완료되었습니다!')
  }
}

check().catch(console.error)
