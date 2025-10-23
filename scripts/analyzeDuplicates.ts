import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function analyzeDuplicates() {
  console.log('\n🔍 Genesis 5장 & 10장 중복 데이터 상세 분석\n');
  console.log('='.repeat(70) + '\n');

  // Genesis 5장 분석
  const { data: gen5 } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number, reference, hebrew, created_at, updated_at')
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .order('verse_number')
    .order('created_at');

  console.log('📖 Genesis 5장 분석:\n');
  console.log(`총 구절 수: ${gen5?.length} (예상: 32)\n`);

  // 구절별 그룹화
  const gen5Groups = new Map<number, typeof gen5>();
  gen5?.forEach(v => {
    if (!gen5Groups.has(v.verse_number)) {
      gen5Groups.set(v.verse_number, []);
    }
    gen5Groups.get(v.verse_number)?.push(v);
  });

  // 중복 구절 상세 출력
  console.log('중복된 구절 상세:\n');
  for (const [verseNum, verses] of gen5Groups.entries()) {
    if (verses.length > 1) {
      console.log(`📍 5:${verseNum} - ${verses.length}개 중복`);
      verses.forEach((v, idx) => {
        console.log(`  [${idx + 1}] ID: ${v.id}`);
        console.log(`      Hebrew: ${v.hebrew?.substring(0, 50)}...`);
        console.log(`      Created: ${v.created_at}`);
        console.log(`      Updated: ${v.updated_at}`);
      });
      console.log('');
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Genesis 10장 분석
  const { data: gen10 } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number, reference, hebrew, created_at, updated_at')
    .eq('book_id', 'genesis')
    .eq('chapter', 10)
    .order('verse_number')
    .order('created_at');

  console.log('📖 Genesis 10장 분석:\n');
  console.log(`총 구절 수: ${gen10?.length} (예상: 32)\n`);

  // 구절별 그룹화
  const gen10Groups = new Map<number, typeof gen10>();
  gen10?.forEach(v => {
    if (!gen10Groups.has(v.verse_number)) {
      gen10Groups.set(v.verse_number, []);
    }
    gen10Groups.get(v.verse_number)?.push(v);
  });

  // 중복 구절 샘플 출력 (처음 5개만)
  console.log('중복된 구절 샘플 (처음 5개):\n');
  let count = 0;
  for (const [verseNum, verses] of gen10Groups.entries()) {
    if (verses.length > 1 && count < 5) {
      console.log(`📍 10:${verseNum} - ${verses.length}개 중복`);
      verses.forEach((v, idx) => {
        console.log(`  [${idx + 1}] ID: ${v.id}`);
        console.log(`      Hebrew: ${v.hebrew?.substring(0, 50)}...`);
        console.log(`      Created: ${v.created_at}`);
        console.log(`      Updated: ${v.updated_at}`);
      });
      console.log('');
      count++;
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // ID 패턴 분석
  console.log('🔍 ID 패턴 분석:\n');

  const gen5Duplicates = Array.from(gen5Groups.values())
    .filter(g => g.length > 1)
    .flat();

  if (gen5Duplicates.length > 0) {
    console.log('Genesis 5 중복 ID 패턴:');
    gen5Duplicates.forEach(v => {
      console.log(`  ${v.id} (5:${v.verse_number})`);
    });
  }

  console.log('\nGenesis 10 중복 ID 패턴 (처음 10개):');
  const gen10Duplicates = Array.from(gen10Groups.values())
    .filter(g => g.length > 1)
    .flat()
    .slice(0, 10);

  gen10Duplicates.forEach(v => {
    console.log(`  ${v.id} (10:${v.verse_number})`);
  });

  console.log('\n' + '='.repeat(70) + '\n');

  // 생성 시간 분석
  console.log('📅 생성 시간 분석:\n');

  const gen5Times = gen5?.map(v => new Date(v.created_at).toISOString()).sort();
  const gen10Times = gen10?.map(v => new Date(v.created_at).toISOString()).sort();

  if (gen5Times && gen5Times.length > 0) {
    console.log('Genesis 5:');
    console.log(`  최초 생성: ${gen5Times[0]}`);
    console.log(`  최근 생성: ${gen5Times[gen5Times.length - 1]}`);
  }

  if (gen10Times && gen10Times.length > 0) {
    console.log('\nGenesis 10:');
    console.log(`  최초 생성: ${gen10Times[0]}`);
    console.log(`  최근 생성: ${gen10Times[gen10Times.length - 1]}`);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Words 테이블 확인
  console.log('🔤 Words 테이블 관계 확인:\n');

  const duplicateVerseIds = gen5Duplicates.map(v => v.id);
  if (duplicateVerseIds.length > 0) {
    const { count: wordCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .in('verse_id', duplicateVerseIds);

    console.log(`Genesis 5 중복 구절에 연결된 Words: ${wordCount}개`);
  }

  const gen10DuplicateIds = Array.from(gen10Groups.values())
    .filter(g => g.length > 1)
    .flat()
    .map(v => v.id);

  if (gen10DuplicateIds.length > 0) {
    const { count: word10Count } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .in('verse_id', gen10DuplicateIds.slice(0, 10));

    console.log(`Genesis 10 중복 구절 샘플에 연결된 Words: ${word10Count}개`);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

analyzeDuplicates();
