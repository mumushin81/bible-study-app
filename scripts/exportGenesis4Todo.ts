import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function exportGenesis4() {
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, hebrew, translation, chapter, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 4)
    .order('verse_number', { ascending: true });

  if (verses) {
    fs.writeFileSync(
      'genesis4-todo.json',
      JSON.stringify(verses, null, 2)
    );
    console.log(`✅ ${verses.length}개 구절을 genesis4-todo.json에 저장했습니다.`);
  }
}

exportGenesis4();
