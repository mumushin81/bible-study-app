import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function addUniqueConstraint() {
  console.log('🔒 UNIQUE 제약조건 추가 중...\n');

  try {
    // Supabase의 SQL Editor를 통해 실행해야 하는 SQL
    const sql = `
ALTER TABLE verses
ADD CONSTRAINT unique_verse
UNIQUE (book_id, chapter, verse_number);
`;

    console.log('📋 실행할 SQL:\n');
    console.log(sql);
    console.log('\n⚠️  주의: 이 SQL은 Supabase Dashboard의 SQL Editor에서 직접 실행해야 합니다.');
    console.log('   경로: Supabase Dashboard → SQL Editor → New Query\n');

    // RPC를 통한 실행 시도 (권한이 있다면)
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      console.log('⚠️  RPC 실행 실패 (예상된 동작):', error.message);
      console.log('\n✅ 해결 방법:');
      console.log('   1. Supabase Dashboard에 로그인');
      console.log('   2. SQL Editor 열기');
      console.log('   3. 위의 SQL 복사/붙여넣기');
      console.log('   4. Run 버튼 클릭\n');
    } else {
      console.log('✅ UNIQUE 제약조건이 성공적으로 추가되었습니다!');
    }

    // 현재 제약조건 확인
    console.log('\n🔍 현재 verses 테이블 제약조건 확인 중...\n');

    const { data: constraints, error: checkError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'verses');

    if (checkError) {
      console.log('⚠️  제약조건 조회 권한 없음 (예상된 동작)');
    } else if (constraints) {
      console.log('📊 현재 제약조건:');
      constraints.forEach((c: any) => {
        console.log(`   - ${c.constraint_name} (${c.constraint_type})`);
      });
    }

  } catch (err: any) {
    console.error('❌ 오류:', err.message);
  }
}

addUniqueConstraint().catch(console.error);
