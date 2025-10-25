import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getGenesis1_1Words() {
  console.log('📖 창세기 1장 1절 단어 추출 중...\n');

  const { data, error } = await supabase
    .from('words')
    .select('hebrew, meaning, korean, grammar, verses!inner(book_id, chapter, verse_number)')
    .eq('verses.book_id', 1)
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true });

  if (error) {
    console.error('오류:', error);
    return;
  }

  console.log(`총 ${data?.length || 0}개 단어\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  data?.forEach((word, i) => {
    console.log(`${i + 1}. "${word.meaning}" (${word.hebrew}) - ${word.korean}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get unique meanings
  const uniqueMeanings = [...new Set(data?.map(w => w.meaning) || [])];
  console.log(`고유 의미: ${uniqueMeanings.length}개\n`);
  uniqueMeanings.forEach((m, i) => {
    console.log(`${i + 1}. "${m}"`);
  });
}

getGenesis1_1Words().catch(console.error);
