/**
 * 3개 이미지 재생성:
 * 1. 창세기 1:27 "남자" (자카르)
 * 2. 창세기 1:27 "여자" (우네케바)
 * 3. 창세기 1:28 "그리고 다스리라" (우르두)
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

interface ImageTask {
  id: string;
  korean: string;
  hebrew: string;
  meaning: string;
  promptFn: () => { prompt: string; negativePrompt: string };
}

/**
 * 남자 프롬프트 (상징적)
 */
function createMalePrompt() {
  const conceptPrompt = `Symbolic representation of "male/masculine" in biblical creation. Use abstract elements: strong oak tree silhouette, mountain peak with morning sun, protective shield shape, or geometric strength symbols. NO human figures, faces, or bodies. Pure symbolic imagery conveying masculine archetype through nature and sacred geometry.`;

  const colorPrompt = 'bright pastel: sky blue, soft gold, gentle azure, pearl white, warm beige; luminous uplifting glow';

  const compositionPrompt = 'vertical 9:16; symbolic elements upper 80%; lower 20% soft lit space; centered harmonious';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred, painterly, soft edges, watercolor, diffuse glow';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. No text, letters, human figures, faces, bodies, anatomical features.`;

  const negativePrompt = 'text, letters, human figures, people, faces, bodies, anatomy, hands, feet, silhouettes of people, gender symbols, biological features, photorealistic humans, anime, cartoon people, logos';

  return { prompt, negativePrompt };
}

/**
 * 여자 프롬프트 (상징적)
 */
function createFemalePrompt() {
  const conceptPrompt = `Symbolic representation of "female/feminine" in biblical creation. Use abstract elements: blooming flowers, flowing water streams, moon with stars, nurturing garden scene, or graceful curved forms. NO human figures, faces, or bodies. Pure symbolic imagery conveying feminine archetype through nature and beauty.`;

  const colorPrompt = 'bright pastel: soft pink, lavender, peach, mint green, pearl white; luminous graceful glow';

  const compositionPrompt = 'vertical 9:16; symbolic elements upper 80%; lower 20% soft lit space; centered harmonious';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred, painterly, soft edges, watercolor, diffuse glow';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. No text, letters, human figures, faces, bodies, anatomical features.`;

  const negativePrompt = 'text, letters, human figures, people, faces, bodies, anatomy, hands, feet, silhouettes of people, gender symbols, biological features, photorealistic humans, anime, cartoon people, logos';

  return { prompt, negativePrompt };
}

/**
 * 다스리라 프롬프트
 */
function createDominionPrompt() {
  const conceptPrompt = `Symbolic representation of "dominion/rule" in biblical context. Show abstract imagery of gentle stewardship and care over creation: shepherd's staff silhouette, crown of light, hands forming protective circle (stylized, not realistic), caring guardian concept through metaphorical elements. Emphasize responsible, loving authority and wise governance, not aggressive control. Represent the sacred duty of caring for God's creation with dignity and grace.`;

  const colorPrompt = 'bright pastel: royal purple, soft gold, sky blue, gentle green, pearl white; noble dignified glow';

  const compositionPrompt = 'vertical 9:16; symbolic elements upper 80%; lower 20% soft lit space; centered authoritative yet gentle';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred, painterly, soft edges, watercolor, diffuse glow';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. No text, letters, realistic human figures, detailed anatomy.`;

  const negativePrompt = 'text, letters, weapons, war, violence, aggression, angry faces, fists, chains, slavery imagery, domination symbols, photorealistic hands, logos';

  return { prompt, negativePrompt };
}

async function generateImage(promptData: { prompt: string; negativePrompt: string }): Promise<string | null> {
  const { prompt, negativePrompt } = promptData;

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
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        return null;
      }

      log.success(`시도 ${attempt}에서 생성 성공`);
      return output.toString();
    } catch (error: any) {
      log.error(`시도 ${attempt} 에러: ${error.message}`);
      if (attempt < 5) {
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
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
          await new Promise(resolve => setTimeout(resolve, 1500));
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
        await new Promise(resolve => setTimeout(resolve, 1500));
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
  log.step('3개 이미지 재생성 시작');

  const tasks: ImageTask[] = [
    {
      id: '36b38b97-7742-4688-acfa-f1daf6bb47eb',
      korean: '자카르',
      hebrew: 'זָכָר',
      meaning: '남자',
      promptFn: createMalePrompt
    },
    {
      id: 'b065b50c-1982-4373-9a11-7eb1dcdedd12',
      korean: '우네케바',
      hebrew: 'וּנְקֵבָה',
      meaning: '그리고 여자',
      promptFn: createFemalePrompt
    },
    {
      id: 'fe3c92f1-2feb-4602-938f-dbc7da96ce3f',
      korean: '우르두',
      hebrew: 'וּרְדוּ',
      meaning: '그리고 다스리라',
      promptFn: createDominionPrompt
    }
  ];

  let success = 0;
  let failed = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.info(`[${i + 1}/3] ${task.korean} (${task.hebrew})`);
    log.info(`의미: ${task.meaning}\n`);

    // 1. 이미지 생성
    const imageUrl = await generateImage(task.promptFn());
    if (!imageUrl) {
      log.error(`생성 실패: ${task.korean}`);
      failed++;
      continue;
    }

    // 2. 업로드
    log.info('업로드 중...');
    const publicUrl = await uploadImage(imageUrl, task.id);
    if (!publicUrl) {
      log.error(`업로드 실패: ${task.korean}`);
      failed++;
      continue;
    }

    // 3. DB 업데이트
    log.info('DB 업데이트 중...');
    const updated = await updateWordImage(task.id, publicUrl);
    if (!updated) {
      failed++;
      continue;
    }

    log.success(`완료: ${task.korean}`);
    success++;

    // API 제한 방지
    if (i < tasks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`🎉 3개 이미지 재생성 완료!`);
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`성공: ${success}/3`);
  if (failed > 0) {
    log.error(`실패: ${failed}/3`);
  }
  log.info(`비용: $${(success * 0.04).toFixed(2)}`);
  log.info('\n특징:');
  log.info('  • 남자: 강함과 보호의 상징 (나무, 산, 태양)');
  log.info('  • 여자: 아름다움과 생명의 상징 (꽃, 물, 달)');
  log.info('  • 다스리라: 돌보는 청지기적 통치 (지팡이, 빛의 왕관)');
}

main().catch(console.error);
