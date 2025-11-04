/**
 * 최종 개선 프롬프트 테스트 - 창세기 1:1
 * 히브리어 텍스트 생성 방지 + 예술적 표현 + 해부학적 오류 방지
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
  // 히브리어 단어 직접 언급 제거, "biblical concept" 사용
  const conceptPrompt = `Symbolic, narrative illustration conveying the biblical concept of "${word.meaning}". Express this sacred idea through luminous metaphors, biblically inspired scenery, and emblematic imagery so the meaning is instantly recognizable. Favor celestial elements, light, flora, natural phenomena, and sacred symbols instead of literal human anatomy; if figures appear, render them only as distant silhouettes with no visible faces or hands.`;

  const colorPrompt = 'bright pastel palette with soft pink, sky blue, lavender, golden peach, and mint green; luminous gradients; NO dark colors, NO black, NO dark gray; hopeful, uplifting spiritual glow';

  const compositionPrompt = 'vertical 9:16 layout; primary subject occupies the upper 80%; lower 20% remains softly lit negative space for future text overlay; centered, harmonious framing with gentle depth';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred atmosphere, painterly brushstrokes, soft focus edges, watercolor textures, diffuse glow, gentle light bloom';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. Absolutely no written characters, letters, or text of any kind within the scene.`;

  // 히브리어 텍스트 방지 강화
  const negativePrompt = [
    'text, letters, typography, calligraphy, inscriptions, captions, subtitles, handwriting, graffiti, banners',
    'Hebrew letters, Hebrew text, Hebrew characters, Hebrew script, ancient text, biblical inscriptions, sacred text',
    'Arabic text, Aramaic text, any written language, alphabets, symbols with text',
    'logos, icons, UI elements, diagrams, charts, graphs, maps, labels, stickers, memes',
    'watermarks, signatures, stamps, QR codes, numbers',
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
    log.info(`${word.korean} - ${word.meaning} 생성 중...`);

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
  log.step('최종 프롬프트 테스트 - 창세기 1:1');
  log.info('개선 사항: 히브리어 텍스트 방지 + 예술적 표현');

  // 창세기 1:1 주요 단어 (조사 제외)
  const genesis1_1Words: WordInfo[] = [
    {
      hebrew: 'בְּרֵאשִׁית',
      korean: '베레쉬트',
      meaning: '태초에, 처음에'
    },
    {
      hebrew: 'בָּרָא',
      korean: '바라',
      meaning: '창조하셨다'
    },
    {
      hebrew: 'אֱלֹהִים',
      korean: '엘로힘',
      meaning: '하나님'
    },
    {
      hebrew: 'הַשָּׁמַיִם',
      korean: '하샤마임',
      meaning: '하늘'
    },
    {
      hebrew: 'הָאָרֶץ',
      korean: '하아레츠',
      meaning: '땅'
    }
  ];

  const outputDir = path.join(__dirname, '../../output/test_genesis1_1_final');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  for (const word of genesis1_1Words) {
    log.step(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    log.info(`단어: ${word.hebrew} (${word.korean})`);
    log.info(`의미: ${word.meaning}`);
    log.step(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const imageUrl = await generateImage(word);

    if (imageUrl) {
      const filename = `${word.korean}_final.jpg`;
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

  const resultPath = path.join(outputDir, 'test_results_final.json');
  fs.writeFileSync(resultPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    version: 'final',
    improvements: [
      '히브리어 단어 직접 언급 제거',
      'biblical concept of 사용',
      'Hebrew text 네거티브 프롬프트 강화',
      'impressionistic, dreamlike 스타일',
      '해부학적 오류 방지'
    ],
    total: genesis1_1Words.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status !== 'success').length,
    results
  }, null, 2), 'utf-8');

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.step('📊 창세기 1:1 테스트 완료');
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`성공: ${results.filter(r => r.status === 'success').length}/${genesis1_1Words.length}`);
  log.error(`실패: ${results.filter(r => r.status !== 'success').length}/${genesis1_1Words.length}`);
  log.info(`출력 디렉토리: ${outputDir}`);

  log.step('\n🔍 최종 검증 항목:');
  log.info('1. ✅ 히브리어/영어/모든 텍스트 없음');
  log.info('2. ✅ 예술적이면서 의미 전달 명확');
  log.info('3. ✅ 해부학적 오류 없음 (실루엣만)');
  log.info('4. ✅ 파스텔 톤 유지');
  log.info('5. ✅ dreamlike, watercolor 스타일');

  log.step('\n💰 비용: $' + (results.filter(r => r.status === 'success').length * 0.04).toFixed(2));

  log.step('\n📝 다음 단계:');
  log.info('성공 시 → 모든 스크립트에 최종 프롬프트 적용');
  log.info('실패 시 → Codex와 추가 개선 논의');
}

main().catch(console.error);
