/**
 * 생성된 구절 컨텐츠를 Supabase에 저장
 *
 * Claude Code로 생성한 JSON 파일을 읽어
 * Supabase 데이터베이스에 저장합니다.
 *
 * 사용법:
 *   tsx scripts/saveVerseContent.ts <json_file_path> [--force]
 *
 * 예시:
 *   tsx scripts/saveVerseContent.ts data/generated/verses-1234567890.json
 *   tsx scripts/saveVerseContent.ts data/generated/verses-gen2-4.json --force
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 환경변수 로드
dotenv.config({ path: '.env.local' });

// 로그 헬퍼
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

/**
 * Supabase 클라이언트 생성
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * JSON 파일 읽기
 */
function loadJsonFile(filepath: string): any[] {
  if (!fs.existsSync(filepath)) {
    log.error(`파일을 찾을 수 없습니다: ${filepath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filepath, 'utf-8');

  try {
    const data = JSON.parse(content);

    // 단일 객체를 배열로 변환
    return Array.isArray(data) ? data : [data];
  } catch (error: any) {
    log.error(`JSON 파싱 실패: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Supabase에 컨텐츠 저장
 */
async function saveToSupabase(
  supabase: ReturnType<typeof createSupabaseClient>,
  verseId: string,
  content: any,
  force: boolean = false
): Promise<void> {
  log.step(`${verseId} 저장 중...`);

  // 0. verses 테이블 업데이트 (IPA, 한글발음, 현대어 의역)
  if (content.ipa || content.korean_pronunciation || content.modern) {
    log.info('구절 기본 정보 업데이트 중...');

    const updateData: any = {};
    if (content.ipa) updateData.ipa = content.ipa;
    if (content.korean_pronunciation) updateData.korean_pronunciation = content.korean_pronunciation;
    if (content.modern) updateData.modern = content.modern;

    const { error: verseUpdateError } = await supabase
      .from('verses')
      .update(updateData)
      .eq('id', verseId);

    if (verseUpdateError) {
      log.error(`구절 업데이트 실패: ${verseUpdateError.message}`);
      throw verseUpdateError;
    }

    log.success('구절 기본 정보 업데이트 완료');
  }

  // 1. 기존 데이터 확인
  const { data: existingCommentary } = await supabase
    .from('commentaries')
    .select('id')
    .eq('verse_id', verseId)
    .single();

  const { data: existingWords } = await supabase
    .from('words')
    .select('id')
    .eq('verse_id', verseId);

  const hasContent = existingCommentary || (existingWords && existingWords.length > 0);

  if (hasContent && !force) {
    log.warn(`이미 컨텐츠가 존재합니다: ${verseId}`);
    log.warn(`덮어쓰려면 --force 플래그를 사용하세요.`);
    return;
  }

  // 2. 기존 데이터 삭제 (force 모드)
  if (hasContent && force) {
    log.info('기존 데이터 삭제 중...');

    if (existingCommentary) {
      // 관련 테이블 삭제
      await supabase.from('commentary_sections').delete().eq('commentary_id', existingCommentary.id);
      await supabase.from('why_questions').delete().eq('commentary_id', existingCommentary.id);
      await supabase.from('commentary_conclusions').delete().eq('commentary_id', existingCommentary.id);
      await supabase.from('commentaries').delete().eq('id', existingCommentary.id);
    }

    if (existingWords && existingWords.length > 0) {
      for (const word of existingWords) {
        await supabase.from('word_relations').delete().eq('word_id', word.id);
      }
      await supabase.from('words').delete().eq('verse_id', verseId);
    }

    log.success('기존 데이터 삭제 완료');
  }

  // 3. words 저장
  log.info(`단어 ${content.words.length}개 저장 중...`);

  for (let i = 0; i < content.words.length; i++) {
    const word = content.words[i];

    const { data, error } = await supabase
      .from('words')
      .insert({
        verse_id: verseId,
        hebrew: word.hebrew,
        meaning: word.meaning,
        ipa: word.ipa,
        korean: word.korean,
        root: word.root,
        grammar: word.grammar,
        emoji: word.emoji || null,
        structure: word.structure || null,
        category: word.category || null,
        position: i
      })
      .select('id')
      .single();

    if (error) {
      log.error(`단어 저장 실패: ${word.hebrew} - ${error.message}`);
      throw error;
    }

    // relatedWords 저장
    if (word.relatedWords && word.relatedWords.length > 0) {
      for (const relatedWord of word.relatedWords) {
        await supabase.from('word_relations').insert({
          word_id: data.id,
          related_word: relatedWord
        });
      }
    }
  }

  log.success(`단어 ${content.words.length}개 저장 완료`);

  // 4. commentary 저장
  log.info('주석 저장 중...');

  const { data: commentary, error: commentaryError } = await supabase
    .from('commentaries')
    .insert({
      verse_id: verseId,
      intro: content.commentary.intro
    })
    .select('id')
    .single();

  if (commentaryError || !commentary) {
    log.error(`주석 저장 실패: ${commentaryError?.message}`);
    throw commentaryError;
  }

  log.success('주석 intro 저장 완료');

  // 5. commentary_sections 저장
  log.info(`섹션 ${content.commentary.sections.length}개 저장 중...`);

  for (let i = 0; i < content.commentary.sections.length; i++) {
    const section = content.commentary.sections[i];

    const { error } = await supabase
      .from('commentary_sections')
      .insert({
        commentary_id: commentary.id,
        emoji: section.emoji,
        title: section.title,
        description: section.description,
        points: section.points,
        color: section.color || null,
        position: i
      });

    if (error) {
      log.error(`섹션 저장 실패: ${section.title} - ${error.message}`);
      throw error;
    }
  }

  log.success(`섹션 ${content.commentary.sections.length}개 저장 완료`);

  // 6. why_question 저장
  log.info('질문 저장 중...');

  const { error: questionError } = await supabase
    .from('why_questions')
    .insert({
      commentary_id: commentary.id,
      question: content.commentary.whyQuestion.question,
      answer: content.commentary.whyQuestion.answer,
      bible_references: content.commentary.whyQuestion.bibleReferences
    });

  if (questionError) {
    log.error(`질문 저장 실패: ${questionError.message}`);
    throw questionError;
  }

  log.success('질문 저장 완료');

  // 7. commentary_conclusion 저장
  log.info('결론 저장 중...');

  const { error: conclusionError } = await supabase
    .from('commentary_conclusions')
    .insert({
      commentary_id: commentary.id,
      title: content.commentary.conclusion.title,
      content: content.commentary.conclusion.content
    });

  if (conclusionError) {
    log.error(`결론 저장 실패: ${conclusionError.message}`);
    throw conclusionError;
  }

  log.success('결론 저장 완료');
  log.success(`✅ ${verseId} 저장 완료!`);
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);

  // 사용법 출력
  if (args.length === 0) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 생성된 구절 컨텐츠를 Supabase에 저장
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

사용법:
  tsx scripts/saveVerseContent.ts <json_file_path> [--force]

예시:
  tsx scripts/saveVerseContent.ts data/generated/verses-1234567890.json
  tsx scripts/saveVerseContent.ts data/generated/verses-gen2-4.json --force

옵션:
  --force    기존 컨텐츠를 덮어씁니다

필요한 환경 변수:
  VITE_SUPABASE_URL         Supabase 프로젝트 URL
  SUPABASE_SERVICE_ROLE_KEY  Supabase 서비스 롤 키

JSON 형식:
  단일 구절:
  {
    "verse_id": "gen2-4",
    "ipa": "...",
    "korean_pronunciation": "...",
    "modern": "...",
    "words": [...],
    "commentary": {...}
  }

  여러 구절:
  [
    { "verse_id": "gen2-4", "ipa": "...", ... },
    { "verse_id": "gen2-5", "ipa": "...", ... }
  ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    process.exit(0);
  }

  const filepath = args[0];
  const force = args.includes('--force');

  log.step('구절 컨텐츠 저장 시작');
  log.info(`파일: ${filepath}`);

  // JSON 파일 로드
  const verses = loadJsonFile(filepath);
  log.success(`${verses.length}개 구절 데이터 로드 완료`);

  // Supabase 클라이언트 생성
  const supabase = createSupabaseClient();
  log.success('Supabase 연결 완료');

  // 각 구절 저장
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const verseData of verses) {
    const verseId = verseData.verse_id;

    try {
      await saveToSupabase(supabase, verseId, verseData, force);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes('이미 존재합니다')) {
        skipCount++;
      } else {
        log.error(`실패: ${verseId} - ${error.message}`);
        errorCount++;
      }
    }
  }

  // 최종 리포트
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.step('최종 결과');
  log.success(`✅ 성공: ${successCount}개`);
  if (skipCount > 0) log.warn(`⏭️  건너뜀: ${skipCount}개`);
  if (errorCount > 0) log.error(`❌ 실패: ${errorCount}개`);
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log.error(`실행 중 오류 발생: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}
