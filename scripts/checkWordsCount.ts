import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbvekynhkfxdepsvvawg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidmVreW5oa2Z4ZGVwc3Z2YXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODc3MDEsImV4cCI6MjA1MjU2MzcwMX0.TrZWQxILJhp9D1K0pUHH3Pj1n6V7VQb0mJmBDcl7Dds';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWordsCount() {
  console.log('🔍 Words 테이블 현황 조사\n');

  // 전체 단어 개수
  const { count: totalCount, error: totalError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('❌ 전체 개수 조회 실패:', totalError.message);
    return;
  }

  console.log(`📊 총 단어 개수: ${totalCount}개\n`);

  // 장별 단어 개수
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number');

  if (versesError) {
    console.error('❌ 구절 조회 실패:', versesError.message);
    return;
  }

  // 장별로 그룹화
  const chapterGroups: Record<string, number> = {};

  for (const verse of verses || []) {
    const { count } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('verse_id', verse.id);

    const key = `${verse.book_id} ${verse.chapter}장`;
    chapterGroups[key] = (chapterGroups[key] || 0) + (count || 0);
  }

  console.log('📖 장별 단어 개수:\n');
  Object.entries(chapterGroups)
    .sort()
    .forEach(([chapter, count]) => {
      console.log(`  ${chapter}: ${count}개`);
    });

  console.log('\n');

  // 필드 완성도 확인
  const { data: allWords, error: wordsError } = await supabase
    .from('words')
    .select('letters, icon_svg, emoji, category, structure');

  if (wordsError) {
    console.error('❌ 단어 필드 조회 실패:', wordsError.message);
    return;
  }

  const hasLetters = allWords?.filter(w => w.letters).length || 0;
  const hasIconSvg = allWords?.filter(w => w.icon_svg).length || 0;
  const hasEmoji = allWords?.filter(w => w.emoji).length || 0;
  const hasCategory = allWords?.filter(w => w.category).length || 0;
  const hasStructure = allWords?.filter(w => w.structure).length || 0;

  console.log('📋 필드 완성도:\n');
  console.log(`  letters:   ${hasLetters}/${totalCount} (${((hasLetters/totalCount!)*100).toFixed(1)}%)`);
  console.log(`  icon_svg:  ${hasIconSvg}/${totalCount} (${((hasIconSvg/totalCount!)*100).toFixed(1)}%)`);
  console.log(`  emoji:     ${hasEmoji}/${totalCount} (${((hasEmoji/totalCount!)*100).toFixed(1)}%)`);
  console.log(`  category:  ${hasCategory}/${totalCount} (${((hasCategory/totalCount!)*100).toFixed(1)}%)`);
  console.log(`  structure: ${hasStructure}/${totalCount} (${((hasStructure/totalCount!)*100).toFixed(1)}%)`);

  console.log('\n');

  // 샘플 단어 3개 출력
  const { data: sampleWords } = await supabase
    .from('words')
    .select('hebrew, meaning, letters, icon_svg, emoji')
    .limit(3);

  console.log('📝 샘플 단어 3개:\n');
  sampleWords?.forEach((word, i) => {
    console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   - letters: ${word.letters || 'NULL'}`);
    console.log(`   - icon_svg: ${word.icon_svg ? 'EXISTS' : 'NULL'}`);
    console.log(`   - emoji: ${word.emoji || 'NULL'}\n`);
  });

  process.exit(0);
}

checkWordsCount().catch(console.error);
