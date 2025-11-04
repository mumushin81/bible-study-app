/**
 * 창세기 2장 단어 이미지 배치 생성 (FLUX 1.1 Pro)
 * 배치 단위로 나누어 생성하여 안정성 확보
 */

import * as fs from 'fs';
import * as path from 'path';
import Replicate from 'replicate';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 로드
config({ path: path.join(__dirname, '../../.env.local') });

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN || '',
});

interface WordInfo {
  hebrew: string;
  korean: string;
  meaning: string;
  ipa: string;
}

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

function createPrompt(word: WordInfo): string {
  // 구체적 비주얼 설명
  const visualPrompt = `Abstract visual representation of the Hebrew word "${word.hebrew}" meaning "${word.meaning}".
Symbolic, ethereal imagery representing biblical concept of ${word.meaning}.`;

  // 색상 지시 (새 규칙: 밝은 파스텔, 4-6가지 색상, 어두운 색상 금지)
  const colorPrompt = 'bright pastel colors, multi-colored with soft pink blue purple yellow orange, vibrant gradients, NO dark colors, NO black, NO dark gray, cheerful and hopeful atmosphere';

  // 레이아웃 지시 (9:16 비율, 하단 20% 공백)
  const layoutPrompt = '9:16 aspect ratio, bottom 20% empty space for text overlay, main content in upper 80%, centered composition';

  // 스타일
  const stylePrompt = 'clean composition, biblical art aesthetic, professional lighting, high quality, detailed, ethereal light, spiritual atmosphere';

  return `${visualPrompt} ${colorPrompt}, ${layoutPrompt}, ${stylePrompt}`;
}

async function generateImage(word: WordInfo, index: number, total: number): Promise<string | null> {
  const prompt = createPrompt(word);

  try {
    log.info(`[${index + 1}/${total}] ${word.hebrew} (${word.korean}) 생성 중...`);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro" as any,
      {
        input: {
          prompt,
          aspect_ratio: "9:16",
          output_format: "jpg",
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true
        }
      }
    );

    if (!output) {
      log.error(`  결과 없음`);
      return null;
    }

    // FileOutput 객체를 문자열로 변환
    const imageUrl = output.toString();

    log.success(`  완료: ${imageUrl.substring(0, 60)}...`);
    return imageUrl;

  } catch (error: any) {
    log.error(`  실패: ${error.message}`);
    return null;
  }
}

async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error: any) {
    log.error(`  다운로드 실패: ${error.message}`);
    return false;
  }
}

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

async function main() {
  // 명령줄 인자로 배치 번호 받기 (기본값: 1)
  const batchNumber = parseInt(process.argv[2] || '1');
  const batchSize = 20;
  const startIndex = (batchNumber - 1) * batchSize;
  const endIndex = startIndex + batchSize;

  log.step(`창세기 2장 이미지 생성 - 배치 ${batchNumber}`);

  // 1. 단어 목록 로드
  const wordsPath = path.join(__dirname, 'genesis2_unique_words.json');
  if (!fs.existsSync(wordsPath)) {
    log.error('genesis2_unique_words.json 파일이 없습니다.');
    log.info('먼저 npx tsx scripts/images/extractGenesis2Words.ts를 실행하세요.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  const allWords: WordInfo[] = data.words;
  const words = allWords.slice(startIndex, endIndex);

  log.info(`전체 단어: ${allWords.length}개`);
  log.info(`배치 ${batchNumber}: ${startIndex + 1}-${Math.min(endIndex, allWords.length)}번 단어 (${words.length}개)`);

  if (words.length === 0) {
    log.warn('이 배치에 생성할 단어가 없습니다.');
    return;
  }

  // 2. 출력 디렉토리 생성
  const outputDir = path.join(__dirname, '../../output/genesis2_images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 3. 이미지 생성
  const results: Array<{
    hebrew: string;
    korean: string;
    meaning: string;
    romanized: string;
    imageUrl: string | null;
    localPath: string | null;
  }> = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const romanized = koreanToRomanized(word.korean);
    const filename = `${romanized}.jpg`;
    const localPath = path.join(outputDir, filename);

    // 이미 있으면 스킵
    if (fs.existsSync(localPath)) {
      log.info(`[${i + 1}/${words.length}] ${word.hebrew} - 스킵 (이미 존재)`);
      results.push({
        hebrew: word.hebrew,
        korean: word.korean,
        meaning: word.meaning,
        romanized,
        imageUrl: 'existing',
        localPath: filename
      });
      continue;
    }

    // 이미지 생성
    const imageUrl = await generateImage(word, i, words.length);

    if (imageUrl) {
      // 다운로드
      const downloaded = await downloadImage(imageUrl, localPath);

      results.push({
        hebrew: word.hebrew,
        korean: word.korean,
        meaning: word.meaning,
        romanized,
        imageUrl: downloaded ? imageUrl : null,
        localPath: downloaded ? filename : null
      });
    } else {
      results.push({
        hebrew: word.hebrew,
        korean: word.korean,
        meaning: word.meaning,
        romanized,
        imageUrl: null,
        localPath: null
      });
    }

    // Rate limit (초당 1개)
    if (i < words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 4. 결과 저장
  const resultPath = path.join(__dirname, `genesis2_image_results_batch${batchNumber}.json`);
  fs.writeFileSync(resultPath, JSON.stringify({
    chapter: 2,
    batchNumber,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, allWords.length),
    totalWords: words.length,
    generated: results.filter(r => r.imageUrl && r.imageUrl !== 'existing').length,
    existing: results.filter(r => r.imageUrl === 'existing').length,
    failed: results.filter(r => !r.imageUrl).length,
    results
  }, null, 2), 'utf-8');

  log.step('완료');
  log.success(`생성 완료: ${results.filter(r => r.imageUrl && r.imageUrl !== 'existing').length}개`);
  log.info(`기존 파일: ${results.filter(r => r.imageUrl === 'existing').length}개`);
  log.error(`실패: ${results.filter(r => !r.imageUrl).length}개`);
  log.info(`결과: ${resultPath}`);

  // 다음 배치 안내
  if (endIndex < allWords.length) {
    log.step('💡 다음 배치');
    log.info(`npx tsx scripts/images/generateGenesis2Batch.ts ${batchNumber + 1}`);
  } else {
    log.step('🎉 모든 배치 완료!');
    log.info('다음 단계: npx tsx scripts/images/uploadGenesis2Images.ts');
  }
}

main();
