import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function deleteDuplicates() {
  console.log('🗑️  중복 구절 삭제 시작...\n');

  // ========================================
  // Genesis 5: 3개 중복 삭제
  // ========================================
  console.log('📖 Genesis 5 중복 삭제 중...');
  const gen5Ids = ['gen5-22', 'gen5-23', 'gen5-24'];

  const { data: deletedGen5, error: error5 } = await supabase
    .from('verses')
    .delete()
    .in('id', gen5Ids)
    .select();

  if (error5) {
    console.error('❌ Genesis 5 삭제 실패:', error5.message);
  } else {
    console.log(`✅ Genesis 5: ${deletedGen5?.length || 0}개 중복 삭제됨`);
    deletedGen5?.forEach(v => {
      console.log(`   - ${v.id} (${v.reference})`);
    });
  }

  // ========================================
  // Genesis 10: 32개 중복 삭제
  // ========================================
  console.log('\n📖 Genesis 10 중복 삭제 중...');

  // 먼저 genesis10- 패턴의 ID들을 조회
  const { data: gen10Dupes, error: findError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 10)
    .like('id', 'genesis10-%');

  if (findError) {
    console.error('❌ Genesis 10 중복 조회 실패:', findError.message);
  } else if (!gen10Dupes || gen10Dupes.length === 0) {
    console.log('⚠️  genesis10- 패턴의 중복이 없습니다.');
  } else {
    console.log(`🔍 ${gen10Dupes.length}개의 genesis10- 중복 발견`);

    const gen10Ids = gen10Dupes.map(v => v.id);

    const { data: deletedGen10, error: error10 } = await supabase
      .from('verses')
      .delete()
      .in('id', gen10Ids)
      .select();

    if (error10) {
      console.error('❌ Genesis 10 삭제 실패:', error10.message);
    } else {
      console.log(`✅ Genesis 10: ${deletedGen10?.length || 0}개 중복 삭제됨`);
      console.log(`   첫 3개: ${deletedGen10?.slice(0, 3).map(v => v.reference).join(', ')}`);
      console.log(`   마지막 3개: ${deletedGen10?.slice(-3).map(v => v.reference).join(', ')}`);
    }
  }

  // ========================================
  // 최종 검증
  // ========================================
  console.log('\n🔍 최종 검증 중...\n');

  // Genesis 5 검증
  const { data: gen5Final, error: check5 } = await supabase
    .from('verses')
    .select('id, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .order('verse_number');

  if (check5) {
    console.error('❌ Genesis 5 검증 실패:', check5.message);
  } else {
    const gen5Groups = new Map<number, typeof gen5Final>();
    gen5Final?.forEach(v => {
      if (!gen5Groups.has(v.verse_number)) {
        gen5Groups.set(v.verse_number, []);
      }
      gen5Groups.get(v.verse_number)?.push(v);
    });

    const gen5Dupes = Array.from(gen5Groups.entries()).filter(([_, verses]) => verses.length > 1);

    if (gen5Dupes.length === 0) {
      console.log('✅ Genesis 5: 중복 없음 (총 32개 구절)');
    } else {
      console.log(`⚠️  Genesis 5: ${gen5Dupes.length}개 구절에 여전히 중복 존재`);
      gen5Dupes.forEach(([verseNum, verses]) => {
        console.log(`   5:${verseNum} - ${verses.length}개 중복`);
      });
    }
  }

  // Genesis 10 검증
  const { data: gen10Final, error: check10 } = await supabase
    .from('verses')
    .select('id, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 10)
    .order('verse_number');

  if (check10) {
    console.error('❌ Genesis 10 검증 실패:', check10.message);
  } else {
    const gen10Groups = new Map<number, typeof gen10Final>();
    gen10Final?.forEach(v => {
      if (!gen10Groups.has(v.verse_number)) {
        gen10Groups.set(v.verse_number, []);
      }
      gen10Groups.get(v.verse_number)?.push(v);
    });

    const gen10Dupes = Array.from(gen10Groups.entries()).filter(([_, verses]) => verses.length > 1);

    if (gen10Dupes.length === 0) {
      console.log('✅ Genesis 10: 중복 없음 (총 32개 구절)');
    } else {
      console.log(`⚠️  Genesis 10: ${gen10Dupes.length}개 구절에 여전히 중복 존재`);
      gen10Dupes.forEach(([verseNum, verses]) => {
        console.log(`   10:${verseNum} - ${verses.length}개 중복`);
      });
    }
  }

  console.log('\n✅ 중복 삭제 완료');
}

deleteDuplicates().catch(console.error);
