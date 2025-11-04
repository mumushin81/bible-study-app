/**
 * public/images/words/ 폴더의 히브리어 파일명으로부터
 * 로마자 변환 맵 자동 생성
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

// JSON 데이터에서 실제 사용된 히브리어-로마자 매핑 추출
function extractMappingsFromJson(): Map<string, string> {
  const mappings = new Map<string, string>();

  const dataDir = path.join(__dirname, '../../data/generated_v2');

  // 모든 genesis JSON 파일 읽기
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith('genesis_1_') && f.endsWith('.json'));

  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));

      content.words?.forEach((word: any) => {
        const hebrew = word.hebrew;
        const korean = word.korean; // 한글 발음

        if (hebrew && korean) {
          // 한글 발음을 로마자로 변환 (간단한 규칙)
          const romanized = koreanToRomanized(korean);
          mappings.set(hebrew, romanized);
        }
      });
    } catch (error) {
      // 파일 읽기 실패는 무시
    }
  }

  return mappings;
}

// 한글 발음 → 로마자 변환
function koreanToRomanized(korean: string): string {
  // 한글 발음을 로마자로 변환하는 간단한 규칙
  const map: { [key: string]: string } = {
    // 자음
    'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
    'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
    'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
    'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',

    // 모음
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

    // 한글 음절인 경우 (가-힣)
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

  // 특수문자 제거 및 소문자 변환
  return result.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function main() {
  log.step('히브리어 → 로마자 변환 맵 생성');

  // 1. JSON 데이터에서 매핑 추출
  const mappings = extractMappingsFromJson();
  log.success(`${mappings.size}개 고유 단어 발견`);

  // 2. public/images/words/ 파일명 확인
  const imagesDir = path.join(__dirname, '../../public/images/words');
  const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));

  log.info(`${imageFiles.length}개 이미지 파일 발견`);

  // 3. 매핑 가능한 파일 찾기
  let matchedCount = 0;
  let unmatchedFiles: string[] = [];

  const finalMappings: { hebrew: string; romanized: string; filename: string }[] = [];

  for (const filename of imageFiles) {
    const hebrew = filename.replace('.jpg', '');

    if (mappings.has(hebrew)) {
      const romanized = mappings.get(hebrew)!;
      finalMappings.push({ hebrew, romanized, filename });
      matchedCount++;
    } else {
      unmatchedFiles.push(filename);
    }
  }

  log.success(`매핑 성공: ${matchedCount}개`);
  log.warn(`매핑 실패: ${unmatchedFiles.length}개`);

  // 4. 결과 저장
  const outputPath = path.join(__dirname, 'hebrew-romanized-map.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    matched: finalMappings,
    unmatched: unmatchedFiles,
    summary: {
      totalImages: imageFiles.length,
      matched: matchedCount,
      unmatched: unmatchedFiles.length
    }
  }, null, 2), 'utf-8');

  log.step('완료');
  log.success(`매핑 파일 생성: ${outputPath}`);

  // 5. 샘플 출력
  log.step('📋 매핑 샘플 (처음 10개)');
  finalMappings.slice(0, 10).forEach(m => {
    log.info(`${m.hebrew} → ${m.romanized}.jpg`);
  });

  if (unmatchedFiles.length > 0) {
    log.step('⚠️  매핑 실패 파일 (처음 10개)');
    unmatchedFiles.slice(0, 10).forEach(f => {
      log.warn(f);
    });
  }

  log.step('💡 다음 단계');
  log.info('1. 매핑 결과 확인: hebrew-romanized-map.json');
  log.info('2. 이미지 업로드 실행:');
  log.info('   npx tsx scripts/migration/uploadLocalImagesToSupabase.ts');
}

main();
