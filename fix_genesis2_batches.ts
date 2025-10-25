import { readFileSync, writeFileSync } from 'fs';

// Fix batches 2-10 to use Korean meaning as keys
for (let batchNum = 2; batchNum <= 10; batchNum++) {
  try {
    const batchData = JSON.parse(
      readFileSync(`svg_gen2_batch_${batchNum}.json`, 'utf-8')
    );

    // Check if it's an array
    if (Array.isArray(batchData)) {
      const fixed: Record<string, string> = {};

      for (const item of batchData) {
        if (item.meaning && item.svg) {
          fixed[item.meaning] = item.svg;
        }
      }

      writeFileSync(
        `svg_gen2_batch_${batchNum}.json`,
        JSON.stringify(fixed, null, 2)
      );

      console.log(`✅ Batch ${batchNum}: ${Object.keys(fixed).length}개 변환`);
    } else {
      console.log(`⚠️  Batch ${batchNum}: 이미 올바른 형식`);
    }
  } catch (err) {
    console.error(`❌ Batch ${batchNum} 실패:`, err);
  }
}

console.log('\n✨ 모든 배치 변환 완료!');
