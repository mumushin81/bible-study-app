/**
 * 창세기 2장 이미지 Supabase 업로드 및 동기화
 *
 * 작업 순서:
 * 1. output/genesis2_images/ JPG 파일 읽기
 * 2. Supabase Storage (flashcard-images/words/) 업로드
 * 3. Public URL 생성
 * 4. genesis2_unique_words.json과 매칭
 * 5. 25개 JSON 파일 업데이트 (flashcardImgUrl 추가)
 * 6. 데이터베이스 동기화
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 로드
config({ path: path.join(__dirname, '../../.env.local') });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

// Supabase 클라이언트 생성
function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// 니쿠드 제거
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').trim();
}

// MD5 해시 생성
function generateHash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

interface ImageMapping {
  filename: string;
  hebrew: string;
  korean: string;
  publicUrl: string | null;
}

async function main() {
  log.step('창세기 2장 이미지 업로드 및 동기화 시작');

  const supabase = createSupabaseClient();

  // 1. 로컬 이미지 파일 목록
  const imagesDir = path.join(__dirname, '../../output/genesis2_images');
  if (!fs.existsSync(imagesDir)) {
    log.error('이미지 디렉토리가 없습니다: ' + imagesDir);
    process.exit(1);
  }

  const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));
  log.info(`로컬 이미지: ${imageFiles.length}개`);

  // 2. genesis2_unique_words.json 로드
  const wordsPath = path.join(__dirname, 'genesis2_unique_words.json');
  if (!fs.existsSync(wordsPath)) {
    log.error('genesis2_unique_words.json 파일이 없습니다.');
    process.exit(1);
  }

  const wordsData = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  const uniqueWords: Array<{ hebrew: string; korean: string; meaning: string }> = wordsData.words;
  log.info(`고유 단어: ${uniqueWords.length}개`);

  // 3. Supabase Storage 업로드
  log.step('Supabase Storage 업로드 시작');

  const mappings: ImageMapping[] = [];
  let uploadCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const imageFile of imageFiles) {
    const localPath = path.join(imagesDir, imageFile);
    const fileBuffer = fs.readFileSync(localPath);

    // 파일명에서 히브리어 단어 찾기 (romanized → hebrew 매칭)
    const romanized = imageFile.replace('.jpg', '');

    // Supabase Storage 경로
    const storagePath = `words/${imageFile}`;

    try {
      // 업로드 (이미 존재하면 덮어쓰기)
      const { error: uploadError } = await supabase.storage
        .from('flashcard-images')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        log.error(`업로드 실패: ${imageFile} - ${uploadError.message}`);
        failCount++;
        continue;
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('flashcard-images')
        .getPublicUrl(storagePath);

      log.success(`업로드: ${imageFile}`);
      uploadCount++;

      mappings.push({
        filename: imageFile,
        hebrew: '', // 나중에 매칭
        korean: romanized,
        publicUrl
      });

    } catch (error: any) {
      log.error(`업로드 오류: ${imageFile} - ${error.message}`);
      failCount++;
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  log.step('업로드 완료');
  log.success(`성공: ${uploadCount}개`);
  log.warn(`스킵: ${skipCount}개`);
  log.error(`실패: ${failCount}개`);

  // 4. 매핑 저장 (다음 스크립트에서 사용)
  const mappingPath = path.join(__dirname, 'genesis2_image_mappings.json');
  fs.writeFileSync(mappingPath, JSON.stringify({
    chapter: 2,
    uploaded: uploadCount,
    failed: failCount,
    mappings
  }, null, 2), 'utf-8');

  log.info(`매핑 저장: ${mappingPath}`);

  log.step('🎉 업로드 완료!');
  log.info('다음 단계: npx tsx scripts/images/syncGenesis2ToDatabase.ts');
}

main().catch(console.error);
