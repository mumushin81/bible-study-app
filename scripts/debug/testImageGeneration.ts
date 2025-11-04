import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateAndSaveHebrewWordImage } from '../../src/utils/imageGenerator';

// 환경변수 직접 가져오기
const REPLICATE_API_TOKEN = process.env.VITE_REPLICATE_API_TOKEN || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 초기화
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 테스트할 히브리어 단어 목록
const testWords = [
  'בראשית',   // Bereshit (Genesis)
  'אלהים',    // Elohim (God)
  'שמים',     // Shamayim (Heavens)
  'ארץ',      // Eretz (Earth)
  'אור',      // Or (Light)
  'חושך',     // Choshech (Darkness)
];

async function runImageGenerationTests() {
  console.log('🧪 히브리어 단어 이미지 생성 테스트 시작');
  console.log(`🔑 Replicate API 토큰 상태: ${REPLICATE_API_TOKEN ? '✅ 있음' : '❌ 없음'}`);

  for (const word of testWords) {
    console.log(`\n📝 테스트 단어: ${word}`);

    try {
      // 이미지 생성 및 데이터베이스 저장 시도
      const imageUrl = await generateAndSaveHebrewWordImage(supabase, word);

      if (imageUrl) {
        console.log(`✅ 성공: 이미지 생성 및 저장됨`);
        console.log(`🔗 이미지 URL: ${imageUrl}`);

        // 데이터베이스에서 저장된 URL 확인
        const { data, error } = await supabase
          .from('hebrew_words')
          .select('icon_url')
          .eq('hebrew', word)
          .single();

        if (error) {
          console.error(`❌ 데이터베이스 조회 실패: ${error.message}`);
        } else {
          console.log(`💾 데이터베이스 저장 URL: ${data.icon_url}`);
          console.log(data.icon_url === imageUrl
            ? '✅ URL 일치'
            : '❌ URL 불일치');
        }
      } else {
        console.error(`❌ 이미지 생성 실패: ${word}`);
      }
    } catch (error) {
      console.error(`❌ 테스트 중 오류 발생: ${word}`, error);
    }
  }

  console.log('\n🏁 테스트 완료');
}

// 테스트 실행
runImageGenerationTests().catch(console.error);