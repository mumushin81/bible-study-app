import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkByChapter() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Genesis 1-3장 Words & Commentaries 챕터별 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (let chapter = 1; chapter <= 3; chapter++) {
    console.log(`\n📖 Genesis ${chapter}장`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 해당 챕터의 구절 조회
    const { data: verses } = await supabase
      .from('verses')
      .select('id, reference')
      .eq('book_id', 'genesis')
      .eq('chapter', chapter)
      .order('verse_number', { ascending: true });

    console.log(`총 구절 수: ${verses?.length || 0}`);

    if (!verses || verses.length === 0) continue;

    // Words 조회
    const { data: words, count: wordsCount } = await supabase
      .from('words')
      .select('id', { count: 'exact' })
      .in('verse_id', verses.map(v => v.id));

    console.log(`Words: ${wordsCount || 0}개`);

    // Commentaries 조회
    const { data: commentaries, count: commCount } = await supabase
      .from('commentaries')
      .select('id', { count: 'exact' })
      .in('verse_id', verses.map(v => v.id));

    console.log(`Commentaries: ${commCount || 0}개`);

    // Commentary Sections 조회
    if (commentaries && commentaries.length > 0) {
      const { count: sectionsCount } = await supabase
        .from('commentary_sections')
        .select('id', { count: 'exact' })
        .in('commentary_id', commentaries.map(c => c.id));

      console.log(`Commentary Sections: ${sectionsCount || 0}개`);
    }

    // Why Questions 조회
    const { count: questionsCount } = await supabase
      .from('why_questions')
      .select('id', { count: 'exact' })
      .in('verse_id', verses.map(v => v.id));

    console.log(`Why Questions: ${questionsCount || 0}개`);

    // Conclusions 조회
    const { count: conclusionsCount } = await supabase
      .from('commentary_conclusions')
      .select('id', { count: 'exact' })
      .in('verse_id', verses.map(v => v.id));

    console.log(`Conclusions: ${conclusionsCount || 0}개`);

    // 상태 표시
    if (wordsCount === 0 && commCount === 0) {
      console.log('\n❌ 문제: Words와 Commentaries가 없습니다!');
    } else {
      console.log('\n✅ Words와 Commentaries 존재');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 전체 통계
  const { count: totalWords } = await supabase
    .from('words')
    .select('id', { count: 'exact' })
    .like('verse_id', 'genesis_%');

  const { count: totalComm } = await supabase
    .from('commentaries')
    .select('id', { count: 'exact' })
    .like('verse_id', 'genesis_%');

  console.log(`전체 Genesis Words: ${totalWords}`);
  console.log(`전체 Genesis Commentaries: ${totalComm}\n`);
}

checkByChapter();
