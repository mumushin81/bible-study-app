import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('genesis3_words.json', 'utf-8'));
const words = data.words;

console.log(`📦 창세기 3장 ${words.length}개 단어를 배치로 나누는 중...\n`);

const BATCH_SIZE = 20;
const batches = [];

for (let i = 0; i < words.length; i += BATCH_SIZE) {
  batches.push(words.slice(i, i + BATCH_SIZE));
}

console.log(`총 ${batches.length}개 배치 생성\n`);

batches.forEach((batch, index) => {
  const batchNum = index + 1;
  const filename = `gen3_batch_${batchNum}.json`;

  const output = {
    batch: batchNum,
    count: batch.length,
    words: batch
  };

  writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`✅ ${filename}: ${batch.length}개 단어`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 총 ${batches.length}개 배치 파일 생성 완료`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
