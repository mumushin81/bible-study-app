import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRelations() {
  console.log('🔍 데이터 관계 확인 중...\n');

  // 1. Verses ID 형식 확인
  console.log('1️⃣  Verses ID 형식:');
  const { data: verses } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .lte('chapter', 3)
    .limit(3);

  verses?.forEach(v => console.log(`   - ${v.id}`));

  // 2. Words verse_id 확인
  console.log('\n2️⃣  Words verse_id 참조:');
  const { data: words, count: wordsCount } = await supabase
    .from('words')
    .select('verse_id', { count: 'exact' })
    .ilike('verse_id', 'genesis%')
    .limit(3);

  console.log(`   총 ${wordsCount}개 words`);
  words?.forEach(w => console.log(`   - ${w.verse_id}`));

  // 3. Commentaries verse_id 확인
  console.log('\n3️⃣  Commentaries verse_id 참조:');
  const { data: commentaries, count: commCount } = await supabase
    .from('commentaries')
    .select('verse_id', { count: 'exact' })
    .ilike('verse_id', 'genesis%')
    .limit(3);

  console.log(`   총 ${commCount}개 commentaries`);
  commentaries?.forEach(c => console.log(`   - ${c.verse_id}`));

  // 4. Foreign key 유효성 확인
  console.log('\n4️⃣  Foreign key 유효성 확인:');

  if (words && words.length > 0) {
    const { data: matchingVerse } = await supabase
      .from('verses')
      .select('id')
      .eq('id', words[0].verse_id)
      .single();

    if (matchingVerse) {
      console.log(`   ✅ Words FK valid: ${words[0].verse_id} exists`);
    } else {
      console.log(`   ❌ Words FK broken: ${words[0].verse_id} not found in verses`);
    }
  }

  if (commentaries && commentaries.length > 0) {
    const { data: matchingVerse } = await supabase
      .from('verses')
      .select('id')
      .eq('id', commentaries[0].verse_id)
      .single();

    if (matchingVerse) {
      console.log(`   ✅ Commentaries FK valid: ${commentaries[0].verse_id} exists`);
    } else {
      console.log(`   ❌ Commentaries FK broken: ${commentaries[0].verse_id} not found in verses`);
    }
  }
}

checkRelations();
