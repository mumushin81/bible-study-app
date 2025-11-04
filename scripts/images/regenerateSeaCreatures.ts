/**
 * 창세기 1:21 "바다괴물들" 이미지 재생성
 * 바다 생물들(고래, 돌고래, 물고기)을 더 명확하게 표현
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

/**
 * 바다 생물 전용 프롬프트
 */
function createSeaCreaturesPrompt() {
  // 바다 생물들을 구체적으로 명시
  const conceptPrompt = `Majestic marine life scene depicting large sea creatures in a sacred biblical context. Show whales, dolphins, large fish, and diverse ocean life swimming gracefully through luminous waters. The creatures should be recognizable as sea animals (not abstract or monstrous), portrayed with gentle dignity and natural beauty. Emphasize peaceful coexistence of various marine species in God's creation, with soft light filtering through water creating a divine atmosphere.`;

  const colorPrompt = 'bright pastel palette with aqua blue, seafoam green, soft coral pink, pearl white, and gentle turquoise; luminous underwater light rays; shimmering water effects; NO dark colors, NO black depths, NO threatening atmosphere; peaceful, serene ocean glow';

  const compositionPrompt = 'vertical 9:16 layout; multiple sea creatures (whales, dolphins, fish) occupy the upper 80% swimming in different depths; lower 20% remains softly lit water space for future text overlay; centered composition with gentle flowing movement';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred atmosphere, painterly brushstrokes, soft focus edges, watercolor textures, diffuse underwater glow, gentle light bloom, ethereal marine environment';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. Absolutely no written characters, letters, or text of any kind within the scene.`;

  const negativePrompt = [
    'text, letters, typography, calligraphy, inscriptions, captions, subtitles, handwriting',
    'monsters, demons, scary creatures, threatening appearance, aggressive poses, sharp teeth visible',
    'dark ocean, black water, murky depths, horror atmosphere, frightening creatures',
    'abstract blobs, unrecognizable shapes, distorted anatomy',
    'logos, icons, UI elements, watermarks, signatures'
  ].join(', ');

  return { prompt, negativePrompt };
}

async function generateImage(): Promise<string | null> {
  const { prompt, negativePrompt } = createSeaCreaturesPrompt();

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

      log.success(`시도 ${attempt}에서 생성 성공`);
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
  log.step('창세기 1:21 "바다괴물들" 이미지 재생성');

  const wordId = 'ec013c98-bff7-434d-a801-e7601695000d';

  log.info('단어: 에트 하타니님 (אֶת-הַתַּנִּינִם)');
  log.info('의미: 바다 괴물들을');
  log.info('새 프롬프트: 고래, 돌고래, 물고기 등 실제 바다 생물들\n');

  // 1. 이미지 생성
  log.step('이미지 생성 중...');
  const imageUrl = await generateImage();
  if (!imageUrl) {
    log.error('이미지 생성 실패');
    return;
  }
  log.success('이미지 생성 완료');

  // 2. Storage 업로드
  log.step('Supabase Storage 업로드 중...');
  const publicUrl = await uploadImage(imageUrl, wordId);
  if (!publicUrl) {
    log.error('업로드 실패');
    return;
  }
  log.success('업로드 완료');

  // 3. DB 업데이트
  log.step('DB 업데이트 중...');
  const updated = await updateWordImage(wordId, publicUrl);
  if (!updated) {
    log.error('DB 업데이트 실패');
    return;
  }
  log.success('DB 업데이트 완료');

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success('🎉 "바다괴물들" 이미지 재생성 완료!');
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info(`새 이미지 URL: ${publicUrl}`);
  log.info('비용: $0.04');
}

main().catch(console.error);
