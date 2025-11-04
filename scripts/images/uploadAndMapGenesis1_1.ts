/**
 * 창세기 1:1 플래시카드 이미지 자동 업로드 및 매핑 스크립트
 *
 * 작업 순서:
 * 1. Supabase Storage에 이미지 업로드
 * 2. Public URL 획득
 * 3. genesis_1_1.json에 flashcardImgUrl 추가
 * 4. 업데이트된 JSON 저장
 *
 * 사용법:
 *   tsx scripts/images/uploadAndMapGenesis1_1.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드
dotenv.config({ path: '.env.local' });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

// 파일명 → 히브리어 매핑
const WORD_IMAGE_MAPPING: Record<string, string> = {
  "bereshit.jpg": "בְּרֵאשִׁית",
  "bara.jpg": "בָּרָא",
  "elohim.jpg": "אֱלֹהִים",
  "et.jpg": "אֵת",
  "hashamayim.jpg": "הַשָּׁמַיִם",
  "veet.jpg": "וְאֵת",
  "haaretz.jpg": "הָאָרֶץ"
};

function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('환경 변수가 설정되지 않았습니다.');
    log.info('VITE_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요.');
    process.exit(1);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function ensureBucketExists(supabase: any, bucketName: string) {
  log.step(`Storage 버킷 확인: ${bucketName}`);

  // 버킷 목록 조회
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    log.error(`버킷 목록 조회 실패: ${listError.message}`);
    return false;
  }

  const bucketExists = buckets?.some((b: any) => b.name === bucketName);

  if (bucketExists) {
    log.success(`버킷 '${bucketName}' 이미 존재합니다.`);
    return true;
  }

  // 버킷 생성
  log.info(`버킷 '${bucketName}' 생성 중...`);
  const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  });

  if (createError) {
    log.error(`버킷 생성 실패: ${createError.message}`);
    return false;
  }

  log.success(`버킷 '${bucketName}' 생성 완료`);
  return true;
}

async function uploadImage(
  supabase: any,
  bucketName: string,
  filePath: string,
  fileName: string
): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const uploadPath = `genesis1_1/${fileName}`;

    // 기존 파일 삭제 (있을 경우)
    await supabase.storage.from(bucketName).remove([uploadPath]);

    // 새 파일 업로드
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      log.error(`${fileName} 업로드 실패: ${error.message}`);
      return null;
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);

    log.success(`${fileName} → ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;

  } catch (error: any) {
    log.error(`${fileName} 처리 실패: ${error.message}`);
    return null;
  }
}

async function updateJsonWithImageUrls(imageUrlMap: Record<string, string>) {
  log.step('JSON 파일 업데이트');

  const jsonPath = path.join(__dirname, '../../data/generated_v2/genesis_1_1.json');

  if (!fs.existsSync(jsonPath)) {
    log.error(`JSON 파일을 찾을 수 없습니다: ${jsonPath}`);
    return false;
  }

  try {
    // JSON 읽기
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    if (!jsonContent.words || !Array.isArray(jsonContent.words)) {
      log.error('JSON 파일에 words 배열이 없습니다.');
      return false;
    }

    // 각 단어에 flashcardImgUrl 추가
    let updatedCount = 0;
    for (const word of jsonContent.words) {
      const hebrew = word.hebrew;
      const imageUrl = imageUrlMap[hebrew];

      if (imageUrl) {
        word.flashcardImgUrl = imageUrl;
        updatedCount++;
        log.info(`${hebrew} → flashcardImgUrl 추가`);
      } else {
        log.warn(`${hebrew}에 대한 이미지 URL을 찾을 수 없습니다.`);
      }
    }

    // 업데이트된 JSON 저장
    fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf-8');
    log.success(`${updatedCount}개 단어의 flashcardImgUrl 업데이트 완료`);

    return true;

  } catch (error: any) {
    log.error(`JSON 업데이트 실패: ${error.message}`);
    return false;
  }
}

async function main() {
  log.step('창세기 1:1 플래시카드 이미지 업로드 시작');

  const supabase = createSupabaseClient();
  const bucketName = 'flashcard-images';
  const imageDir = path.join(__dirname, '../../output/genesis1_1_comparison/schnell');

  // 1. 이미지 디렉토리 확인
  if (!fs.existsSync(imageDir)) {
    log.error(`이미지 디렉토리를 찾을 수 없습니다: ${imageDir}`);
    process.exit(1);
  }

  // 2. Storage 버킷 확인/생성
  const bucketReady = await ensureBucketExists(supabase, bucketName);
  if (!bucketReady) {
    log.error('Storage 버킷 준비 실패');
    process.exit(1);
  }

  // 3. 이미지 업로드
  log.step('이미지 업로드 시작');
  const imageUrlMap: Record<string, string> = {};
  let uploadedCount = 0;

  for (const [fileName, hebrewWord] of Object.entries(WORD_IMAGE_MAPPING)) {
    const filePath = path.join(imageDir, fileName);

    if (!fs.existsSync(filePath)) {
      log.warn(`파일을 찾을 수 없습니다: ${fileName}`);
      continue;
    }

    const publicUrl = await uploadImage(supabase, bucketName, filePath, fileName);

    if (publicUrl) {
      imageUrlMap[hebrewWord] = publicUrl;
      uploadedCount++;
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  log.step('업로드 완료');
  log.success(`${uploadedCount}개 이미지 업로드 성공`);

  // 4. JSON 파일 업데이트
  const jsonUpdated = await updateJsonWithImageUrls(imageUrlMap);

  if (!jsonUpdated) {
    log.error('JSON 파일 업데이트 실패');
    process.exit(1);
  }

  // 5. 최종 안내
  log.step('다음 단계');
  log.info('1. JSON 파일이 업데이트되었습니다: data/generated_v2/genesis_1_1.json');
  log.info('2. 이제 데이터베이스에 업로드하세요:');
  log.info('   tsx scripts/uploadGeneratedV2.ts');
  log.info('');
  log.success('✨ 모든 작업이 완료되었습니다!');
}

main().catch(console.error);
