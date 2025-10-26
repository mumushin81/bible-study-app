import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFullUrls() {
  console.log('🔍 Genesis 1:1 단어들의 전체 icon_url 확인\n');

  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url, verses!inner(reference)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true })
    .limit(10);

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  words?.forEach((word: any, idx: number) => {
    console.log(`${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   icon_url: ${word.icon_url}`);

    // URL에서 파일명 추출
    if (word.icon_url) {
      const urlParts = word.icon_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      console.log(`   파일명: ${filename}`);
    }
    console.log('');
  });

  // 실제 어떤 단어에 어떤 파일이 매핑되었는지 확인
  console.log('\n📊 매핑 분석:');
  console.log('각 단어의 icon_url이 의미에 맞는 이미지인지 확인하세요.\n');

  console.log('예상되는 매핑:');
  console.log('- בְּרֵאשִׁית (태초에) → 태양/시작 관련 이미지');
  console.log('- בָּרָא (창조하셨다) → 창조/손 관련 이미지');
  console.log('- אֱלֹהִים (하나님) → 왕관/신성 관련 이미지');
  console.log('- אֵת (목적격) → 화살표/방향 관련 이미지');
  console.log('- הַשָּׁמַיִם (하늘들) → 구름/하늘 관련 이미지');
  console.log('- וְאֵת (그리고) → 연결/플러스 관련 이미지');
  console.log('- הָאָרֶץ (땅) → 지구/땅 관련 이미지');
}

checkFullUrls();
