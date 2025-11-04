/**
 * 실제 DB URL 상세 확인
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
  console.log('🔍 창세기 1:6-10 URL 상세 확인 중...\n');

  // 창세기 1:6-10만 샘플로 확인
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .gte('verse_number', 6)
    .lte('verse_number', 10)
    .order('verse_number');

  if (!verses) {
    console.error('❌ 구절을 찾을 수 없습니다');
    return;
  }

  const verseIds = verses.map(v => v.id);

  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, korean, verse_id, flashcard_img_url')
    .in('verse_id', verseIds)
    .order('verse_id')
    .order('position');

  if (!words) {
    console.error('❌ 단어를 찾을 수 없습니다');
    return;
  }

  console.log(`총 ${words.length}개 단어 확인\n`);

  // 각 단어의 URL 상세 출력
  words.forEach(word => {
    const verse = verses.find(v => v.id === word.verse_id);
    console.log(`${verse?.reference} - ${word.korean} (${word.hebrew})`);
    console.log(`  ID: ${word.id}`);
    console.log(`  URL: ${word.flashcard_img_url || '(없음)'}`);

    if (word.flashcard_img_url) {
      // URL 분석
      if (word.flashcard_img_url.includes('hebrew-icons')) {
        console.log(`  ⚠️  구 버킷 (hebrew-icons) 사용 중!`);
      } else if (word.flashcard_img_url.includes('flashcard-images')) {
        console.log(`  ✅ 신 버킷 (flashcard-images) 사용 중`);
      }

      // 파일명 추출
      const fileName = word.flashcard_img_url.split('/').pop();
      console.log(`  파일명: ${fileName}`);
    }
    console.log('');
  });

  // 버킷별 통계
  const oldBucket = words.filter(w => w.flashcard_img_url?.includes('hebrew-icons')).length;
  const newBucket = words.filter(w => w.flashcard_img_url?.includes('flashcard-images')).length;
  const noUrl = words.filter(w => !w.flashcard_img_url).length;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 버킷 사용 통계');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⚠️  구 버킷 (hebrew-icons): ${oldBucket}/${words.length}`);
  console.log(`✅ 신 버킷 (flashcard-images): ${newBucket}/${words.length}`);
  console.log(`❌ URL 없음: ${noUrl}/${words.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
