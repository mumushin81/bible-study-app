/**
 * 마지막 2개 실패 단어 재시도
 */

import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

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

// 실패한 2개 단어 ID (창세기 1:28)
const failedWordIds = [
  // 우베오프 하샤마임, 우베콜 하야
];

interface WordInfo {
  id: string;
  hebrew: string;
  korean: string;
  meaning: string;
  verse_id: string;
}

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`)
};

function createPrompt(word: WordInfo) {
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

async function generateImage(word: WordInfo): Promise<string | null> {
  const { prompt, negativePrompt } = createPrompt(word);

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      log.info(`생성 시도 ${attempt}/5...`);

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
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, attempt * 3000));
          continue;
        }
        return null;
      }

      log.success(`시도 ${attempt}에서 성공`);
      return output.toString();
    } catch (error: any) {
      log.error(`시도 ${attempt} 에러: ${error.message}`);
      if (attempt < 5) {
        await new Promise(resolve => setTimeout(resolve, attempt * 3000));
        continue;
      }
      return null;
    }
  }

  return null;
}

async function uploadImage(imageUrl: string, wordId: string): Promise<string | null> {
  const fileName = `${wordId}.jpg`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();

      const { error } = await supabase.storage
        .from('flashcard-images')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('flashcard-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      return null;
    }
  }

  return null;
}

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
  console.log('🔄 마지막 2개 단어 재시도\n');

  // 창세기 1:28에서 구버전 이미지를 가진 단어 찾기
  const { data: verse } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 28)
    .single();

  if (!verse) {
    log.error('창세기 1:28을 찾을 수 없습니다');
    return;
  }

  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id, flashcard_img_url')
    .eq('verse_id', verse.id)
    .order('position');

  if (!words) {
    log.error('단어를 찾을 수 없습니다');
    return;
  }

  // UUID 패턴이 아닌 단어만 필터링
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg/;
  const failedWords = words.filter(w => !uuidPattern.test(w.flashcard_img_url || ''));

  log.info(`실패 단어: ${failedWords.length}개\n`);

  let success = 0;
  let failed = 0;

  for (const word of failedWords) {
    log.info(`단어: ${word.korean} (${word.meaning})`);

    const imageUrl = await generateImage(word);
    if (!imageUrl) {
      log.error(`생성 실패: ${word.korean}`);
      failed++;
      continue;
    }

    log.info('업로드 중...');
    const publicUrl = await uploadImage(imageUrl, word.id);
    if (!publicUrl) {
      log.error(`업로드 실패: ${word.korean}`);
      failed++;
      continue;
    }

    log.info('DB 업데이트 중...');
    const updated = await updateWordImage(word.id, publicUrl);
    if (!updated) {
      failed++;
      continue;
    }

    log.success(`완료: ${word.korean}\n`);
    success++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 결과');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`성공: ${success}/${failedWords.length}`);
  if (failed > 0) {
    log.error(`실패: ${failed}/${failedWords.length}`);
  }
}

main().catch(console.error);
