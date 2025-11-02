import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL 또는 Service Key가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testIconUrls() {
  try {
    // 데이터베이스에서 icon_url 가져오기
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('hebrew, icon_url')
      .not('icon_url', 'is', null);

    if (wordsError) throw wordsError;

    console.log(`총 ${words.length}개의 단어 icon_url 확인`);

    const testResults: {[key: string]: string} = {};

    // 각 URL 테스트
    for (const word of words) {
      try {
        const response = await fetch(word.icon_url);

        if (response.ok) {
          testResults[word.hebrew] = '✅ 성공';
        } else {
          testResults[word.hebrew] = `❌ 실패 (상태코드: ${response.status})`;
        }
      } catch (fetchError) {
        testResults[word.hebrew] = `❌ 접근 오류: ${fetchError instanceof Error ? fetchError.message : '알 수 없는 오류'}`;
      }
    }

    // 결과 출력
    console.log('\n📊 URL 접근성 테스트 결과:');
    Object.entries(testResults).forEach(([hebrew, status]) => {
      console.log(`${hebrew}: ${status}`);
    });

    // 실패한 URL 요약
    const failedUrls = Object.entries(testResults)
      .filter(([_, status]) => status.startsWith('❌'))
      .map(([hebrew, status]) => `${hebrew}: ${status}`);

    if (failedUrls.length > 0) {
      console.error('\n❗ 다음 URL들에 문제가 있습니다:');
      failedUrls.forEach(url => console.error(url));
      process.exit(1);
    } else {
      console.log('\n✨ 모든 이미지 URL 정상');
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    process.exit(1);
  }
}

testIconUrls();