/**
 * 매칭된 169개 이미지를 Supabase Storage에 업로드
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

// Supabase 설정
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  log.error('환경 변수 VITE_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  log.step('169개 이미지 Supabase 업로드 시작');

  // 1. 매칭 데이터 로드
  const matchDataPath = path.join(__dirname, 'matched-images-nikud.json');
  if (!fs.existsSync(matchDataPath)) {
    log.error('매칭 데이터 파일이 없습니다. matchWithoutNikud.ts를 먼저 실행하세요.');
    process.exit(1);
  }

  const matchData = JSON.parse(fs.readFileSync(matchDataPath, 'utf-8'));
  const matched = matchData.matched;

  log.info(`${matched.length}개 이미지 매칭 데이터 로드됨`);

  // 2. flashcard-images 버킷 확인/생성
  const bucketName = 'flashcard-images';
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === bucketName);

  if (!bucketExists) {
    log.step(`${bucketName} 버킷 생성 중...`);
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });

    if (error) {
      log.error(`버킷 생성 실패: ${error.message}`);
      process.exit(1);
    }
    log.success(`${bucketName} 버킷 생성 완료`);
  } else {
    log.info(`${bucketName} 버킷 이미 존재`);
  }

  // 3. 이미지 업로드
  const imagesDir = path.join(__dirname, '../../public/images/words');
  const uploadResults: Array<{
    hebrew: string;
    originalFilename: string;
    supabaseFilename: string;
    url: string;
    korean: string;
    verseId: string;
  }> = [];

  const failedUploads: Array<{
    filename: string;
    error: string;
  }> = [];

  log.step(`업로드 시작 (총 ${matched.length}개)`);

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < matched.length; i++) {
    const item = matched[i];
    const localPath = path.join(imagesDir, item.filename);

    if (!fs.existsSync(localPath)) {
      log.warn(`파일 없음: ${item.filename}`);
      failedUploads.push({ filename: item.filename, error: '파일 없음' });
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const storagePath = `words/${item.supabaseFilename}`;

    // 기존 파일 확인
    const { data: existing } = await supabase.storage
      .from(bucketName)
      .list('words', {
        search: item.supabaseFilename
      });

    if (existing && existing.length > 0) {
      log.info(`[${i + 1}/${matched.length}] 스킵: ${item.supabaseFilename} (이미 존재)`);

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(storagePath);

      uploadResults.push({
        hebrew: item.hebrew,
        originalFilename: item.filename,
        supabaseFilename: item.supabaseFilename,
        url: urlData.publicUrl,
        korean: item.korean,
        verseId: item.verseId
      });
      skipCount++;
      continue;
    }

    // 업로드
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      log.error(`[${i + 1}/${matched.length}] 실패: ${item.filename} - ${error.message}`);
      failedUploads.push({ filename: item.filename, error: error.message });
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    uploadResults.push({
      hebrew: item.hebrew,
      originalFilename: item.filename,
      supabaseFilename: item.supabaseFilename,
      url: urlData.publicUrl,
      korean: item.korean,
      verseId: item.verseId
    });

    successCount++;
    log.success(`[${i + 1}/${matched.length}] ${item.filename} → ${item.supabaseFilename}`);

    // API 호출 제한 방지 (100ms 딜레이)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 4. 결과 저장
  const outputPath = path.join(__dirname, 'upload-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    uploadResults,
    failedUploads,
    summary: {
      total: matched.length,
      success: successCount,
      skipped: skipCount,
      failed: failedUploads.length,
      successRate: `${((successCount / matched.length) * 100).toFixed(1)}%`
    }
  }, null, 2), 'utf-8');

  log.step('업로드 완료');
  log.success(`성공: ${successCount}개`);
  log.info(`스킵: ${skipCount}개`);
  if (failedUploads.length > 0) {
    log.error(`실패: ${failedUploads.length}개`);
    failedUploads.forEach(f => {
      log.error(`  - ${f.filename}: ${f.error}`);
    });
  }

  log.step('💡 다음 단계');
  log.info('JSON 파일 업데이트: npx tsx scripts/migration/updateJsonWithUrls.ts');
}

main().catch(err => {
  log.error(`오류 발생: ${err.message}`);
  process.exit(1);
});
