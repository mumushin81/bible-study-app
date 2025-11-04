/**
 * Supabase Storage에 있는 모든 이미지 확인
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
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
  log.step('Supabase Storage 이미지 확인');

  const supabase = createSupabaseClient();

  // 모든 버킷 조회
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    log.error(`버킷 조회 실패: ${bucketsError.message}`);
    process.exit(1);
  }

  log.success(`총 ${buckets?.length}개 버킷 발견`);
  buckets?.forEach(bucket => {
    log.info(`  - ${bucket.name} (${bucket.public ? '공개' : '비공개'})`);
  });

  // 각 버킷의 파일 조회
  for (const bucket of buckets || []) {
    log.step(`\n📁 버킷: ${bucket.name}`);

    // 버킷 내 모든 파일 조회
    const { data: files, error: filesError } = await supabase.storage
      .from(bucket.name)
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (filesError) {
      log.warn(`파일 조회 실패: ${filesError.message}`);
      continue;
    }

    if (!files || files.length === 0) {
      log.info('파일 없음');
      continue;
    }

    log.success(`${files.length}개 파일/폴더 발견`);

    // 폴더별로 탐색
    for (const item of files) {
      if (item.id === null) {
        // 폴더인 경우
        log.info(`\n  📂 ${item.name}/`);

        const { data: folderFiles } = await supabase.storage
          .from(bucket.name)
          .list(item.name, {
            limit: 1000,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (folderFiles && folderFiles.length > 0) {
          log.success(`    ${folderFiles.length}개 파일`);

          // 처음 10개만 샘플 출력
          folderFiles.slice(0, 10).forEach(file => {
            const url = supabase.storage.from(bucket.name).getPublicUrl(`${item.name}/${file.name}`).data.publicUrl;
            log.info(`    - ${file.name} (${(file.metadata?.size || 0 / 1024).toFixed(1)} KB)`);
          });

          if (folderFiles.length > 10) {
            log.info(`    ... 외 ${folderFiles.length - 10}개 파일`);
          }
        }
      } else {
        // 파일인 경우
        log.info(`  📄 ${item.name}`);
      }
    }
  }

  log.step('\n💡 다음 단계');
  log.info('특정 버킷의 이미지를 JSON에 매핑하려면:');
  log.info('  npx tsx scripts/storage/mapStorageImages.ts [버킷명] [폴더명]');
}

main().catch(console.error);
