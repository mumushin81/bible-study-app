import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

(async () => {
  console.log('🔍 어근 발음기호 데이터 체크\n');

  // 모든 어근 가져오기
  const { data: roots, error } = await supabase
    .from('hebrew_roots')
    .select('root, root_hebrew, core_meaning_korean, pronunciation, importance')
    .order('importance', { ascending: false })
    .limit(15);

  if (error) {
    console.error('❌ 오류:', error);
    return;
  }

  console.log('📊 상위 15개 어근 발음기호 상태:\n');

  let withPronunciation = 0;
  let withoutPronunciation = 0;

  roots.forEach((root, index) => {
    const hasPronunciation = root.pronunciation ? '✅' : '❌';
    const pronunciation = root.pronunciation || '없음';

    if (root.pronunciation) {
      withPronunciation++;
    } else {
      withoutPronunciation++;
    }

    console.log(`${index + 1}. ${hasPronunciation} ${root.root} (${root.root_hebrew})`);
    console.log(`   의미: ${root.core_meaning_korean}`);
    console.log(`   발음: [${pronunciation}]`);
    console.log(`   중요도: ${root.importance}/5`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`총 15개 중:`);
  console.log(`  ✅ 발음기호 있음: ${withPronunciation}개`);
  console.log(`  ❌ 발음기호 없음: ${withoutPronunciation}개`);
  console.log(`  📈 완성도: ${((withPronunciation / roots.length) * 100).toFixed(1)}%`);
})();
