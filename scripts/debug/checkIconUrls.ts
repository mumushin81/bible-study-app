import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIconUrls() {
  console.log('🔍 icon_url 상세 확인 중...\n');

  try {
    // icon_url이 있는 단어들 조회
    const { data: wordsWithUrl, error } = await supabase
      .from('words')
      .select('id, hebrew, meaning, icon_url')
      .not('icon_url', 'is', null)
      .limit(20);

    if (error) throw error;

    console.log(`✅ icon_url이 있는 단어들 (샘플 20개):\n`);

    wordsWithUrl?.forEach((word: any, i) => {
      console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`);
      console.log(`   URL: ${word.icon_url}`);
      console.log('');
    });

    // URL 패턴 분석
    if (wordsWithUrl && wordsWithUrl.length > 0) {
      const firstUrl = wordsWithUrl[0].icon_url;
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 URL 패턴 분석');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`전체 URL: ${firstUrl}`);
      console.log('');

      // Storage bucket 추출
      const bucketMatch = firstUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\//);
      if (bucketMatch) {
        console.log(`📦 Storage Bucket: ${bucketMatch[1]}`);
      }

      // 파일 경로 추출
      const pathMatch = firstUrl.match(/\/public\/[^\/]+\/(.+)$/);
      if (pathMatch) {
        console.log(`📁 파일 경로: ${pathMatch[1]}`);
      }
    }

    // icon_url이 없는 단어들도 일부 조회
    const { data: wordsWithoutUrl } = await supabase
      .from('words')
      .select('id, hebrew, meaning, icon_url, icon_svg')
      .is('icon_url', null)
      .limit(10);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ icon_url이 없는 단어들 (샘플 10개):\n');

    wordsWithoutUrl?.forEach((word: any, i) => {
      const hasSvg = word.icon_svg ? '✅ SVG 있음' : '❌ SVG 없음';
      console.log(`${i + 1}. ${word.hebrew} (${word.meaning}) - ${hasSvg}`);
    });

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkIconUrls();
