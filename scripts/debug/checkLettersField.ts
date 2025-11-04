/**
 * 데이터베이스에서 letters 필드 확인
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 창세기 1:1 단어들의 letters 필드 확인\n');

  const { data: verses, error: verseError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('id', 'genesis_1_1')
    .single();

  if (verseError) {
    console.error('❌ 구절 조회 실패:', verseError);
    return;
  }

  console.log(`📖 구절: ${verses.reference} (ID: ${verses.id})\n`);

  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('hebrew, korean, letters, position')
    .eq('verse_id', verses.id)
    .order('position');

  if (wordsError) {
    console.error('❌ 단어 조회 실패:', wordsError);
    return;
  }

  console.log(`총 ${words.length}개 단어:\n`);

  words.forEach((word, idx) => {
    const hasLetters = word.letters ? '✅' : '❌';
    console.log(`${idx + 1}. ${hasLetters} ${word.hebrew} (${word.korean})`);
    if (word.letters) {
      console.log(`   letters: ${word.letters}`);
    } else {
      console.log(`   letters: NULL`);
    }
    console.log('');
  });

  const missingCount = words.filter(w => !w.letters).length;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 통계:`);
  console.log(`  - letters 있음: ${words.length - missingCount}개`);
  console.log(`  - letters 없음: ${missingCount}개`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main();
