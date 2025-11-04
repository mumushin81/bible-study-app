/**
 * 이미지가 없는 모든 단어의 플래시카드 이미지 배치 생성
 * 최종 프롬프트 사용 (Genesis 1:1 테스트 통과)
 */

import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../../.env.local') });

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN || '',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface WordInfo {
  id: string;
  hebrew: string;
  korean: string;
  meaning: string;
  verse_id: string;
  position: number;
}

interface GenerationPrompt {
  prompt: string;
  negativePrompt: string;
}

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`)
};

/**
 * 최종 프롬프트 생성 (Genesis 1:1 테스트 통과)
 */
function createPrompt(word: WordInfo): GenerationPrompt {
  const conceptPrompt = `Symbolic, narrative illustration conveying the biblical concept of "${word.meaning}". Express this sacred idea through luminous metaphors, biblically inspired scenery, and emblematic imagery so the meaning is instantly recognizable. Favor celestial elements, light, flora, natural phenomena, and sacred symbols instead of literal human anatomy; if figures appear, render them only as distant silhouettes with no visible faces or hands.`;

  const colorPrompt = 'bright pastel palette with soft pink, sky blue, lavender, golden peach, and mint green; luminous gradients; NO dark colors, NO black, NO dark gray; hopeful, uplifting spiritual glow';

  const compositionPrompt = 'vertical 9:16 layout; primary subject occupies the upper 80%; lower 20% remains softly lit negative space for future text overlay; centered, harmonious framing with gentle depth';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred atmosphere, painterly brushstrokes, soft focus edges, watercolor textures, diffuse glow, gentle light bloom';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. Absolutely no written characters, letters, or text of any kind within the scene.`;

  const negativePrompt = [
    'text, letters, typography, calligraphy, inscriptions, captions, subtitles, handwriting, graffiti, banners',
    'Hebrew letters, Hebrew text, Hebrew characters, Hebrew script, ancient text, biblical inscriptions, sacred text',
    'Arabic text, Aramaic text, any written language, alphabets, symbols with text',
    'logos, icons, UI elements, diagrams, charts, graphs, maps, labels, stickers, memes',
    'watermarks, signatures, stamps, QR codes, numbers',
    'photorealistic anatomy, detailed hands, extra fingers, close-up hands, realistic faces, facial features, teeth, portraits, hyper-detailed skin, muscular definition',
    'abstract blobs, chaotic patterns, glitch effects, noisy artifacts, distorted faces'
  ].join(', ');

  return { prompt, negativePrompt };
}

/**
 * FLUX 1.1 Pro로 이미지 생성
 */
async function generateImage(word: WordInfo): Promise<string | null> {
  const { prompt, negativePrompt } = createPrompt(word);

  try {
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
      return null;
    }

    return output.toString();
  } catch (error: any) {
    log.error(`생성 실패: ${error.message}`);
    return null;
  }
}

/**
 * Supabase Storage에 이미지 업로드
 */
async function uploadImage(imageUrl: string, wordId: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const fileName = `${wordId}.jpg`;

    const { data, error } = await supabase.storage
      .from('flashcard-images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      log.error(`업로드 실패: ${error.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('flashcard-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error: any) {
    log.error(`업로드 에러: ${error.message}`);
    return null;
  }
}

/**
 * DB 업데이트
 */
async function updateWordImage(wordId: string, imageUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from('words')
    .update({ flashcard_img_url: imageUrl })
    .eq('id', wordId);

  if (error) {
    log.error(`DB 업데이트 실패: ${error.message}`);
    return false;
  }

  return true;
}

async function main() {
  log.step('이미지가 없는 단어들 배치 생성 시작');

  // 이미지가 없는 단어들 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .in('chapter', [1, 2, 3]);

  if (!verses) {
    log.error('구절을 찾을 수 없습니다');
    return;
  }

  const verseIds = verses.map(v => v.id);

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id, position')
    .in('verse_id', verseIds)
    .is('flashcard_img_url', null)
    .order('verse_id')
    .order('position');

  if (error || !words || words.length === 0) {
    log.error('이미지가 없는 단어를 찾을 수 없습니다');
    return;
  }

  log.info(`총 ${words.length}개 단어 처리`);
  log.info(`예상 비용: $${(words.length * 0.04).toFixed(2)}`);
  log.info(`예상 시간: ${Math.ceil(words.length * 10 / 60)}분`);

  const results = {
    total: words.length,
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i] as WordInfo;

    log.step(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    log.info(`[${i + 1}/${words.length}] ${word.hebrew} (${word.korean})`);
    log.info(`의미: ${word.meaning}`);

    // 1. 이미지 생성
    log.info('이미지 생성 중...');
    const imageUrl = await generateImage(word);
    if (!imageUrl) {
      results.failed++;
      results.errors.push(`${word.korean}: 이미지 생성 실패`);
      continue;
    }
    log.success(`생성 완료`);

    // 2. Supabase 업로드
    log.info('Supabase 업로드 중...');
    const publicUrl = await uploadImage(imageUrl, word.id);
    if (!publicUrl) {
      results.failed++;
      results.errors.push(`${word.korean}: 업로드 실패`);
      continue;
    }
    log.success(`업로드 완료`);

    // 3. DB 업데이트
    log.info('DB 업데이트 중...');
    const updated = await updateWordImage(word.id, publicUrl);
    if (!updated) {
      results.failed++;
      results.errors.push(`${word.korean}: DB 업데이트 실패`);
      continue;
    }
    log.success(`완료: ${word.korean}`);

    results.success++;

    // 진행률 표시
    const progress = ((i + 1) / words.length * 100).toFixed(1);
    log.info(`진행률: ${progress}% (${i + 1}/${words.length})`);

    // API 제한 방지를 위한 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 최종 결과
  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.step('📊 배치 생성 완료');
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`성공: ${results.success}/${results.total}`);
  if (results.failed > 0) {
    log.error(`실패: ${results.failed}/${results.total}`);
    log.warn('\n실패 항목:');
    results.errors.forEach(err => log.warn(`  ${err}`));
  }
  log.info(`\n실제 비용: $${(results.success * 0.04).toFixed(2)}`);

  // 결과 저장
  const outputDir = path.join(__dirname, '../../output/batch_generation');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const resultPath = path.join(outputDir, `batch_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(resultPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    words: words.map((w: WordInfo) => ({
      id: w.id,
      korean: w.korean,
      meaning: w.meaning
    }))
  }, null, 2));

  log.info(`\n결과 저장: ${resultPath}`);
}

main().catch(console.error);
