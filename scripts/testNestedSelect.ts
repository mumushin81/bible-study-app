/**
 * 중첩 SELECT 테스트 - why_questions, commentary_conclusions
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 중첩 SELECT 구문 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. commentary_sections (one-to-many) - 이것은 작동함
  console.log('1️⃣ commentary_sections 테스트 (one-to-many):');
  const { data: test1, error: error1 } = await supabase
    .from('commentaries')
    .select('verse_id, commentary_sections(title)')
    .eq('verse_id', 'genesis_2_1');

  console.log('   Result:', JSON.stringify(test1, null, 2));
  if (error1) console.log('   Error:', error1.message);
  console.log();

  // 2. why_questions (one-to-one with UNIQUE) - 이것이 문제
  console.log('2️⃣ why_questions 테스트 (one-to-one UNIQUE):');
  const { data: test2, error: error2 } = await supabase
    .from('commentaries')
    .select('verse_id, why_questions(question)')
    .eq('verse_id', 'genesis_2_1');

  console.log('   Result:', JSON.stringify(test2, null, 2));
  if (error2) console.log('   Error:', error2.message);
  console.log();

  // 3. 직접 why_questions 쿼리
  console.log('3️⃣ why_questions 직접 쿼리:');
  const { data: comm } = await supabase
    .from('commentaries')
    .select('id')
    .eq('verse_id', 'genesis_2_1')
    .single();

  if (comm) {
    const { data: test3, error: error3 } = await supabase
      .from('why_questions')
      .select('question')
      .eq('commentary_id', comm.id);

    console.log('   Result:', JSON.stringify(test3, null, 2));
    if (error3) console.log('   Error:', error3.message);
  }
  console.log();

  // 4. 다양한 중첩 구문 시도
  console.log('4️⃣ 다양한 구문 테스트:');

  // Try with !inner
  const { data: test4a } = await supabase
    .from('commentaries')
    .select('verse_id, why_questions!inner(question)')
    .eq('verse_id', 'genesis_2_1');
  console.log('   !inner:', JSON.stringify(test4a, null, 2));

  // Try with * wildcard
  const { data: test4b } = await supabase
    .from('commentaries')
    .select('verse_id, why_questions(*)')
    .eq('verse_id', 'genesis_2_1');
  console.log('   *:', JSON.stringify(test4b, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

test();
