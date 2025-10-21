import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .in('verse_number', [19, 20, 21])
    .order('verse_number');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

main();
