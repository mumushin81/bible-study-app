/**
 * generated_v2 폴더의 모든 JSON 파일을 Supabase에 업로드
 *
 * 사용법:
 *   tsx scripts/uploadGeneratedV2.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드
dotenv.config({ path: '.env.local' });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('환경 변수가 설정되지 않았습니다.');
    log.info('VITE_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요.');
    process.exit(1);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function uploadVerseContent(supabase: any, filePath: string) {
  const fileName = path.basename(filePath);

  try {
    // JSON 파일 읽기
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const { id: verseId, ipa, koreanPronunciation, modern, literal, translation, words, commentary } = content;

    if (!verseId) {
      log.error(`${fileName}: id가 없습니다.`);
      return false;
    }

    // id에서 book_id, chapter, verse_number 추출
    // 예: "genesis_1_1" -> book_id: "genesis", chapter: 1, verse_number: 1
    const idParts = verseId.split('_');
    const bookId = idParts[0];
    const chapter = parseInt(idParts[1]);
    const verseNumber = parseInt(idParts[2]);

    if (!bookId || isNaN(chapter) || isNaN(verseNumber)) {
      log.error(`${fileName}: id 형식이 잘못되었습니다 (${verseId})`);
      return false;
    }

    // 1. Verse 업데이트 또는 생성
    const { data: verseData, error: verseError} = await supabase
      .from('verses')
      .upsert({
        id: verseId,
        book_id: bookId,
        chapter: chapter,
        verse_number: verseNumber,
        reference: content.reference || `${bookId} ${chapter}:${verseNumber}`,
        hebrew: content.hebrew || '',
        ipa: ipa || '',
        korean_pronunciation: koreanPronunciation || '',
        modern: modern || '',
        literal: literal || null,
        translation: translation || null,
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (verseError) {
      log.error(`${fileName}: Verse 업로드 실패 - ${verseError.message}`);
      return false;
    }

    // 2. Words 업로드
    if (words && Array.isArray(words)) {
      // 기존 단어 삭제
      await supabase
        .from('words')
        .delete()
        .eq('verse_id', verseId);

      // 새 단어 삽입
      const wordsToInsert = words.map((word: any, index: number) => ({
        verse_id: verseId,
        hebrew: word.hebrew || '',
        meaning: word.meaning || '',
        ipa: word.ipa || '',
        korean: word.korean || '',
        letters: word.letters || null,
        root: word.root || '',
        grammar: word.grammar || '',
        emoji: word.emoji || null,
        icon_svg: word.iconSvg || null,
        position: index,
      }));

      const { error: wordsError } = await supabase
        .from('words')
        .insert(wordsToInsert);

      if (wordsError) {
        log.error(`${fileName}: Words 업로드 실패 - ${wordsError.message}`);
        return false;
      }
    }

    // 3. Commentary 업로드
    if (commentary) {
      // 기존 주석 삭제
      await supabase
        .from('commentaries')
        .delete()
        .eq('verse_id', verseId);

      // 새 주석 삽입
      const { data: commentaryData, error: commentaryError } = await supabase
        .from('commentaries')
        .insert({
          verse_id: verseId,
          intro: commentary.intro || '',
        })
        .select()
        .single();

      if (commentaryError) {
        log.error(`${fileName}: Commentary 업로드 실패 - ${commentaryError.message}`);
        return false;
      }

      const commentaryId = commentaryData.id;

      // Sections 삽입
      if (commentary.sections && Array.isArray(commentary.sections)) {
        const sectionsToInsert = commentary.sections.map((section: any, index: number) => ({
          commentary_id: commentaryId,
          emoji: section.emoji || '',
          title: section.title || '',
          description: section.description || '',
          points: section.points || [],
          color: section.color || 'blue',
          position: index,
        }));

        const { error: sectionsError } = await supabase
          .from('commentary_sections')
          .insert(sectionsToInsert);

        if (sectionsError) {
          log.error(`${fileName}: Sections 업로드 실패 - ${sectionsError.message}`);
        }
      }

      // Why Question 삽입
      if (commentary.whyQuestion) {
        const { error: whyError } = await supabase
          .from('why_questions')
          .insert({
            commentary_id: commentaryId,
            question: commentary.whyQuestion.question || '',
            answer: commentary.whyQuestion.answer || '',
            bible_references: commentary.whyQuestion.bibleReferences || [],
          });

        if (whyError) {
          log.error(`${fileName}: Why Question 업로드 실패 - ${whyError.message}`);
        }
      }

      // Conclusion 삽입
      if (commentary.conclusion) {
        const { error: conclusionError } = await supabase
          .from('commentary_conclusions')
          .insert({
            commentary_id: commentaryId,
            title: commentary.conclusion.title || '',
            content: commentary.conclusion.content || '',
          });

        if (conclusionError) {
          log.error(`${fileName}: Conclusion 업로드 실패 - ${conclusionError.message}`);
        }
      }
    }

    log.success(`${fileName} 업로드 완료`);
    return true;

  } catch (error: any) {
    log.error(`${fileName}: ${error.message}`);
    return false;
  }
}

async function main() {
  log.step('generated_v2 폴더 업로드 시작');

  const supabase = createSupabaseClient();
  const dirPath = path.join(__dirname, '../data/generated_v2');

  if (!fs.existsSync(dirPath)) {
    log.error(`폴더가 존재하지 않습니다: ${dirPath}`);
    process.exit(1);
  }

  // JSON 파일 목록
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.json'))
    .sort();

  log.info(`총 ${files.length}개 파일 발견`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const success = await uploadVerseContent(supabase, filePath);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // 짧은 대기 (rate limit 방지)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  log.step('업로드 완료');
  log.success(`성공: ${successCount}개`);
  if (failCount > 0) {
    log.error(`실패: ${failCount}개`);
  }
}

main().catch(console.error);
