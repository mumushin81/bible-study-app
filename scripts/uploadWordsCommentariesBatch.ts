import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface WordData {
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  root: string;
  grammar: string;
  structure: string | null;
  emoji: string | null;
  category: string | null;
  position: number;
}

interface CommentarySection {
  emoji: string;
  title: string;
  description: string;
  points: string[];
  color: string | null;
  position: number;
}

interface WhyQuestion {
  question: string;
  answer: string;
  bible_references: string[];
}

interface CommentaryConclusion {
  title: string;
  content: string;
}

interface CommentaryData {
  intro: string;
  sections: CommentarySection[];
  why_question: WhyQuestion;
  conclusion: CommentaryConclusion;
}

interface VerseWordsCommentaries {
  verse_id: string;
  reference: string;
  words: WordData[];
  commentary: CommentaryData;
}

async function uploadSingleVerse(data: VerseWordsCommentaries, index: number, total: number) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📖 [${index + 1}/${total}] ${data.reference}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  try {
    // 1. Words 업로드
    console.log(`⏳ Words 업로드 중... (${data.words.length}개)`);
    const wordsToInsert = data.words.map(word => ({
      verse_id: data.verse_id,
      hebrew: word.hebrew,
      meaning: word.meaning,
      ipa: word.ipa,
      korean: word.korean,
      root: word.root,
      grammar: word.grammar,
      structure: word.structure,
      emoji: word.emoji,
      category: word.category,
      position: word.position
    }));

    const { data: wordsResult, error: wordsError } = await supabase
      .from('words')
      .insert(wordsToInsert)
      .select();

    if (wordsError) {
      console.error(`❌ Words 업로드 실패: ${wordsError.message}`);
      return false;
    }

    console.log(`✅ Words: ${wordsResult?.length}개`);

    // 2. Commentary 업로드
    console.log(`⏳ Commentary 업로드 중...`);
    const { data: commentaryResult, error: commentaryError } = await supabase
      .from('commentaries')
      .insert({
        verse_id: data.verse_id,
        intro: data.commentary.intro
      })
      .select()
      .single();

    if (commentaryError) {
      console.error(`❌ Commentary 업로드 실패: ${commentaryError.message}`);
      return false;
    }

    const commentaryId = commentaryResult.id;
    console.log(`✅ Commentary: 1개`);

    // 3. Commentary Sections 업로드
    console.log(`⏳ Sections 업로드 중... (${data.commentary.sections.length}개)`);
    const sectionsToInsert = data.commentary.sections.map(section => ({
      commentary_id: commentaryId,
      emoji: section.emoji,
      title: section.title,
      description: section.description,
      points: section.points,
      color: section.color,
      position: section.position
    }));

    const { data: sectionsResult, error: sectionsError } = await supabase
      .from('commentary_sections')
      .insert(sectionsToInsert)
      .select();

    if (sectionsError) {
      console.error(`❌ Sections 업로드 실패: ${sectionsError.message}`);
      return false;
    }

    console.log(`✅ Sections: ${sectionsResult?.length}개`);

    // 4. Why Question 업로드
    const { error: whyQuestionError } = await supabase
      .from('why_questions')
      .insert({
        commentary_id: commentaryId,
        question: data.commentary.why_question.question,
        answer: data.commentary.why_question.answer,
        bible_references: data.commentary.why_question.bible_references
      });

    if (whyQuestionError) {
      console.error(`❌ Why Question 업로드 실패: ${whyQuestionError.message}`);
      return false;
    }

    console.log(`✅ Why Question: 1개`);

    // 5. Commentary Conclusion 업로드
    const { error: conclusionError } = await supabase
      .from('commentary_conclusions')
      .insert({
        commentary_id: commentaryId,
        title: data.commentary.conclusion.title,
        content: data.commentary.conclusion.content
      });

    if (conclusionError) {
      console.error(`❌ Conclusion 업로드 실패: ${conclusionError.message}`);
      return false;
    }

    console.log(`✅ Conclusion: 1개`);
    console.log(`✨ ${data.reference} 업로드 완료!`);

    return true;
  } catch (error: any) {
    console.error(`❌ ${data.reference} 업로드 중 오류:`, error.message);
    return false;
  }
}

async function uploadWordsCommentariesBatch(filePath: string) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 배치 업로드 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // JSON 파일 읽기
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const verses: VerseWordsCommentaries[] = JSON.parse(jsonData);

  console.log(`📚 총 ${verses.length}개 구절 처리 예정\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < verses.length; i++) {
    const success = await uploadSingleVerse(verses[i], i, verses.length);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // 서버 부하 방지를 위한 짧은 대기
    if (i < verses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 최종 결과
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 배치 업로드 완료');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ 성공: ${successCount}개`);
  if (failCount > 0) {
    console.log(`❌ 실패: ${failCount}개`);
  }
  console.log('');
}

// 파일 경로를 인자로 받음
const filePath = process.argv[2];
if (!filePath) {
  console.error('❌ 파일 경로를 지정해주세요.');
  console.log('사용법: npx tsx scripts/uploadWordsCommentariesBatch.ts <파일경로>');
  process.exit(1);
}

uploadWordsCommentariesBatch(filePath);
