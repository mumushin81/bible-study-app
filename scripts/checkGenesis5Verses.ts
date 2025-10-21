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
    .select('id, reference, hebrew')
    .like('id', 'gen5-%')
    .order('id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Genesis 5 verses in database:');
  data?.forEach(v => {
    console.log(`${v.id}: ${v.reference}`);
    console.log(`  Hebrew: ${v.hebrew ? 'YES' : 'NO'}`);
  });
}

main();
