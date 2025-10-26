import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUrls() {
  console.log('🔍 이미지 URL 접근성 테스트\n');

  // Genesis 1:1 단어들 가져오기
  const { data: words, error } = await supabase
    .from('words')
    .select(`
      hebrew,
      meaning,
      icon_url,
      verses!inner (
        book_id,
        chapter,
        verse_number
      )
    `)
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true })
    .limit(3);

  if (error) {
    console.error('❌ 데이터베이스 에러:', error);
    return;
  }

  console.log(`📋 ${words?.length || 0}개 단어의 이미지 URL 테스트:\n`);

  for (const word of words || []) {
    console.log(`\n단어: ${word.hebrew} (${word.meaning})`);
    console.log(`URL: ${word.icon_url}\n`);

    if (word.icon_url) {
      try {
        // HTTP GET 요청으로 파일 존재 확인 (에러 메시지 포함)
        const response = await fetch(word.icon_url);

        console.log(`  상태 코드: ${response.status}`);
        console.log(`  Content-Type: ${response.headers.get('content-type')}`);
        console.log(`  Content-Length: ${response.headers.get('content-length')} bytes`);
        console.log(`  접근 가능: ${response.ok ? '✅' : '❌'}`);

        // CORS 헤더 확인
        const corsHeader = response.headers.get('access-control-allow-origin');
        console.log(`  CORS: ${corsHeader || '❌ 헤더 없음'}`);

        // 에러 응답 본문 확인
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`  에러 메시지: ${errorText}`);
        }

      } catch (err) {
        console.error(`  ❌ 요청 실패:`, err);
      }
    } else {
      console.log(`  ⚠️  icon_url이 NULL입니다`);
    }
    console.log('─'.repeat(60));
  }
}

testImageUrls();
