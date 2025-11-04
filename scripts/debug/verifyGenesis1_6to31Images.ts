/**
 * 창세기 1:6-31 이미지 실제 적용 확인
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
  console.log('🔍 창세기 1:6-31 이미지 적용 확인 중...\n');

  // 창세기 1:6-31 구절 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .gte('verse_number', 6)
    .lte('verse_number', 31)
    .order('verse_number');

  if (!verses) {
    console.error('❌ 구절을 찾을 수 없습니다');
    return;
  }

  const verseIds = verses.map(v => v.id);

  // 모든 단어 조회
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

  const withImage = words.filter(w => w.flashcard_img_url);
  const withoutImage = words.filter(w => !w.flashcard_img_url);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 이미지 적용 현황');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ 이미지 있음: ${withImage.length}/${words.length}`);
  console.log(`❌ 이미지 없음: ${withoutImage.length}/${words.length}\n`);

  if (withoutImage.length > 0) {
    console.log('⚠️  이미지 없는 단어:');
    withoutImage.forEach(w => {
      const verse = verses.find(v => v.id === w.verse_id);
      console.log(`  ${verse?.reference} - ${w.korean}`);
    });
    console.log('');
  }

  // 샘플 URL 확인 (처음 5개)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔗 샘플 이미지 URL (처음 5개)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  withImage.slice(0, 5).forEach(w => {
    const verse = verses.find(v => v.id === w.verse_id);
    console.log(`${verse?.reference} - ${w.korean}:`);
    console.log(`  ${w.flashcard_img_url}\n`);
  });

  // URL 파일명 확인 (UUID인지 체크)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 URL 형식 확인');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg/;
  const validUrls = withImage.filter(w => uuidPattern.test(w.flashcard_img_url || ''));

  console.log(`✅ 올바른 UUID 형식: ${validUrls.length}/${withImage.length}`);
  console.log(`❌ 잘못된 형식: ${withImage.length - validUrls.length}/${withImage.length}\n`);

  // Storage에 실제로 파일이 있는지 확인 (샘플 3개)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 Storage 파일 존재 확인 (샘플 3개)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (let i = 0; i < Math.min(3, withImage.length); i++) {
    const word = withImage[i];
    const fileName = `${word.id}.jpg`;

    const { data: file, error } = await supabase.storage
      .from('flashcard-images')
      .list('', {
        limit: 1,
        search: fileName
      });

    const verse = verses.find(v => v.id === word.verse_id);
    if (file && file.length > 0) {
      console.log(`✅ ${verse?.reference} - ${word.korean}: 파일 존재 (${fileName})`);
    } else {
      console.log(`❌ ${verse?.reference} - ${word.korean}: 파일 없음 (${fileName})`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (withImage.length === words.length) {
    console.log('✅ 모든 이미지가 DB에 적용되어 있습니다!');
    console.log('💡 브라우저 캐시 문제일 수 있습니다. Ctrl+Shift+R (강력 새로고침) 시도해보세요.');
  } else {
    console.log(`⚠️  ${withoutImage.length}개 단어에 이미지가 없습니다.`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
