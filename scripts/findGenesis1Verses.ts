import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findGenesis1Verses() {
  console.log('\n🔍 Genesis 1장 구절 검색\n');

  // Genesis 1장의 모든 구절 찾기
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, book_id, chapter, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')
    .limit(5);

  if (!verses || verses.length === 0) {
    console.log('❌ Genesis 1장 구절을 찾을 수 없습니다.');
    return;
  }

  console.log(`찾은 구절 ${verses.length}개:\n`);
  verses.forEach(v => {
    console.log(`  ${v.reference} (ID: ${v.id}, chapter: ${v.chapter}, verse: ${v.verse_number})`);
  });

  // 첫 번째 구절의 단어들 확인
  const firstVerse = verses[0];
  console.log(`\n📖 ${firstVerse.reference}의 단어들:\n`);

  const { data: words } = await supabase
    .from('words')
    .select('hebrew, meaning, emoji, icon_svg, position')
    .eq('verse_id', firstVerse.id)
    .order('position');

  if (!words || words.length === 0) {
    console.log('❌ 단어를 찾을 수 없습니다.');
    return;
  }

  words.forEach((word, index) => {
    const emojiStatus = word.emoji ? '❌ 있음' : '✅ 없음';
    const svgStatus = word.icon_svg ? '✅ 있음' : '❌ 없음';
    const svgPreview = word.icon_svg ? word.icon_svg.substring(0, 40) + '...' : 'NULL';

    console.log(`${index + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   emoji: ${emojiStatus}, icon_svg: ${svgStatus}`);
    if (index === 0 && word.icon_svg) {
      console.log(`   SVG 시작: ${svgPreview}`);
      console.log(`   SVG 길이: ${word.icon_svg.length}자`);
    }
    console.log('');
  });
}

findGenesis1Verses();
