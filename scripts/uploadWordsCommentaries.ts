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

async function uploadWordsCommentaries(filePath: string) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 Words & Commentaries 업로드 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // JSON 파일 읽기
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const data: VerseWordsCommentaries = JSON.parse(jsonData);

  console.log(`📖 구절: ${data.reference}`);
  console.log(`🔑 Verse ID: ${data.verse_id}`);
  console.log(`📝 Words: ${data.words.length}개`);
  console.log(`📚 Commentary Sections: ${data.commentary.sections.length}개\n`);

  try {
    // 1. Words 업로드
    console.log('⏳ Words 업로드 중...');
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
      console.error('❌ Words 업로드 실패:', wordsError.message);
      return;
    }

    console.log(`✅ Words 업로드 완료: ${wordsResult?.length}개\n`);

    // 2. Commentary 업로드
    console.log('⏳ Commentary 업로드 중...');
    const { data: commentaryResult, error: commentaryError } = await supabase
      .from('commentaries')
      .insert({
        verse_id: data.verse_id,
        intro: data.commentary.intro
      })
      .select()
      .single();

    if (commentaryError) {
      console.error('❌ Commentary 업로드 실패:', commentaryError.message);
      return;
    }

    console.log(`✅ Commentary 업로드 완료\n`);

    const commentaryId = commentaryResult.id;

    // 3. Commentary Sections 업로드
    console.log('⏳ Commentary Sections 업로드 중...');
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
      console.error('❌ Commentary Sections 업로드 실패:', sectionsError.message);
      return;
    }

    console.log(`✅ Commentary Sections 업로드 완료: ${sectionsResult?.length}개\n`);

    // 4. Why Question 업로드
    console.log('⏳ Why Question 업로드 중...');
    const { data: whyQuestionResult, error: whyQuestionError } = await supabase
      .from('why_questions')
      .insert({
        commentary_id: commentaryId,
        question: data.commentary.why_question.question,
        answer: data.commentary.why_question.answer,
        bible_references: data.commentary.why_question.bible_references
      })
      .select();

    if (whyQuestionError) {
      console.error('❌ Why Question 업로드 실패:', whyQuestionError.message);
      return;
    }

    console.log(`✅ Why Question 업로드 완료\n`);

    // 5. Commentary Conclusion 업로드
    console.log('⏳ Commentary Conclusion 업로드 중...');
    const { data: conclusionResult, error: conclusionError } = await supabase
      .from('commentary_conclusions')
      .insert({
        commentary_id: commentaryId,
        title: data.commentary.conclusion.title,
        content: data.commentary.conclusion.content
      })
      .select();

    if (conclusionError) {
      console.error('❌ Commentary Conclusion 업로드 실패:', conclusionError.message);
      return;
    }

    console.log(`✅ Commentary Conclusion 업로드 완료\n`);

    // 최종 결과
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ 모든 데이터 업로드 성공!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 업로드 요약:');
    console.log(`   - Words: ${wordsResult?.length}개`);
    console.log(`   - Commentary: 1개`);
    console.log(`   - Sections: ${sectionsResult?.length}개`);
    console.log(`   - Why Question: 1개`);
    console.log(`   - Conclusion: 1개\n`);

  } catch (error: any) {
    console.error('❌ 업로드 중 오류 발생:', error.message);
  }
}

// 파일 경로를 인자로 받음
const filePath = process.argv[2] || 'genesis4-words-commentaries-sample.json';
uploadWordsCommentaries(filePath);
