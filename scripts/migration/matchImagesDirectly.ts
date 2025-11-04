/**
 * JSON 데이터의 히브리어 단어와 파일명 직접 매칭
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

function main() {
  log.step('JSON 데이터와 이미지 파일 직접 매칭');

  // 1. 모든 JSON에서 히브리어 단어 추출
  const dataDir = path.join(__dirname, '../../data/generated_v2');
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith('genesis_1_') && f.endsWith('.json') && !f.includes('backup') && !f.includes('improved'));

  const allWords = new Map<string, { korean: string; ipa: string; meaning: string }>();

  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
      content.words?.forEach((word: any) => {
        if (word.hebrew && !allWords.has(word.hebrew)) {
          allWords.set(word.hebrew, {
            korean: word.korean || '',
            ipa: word.ipa || '',
            meaning: word.meaning || ''
          });
        }
      });
    } catch (error) {
      // 무시
    }
  }

  log.success(`${allWords.size}개 고유 히브리어 단어 추출`);

  // 2. 이미지 파일명 목록
  const imagesDir = path.join(__dirname, '../../public/images/words');
  const imageFiles = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.jpg') && f !== 'default_word_icon.jpg');

  log.info(`${imageFiles.length}개 이미지 파일`);

  // 3. 직접 매칭 (파일명이 히브리어인 경우)
  const matched: Array<{ hebrew: string; filename: string; korean: string; ipa: string }> = [];
  const unmatchedImages: string[] = [];

  for (const filename of imageFiles) {
    const hebrew = filename.replace('.jpg', '');

    if (allWords.has(hebrew)) {
      const wordInfo = allWords.get(hebrew)!;
      matched.push({
        hebrew,
        filename,
        korean: wordInfo.korean,
        ipa: wordInfo.ipa
      });
    } else {
      unmatchedImages.push(filename);
    }
  }

  log.success(`직접 매칭 성공: ${matched.length}개`);
  log.warn(`매칭 실패: ${unmatchedImages.length}개`);

  // 4. 로마자 변환 함수
  function hebrewToRomanized(hebrew: string, korean: string, ipa: string): string {
    // IPA를 기반으로 로마자 생성 (간단화)
    if (ipa) {
      return ipa
        .replace(/[ʔˈˌ]/g, '')
        .replace(/ə/g, 'e')
        .replace(/ɛ/g, 'e')
        .replace(/ʃ/g, 'sh')
        .replace(/ʒ/g, 'zh')
        .replace(/χ/g, 'ch')
        .replace(/[^a-zA-Z]/g, '')
        .toLowerCase()
        .slice(0, 20); // 최대 20자
    }

    // 한글 발음 사용
    return korean.replace(/\s/g, '').toLowerCase().slice(0, 15);
  }

  // 5. 최종 매핑 생성
  const finalMappings = matched.map(m => ({
    hebrew: m.hebrew,
    filename: m.filename,
    korean: m.korean,
    ipa: m.ipa,
    romanized: hebrewToRomanized(m.hebrew, m.korean, m.ipa)
  }));

  // 6. 결과 저장
  const outputPath = path.join(__dirname, 'image-mappings.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    matched: finalMappings,
    unmatchedImages,
    summary: {
      totalImages: imageFiles.length,
      matched: matched.length,
      unmatched: unmatchedImages.length,
      matchRate: `${((matched.length / imageFiles.length) * 100).toFixed(1)}%`
    }
  }, null, 2), 'utf-8');

  log.step('완료');
  log.success(`매핑 파일 생성: ${outputPath}`);

  // 7. 샘플 출력
  log.step('📋 매핑 샘플 (처음 15개)');
  finalMappings.slice(0, 15).forEach(m => {
    log.info(`${m.hebrew} (${m.korean}) → ${m.romanized}.jpg`);
  });

  if (unmatchedImages.length > 0) {
    log.step(`⚠️  매칭 실패 파일 (총 ${unmatchedImages.length}개)`);
    unmatchedImages.slice(0, 10).forEach(f => {
      log.warn(f);
    });
    if (unmatchedImages.length > 10) {
      log.warn(`... 외 ${unmatchedImages.length - 10}개`);
    }
  }

  log.step('💡 다음 단계');
  log.info(`${matched.length}개 이미지를 Supabase에 업로드하시겠습니까?`);
  log.info('실행: npx tsx scripts/migration/uploadMappedImages.ts');
}

main();
