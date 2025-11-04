/**
 * 기존 이미지를 다른 구절의 동일 단어에 자동 매핑
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
  [hebrew: string]: string; // hebrew -> imageUrl
}

function main() {
  log.step('기존 이미지 자동 매핑 시작');

  // 1. 창세기 1:1에서 이미지 URL 맵 생성
  const genesis1_1Path = path.join(__dirname, '../../data/generated_v2/genesis_1_1.json');
  const genesis1_1 = JSON.parse(fs.readFileSync(genesis1_1Path, 'utf-8'));

  const imageMap: WordImageMap = {};

  genesis1_1.words.forEach((word: any) => {
    if (word.flashcardImgUrl) {
      imageMap[word.hebrew] = word.flashcardImgUrl;
    }
  });

  log.success(`기준 이미지 맵 생성: ${Object.keys(imageMap).length}개`);

  // 2. 다른 구절에 자동 매핑
  let totalUpdated = 0;
  let totalVerses = 0;

  for (let verseNum = 2; verseNum <= 31; verseNum++) {
    const filePath = path.join(__dirname, `../../data/generated_v2/genesis_1_${verseNum}.json`);

    if (!fs.existsSync(filePath)) continue;

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let updatedInVerse = 0;
    let modified = false;

    content.words.forEach((word: any) => {
      // 이미지가 없고, 기존 맵에 존재하는 경우
      if (!word.flashcardImgUrl && imageMap[word.hebrew]) {
        word.flashcardImgUrl = imageMap[word.hebrew];
        updatedInVerse++;
        totalUpdated++;
        modified = true;
      }
    });

    // 변경사항이 있으면 파일 저장
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      totalVerses++;
      log.success(`1:${verseNum} - ${updatedInVerse}개 단어 매핑 완료`);
    }
  }

  log.step('완료');
  log.success(`총 ${totalVerses}개 구절에서 ${totalUpdated}개 단어 매핑 완료!`);

  // 3. 최종 통계
  log.step('📊 최종 통계');

  let totalWords = 0;
  let totalWithImages = 0;

  for (let verseNum = 1; verseNum <= 31; verseNum++) {
    const filePath = path.join(__dirname, `../../data/generated_v2/genesis_1_${verseNum}.json`);

    if (!fs.existsSync(filePath)) continue;

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const wordsWithImages = content.words.filter((w: any) => w.flashcardImgUrl).length;

    totalWords += content.words.length;
    totalWithImages += wordsWithImages;
  }

  log.info(`전체 단어: ${totalWords}개`);
  log.success(`이미지 있음: ${totalWithImages}개 (${((totalWithImages/totalWords)*100).toFixed(1)}%)`);
  log.warn(`이미지 없음: ${totalWords - totalWithImages}개 (${(((totalWords - totalWithImages)/totalWords)*100).toFixed(1)}%)`);

  log.step('💡 다음 단계');
  log.info('1. 데이터베이스에 업로드:');
  log.info('   npx tsx scripts/uploadGeneratedV2.ts');
  log.info('');
  log.info('2. 신규 단어 이미지 생성 (선택):');
  log.info(`   예상: ${totalWords - totalWithImages}개 단어`);
  log.info(`   비용: 약 $${((totalWords - totalWithImages) * 0.003).toFixed(2)}`);
}

main();
