/**
 * 실패한 단어 재시도 - 하아레츠 (땅)
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

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

async function main() {
  log.step('실패한 단어 재시도 - 하아레츠 (땅)');

  // 하아레츠 단어 찾기
  const { data: word } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id')
    .eq('verse_id', 'genesis_1_1')
    .eq('korean', '하아레츠')
    .single();

  if (!word) {
    log.error('단어를 찾을 수 없습니다');
    return;
  }

  log.info(`단어: ${word.hebrew} (${word.korean})`);
  log.info(`의미: ${word.meaning}`);

  // 프롬프트 생성
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

  // 이미지 생성
  log.info('이미지 생성 중...');
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

  const imageUrl = output.toString();
  log.success(`생성 완료: ${imageUrl}`);

  // 업로드 (3회 재시도)
  let publicUrl: string | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    log.info(`업로드 시도 ${attempt}/3...`);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const fileName = `${word.id}.jpg`;

      const { data, error } = await supabase.storage
        .from('flashcard-images')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        log.error(`업로드 실패 (${attempt}/3): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      const { data: { publicUrl: url } } = supabase.storage
        .from('flashcard-images')
        .getPublicUrl(fileName);

      publicUrl = url;
      log.success(`업로드 완료: ${publicUrl}`);
      break;
    } catch (error: any) {
      log.error(`업로드 에러 (${attempt}/3): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!publicUrl) {
    log.error('3번 시도 후에도 업로드 실패');
    return;
  }

  // DB 업데이트
  log.info('DB 업데이트 중...');
  const { error } = await supabase
    .from('words')
    .update({ flashcard_img_url: publicUrl })
    .eq('id', word.id);

  if (error) {
    log.error(`DB 업데이트 실패: ${error.message}`);
    return;
  }

  log.success('🎉 완료!');
  log.info(`비용: $0.04`);
}

main().catch(console.error);
