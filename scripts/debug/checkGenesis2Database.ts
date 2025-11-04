/**
 * 창세기 2장 데이터베이스 상태 확인
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local 로드
config({ path: join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 창세기 2:1 단어들의 flashcard_img_url 확인\n');

  const { data: verse, error: verseError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('id', 'genesis_2_1')
    .single();

  if (verseError) {
    console.error('❌ 구절 조회 실패:', verseError);
    return;
  }

  console.log(`📖 구절: ${verse.reference} (ID: ${verse.id})\n`);

  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('hebrew, korean, flashcard_img_url, icon_url, position')
    .eq('verse_id', verse.id)
    .order('position');

  if (wordsError) {
    console.error('❌ 단어 조회 실패:', wordsError);
    return;
  }

  console.log(`총 ${words.length}개 단어:\n`);

  words.forEach((word, idx) => {
    const hasFlashcard = word.flashcard_img_url ? '✅' : '❌';
    const hasIcon = word.icon_url ? '✅' : '❌';
    console.log(`${idx + 1}. ${word.hebrew} (${word.korean})`);
    console.log(`   flashcard_img_url: ${hasFlashcard} ${word.flashcard_img_url || 'NULL'}`);
    console.log(`   icon_url: ${hasIcon} ${word.icon_url || 'NULL'}`);
    console.log('');
  });

  const missingFlashcard = words.filter(w => !w.flashcard_img_url).length;
  const missingIcon = words.filter(w => !w.icon_url).length;

  console.log(`━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 통계:`);
  console.log(`  - flashcard_img_url 있음: ${words.length - missingFlashcard}개`);
  console.log(`  - flashcard_img_url 없음: ${missingFlashcard}개`);
  console.log(`  - icon_url 있음: ${words.length - missingIcon}개`);
  console.log(`  - icon_url 없음: ${missingIcon}개`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main();
