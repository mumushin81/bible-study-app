/**
 * 모든 마이그레이션을 Supabase에 실행하는 스크립트
 *
 * 사용법:
 *   npx tsx scripts/runAllMigrations.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createSupabaseClient } from './utils/supabase.js';

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

async function runMigration(supabase: any, filePath: string) {
  const fileName = path.basename(filePath);

  try {
    log.step(`마이그레이션 실행: ${fileName}`);

    // SQL 파일 읽기
    const sql = fs.readFileSync(filePath, 'utf-8');

    // SQL 실행 (Supabase는 직접 SQL 실행을 지원하지 않으므로 안내 메시지 출력)
    log.warn('⚠️  Supabase는 클라이언트에서 직접 SQL 실행을 지원하지 않습니다.');
    log.info('다음 SQL을 Supabase 대시보드 → SQL Editor에 복사하여 실행하세요:\n');

    console.log('━'.repeat(80));
    console.log(sql);
    console.log('━'.repeat(80));
    console.log('\n');

    return true;
  } catch (error: any) {
    log.error(`${fileName}: ${error.message}`);
    return false;
  }
}

async function main() {
  log.step('마이그레이션 스크립트 시작');

  const supabase = createSupabaseClient();
  const migrationsDir = path.join(__dirname, '../supabase/migrations');

  if (!fs.existsSync(migrationsDir)) {
    log.error(`마이그레이션 폴더가 존재하지 않습니다: ${migrationsDir}`);
    process.exit(1);
  }

  // 마이그레이션 파일 목록
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  log.info(`총 ${files.length}개 마이그레이션 파일 발견\n`);

  // 특정 마이그레이션만 실행 (user_preferences)
  const targetMigration = '004_user_preferences.sql';
  const targetFile = files.find(f => f === targetMigration);

  if (!targetFile) {
    log.error(`${targetMigration} 파일을 찾을 수 없습니다.`);
    process.exit(1);
  }

  const filePath = path.join(migrationsDir, targetFile);
  await runMigration(supabase, filePath);

  log.step('\n✅ 완료!');
  log.info('\nSupabase 대시보드에서 SQL을 실행한 후:');
  log.info('1. Realtime 활성화:');
  log.info('   ALTER TABLE user_preferences REPLICA IDENTITY FULL;');
  log.info('2. 테이블 확인:');
  log.info('   SELECT * FROM user_preferences LIMIT 1;');
}

main().catch(console.error);
