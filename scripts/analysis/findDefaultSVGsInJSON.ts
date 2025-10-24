import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const generatedDir = path.join(process.cwd(), 'data', 'generated');

interface DefaultPattern {
  pattern: string;
  description: string;
  count: number;
  examples: Array<{
    hebrew: string;
    meaning: string;
    grammar: string;
    file: string;
  }>;
}

interface Word {
  hebrew: string;
  meaning: string;
  grammar?: string;
  iconSvg?: string;
}

async function analyzeJSONDefaultSVGs() {
  console.log('🔍 JSON 파일에서 디폴트 SVG 패턴 검색 중...\n');

  const files = glob.sync(`${generatedDir}/*.json`);
  console.log(`📁 발견된 JSON 파일: ${files.length}개\n`);

  const allWords: Array<Word & { file: string }> = [];

  // 모든 JSON 파일에서 단어 수집
  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const fileName = path.basename(file);

      for (const verse of content) {
        if (verse.words) {
          for (const word of verse.words) {
            if (word.iconSvg) {
              allWords.push({
                ...word,
                file: fileName
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Skipping invalid JSON: ${path.basename(file)}`);
    }
  }

  console.log(`📊 SVG가 있는 단어: ${allWords.length}개\n`);

  const defaultPatterns: DefaultPattern[] = [];

  // 패턴 1: 문서 모양
  const documentPattern = allWords.filter(w =>
    w.iconSvg?.includes('<rect') &&
    w.iconSvg?.includes('rx="4"') &&
    !w.iconSvg?.includes('filter="drop-shadow"')
  );

  if (documentPattern.length > 0) {
    defaultPatterns.push({
      pattern: 'document-rectangle',
      description: '문서 모양 (직사각형)',
      count: documentPattern.length,
      examples: documentPattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || '',
        file: w.file
      }))
    });
  }

  // 패턴 2: 단순 원형
  const simpleCirclePattern = allWords.filter(w => {
    const svg = w.iconSvg || '';
    const circleCount = (svg.match(/<circle/g) || []).length;
    const hasOtherShapes = svg.includes('<path') || svg.includes('<rect') ||
                           svg.includes('<polygon') || svg.includes('<ellipse');
    return circleCount === 1 && !hasOtherShapes && !svg.includes('<defs>');
  });

  if (simpleCirclePattern.length > 0) {
    defaultPatterns.push({
      pattern: 'simple-circle',
      description: '단순 원형 (circle만)',
      count: simpleCirclePattern.length,
      examples: simpleCirclePattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || '',
        file: w.file
      }))
    });
  }

  // 패턴 3: Gradient 없음
  const noGradientPattern = allWords.filter(w =>
    w.iconSvg &&
    !w.iconSvg.includes('<defs>') &&
    !w.iconSvg.includes('gradient')
  );

  if (noGradientPattern.length > 0) {
    defaultPatterns.push({
      pattern: 'no-gradient',
      description: 'Gradient 없음 (가이드라인 미준수)',
      count: noGradientPattern.length,
      examples: noGradientPattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || '',
        file: w.file
      }))
    });
  }

  // 패턴 4: Drop-shadow 없음
  const noShadowPattern = allWords.filter(w =>
    w.iconSvg &&
    !w.iconSvg.includes('drop-shadow')
  );

  if (noShadowPattern.length > 0) {
    defaultPatterns.push({
      pattern: 'no-shadow',
      description: 'Drop-shadow 없음 (가이드라인 미준수)',
      count: noShadowPattern.length,
      examples: noShadowPattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || '',
        file: w.file
      }))
    });
  }

  // 패턴 5: 매우 단순
  const verySimplePattern = allWords.filter(w => {
    const svg = w.iconSvg || '';
    const shapeCount = (svg.match(/<(circle|rect|path|polygon|ellipse|line)/g) || []).length;
    return shapeCount <= 1;
  });

  if (verySimplePattern.length > 0) {
    defaultPatterns.push({
      pattern: 'very-simple',
      description: '매우 단순 (shape 1개 이하)',
      count: verySimplePattern.length,
      examples: verySimplePattern.slice(0, 5).map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || '',
        file: w.file
      }))
    });
  }

  // 패턴 6: 동일한 SVG 반복
  const svgMap = new Map<string, Array<{hebrew: string, meaning: string, grammar: string, file: string}>>();
  allWords.forEach(w => {
    if (w.iconSvg) {
      const normalized = w.iconSvg.replace(/id="[^"]+"/g, 'id="X"').replace(/url\(#[^)]+\)/g, 'url(#X)');
      if (!svgMap.has(normalized)) {
        svgMap.set(normalized, []);
      }
      svgMap.get(normalized)!.push({
        hebrew: w.hebrew,
        meaning: w.meaning || '',
        grammar: w.grammar || '',
        file: w.file
      });
    }
  });

  const duplicateSVGs = Array.from(svgMap.entries())
    .filter(([_, words]) => words.length > 5)
    .sort((a, b) => b[1].length - a[1].length);

  console.log('='.repeat(80));
  console.log('📋 JSON 파일 디폴트 SVG 패턴 분석 결과');
  console.log('='.repeat(80));
  console.log();

  if (defaultPatterns.length === 0 && duplicateSVGs.length === 0) {
    console.log('✅ 디폴트 패턴이 발견되지 않았습니다!');
    return;
  }

  defaultPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern.description}`);
    console.log(`   패턴: ${pattern.pattern}`);
    console.log(`   개수: ${pattern.count}개`);
    console.log(`   예시:`);
    pattern.examples.forEach((ex, i) => {
      console.log(`     ${i + 1}) ${ex.hebrew} - ${ex.meaning} (${ex.grammar})`);
      console.log(`        파일: ${ex.file}`);
    });
    console.log();
  });

  if (duplicateSVGs.length > 0) {
    console.log(`${defaultPatterns.length + 1}. 동일 SVG 반복 사용`);
    console.log(`   패턴: duplicate-svg`);
    console.log(`   발견된 중복 패턴: ${duplicateSVGs.length}개`);
    console.log();

    duplicateSVGs.slice(0, 3).forEach((dup, idx) => {
      const [svg, words] = dup;
      console.log(`   중복 #${idx + 1}: ${words.length}회 반복`);
      console.log(`   예시:`);
      words.slice(0, 3).forEach((w, i) => {
        console.log(`     ${i + 1}) ${w.hebrew} - ${w.meaning} (${w.file})`);
      });
      console.log();
    });
  }

  // 통계
  console.log('='.repeat(80));
  console.log('📊 통계 요약');
  console.log('='.repeat(80));
  console.log();

  const totalDefaults = defaultPatterns.reduce((sum, p) => sum + p.count, 0);
  const duplicateCount = duplicateSVGs.reduce((sum, [_, words]) => sum + words.length, 0);

  console.log(`전체 SVG 단어: ${allWords.length}개`);
  console.log(`디폴트 패턴: ${totalDefaults}개 (${((totalDefaults / allWords.length) * 100).toFixed(1)}%)`);
  if (duplicateCount > 0) {
    console.log(`중복 SVG 단어: ${duplicateCount}개 (${((duplicateCount / allWords.length) * 100).toFixed(1)}%)`);
  }
  console.log();

  const withGradient = allWords.filter(w => w.iconSvg?.includes('gradient')).length;
  const withShadow = allWords.filter(w => w.iconSvg?.includes('drop-shadow')).length;

  console.log('가이드라인 준수율:');
  console.log(`  Gradient 사용: ${withGradient}개 (${((withGradient / allWords.length) * 100).toFixed(1)}%)`);
  console.log(`  Drop-shadow 사용: ${withShadow}개 (${((withShadow / allWords.length) * 100).toFixed(1)}%)`);
}

analyzeJSONDefaultSVGs().catch(console.error);
