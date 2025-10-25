import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySVGs() {
  console.log('🔍 SVG 저장 상태 확인 중...\n');

  const meanings = [
    "하나님",
    "창조하셨다",
    "하늘",
    "밤",
    "넷째",
    "가축",
    "씨 맺는 채소",
    "그것들을",
    "그리고 말씀하셨다",
    "그리고 땅의 짐승"
  ];

  for (const meaning of meanings) {
    const { data, error } = await supabase
      .from('words')
      .select('hebrew, meaning, icon_svg')
      .eq('meaning', meaning)
      .limit(1);

    if (error) {
      console.error(`❌ "${meaning}" 조회 실패:`, error.message);
    } else if (data && data.length > 0) {
      const hasSvg = !!data[0].icon_svg;
      const svgLength = data[0].icon_svg?.length || 0;
      console.log(`${hasSvg ? '✅' : '❌'} "${meaning}" (${data[0].hebrew}): SVG ${hasSvg ? `존재 (${svgLength}자)` : '없음'}`);
    } else {
      console.log(`⚠️  "${meaning}": 레코드 없음`);
    }
  }

  // 전체 SVG 카운트
  const { count: totalCount } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true });

  const { count: svgCount } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true })
    .not('icon_svg', 'is', null);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`전체 단어: ${totalCount}개`);
  console.log(`SVG 있는 단어: ${svgCount}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

verifySVGs().catch(console.error);
