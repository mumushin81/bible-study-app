import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkEmoji() {
  // Genesis 5:1 verse_id 가져오기
  const { data: verse } = await supabase
    .from('verses')
    .select('id')
    .eq('reference', 'Genesis 5:1')
    .single();

  if (!verse) {
    console.log('❌ Genesis 5:1을 찾을 수 없습니다.');
    return;
  }

  // 해당 구절의 단어들 조회
  const { data: words } = await supabase
    .from('words')
    .select('hebrew, meaning, emoji, icon_svg')
    .eq('verse_id', verse.id)
    .limit(10);

  console.log('\n📊 Genesis 5:1 단어들의 emoji 데이터:\n');

  if (!words || words.length === 0) {
    console.log('❌ 단어를 찾을 수 없습니다.');
    return;
  }

  words.forEach((w, i) => {
    console.log(`${i + 1}. ${w.hebrew} (${w.meaning})`);
    console.log(`   emoji: '${w.emoji || 'NULL'}'`);
    console.log(`   icon_svg: ${w.icon_svg ? 'O' : 'X'}`);
    console.log('');
  });

  const hasEmoji = words.filter(w => w.emoji).length;
  const hasIconSvg = words.filter(w => w.icon_svg).length;

  console.log(`\n✅ 총 ${words.length}개 단어 중:`);
  console.log(`   emoji 있음: ${hasEmoji}개`);
  console.log(`   icon_svg 있음: ${hasIconSvg}개`);
}

checkEmoji();
