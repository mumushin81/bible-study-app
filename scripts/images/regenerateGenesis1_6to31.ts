/**
 * 창세기 1:6-31 모든 이미지 재생성
 * 기존 이미지를 최종 프롬프트로 교체
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
  verse_ref: string;
  current_image: string | null;
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
 * Supabase Storage에서 기존 이미지 삭제
 */
async function deleteOldImage(wordId: string): Promise<boolean> {
  const fileName = `${wordId}.jpg`;

  const { error } = await supabase.storage
    .from('flashcard-images')
    .remove([fileName]);

  if (error) {
    log.warn(`기존 이미지 삭제 실패 (무시): ${error.message}`);
    return false;
  }

  return true;
}

/**
 * Supabase Storage에 이미지 업로드 (3회 재시도)
 */
async function uploadImage(imageUrl: string, wordId: string): Promise<string | null> {
  const fileName = `${wordId}.jpg`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('flashcard-images')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        if (attempt < 3) {
          log.warn(`업로드 실패 (${attempt}/3), 재시도...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        log.error(`업로드 실패: ${error.message}`);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('flashcard-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      if (attempt < 3) {
        log.warn(`업로드 에러 (${attempt}/3), 재시도...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      log.error(`업로드 에러: ${error.message}`);
      return null;
    }
  }

  return null;
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
  log.step('창세기 1:6-31 이미지 재생성 시작');

  // 창세기 1:6-31 구절 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .gte('verse_number', 6)
    .lte('verse_number', 31)
    .order('verse_number');

  if (!verses || verses.length === 0) {
    log.error('창세기 1:6-31 구절을 찾을 수 없습니다');
    return;
  }

  log.info(`찾은 구절: ${verses.length}개 (창세기 1:6 ~ 1:31)`);

  const verseIds = verses.map(v => v.id);

  // 모든 단어 조회 (이미지 유무 상관없이)
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id, position, flashcard_img_url')
    .in('verse_id', verseIds)
    .order('verse_id')
    .order('position');

  if (error) {
    log.error(`조회 실패: ${error.message}`);
    return;
  }

  if (!words || words.length === 0) {
    log.error('단어를 찾을 수 없습니다');
    return;
  }

  // verse reference 추가
  const wordsWithRef = words.map(w => ({
    ...w,
    verse_ref: verses.find(v => v.id === w.verse_id)?.reference || '',
    current_image: w.flashcard_img_url
  }));

  log.info(`\n총 ${words.length}개 단어 재생성`);
  log.info(`예상 비용: $${(words.length * 0.04).toFixed(2)}`);
  log.info(`예상 시간: ${Math.ceil(words.length * 10 / 60)}분\n`);

  log.warn('⚠️  기존 이미지를 모두 교체합니다!');
  log.info('10초 후 시작...\n');
  await new Promise(resolve => setTimeout(resolve, 10000));

  const results = {
    total: words.length,
    success: 0,
    failed: 0,
    errors: [] as string[],
    startTime: new Date()
  };

  for (let i = 0; i < wordsWithRef.length; i++) {
    const word = wordsWithRef[i];

    log.step(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    log.info(`[${i + 1}/${words.length}] ${word.verse_ref}`);
    log.info(`단어: ${word.hebrew} (${word.korean})`);
    log.info(`의미: ${word.meaning}`);

    // 1. 기존 이미지 삭제 (있는 경우)
    if (word.current_image) {
      await deleteOldImage(word.id);
    }

    // 2. 새 이미지 생성
    log.info('새 이미지 생성 중...');
    const imageUrl = await generateImage(word);
    if (!imageUrl) {
      results.failed++;
      results.errors.push(`${word.verse_ref} - ${word.korean}: 이미지 생성 실패`);
      continue;
    }
    log.success(`생성 완료`);

    // 3. Supabase 업로드 (3회 재시도)
    log.info('Supabase 업로드 중...');
    const publicUrl = await uploadImage(imageUrl, word.id);
    if (!publicUrl) {
      results.failed++;
      results.errors.push(`${word.verse_ref} - ${word.korean}: 업로드 실패`);
      continue;
    }
    log.success(`업로드 완료`);

    // 4. DB 업데이트
    log.info('DB 업데이트 중...');
    const updated = await updateWordImage(word.id, publicUrl);
    if (!updated) {
      results.failed++;
      results.errors.push(`${word.verse_ref} - ${word.korean}: DB 업데이트 실패`);
      continue;
    }
    log.success(`완료: ${word.korean}`);

    results.success++;

    // 진행률 표시
    const progress = ((i + 1) / words.length * 100).toFixed(1);
    const elapsed = Math.floor((new Date().getTime() - results.startTime.getTime()) / 1000);
    const avgTime = elapsed / (i + 1);
    const remaining = Math.ceil(avgTime * (words.length - i - 1) / 60);

    log.info(`진행률: ${progress}% (${i + 1}/${words.length})`);
    log.info(`경과: ${Math.floor(elapsed / 60)}분 ${elapsed % 60}초, 남은 시간: 약 ${remaining}분`);

    // API 제한 방지를 위한 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 최종 결과
  const totalTime = Math.floor((new Date().getTime() - results.startTime.getTime()) / 1000);

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.step('📊 창세기 1:6-31 이미지 재생성 완료');
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`성공: ${results.success}/${results.total}`);
  if (results.failed > 0) {
    log.error(`실패: ${results.failed}/${results.total}`);
    log.warn('\n실패 항목:');
    results.errors.forEach(err => log.warn(`  ${err}`));
  }
  log.info(`\n실제 비용: $${(results.success * 0.04).toFixed(2)}`);
  log.info(`소요 시간: ${Math.floor(totalTime / 60)}분 ${totalTime % 60}초`);

  if (results.success === results.total) {
    log.success('\n🎉 모든 이미지가 최종 프롬프트로 재생성되었습니다!');
  }

  // 결과 저장
  const outputDir = path.join(__dirname, '../../output/genesis_1_6to31_regenerate');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const resultPath = path.join(outputDir, `regeneration_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(resultPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    verses_range: '창세기 1:6-31',
    verses_count: verses.length,
    results: {
      ...results,
      duration_seconds: totalTime
    },
    words: wordsWithRef.map((w: WordInfo) => ({
      id: w.id,
      verse: w.verse_ref,
      korean: w.korean,
      meaning: w.meaning,
      had_image: !!w.current_image
    }))
  }, null, 2));

  log.info(`\n결과 저장: ${resultPath}`);
}

main().catch(console.error);
