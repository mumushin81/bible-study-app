import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single();

  if (error) throw error;

  console.log('\n📊 genesis_1_1 DB 레코드 필드:\n');
  console.log('필드 목록:', Object.keys(data || {}).join(', '));
  console.log('\n주요 필드 값:');
  if (data) {
    console.log('- translation:', data.translation ? `"${data.translation.substring(0, 50)}..."` : 'null');
    console.log('- hebrew:', data.hebrew ? `"${data.hebrew.substring(0, 50)}..."` : 'null');
    console.log('- ipa:', data.ipa ? `"${data.ipa.substring(0, 50)}..."` : 'null');
  }
}

checkSchema();
