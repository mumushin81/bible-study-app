/**
 * 창세기 1:6-31 구절별 단어 수 확인
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
  console.log('📊 창세기 1:6-31 구절별 단어 수 확인\n');

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

  let totalWords = 0;
  let words6to9 = 0;
  let words10to31 = 0;

  for (const verse of verses) {
    const { data: words } = await supabase
      .from('words')
      .select('id, hebrew, korean, flashcard_img_url')
      .eq('verse_id', verse.id);

    const count = words?.length || 0;
    totalWords += count;

    if (verse.verse_number >= 6 && verse.verse_number <= 9) {
      words6to9 += count;
    } else if (verse.verse_number >= 10 && verse.verse_number <= 31) {
      words10to31 += count;
    }

    // UUID 패턴인지 확인
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg/;
    const withUuid = words?.filter(w => uuidPattern.test(w.flashcard_img_url || '')).length || 0;
    const withOld = count - withUuid;

    console.log(`${verse.reference}: ${count}개 (UUID: ${withUuid}, 구버전: ${withOld})`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`창세기 1:6-9: ${words6to9}개`);
  console.log(`창세기 1:10-31: ${words10to31}개`);
  console.log(`총 단어: ${totalWords}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`💡 재생성 스크립트가 처리한 단어: 239개`);
  console.log(`💡 실제 1:10-31 단어 수: ${words10to31}개`);
  if (words10to31 === 239) {
    console.log(`✅ 일치! 스크립트는 1:10-31만 처리했습니다.`);
  } else if (totalWords === 239) {
    console.log(`✅ 일치! 스크립트는 1:6-31 모두 처리했지만 업데이트가 안됨`);
  }
}

main().catch(console.error);
