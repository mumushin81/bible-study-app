/**
 * 개선된 프롬프트 V2 테스트 - 더 예술적, 해부학적 오류 방지
 */

import * as fs from 'fs';
import * as path from 'path';
import Replicate from 'replicate';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../../.env.local') });

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN || '',
});

interface WordInfo {
  hebrew: string;
  korean: string;
  meaning: string;
}

interface GenerationPrompt {
  prompt: string;
  negativePrompt: string;
}

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

function createPrompt(word: WordInfo): GenerationPrompt {
  const conceptPrompt = `Symbolic, narrative illustration of the Hebrew word "${word.hebrew}" meaning "${word.meaning}". Convey ${word.meaning} through luminous metaphors, sacred motifs, and biblically inspired scenery so the idea is readable at a glance. Favor emblematic objects, light, flora, and celestial elements instead of literal human anatomy; if figures appear, render them as distant silhouettes with no visible faces or hands.`;

  const colorPrompt = 'bright pastel palette with soft pink, sky blue, lavender, golden peach, and mint green; luminous gradients; NO dark colors, NO black, NO dark gray; hopeful, uplifting spiritual glow';

  const compositionPrompt = 'vertical 9:16 layout; primary subject occupies the upper 80%; lower 20% remains softly lit negative space for future text overlay; centered, harmonious framing with gentle depth';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred atmosphere, painterly brushstrokes, soft focus edges, watercolor textures, diffuse glow, gentle light bloom';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. Absolutely no written characters within the scene.`;

  const negativePrompt = [
    'text, letters, typography, calligraphy, inscriptions, captions, subtitles, handwriting, graffiti, banners',
    'logos, icons, UI elements, diagrams, charts, graphs, maps, labels, stickers, memes',
    'watermarks, signatures, symbols, emblems, stamps, QR codes, numbers',
    'photorealistic anatomy, detailed hands, extra fingers, close-up hands, realistic faces, facial features, teeth, portraits, hyper-detailed skin, muscular definition',
    'abstract blobs, chaotic patterns, glitch effects, noisy artifacts, distorted faces'
  ].join(', ');

  return {
    prompt,
    negativePrompt
  };
}

async function generateImage(word: WordInfo): Promise<string | null> {
  const { prompt, negativePrompt } = createPrompt(word);

  try {
    log.info(`${word.hebrew} (${word.korean} - ${word.meaning}) 생성 중...`);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro" as any,
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: "9:16",
          output_format: "jpg",
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true
        }
      }
    );

    if (!output) {
      log.error(`결과 없음`);
      return null;
    }

    const imageUrl = output.toString();
    log.success(`완료: ${imageUrl}`);
    return imageUrl;

  } catch (error: any) {
    log.error(`실패: ${error.message}`);
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
    log.success(`저장: ${outputPath}`);
    return true;

  } catch (error: any) {
    log.error(`다운로드 실패: ${error.message}`);
    return false;
  }
}

async function main() {
  log.step('개선된 프롬프트 V2 테스트 - 예술적 + 해부학적 오류 방지');

  const testWords: WordInfo[] = [
    {
      hebrew: 'בְּרֵאשִׁית',
      korean: '베레쉬트',
      meaning: '시작, 태초'
    },
    {
      hebrew: 'בָּרָא',
      korean: '바라',
      meaning: '창조하다'
    },
    {
      hebrew: 'שָׁמַיִם',
      korean: '샤마임',
      meaning: '하늘'
    }
  ];

  const outputDir = path.join(__dirname, '../../output/test_improved_prompt_v2');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  for (const word of testWords) {
    log.step(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    log.info(`단어: ${word.hebrew} (${word.korean})`);
    log.info(`의미: ${word.meaning}`);
    log.step(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const imageUrl = await generateImage(word);

    if (imageUrl) {
      const filename = `${word.korean}_v2.jpg`;
      const localPath = path.join(outputDir, filename);
      const downloaded = await downloadImage(imageUrl, localPath);

      results.push({
        word: word.hebrew,
        korean: word.korean,
        meaning: word.meaning,
        imageUrl: downloaded ? imageUrl : null,
        localPath: downloaded ? filename : null,
        status: downloaded ? 'success' : 'download_failed'
      });
    } else {
      results.push({
        word: word.hebrew,
        korean: word.korean,
        meaning: word.meaning,
        imageUrl: null,
        localPath: null,
        status: 'generation_failed'
      });
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const resultPath = path.join(outputDir, 'test_results_v2.json');
  fs.writeFileSync(resultPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    version: 'v2',
    improvements: [
      '더 예술적, 상징적 표현',
      '해부학적 오류 방지 (손/얼굴)',
      'impressionistic, dreamlike 스타일',
      'watercolor textures, soft focus'
    ],
    total: testWords.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status !== 'success').length,
    results
  }, null, 2), 'utf-8');

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.step('📊 테스트 V2 완료');
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`성공: ${results.filter(r => r.status === 'success').length}/${testWords.length}`);
  log.error(`실패: ${results.filter(r => r.status !== 'success').length}/${testWords.length}`);
  log.info(`출력 디렉토리: ${outputDir}`);

  log.step('\n🔍 개선 사항:');
  log.info('1. ✅ 더 예술적, 상징적 (impressionistic, dreamlike)');
  log.info('2. ✅ 손/얼굴 직접 묘사 방지 (실루엣만)');
  log.info('3. ✅ watercolor textures, soft focus');
  log.info('4. ✅ 해부학적 오류 네거티브 프롬프트 강화');

  log.step('\n💰 비용: $' + (results.filter(r => r.status === 'success').length * 0.04).toFixed(2));
}

main().catch(console.error);
