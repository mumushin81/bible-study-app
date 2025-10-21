/**
 * Genesis 2:1-3 기존 데이터 확인
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkData() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Genesis 2:1-3 기존 데이터 확인');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const verseIds = ['genesis_2_1', 'genesis_2_2', 'genesis_2_3'];

  // 1. Verses 확인
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference')
    .in('id', verseIds)
    .order('id');

  console.log('📖 Verses:');
  verses?.forEach(v => {
    console.log(`   ${v.id}: ${v.reference}`);
  });
  console.log();

  // 2. Words 확인
  const { data: words } = await supabase
    .from('words')
    .select('verse_id, hebrew')
    .in('verse_id', verseIds)
    .order('verse_id')
    .order('position');

  console.log('📝 Words:');
  verseIds.forEach(vId => {
    const count = words?.filter(w => w.verse_id === vId).length || 0;
    console.log(`   ${vId}: ${count}개`);
  });
  console.log(`   총: ${words?.length || 0}개\n`);

  // 3. Commentaries 확인
  const { data: commentaries } = await supabase
    .from('commentaries')
    .select(`
      verse_id,
      intro,
      commentary_sections (emoji, title),
      why_questions (question),
      commentary_conclusions (title)
    `)
    .in('verse_id', verseIds)
    .order('verse_id');

  console.log('📖 Commentaries:');
  commentaries?.forEach((c: any) => {
    console.log(`   ${c.verse_id}:`);
    console.log(`     - Intro: ${c.intro?.substring(0, 50)}...`);
    console.log(`     - Sections: ${c.commentary_sections?.length || 0}개`);
    console.log(`     - Why Questions: ${c.why_questions?.length || 0}개`);
    console.log(`     - Conclusions: ${c.commentary_conclusions?.length || 0}개`);
  });
  console.log();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkData();
