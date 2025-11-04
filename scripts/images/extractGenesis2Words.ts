/**
 * 창세기 2장 고유 단어 추출 (중복 제거, 히브리어 기준)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WordInfo {
  hebrew: string;
  korean: string;
  meaning: string;
  ipa: string;
}

function main() {
  console.log('🔍 창세기 2장 고유 단어 추출\n');

  const uniqueWords = new Map<string, WordInfo>();

  // 1-25절 모두 처리
  for (let verse = 1; verse <= 25; verse++) {
    const filePath = path.join(__dirname, `../../data/generated_v2/genesis_2_${verse}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  genesis_2_${verse}.json 없음`);
      continue;
    }

    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      content.words?.forEach((word: any) => {
        if (!word.hebrew) return;

        // 니쿠드 제거 후 정규화 (중복 판단용)
        const normalized = word.hebrew
          .replace(/[\u0591-\u05C7]/g, '')
          .replace(/[\s\-_]/g, '');

        if (!uniqueWords.has(normalized)) {
          uniqueWords.set(normalized, {
            hebrew: word.hebrew,
            korean: word.korean || '',
            meaning: word.meaning || '',
            ipa: word.ipa || ''
          });
        }
      });
    } catch (error: any) {
      console.log(`❌ genesis_2_${verse}.json 읽기 실패: ${error.message}`);
    }
  }

  console.log(`\n✅ 총 ${uniqueWords.size}개 고유 단어 발견\n`);

  // 결과 저장
  const words = Array.from(uniqueWords.values());
  const outputPath = path.join(__dirname, 'genesis2_unique_words.json');

  fs.writeFileSync(outputPath, JSON.stringify({
    chapter: 2,
    totalWords: words.length,
    words: words
  }, null, 2), 'utf-8');

  console.log(`📝 저장 완료: ${outputPath}\n`);

  // 샘플 출력
  console.log('📋 샘플 단어 (처음 10개):\n');
  words.slice(0, 10).forEach((w, idx) => {
    console.log(`${idx + 1}. ${w.hebrew} (${w.korean}) - ${w.meaning}`);
  });

  console.log(`\n💡 다음 단계:`);
  console.log(`   npx tsx scripts/images/generateGenesis2Images.ts`);
}

main();
