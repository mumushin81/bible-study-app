import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAnalysis() {
  console.log('🔍 플래시카드 SVG 적용 여부 깊이 분석 시작...\n');
  console.log('='.repeat(80));

  // 1. 플래시카드에 실제로 사용되는 단어 조회 (useWords Hook과 동일한 쿼리)
  const { data: flashcardWords, error } = await supabase
    .from('words')
    .select(`
      id,
      hebrew,
      meaning,
      ipa,
      korean,
      letters,
      root,
      grammar,
      structure,
      emoji,
      icon_svg,
      category,
      position,
      verses!inner (
        id,
        reference,
        book_id,
        chapter,
        verse_number
      )
    `)
    .eq('verses.book_id', 'genesis')
    .order('position', { ascending: true })
    .limit(20);  // 샘플 20개

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  console.log(`📊 조회된 단어: ${flashcardWords?.length || 0}개\n`);
  console.log('='.repeat(80));

  // 2. 각 단어별 상세 분석
  let withSVG = 0;
  let withoutSVG = 0;
  const svgExamples: any[] = [];
  const noSvgExamples: any[] = [];

  flashcardWords?.forEach((word: any, index) => {
    const hasSVG = !!(word.icon_svg && word.icon_svg.trim().length > 0);

    console.log(`\n${index + 1}. ${word.hebrew} - ${word.meaning}`);
    console.log('   ' + '-'.repeat(70));
    console.log(`   구절: ${word.verses.reference}`);
    console.log(`   품사: ${word.grammar || 'N/A'}`);
    console.log(`   Emoji: ${word.emoji || 'N/A'}`);
    console.log(`   icon_svg (DB): ${hasSVG ? '✅ EXISTS' : '❌ NULL'}`);

    if (hasSVG) {
      withSVG++;
      const svgLength = word.icon_svg.length;
      const hasViewBox = word.icon_svg.includes('viewBox');
      const hasGradient = word.icon_svg.includes('gradient');
      const hasShadow = word.icon_svg.includes('drop-shadow');
      const hasXmlns = word.icon_svg.includes('xmlns');

      console.log(`   SVG 길이: ${svgLength} characters`);
      console.log(`   SVG 품질:`);
      console.log(`      - viewBox: ${hasViewBox ? '✅' : '❌'}`);
      console.log(`      - xmlns: ${hasXmlns ? '✅' : '❌'}`);
      console.log(`      - gradient: ${hasGradient ? '✅' : '❌'}`);
      console.log(`      - drop-shadow: ${hasShadow ? '✅' : '❌'}`);

      // SVG 미리보기
      const svgPreview = word.icon_svg.substring(0, 150) + '...';
      console.log(`   SVG 미리보기: ${svgPreview}`);

      svgExamples.push({
        hebrew: word.hebrew,
        meaning: word.meaning,
        reference: word.verses.reference,
        svgLength,
        hasGradient,
        hasShadow
      });
    } else {
      withoutSVG++;
      console.log(`   ⚠️  icon_svg: ${word.icon_svg === null ? 'NULL' : `"${word.icon_svg}"`}`);

      noSvgExamples.push({
        hebrew: word.hebrew,
        meaning: word.meaning,
        reference: word.verses.reference,
        emoji: word.emoji
      });
    }
  });

  // 3. 통계 요약
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 통계 요약 (샘플 20개)');
  console.log('='.repeat(80));
  console.log(`✅ SVG 있음: ${withSVG}개 (${(withSVG / 20 * 100).toFixed(1)}%)`);
  console.log(`❌ SVG 없음: ${withoutSVG}개 (${(withoutSVG / 20 * 100).toFixed(1)}%)`);

  // 4. SVG 있는 단어 예시
  if (svgExamples.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('✅ SVG 적용된 단어 예시');
    console.log('='.repeat(80));
    svgExamples.slice(0, 5).forEach((ex, i) => {
      console.log(`${i + 1}. ${ex.hebrew} - ${ex.meaning} (${ex.reference})`);
      console.log(`   길이: ${ex.svgLength}, Gradient: ${ex.hasGradient ? '✅' : '❌'}, Shadow: ${ex.hasShadow ? '✅' : '❌'}`);
    });
  }

  // 5. SVG 없는 단어 예시
  if (noSvgExamples.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ SVG 없는 단어 예시');
    console.log('='.repeat(80));
    noSvgExamples.slice(0, 5).forEach((ex, i) => {
      console.log(`${i + 1}. ${ex.hebrew} - ${ex.meaning} (${ex.reference})`);
      console.log(`   Emoji: ${ex.emoji || 'N/A'}`);
    });
  }

  // 6. 전체 통계 (genesis 전체)
  console.log('\n' + '='.repeat(80));
  console.log('📊 전체 통계 (Genesis 전체)');
  console.log('='.repeat(80));

  const { data: allGenesis } = await supabase
    .from('words')
    .select('icon_svg, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  if (allGenesis) {
    const totalWords = allGenesis.length;
    const withSvgTotal = allGenesis.filter(w => w.icon_svg && w.icon_svg.trim().length > 0).length;
    const withoutSvgTotal = totalWords - withSvgTotal;

    console.log(`총 단어: ${totalWords}개`);
    console.log(`✅ SVG 있음: ${withSvgTotal}개 (${(withSvgTotal / totalWords * 100).toFixed(1)}%)`);
    console.log(`❌ SVG 없음: ${withoutSvgTotal}개 (${(withoutSvgTotal / totalWords * 100).toFixed(1)}%)`);
  }

  // 7. NULL SVG 단어의 특징 분석
  console.log('\n' + '='.repeat(80));
  console.log('🔍 NULL SVG 단어 특징 분석');
  console.log('='.repeat(80));

  const { data: nullSvgWords } = await supabase
    .from('words')
    .select('hebrew, meaning, grammar, emoji, verses!inner(book_id, chapter)')
    .eq('verses.book_id', 'genesis')
    .is('icon_svg', null)
    .limit(10);

  if (nullSvgWords && nullSvgWords.length > 0) {
    console.log(`\n샘플 10개:`);
    nullSvgWords.forEach((w: any, i) => {
      console.log(`${i + 1}. ${w.hebrew} - ${w.meaning}`);
      console.log(`   장: ${w.verses.chapter}, 품사: ${w.grammar || 'N/A'}, Emoji: ${w.emoji || 'N/A'}`);
    });

    // 장별 분포
    const chapterDistribution = new Map<number, number>();
    const { data: nullByChapter } = await supabase
      .from('words')
      .select('verses!inner(book_id, chapter)')
      .eq('verses.book_id', 'genesis')
      .is('icon_svg', null);

    nullByChapter?.forEach((w: any) => {
      const chapter = w.verses.chapter;
      chapterDistribution.set(chapter, (chapterDistribution.get(chapter) || 0) + 1);
    });

    console.log(`\n\n장별 NULL SVG 분포:`);
    Array.from(chapterDistribution.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([chapter, count]) => {
        console.log(`   창세기 ${chapter}장: ${count}개`);
      });
  }

  // 8. useWords Hook 시뮬레이션 (중복 제거 확인)
  console.log('\n' + '='.repeat(80));
  console.log('🔄 useWords Hook 시뮬레이션 (중복 제거)');
  console.log('='.repeat(80));

  const { data: rawData } = await supabase
    .from('words')
    .select(`
      id,
      hebrew,
      meaning,
      icon_svg,
      verses!inner (id, reference, book_id)
    `)
    .eq('verses.book_id', 'genesis')
    .limit(100);

  if (rawData) {
    // 중복 제거 (useWords Hook과 동일한 로직)
    const wordMap = new Map<string, any>();

    rawData.forEach((item: any) => {
      if (!wordMap.has(item.hebrew)) {
        wordMap.set(item.hebrew, {
          hebrew: item.hebrew,
          meaning: item.meaning,
          iconSvg: item.icon_svg || undefined,
          verseReference: item.verses.reference
        });
      }
    });

    const uniqueWords = Array.from(wordMap.values());
    const withSvgUnique = uniqueWords.filter(w => w.iconSvg).length;
    const withoutSvgUnique = uniqueWords.length - withSvgUnique;

    console.log(`DB 원본: ${rawData.length}개`);
    console.log(`중복 제거 후: ${uniqueWords.length}개`);
    console.log(`✅ SVG 있음: ${withSvgUnique}개 (${(withSvgUnique / uniqueWords.length * 100).toFixed(1)}%)`);
    console.log(`❌ SVG 없음: ${withoutSvgUnique}개 (${(withoutSvgUnique / uniqueWords.length * 100).toFixed(1)}%)`);

    console.log(`\n중복 제거된 단어 예시 (처음 5개):`);
    uniqueWords.slice(0, 5).forEach((w, i) => {
      console.log(`${i + 1}. ${w.hebrew} - ${w.meaning}`);
      console.log(`   iconSvg: ${w.iconSvg ? '✅ EXISTS' : '❌ undefined'}`);
      console.log(`   구절: ${w.verseReference}`);
    });
  }
}

deepAnalysis().catch(console.error);
