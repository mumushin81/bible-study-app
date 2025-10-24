import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface DefaultPattern {
  pattern: string;
  description: string;
  count: number;
  examples: Array<{
    hebrew: string;
    meaning: string;
    grammar: string;
  }>;
}

async function findDefaultSVGs() {
  console.log('🔍 디폴트 SVG 패턴 검색 중...\n');

  // 전체 SVG 있는 단어 조회
  const { data: allWords, error } = await supabase
    .from('words')
    .select('hebrew, meaning, grammar, icon_svg')
    .not('icon_svg', 'is', null)
    .order('hebrew');

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  console.log(`📊 전체 SVG 있는 단어: ${allWords?.length || 0}개\n`);

  // 디폴트 패턴 정의
  const defaultPatterns: DefaultPattern[] = [];

  // 패턴 1: 문서 모양 (직사각형)
  const documentPattern = allWords?.filter(w =>
    w.icon_svg?.includes('<rect') &&
    w.icon_svg?.includes('rx="4"') &&
    !w.icon_svg?.includes('filter="drop-shadow"')
  ) || [];

  if (documentPattern.length > 0) {
    defaultPatterns.push({
      pattern: 'document-rectangle',
      description: '문서 모양 (직사각형)',
      count: documentPattern.length,
      examples: documentPattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || ''
      }))
    });
  }

  // 패턴 2: 기본 원형 (단순 circle만)
  const simpleCirclePattern = allWords?.filter(w => {
    const svg = w.icon_svg || '';
    const circleCount = (svg.match(/<circle/g) || []).length;
    const hasOtherShapes = svg.includes('<path') || svg.includes('<rect') ||
                           svg.includes('<polygon') || svg.includes('<ellipse');
    return circleCount === 1 && !hasOtherShapes && !svg.includes('<defs>');
  }) || [];

  if (simpleCirclePattern.length > 0) {
    defaultPatterns.push({
      pattern: 'simple-circle',
      description: '단순 원형 (circle만)',
      count: simpleCirclePattern.length,
      examples: simpleCirclePattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || ''
      }))
    });
  }

  // 패턴 3: gradient 없는 SVG
  const noGradientPattern = allWords?.filter(w =>
    w.icon_svg &&
    !w.icon_svg.includes('<defs>') &&
    !w.icon_svg.includes('gradient')
  ) || [];

  if (noGradientPattern.length > 0) {
    defaultPatterns.push({
      pattern: 'no-gradient',
      description: 'Gradient 없음 (가이드라인 미준수)',
      count: noGradientPattern.length,
      examples: noGradientPattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || ''
      }))
    });
  }

  // 패턴 4: drop-shadow 없는 SVG
  const noShadowPattern = allWords?.filter(w =>
    w.icon_svg &&
    !w.icon_svg.includes('drop-shadow')
  ) || [];

  if (noShadowPattern.length > 0) {
    defaultPatterns.push({
      pattern: 'no-shadow',
      description: 'Drop-shadow 없음 (가이드라인 미준수)',
      count: noShadowPattern.length,
      examples: noShadowPattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || ''
      }))
    });
  }

  // 패턴 5: 매우 단순한 SVG (shape 1개 이하)
  const verySimplePattern = allWords?.filter(w => {
    const svg = w.icon_svg || '';
    const shapeCount = (svg.match(/<(circle|rect|path|polygon|ellipse|line)/g) || []).length;
    return shapeCount <= 1;
  }) || [];

  if (verySimplePattern.length > 0) {
    defaultPatterns.push({
      pattern: 'very-simple',
      description: '매우 단순 (shape 1개 이하)',
      count: verySimplePattern.length,
      examples: verySimplePattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || ''
      }))
    });
  }

  // 패턴 6: 동일한 SVG 반복 사용
  const svgMap = new Map<string, Array<{hebrew: string, meaning: string, grammar: string}>>();
  allWords?.forEach(w => {
    if (w.icon_svg) {
      const normalized = w.icon_svg.replace(/id="[^"]+"/g, 'id="X"').replace(/url\(#[^)]+\)/g, 'url(#X)');
      if (!svgMap.has(normalized)) {
        svgMap.set(normalized, []);
      }
      svgMap.get(normalized)!.push({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || ''
      });
    }
  });

  const duplicateSVGs = Array.from(svgMap.entries())
    .filter(([_, words]) => words.length > 10) // 10번 이상 반복
    .sort((a, b) => b[1].length - a[1].length);

  if (duplicateSVGs.length > 0) {
    duplicateSVGs.forEach(([svg, words]) => {
      defaultPatterns.push({
        pattern: 'duplicate-svg',
        description: `동일 SVG 반복 사용 (${words.length}회)`,
        count: words.length,
        examples: words.slice(0, 5)
      });
    });
  }

  // 결과 출력
  console.log('=' .repeat(80));
  console.log('📋 디폴트 SVG 패턴 분석 결과');
  console.log('='.repeat(80));
  console.log();

  if (defaultPatterns.length === 0) {
    console.log('✅ 디폴트 패턴이 발견되지 않았습니다!');
    console.log('   모든 SVG가 커스터마이즈되어 있습니다.');
    return;
  }

  defaultPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern.description}`);
    console.log(`   패턴: ${pattern.pattern}`);
    console.log(`   개수: ${pattern.count}개`);
    console.log(`   예시:`);
    pattern.examples.forEach((ex, i) => {
      console.log(`     ${i + 1}) ${ex.hebrew} - ${ex.meaning} (${ex.grammar})`);
    });
    console.log();
  });

  // 통계 요약
  console.log('='.repeat(80));
  console.log('📊 통계 요약');
  console.log('='.repeat(80));
  console.log();

  const totalDefaults = defaultPatterns.reduce((sum, p) => {
    // duplicate-svg 패턴은 중복 계산 방지
    if (p.pattern === 'duplicate-svg') return sum;
    return sum + p.count;
  }, 0);

  const duplicateCount = defaultPatterns
    .filter(p => p.pattern === 'duplicate-svg')
    .reduce((sum, p) => sum + p.count, 0);

  console.log(`전체 SVG 단어: ${allWords?.length || 0}개`);
  console.log(`디폴트 패턴: ${totalDefaults}개 (${((totalDefaults / (allWords?.length || 1)) * 100).toFixed(1)}%)`);
  if (duplicateCount > 0) {
    console.log(`중복 SVG: ${duplicateCount}개`);
  }
  console.log();

  // 가이드라인 준수율
  const withGradient = allWords?.filter(w => w.icon_svg?.includes('gradient')).length || 0;
  const withShadow = allWords?.filter(w => w.icon_svg?.includes('drop-shadow')).length || 0;

  console.log('가이드라인 준수율:');
  console.log(`  Gradient 사용: ${withGradient}개 (${((withGradient / (allWords?.length || 1)) * 100).toFixed(1)}%)`);
  console.log(`  Drop-shadow 사용: ${withShadow}개 (${((withShadow / (allWords?.length || 1)) * 100).toFixed(1)}%)`);
  console.log();

  // CSV 출력
  console.log('='.repeat(80));
  console.log('📄 상세 리스트 (CSV 형식)');
  console.log('='.repeat(80));
  console.log();
  console.log('Pattern,Hebrew,Meaning,Grammar');

  defaultPatterns.forEach(pattern => {
    if (pattern.pattern !== 'duplicate-svg') {
      pattern.examples.forEach(ex => {
        console.log(`"${pattern.pattern}","${ex.hebrew}","${ex.meaning}","${ex.grammar}"`);
      });
    }
  });
}

findDefaultSVGs().catch(console.error);
