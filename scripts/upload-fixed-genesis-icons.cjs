const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * SVG 아이콘 수정된 파일들을 Supabase에 업로드
 */

// 수정된 파일 목록 (fix-svg-icons.cjs 출력 기반)
const modifiedFiles = [
  'genesis_11_14-17.json',
  'genesis_11_30-32.json',
  'genesis_13_10-14.json',
  'genesis_14_14-17.json',
  'genesis_15_1-4.json',
  'genesis_4_1-3.json',
  'genesis_4_12-13.json',
  'genesis_4_14-16.json',
  'genesis_4_17-19.json',
  'genesis_4_23-24.json',
  'genesis_4_25-26.json',
  'genesis_4_4-5.json',
  'genesis_4_6-7.json',
  'genesis_4_8-9.json',
];

console.log('📤 수정된 SVG 아이콘 파일 업로드 시작...\n');
console.log(`총 ${modifiedFiles.length}개 파일 업로드\n`);

let successCount = 0;
let failedCount = 0;
const failedFiles = [];

modifiedFiles.forEach((filename, index) => {
  const filePath = path.join(__dirname, '../data/generated', filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ [${index + 1}/${modifiedFiles.length}] ${filename}: 파일 없음`);
    failedCount++;
    failedFiles.push({ filename, reason: '파일 없음' });
    return;
  }

  try {
    console.log(`⏳ [${index + 1}/${modifiedFiles.length}] ${filename} 업로드 중...`);

    execSync(`npm run save:content "${filePath}" -- --force`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log(`✅ [${index + 1}/${modifiedFiles.length}] ${filename}: 업로드 완료\n`);
    successCount++;

  } catch (error) {
    console.log(`❌ [${index + 1}/${modifiedFiles.length}] ${filename}: 업로드 실패`);
    console.log(`   오류: ${error.message}\n`);
    failedCount++;
    failedFiles.push({ filename, reason: error.message });
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 업로드 완료');
console.log('='.repeat(60));
console.log(`✅ 성공: ${successCount}/${modifiedFiles.length}개`);
console.log(`❌ 실패: ${failedCount}/${modifiedFiles.length}개`);

if (failedFiles.length > 0) {
  console.log('\n실패 파일:');
  failedFiles.forEach(({ filename, reason }) => {
    console.log(`   - ${filename}: ${reason}`);
  });
}

console.log('='.repeat(60));
console.log('');

process.exit(failedCount > 0 ? 1 : 0);
