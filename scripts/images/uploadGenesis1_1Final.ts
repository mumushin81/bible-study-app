/**
 * 창세기 1:1 최종 테스트 이미지를 Supabase에 업로드하고 데이터베이스 업데이트
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../../.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestResult {
  word: string;
  korean: string;
  meaning: string;
  imageUrl: string;
  localPath: string;
  status: string;
}

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

/**
 * 한국어 발음으로 words 테이블에서 ID 찾기
 */
async function findWordByKorean(korean: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('words')
    .select('id, hebrew, korean, verse_id')
    .eq('verse_id', 'genesis_1_1') // 창세기 1:1
    .eq('korean', korean)
    .limit(1)
    .single();

  if (error || !data) {
    log.error(`단어를 찾을 수 없습니다: ${korean}`);
    return null;
  }

  log.info(`찾은 단어: ${data.hebrew} (${data.korean}) - ID: ${data.id}`);
  return data.id;
}

/**
 * 이미지를 Supabase Storage에 업로드
 */
async function uploadImage(localPath: string, wordId: string, korean: string): Promise<string | null> {
  const fileName = `${wordId}.jpg`;
  const filePath = path.join(__dirname, '../../output/test_genesis1_1_final', localPath);

  if (!fs.existsSync(filePath)) {
    log.error(`파일이 존재하지 않습니다: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);

  log.info(`업로드 중: ${korean} → ${fileName} (${(fileBuffer.length / 1024).toFixed(1)}KB)`);

  const { data, error } = await supabase.storage
    .from('flashcard-images')
    .upload(fileName, fileBuffer, {
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

  log.success(`업로드 완료: ${publicUrl}`);
  return publicUrl;
}

/**
 * 데이터베이스의 flashcard_img_url 업데이트
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

  log.success(`DB 업데이트 완료: ${wordId}`);
  return true;
}

async function main() {
  log.step('창세기 1:1 최종 이미지 업로드 시작');

  // 테스트 결과 파일 읽기
  const resultsPath = path.join(__dirname, '../../output/test_genesis1_1_final/test_results_final.json');
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

  log.info(`총 ${results.results.length}개 이미지 처리`);

  let successCount = 0;
  let failCount = 0;

  for (const result of results.results as TestResult[]) {
    log.step(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    log.info(`처리 중: ${result.word} (${result.korean})`);

    // 1. 단어 ID 찾기 (한국어 발음으로)
    const wordId = await findWordByKorean(result.korean);
    if (!wordId) {
      failCount++;
      continue;
    }

    // 2. 이미지 업로드 (word ID를 파일명으로 사용)
    const imageUrl = await uploadImage(result.localPath, wordId, result.korean);
    if (!imageUrl) {
      failCount++;
      continue;
    }

    // 3. DB 업데이트
    const updated = await updateWordImage(wordId, imageUrl);
    if (!updated) {
      failCount++;
      continue;
    }

    successCount++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log.step('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.step('📊 업로드 완료');
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.success(`성공: ${successCount}/${results.results.length}`);
  if (failCount > 0) {
    log.error(`실패: ${failCount}/${results.results.length}`);
  }
}

main().catch(console.error);
