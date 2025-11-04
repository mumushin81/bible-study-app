/**
 * 실패한 창세기 1장 이미지 재생성 (66개)
 * 이전 regeneration에서 실패한 단어만 재시도
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
  verse_ref: string;
  flashcard_img_url: string | null;
}

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`)
};

/**
 * 최종 프롬프트 (Genesis 1:1 검증 완료)
 */
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

/**
 * FLUX 1.1 Pro 이미지 생성 (최대 5회 재시도)
 */
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
        log.warn(`시도 ${attempt} 실패: 출력 없음`);
        if (attempt < 5) {
          const waitTime = attempt * 3000; // 3s, 6s, 9s, 12s
          log.info(`${waitTime/1000}초 대기 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        return null;
      }

      log.success(`시도 ${attempt}에서 생성 성공`);
      return output.toString();
    } catch (error: any) {
      log.error(`시도 ${attempt} 에러: ${error.message}`);
      if (attempt < 5) {
        const waitTime = attempt * 3000;
        log.info(`${waitTime/1000}초 대기 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      return null;
    }
  }

  return null;
}

/**
 * Storage 업로드 (3회 재시도)
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
  log.step('실패한 창세기 1장 이미지 재생성 시작');

  // UUID 패턴 (새 이미지 확인용)
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg/;

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
    log.error('구절을 찾을 수 없습니다');
    return;
  }

  const verseIds = verses.map(v => v.id);

  // 모든 단어 조회
  const { data: allWords } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id, flashcard_img_url')
    .in('verse_id', verseIds)
    .order('verse_id')
    .order('position');

  if (!allWords) {
    log.error('단어를 찾을 수 없습니다');
    return;
  }

  // 구버전 이미지를 가진 단어만 필터링
  const failedWords = allWords.filter(w => !uuidPattern.test(w.flashcard_img_url || ''));

  const wordsWithRef: WordInfo[] = failedWords.map(w => ({
    ...w,
    verse_ref: verses.find(v => v.id === w.verse_id)?.reference || ''
  }));

  log.info(`\n총 ${allWords.length}개 단어 중 ${failedWords.length}개 재생성 필요`);
  log.info(`예상 비용: $${(failedWords.length * 0.04).toFixed(2)}`);
  log.info(`예상 시간: ${Math.ceil(failedWords.length * 12 / 60)}분\n`);

  // 구절별 실패 수 표시
  log.info('구절별 실패 현황:');
  verses.forEach(verse => {
    const count = wordsWithRef.filter(w => w.verse_id === verse.id).length;
    if (count > 0) {
      log.warn(`  ${verse.reference}: ${count}개`);
    }
  });

  log.info('\n5초 후 시작...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  const results = {
    total: wordsWithRef.length,
    success: 0,
    failed: 0,
    errors: [] as string[],
    startTime: new Date()
  };

  for (let i = 0; i < wordsWithRef.length; i++) {
    const word = wordsWithRef[i];

    log.step(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    log.info(`[${i + 1}/${wordsWithRef.length}] ${word.verse_ref}`);
    log.info(`단어: ${word.hebrew} (${word.korean})`);
    log.info(`의미: ${word.meaning}`);

    // 1. 이미지 생성 (5회 재시도)
    const imageUrl = await generateImage(word);
    if (!imageUrl) {
      results.failed++;
      results.errors.push(`${word.verse_ref} - ${word.korean}: 이미지 생성 실패 (5회 시도 후)`);
      log.error(`최종 실패: ${word.korean}`);
      continue;
    }
    log.success(`생성 완료`);

    // 2. Storage 업로드
    log.info('업로드 중...');
    const publicUrl = await uploadImage(imageUrl, word.id);
    if (!publicUrl) {
      results.failed++;
      results.errors.push(`${word.verse_ref} - ${word.korean}: 업로드 실패`);
      continue;
    }
    log.success(`업로드 완료`);

    // 3. DB 업데이트
    log.info('DB 업데이트 중...');
    const updated = await updateWordImage(word.id, publicUrl);
    if (!updated) {
      results.failed++;
      results.errors.push(`${word.verse_ref} - ${word.korean}: DB 업데이트 실패`);
      continue;
    }
    log.success(`완료: ${word.korean}`);

    results.success++;

    // 진행률
    const progress = ((i + 1) / wordsWithRef.length * 100).toFixed(1);
    log.info(`진행률: ${progress}% (${i + 1}/${wordsWithRef.length})`);

    // API 제한 방지 (재시도 포함해서 이미 충분한 대기 시간 있음)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 최종 결과
  const totalTime = Math.floor((new Date().getTime() - results.startTime.getTime()) / 1000);

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.step('📊 재생성 완료');
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
    log.success('\n🎉 모든 실패 이미지가 재생성되었습니다!');
  } else if (results.success > 0) {
    log.info(`\n⚠️  ${results.failed}개 여전히 실패. 다시 실행하거나 수동 확인 필요.`);
  }

  // 결과 저장
  const outputDir = path.join(__dirname, '../../output/genesis_1_retry');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const resultPath = path.join(outputDir, `retry_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(resultPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    retry_scope: '창세기 1:6-31 실패분',
    results: {
      ...results,
      duration_seconds: totalTime
    },
    words: wordsWithRef.map(w => ({
      id: w.id,
      verse: w.verse_ref,
      korean: w.korean,
      meaning: w.meaning,
      had_old_image: !!w.flashcard_img_url
    }))
  }, null, 2));

  log.info(`\n결과 저장: ${resultPath}`);
}

main().catch(console.error);
