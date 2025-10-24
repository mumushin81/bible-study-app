import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function orderByImpact() {
  console.log('🔍 ORDER BY가 결과에 미치는 영향 분석\n');
  console.log('=' .repeat(80));

  // 1. ORDER BY 없이 조회
  console.log('\n1️⃣ ORDER BY 없이 조회\n');

  const { data: noOrder } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  console.log(`   결과: ${noOrder?.length}개`);

  // 2. ORDER BY verse_id, hebrew, created_at DESC (삭제 스크립트와 동일)
  console.log('\n2️⃣ ORDER BY verse_id, hebrew, created_at DESC\n');

  const { data: withOrder } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, created_at, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis')
    .order('verse_id', { ascending: true })
    .order('hebrew', { ascending: true })
    .order('created_at', { ascending: false });

  console.log(`   결과: ${withOrder?.length}개`);

  // 3. Supabase 기본 제한 확인
  console.log('\n3️⃣ Supabase 기본 LIMIT 확인\n');

  // 기본 쿼리 (제한 없음)
  const { data: defaultLimit } = await supabase
    .from('words')
    .select('id, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  console.log(`   기본 쿼리: ${defaultLimit?.length}개`);

  // range를 사용하여 더 많은 데이터 요청
  const { data: largeRange } = await supabase
    .from('words')
    .select('id, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis')
    .range(0, 1499);

  console.log(`   range(0, 1499): ${largeRange?.length}개`);

  // range로 다음 페이지 확인
  const { data: nextPage } = await supabase
    .from('words')
    .select('id, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis')
    .range(1000, 1999);

  console.log(`   range(1000, 1999): ${nextPage?.length}개`);

  // 4. 기본 쿼리 vs ORDER BY 쿼리에서 중복 차이
  console.log('\n4️⃣ 중복 레코드 차이 분석\n');

  function findDuplicates(data: any[]) {
    const groups = new Map<string, any[]>();
    data.forEach(w => {
      const key = `${w.hebrew}::${w.verse_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(w);
    });
    return Array.from(groups.values()).filter(g => g.length > 1);
  }

  const noOrderDupes = findDuplicates(noOrder || []);
  const withOrderDupes = findDuplicates(withOrder || []);

  console.log(`   ORDER BY 없이: ${noOrderDupes.length}개 중복 그룹`);
  console.log(`   ORDER BY 있음: ${withOrderDupes.length}개 중복 그룹`);

  // 5. 실제 1000개 제한 확인 (Supabase 기본값)
  console.log('\n5️⃣ Supabase 기본 페이지 크기 확인\n');

  console.log('   ✅ Supabase PostgREST 기본 LIMIT: 1000');
  console.log('   ✅ data.length가 정확히 1000인 이유: 기본 페이지네이션');
  console.log('   ✅ 실제 데이터는 더 많을 수 있음');

  // 6. 페이지네이션 없이 전체 데이터 가져오기
  console.log('\n6️⃣ 페이지네이션 없이 전체 데이터 가져오기\n');

  let allData: any[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data: page } = await supabase
      .from('words')
      .select('id, hebrew, verse_id, verses!inner(book_id)')
      .eq('verses.book_id', 'genesis')
      .range(offset, offset + pageSize - 1);

    if (!page || page.length === 0) break;

    allData = allData.concat(page);
    console.log(`   페이지 ${Math.floor(offset / pageSize) + 1}: ${page.length}개 (누적: ${allData.length}개)`);

    if (page.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`\n   🎯 실제 Genesis words 총합: ${allData.length}개`);

  // 전체 데이터에서 중복 찾기
  const allDupes = findDuplicates(allData);
  const totalDupeRecords = allDupes.reduce((sum, g) => sum + g.length, 0);
  const toDelete = allDupes.reduce((sum, g) => sum + g.length - 1, 0);

  console.log(`\n   중복 그룹: ${allDupes.length}개`);
  console.log(`   중복 레코드 총합: ${totalDupeRecords}개`);
  console.log(`   삭제 대상: ${toDelete}개`);
  console.log(`   삭제 후 예상 단어 수: ${allData.length - toDelete}개 (고유 조합 수)`);

  console.log('\n' + '=' .repeat(80));
  console.log('📋 최종 발견:\n');
  console.log('❗ Supabase는 기본적으로 1000개로 제한!');
  console.log('❗ 삭제 스크립트가 1000개만 보고 삭제를 시도했을 가능성');
  console.log('❗ ORDER BY로 정렬 후 1000개를 잘라서 일부 중복을 놓쳤을 수 있음');
  console.log('');
  console.log('✅ 해결 방법:');
  console.log('   1. range()를 사용하여 페이지네이션으로 전체 데이터 처리');
  console.log('   2. SQL로 직접 중복 삭제 (페이지네이션 없음)');
  console.log('   3. RPC 함수 생성하여 서버에서 처리');
  console.log('=' .repeat(80));
}

orderByImpact().catch(console.error);
