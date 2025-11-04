/**
 * 니쿠드(모음 기호) 제거 후 히브리어 매칭
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

// 니쿠드(히브리어 모음 기호) 제거
function removeNikud(text: string): string {
  // 니쿠드 유니코드 범위: U+0591 ~ U+05C7
  return text.replace(/[\u0591-\u05C7]/g, '').trim();
}

// 공백, 하이픈, 언더스코어 제거
function normalizeHebrew(text: string): string {
  return removeNikud(text).replace(/[\s\-_]/g, '');
}

function main() {
  log.step('니쿠드 제거 후 히브리어 매칭');

  // 1. JSON 데이터에서 히브리어 단어 추출
  const dataDir = path.join(__dirname, '../../data/generated_v2');
  const files = fs.readdirSync(dataDir).filter(f =>
    f.startsWith('genesis_1_') &&
    f.endsWith('.json') &&
    !f.includes('backup') &&
    !f.includes('improved')
  );

  const allWords = new Map<string, {
    hebrew: string;
    normalized: string;
    korean: string;
    ipa: string;
    meaning: string;
    verseId: string;
  }>();

  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
      const verseId = content.id || file.replace('.json', '');

      content.words?.forEach((word: any) => {
        if (word.hebrew) {
          const normalized = normalizeHebrew(word.hebrew);
          if (!allWords.has(normalized)) {
            allWords.set(normalized, {
              hebrew: word.hebrew,
              normalized,
              korean: word.korean || '',
              ipa: word.ipa || '',
              meaning: word.meaning || '',
              verseId
            });
          }
        }
      });
    } catch (error) {
      log.warn(`파일 읽기 실패: ${file}`);
    }
  }

  log.success(`${allWords.size}개 고유 히브리어 단어 추출 (정규화됨)`);

  // 2. 이미지 파일명 목록
  const imagesDir = path.join(__dirname, '../../public/images/words');
  const imageFiles = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.jpg') && f !== 'default_word_icon.jpg');

  log.info(`${imageFiles.length}개 이미지 파일`);

  // 3. 매칭 시도
  const matched: Array<{
    filename: string;
    filenameNormalized: string;
    hebrew: string;
    korean: string;
    ipa: string;
    meaning: string;
    verseId: string;
  }> = [];

  const unmatchedImages: string[] = [];

  for (const filename of imageFiles) {
    const hebrewFromFile = filename.replace('.jpg', '');
    const normalizedFile = normalizeHebrew(hebrewFromFile);

    if (allWords.has(normalizedFile)) {
      const wordInfo = allWords.get(normalizedFile)!;
      matched.push({
        filename,
        filenameNormalized: normalizedFile,
        hebrew: wordInfo.hebrew,
        korean: wordInfo.korean,
        ipa: wordInfo.ipa,
        meaning: wordInfo.meaning,
        verseId: wordInfo.verseId
      });
    } else {
      unmatchedImages.push(filename);
    }
  }

  log.success(`매칭 성공: ${matched.length}개`);
  log.warn(`매칭 실패: ${unmatchedImages.length}개`);

  // 4. 한글 발음 → 로마자 변환
  function koreanToRomanized(korean: string): string {
    const map: { [key: string]: string } = {
      'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
      'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
      'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
      'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
      'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
      'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
      'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
      'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui',
      'ㅣ': 'i'
    };

    let result = '';
    for (let i = 0; i < korean.length; i++) {
      const char = korean[i];
      const code = char.charCodeAt(0);

      if (code >= 0xAC00 && code <= 0xD7A3) {
        const syllableIndex = code - 0xAC00;
        const initialIndex = Math.floor(syllableIndex / 588);
        const medialIndex = Math.floor((syllableIndex % 588) / 28);
        const finalIndex = syllableIndex % 28;

        const initials = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
        const medials = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
        const finals = ['', 'k', 'kk', 'ks', 'n', 'nj', 'nh', 'd', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'];

        result += initials[initialIndex] + medials[medialIndex] + finals[finalIndex];
      } else {
        result += char;
      }
    }

    return result.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  // 5. 최종 매핑 생성
  const finalMappings = matched.map(m => ({
    hebrew: m.hebrew,
    filename: m.filename,
    korean: m.korean,
    ipa: m.ipa,
    meaning: m.meaning,
    verseId: m.verseId,
    romanized: koreanToRomanized(m.korean) || removeNikud(m.hebrew).toLowerCase(),
    supabaseFilename: `${koreanToRomanized(m.korean) || removeNikud(m.hebrew).toLowerCase()}.jpg`
  }));

  // 6. 결과 저장
  const outputPath = path.join(__dirname, 'matched-images-nikud.json');
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
  log.step('📋 매칭 샘플 (처음 15개)');
  finalMappings.slice(0, 15).forEach(m => {
    log.info(`${m.filename} → ${m.romanized}.jpg (${m.korean})`);
  });

  if (unmatchedImages.length > 0) {
    log.step(`⚠️  매칭 실패 파일 (총 ${unmatchedImages.length}개)`);
    unmatchedImages.slice(0, 10).forEach(f => {
      const normalized = normalizeHebrew(f.replace('.jpg', ''));
      log.warn(`${f} → ${normalized}`);
    });
    if (unmatchedImages.length > 10) {
      log.warn(`... 외 ${unmatchedImages.length - 10}개`);
    }
  }

  log.step('💡 다음 단계');
  log.info(`${matched.length}개 이미지를 Supabase에 업로드하시겠습니까?`);
  log.info('실행: npx tsx scripts/migration/uploadMatchedImages.ts');
}

main();
