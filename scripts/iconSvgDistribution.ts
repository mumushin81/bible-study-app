import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkIconSvgDistribution() {
  console.log('\n📊 icon_svg 분포 상세 분석\n');
  console.log('='.repeat(60));

  // Get all chapters that have verses
  const { data: allVerses } = await supabase
    .from('verses')
    .select('book_id, chapter')
    .order('book_id')
    .order('chapter');

  if (!allVerses) {
    console.log('❌ 구절을 찾을 수 없습니다.');
    return;
  }

  // Group by chapter
  const chapterMap = new Map<string, Set<number>>();
  allVerses.forEach(v => {
    if (!chapterMap.has(v.book_id)) {
      chapterMap.set(v.book_id, new Set());
    }
    chapterMap.get(v.book_id)!.add(v.chapter);
  });

  console.log('\n📖 장별 icon_svg 커버리지:\n');

  for (const [book, chapters] of chapterMap) {
    console.log(`\n${book.toUpperCase()}:`);

    const sortedChapters = Array.from(chapters).sort((a, b) => a - b);

    for (const chapter of sortedChapters) {
      // Get verses for this chapter
      const { data: verses } = await supabase
        .from('verses')
        .select('id')
        .eq('book_id', book)
        .eq('chapter', chapter);

      if (!verses || verses.length === 0) continue;

      const verseIds = verses.map(v => v.id);

      // Get word counts
      const { count: totalWords } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .in('verse_id', verseIds);

      const { count: wordsWithSvg } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .in('verse_id', verseIds)
        .not('icon_svg', 'is', null);

      const coverage = totalWords ? ((wordsWithSvg! / totalWords) * 100).toFixed(1) : '0.0';
      const status = wordsWithSvg === totalWords ? '✅' : '⚠️';
      const bar = '█'.repeat(Math.floor(parseFloat(coverage) / 5));

      console.log(`  Chapter ${chapter}: ${wordsWithSvg}/${totalWords} (${coverage}%) ${bar} ${status}`);
    }
  }

  console.log('\n' + '='.repeat(60));

  // Summary
  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  const { count: wordsWithSvg } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null);

  const { count: wordsWithoutSvg } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .is('icon_svg', null);

  console.log('\n📈 전체 요약:\n');
  console.log(`  총 단어 수: ${totalWords}개`);
  console.log(`  icon_svg 있음: ${wordsWithSvg}개 (${((wordsWithSvg! / totalWords!) * 100).toFixed(1)}%)`);
  console.log(`  icon_svg 없음: ${wordsWithoutSvg}개 (${((wordsWithoutSvg! / totalWords!) * 100).toFixed(1)}%)`);
  console.log('\n' + '='.repeat(60) + '\n');
}

checkIconSvgDistribution();
