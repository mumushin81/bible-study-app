import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('📊 창세기 4:1-3 현재 상태:\n')

  const { data, error } = await supabase
    .from('verses')
    .select('id, verse_number, reference, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 4)
    .in('verse_number', [1, 2, 3])
    .order('verse_number')

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  if (!data) return

  for (const v of data) {
    console.log(v.reference)
    console.log('  IPA:', v.ipa ? '있음' : '없음')
    console.log('  Korean:', v.korean_pronunciation ? '있음' : '없음')
    console.log('  Modern:', v.modern ? '있음' : '없음')
    console.log()
  }

  // 단어 개수 확인
  for (const verse of data) {
    const { count } = await supabase
      .from('words')
      .select('id', { count: 'exact', head: true })
      .eq('verse_id', verse.id)

    console.log(verse.reference + ': ' + count + '개 단어')
  }
}

check().catch(console.error)
