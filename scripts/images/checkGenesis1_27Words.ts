/**
 * 창세기 1:27 단어 확인
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../../.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🔍 창세기 1:27 단어 확인\n');

  // 창세기 1:27 구절 조회
  const { data: verse } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 27)
    .single();

  if (!verse) {
    console.error('❌ 창세기 1:27을 찾을 수 없습니다');
    return;
  }

  console.log(`📖 구절: ${verse.reference}\n`);

  // 해당 구절의 모든 단어 조회
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, flashcard_img_url, position')
    .eq('verse_id', verse.id)
    .order('position');

  if (!words) {
    console.error('❌ 단어를 찾을 수 없습니다');
    return;
  }

  console.log(`총 ${words.length}개 단어:\n`);

  let noImageCount = 0;

  words.forEach((word, idx) => {
    console.log(`[${idx + 1}] ${word.korean} (${word.hebrew})`);
    console.log(`   의미: ${word.meaning}`);
    console.log(`   ID: ${word.id}`);

    if (!word.flashcard_img_url) {
      console.log(`   ❌ 이미지 없음!`);
      noImageCount++;
    } else {
      console.log(`   ✅ 이미지: ${word.flashcard_img_url}`);
    }

    // "남자" 또는 "여자" 관련 단어 강조
    if (word.korean.includes('남자') || word.korean.includes('여자') ||
        word.korean.includes('자카르') || word.korean.includes('네케바') ||
        word.meaning.includes('남자') || word.meaning.includes('여자') ||
        word.meaning.includes('남성') || word.meaning.includes('여성')) {
      console.log(`   ⭐ 성별 관련 단어!`);
    }
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 요약: ${noImageCount}개 단어에 이미지 없음`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
