/**
 * 이미지가 없는 단어들 확인
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
  console.log('🔍 이미지가 없는 단어들 확인 중...\n');

  // Genesis 1, 2, 3장의 모든 단어 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, chapter')
    .eq('book_id', 'genesis')
    .in('chapter', [1, 2, 3])
    .order('chapter')
    .order('verse_number');

  if (!verses) {
    console.error('❌ 구절을 찾을 수 없습니다');
    return;
  }

  console.log(`📖 총 ${verses.length}개 구절 확인\n`);

  const verseIds = verses.map(v => v.id);

  // 이미지가 없는 단어들 조회
  const { data: wordsWithoutImage, error } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id, position')
    .in('verse_id', verseIds)
    .is('flashcard_img_url', null)
    .order('verse_id')
    .order('position');

  if (error) {
    console.error('❌ 에러:', error.message);
    return;
  }

  // 이미지가 있는 단어들 조회
  const { data: wordsWithImage } = await supabase
    .from('words')
    .select('id, hebrew, korean, meaning, verse_id, position')
    .in('verse_id', verseIds)
    .not('flashcard_img_url', 'is', null);

  const chapter1WithoutImage = wordsWithoutImage?.filter(w => {
    const verse = verses.find(v => v.id === w.verse_id);
    return verse?.chapter === 1;
  }) || [];

  const chapter2WithoutImage = wordsWithoutImage?.filter(w => {
    const verse = verses.find(v => v.id === w.verse_id);
    return verse?.chapter === 2;
  }) || [];

  const chapter3WithoutImage = wordsWithoutImage?.filter(w => {
    const verse = verses.find(v => v.id === w.verse_id);
    return verse?.chapter === 3;
  }) || [];

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 이미지 현황');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('창세기 1장:');
  console.log(`  ✅ 이미지 있음: ${(wordsWithImage?.filter(w => {
    const verse = verses.find(v => v.id === w.verse_id);
    return verse?.chapter === 1;
  }).length || 0)}개`);
  console.log(`  ❌ 이미지 없음: ${chapter1WithoutImage.length}개\n`);

  console.log('창세기 2장:');
  console.log(`  ✅ 이미지 있음: ${(wordsWithImage?.filter(w => {
    const verse = verses.find(v => v.id === w.verse_id);
    return verse?.chapter === 2;
  }).length || 0)}개`);
  console.log(`  ❌ 이미지 없음: ${chapter2WithoutImage.length}개\n`);

  console.log('창세기 3장:');
  console.log(`  ✅ 이미지 있음: ${(wordsWithImage?.filter(w => {
    const verse = verses.find(v => v.id === w.verse_id);
    return verse?.chapter === 3;
  }).length || 0)}개`);
  console.log(`  ❌ 이미지 없음: ${chapter3WithoutImage.length}개\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 총 이미지 없는 단어: ${wordsWithoutImage?.length || 0}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (wordsWithoutImage && wordsWithoutImage.length > 0) {
    console.log('📝 이미지 없는 단어 샘플 (처음 20개):\n');
    wordsWithoutImage.slice(0, 20).forEach((word, idx) => {
      const verse = verses.find(v => v.id === word.verse_id);
      console.log(`${idx + 1}. ${word.hebrew} (${word.korean}) - ${word.meaning}`);
      console.log(`   ${verse?.reference}, 위치: ${word.position}`);
    });

    if (wordsWithoutImage.length > 20) {
      console.log(`\n... 그 외 ${wordsWithoutImage.length - 20}개 더 있음`);
    }
  }

  // 비용 계산
  const totalCost = (wordsWithoutImage?.length || 0) * 0.04;
  console.log(`\n💰 예상 비용: $${totalCost.toFixed(2)} (${wordsWithoutImage?.length || 0}개 × $0.04)`);
}

main().catch(console.error);
