import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicateWords() {
  console.log('🔧 중복 단어 레코드 제거 시작...\n');
  console.log('=' .repeat(70));

  // 1단계: 중복 레코드 찾기
  console.log('\n1️⃣  중복 레코드 검색 중...\n');

  const { data: allWords, error: fetchError } = await supabase
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

  if (fetchError) {
    console.error('❌ 조회 에러:', fetchError);
    return;
  }

  console.log(`📊 Genesis 전체 단어: ${allWords?.length}개\n`);

  // (hebrew, verse_id) 조합별로 그룹화
  const wordGroups = new Map<string, Array<{
    id: string;
    hebrew: string;
    meaning: string;
    verse_id: string;
    created_at: string;
    reference: string;
  }>>();

  allWords?.forEach((word: any) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    if (!wordGroups.has(key)) {
      wordGroups.set(key, []);
    }
    wordGroups.get(key)!.push({
      id: word.id,
      hebrew: word.hebrew,
      meaning: word.meaning,
      verse_id: word.verse_id,
      created_at: word.created_at,
      reference: word.verses.reference,
    });
  });

  // 중복 그룹 찾기
  const duplicateGroups: Array<Array<any>> = [];
  wordGroups.forEach((group) => {
    if (group.length > 1) {
      duplicateGroups.push(group);
    }
  });

  console.log(`🔍 중복 발견:`);
  console.log(`   총 (hebrew, verse_id) 조합: ${wordGroups.size}개`);
  console.log(`   중복된 조합: ${duplicateGroups.length}개`);
  console.log(`   총 중복 레코드: ${duplicateGroups.reduce((sum, g) => sum + g.length, 0)}개`);
  console.log(`   제거 대상 레코드: ${duplicateGroups.reduce((sum, g) => sum + g.length - 1, 0)}개\n`);

  if (duplicateGroups.length === 0) {
    console.log('✅ 중복 레코드가 없습니다!');
    return;
  }

  // 2단계: 중복 상세 정보 출력
  console.log('=' .repeat(70));
  console.log('\n2️⃣  중복 레코드 상세 정보:\n');

  duplicateGroups.slice(0, 10).forEach((group, idx) => {
    console.log(`${idx + 1}. ${group[0].hebrew} - "${group[0].meaning}" (${group[0].reference})`);
    console.log(`   중복 개수: ${group.length}개\n`);
    group.forEach((word, i) => {
      console.log(`   ${i === 0 ? '✅ 유지' : '❌ 삭제'}: ${word.id.substring(0, 8)}... (생성: ${word.created_at.substring(0, 19)})`);
    });
    console.log('');
  });

  if (duplicateGroups.length > 10) {
    console.log(`   ... 외 ${duplicateGroups.length - 10}개 중복 그룹\n`);
  }

  // 3단계: 삭제할 레코드 ID 수집
  console.log('=' .repeat(70));
  console.log('\n3️⃣  삭제 대상 레코드 수집 중...\n');

  const idsToDelete: string[] = [];

  duplicateGroups.forEach((group) => {
    // 가장 최신 레코드(첫 번째)를 제외한 나머지 삭제
    // created_at DESC로 정렬되어 있으므로 첫 번째가 최신
    for (let i = 1; i < group.length; i++) {
      idsToDelete.push(group[i].id);
    }
  });

  console.log(`🗑️  삭제 대상: ${idsToDelete.length}개 레코드\n`);

  // 4단계: 실제 삭제 실행
  console.log('=' .repeat(70));
  console.log('\n4️⃣  중복 레코드 삭제 중...\n');

  let deletedCount = 0;
  let errorCount = 0;

  // 배치로 삭제 (한 번에 최대 100개)
  const batchSize = 100;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);

    const { error: deleteError } = await supabase
      .from('words')
      .delete()
      .in('id', batch);

    if (deleteError) {
      console.error(`❌ 삭제 에러 (배치 ${Math.floor(i / batchSize) + 1}):`, deleteError.message);
      errorCount += batch.length;
    } else {
      deletedCount += batch.length;
      console.log(`✅ 삭제 완료: ${deletedCount}/${idsToDelete.length} (${(deletedCount / idsToDelete.length * 100).toFixed(1)}%)`);
    }
  }

  console.log('\n' + '=' .repeat(70));
  console.log('📊 삭제 결과:');
  console.log(`   총 삭제 대상: ${idsToDelete.length}개`);
  console.log(`   ✅ 삭제 성공: ${deletedCount}개`);
  console.log(`   ❌ 삭제 실패: ${errorCount}개`);
  console.log(`   📈 성공률: ${(deletedCount / idsToDelete.length * 100).toFixed(1)}%`);
  console.log('=' .repeat(70));

  // 5단계: 결과 검증
  console.log('\n5️⃣  삭제 결과 검증 중...\n');

  const { data: remainingWords } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  const remainingGroups = new Map<string, number>();
  remainingWords?.forEach((word: any) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    remainingGroups.set(key, (remainingGroups.get(key) || 0) + 1);
  });

  const stillDuplicate = Array.from(remainingGroups.values()).filter(count => count > 1).length;

  console.log(`📊 검증 결과:`);
  console.log(`   남은 단어: ${remainingWords?.length}개`);
  console.log(`   고유 (hebrew, verse_id) 조합: ${remainingGroups.size}개`);
  console.log(`   여전히 중복된 조합: ${stillDuplicate}개`);

  if (stillDuplicate === 0) {
    console.log('\n✅ 모든 중복 레코드가 성공적으로 제거되었습니다!');
  } else {
    console.log(`\n⚠️  ${stillDuplicate}개 조합이 여전히 중복되어 있습니다.`);
  }

  console.log('\n=' .repeat(70));
  console.log('🎯 다음 단계:');
  console.log('   1. UNIQUE 제약조건 추가');
  console.log('   2. 남은 단어들 SVG 재생성');
  console.log('   3. 최종 검증');
  console.log('=' .repeat(70));
}

removeDuplicateWords().catch(console.error);
