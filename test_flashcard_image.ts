import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testFlashcardImages() {
  console.log('🔍 플래시카드 이미지 로딩 테스트')

  // 이미지 URL이 있는 단어 5개 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, flashcard_img_url')
    .not('flashcard_img_url', 'is', null)
    .limit(5)

  if (error) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  if (!words || words.length === 0) {
    console.warn('⚠️ 이미지 URL이 있는 단어 없음')
    return
  }

  console.log('🖼️ 이미지 URL 샘플:')
  for (const word of words) {
    console.log(`\n📖 히브리어 단어: ${word.hebrew}`)
    console.log(`🌐 이미지 URL: ${word.flashcard_img_url}`)

    // URL 접근성 테스트
    try {
      const response = await fetch(word.flashcard_img_url)
      if (response.ok) {
        console.log('✅ 이미지 URL 접근 성공')
        console.log(`   파일 크기: ${response.headers.get('content-length') || '알 수 없음'} bytes`)
        console.log(`   Content-Type: ${response.headers.get('content-type') || '알 수 없음'}`)
      } else {
        console.error(`❌ 이미지 URL 접근 실패: HTTP ${response.status}`)
      }
    } catch (fetchError) {
      console.error('❌ 이미지 URL 접근 중 오류:', fetchError)
    }
  }
}

testFlashcardImages()