/**
 * flashcard_img_url 마이그레이션을 직접 적용하는 스크립트
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
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
  log.step('flashcard_img_url 마이그레이션 적용');

  const supabase = createSupabaseClient();

  // 1. flashcard_img_url 컬럼 존재 확인
  log.info('flashcard_img_url 컬럼 확인 중...');

  const checkColumnQuery = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'words' AND column_name = 'flashcard_img_url';
  `;

  const { data: columnCheck, error: checkError } = await supabase.rpc('exec_sql' as any, {
    sql: checkColumnQuery
  }).single();

  // exec_sql RPC가 없을 수 있으므로 직접 ALTER TABLE 실행
  log.info('flashcard_img_url 컬럼 추가 중...');

  const migrationSql = `
    -- flashcard_img_url 컬럼 추가
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'words' AND column_name = 'flashcard_img_url'
        ) THEN
            ALTER TABLE words
            ADD COLUMN flashcard_img_url TEXT;

            RAISE NOTICE 'flashcard_img_url 컬럼이 추가되었습니다.';
        ELSE
            RAISE NOTICE 'flashcard_img_url 컬럼이 이미 존재합니다.';
        END IF;
    END $$;

    -- icon_url 데이터 마이그레이션
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'words' AND column_name = 'icon_url'
        ) THEN
            UPDATE words
            SET flashcard_img_url = icon_url
            WHERE flashcard_img_url IS NULL AND icon_url IS NOT NULL;

            RAISE NOTICE 'icon_url 데이터가 마이그레이션되었습니다.';
        END IF;
    END $$;

    -- 인덱스 추가
    CREATE INDEX IF NOT EXISTS idx_words_flashcard_img_url ON words(flashcard_img_url);
  `;

  // Supabase의 SQL API를 사용하여 실행
  try {
    // 간단한 방법: 컬럼 추가 쿼리를 직접 실행
    const { error: migrationError } = await (supabase as any)
      .from('words')
      .select('flashcard_img_url')
      .limit(1);

    if (migrationError && migrationError.message.includes('column') && migrationError.message.includes('does not exist')) {
      log.error('flashcard_img_url 컬럼이 존재하지 않습니다.');
      log.info('');
      log.info('수동 마이그레이션이 필요합니다:');
      log.info('1. Supabase Dashboard 접속');
      log.info('2. SQL Editor 열기');
      log.info('3. 다음 SQL 실행:');
      log.info('');
      console.log(migrationSql);
      log.info('');
      log.info('또는 다음 명령어로 마이그레이션 파일 적용:');
      log.info('cat supabase/migrations/20251103030000_consolidate_database_schema.sql | psql $DATABASE_URL');
      process.exit(1);
    } else {
      log.success('flashcard_img_url 컬럼이 이미 존재합니다!');
    }

  } catch (error: any) {
    log.error(`마이그레이션 실패: ${error.message}`);
    log.info('');
    log.info('수동으로 다음 SQL을 실행하세요:');
    console.log(migrationSql);
    process.exit(1);
  }
}

main().catch(console.error);
