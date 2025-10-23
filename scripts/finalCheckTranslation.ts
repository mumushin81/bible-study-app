import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function finalCheck() {
  const { data, error } = await supabase
    .from('verses')
    .select('chapter, verse_number, translation')
    .eq('book_id', 'genesis')
    .lte('chapter', 3)
    .order('chapter')
    .order('verse_number');

  if (error) throw error;

  const total = data.length;
  const filled = data.filter(v => v.translation).length;
  const missing = data.filter(v => v.translation === null);

  console.log('\n📊 Genesis 1-3 Translation 필드 최종 현황:\n');
  console.log(`총 구절: ${total}`);
  console.log(`Translation 있음: ${filled} ✅`);
  console.log(`Translation 누락: ${missing.length} ${missing.length === 0 ? '✅' : '❌'}`);

  if (missing.length > 0) {
    console.log('\n아직 누락된 구절:');
    missing.forEach(v => console.log(`  - ${v.chapter}:${v.verse_number}`));
  } else {
    console.log('\n🎉 모든 구절의 translation 필드가 채워졌습니다!\n');
  }
}

finalCheck();
