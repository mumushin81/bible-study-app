import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 환경변수 검증 강화
if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 최대 파일 크기 제한 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function uploadHebrewIcons(iconDir: string) {
  try {
    if (!fs.existsSync(iconDir)) {
      throw new Error(`디렉토리가 존재하지 않습니다: ${iconDir}`);
    }

    const files = fs.readdirSync(iconDir)
      .filter(file => path.extname(file).toLowerCase() === '.jpg')
      .filter(file => {
        const stats = fs.statSync(path.join(iconDir, file));
        if (stats.size > MAX_FILE_SIZE) {
          console.warn(`⚠️ 파일 크기 초과: ${file} (최대 5MB)`);
          return false;
        }
        return true;
      });

    console.log(`📸 총 ${files.length}개의 이미지 파일 발견`);

    const uploadPromises = files.map(async (file) => {
      const filePath = path.join(iconDir, file);
      const fileBuffer = fs.readFileSync(filePath);

      if (!file.startsWith('word_')) {
        console.warn(`⚠️ 파일명 규칙 미준수: ${file}`);
        return null;
      }

      try {
        const { data, error } = await supabase.storage
          .from('hebrew-icons')
          .upload(`icons/${file}`, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (error) throw error;
        return `✅ ${file} 업로드 성공`;
      } catch (uploadError) {
        return `❌ ${file} 업로드 실패: ${uploadError instanceof Error ? uploadError.message : '알 수 없는 오류'}`;
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        console.log(result.value);
      }
    });

    const failedUploads = results.filter(
      result => result.status === 'rejected' ||
      (result.status === 'fulfilled' && result.value?.startsWith('❌'))
    );

    if (failedUploads.length > 0) {
      console.error(`\n❗ ${failedUploads.length}개의 파일 업로드 실패`);
      process.exit(1);
    }

  } catch (error) {
    console.error('📛 이미지 업로드 중 치명적 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
const iconDir = path.join(__dirname, '..', 'icons');
uploadHebrewIcons(iconDir);