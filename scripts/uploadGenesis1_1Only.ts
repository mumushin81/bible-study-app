/**
 * genesis_1_1.json만 Supabase에 업로드
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

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

async function uploadGenesis1_1(supabase: any) {
  log.step('창세기 1:1 업로드 시작');

  const filePath = path.join(__dirname, '../data/generated_v2/genesis_1_1.json');
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const { id: verseId, reference, hebrew, ipa, koreanPronunciation, modern, words } = content;

  // 1. Verse 업로드
  log.info('Verse 업로드 중...');
  const { error: verseError } = await supabase
    .from('verses')
    .upsert({
      id: verseId,
      book_id: 'genesis',
      chapter: 1,
      verse_number: 1,
      reference: reference,
      hebrew: hebrew,
      ipa: ipa,
      korean_pronunciation: koreanPronunciation,
      modern: modern,
    }, {
      onConflict: 'id'
    });

  if (verseError) {
    log.error(`Verse 업로드 실패: ${verseError.message}`);
    return false;
  }
  log.success('Verse 업로드 완료');

  // 2. 기존 단어 삭제
  log.info('기존 단어 삭제 중...');
  await supabase
    .from('words')
    .delete()
    .eq('verse_id', verseId);

  // 3. Words 업로드
  log.info('Words 업로드 중...');
  const wordsToInsert = words.map((word: any, index: number) => ({
    verse_id: verseId,
    hebrew: word.hebrew,
    meaning: word.meaning,
    ipa: word.ipa,
    korean: word.korean,
    root: word.root,
    grammar: word.grammar,
    flashcard_img_url: word.flashcardImgUrl || null,
    position: index,
  }));

  const { error: wordsError } = await supabase
    .from('words')
    .insert(wordsToInsert);

  if (wordsError) {
    log.error(`Words 업로드 실패: ${wordsError.message}`);
    return false;
  }

  log.success(`${wordsToInsert.length}개 단어 업로드 완료`);
  return true;
}

async function verifyUpload(supabase: any) {
  log.step('업로드 검증');

  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, flashcard_img_url')
    .eq('verse_id', 'genesis_1_1')
    .order('position');

  if (error) {
    log.error(`검증 실패: ${error.message}`);
    return;
  }

  log.info(`\n총 ${words.length}개 단어 확인:`);
  words.forEach((word: any) => {
    const hasImage = word.flashcard_img_url ? '✅' : '❌';
    log.info(`${hasImage} ${word.hebrew}: ${word.flashcard_img_url || '(이미지 없음)'}`);
  });
}

async function main() {
  const supabase = createSupabaseClient();

  const success = await uploadGenesis1_1(supabase);

  if (success) {
    await verifyUpload(supabase);
    log.step('완료');
    log.success('창세기 1:1 업로드 및 검증 완료!');
  } else {
    process.exit(1);
  }
}

main().catch(console.error);
