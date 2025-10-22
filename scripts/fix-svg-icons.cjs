const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * SVG 아이콘 자동 수정 스크립트
 *
 * 수정 항목:
 * 1. drop-shadow 효과 추가
 * 2. viewBox 수정
 * 3. xmlns 추가
 * 4. Gradient ID 개선
 */

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

console.log('🔧 SVG 아이콘 자동 수정 시작...\n');
if (DRY_RUN) {
  console.log('⚠️  DRY RUN 모드 - 실제로 파일을 수정하지 않습니다\n');
}

let totalFiles = 0;
let totalIcons = 0;
let fixedIcons = 0;
const fixes = [];

// Genesis 1-15 파일 목록 가져오기 (Windows 호환)
const dataDir = path.join(__dirname, '../data/generated');
const allFiles = fs.readdirSync(dataDir);
const files = allFiles
  .filter(f => f.startsWith('genesis_') && f.endsWith('.json'))
  .filter(f => {
    const match = f.match(/genesis_(\d+)_/);
    return match && parseInt(match[1]) <= 15;
  })
  .map(f => path.join(dataDir, f));

console.log(`📁 발견된 파일: ${files.length}개\n`);

function generateUniqueGradientId(baseWord, element, num) {
  // 히브리어를 영어로 변환 (간단한 버전)
  const cleaned = baseWord.replace(/[^a-zA-Z0-9]/g, '');
  return `${cleaned || 'word'}-${element}-${num}`;
}

function addDropShadow(svg) {
  // 이미 filter가 있으면 스킵
  if (svg.includes('filter="drop-shadow')) {
    return svg;
  }

  // 주요 요소에 drop-shadow 추가
  const elements = ['circle', 'rect', 'path', 'polygon', 'ellipse'];

  for (const elem of elements) {
    // fill이 있는 요소 찾기
    const regex = new RegExp(`<${elem}([^>]*fill="[^"]*"[^>]*)>`, 'g');
    const matches = [...svg.matchAll(regex)];

    if (matches.length > 0) {
      // 첫 번째 메인 요소에 drop-shadow 추가
      const match = matches[0];
      const attrs = match[1];

      // 이미 filter가 있으면 스킵
      if (attrs.includes('filter=')) {
        continue;
      }

      const replacement = `<${elem}${attrs} filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))">`;
      svg = svg.replace(match[0], replacement);
      break;
    }
  }

  return svg;
}

function fixViewBox(svg) {
  if (svg.includes('viewBox="0 0 64 64"')) {
    return svg;
  }

  if (!svg.includes('viewBox=')) {
    // viewBox 추가
    svg = svg.replace('<svg', '<svg viewBox="0 0 64 64"');
  } else {
    // viewBox 수정
    svg = svg.replace(/viewBox="[^"]*"/, 'viewBox="0 0 64 64"');
  }

  return svg;
}

function ensureXmlns(svg) {
  if (svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return svg;
  }

  svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  return svg;
}

function improveGradientIds(svg, verseId, wordIndex) {
  // 일반적인 ID 패턴 찾기
  const genericIds = ['gradient1', 'gradient', 'grad1', 'g1', 'linear1', 'radial1'];

  genericIds.forEach((genericId, idx) => {
    const regex = new RegExp(`id="${genericId}"`, 'g');
    if (svg.match(regex)) {
      const uniqueId = `${verseId}-w${wordIndex}-${idx}`;
      svg = svg.replace(regex, `id="${uniqueId}"`);
      svg = svg.replace(new RegExp(`url\\(#${genericId}\\)`, 'g'), `url(#${uniqueId})`);
    }
  });

  return svg;
}

function fixSvgIcon(svg, verseId, wordIndex) {
  let modified = false;
  const original = svg;

  // 1. viewBox 수정
  const fixed1 = fixViewBox(svg);
  if (fixed1 !== svg) {
    modified = true;
    if (VERBOSE) fixes.push(`${verseId} word ${wordIndex}: viewBox 수정`);
  }
  svg = fixed1;

  // 2. xmlns 추가
  const fixed2 = ensureXmlns(svg);
  if (fixed2 !== svg) {
    modified = true;
    if (VERBOSE) fixes.push(`${verseId} word ${wordIndex}: xmlns 추가`);
  }
  svg = fixed2;

  // 3. drop-shadow 추가
  const fixed3 = addDropShadow(svg);
  if (fixed3 !== svg) {
    modified = true;
    fixes.push(`${verseId} word ${wordIndex}: drop-shadow 추가`);
  }
  svg = fixed3;

  // 4. Gradient ID 개선
  const fixed4 = improveGradientIds(svg, verseId, wordIndex);
  if (fixed4 !== svg) {
    modified = true;
    if (VERBOSE) fixes.push(`${verseId} word ${wordIndex}: Gradient ID 개선`);
  }
  svg = fixed4;

  return { svg, modified };
}

// 파일 처리
files.forEach((filePath, fileIndex) => {
  const filename = path.basename(filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    let fileModified = false;

    totalFiles++;

    data.forEach((verse, vIndex) => {
      if (!verse.words) return;

      verse.words.forEach((word, wIndex) => {
        if (!word.iconSvg) return;

        totalIcons++;

        const { svg, modified } = fixSvgIcon(word.iconSvg, verse.verseId, wIndex);

        if (modified) {
          word.iconSvg = svg;
          fileModified = true;
          fixedIcons++;
        }
      });
    });

    // 파일 저장
    if (fileModified && !DRY_RUN) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ ${filename}: 수정 완료`);
    } else if (fileModified) {
      console.log(`📝 ${filename}: 수정 필요 (dry-run)`);
    }

  } catch (error) {
    console.error(`❌ ${filename}: 오류 - ${error.message}`);
  }

  // 진행률 표시
  if ((fileIndex + 1) % 10 === 0) {
    console.log(`\n진행: ${fileIndex + 1}/${files.length} 파일 처리 중...\n`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 수정 완료');
console.log('='.repeat(60));
console.log(`총 파일: ${totalFiles}개`);
console.log(`총 아이콘: ${totalIcons}개`);
console.log(`수정된 아이콘: ${fixedIcons}개 (${(fixedIcons/totalIcons*100).toFixed(1)}%)`);

if (fixes.length > 0) {
  console.log(`\n수정 내역: ${fixes.length}개`);
  if (fixes.length <= 50) {
    fixes.forEach(fix => console.log(`   - ${fix}`));
  } else {
    fixes.slice(0, 30).forEach(fix => console.log(`   - ${fix}`));
    console.log(`   ... 그 외 ${fixes.length - 30}개`);
  }
}

console.log('='.repeat(60));

if (DRY_RUN) {
  console.log('\n⚠️  실제 수정하려면 --dry-run 옵션 없이 실행하세요');
  console.log('   node scripts/fix-svg-icons.cjs\n');
}

console.log('');
