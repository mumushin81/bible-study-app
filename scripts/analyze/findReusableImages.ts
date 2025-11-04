/**
 * 기존 이미지를 재사용할 수 있는 단어 찾기
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

interface WordImageMap {
  [hebrew: string]: {
    imageUrl: string;
    usedInVerses: number[];
  };
}

function main() {
  log.step('기존 이미지 재사용 분석');

  // 1. 창세기 1:1에서 이미지가 있는 단어 추출
  const genesis1_1Path = path.join(__dirname, '../../data/generated_v2/genesis_1_1.json');
  const genesis1_1 = JSON.parse(fs.readFileSync(genesis1_1Path, 'utf-8'));

  const existingImages: WordImageMap = {};

  genesis1_1.words.forEach((word: any) => {
    if (word.flashcardImgUrl) {
      existingImages[word.hebrew] = {
        imageUrl: word.flashcardImgUrl,
        usedInVerses: [1]
      };
    }
  });

  log.success(`이미지가 있는 단어: ${Object.keys(existingImages).length}개`);
  Object.keys(existingImages).forEach(hebrew => {
    log.info(`  ${hebrew}: ${existingImages[hebrew].imageUrl.split('/').pop()}`);
  });

  // 2. 다른 구절에서 동일 단어 찾기
  let totalReusable = 0;
  let totalWords = 0;
  const reusableByVerse: {[verse: number]: number} = {};

  for (let verseNum = 2; verseNum <= 31; verseNum++) {
    const filePath = path.join(__dirname, `../../data/generated_v2/genesis_1_${verseNum}.json`);

    if (!fs.existsSync(filePath)) continue;

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let reusableInVerse = 0;

    content.words.forEach((word: any) => {
      totalWords++;
      if (existingImages[word.hebrew]) {
        existingImages[word.hebrew].usedInVerses.push(verseNum);
        reusableInVerse++;
        totalReusable++;
      }
    });

    if (reusableInVerse > 0) {
      reusableByVerse[verseNum] = reusableInVerse;
    }
  }

  log.step('📊 재사용 통계');
  log.success(`재사용 가능: ${totalReusable}개 (${((totalReusable/totalWords)*100).toFixed(1)}%)`);
  log.warn(`신규 생성 필요: ${totalWords - totalReusable}개 (${(((totalWords - totalReusable)/totalWords)*100).toFixed(1)}%)`);

  log.step('🔄 단어별 재사용 횟수');
  const sortedWords = Object.entries(existingImages)
    .sort((a, b) => b[1].usedInVerses.length - a[1].usedInVerses.length);

  sortedWords.forEach(([hebrew, data]) => {
    const count = data.usedInVerses.length;
    const verses = data.usedInVerses.slice(0, 5).join(', ');
    const more = data.usedInVerses.length > 5 ? ` 외 ${data.usedInVerses.length - 5}회` : '';
    log.info(`${hebrew}: ${count}회 (1:${verses}${more})`);
  });

  log.step('📋 구절별 재사용 가능 단어 수');
  Object.entries(reusableByVerse)
    .slice(0, 10)
    .forEach(([verse, count]) => {
      log.info(`1:${verse} - ${count}개 단어 재사용 가능`);
    });

  log.step('💡 다음 단계');
  log.info('1. 기존 이미지를 다른 구절에 자동 매핑');
  log.info('2. 신규 단어만 이미지 생성');
  log.info(`   예상: ${totalWords - totalReusable}개 단어`);
  log.info(`   비용: 약 $${((totalWords - totalReusable) * 0.003).toFixed(2)}`);
}

main();
