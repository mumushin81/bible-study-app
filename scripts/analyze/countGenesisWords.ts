/**
 * 창세기 1장 전체 단어 수 및 이미지 상태 분석
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

interface VerseAnalysis {
  verseNumber: number;
  wordCount: number;
  wordsWithImages: number;
  wordsWithoutImages: number;
  words: {hebrew: string; hasImage: boolean}[];
}

function analyzeVerse(verseNumber: number): VerseAnalysis | null {
  const filePath = path.join(__dirname, `../../data/generated_v2/genesis_1_${verseNumber}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const words = content.words || [];

    const wordsWithImages = words.filter((w: any) => w.flashcardImgUrl).length;
    const wordsWithoutImages = words.length - wordsWithImages;

    return {
      verseNumber,
      wordCount: words.length,
      wordsWithImages,
      wordsWithoutImages,
      words: words.map((w: any) => ({
        hebrew: w.hebrew,
        hasImage: !!w.flashcardImgUrl
      }))
    };
  } catch (error) {
    return null;
  }
}

function main() {
  log.step('창세기 1장 단어 분석');

  const analyses: VerseAnalysis[] = [];

  // 창세기 1장은 31절까지
  for (let i = 1; i <= 31; i++) {
    const analysis = analyzeVerse(i);
    if (analysis) {
      analyses.push(analysis);
    }
  }

  // 통계
  const totalWords = analyses.reduce((sum, a) => sum + a.wordCount, 0);
  const totalWithImages = analyses.reduce((sum, a) => sum + a.wordsWithImages, 0);
  const totalWithoutImages = analyses.reduce((sum, a) => sum + a.wordsWithoutImages, 0);

  log.step('📊 전체 통계');
  log.info(`총 구절 수: ${analyses.length}절`);
  log.info(`총 단어 수: ${totalWords}개`);
  log.success(`이미지 있음: ${totalWithImages}개 (${((totalWithImages/totalWords)*100).toFixed(1)}%)`);
  log.warn(`이미지 없음: ${totalWithoutImages}개 (${((totalWithoutImages/totalWords)*100).toFixed(1)}%)`);

  log.step('📋 구절별 상세');
  analyses.slice(0, 10).forEach(a => {
    const status = a.wordsWithImages === a.wordCount ? '✅' :
                   a.wordsWithImages > 0 ? '⚠️' : '❌';
    log.info(`${status} 1:${a.verseNumber} - ${a.wordCount}개 단어 (이미지: ${a.wordsWithImages}/${a.wordCount})`);
  });

  if (analyses.length > 10) {
    log.info(`... 외 ${analyses.length - 10}개 구절`);
  }

  // 이미지 없는 단어 샘플
  log.step('🎨 이미지 필요한 단어 (샘플)');
  let sampleCount = 0;
  for (const analysis of analyses) {
    const wordsNeedingImages = analysis.words.filter(w => !w.hasImage);
    if (wordsNeedingImages.length > 0 && sampleCount < 20) {
      wordsNeedingImages.slice(0, 3).forEach(w => {
        log.warn(`1:${analysis.verseNumber} - ${w.hebrew}`);
        sampleCount++;
      });
    }
    if (sampleCount >= 20) break;
  }

  log.step('🎯 다음 단계');
  if (totalWithoutImages > 0) {
    log.info(`${totalWithoutImages}개 단어의 이미지를 생성해야 합니다.`);
    log.info('일괄 생성 스크립트를 실행하시겠습니까?');
  } else {
    log.success('모든 단어에 이미지가 있습니다!');
  }
}

main();
