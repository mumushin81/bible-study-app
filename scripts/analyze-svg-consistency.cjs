const fs = require('fs');
const path = require('path');

// Genesis 11-15 샘플 파일들
const sampleFiles = [
  'genesis_11_10-13.json',
  'genesis_12_11-14.json',
  'genesis_13_5-9.json',
  'genesis_14_10-13.json',
  'genesis_15_1-4.json',
];

console.log('🔍 SVG 아이콘 일관성 분석...\n');

const issues = [];
const patterns = {
  hasViewBox: 0,
  hasDefs: 0,
  hasGradient: 0,
  hasFilter: 0,
  sizes: new Set(),
  gradientIds: [],
  filterTypes: new Set(),
  colorSchemes: [],
};

let totalIcons = 0;
let totalWords = 0;

sampleFiles.forEach(filename => {
  const filePath = path.join(__dirname, '../data/generated', filename);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  content.forEach((verse, vIndex) => {
    if (!verse.words) return;

    verse.words.forEach((word, wIndex) => {
      totalWords++;

      if (!word.iconSvg) {
        issues.push(`${filename} verse ${vIndex + 1} word ${wIndex + 1}: Missing iconSvg`);
        return;
      }

      totalIcons++;
      const svg = word.iconSvg;

      // viewBox 체크
      if (svg.includes('viewBox=')) {
        patterns.hasViewBox++;
        const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
        if (viewBoxMatch) {
          patterns.sizes.add(viewBoxMatch[1]);
        }
      } else {
        issues.push(`${filename} ${verse.verseId} word "${word.hebrew}": No viewBox`);
      }

      // defs 체크
      if (svg.includes('<defs>')) {
        patterns.hasDefs++;
      }

      // gradient 체크
      if (svg.includes('Gradient')) {
        patterns.hasGradient++;
        const gradientMatches = svg.match(/id="([^"]*[Gg]radient[^"]*)"/g);
        if (gradientMatches) {
          gradientMatches.forEach(match => {
            const id = match.match(/id="([^"]+)"/)[1];
            patterns.gradientIds.push(id);
          });
        }
      }

      // filter 체크
      if (svg.includes('filter=')) {
        patterns.hasFilter++;
        const filterMatches = svg.match(/drop-shadow\([^)]+\)/g);
        if (filterMatches) {
          filterMatches.forEach(f => patterns.filterTypes.add(f));
        }
      }

      // 색상 체크
      const colorMatches = svg.match(/#[0-9A-Fa-f]{6}/g);
      if (colorMatches) {
        patterns.colorSchemes.push(...colorMatches);
      }

      // 일반적인 문제들 체크
      if (!svg.includes('xmlns=')) {
        issues.push(`${filename} ${verse.verseId} word "${word.hebrew}": Missing xmlns`);
      }

      if (svg.length < 100) {
        issues.push(`${filename} ${verse.verseId} word "${word.hebrew}": SVG too short (${svg.length} chars)`);
      }

      if (svg.length > 3000) {
        issues.push(`${filename} ${verse.verseId} word "${word.hebrew}": SVG too long (${svg.length} chars)`);
      }
    });
  });
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 SVG 패턴 분석 결과');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`총 단어 수: ${totalWords}`);
console.log(`총 아이콘 수: ${totalIcons}`);
console.log(`viewBox 사용: ${patterns.hasViewBox}/${totalIcons} (${(patterns.hasViewBox/totalIcons*100).toFixed(1)}%)`);
console.log(`defs 사용: ${patterns.hasDefs}/${totalIcons} (${(patterns.hasDefs/totalIcons*100).toFixed(1)}%)`);
console.log(`gradient 사용: ${patterns.hasGradient}/${totalIcons} (${(patterns.hasGradient/totalIcons*100).toFixed(1)}%)`);
console.log(`filter 사용: ${patterns.hasFilter}/${totalIcons} (${(patterns.hasFilter/totalIcons*100).toFixed(1)}%)`);
console.log('');

console.log('📐 ViewBox 크기:');
patterns.sizes.forEach(size => console.log(`   - ${size}`));
console.log('');

// 가장 많이 사용된 색상 Top 10
const colorCounts = {};
patterns.colorSchemes.forEach(color => {
  colorCounts[color] = (colorCounts[color] || 0) + 1;
});
const topColors = Object.entries(colorCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log('🎨 자주 사용된 색상 Top 10:');
topColors.forEach(([color, count]) => {
  console.log(`   ${color}: ${count}회`);
});
console.log('');

// Gradient ID 중복 체크
const gradientIdCounts = {};
patterns.gradientIds.forEach(id => {
  gradientIdCounts[id] = (gradientIdCounts[id] || 0) + 1;
});
const duplicateGradientIds = Object.entries(gradientIdCounts)
  .filter(([_, count]) => count > 1)
  .sort((a, b) => b[1] - a[1]);

if (duplicateGradientIds.length > 0) {
  console.log('⚠️  중복된 Gradient ID (같은 ID를 여러 아이콘에서 사용):');
  duplicateGradientIds.slice(0, 10).forEach(([id, count]) => {
    console.log(`   ${id}: ${count}개 아이콘에서 사용`);
  });
  console.log('');
}

if (issues.length > 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⚠️  발견된 문제: ${issues.length}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  issues.slice(0, 20).forEach(issue => console.log(`   - ${issue}`));
  if (issues.length > 20) {
    console.log(`   ... 그 외 ${issues.length - 20}개`);
  }
} else {
  console.log('✅ 심각한 문제 없음');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
