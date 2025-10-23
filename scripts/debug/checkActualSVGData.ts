import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActualSVGData() {
  console.log('🔍 실제 SVG 데이터 확인 중...\n');

  // 1. 전체 통계
  const { data: allWords, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_svg, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  const total = allWords?.length || 0;
  const withSVG = allWords?.filter(w => w.icon_svg && w.icon_svg.trim().length > 0).length || 0;
  const withoutSVG = total - withSVG;

  console.log('📊 Genesis 전체 통계:');
  console.log(`   총 단어: ${total}개`);
  console.log(`   ✅ SVG 있음: ${withSVG}개 (${(withSVG/total*100).toFixed(1)}%)`);
  console.log(`   ❌ SVG 없음: ${withoutSVG}개 (${(withoutSVG/total*100).toFixed(1)}%)`);

  // 2. 최근 업데이트된 단어 샘플 확인 (우리가 방금 수정한 것들)
  console.log('\n🔍 최근 수정한 단어 샘플 (10개):');
  const recentWords = allWords?.slice(0, 10);

  recentWords?.forEach((word: any, i) => {
    const hasSVG = !!(word.icon_svg && word.icon_svg.trim().length > 0);
    console.log(`\n${i+1}. ${word.hebrew} - ${word.meaning}`);
    console.log(`   icon_svg: ${hasSVG ? '✅ EXISTS' : '❌ NULL'}`);
    if (hasSVG) {
      console.log(`   길이: ${word.icon_svg.length} chars`);
      console.log(`   미리보기: ${word.icon_svg.substring(0, 100)}...`);
    }
  });

  // 3. 특정 단어 테스트 (우리가 개선한 단어)
  console.log('\n\n🎯 우리가 개선한 단어 확인:');
  const testWords = ['בִּרְקִיעַ', 'וּלְיָמִים', 'עוֹף', 'וַיּוֹלֶד'];

  for (const hebrew of testWords) {
    const { data } = await supabase
      .from('words')
      .select('hebrew, meaning, icon_svg')
      .eq('hebrew', hebrew)
      .limit(1)
      .single();

    if (data) {
      const hasSVG = !!(data.icon_svg && data.icon_svg.trim().length > 0);
      console.log(`\n${data.hebrew} - ${data.meaning}`);
      console.log(`   icon_svg: ${hasSVG ? '✅ EXISTS' : '❌ NULL'}`);
      if (hasSVG) {
        console.log(`   길이: ${data.icon_svg.length}`);
        const hasGradient = data.icon_svg.includes('gradient');
        const hasShadow = data.icon_svg.includes('drop-shadow');
        console.log(`   Gradient: ${hasGradient ? '✅' : '❌'}`);
        console.log(`   Shadow: ${hasShadow ? '✅' : '❌'}`);
      }
    }
  }

  // 4. useWords Hook과 동일한 쿼리 시뮬레이션
  console.log('\n\n🔄 useWords Hook 시뮬레이션:');
  const { data: hookData } = await supabase
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
    .limit(10);

  console.log(`\n조회된 데이터: ${hookData?.length || 0}개`);

  hookData?.forEach((item: any, i) => {
    const iconSvg = item.icon_svg;
    const hasSVG = !!(iconSvg && typeof iconSvg === 'string' && iconSvg.trim().length > 0);

    console.log(`\n${i+1}. ${item.hebrew} - ${item.meaning}`);
    console.log(`   DB의 icon_svg 타입: ${typeof iconSvg}`);
    console.log(`   DB의 icon_svg 값: ${hasSVG ? `"${iconSvg.substring(0, 50)}..."` : iconSvg}`);
    console.log(`   변환 후 iconSvg: ${iconSvg || 'undefined'}`);
    console.log(`   최종 판단: ${hasSVG ? '✅ SVG 렌더링 예상' : '❌ 기본 아이콘 예상'}`);
  });
}

checkActualSVGData().catch(console.error);
