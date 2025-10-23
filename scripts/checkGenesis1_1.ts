import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkGenesis1_1() {
  console.log('\n🔍 Genesis 1:1 첫 번째 단어 상세 확인\n');

  const { data: verse } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('reference', 'Genesis 1:1')
    .single();

  if (!verse) {
    console.log('❌ Genesis 1:1을 찾을 수 없습니다.');
    return;
  }

  console.log(`📖 구절: ${verse.reference} (ID: ${verse.id})\n`);

  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', verse.id)
    .order('position');

  if (!words || words.length === 0) {
    console.log('❌ 단어를 찾을 수 없습니다.');
    return;
  }

  console.log(`총 ${words.length}개 단어:\n`);

  words.forEach((word, index) => {
    console.log(`${index + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   position: ${word.position}`);
    console.log(`   emoji: ${word.emoji || 'NULL'}`);
    console.log(`   icon_svg: ${word.icon_svg ? word.icon_svg.substring(0, 50) + '...' : 'NULL'}`);
    console.log('');
  });

  // 첫 번째 단어 상세 정보
  const firstWord = words[0];
  console.log('=' .repeat(60));
  console.log('\n🎯 첫 번째 단어 상세 정보:\n');
  console.log(`히브리어: ${firstWord.hebrew}`);
  console.log(`의미: ${firstWord.meaning}`);
  console.log(`emoji: ${firstWord.emoji ? '있음 ❌' : '없음 ✅'}`);
  console.log(`icon_svg: ${firstWord.icon_svg ? '있음 ✅' : '없음 ❌'}`);

  if (firstWord.icon_svg) {
    console.log(`\nicon_svg 길이: ${firstWord.icon_svg.length}자`);
    console.log(`icon_svg 시작: ${firstWord.icon_svg.substring(0, 100)}...`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

checkGenesis1_1();
