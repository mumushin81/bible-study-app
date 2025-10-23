import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function extractSVG() {
  try {
    console.log('🔍 Genesis 1:1 데이터 추출 중...\n');

    // 1. Genesis 1:1 verse 가져오기 (한국어 reference 사용)
    const { data: verse, error: verseError } = await supabase
      .from('verses')
      .select('id, reference')
      .eq('reference', '창세기 1:1')
      .single();

    if (verseError || !verse) {
      console.error('❌ Verse 조회 실패:', verseError);
      return;
    }

    console.log(`✅ Verse 찾음: ${verse.reference} (ID: ${verse.id})\n`);

    // 2. 첫 번째 단어 "בְּרֵאשִׁית" 가져오기
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('hebrew, meaning, icon_svg, position')
      .eq('verse_id', verse.id)
      .order('position')
      .limit(1);

    if (wordsError || !words || words.length === 0) {
      console.error('❌ Words 조회 실패:', wordsError);
      return;
    }

    const word = words[0];
    console.log('📖 단어 정보:');
    console.log(`  - 히브리어: ${word.hebrew}`);
    console.log(`  - 의미: ${word.meaning}`);
    console.log(`  - 위치: ${word.position}\n`);

    // 3. SVG 데이터 분석
    const svg = word.icon_svg;

    if (!svg) {
      console.error('❌ SVG 데이터가 없습니다!');
      return;
    }

    // 4. SVG를 파일로 저장
    const outputPath = '/tmp/bereshit_svg.txt';
    fs.writeFileSync(outputPath, svg);
    console.log(`💾 SVG 저장 완료: ${outputPath}\n`);

    // 5. SVG 분석
    console.log('📊 SVG 데이터 분석:\n');
    console.log(`  길이: ${svg.length} 문자`);
    console.log(`\n  시작 부분 (100자):`);
    console.log(`  ${svg.substring(0, 100)}`);
    console.log(`\n  끝 부분 (100자):`);
    console.log(`  ${svg.substring(svg.length - 100)}\n`);

    // 6. SVG 형식 검증
    console.log('✅ SVG 형식 검증:\n');

    const hasSvgOpen = svg.includes('<svg');
    const hasSvgClose = svg.includes('</svg>');
    const startsWithSvg = svg.trim().startsWith('<svg');
    const endsWithSvg = svg.trim().endsWith('</svg>');

    console.log(`  <svg> 시작 태그: ${hasSvgOpen ? '✅ 있음' : '❌ 없음'}`);
    console.log(`  </svg> 종료 태그: ${hasSvgClose ? '✅ 있음' : '❌ 없음'}`);
    console.log(`  <svg>로 시작: ${startsWithSvg ? '✅' : '❌'}`);
    console.log(`  </svg>로 끝남: ${endsWithSvg ? '✅' : '❌'}\n`);

    // 7. SVG 요소 확인
    console.log('🎨 SVG 요소 확인:\n');

    const hasGradient = svg.includes('gradient');
    const hasPath = svg.includes('<path');
    const hasCircle = svg.includes('<circle');
    const hasRect = svg.includes('<rect');
    const hasDefs = svg.includes('<defs');

    console.log(`  gradient: ${hasGradient ? '✅ 있음' : '❌ 없음'}`);
    console.log(`  path: ${hasPath ? '✅ 있음' : '❌ 없음'}`);
    console.log(`  circle: ${hasCircle ? '✅ 있음' : '❌ 없음'}`);
    console.log(`  rect: ${hasRect ? '✅ 있음' : '❌ 없음'}`);
    console.log(`  defs: ${hasDefs ? '✅ 있음' : '❌ 없음'}\n`);

    // 8. ID 속성 분석 (충돌 가능성)
    const idMatches = svg.match(/id="([^"]+)"/g);
    const idCount = idMatches?.length || 0;

    console.log('🔑 ID 속성 분석:\n');
    console.log(`  ID 개수: ${idCount}개`);

    if (idMatches && idMatches.length > 0) {
      console.log(`  ID 목록:`);
      const ids = idMatches.slice(0, 10).map(m => m.match(/id="([^"]+)"/)?.[1]);
      ids.forEach(id => console.log(`    - ${id}`));
      if (idMatches.length > 10) {
        console.log(`    ... 외 ${idMatches.length - 10}개 더`);
      }
    }

    // 9. 잠재적 문제점 분석
    console.log('\n⚠️  잠재적 문제점:\n');

    const issues: string[] = [];

    if (!startsWithSvg || !endsWithSvg) {
      issues.push('SVG 태그가 올바르게 시작/종료되지 않음');
    }

    if (idCount > 0) {
      issues.push(`${idCount}개의 ID 속성 - 여러 SVG 렌더링 시 충돌 가능`);
    }

    if (!hasPath && !hasCircle && !hasRect) {
      issues.push('그래픽 요소(path/circle/rect)가 없음');
    }

    if (svg.includes('xmlns') && svg.match(/xmlns="[^"]*"/g)?.length! > 1) {
      issues.push('중복된 xmlns 선언');
    }

    if (issues.length === 0) {
      console.log('  ✅ 문제점 없음');
    } else {
      issues.forEach(issue => console.log(`  ⚠️  ${issue}`));
    }

    // 10. 요약
    console.log('\n📋 요약:\n');
    console.log(`  단어: ${word.hebrew} (${word.meaning})`);
    console.log(`  SVG 존재: ✅`);
    console.log(`  SVG 길이: ${svg.length} 문자`);
    console.log(`  형식 유효성: ${startsWithSvg && endsWithSvg ? '✅' : '❌'}`);
    console.log(`  ID 충돌 위험: ${idCount > 0 ? '⚠️  높음' : '✅ 낮음'}`);
    console.log(`  저장 경로: ${outputPath}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

extractSVG();
