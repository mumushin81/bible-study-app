import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔄 어근 발음기호 필드 추가 마이그레이션 시작...\n');

  try {
    // SQL 파일 읽기
    const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20251022_add_root_pronunciation.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // SQL 실행 (Supabase에서는 직접 ALTER TABLE을 실행할 수 없으므로, 개별 업데이트만 진행)
    console.log('⚠️  주의: ALTER TABLE은 Supabase Dashboard에서 수동으로 실행해야 합니다.');
    console.log('📝 다음 SQL을 Supabase SQL Editor에서 실행하세요:\n');
    console.log('ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS pronunciation TEXT;\n');

    console.log('✅ 발음기호 데이터 업데이트는 generateHebrewRoots.ts에 포함됩니다.');
    console.log('✅ npm run roots:generate 를 다시 실행하면 발음기호가 포함됩니다.');

  } catch (err) {
    console.error('❌ 오류 발생:', err);
    process.exit(1);
  }

  console.log('\n✨ 마이그레이션 안내 완료!');
  process.exit(0);
}

runMigration();
