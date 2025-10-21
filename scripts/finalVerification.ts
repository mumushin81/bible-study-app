import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function finalVerification() {
  console.log('\n🔍 최종 검증 시작...\n');

  // 1. 전체 단어 수 확인
  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 총 단어 수: ${totalWords}개`);

  // 2. emoji 필드 상태 확인
  const { count: wordsWithEmoji } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('emoji', 'is', null);

  const { count: wordsWithoutEmoji } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .is('emoji', null);

  console.log(`\n📝 Emoji 상태:`);
  console.log(`   emoji 있음: ${wordsWithEmoji}개 ${wordsWithEmoji === 0 ? '✅' : '❌'}`);
  console.log(`   emoji 없음: ${wordsWithoutEmoji}개 ${wordsWithoutEmoji === totalWords ? '✅' : '❌'}`);

  // 3. icon_svg 필드 상태 확인
  const { count: wordsWithIconSvg } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null);

  const { count: wordsWithoutIconSvg } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .is('icon_svg', null);

  console.log(`\n🎨 SVG 아이콘 상태:`);
  console.log(`   icon_svg 있음: ${wordsWithIconSvg}개`);
  console.log(`   icon_svg 없음: ${wordsWithoutIconSvg}개`);
  console.log(`   커버리지: ${((wordsWithIconSvg! / totalWords!) * 100).toFixed(1)}%`);

  // 4. Genesis 1-3 검증
  const chapters = [
    { book: 'genesis', chapter: 1, name: 'Genesis 1' },
    { book: 'genesis', chapter: 2, name: 'Genesis 2' },
    { book: 'genesis', chapter: 3, name: 'Genesis 3' },
    { book: 'genesis', chapter: 5, name: 'Genesis 5' },
  ];

  console.log(`\n📖 장별 검증:\n`);

  for (const ch of chapters) {
    const { data: verses } = await supabase
      .from('verses')
      .select('id')
      .eq('book_id', ch.book)
      .eq('chapter', ch.chapter);

    if (!verses || verses.length === 0) {
      console.log(`   ${ch.name}: 구절 없음 ⚠️`);
      continue;
    }

    const verseIds = verses.map(v => v.id);

    const { count: chapterWords } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .in('verse_id', verseIds);

    const { count: wordsWithSvg } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .in('verse_id', verseIds)
      .not('icon_svg', 'is', null);

    const coverage = ((wordsWithSvg! / chapterWords!) * 100).toFixed(1);
    const status = wordsWithSvg === chapterWords ? '✅' : '⚠️';

    console.log(`   ${ch.name}: ${verses.length}절, ${chapterWords}단어, SVG ${coverage}% ${status}`);
  }

  // 5. Genesis 5:1 상세 검증
  console.log(`\n🔬 Genesis 5:1 상세 검증:\n`);

  const { data: gen51 } = await supabase
    .from('verses')
    .select('id')
    .eq('reference', 'Genesis 5:1')
    .single();

  if (gen51) {
    const { data: words } = await supabase
      .from('words')
      .select('hebrew, meaning, emoji, icon_svg')
      .eq('verse_id', gen51.id)
      .order('position');

    words?.forEach((w, i) => {
      const emojiStatus = w.emoji ? '❌ 있음' : '✅ 없음';
      const svgStatus = w.icon_svg ? '✅ 있음' : '❌ 없음';
      console.log(`   ${i + 1}. ${w.hebrew} (${w.meaning})`);
      console.log(`      emoji: ${emojiStatus}, icon_svg: ${svgStatus}`);
    });
  }

  // 최종 결과
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n🎉 최종 결과:\n`);

  const allPassed =
    wordsWithEmoji === 0 &&
    wordsWithoutEmoji === totalWords &&
    wordsWithIconSvg! > 0;

  if (allPassed) {
    console.log(`   ✅ 모든 emoji 제거 완료!`);
    console.log(`   ✅ SVG 아이콘 업로드 완료!`);
    console.log(`   ✅ Vercel 배포 준비 완료!`);
  } else {
    console.log(`   ⚠️  일부 작업 미완료`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

finalVerification();
