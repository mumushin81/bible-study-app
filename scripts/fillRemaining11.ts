import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const missing = [
  '1:5', '1:8', '1:13', '1:19', '1:23', '1:31',
  '2:3',
  '3:15', '3:16', '3:21', '3:24'
];

async function fillRemaining() {
  console.log('\n📝 나머지 11개 구절 translation 필드 채우기:\n');

  for (const verse of missing) {
    const [ch, v] = verse.split(':').map(Number);

    // modern 값 가져오기
    const { data: verseData } = await supabase
      .from('verses')
      .select('id, modern')
      .eq('book_id', 'genesis')
      .eq('chapter', ch)
      .eq('verse_number', v)
      .single();

    if (verseData && verseData.modern) {
      // translation 업데이트
      const { error } = await supabase
        .from('verses')
        .update({ translation: verseData.modern })
        .eq('id', verseData.id);

      if (error) {
        console.log(`❌ ${ch}:${v} 실패: ${error.message}`);
      } else {
        console.log(`✅ ${ch}:${v}: "${verseData.modern.substring(0, 40)}..."`);
      }
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log('\n✅ 11개 구절 translation 필드 업데이트 완료\n');
}

fillRemaining();
