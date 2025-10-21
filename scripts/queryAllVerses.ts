import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from('verses')
    .select('id, reference')
    .order('id')
    .limit(50);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('First 50 verses in database:');
    data.forEach(v => console.log(`  ${v.id} - ${v.reference}`));
  }
}

main();
