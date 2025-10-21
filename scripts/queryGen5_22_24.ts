import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Querying Genesis 5:22-24 from Supabase...\n');

  const { data, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .in('verse_number', [22, 23, 24])
    .order('verse_number');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
