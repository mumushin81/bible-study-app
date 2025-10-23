const { execSync } = require('child_process');
const path = require('path');

const files = [
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

console.log('🚀 Genesis 11-15장 데이터 업로드 시작...\n');

let successCount = 0;
let errorCount = 0;

files.forEach((filename, index) => {
  const filePath = path.join('data', 'generated', filename);
  console.log(`[${index + 1}/${files.length}] 업로드 중: ${filename}`);

  try {
    execSync(`npm run save:content ${filePath} -- --force`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    successCount++;
    console.log(`✅ ${filename} 업로드 완료\n`);
  } catch (error) {
    errorCount++;
    console.error(`❌ ${filename} 업로드 실패\n`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 업로드 완료');
console.log('='.repeat(60));
console.log(`총 파일 수: ${files.length}`);
console.log(`성공: ${successCount}`);
console.log(`실패: ${errorCount}`);
console.log('='.repeat(60));

process.exit(errorCount > 0 ? 1 : 0);
