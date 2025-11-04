/**
 * 창세기 1:6-31 현재 상태 확인
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
  console.log('🔍 창세기 1:6-31 현재 상태 확인 중...\n');

  // 창세기 1:6-31 구절 조회
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, reference, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .gte('verse_number', 6)
    .lte('verse_number', 31)
    .order('verse_number');

  if (versesError) {
    console.error('❌ 에러:', versesError.message);
    return;
  }

  if (!verses || verses.length === 0) {
    console.error('❌ 구절을 찾을 수 없습니다');
    return;
  }

  console.log(`📖 구절: ${verses.length}개 (창세기 1:6 ~ 1:31)\n`);

  const verseIds = verses.map(v => v.id);

  // 모든 단어 조회
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id, flashcard_img_url')
    .in('verse_id', verseIds)
    .order('verse_id')
    .order('position');

  if (!words) {
    console.error('❌ 단어를 찾을 수 없습니다');
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 창세기 1:6-31 현황');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalWords = words.length;
  const withImage = words.filter(w => w.flashcard_img_url).length;
  const withoutImage = totalWords - withImage;

  console.log(`총 단어: ${totalWords}개`);
  console.log(`이미지 있음: ${withImage}개 (${(withImage/totalWords*100).toFixed(1)}%)`);
  console.log(`이미지 없음: ${withoutImage}개\n`);

  // 구절별 샘플 (처음 5개, 마지막 5개)
  console.log('구절별 샘플:');
  verses.slice(0, 5).forEach(verse => {
    const verseWords = words.filter(w => w.verse_id === verse.id);
    const verseWithImage = verseWords.filter(w => w.flashcard_img_url).length;
    console.log(`  ${verse.reference}: ${verseWords.length}개 (이미지: ${verseWithImage}개)`);
  });

  if (verses.length > 10) {
    console.log('  ...');
    verses.slice(-5).forEach(verse => {
      const verseWords = words.filter(w => w.verse_id === verse.id);
      const verseWithImage = verseWords.filter(w => w.flashcard_img_url).length;
      console.log(`  ${verse.reference}: ${verseWords.length}개 (이미지: ${verseWithImage}개)`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 재생성 예상 비용');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  전체 재생성: $${(totalWords * 0.04).toFixed(2)} (${totalWords}개)`);
  if (withoutImage > 0) {
    console.log(`  누락분만: $${(withoutImage * 0.04).toFixed(2)} (${withoutImage}개)`);
  }
  console.log(`  예상 시간: ${Math.ceil(totalWords * 10 / 60)}분`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 이미지 없는 단어 샘플
  if (withoutImage > 0) {
    console.log('📝 이미지 없는 단어 샘플 (처음 10개):');
    const noImageWords = words.filter(w => !w.flashcard_img_url);
    noImageWords.slice(0, 10).forEach(word => {
      const verse = verses.find(v => v.id === word.verse_id);
      console.log(`  ${verse?.reference} - ${word.korean} (${word.meaning})`);
    });
    if (noImageWords.length > 10) {
      console.log(`  ... 그 외 ${noImageWords.length - 10}개`);
    }
  }
}

main().catch(console.error);
