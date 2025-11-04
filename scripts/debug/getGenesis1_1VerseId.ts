/**
 * 창세기 1:1의 verse_id 조회
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
  console.log('🔍 창세기 1:1 verse_id 조회 중...\n');

  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single();

  if (error) {
    console.error('❌ 에러:', error.message);
    return;
  }

  if (!data) {
    console.error('❌ 창세기 1:1을 찾을 수 없습니다');
    return;
  }

  console.log('✅ 창세기 1:1 정보:');
  console.log(`   Verse ID: ${data.id}`);
  console.log(`   Reference: ${data.reference}`);
  console.log(`   Hebrew: ${data.hebrew}`);
  console.log(`\n📋 복사용:\nconst GENESIS_1_1_VERSE_ID = '${data.id}';`);

  // 해당 구절의 단어들도 확인
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, korean, position')
    .eq('verse_id', data.id)
    .order('position');

  if (words) {
    console.log(`\n📝 창세기 1:1의 단어들 (${words.length}개):`);
    words.forEach(word => {
      console.log(`   ${word.position}. ${word.hebrew} (${word.korean}) - ID: ${word.id}`);
    });
  }
}

main().catch(console.error);
