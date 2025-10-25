import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSVGData() {
  console.log('📊 SVG 데이터 확인 중...\n');

  // 1. SVG가 있는 단어 개수
  const { data: wordsWithSVG, error: error1 } = await supabase
    .from('words')
    .select('id')
    .not('icon_svg', 'is', null);

  if (error1) {
    console.error('❌ Error:', error1);
    return;
  }

  console.log(`✅ SVG가 있는 단어: ${wordsWithSVG?.length || 0}개`);

  // 2. SVG가 없는 단어 개수
  const { data: wordsWithoutSVG, error: error2 } = await supabase
    .from('words')
    .select('id')
    .is('icon_svg', null);

  if (error2) {
    console.error('❌ Error:', error2);
    return;
  }

  console.log(`❌ SVG가 없는 단어: ${wordsWithoutSVG?.length || 0}개\n`);

  // 3. SVG 샘플 확인 (첫 3개)
  const { data: sampleWords, error: error3 } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg')
    .not('icon_svg', 'is', null)
    .limit(3);

  if (error3) {
    console.error('❌ Error:', error3);
    return;
  }

  console.log('📝 SVG 샘플 (첫 3개):\n');
  sampleWords?.forEach((word, idx) => {
    console.log(`${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   SVG 길이: ${word.icon_svg?.length || 0} 문자`);
    console.log(`   SVG 미리보기: ${word.icon_svg?.substring(0, 100)}...`);
    console.log('');
  });
}

checkSVGData();
