import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteContent() {
  console.log('🗑️  창세기 4:1-3 컨텐츠 삭제 시작...\n')

  // 1. 해당 구절 ID 가져오기
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 4)
    .in('verse_number', [1, 2, 3])
    .order('verse_number')

  if (versesError) {
    console.error('❌ 에러:', versesError.message)
    return
  }

  if (!verses || verses.length === 0) {
    console.log('⚠️  해당 구절을 찾을 수 없습니다.')
    return
  }

  console.log('찾은 구절:', verses.map(v => v.reference).join(', '))

  // 2. 각 구절의 단어 삭제
  for (const verse of verses) {
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .delete()
      .eq('verse_id', verse.id)
      .select()

    if (wordsError) {
      console.error(`❌ ${verse.reference} 단어 삭제 실패:`, wordsError.message)
    } else {
      console.log(`✅ ${verse.reference}: ${words?.length || 0}개 단어 삭제됨`)
    }
  }

  // 3. 구절 컨텐츠 필드 빈 문자열로 설정
  for (const verse of verses) {
    const { error: updateError } = await supabase
      .from('verses')
      .update({
        ipa: '',
        korean_pronunciation: '',
        modern: ''
      })
      .eq('id', verse.id)

    if (updateError) {
      console.error(`❌ ${verse.reference} 업데이트 실패:`, updateError.message)
    } else {
      console.log(`✅ ${verse.reference}: 컨텐츠 필드 초기화됨`)
    }
  }

  console.log('\n✅ 삭제 완료!')
  console.log('다음 명령어로 새로 생성: npm run generate:prompt genesis 4')
}

deleteContent().catch(console.error)
