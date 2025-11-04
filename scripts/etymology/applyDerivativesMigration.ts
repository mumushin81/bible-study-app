/**
 * Apply derivatives column migration to hebrew_roots table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 hebrew_roots 테이블에 derivatives 컬럼 추가 중...\n');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE hebrew_roots
      ADD COLUMN IF NOT EXISTS derivatives JSONB DEFAULT '[]'::jsonb;
    `
  });

  if (error) {
    console.error('❌ Migration 실패:', error.message);
    console.log('\n💡 대안: Supabase Dashboard에서 SQL Editor로 직접 실행하세요:');
    console.log('   ALTER TABLE hebrew_roots ADD COLUMN IF NOT EXISTS derivatives JSONB DEFAULT \'[]\'::jsonb;');
    process.exit(1);
  }

  console.log('✅ derivatives 컬럼 추가 완료!');

  // 컬럼 확인
  const { data, error: selectError } = await supabase
    .from('hebrew_roots')
    .select('root, derivatives')
    .limit(1);

  if (selectError) {
    console.error('⚠️  컬럼 확인 실패:', selectError.message);
  } else {
    console.log('✅ 컬럼 정상 확인됨:', data);
  }
}

applyMigration().catch(console.error);
