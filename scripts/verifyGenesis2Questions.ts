/**
 * Genesis 2:1-3 why_questions와 conclusions 상세 확인
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Genesis 2:1-3 Why Questions & Conclusions 확인');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Commentaries 조회
  const { data: commentaries } = await supabase
    .from('commentaries')
    .select('id, verse_id')
    .in('verse_id', ['genesis_2_1', 'genesis_2_2', 'genesis_2_3'])
    .order('verse_id');

  console.log('📖 Commentaries:');
  commentaries?.forEach(c => {
    console.log(`   ${c.verse_id}: commentary_id = ${c.id}`);
  });
  console.log();

  if (!commentaries || commentaries.length === 0) {
    console.log('❌ No commentaries found!');
    return;
  }

  const commentaryIds = commentaries.map(c => c.id);

  // 2. Why Questions 조회
  const { data: questions } = await supabase
    .from('why_questions')
    .select('*')
    .in('commentary_id', commentaryIds);

  console.log('❓ Why Questions:');
  if (questions && questions.length > 0) {
    questions.forEach((q: any) => {
      console.log(`   Commentary: ${q.commentary_id}`);
      console.log(`   Question: ${q.question}`);
      console.log(`   Answer: ${q.answer.substring(0, 80)}...`);
      console.log();
    });
  } else {
    console.log('   ⚠️  No why_questions found!\n');
  }

  // 3. Conclusions 조회
  const { data: conclusions } = await supabase
    .from('commentary_conclusions')
    .select('*')
    .in('commentary_id', commentaryIds);

  console.log('💡 Conclusions:');
  if (conclusions && conclusions.length > 0) {
    conclusions.forEach((c: any) => {
      console.log(`   Commentary: ${c.commentary_id}`);
      console.log(`   Title: ${c.title}`);
      console.log(`   Content: ${c.content.substring(0, 80)}...`);
      console.log();
    });
  } else {
    console.log('   ⚠️  No conclusions found!\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

verify();
