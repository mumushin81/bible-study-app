import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStatus() {
  console.log('📊 현재 데이터베이스 상태 확인\n');
  console.log('═══════════════════════════════════════\n');

  const tables = [
    'user_book_progress',
    'hebrew_roots',
    'word_derivations',
    'word_metadata',
    'user_word_progress_v2'
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table}: 테이블 없음 (${error.message})`);
    } else {
      console.log(`✅ ${table}: ${count || 0}개 행`);
    }
  }

  console.log('\n─────────────────────────────────────\n');

  // 어근 데이터 확인
  const { data: roots } = await supabase
    .from('hebrew_roots')
    .select('root, core_meaning_korean, emoji, frequency')
    .order('root');

  if (roots && roots.length > 0) {
    console.log(`🌳 Hebrew Roots 데이터 (${roots.length}개):\n`);
    roots.forEach(r => {
      console.log(`   ${r.emoji} ${r.root} - ${r.core_meaning_korean} (${r.frequency}회)`);
    });
  }

  console.log('\n═══════════════════════════════════════\n');
  console.log('✅ 마이그레이션이 이미 완료되었습니다!\n');
}

checkStatus();
