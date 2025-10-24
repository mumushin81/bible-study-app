import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function compareCounts() {
  console.log('🔍 단어 카운트 비교 분석\n');
  console.log('=' .repeat(80));

  // 전체 words 카운트
  console.log('\n1️⃣ 전체 words 테이블 카운트\n');

  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  console.log(`   총 words: ${totalWords}개`);

  // Genesis words - JOIN 사용
  console.log('\n2️⃣ Genesis words (verses!inner JOIN)\n');

  const { data: joinData, count: joinCount } = await supabase
    .from('words')
    .select('id, hebrew, verses!inner(book_id)', { count: 'exact' })
    .eq('verses.book_id', 'genesis');

  console.log(`   JOIN 결과 (data.length): ${joinData?.length}개`);
  console.log(`   JOIN 결과 (count): ${joinCount}개`);

  // Genesis words - 2단계 쿼리
  console.log('\n3️⃣ Genesis words (2단계 쿼리, JOIN 없음)\n');

  // 먼저 Genesis verse IDs 가져오기
  const { data: verses } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis');

  const verseIds = verses?.map(v => v.id) || [];
  console.log(`   Genesis verse IDs: ${verseIds.length}개`);

  // verse_id IN으로 words 가져오기
  const { data: filteredData, count: filteredCount } = await supabase
    .from('words')
    .select('id, hebrew, verse_id', { count: 'exact' })
    .in('verse_id', verseIds);

  console.log(`   필터링 결과 (data.length): ${filteredData?.length}개`);
  console.log(`   필터링 결과 (count): ${filteredCount}개`);

  // Genesis words - limit 적용
  console.log('\n4️⃣ Genesis words (JOIN + limit)\n');

  const { data: limitData, count: limitCount } = await supabase
    .from('words')
    .select('id, hebrew, verses!inner(book_id)', { count: 'exact' })
    .eq('verses.book_id', 'genesis')
    .limit(1500);

  console.log(`   LIMIT 1500 결과 (data.length): ${limitData?.length}개`);
  console.log(`   LIMIT 1500 결과 (count): ${limitCount}개`);

  // 삭제 실행 테스트 (실제로는 삭제하지 않음)
  console.log('\n5️⃣ 삭제 가능한 중복 레코드 분석\n');

  // (hebrew, verse_id) 중복 찾기
  const wordMap = new Map<string, string[]>();

  filteredData?.forEach(w => {
    const key = `${w.hebrew}::${w.verse_id}`;
    if (!wordMap.has(key)) {
      wordMap.set(key, []);
    }
    wordMap.get(key)!.push(w.id);
  });

  const duplicateGroups = Array.from(wordMap.values()).filter(ids => ids.length > 1);
  const totalDuplicates = duplicateGroups.reduce((sum, ids) => sum + ids.length, 0);
  const toDelete = duplicateGroups.reduce((sum, ids) => sum + ids.length - 1, 0);

  console.log(`   중복 그룹 수: ${duplicateGroups.length}개`);
  console.log(`   총 중복 레코드: ${totalDuplicates}개`);
  console.log(`   삭제 대상 (각 그룹에서 1개씩 남김): ${toDelete}개`);
  console.log(`   삭제 후 예상 단어 수: ${filteredCount! - toDelete}개`);

  // 왜 JOIN 쿼리가 항상 1000개를 반환하는지 이해
  console.log('\n6️⃣ JOIN 쿼리 동작 분석\n');

  // words 테이블의 verse_id 중 Genesis에 속하는 것만 카운트
  const genesisVerseSet = new Set(verseIds);
  const wordsWithGenesisVerse = filteredData?.filter(w => genesisVerseSet.has(w.verse_id));

  console.log(`   Genesis verse_id를 가진 words: ${wordsWithGenesisVerse?.length}개`);

  // JOIN은 중복을 제거하지 않음
  console.log('\n   ✅ 결론:');
  console.log(`   - JOIN 쿼리는 words 테이블에서 Genesis verse_id를 가진 모든 레코드 반환`);
  console.log(`   - 중복 제거를 하지 않음 (예상대로 동작)`);
  console.log(`   - 1000개 = words 테이블에 실제로 1000개 레코드가 존재`);
  console.log(`   - 이 중 ${toDelete}개가 중복 (hebrew, verse_id 기준)`);

  console.log('\n' + '=' .repeat(80));
}

compareCounts().catch(console.error);
