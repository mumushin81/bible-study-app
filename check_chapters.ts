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

async function checkChapters() {
  console.log('📚 창세기 장별 데이터 확인\n');

  // Check verses table
  const { data: verses } = await supabase
    .from('verses')
    .select('chapter')
    .eq('book_id', 1)
    .order('chapter', { ascending: true });

  if (verses) {
    const uniqueChapters = [...new Set(verses.map(v => v.chapter))];
    console.log(`📖 Verses 테이블에 있는 창세기 장: ${uniqueChapters.join(', ')}`);
    console.log(`   총 ${uniqueChapters.length}개 장\n`);
  }

  // Check words count per chapter
  for (let chapter = 1; chapter <= 5; chapter++) {
    const { data, count } = await supabase
      .from('words')
      .select('id, verses!inner(chapter)', { count: 'exact', head: true })
      .eq('verses.book_id', 1)
      .eq('verses.chapter', chapter);

    console.log(`창세기 ${chapter}장: ${count || 0}개 단어`);
  }
}

checkChapters().catch(console.error);
