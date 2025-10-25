#!/usr/bin/env tsx

/**
 * words 테이블에 icon_url 필드 추가
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function addIconUrlField() {
  console.log('🔧 words 테이블에 icon_url 필드 추가 중...\n')

  // SQL 실행: ALTER TABLE
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- icon_url 필드 추가 (이미 있으면 무시)
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='words' AND column_name='icon_url'
        ) THEN
          ALTER TABLE words ADD COLUMN icon_url TEXT;
          RAISE NOTICE 'icon_url 필드 추가 완료';
        ELSE
          RAISE NOTICE 'icon_url 필드가 이미 존재합니다';
        END IF;
      END $$;
    `
  })

  if (error) {
    // rpc가 없으면 직접 SQL로 시도
    console.log('⚠️  rpc 사용 불가, psql로 실행이 필요합니다.')
    console.log('\n다음 SQL을 Supabase Dashboard → SQL Editor에서 실행하세요:\n')
    console.log('━'.repeat(50))
    console.log(`
ALTER TABLE words ADD COLUMN IF NOT EXISTS icon_url TEXT;

COMMENT ON COLUMN words.icon_url IS 'JPG 아이콘 Supabase Storage URL';
    `.trim())
    console.log('━'.repeat(50))
    return
  }

  console.log('✅ icon_url 필드 추가 완료!')
}

addIconUrlField()
