import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicateWordsFixed() {
  console.log('🔧 중복 단어 제거 (페이지네이션 수정 버전)\n');
  console.log('=' .repeat(80));

  // 1단계: 전체 Genesis words 가져오기 (페이지네이션 처리)
  console.log('\n1️⃣  전체 Genesis 단어 가져오기 (페이지네이션)...\n');

  let allWords: any[] = [];
  let offset = 0;
  const pageSize = 1000;
  let pageNum = 1;

  while (true) {
    console.log(`   페이지 ${pageNum} 로딩 중... (offset: ${offset})`);

    const { data: page, error } = await supabase
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
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`   ❌ 페이지 ${pageNum} 조회 에러:`, error.message);
      break;
    }

    if (!page || page.length === 0) {
      console.log(`   페이지 ${pageNum}: 데이터 없음 (종료)`);
      break;
    }

    allWords = allWords.concat(page);
    console.log(`   페이지 ${pageNum}: ${page.length}개 (누적: ${allWords.length}개)`);

    if (page.length < pageSize) {
      console.log(`   마지막 페이지 도달 (${page.length}개 < ${pageSize}개)`);
      break;
    }

    offset += pageSize;
    pageNum++;
  }

  console.log(`\n📊 총 Genesis 단어: ${allWords.length}개\n`);

  // 2단계: (hebrew, verse_id) 조합별로 그룹화
  console.log('2️⃣  중복 레코드 그룹화 중...\n');

  const wordGroups = new Map<string, Array<{
    id: string;
    hebrew: string;
    meaning: string;
    verse_id: string;
    created_at: string;
    reference: string;
  }>>();

  allWords.forEach((word: any) => {
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

  // 3단계: 중복 그룹 찾기
  const duplicateGroups: Array<Array<any>> = [];
  wordGroups.forEach((group) => {
    if (group.length > 1) {
      // created_at DESC로 정렬 (최신 것을 첫 번째로)
      group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      duplicateGroups.push(group);
    }
  });

  console.log(`🔍 중복 분석 결과:`);
  console.log(`   총 (hebrew, verse_id) 조합: ${wordGroups.size}개`);
  console.log(`   중복된 조합: ${duplicateGroups.length}개`);
  console.log(`   총 중복 레코드: ${duplicateGroups.reduce((sum, g) => sum + g.length, 0)}개`);
  console.log(`   제거 대상 레코드: ${duplicateGroups.reduce((sum, g) => sum + g.length - 1, 0)}개\n`);

  if (duplicateGroups.length === 0) {
    console.log('✅ 중복 레코드가 없습니다!');
    return;
  }

  // 4단계: 중복 상세 정보 출력
  console.log('=' .repeat(80));
  console.log('\n3️⃣  중복 레코드 상세 정보 (처음 20개):\n');

  duplicateGroups.slice(0, 20).forEach((group, idx) => {
    console.log(`${idx + 1}. ${group[0].hebrew} - "${group[0].meaning}" (${group[0].reference})`);
    console.log(`   중복 개수: ${group.length}개`);
    group.forEach((word, i) => {
      const status = i === 0 ? '✅ 유지' : '❌ 삭제';
      console.log(`   ${status}: ${word.id.substring(0, 8)}... (생성: ${word.created_at.substring(0, 19)})`);
    });
    console.log('');
  });

  if (duplicateGroups.length > 20) {
    console.log(`   ... 외 ${duplicateGroups.length - 20}개 중복 그룹\n`);
  }

  // 5단계: 삭제할 레코드 ID 수집
  console.log('=' .repeat(80));
  console.log('\n4️⃣  삭제 대상 레코드 수집 중...\n');

  const idsToDelete: string[] = [];

  duplicateGroups.forEach((group) => {
    // 가장 최신 레코드(첫 번째)를 제외한 나머지 삭제
    for (let i = 1; i < group.length; i++) {
      idsToDelete.push(group[i].id);
    }
  });

  console.log(`🗑️  삭제 대상: ${idsToDelete.length}개 레코드\n`);

  // 6단계: 실제 삭제 확인
  console.log('=' .repeat(80));
  console.log('\n⚠️  삭제 실행 확인\n');
  console.log(`   총 ${idsToDelete.length}개 레코드를 삭제합니다.`);
  console.log(`   현재 단어 수: ${allWords.length}개`);
  console.log(`   삭제 후 예상: ${allWords.length - idsToDelete.length}개\n`);

  // 실제 환경에서는 여기서 사용자 확인을 받아야 함
  console.log('   ℹ️  자동 실행 모드 - 5초 후 삭제 시작...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 7단계: 실제 삭제 실행
  console.log('5️⃣  중복 레코드 삭제 중...\n');

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
      const progress = (deletedCount / idsToDelete.length * 100).toFixed(1);
      console.log(`✅ 진행: ${deletedCount}/${idsToDelete.length} (${progress}%)`);
    }
  }

  console.log('\n' + '=' .repeat(80));
  console.log('📊 삭제 결과:');
  console.log(`   총 삭제 대상: ${idsToDelete.length}개`);
  console.log(`   ✅ 삭제 성공: ${deletedCount}개`);
  console.log(`   ❌ 삭제 실패: ${errorCount}개`);
  console.log(`   📈 성공률: ${(deletedCount / idsToDelete.length * 100).toFixed(1)}%`);
  console.log('=' .repeat(80));

  // 8단계: 결과 검증 (페이지네이션 포함)
  console.log('\n6️⃣  삭제 결과 검증 중...\n');

  let verifyWords: any[] = [];
  offset = 0;
  pageNum = 1;

  while (true) {
    const { data: page } = await supabase
      .from('words')
      .select('id, hebrew, verse_id, verses!inner(book_id)')
      .eq('verses.book_id', 'genesis')
      .range(offset, offset + pageSize - 1);

    if (!page || page.length === 0) break;

    verifyWords = verifyWords.concat(page);

    if (page.length < pageSize) break;
    offset += pageSize;
    pageNum++;
  }

  const remainingGroups = new Map<string, number>();
  verifyWords.forEach((word: any) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    remainingGroups.set(key, (remainingGroups.get(key) || 0) + 1);
  });

  const stillDuplicate = Array.from(remainingGroups.values()).filter(count => count > 1).length;

  console.log(`📊 검증 결과:`);
  console.log(`   남은 단어: ${verifyWords.length}개`);
  console.log(`   고유 (hebrew, verse_id) 조합: ${remainingGroups.size}개`);
  console.log(`   여전히 중복된 조합: ${stillDuplicate}개`);

  if (stillDuplicate === 0) {
    console.log('\n✅ 모든 중복 레코드가 성공적으로 제거되었습니다!');
  } else {
    console.log(`\n⚠️  ${stillDuplicate}개 조합이 여전히 중복되어 있습니다.`);
    console.log(`   재실행이 필요할 수 있습니다.`);
  }

  console.log('\n=' .repeat(80));
  console.log('🎯 다음 단계:');
  console.log('   1. UNIQUE 제약조건 추가:');
  console.log('      ALTER TABLE words ADD CONSTRAINT words_hebrew_verse_unique UNIQUE (hebrew, verse_id);');
  console.log('   2. 데이터 검증');
  console.log('   3. 애플리케이션 테스트');
  console.log('=' .repeat(80));
}

removeDuplicateWordsFixed().catch(console.error);
