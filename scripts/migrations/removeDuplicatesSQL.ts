import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicatesSQL() {
  console.log('🔧 SQL을 사용한 중복 레코드 제거...\n');
  console.log('=' .repeat(70));

  // 삭제 전 상태 확인
  console.log('\n📊 삭제 전 상태:\n');

  const { data: beforeData } = await supabase
    .from('words')
    .select('id, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  console.log(`   Genesis 단어 수: ${beforeData?.length}개\n`);

  // SQL로 중복 제거
  // 각 (hebrew, verse_id) 조합에서 id가 가장 큰 것만 유지
  console.log('🗑️  중복 레코드 삭제 중...\n');

  const { error: deleteError } = await supabase.rpc('remove_duplicate_words', {
    target_book: 'genesis'
  });

  if (deleteError) {
    console.error('❌ RPC 호출 실패:', deleteError);
    console.log('\n직접 SQL 실행으로 전환...\n');

    // RPC가 없다면 직접 삭제
    // 1. 유지할 ID 목록 가져오기
    const { data: idsToKeep } = await supabase.rpc('get_unique_word_ids', {
      target_book: 'genesis'
    });

    if (!idsToKeep) {
      // RPC도 없다면 TypeScript로 처리
      console.log('⚠️  Supabase RPC 함수가 없습니다. TypeScript로 처리합니다.\n');

      // 모든 단어 가져오기
      const { data: allWords } = await supabase
        .from('words')
        .select('id, hebrew, verse_id, verses!inner(book_id)')
        .eq('verses.book_id', 'genesis')
        .order('id', { ascending: true });

      // (hebrew, verse_id)별로 마지막 ID만 수집
      const keepMap = new Map<string, string>();

      allWords?.forEach((word: any) => {
        const key = `${word.hebrew}::${word.verse_id}`;
        // 항상 최신 ID로 덮어쓰기 (id 오름차순 정렬이므로 마지막이 최신)
        keepMap.set(key, word.id);
      });

      const idsToKeepList = Array.from(keepMap.values());
      console.log(`   유지할 단어: ${idsToKeepList.length}개`);
      console.log(`   삭제할 단어: ${(allWords?.length || 0) - idsToKeepList.length}개\n`);

      // 유지할 ID가 아닌 모든 레코드 삭제
      let deletedTotal = 0;
      const batchSize = 100;

      // 전체 ID 목록
      const allIds = allWords?.map((w: any) => w.id) || [];

      // 삭제할 ID = 전체 ID - 유지할 ID
      const idsToDelete = allIds.filter(id => !idsToKeepList.includes(id));

      console.log(`   실제 삭제 대상: ${idsToDelete.length}개\n`);

      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);

        const { error: batchError } = await supabase
          .from('words')
          .delete()
          .in('id', batch);

        if (batchError) {
          console.error(`❌ 배치 ${Math.floor(i / batchSize) + 1} 삭제 실패:`, batchError.message);
        } else {
          deletedTotal += batch.length;
          console.log(`✅ 삭제 진행: ${deletedTotal}/${idsToDelete.length} (${(deletedTotal / idsToDelete.length * 100).toFixed(1)}%)`);
        }
      }

      console.log(`\n✅ 총 ${deletedTotal}개 레코드 삭제 완료`);
    }
  } else {
    console.log('✅ RPC로 중복 제거 완료');
  }

  // 삭제 후 상태 확인
  console.log('\n=' .repeat(70));
  console.log('📊 삭제 후 상태:\n');

  const { data: afterData } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  // 중복 검사
  const uniqueMap = new Map<string, number>();
  afterData?.forEach((word: any) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    uniqueMap.set(key, (uniqueMap.get(key) || 0) + 1);
  });

  const duplicates = Array.from(uniqueMap.values()).filter(count => count > 1);

  console.log(`   Genesis 단어 수: ${afterData?.length}개`);
  console.log(`   고유 조합 수: ${uniqueMap.size}개`);
  console.log(`   중복 조합 수: ${duplicates.length}개\n`);

  if (duplicates.length === 0) {
    console.log('✅ 모든 중복이 제거되었습니다!');
  } else {
    console.log(`⚠️  ${duplicates.length}개 조합이 여전히 중복되어 있습니다.`);

    // 중복 샘플 출력
    console.log('\n중복 샘플:');
    let count = 0;
    uniqueMap.forEach((cnt, key) => {
      if (cnt > 1 && count < 5) {
        console.log(`   ${key}: ${cnt}개`);
        count++;
      }
    });
  }

  console.log('\n=' .repeat(70));
}

removeDuplicatesSQL().catch(console.error);
