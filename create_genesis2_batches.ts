import { readFileSync, writeFileSync } from 'fs';

const genesis2Data = JSON.parse(readFileSync('genesis2_words.json', 'utf-8'));
const allWords = genesis2Data.words;

console.log(`📦 창세기 2장 ${allWords.length}개 단어를 10개 배치로 분할\n`);

const batchSize = Math.ceil(allWords.length / 10);

for (let i = 0; i < 10; i++) {
  const start = i * batchSize;
  const end = Math.min(start + batchSize, allWords.length);
  const batch = allWords.slice(start, end);

  if (batch.length > 0) {
    writeFileSync(`gen2_batch_${i + 1}.json`, JSON.stringify(batch, null, 2));
    console.log(`✅ gen2_batch_${i + 1}.json: ${batch.length}개 단어`);
  }
}

console.log(`\n✅ 총 10개 배치 파일 생성 완료`);
