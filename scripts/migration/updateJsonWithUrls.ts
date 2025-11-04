/**
 * upload-results.json을 사용하여
 * data/generated_v2/*.json 파일의 flashcardImgUrl 자동 업데이트
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

// 니쿠드 제거
function removeNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').trim();
}

function normalizeHebrew(text: string): string {
  return removeNikud(text).replace(/[\s\-_]/g, '');
}

async function main() {
  log.step('JSON 파일 자동 업데이트 시작');

  // 1. 업로드 결과 로드
  const uploadResultsPath = path.join(__dirname, 'upload-results.json');
  if (!fs.existsSync(uploadResultsPath)) {
    log.warn('upload-results.json 파일이 없습니다. uploadMatchedImages.ts를 먼저 실행하세요.');
    process.exit(1);
  }

  const uploadResults = JSON.parse(fs.readFileSync(uploadResultsPath, 'utf-8'));
  const results = uploadResults.uploadResults;

  log.info(`${results.length}개 이미지 URL 로드됨`);

  // 2. 히브리어 → URL 매핑 생성
  const hebrewToUrl = new Map<string, string>();
  results.forEach((item: any) => {
    const normalized = normalizeHebrew(item.hebrew);
    hebrewToUrl.set(normalized, item.url);
  });

  log.success(`${hebrewToUrl.size}개 매핑 생성`);

  // 3. JSON 파일 업데이트
  const dataDir = path.join(__dirname, '../../data/generated_v2');
  const files = fs.readdirSync(dataDir).filter(f =>
    f.startsWith('genesis_1_') &&
    f.endsWith('.json') &&
    !f.includes('backup') &&
    !f.includes('improved')
  );

  log.step(`${files.length}개 JSON 파일 처리 중...`);

  let totalWords = 0;
  let updatedWords = 0;
  let alreadyHasUrl = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let fileUpdated = false;

    content.words?.forEach((word: any) => {
      totalWords++;

      if (!word.hebrew) {
        return;
      }

      // 이미 URL이 있는 경우
      if (word.flashcardImgUrl) {
        alreadyHasUrl++;
        return;
      }

      const normalized = normalizeHebrew(word.hebrew);
      if (hebrewToUrl.has(normalized)) {
        word.flashcardImgUrl = hebrewToUrl.get(normalized);
        updatedWords++;
        fileUpdated = true;
      }
    });

    if (fileUpdated) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      log.success(`${file} 업데이트 완료`);
    }
  }

  log.step('JSON 업데이트 완료');
  log.info(`총 단어: ${totalWords}개`);
  log.success(`새로 추가된 URL: ${updatedWords}개`);
  log.info(`기존 URL 유지: ${alreadyHasUrl}개`);

  // 4. 통계 저장
  const statsPath = path.join(__dirname, 'update-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify({
    totalWords,
    updatedWords,
    alreadyHasUrl,
    coverage: `${(((updatedWords + alreadyHasUrl) / totalWords) * 100).toFixed(1)}%`,
    timestamp: new Date().toISOString()
  }, null, 2), 'utf-8');

  log.step('💡 다음 단계');
  log.info('데이터베이스 동기화: npx tsx scripts/uploadGeneratedV2.ts');
}

main();
