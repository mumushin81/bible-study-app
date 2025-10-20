import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanData() {
  console.log('🧹 Genesis 1-3 데이터 삭제 중...\n');

  // Commentaries 삭제 (CASCADE로 sections, questions, conclusions도 삭제됨)
  console.log('1️⃣  Commentaries 삭제...');
  const { error: commError } = await supabase
    .from('commentaries')
    .delete()
    .ilike('verse_id', 'genesis_%');

  if (commError) {
    console.error('   ❌ Error:', commError.message);
  } else {
    console.log('   ✅ Commentaries 삭제 완료');
  }

  // Words 삭제
  console.log('\n2️⃣  Words 삭제...');
  const { error: wordsError } = await supabase
    .from('words')
    .delete()
    .ilike('verse_id', 'genesis_%');

  if (wordsError) {
    console.error('   ❌ Error:', wordsError.message);
  } else {
    console.log('   ✅ Words 삭제 완료');
  }

  console.log('\n✅ 삭제 완료!\n');
}

cleanData();
