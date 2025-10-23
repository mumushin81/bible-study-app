import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SVGValidationResult {
  word: string;
  meaning: string;
  isValid: boolean;
  issues: string[];
  details: {
    hasXmlns: boolean;
    hasViewBox: boolean;
    elementCount: number;
    gradientCount: number;
    pathCount: number;
    circleCount: number;
    rectCount: number;
    lineCount: number;
    ellipseCount: number;
  };
}

function validateSVG(svg: string, word: string, meaning: string): SVGValidationResult {
  const issues: string[] = [];

  // 기본 구조 검증
  if (!svg.trim().startsWith('<svg')) {
    issues.push('SVG가 <svg> 태그로 시작하지 않음');
  }

  if (!svg.trim().endsWith('</svg>')) {
    issues.push('SVG가 </svg> 태그로 끝나지 않음');
  }

  // xmlns 확인
  const hasXmlns = svg.includes('xmlns="http://www.w3.org/2000/svg"');
  if (!hasXmlns) {
    issues.push('xmlns 속성 누락');
  }

  // viewBox 확인
  const hasViewBox = svg.includes('viewBox=');
  if (!hasViewBox) {
    issues.push('viewBox 속성 누락');
  }

  // 태그 짝 확인
  const openTags = svg.match(/<(\w+)[\s>]/g) || [];
  const closeTags = svg.match(/<\/(\w+)>/g) || [];

  // Self-closing 태그 제외
  const selfClosingCount = (svg.match(/\/>/g) || []).length;

  // 요소 개수 세기
  const gradientCount = (svg.match(/<(radial|linear)Gradient/g) || []).length;
  const pathCount = (svg.match(/<path/g) || []).length;
  const circleCount = (svg.match(/<circle/g) || []).length;
  const rectCount = (svg.match(/<rect/g) || []).length;
  const lineCount = (svg.match(/<line/g) || []).length;
  const ellipseCount = (svg.match(/<ellipse/g) || []).length;

  const elementCount = pathCount + circleCount + rectCount + lineCount + ellipseCount;

  if (elementCount === 0) {
    issues.push('그래픽 요소가 없음 (path, circle, rect, line, ellipse)');
  }

  // 잘못된 문자 확인
  if (svg.includes('undefined') || svg.includes('null')) {
    issues.push('SVG에 undefined/null 값 포함');
  }

  // 색상 형식 확인
  const colors = svg.match(/(fill|stroke)="[^"]*"/g) || [];
  const invalidColors = colors.filter(c =>
    !c.includes('url(') &&
    !c.includes('#') &&
    !c.includes('rgb') &&
    !c.includes('none') &&
    c.split('="')[1] !== '"'
  );

  if (invalidColors.length > 0) {
    issues.push(`잘못된 색상 형식: ${invalidColors.slice(0, 2).join(', ')}`);
  }

  // XML 형식 오류 체크 (간단한 검증)
  const unclosedTags = svg.match(/<[^/>]+>(?![^<]*<\/)/g) || [];
  const suspiciousUnclosed = unclosedTags.filter(tag =>
    !tag.includes('<svg') &&
    !tag.includes('<defs') &&
    !tag.includes('<g') &&
    !tag.includes('<radialGradient') &&
    !tag.includes('<linearGradient')
  );

  return {
    word,
    meaning,
    isValid: issues.length === 0,
    issues,
    details: {
      hasXmlns,
      hasViewBox,
      elementCount,
      gradientCount,
      pathCount,
      circleCount,
      rectCount,
      lineCount,
      ellipseCount,
    },
  };
}

async function validateAllSVGs() {
  console.log('🔍 SVG XML 형식 검증 시작...\n');

  // Genesis 1:1 verse 가져오기
  const { data: verse, error: verseError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('reference', '창세기 1:1')
    .single();

  if (verseError || !verse) {
    console.error('❌ Verse 조회 실패:', verseError);
    return;
  }

  // 모든 단어 가져오기
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg, position')
    .eq('verse_id', verse.id)
    .order('position');

  if (wordsError || !words) {
    console.error('❌ Words 조회 실패:', wordsError);
    return;
  }

  console.log(`📖 ${verse.reference}: ${words.length}개 단어 검증 중...\n`);

  const results: SVGValidationResult[] = [];

  words.forEach((word, index) => {
    const svg = word.icon_svg;
    if (!svg) {
      console.log(`${index + 1}. ${word.hebrew} - ❌ SVG 없음\n`);
      return;
    }

    const result = validateSVG(svg, word.hebrew, word.meaning);
    results.push(result);

    const status = result.isValid ? '✅' : '❌';
    console.log(`${index + 1}. ${word.hebrew} (${word.meaning}) ${status}`);
    console.log(`   xmlns: ${result.details.hasXmlns ? '✅' : '❌'}`);
    console.log(`   viewBox: ${result.details.hasViewBox ? '✅' : '❌'}`);
    console.log(`   요소: ${result.details.elementCount}개 (` +
      `path: ${result.details.pathCount}, ` +
      `circle: ${result.details.circleCount}, ` +
      `rect: ${result.details.rectCount}, ` +
      `line: ${result.details.lineCount}, ` +
      `ellipse: ${result.details.ellipseCount})`);
    console.log(`   gradient: ${result.details.gradientCount}개`);

    if (result.issues.length > 0) {
      console.log(`   ⚠️  문제점:`);
      result.issues.forEach(issue => console.log(`      - ${issue}`));
    }
    console.log();
  });

  // 최종 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 검증 결과 요약');
  console.log('='.repeat(60) + '\n');

  const validCount = results.filter(r => r.isValid).length;
  const invalidCount = results.filter(r => !r.isValid).length;

  console.log(`총 검증: ${results.length}개`);
  console.log(`✅ 유효: ${validCount}개`);
  console.log(`❌ 문제 있음: ${invalidCount}개\n`);

  if (invalidCount > 0) {
    console.log('⚠️  문제가 있는 단어:');
    results
      .filter(r => !r.isValid)
      .forEach(r => {
        console.log(`  - ${r.word}: ${r.issues.join(', ')}`);
      });
  }

  // 통계
  const totalElements = results.reduce((sum, r) => sum + r.details.elementCount, 0);
  const totalGradients = results.reduce((sum, r) => sum + r.details.gradientCount, 0);

  console.log('\n📈 전체 통계:');
  console.log(`  총 그래픽 요소: ${totalElements}개`);
  console.log(`  총 gradient: ${totalGradients}개`);
  console.log(`  평균 요소/단어: ${(totalElements / results.length).toFixed(1)}개`);

  console.log('\n✅ 모든 검증 완료!');
}

validateAllSVGs();
