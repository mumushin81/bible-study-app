/**
 * 창세기 2장 단어 이미지 생성 테스트 (첫 3개만)
 */

import * as fs from 'fs';
import * as path from 'path';
import Replicate from 'replicate';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 로드 (프로젝트 루트에서)
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

async function generateImage(word: WordInfo, index: number): Promise<string | null> {
  const prompt = createPrompt(word);

  try {
    log.info(`[${index + 1}/3] ${word.hebrew} (${word.korean}) 생성 중...`);
    log.info(`프롬프트: ${prompt.substring(0, 100)}...`);

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

    // FileOutput 객체를 문자열로 변환
    const imageUrl = output.toString();

    log.success(`  완료: ${imageUrl}`);
    return imageUrl;

  } catch (error: any) {
    log.error(`  실패: ${error.message}`);
    if (error.response) {
      log.error(`  응답: ${JSON.stringify(error.response, null, 2)}`);
    }
    return null;
  }
}

async function main() {
  log.step('창세기 2장 이미지 생성 테스트 (첫 3개)');

  // 1. 단어 목록 로드
  const wordsPath = path.join(__dirname, 'genesis2_unique_words.json');
  if (!fs.existsSync(wordsPath)) {
    log.error('genesis2_unique_words.json 파일이 없습니다.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  const words: WordInfo[] = data.words.slice(0, 3); // 첫 3개만

  log.info(`테스트 단어: ${words.length}개`);
  words.forEach((w, i) => {
    log.info(`  ${i + 1}. ${w.hebrew} (${w.korean}) - ${w.meaning}`);
  });

  // 2. 이미지 생성
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    log.step(`단어 ${i + 1}/3: ${word.hebrew}`);
    const imageUrl = await generateImage(word, i);

    if (imageUrl) {
      log.success(`이미지 URL: ${imageUrl}`);
    } else {
      log.error(`생성 실패`);
    }

    // Rate limit (초당 1개)
    if (i < words.length - 1) {
      log.info('다음 단어까지 2초 대기...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  log.step('테스트 완료');
}

main();
