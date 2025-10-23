import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkReferences() {
  console.log('🔍 데이터베이스의 verses 확인 중...\n');

  // Genesis 1장의 모든 구절 가져오기
  const { data: verses, error } = await supabase
    .from('verses')
    .select('id, reference, chapter, verse_number')
    .eq('chapter', 1)
    .order('verse_number')
    .limit(10);

  if (error) {
    console.error('❌ 조회 실패:', error);
    return;
  }

  console.log(`📖 Genesis 1장 구절 (처음 10개):\n`);
  verses?.forEach(v => {
    console.log(`  - ${v.reference} (ID: ${v.id}, Chapter: ${v.chapter}, Verse: ${v.verse_number})`);
  });

  // 특정 패턴으로 검색
  const { data: gen1_1, error: searchError } = await supabase
    .from('verses')
    .select('id, reference, chapter, verse_number')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .limit(5);

  console.log(`\n🔎 Chapter=1, Verse=1 검색 결과:\n`);
  gen1_1?.forEach(v => {
    console.log(`  - ${v.reference} (ID: ${v.id})`);
  });
}

checkReferences();
