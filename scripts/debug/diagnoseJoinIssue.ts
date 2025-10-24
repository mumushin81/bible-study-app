import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseJoinIssue() {
  console.log('🔍 JOIN 이슈 진단 시작...\n');
  console.log('=' .repeat(80));

  // 1. words 테이블만 직접 쿼리 (JOIN 없이)
  console.log('\n📊 1단계: words 테이블 직접 카운트 (JOIN 없음)\n');

  const { count: wordsCount, error: wordsError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (wordsError) {
    console.error('❌ words 카운트 에러:', wordsError);
  } else {
    console.log(`   총 words 레코드: ${wordsCount}개`);
  }

  // 2. Genesis words만 직접 쿼리 (JOIN 사용)
  console.log('\n📊 2단계: Genesis words 카운트 (verses!inner JOIN 사용)\n');

  const { data: genesisWordsWithJoin, error: joinError } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, verses!inner(id, book_id)')
    .eq('verses.book_id', 'genesis');

  if (joinError) {
    console.error('❌ JOIN 쿼리 에러:', joinError);
  } else {
    console.log(`   JOIN 결과 레코드 수: ${genesisWordsWithJoin?.length}개`);
  }

  // 3. Genesis verse_id를 먼저 찾은 후 words 필터링 (JOIN 없이)
  console.log('\n📊 3단계: Genesis verse_id 기반 words 카운트 (2단계 쿼리, JOIN 없음)\n');

  // 3-1. Genesis verses 찾기
  const { data: genesisVerses, error: versesError } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis');

  if (versesError) {
    console.error('❌ verses 조회 에러:', versesError);
  } else {
    console.log(`   Genesis 구절 수: ${genesisVerses?.length}개`);

    const verseIds = genesisVerses?.map(v => v.id) || [];

    // 3-2. 해당 verse_id를 가진 words 찾기
    const { data: genesisWords, error: wordsFilterError } = await supabase
      .from('words')
      .select('id, hebrew, verse_id')
      .in('verse_id', verseIds);

    if (wordsFilterError) {
      console.error('❌ words 필터 에러:', wordsFilterError);
    } else {
      console.log(`   Genesis words 수 (verse_id IN): ${genesisWords?.length}개`);
    }
  }

  // 4. verses 테이블 중복 검사
  console.log('\n📊 4단계: verses 테이블 중복 검사\n');

  const { data: allVerses, error: allVersesError } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number')
    .eq('book_id', 'genesis');

  if (allVersesError) {
    console.error('❌ verses 조회 에러:', allVersesError);
  } else {
    // verse_id 중복 검사
    const verseIdCount = new Map<string, number>();
    allVerses?.forEach(v => {
      verseIdCount.set(v.id, (verseIdCount.get(v.id) || 0) + 1);
    });

    const duplicateVerseIds = Array.from(verseIdCount.entries()).filter(([_, count]) => count > 1);

    console.log(`   총 verses: ${allVerses?.length}개`);
    console.log(`   고유 verse_id: ${verseIdCount.size}개`);
    console.log(`   중복 verse_id: ${duplicateVerseIds.length}개`);

    if (duplicateVerseIds.length > 0) {
      console.log('\n   ⚠️ 중복 verse_id 발견:');
      duplicateVerseIds.slice(0, 5).forEach(([id, count]) => {
        console.log(`      ${id}: ${count}회`);
      });
    }

    // (book_id, chapter, verse_number) 조합 중복 검사
    const verseKeyCount = new Map<string, number>();
    allVerses?.forEach(v => {
      const key = `${v.book_id}_${v.chapter}_${v.verse_number}`;
      verseKeyCount.set(key, (verseKeyCount.get(key) || 0) + 1);
    });

    const duplicateVerseKeys = Array.from(verseKeyCount.entries()).filter(([_, count]) => count > 1);

    console.log(`\n   고유 (book_id, chapter, verse) 조합: ${verseKeyCount.size}개`);
    console.log(`   중복 조합: ${duplicateVerseKeys.length}개`);

    if (duplicateVerseKeys.length > 0) {
      console.log('\n   ⚠️ 중복 구절 조합 발견:');
      duplicateVerseKeys.slice(0, 5).forEach(([key, count]) => {
        console.log(`      ${key}: ${count}회`);
      });
    }
  }

  // 5. words 테이블 verse_id 중복 검사
  console.log('\n📊 5단계: words 테이블 중복 검사\n');

  const { data: allWords, error: allWordsError } = await supabase
    .from('words')
    .select('id, hebrew, verse_id')
    .in('verse_id', genesisVerses?.map(v => v.id) || []);

  if (allWordsError) {
    console.error('❌ words 조회 에러:', allWordsError);
  } else {
    // (hebrew, verse_id) 조합 중복 검사
    const wordKeyCount = new Map<string, number>();
    const wordKeyIds = new Map<string, string[]>();

    allWords?.forEach(w => {
      const key = `${w.hebrew}::${w.verse_id}`;
      wordKeyCount.set(key, (wordKeyCount.get(key) || 0) + 1);
      if (!wordKeyIds.has(key)) {
        wordKeyIds.set(key, []);
      }
      wordKeyIds.get(key)!.push(w.id);
    });

    const duplicateWordKeys = Array.from(wordKeyCount.entries()).filter(([_, count]) => count > 1);

    console.log(`   총 words: ${allWords?.length}개`);
    console.log(`   고유 (hebrew, verse_id) 조합: ${wordKeyCount.size}개`);
    console.log(`   중복 조합: ${duplicateWordKeys.length}개`);
    console.log(`   중복 레코드 수: ${duplicateWordKeys.reduce((sum, [_, count]) => sum + count, 0)}개`);

    if (duplicateWordKeys.length > 0) {
      console.log('\n   ⚠️ 중복 (hebrew, verse_id) 발견 (처음 5개):');
      duplicateWordKeys.slice(0, 5).forEach(([key, count]) => {
        const [hebrew, verseId] = key.split('::');
        const ids = wordKeyIds.get(key) || [];
        console.log(`      ${hebrew} @ ${verseId}: ${count}개 레코드`);
        console.log(`         ID: ${ids.map(id => id.substring(0, 8)).join(', ')}`);
      });
    }
  }

  // 6. JOIN 결과 상세 분석
  console.log('\n📊 6단계: JOIN 결과 상세 분석\n');

  if (genesisWordsWithJoin && genesisWordsWithJoin.length > 0) {
    // 같은 word.id가 여러 번 나타나는지 검사
    const wordIdCount = new Map<string, number>();
    genesisWordsWithJoin.forEach((w: any) => {
      wordIdCount.set(w.id, (wordIdCount.get(w.id) || 0) + 1);
    });

    const duplicateWordIds = Array.from(wordIdCount.entries()).filter(([_, count]) => count > 1);

    console.log(`   JOIN 결과에서 word.id 중복: ${duplicateWordIds.length}개`);

    if (duplicateWordIds.length > 0) {
      console.log('\n   🔴 동일한 word.id가 JOIN 결과에 여러 번 나타남:');
      duplicateWordIds.slice(0, 3).forEach(([id, count]) => {
        console.log(`      ${id.substring(0, 8)}: ${count}회`);

        // 해당 word의 모든 JOIN 결과 확인
        const matches = genesisWordsWithJoin.filter((w: any) => w.id === id);
        matches.forEach((m: any, idx: number) => {
          console.log(`         [${idx + 1}] verses.id = ${m.verses?.id}, verses.book_id = ${m.verses?.book_id}`);
        });
      });

      console.log('\n   ❗ 이것은 Cartesian product를 의미합니다!');
      console.log('   ❗ words.verse_id가 여러 verses 레코드와 매칭되고 있습니다.');
    } else {
      console.log('   ✅ JOIN 결과에 word.id 중복 없음 (Cartesian product 없음)');
    }
  }

  // 7. 실제 데이터 샘플 확인
  console.log('\n📊 7단계: 실제 데이터 샘플 (첫 구절)\n');

  const { data: firstVerse, error: firstVerseError } = await supabase
    .from('verses')
    .select('id, reference, book_id, chapter, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1);

  if (firstVerseError) {
    console.error('❌ 첫 구절 조회 에러:', firstVerseError);
  } else {
    console.log(`   Genesis 1:1 구절 레코드: ${firstVerse?.length}개`);
    firstVerse?.forEach((v, idx) => {
      console.log(`      [${idx + 1}] id=${v.id}, reference=${v.reference}`);
    });

    if (firstVerse && firstVerse.length > 0) {
      const verseId = firstVerse[0].id;

      // 해당 구절의 words 조회
      const { data: verseWords, error: verseWordsError } = await supabase
        .from('words')
        .select('id, hebrew, meaning, verse_id')
        .eq('verse_id', verseId);

      if (verseWordsError) {
        console.error('❌ words 조회 에러:', verseWordsError);
      } else {
        console.log(`\n   ${verseId} 단어 수: ${verseWords?.length}개`);

        // 중복 검사
        const hebrewCount = new Map<string, number>();
        verseWords?.forEach(w => {
          hebrewCount.set(w.hebrew, (hebrewCount.get(w.hebrew) || 0) + 1);
        });

        const duplicateHebrew = Array.from(hebrewCount.entries()).filter(([_, count]) => count > 1);
        console.log(`   중복 히브리어 단어: ${duplicateHebrew.length}개`);

        if (duplicateHebrew.length > 0) {
          duplicateHebrew.forEach(([hebrew, count]) => {
            console.log(`      ${hebrew}: ${count}회`);
          });
        }
      }
    }
  }

  console.log('\n' + '=' .repeat(80));
  console.log('🎯 진단 완료\n');
}

diagnoseJoinIssue().catch(console.error);
