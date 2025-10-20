import { createClient } from '@supabase/supabase-js';
import { verses } from '../src/data/verses';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * ID 변환: gen1-1 → genesis_1_1
 */
function convertIdFormat(oldId: string): string {
  const match = oldId.match(/^(gen|exo)(\d+)-(\d+)$/);
  if (!match) {
    console.warn(`⚠️  Unknown ID format: ${oldId}`);
    return oldId;
  }

  const [, shortBook, chapter, verse] = match;
  const fullBook = shortBook === 'gen' ? 'genesis' : 'exodus';
  return `${fullBook}_${chapter}_${verse}`;
}

/**
 * Words 마이그레이션
 */
async function migrateWords() {
  console.log('\n📝 Words 데이터 마이그레이션...\n');

  // Genesis 1-3장만 필터
  const targetVerses = verses.filter(v => {
    const match = v.id.match(/^gen([1-3])-/);
    return match !== null;
  });

  console.log(`   대상 구절: ${targetVerses.length}개`);

  const wordsData: any[] = [];

  targetVerses.forEach(verse => {
    if (verse.words && Array.isArray(verse.words)) {
      const newVerseId = convertIdFormat(verse.id);

      verse.words.forEach((word, index) => {
        wordsData.push({
          verse_id: newVerseId,
          position: index + 1,
          hebrew: word.hebrew,
          meaning: word.meaning,
          ipa: word.ipa,
          korean: word.korean,
          root: word.root,
          grammar: word.grammar,
          structure: word.structure || null,
          category: null,
          emoji: null
        });
      });
    }
  });

  console.log(`   총 단어: ${wordsData.length}개\n`);

  if (wordsData.length === 0) {
    console.log('   ⚠️  마이그레이션할 words가 없습니다.\n');
    return 0;
  }

  // 배치로 삽입
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < wordsData.length; i += batchSize) {
    const batch = wordsData.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('words')
      .insert(batch)
      .select();

    if (error) {
      console.error(`   ❌ Batch ${i / batchSize + 1} 실패:`, error.message);
      throw error;
    }

    totalInserted += data?.length || 0;
    console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}: ${data?.length}개 단어 삽입`);
  }

  console.log(`\n✅ 총 ${totalInserted}개 단어 삽입 완료\n`);
  return totalInserted;
}

/**
 * Commentaries 마이그레이션
 */
async function migrateCommentaries() {
  console.log('📖 Commentaries 데이터 마이그레이션...\n');

  // Genesis 1-3장만 필터
  const targetVerses = verses.filter(v => {
    const match = v.id.match(/^gen([1-3])-/);
    return match !== null && v.commentary;
  });

  console.log(`   대상 구절: ${targetVerses.length}개\n`);

  const commentariesData = targetVerses.map(verse => ({
    verse_id: convertIdFormat(verse.id),
    intro: verse.commentary!.intro
  }));

  if (commentariesData.length === 0) {
    console.log('   ⚠️  마이그레이션할 commentaries가 없습니다.\n');
    return { commentaries: 0, sections: 0, questions: 0, conclusions: 0 };
  }

  const { data: commData, error: commError } = await supabase
    .from('commentaries')
    .insert(commentariesData)
    .select();

  if (commError) {
    console.error('   ❌ Commentaries 삽입 실패:', commError.message);
    throw commError;
  }

  console.log(`✅ ${commData?.length || 0}개 commentaries 삽입\n`);

  // Commentary Sections, Questions, Conclusions
  console.log('📚 Commentary 관련 데이터 마이그레이션...\n');

  // commData에서 commentary_id 매핑 생성
  const verseToCommentaryMap: { [verseId: string]: string } = {};
  commData?.forEach((comm: any) => {
    verseToCommentaryMap[comm.verse_id] = comm.id;
  });

  const sectionsData: any[] = [];
  const questionsData: any[] = [];
  const conclusionsData: any[] = [];

  targetVerses.forEach(verse => {
    if (!verse.commentary) return;

    const newVerseId = convertIdFormat(verse.id);
    const commentaryId = verseToCommentaryMap[newVerseId];

    if (!commentaryId) {
      console.warn(`⚠️  Commentary ID not found for ${newVerseId}`);
      return;
    }

    // Sections
    if (verse.commentary.sections) {
      verse.commentary.sections.forEach((section, idx) => {
        sectionsData.push({
          commentary_id: commentaryId,
          position: idx + 1,
          emoji: section.emoji || '📖',
          title: section.title,
          description: section.description,
          points: section.points || [],
          color: section.color || null
        });
      });
    }

    // Why Questions
    if (verse.commentary.whyQuestion) {
      questionsData.push({
        commentary_id: commentaryId,
        question: verse.commentary.whyQuestion.question,
        answer: verse.commentary.whyQuestion.answer,
        bible_references: verse.commentary.whyQuestion.bibleReferences || []
      });
    }

    // Conclusions
    if (verse.commentary.conclusion) {
      conclusionsData.push({
        commentary_id: commentaryId,
        title: verse.commentary.conclusion.title || '결론',
        content: `신학적: ${verse.commentary.conclusion.theological}\n\n실천적: ${verse.commentary.conclusion.practical}`
      });
    }
  });

  // Sections 삽입
  if (sectionsData.length > 0) {
    const { data: secData, error: secError } = await supabase
      .from('commentary_sections')
      .insert(sectionsData)
      .select();

    if (secError) {
      console.error('   ❌ Sections 삽입 실패:', secError.message);
      throw secError;
    }

    console.log(`✅ ${secData?.length || 0}개 sections 삽입`);
  }

  // Why Questions 삽입
  if (questionsData.length > 0) {
    const { data: qData, error: qError } = await supabase
      .from('why_questions')
      .insert(questionsData)
      .select();

    if (qError) {
      console.error('   ❌ Questions 삽입 실패:', qError.message);
      throw qError;
    }

    console.log(`✅ ${qData?.length || 0}개 why questions 삽입`);
  }

  // Conclusions 삽입
  if (conclusionsData.length > 0) {
    const { data: cData, error: cError } = await supabase
      .from('commentary_conclusions')
      .insert(conclusionsData)
      .select();

    if (cError) {
      console.error('   ❌ Conclusions 삽입 실패:', cError.message);
      throw cError;
    }

    console.log(`✅ ${cData?.length || 0}개 conclusions 삽입`);
  }

  console.log();

  return {
    commentaries: commData?.length || 0,
    sections: sectionsData.length,
    questions: questionsData.length,
    conclusions: conclusionsData.length
  };
}

/**
 * 메인 실행
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Words & Commentaries 재마이그레이션');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 1. Words 마이그레이션
    const wordsCount = await migrateWords();

    // 2. Commentaries 마이그레이션
    const commResults = await migrateCommentaries();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 재마이그레이션 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 요약:');
    console.log(`   - Words: ${wordsCount}개`);
    console.log(`   - Commentaries: ${commResults.commentaries}개`);
    console.log(`   - Sections: ${commResults.sections}개`);
    console.log(`   - Why Questions: ${commResults.questions}개`);
    console.log(`   - Conclusions: ${commResults.conclusions}개\n`);

  } catch (error: any) {
    console.error('\n❌ 재마이그레이션 실패:', error.message);
    process.exit(1);
  }
}

main();
