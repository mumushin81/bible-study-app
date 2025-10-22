const fs = require('fs');
const path = require('path');

/**
 * Genesis 1-15 전체 SVG 아이콘 검증 스크립트
 */

const errors = [];
const warnings = [];
const gradientIds = new Map();

let totalFiles = 0;
let totalIcons = 0;
let passedIcons = 0;

console.log('🔍 Genesis 1-15 전체 SVG 아이콘 검증 시작...\n');

function validateSvg(svg, location) {
  const issues = {
    errors: [],
    warnings: []
  };

  // 1. viewBox 체크
  if (!svg.includes('viewBox="0 0 64 64"')) {
    if (svg.includes('viewBox=')) {
      const match = svg.match(/viewBox="([^"]+)"/);
      issues.errors.push(`잘못된 viewBox: ${match ? match[1] : '알 수 없음'}`);
    } else {
      issues.errors.push('viewBox 속성 누락');
    }
  }

  // 2. xmlns 체크
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    issues.errors.push('xmlns 속성 누락');
  }

  // 3. 파일 크기 체크
  if (svg.length < 100) {
    issues.errors.push(`SVG 크기가 너무 작음 (${svg.length}자)`);
  } else if (svg.length > 3000) {
    issues.warnings.push(`SVG 크기가 큼 (${svg.length}자)`);
  }

  // 4. defs 태그 체크
  if (!svg.includes('<defs>')) {
    issues.warnings.push('defs 태그 미사용');
  }

  // 5. Gradient 사용 체크
  if (!svg.includes('Gradient')) {
    issues.warnings.push('Gradient 미사용');
  }

  // 6. Filter 효과 체크
  if (!svg.includes('filter=')) {
    issues.warnings.push('Filter 효과 미사용 (drop-shadow 권장)');
  } else if (!svg.includes('drop-shadow')) {
    issues.warnings.push('filter가 있지만 drop-shadow가 아님');
  }

  // 7. Gradient ID 추출
  const gradientMatches = svg.match(/id="([^"]*[Gg]radient[^"]*)"/g);
  if (gradientMatches) {
    gradientMatches.forEach(match => {
      const id = match.match(/id="([^"]+)"/)[1];
      if (gradientIds.has(id)) {
        gradientIds.get(id).push(location);
      } else {
        gradientIds.set(id, [location]);
      }
    });
  }

  return issues;
}

// Genesis 1-15 파일 찾기
const dataDir = path.join(__dirname, '../data/generated');
const allFiles = fs.readdirSync(dataDir);
const files = allFiles
  .filter(f => f.startsWith('genesis_') && f.endsWith('.json'))
  .filter(f => {
    const match = f.match(/genesis_(\d+)_/);
    return match && parseInt(match[1]) <= 15;
  });

console.log(`📁 발견된 파일: ${files.length}개\n`);

files.forEach((filename) => {
  const filePath = path.join(dataDir, filename);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // 배열 형식 체크
    if (!Array.isArray(data)) {
      console.log(`⚠️  ${filename}: 배열 형식이 아님 - 스킵`);
      return;
    }

    totalFiles++;

    data.forEach((verse) => {
      if (!verse.words) return;

      verse.words.forEach((word) => {
        if (!word.iconSvg) return;

        totalIcons++;
        const location = `${filename} > ${verse.verseId} > "${word.hebrew}"`;
        const issues = validateSvg(word.iconSvg, location);

        if (issues.errors.length === 0 && issues.warnings.length === 0) {
          passedIcons++;
        }

        issues.errors.forEach(err => {
          errors.push(`❌ ${location}: ${err}`);
        });

        issues.warnings.forEach(warn => {
          warnings.push(`⚠️  ${location}: ${warn}`);
        });
      });
    });

  } catch (error) {
    console.log(`❌ ${filename}: ${error.message}`);
  }
});

// Gradient ID 중복 체크
const duplicateGradients = [];
gradientIds.forEach((locations, id) => {
  if (locations.length > 1) {
    duplicateGradients.push({ id, locations });
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 검증 결과 (Genesis 1-15 전체)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`총 파일: ${totalFiles}개`);
console.log(`총 아이콘: ${totalIcons}개`);
console.log(`통과: ${passedIcons}/${totalIcons} (${(passedIcons/totalIcons*100).toFixed(1)}%)`);
console.log(`오류: ${errors.length}개`);
console.log(`경고: ${warnings.length}개`);
console.log(`중복 Gradient ID: ${duplicateGradients.length}개`);
console.log('');

if (errors.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚨 오류 (반드시 수정 필요)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  errors.slice(0, 30).forEach(err => console.log(err));
  if (errors.length > 30) {
    console.log(`... 그 외 ${errors.length - 30}개`);
  }
  console.log('');
}

if (warnings.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  경고 (권장사항)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  warnings.slice(0, 30).forEach(warn => console.log(warn));
  if (warnings.length > 30) {
    console.log(`... 그 외 ${warnings.length - 30}개`);
  }
  console.log('');
}

if (duplicateGradients.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  중복 Gradient ID');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  duplicateGradients.slice(0, 10).forEach(({ id, locations }) => {
    console.log(`\n"${id}" (${locations.length}곳):`);
    locations.slice(0, 3).forEach(loc => console.log(`   - ${loc}`));
    if (locations.length > 3) {
      console.log(`   ... 그 외 ${locations.length - 3}곳`);
    }
  });
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 모든 아이콘이 가이드라인을 준수합니다!');
  console.log('');
}

process.exit(errors.length > 0 ? 1 : 0);
