/**
 * Genesis 2:1-3 샘플 데이터 마이그레이션
 *
 * data/genesis-2-sample.json에서 읽어서 Supabase로 마이그레이션합니다.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Word {
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  root: string;
  grammar: string;
  structure?: string;
  emoji?: string;
}

interface CommentarySection {
  emoji: string;
  title: string;
  description: string;
  points: string[];
  color: string;
}

interface WhyQuestion {
  question: string;
  answer: string;
  bibleReferences: string[];
}

interface Conclusion {
  title: string;
  content: string;
}

interface Commentary {
  intro: string;
  sections: CommentarySection[];
  whyQuestion: WhyQuestion;
  conclusion: Conclusion;
}

interface Verse {
  id: string;
  reference: string;
  hebrew: string;
  ipa: string;
  koreanPronunciation: string;
  modern: string;
  translation: string;
  words: Word[];
  commentary: Commentary;
}

/**
 * Words 마이그레이션
 */
async function migrateWords(verses: Verse[]) {
  console.log('\n📝 Words 데이터 마이그레이션...\n');

  const wordsData: any[] = [];

  verses.forEach(verse => {
    if (verse.words && Array.isArray(verse.words)) {
      verse.words.forEach((word, index) => {
        wordsData.push({
          verse_id: verse.id,
          position: index + 1,
          hebrew: word.hebrew,
          meaning: word.meaning,
          ipa: word.ipa,
          korean: word.korean,
          root: word.root,
          grammar: word.grammar,
          structure: word.structure || null,
          emoji: word.emoji || null,
          category: null
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
async function migrateCommentaries(verses: Verse[]) {
  console.log('📖 Commentaries 데이터 마이그레이션...\n');

  const targetVerses = verses.filter(v => v.commentary);

  console.log(`   대상 구절: ${targetVerses.length}개\n`);

  const commentariesData = targetVerses.map(verse => ({
    verse_id: verse.id,
    intro: verse.commentary.intro
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

    const commentaryId = verseToCommentaryMap[verse.id];

    if (!commentaryId) {
      console.warn(`⚠️  Commentary ID not found for ${verse.id}`);
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
        title: verse.commentary.conclusion.title || '💡 신학적 의미',
        content: verse.commentary.conclusion.content
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
 * 기존 데이터 삭제
 */
async function deleteExistingData(verseIds: string[]) {
  console.log('\n🗑️  기존 데이터 삭제...\n');

  // 1. Commentary 관련 데이터 삭제 (FK로 cascade되지 않는 경우를 위해)
  const { data: existingCommentaries } = await supabase
    .from('commentaries')
    .select('id')
    .in('verse_id', verseIds);

  if (existingCommentaries && existingCommentaries.length > 0) {
    const commentaryIds = existingCommentaries.map((c: any) => c.id);

    // commentary_sections, why_questions, commentary_conclusions 삭제
    await supabase.from('commentary_sections').delete().in('commentary_id', commentaryIds);
    await supabase.from('why_questions').delete().in('commentary_id', commentaryIds);
    await supabase.from('commentary_conclusions').delete().in('commentary_id', commentaryIds);

    console.log(`   ✓ Commentary 관련 데이터 삭제 완료`);
  }

  // 2. Commentaries 삭제
  const { error: commError } = await supabase
    .from('commentaries')
    .delete()
    .in('verse_id', verseIds);

  if (commError) {
    console.log(`   ℹ️  Commentaries 삭제 (없음): ${commError.message}`);
  } else {
    console.log(`   ✓ Commentaries 삭제 완료`);
  }

  // 3. Words 삭제
  const { error: wordsError } = await supabase
    .from('words')
    .delete()
    .in('verse_id', verseIds);

  if (wordsError) {
    console.log(`   ℹ️  Words 삭제 (없음): ${wordsError.message}`);
  } else {
    console.log(`   ✓ Words 삭제 완료`);
  }

  console.log('\n✅ 기존 데이터 삭제 완료\n');
}

/**
 * 메인 실행
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Genesis 2:1-3 샘플 데이터 마이그레이션');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // JSON 파일 읽기
    const jsonPath = path.join(process.cwd(), 'data/genesis-2-sample.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const verses: Verse[] = JSON.parse(jsonData);

    console.log(`\n📦 로드된 구절: ${verses.length}개`);
    verses.forEach(v => {
      console.log(`   - ${v.id}: ${v.reference}`);
    });

    // 0. 기존 데이터 삭제 (UPSERT를 위해)
    const verseIds = verses.map(v => v.id);
    await deleteExistingData(verseIds);

    // 1. Words 마이그레이션
    const wordsCount = await migrateWords(verses);

    // 2. Commentaries 마이그레이션
    const commResults = await migrateCommentaries(verses);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 마이그레이션 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 요약:');
    console.log(`   - Verses: ${verses.length}개`);
    console.log(`   - Words: ${wordsCount}개`);
    console.log(`   - Commentaries: ${commResults.commentaries}개`);
    console.log(`   - Sections: ${commResults.sections}개`);
    console.log(`   - Why Questions: ${commResults.questions}개`);
    console.log(`   - Conclusions: ${commResults.conclusions}개\n`);

  } catch (error: any) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
