/**
 * Genesis 2 데이터 페칭 테스트 (useVerses 로직 시뮬레이션)
 *
 * 앱에서 실제로 데이터를 가져오는 방식대로 테스트
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testFetch() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Genesis 2 데이터 페칭 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('useVerses 로직과 동일한 방식으로 데이터 페칭...\n');

  try {
    // 1️⃣ Verses + Words 가져오기 (useVerses.ts와 동일)
    let versesQuery = supabase
      .from('verses')
      .select(`
        *,
        words (
          hebrew,
          meaning,
          ipa,
          korean,
          root,
          grammar,
          structure,
          emoji,
          category,
          position
        )
      `)
      .eq('book_id', 'genesis')
      .eq('chapter', 2)
      .order('verse_number', { ascending: true });

    const { data: versesData, error: versesError } = await versesQuery;

    if (versesError) throw versesError;

    console.log(`✅ ${versesData?.length || 0}개 구절 로드`);
    console.log(`   - Genesis 2:1-3 포함 확인: ${versesData?.filter(v => ['genesis_2_1', 'genesis_2_2', 'genesis_2_3'].includes(v.id)).length}개\n`);

    // 2️⃣ Verse IDs 추출
    const verseIds = versesData?.map((v: any) => v.id) || [];

    // 3️⃣ Commentaries + 중첩 테이블 별도 조회
    const { data: commentariesData } = await supabase
      .from('commentaries')
      .select(`
        verse_id,
        id,
        intro,
        commentary_sections (
          emoji,
          title,
          description,
          points,
          color,
          position
        ),
        why_questions (
          question,
          answer,
          bible_references
        ),
        commentary_conclusions (
          title,
          content
        )
      `)
      .in('verse_id', verseIds);

    console.log(`✅ ${commentariesData?.length || 0}개 commentary 로드\n`);

    // 4️⃣ Genesis 2:1-3 상세 확인
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Genesis 2:1-3 상세 데이터');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    ['genesis_2_1', 'genesis_2_2', 'genesis_2_3'].forEach(id => {
      const verse = versesData?.find((v: any) => v.id === id);
      const commentary = commentariesData?.find((c: any) => c.verse_id === id);

      if (!verse) {
        console.log(`❌ ${id}: 구절 없음\n`);
        return;
      }

      console.log(`📖 ${id}: ${verse.reference}`);
      console.log(`   Hebrew: ${verse.hebrew}`);
      console.log(`   Modern: ${verse.modern}`);
      console.log(`   Words: ${verse.words?.length || 0}개`);

      if (verse.words && verse.words.length > 0) {
        verse.words.slice(0, 2).forEach((w: any) => {
          console.log(`     - ${w.hebrew} (${w.korean}): ${w.meaning}`);
        });
      }

      if (commentary) {
        console.log(`   Commentary:`);
        console.log(`     - Intro: ${commentary.intro?.substring(0, 60)}...`);
        console.log(`     - Sections: ${commentary.commentary_sections?.length || 0}개`);
        // why_questions and commentary_conclusions are objects (one-to-one), not arrays
        console.log(`     - Why Questions: ${commentary.why_questions ? 1 : 0}개`);
        console.log(`     - Conclusions: ${commentary.commentary_conclusions ? 1 : 0}개`);

        if (commentary.why_questions) {
          const wq = commentary.why_questions;
          console.log(`     - Question: "${wq.question}"`);
        }

        if (commentary.commentary_conclusions) {
          const conc = commentary.commentary_conclusions;
          console.log(`     - Conclusion: "${conc.title}"`);
        }
      } else {
        console.log(`   ⚠️  Commentary 없음`);
      }

      console.log();
    });

    // 5️⃣ 전체 통계
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Genesis 2장 전체 통계');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const totalWords = versesData?.reduce((sum: number, v: any) => sum + (v.words?.length || 0), 0) || 0;
    const totalCommentaries = commentariesData?.length || 0;
    const totalSections = commentariesData?.reduce((sum: number, c: any) => sum + (c.commentary_sections?.length || 0), 0) || 0;
    // why_questions and commentary_conclusions are objects (one-to-one), not arrays
    const totalQuestions = commentariesData?.reduce((sum: number, c: any) => sum + (c.why_questions ? 1 : 0), 0) || 0;
    const totalConclusions = commentariesData?.reduce((sum: number, c: any) => sum + (c.commentary_conclusions ? 1 : 0), 0) || 0;

    console.log(`   - 구절: ${versesData?.length || 0}개`);
    console.log(`   - 단어: ${totalWords}개`);
    console.log(`   - Commentaries: ${totalCommentaries}개`);
    console.log(`   - Sections: ${totalSections}개`);
    console.log(`   - Why Questions: ${totalQuestions}개`);
    console.log(`   - Conclusions: ${totalConclusions}개\n`);

    // 6️⃣ Genesis 2:1-3 검증
    const gen2_1_3 = versesData?.filter((v: any) => ['genesis_2_1', 'genesis_2_2', 'genesis_2_3'].includes(v.id));
    const gen2_1_3_words = gen2_1_3?.reduce((sum: number, v: any) => sum + (v.words?.length || 0), 0) || 0;
    const gen2_1_3_comm = commentariesData?.filter((c: any) => ['genesis_2_1', 'genesis_2_2', 'genesis_2_3'].includes(c.verse_id));
    // why_questions and commentary_conclusions are objects (one-to-one), not arrays
    const gen2_1_3_questions = gen2_1_3_comm?.reduce((sum: number, c: any) => sum + (c.why_questions ? 1 : 0), 0) || 0;
    const gen2_1_3_conclusions = gen2_1_3_comm?.reduce((sum: number, c: any) => sum + (c.commentary_conclusions ? 1 : 0), 0) || 0;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Genesis 2:1-3 샘플 검증');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const checks = [
      { name: '구절 3개', expected: 3, actual: gen2_1_3?.length || 0 },
      { name: '단어 17개', expected: 17, actual: gen2_1_3_words },
      { name: 'Commentaries 3개', expected: 3, actual: gen2_1_3_comm?.length || 0 },
      { name: 'Why Questions 3개', expected: 3, actual: gen2_1_3_questions },
      { name: 'Conclusions 3개', expected: 3, actual: gen2_1_3_conclusions }
    ];

    checks.forEach(check => {
      const status = check.actual === check.expected ? '✅' : '❌';
      console.log(`   ${status} ${check.name}: ${check.actual}/${check.expected}`);
    });

    const allPassed = checks.every(c => c.actual === c.expected);

    console.log();
    if (allPassed) {
      console.log('🎉 모든 검증 통과! Genesis 2:1-3 데이터가 정상적으로 페칭됩니다.\n');
    } else {
      console.log('⚠️  일부 검증 실패. 데이터를 확인하세요.\n');
    }

  } catch (error: any) {
    console.error('❌ 페칭 실패:', error.message);
    console.error(error);
  }
}

testFetch();
