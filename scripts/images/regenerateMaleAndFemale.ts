/**
 * 창세기 1:27 "남자"와 "여자" 이미지 재생성
 * 상징적이고 추상적인 표현 사용
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
 * 남자 전용 프롬프트 (상징적 표현)
 */
function createMalePrompt() {
  const conceptPrompt = `Symbolic representation of "male/masculine" in biblical creation context. Use abstract and symbolic elements like strong oak tree, mountain peak, sun, protective shield imagery, or geometric forms suggesting strength and protection. NO human figures, NO faces, NO bodies, NO anatomical features. Focus on masculine archetypal symbols in nature and geometry with sacred, dignified atmosphere representing God's creation of male. Use metaphorical imagery that evokes the concept without direct representation.`;

  const colorPrompt = 'bright pastel palette with sky blue, soft gold, gentle azure, pearl white, warm beige; luminous gradients; NO dark colors, NO black; uplifting spiritual glow with masculine energy through color and form';

  const compositionPrompt = 'vertical 9:16 layout; symbolic elements occupy upper 80%; lower 20% remains softly lit space for text; centered, harmonious composition with gentle strength';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred atmosphere, painterly brushstrokes, soft focus edges, watercolor textures, diffuse glow, gentle light bloom, abstract metaphorical representation';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. Absolutely no written characters, letters, text, human figures, faces, bodies, or anatomical features.`;

  const negativePrompt = [
    'text, letters, typography, human figures, people, men, women, children, faces, portraits',
    'bodies, anatomy, hands, feet, arms, legs, torso, realistic human forms, silhouettes of people',
    'gender symbols, biological features, reproductive imagery',
    'photorealistic humans, anime characters, cartoon people',
    'logos, icons, UI elements, watermarks'
  ].join(', ');

  return { prompt, negativePrompt };
}

/**
 * 여자 전용 프롬프트 (상징적 표현)
 */
function createFemalePrompt() {
  const conceptPrompt = `Symbolic representation of "female/feminine" in biblical creation context. Use abstract and symbolic elements like blooming flowers, flowing water, moon, nurturing garden imagery, or graceful curved forms suggesting beauty and life-giving. NO human figures, NO faces, NO bodies, NO anatomical features. Focus on feminine archetypal symbols in nature and graceful forms with sacred, dignified atmosphere representing God's creation of female. Use metaphorical imagery that evokes the concept without direct representation.`;

  const colorPrompt = 'bright pastel palette with soft pink, lavender, peach, mint green, pearl white; luminous gradients; NO dark colors, NO black; uplifting spiritual glow with feminine grace through color and form';

  const compositionPrompt = 'vertical 9:16 layout; symbolic elements occupy upper 80%; lower 20% remains softly lit space for text; centered, harmonious composition with gentle grace';

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred atmosphere, painterly brushstrokes, soft focus edges, watercolor textures, diffuse glow, gentle light bloom, abstract metaphorical representation';

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. Absolutely no written characters, letters, text, human figures, faces, bodies, or anatomical features.`;

  const negativePrompt = [
    'text, letters, typography, human figures, people, men, women, children, faces, portraits',
    'bodies, anatomy, hands, feet, arms, legs, torso, realistic human forms, silhouettes of people',
    'gender symbols, biological features, reproductive imagery',
    'photorealistic humans, anime characters, cartoon people',
    'logos, icons, UI elements, watermarks'
  ].join(', ');

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
  log.step('창세기 1:27 "남자"와 "여자" 이미지 재생성');

  const maleWordId = '36b38b97-7742-4688-acfa-f1daf6bb47eb';
  const femaleWordId = 'b065b50c-1982-4373-9a11-7eb1dcdedd12';

  // 1. 남자 이미지
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info('1/2: 자카르 (זָכָר) - 남자');
  log.info('상징: 강한 나무, 산 정상, 태양 등 남성적 자연 요소\n');

  const maleImageUrl = await generateImage(createMalePrompt());
  if (!maleImageUrl) {
    log.error('남자 이미지 생성 실패');
    return;
  }

  log.info('업로드 중...');
  const malePublicUrl = await uploadImage(maleImageUrl, maleWordId);
  if (!malePublicUrl) {
    log.error('남자 이미지 업로드 실패');
    return;
  }

  log.info('DB 업데이트 중...');
  await updateWordImage(maleWordId, malePublicUrl);
  log.success('남자 이미지 완료');

  // 2초 대기
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 2. 여자 이미지
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info('2/2: 우네케바 (וּנְקֵבָה) - 여자');
  log.info('상징: 꽃, 흐르는 물, 달 등 여성적 자연 요소\n');

  const femaleImageUrl = await generateImage(createFemalePrompt());
  if (!femaleImageUrl) {
    log.error('여자 이미지 생성 실패');
    return;
  }

  log.info('업로드 중...');
  const femalePublicUrl = await uploadImage(femaleImageUrl, femaleWordId);
  if (!femalePublicUrl) {
    log.error('여자 이미지 업로드 실패');
    return;
  }

  log.info('DB 업데이트 중...');
  await updateWordImage(femaleWordId, femalePublicUrl);
  log.success('여자 이미지 완료');

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success('🎉 "남자"와 "여자" 이미지 재생성 완료!');
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info('특징: 인체 묘사 없이 상징적 자연 요소 사용');
  log.info('남자: 강함과 보호를 상징하는 요소');
  log.info('여자: 아름다움과 생명을 상징하는 요소');
  log.info('비용: $0.08 (2개 × $0.04)');
}

main().catch(console.error);
