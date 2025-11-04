import { createClient } from '@supabase/supabase-js'
import { Database } from './src/lib/database.types'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testVersesQuery() {
  try {
    console.log('🔍 Verses 쿼리 테스트')

    // 명시적으로 테이블 별칭 제거하고 컬럼 이름 확인
    const versesQuery = supabase
      .from('verses')
      .select(`
        *,
        words(
          hebrew,
          meaning,
          ipa,
          korean,
          root,
          grammar,
          flashcard_img_url,
          icon_svg,
          letters,
          category,
          root_analysis,
          position
        )
      `)
      .eq('book_id', 'genesis')
      .eq('chapter', 1)
      .order('verse_number', { ascending: true })

    console.log('🚀 쿼리:', versesQuery)

    const { data, error } = await versesQuery

    if (error) {
      console.error('❌ 쿼리 실행 중 오류 발생:', error)
      // 더 자세한 오류 정보 출력
      console.error('상세 오류:', JSON.stringify(error, null, 2))
      return
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ 데이터 없음')
      return
    }

    console.log(`✅ 총 ${data.length}개 구절 로드`)
    data.forEach((verse, index) => {
      console.log(`\n📖 구절 ${index + 1}:`)
      console.log(`   참조: ${verse.reference}`)
      console.log(`   단어 수: ${verse.words?.length || 0}`)

      verse.words?.forEach((word, wordIndex) => {
        console.log(`   단어 ${wordIndex + 1}:`)
        console.log(`     히브리어: ${word.hebrew}`)
        console.log(`     의미: ${word.meaning}`)
        console.log(`     플래시카드 이미지 URL: ${word.flashcard_img_url || '없음'}`)
      })
    })
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err)
  }
}

testVersesQuery()