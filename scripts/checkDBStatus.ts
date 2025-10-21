import { createSupabaseClient } from './utils/supabase';

async function checkDBStatus() {
  const supabase = createSupabaseClient();

  console.log('📊 데이터베이스 상태 확인 중...\n');

  // 창세기 전체 절 수 확인
  const { data: allVerses, error: allError, count } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', 1);

  if (allError) {
    console.error('❌ Error:', allError);
    return;
  }

  console.log(`📖 창세기 총 절 수: ${count}\n`);

  // 장별 절 수 확인
  const { data: verses, error } = await supabase
    .from('verses')
    .select('chapter')
    .eq('book_id', 1)
    .order('chapter');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  const chapters: Record<number, number> = {};
  verses.forEach(v => chapters[v.chapter] = (chapters[v.chapter] || 0) + 1);

  console.log('장별 절 수:');
  Object.keys(chapters)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(ch => {
      console.log(`  Chapter ${ch}: ${chapters[ch]} verses`);
    });

  // 마지막 장 확인
  const maxChapter = Math.max(...Object.keys(chapters).map(Number));
  console.log(`\n✅ 마지막 장: ${maxChapter}장 (${chapters[maxChapter]}절)`);
}

checkDBStatus().catch(console.error);
