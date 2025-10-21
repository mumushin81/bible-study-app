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
    .order('id')
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample verses in database:');
  data?.forEach(v => {
    console.log(`${v.id}: ${v.reference} - Hebrew: ${v.hebrew ? v.hebrew.substring(0, 50) : 'NO'}`);
  });
}

main();
