/**
 * 창세기 4장 빈 구절 확인
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkChapter4() {
  console.log('📊 창세기 4장 확인 중...\n')

  // 전체 구절 확인
  const { data: allVerses, error: allError } = await supabase
    .from('verses')
    .select('id, verse_number, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 4)
    .order('verse_number', { ascending: true })

  if (allError) {
    console.error('❌ 에러:', allError.message)
    return
  }

  console.log(`총 ${allVerses?.length || 0}개 구절`)

  // 빈 구절 확인
  const { data: emptyVerses, error: emptyError } = await supabase
    .from('verses')
    .select('id, verse_number, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 4)
    .or('ipa.is.null,korean_pronunciation.is.null,modern.is.null')
    .order('verse_number', { ascending: true })

  if (emptyError) {
    console.error('❌ 에러:', emptyError.message)
    return
  }

  if (!emptyVerses || emptyVerses.length === 0) {
    console.log('✅ 창세기 4장은 모든 컨텐츠가 완료되었습니다!')
  } else {
    console.log(`\n⚠️  빈 구절 ${emptyVerses.length}개:`)
    emptyVerses.forEach(v => {
      console.log(`   - ${v.reference}`)
    })
    console.log(`\n📝 generate:prompt genesis 4 명령으로 ${emptyVerses.length}개 구절 생성 가능`)
  }
}

checkChapter4().catch(console.error)
