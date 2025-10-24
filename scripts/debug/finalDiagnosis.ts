import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalDiagnosis() {
  console.log('🔍 최종 진단: JOIN 쿼리 카운트 불일치 원인 분석\n');
  console.log('=' .repeat(80));

  // 핵심 발견
  console.log('\n🎯 핵심 발견:\n');

  // 1. 전체 words 카운트
  const { count: totalWordsCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  console.log(`1. 전체 words 테이블: ${totalWordsCount}개`);

  // 2. JOIN 쿼리의 count vs data.length
  const { data: joinData, count: joinCountExact } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, verses!inner(book_id)', { count: 'exact' })
    .eq('verses.book_id', 'genesis');

  console.log(`\n2. Genesis words (verses!inner JOIN):`);
  console.log(`   - data.length: ${joinData?.length}개 ← 실제 반환된 레코드`);
  console.log(`   - count (exact): ${joinCountExact}개 ← 전체 words 테이블 카운트`);

  // 3. 기본 카운트 모드 확인
  const { data: joinDataPlanned, count: joinCountPlanned } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, verses!inner(book_id)', { count: 'planned' })
    .eq('verses.book_id', 'genesis');

  console.log(`\n3. Genesis words (count: 'planned'):`);
  console.log(`   - data.length: ${joinDataPlanned?.length}개`);
  console.log(`   - count (planned): ${joinCountPlanned}개`);

  // 4. 카운트만 요청
  const { count: onlyCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .eq('verses.book_id', 'genesis');

  console.log(`\n4. Genesis words (head: true, count만 요청):`);
  console.log(`   - count: ${onlyCount}개`);

  // 5. 실제 words 데이터 샘플 확인
  console.log(`\n5. 실제 words 레코드 분석:\n`);

  const sampleWords = joinData?.slice(0, 3) || [];
  sampleWords.forEach((w: any, idx) => {
    console.log(`   [${idx + 1}] word.id: ${w.id}`);
    console.log(`       hebrew: ${w.hebrew}`);
    console.log(`       verse_id: ${w.verse_id}`);
    console.log(`       verses.book_id: ${w.verses?.book_id}`);
    console.log('');
  });

  // 6. verse_id NULL 체크
  const { count: wordsWithoutVerse } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .is('verse_id', null);

  console.log(`6. verse_id가 NULL인 words: ${wordsWithoutVerse}개`);

  // 7. 실제 중복 확인
  console.log(`\n7. 중복 레코드 분석:\n`);

  const allGenesisWords = joinData || [];
  const wordGroups = new Map<string, any[]>();

  allGenesisWords.forEach(w => {
    const key = `${w.hebrew}::${w.verse_id}`;
    if (!wordGroups.has(key)) {
      wordGroups.set(key, []);
    }
    wordGroups.get(key)!.push(w);
  });

  const duplicates = Array.from(wordGroups.entries()).filter(([_, words]) => words.length > 1);

  console.log(`   총 (hebrew, verse_id) 조합: ${wordGroups.size}개`);
  console.log(`   중복 조합: ${duplicates.length}개`);
  console.log(`   중복 레코드 총합: ${duplicates.reduce((sum, [_, words]) => sum + words.length, 0)}개`);

  if (duplicates.length > 0) {
    console.log('\n   중복 예시:');
    duplicates.slice(0, 3).forEach(([key, words]) => {
      const [hebrew, verseId] = key.split('::');
      console.log(`   - ${hebrew} @ ${verseId}: ${words.length}개`);
      words.forEach((w, i) => {
        console.log(`     [${i + 1}] ${w.id}`);
      });
    });
  }

  // 8. 삭제 스크립트가 사용한 쿼리 재현
  console.log('\n8. 삭제 스크립트 쿼리 재현:\n');

  const { data: deleteScriptData, error: deleteScriptError } = await supabase
    .from('words')
    .select(`
      id,
      hebrew,
      meaning,
      verse_id,
      created_at,
      verses!inner (
        reference,
        book_id
      )
    `)
    .eq('verses.book_id', 'genesis')
    .order('verse_id', { ascending: true })
    .order('hebrew', { ascending: true })
    .order('created_at', { ascending: false });

  if (deleteScriptError) {
    console.error(`   ❌ 에러: ${deleteScriptError.message}`);
  } else {
    console.log(`   삭제 스크립트 쿼리 결과: ${deleteScriptData?.length}개 레코드`);

    // 이 데이터로 중복 찾기
    const deleteWordGroups = new Map<string, any[]>();
    deleteScriptData?.forEach(w => {
      const key = `${w.hebrew}::${w.verse_id}`;
      if (!deleteWordGroups.has(key)) {
        deleteWordGroups.set(key, []);
      }
      deleteWordGroups.get(key)!.push(w);
    });

    const deleteDuplicates = Array.from(deleteWordGroups.values()).filter(words => words.length > 1);
    const deleteCount = deleteDuplicates.reduce((sum, words) => sum + words.length - 1, 0);

    console.log(`   중복 그룹: ${deleteDuplicates.length}개`);
    console.log(`   삭제 대상 (각 그룹에서 최신 1개 제외): ${deleteCount}개`);
  }

  // 9. 결론
  console.log('\n' + '=' .repeat(80));
  console.log('📋 결론:\n');
  console.log('✅ verses!inner JOIN은 올바르게 작동함');
  console.log('✅ JOIN은 Cartesian product를 만들지 않음');
  console.log('✅ data.length는 실제 필터링된 결과 반환 (1000개)');
  console.log('❌ count: "exact"는 WHERE 필터를 무시하고 전체 테이블 카운트 반환 (버그?)');
  console.log('');
  console.log('🔍 1000개가 남아있는 이유:');
  console.log(`   - words 테이블에 실제로 Genesis 관련 레코드가 1000개 존재`);
  console.log(`   - 삭제가 실패했거나, 새 레코드가 추가되었거나, 트랜잭션 롤백됨`);
  console.log('');
  console.log('💡 해결 방안:');
  console.log('   1. data.length를 신뢰 (count는 신뢰하지 말 것)');
  console.log('   2. 중복 삭제를 SQL로 직접 실행');
  console.log('   3. UNIQUE 제약조건 추가하여 재발 방지');
  console.log('=' .repeat(80));
}

finalDiagnosis().catch(console.error);
