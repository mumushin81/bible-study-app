import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findDuplicateSVGsInVerse() {
  console.log('🔍 창세기 1:6 "있으라", "되라" 관련 단어 SVG 중복 검사...\n');

  // 창세기 1:6 단어들 조회
  const { data: words, error } = await supabase
    .from('words')
    .select(`
      id,
      hebrew,
      meaning,
      grammar,
      icon_svg,
      verses!inner (
        reference,
        book_id,
        chapter,
        verse_number
      )
    `)
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 6);

  if (error) {
    console.error('❌ 조회 에러:', error);
    return;
  }

  console.log(`📊 창세기 1:6 단어 개수: ${words?.length}개\n`);

  // SVG 내용별로 그룹화
  const svgGroups = new Map<string, Array<{
    id: string;
    hebrew: string;
    meaning: string;
    grammar: string;
  }>>();

  words?.forEach((word: any) => {
    const svg = word.icon_svg || '';
    if (!svgGroups.has(svg)) {
      svgGroups.set(svg, []);
    }
    svgGroups.get(svg)!.push({
      id: word.id,
      hebrew: word.hebrew,
      meaning: word.meaning,
      grammar: word.grammar,
    });
  });

  console.log('=' .repeat(70));
  console.log('📊 SVG 중복 분석 결과\n');

  // 중복된 SVG 찾기
  let duplicateCount = 0;
  let uniqueSVGCount = 0;

  svgGroups.forEach((wordList, svg) => {
    if (wordList.length > 1) {
      duplicateCount++;
      console.log(`\n🔴 중복 발견 (${wordList.length}개 단어가 동일한 SVG 사용):`);
      console.log(`   SVG 길이: ${svg.length}자`);
      console.log(`   SVG 미리보기: ${svg.substring(0, 120)}...`);
      console.log(`\n   동일 SVG를 사용하는 단어들:`);
      wordList.forEach((word, idx) => {
        console.log(`   ${idx + 1}. ${word.hebrew} - "${word.meaning}" (${word.grammar})`);
      });
    } else {
      uniqueSVGCount++;
    }
  });

  console.log('\n' + '=' .repeat(70));
  console.log('📈 요약:');
  console.log(`   총 단어 수: ${words?.length}개`);
  console.log(`   고유 SVG 수: ${svgGroups.size}개`);
  console.log(`   중복 SVG 패턴: ${duplicateCount}개`);
  console.log(`   고유 SVG 패턴: ${uniqueSVGCount}개`);
  console.log('=' .repeat(70));

  // "있으라", "되라" 관련 단어 특별 검사
  console.log('\n🎯 "있으라", "되라" 관련 단어 상세 분석:\n');

  const targetWords = words?.filter((w: any) =>
    w.meaning.includes('있') ||
    w.meaning.includes('되') ||
    w.meaning.includes('하라') ||
    w.hebrew.includes('יְהִי')
  );

  if (targetWords && targetWords.length > 0) {
    console.log(`찾은 관련 단어: ${targetWords.length}개\n`);

    targetWords.forEach((word: any, idx: number) => {
      console.log(`${idx + 1}. ${word.hebrew}`);
      console.log(`   의미: ${word.meaning}`);
      console.log(`   문법: ${word.grammar}`);
      console.log(`   SVG 길이: ${word.icon_svg?.length || 0}자`);

      // Gradient ID 추출
      const gradientIds = word.icon_svg?.match(/id="([^"]+)"/g) || [];
      console.log(`   Gradient IDs: ${gradientIds.map((m: string) => m.replace(/id="|"/g, '')).join(', ')}`);
      console.log(`   SVG: ${word.icon_svg?.substring(0, 150)}...\n`);
    });

    // 이들 사이의 중복 검사
    const targetSVGs = new Map<string, string[]>();
    targetWords.forEach((word: any) => {
      const svg = word.icon_svg || '';
      if (!targetSVGs.has(svg)) {
        targetSVGs.set(svg, []);
      }
      targetSVGs.get(svg)!.push(`${word.hebrew} (${word.meaning})`);
    });

    console.log('🔍 "있으라/되라" 관련 단어 간 중복:');
    let hasDuplicates = false;
    targetSVGs.forEach((wordList, svg) => {
      if (wordList.length > 1) {
        hasDuplicates = true;
        console.log(`\n❌ ${wordList.length}개 단어가 동일한 SVG 사용:`);
        wordList.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
      }
    });

    if (!hasDuplicates) {
      console.log('   ✅ "있으라/되라" 관련 단어 간에는 중복이 없습니다.');
    }
  } else {
    console.log('⚠️  "있으라", "되라" 관련 단어를 찾을 수 없습니다.');
  }

  // 중복 원인 분석
  console.log('\n' + '=' .repeat(70));
  console.log('🔎 중복 원인 분석:\n');

  if (duplicateCount > 0) {
    console.log('가능한 원인:');
    console.log('1. 동일한 의미를 가진 단어들이 같은 템플릿 사용');
    console.log('2. Gradient ID는 다르지만 템플릿 구조가 동일');
    console.log('3. 재생성 스크립트가 의미만 보고 동일한 SVG 생성');
    console.log('4. 타임스탬프 기반 ID지만 SVG 내용은 동일\n');

    // Gradient ID가 다른데 내용이 같은지 확인
    console.log('🔬 Gradient ID 비교:');
    let sameContentDiffId = 0;

    svgGroups.forEach((wordList, svg) => {
      if (wordList.length > 1) {
        // 이 그룹의 첫 번째 단어 SVG에서 ID만 다른지 확인
        const gradientIds = wordList.map((word) => {
          const fullWord = words?.find((w: any) => w.id === word.id);
          const ids = fullWord?.icon_svg?.match(/id="([^"]+)"/g) || [];
          return ids.map((m: string) => m.replace(/id="|"/g, ''));
        });

        const allSame = gradientIds.every((ids, i, arr) =>
          i === 0 || ids.join(',') === arr[0].join(',')
        );

        if (allSame) {
          sameContentDiffId++;
          console.log(`   ✅ 완전 동일 (Gradient ID까지): ${wordList.map(w => w.hebrew).join(', ')}`);
        } else {
          console.log(`   ⚠️  Gradient ID는 다름 (내용은 동일): ${wordList.map(w => w.hebrew).join(', ')}`);
        }
      }
    });
  } else {
    console.log('✅ 중복 없음 - 모든 단어가 고유한 SVG를 가지고 있습니다.');
  }
}

findDuplicateSVGsInVerse().catch(console.error);
