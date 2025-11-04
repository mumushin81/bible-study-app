/**
 * 창세기 1장만 Supabase에 업로드
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

async function uploadVerse(supabase: any, verseNum: number): Promise<boolean> {
  const filePath = path.join(__dirname, `../data/generated_v2/genesis_1_${verseNum}.json`);

  if (!fs.existsSync(filePath)) {
    log.error(`파일 없음: genesis_1_${verseNum}.json`);
    return false;
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { id: verseId, reference, hebrew, ipa, koreanPronunciation, modern, words } = content;

    // Verse 업로드
    const { error: verseError } = await supabase
      .from('verses')
      .upsert({
        id: verseId,
        book_id: 'genesis',
        chapter: 1,
        verse_number: verseNum,
        reference: reference,
        hebrew: hebrew,
        ipa: ipa,
        korean_pronunciation: koreanPronunciation,
        modern: modern,
      }, {
        onConflict: 'id'
      });

    if (verseError) {
      log.error(`${verseNum}절 Verse 업로드 실패: ${verseError.message}`);
      return false;
    }

    // 기존 단어 삭제
    await supabase.from('words').delete().eq('verse_id', verseId);

    // Words 업로드
    const wordsToInsert = words.map((word: any, index: number) => ({
      verse_id: verseId,
      hebrew: word.hebrew,
      meaning: word.meaning,
      ipa: word.ipa,
      korean: word.korean,
      letters: word.letters || null,
      root: word.root,
      grammar: word.grammar,
      flashcard_img_url: word.flashcardImgUrl || null,
      icon_svg: word.iconSvg || null,
      root_analysis: word.rootAnalysis || null,
      position: index,
    }));

    const { error: wordsError } = await supabase
      .from('words')
      .insert(wordsToInsert);

    if (wordsError) {
      log.error(`${verseNum}절 Words 업로드 실패: ${wordsError.message}`);
      return false;
    }

    const wordsWithImages = wordsToInsert.filter(w => w.flashcard_img_url).length;
    log.success(`1:${verseNum} - ${wordsToInsert.length}개 단어 (이미지: ${wordsWithImages}개)`);

    return true;

  } catch (error: any) {
    log.error(`${verseNum}절 처리 실패: ${error.message}`);
    return false;
  }
}

async function main() {
  log.step('창세기 1장 업로드 시작');

  const supabase = createSupabaseClient();

  let successCount = 0;
  let failCount = 0;

  // 창세기 1장 31절까지
  for (let verseNum = 1; verseNum <= 31; verseNum++) {
    const success = await uploadVerse(supabase, verseNum);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  log.step('완료');
  log.success(`성공: ${successCount}절`);
  if (failCount > 0) {
    log.error(`실패: ${failCount}절`);
  }

  // 최종 통계
  log.step('📊 최종 통계');
  const { data: totalWords } = await supabase
    .from('words')
    .select('hebrew, flashcard_img_url', { count: 'exact' })
    .like('verse_id', 'genesis_1_%');

  if (totalWords) {
    const wordsWithImages = totalWords.filter((w: any) => w.flashcard_img_url).length;
    log.info(`전체 단어: ${totalWords.length}개`);
    log.success(`이미지 있음: ${wordsWithImages}개 (${((wordsWithImages/totalWords.length)*100).toFixed(1)}%)`);
    log.info(`이미지 없음: ${totalWords.length - wordsWithImages}개`);
  }
}

main().catch(console.error);
