/**
 * 창세기 1장에서 이미지가 없는 단어들을 구절별로 확인
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
  console.log('🔍 창세기 1장 이미지 누락 확인 중...\n');

  // 창세기 1장의 모든 구절 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
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

  if (!wordsWithoutImage || wordsWithoutImage.length === 0) {
    console.log('✅ 창세기 1장의 모든 단어에 이미지가 있습니다!');
    return;
  }

  // 구절별로 그룹화
  const missingByVerse = new Map<string, typeof wordsWithoutImage>();

  wordsWithoutImage.forEach(word => {
    const verse = verses.find(v => v.id === word.verse_id);
    if (verse) {
      const key = verse.reference;
      if (!missingByVerse.has(key)) {
        missingByVerse.set(key, []);
      }
      missingByVerse.get(key)!.push(word);
    }
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 창세기 1장 - 이미지 누락 현황');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`총 ${wordsWithoutImage.length}개 단어가 이미지 없음\n`);

  // 구절별로 출력
  const sortedVerses = Array.from(missingByVerse.keys()).sort((a, b) => {
    const numA = parseInt(a.split(':')[1]);
    const numB = parseInt(b.split(':')[1]);
    return numA - numB;
  });

  sortedVerses.forEach(verseRef => {
    const words = missingByVerse.get(verseRef)!;
    console.log(`\n${verseRef} (${words.length}개 단어 누락):`);
    words.forEach((word, idx) => {
      console.log(`  ${idx + 1}. ${word.hebrew} (${word.korean}) - ${word.meaning}`);
    });
  });

  // 비용 계산
  const totalCost = wordsWithoutImage.length * 0.04;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`💰 예상 비용: $${totalCost.toFixed(2)} (${wordsWithoutImage.length}개 × $0.04)`);
  console.log(`⏱️  예상 시간: ${Math.ceil(wordsWithoutImage.length * 10 / 60)}분`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
