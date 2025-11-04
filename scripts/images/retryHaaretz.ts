/**
 * haaretz.jpg 재업로드 스크립트
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
};

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

async function main() {
  log.info('haaretz.jpg 재업로드 시작');

  const supabase = createSupabaseClient();
  const bucketName = 'flashcard-images';
  const fileName = 'haaretz.jpg';
  const filePath = path.join(__dirname, '../../output/genesis1_1_comparison/schnell', fileName);

  if (!fs.existsSync(filePath)) {
    log.error(`파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const uploadPath = `genesis1_1/${fileName}`;

    log.info(`파일 크기: ${fileBuffer.length} bytes`);

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
      log.error(`업로드 실패: ${error.message}`);
      process.exit(1);
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);

    log.success(`업로드 성공: ${publicUrlData.publicUrl}`);

    // JSON 파일 업데이트
    const jsonPath = path.join(__dirname, '../../data/generated_v2/genesis_1_1.json');
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const word = jsonContent.words.find((w: any) => w.hebrew === 'הָאָרֶץ');
    if (word) {
      word.flashcardImgUrl = publicUrlData.publicUrl;
      fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf-8');
      log.success('JSON 파일 업데이트 완료');
    }

  } catch (error: any) {
    log.error(`처리 실패: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
