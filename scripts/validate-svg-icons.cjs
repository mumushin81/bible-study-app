const fs = require('fs');
const path = require('path');

/**
 * SVG 아이콘 가이드라인 검증 스크립트
 *
 * 검증 항목:
 * 1. viewBox="0 0 64 64" 일관성
 * 2. xmlns 존재
 * 3. Gradient ID 중복 체크
 * 4. 파일 크기 (100-3000자)
 * 5. defs 태그 존재
 * 6. Gradient 사용
 * 7. Filter 효과 사용 (권장)
 */

// 검증할 파일 목록 (인자로 받거나 기본값)
const filesToValidate = process.argv[2]
  ? [process.argv[2]]
  : [
      'genesis_11_10-13.json',
      'genesis_11_14-17.json',
      'genesis_11_18-21.json',
      'genesis_11_22-25.json',
      'genesis_11_26-29.json',
      'genesis_11_30-32.json',
      'genesis_12_11-14.json',
      'genesis_12_15-18.json',
      'genesis_12_19-20.json',
      'genesis_13_5-9.json',
      'genesis_13_10-14.json',
      'genesis_13_15-18.json',
      'genesis_14_10-13.json',
      'genesis_14_14-17.json',
      'genesis_14_22-24.json',
      'genesis_15_1-4.json',
      'genesis_15_5-8.json',
      'genesis_15_9-12.json',
      'genesis_15_13-16.json',
      'genesis_15_17-21.json',
    ];

const errors = [];
const warnings = [];
const gradientIds = new Map(); // ID → 사용 위치 배열

let totalIcons = 0;
let passedIcons = 0;

console.log('🔍 SVG 아이콘 가이드라인 검증 시작...\n');

function validateSvg(svg, location) {
  const issues = {
    errors: [],
    warnings: []
  };

  // 1. viewBox 체크
  if (!svg.includes('viewBox="0 0 64 64"')) {
    if (svg.includes('viewBox=')) {
      const match = svg.match(/viewBox="([^"]+)"/);
      issues.errors.push(`잘못된 viewBox: ${match ? match[1] : '알 수 없음'} (권장: "0 0 64 64")`);
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
    issues.errors.push(`SVG 크기가 너무 작음 (${svg.length}자, 최소: 100자)`);
  } else if (svg.length > 3000) {
    issues.warnings.push(`SVG 크기가 큼 (${svg.length}자, 권장 최대: 3000자)`);
  }

  // 4. defs 태그 체크
  if (!svg.includes('<defs>')) {
    issues.warnings.push('defs 태그 미사용 (gradient 정의 권장)');
  }

  // 5. Gradient 사용 체크
  if (!svg.includes('Gradient')) {
    issues.warnings.push('Gradient 미사용 (입체감 권장)');
  }

  // 6. Filter 효과 체크
  if (!svg.includes('filter=')) {
    issues.warnings.push('Filter 효과 미사용 (drop-shadow 권장)');
  } else {
    // drop-shadow 형식 체크
    if (!svg.includes('drop-shadow')) {
      issues.warnings.push('filter가 있지만 drop-shadow가 아님');
    }
  }

  // 7. Gradient ID 추출 및 중복 체크
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

  // 8. 일반적인 Gradient ID 체크 (너무 일반적이면 충돌 가능)
  if (gradientMatches) {
    gradientMatches.forEach(match => {
      const id = match.match(/id="([^"]+)"/)[1];
      const genericIds = ['gradient1', 'gradient', 'grad1', 'g1', 'linear1', 'radial1'];
      if (genericIds.includes(id.toLowerCase())) {
        issues.warnings.push(`너무 일반적인 Gradient ID: "${id}" (충돌 가능성)`);
      }
    });
  }

  // 9. 색상 체크 (최소 1개 이상의 색상 사용)
  const colorMatches = svg.match(/#[0-9A-Fa-f]{6}/g);
  if (!colorMatches || colorMatches.length === 0) {
    issues.warnings.push('색상 코드 없음');
  }

  return issues;
}

filesToValidate.forEach(filename => {
  const filePath = path.join(__dirname, '../data/generated', filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  파일 없음: ${filename}`);
    return;
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  content.forEach((verse, vIndex) => {
    if (!verse.words) return;

    verse.words.forEach((word, wIndex) => {
      if (!word.iconSvg) {
        errors.push(`${filename} ${verse.verseId} word "${word.hebrew}": iconSvg 누락`);
        return;
      }

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
});

// Gradient ID 중복 체크
const duplicateGradients = [];
gradientIds.forEach((locations, id) => {
  if (locations.length > 1) {
    duplicateGradients.push({ id, locations });
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 검증 결과');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`총 아이콘 수: ${totalIcons}`);
console.log(`통과: ${passedIcons}/${totalIcons} (${(passedIcons/totalIcons*100).toFixed(1)}%)`);
console.log(`오류: ${errors.length}개`);
console.log(`경고: ${warnings.length}개`);
console.log(`중복 Gradient ID: ${duplicateGradients.length}개`);
console.log('');

if (errors.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚨 오류 (반드시 수정 필요)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  errors.slice(0, 20).forEach(err => console.log(err));
  if (errors.length > 20) {
    console.log(`... 그 외 ${errors.length - 20}개`);
  }
  console.log('');
}

if (warnings.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  경고 (권장사항)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  warnings.slice(0, 20).forEach(warn => console.log(warn));
  if (warnings.length > 20) {
    console.log(`... 그 외 ${warnings.length - 20}개`);
  }
  console.log('');
}

if (duplicateGradients.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  중복 Gradient ID (충돌 가능)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  duplicateGradients.slice(0, 10).forEach(({ id, locations }) => {
    console.log(`\n"${id}" (${locations.length}곳에서 사용):`);
    locations.slice(0, 3).forEach(loc => console.log(`   - ${loc}`));
    if (locations.length > 3) {
      console.log(`   ... 그 외 ${locations.length - 3}곳`);
    }
  });
  console.log('');
}

if (errors.length === 0 && warnings.length === 0 && duplicateGradients.length === 0) {
  console.log('✅ 모든 아이콘이 가이드라인을 준수합니다!');
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 권장사항:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (errors.length > 0) {
    console.log('1. 오류를 먼저 수정하세요');
  }
  if (warnings.length > 0) {
    console.log('2. 경고는 선택사항이지만 일관성을 위해 수정 권장');
  }
  if (duplicateGradients.length > 0) {
    console.log('3. Gradient ID를 고유하게 변경하세요 (예: "word-element-1")');
  }
  console.log('4. 자세한 가이드: docs/SVG_ICON_GUIDELINES.md');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

console.log('');

// Exit code
process.exit(errors.length > 0 ? 1 : 0);
