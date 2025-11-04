import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../../.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await supabase
    .from('verses')
    .select('verse_number, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number');

  console.log('창세기 1장 총 구절 수:', data?.length);
  if (data) {
    console.log('구절 범위:', Math.min(...data.map(v => v.verse_number)), '~', Math.max(...data.map(v => v.verse_number)));
    console.log('\n전체 구절:');
    data.forEach(v => console.log(`  ${v.reference}`));
  }
}

main();
