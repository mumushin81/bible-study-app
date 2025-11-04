/**
 * 창세기 1:21 "바다괴물들" 단어 찾기
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
  console.log('🔍 창세기 1:21 "바다괴물들" 단어 찾기\n');

  // 창세기 1:21 구절 조회
  const { data: verse } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 21)
    .single();

  if (!verse) {
    console.error('❌ 창세기 1:21을 찾을 수 없습니다');
    return;
  }

  console.log(`📖 구절: ${verse.reference}`);

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

  console.log(`\n총 ${words.length}개 단어:\n`);

  words.forEach((word, idx) => {
    console.log(`[${idx + 1}] ${word.korean} (${word.hebrew})`);
    console.log(`   의미: ${word.meaning}`);
    console.log(`   ID: ${word.id}`);

    // "바다괴물" 또는 "큰 물고기" 등이 포함된 단어 강조
    if (word.korean.includes('괴물') || word.korean.includes('타닌') ||
        word.meaning.includes('괴물') || word.meaning.includes('큰') ||
        word.hebrew.includes('תַנִּינִם') || word.hebrew.includes('הַתַּנִּינִם')) {
      console.log(`   ⭐ 이 단어입니다!`);
      console.log(`   현재 이미지: ${word.flashcard_img_url}`);
    }
    console.log('');
  });
}

main().catch(console.error);
