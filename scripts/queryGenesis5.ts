import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // First, check sample IDs
  const { data: sample } = await supabase
    .from('verses')
    .select('id, reference')
    .order('id')
    .limit(20);

  console.log('Sample verse IDs:');
  sample?.forEach(v => console.log(`${v.id} - ${v.reference}`));

  // Now try Genesis 5:25-28
  console.log('\n\nChecking Genesis 5:25-28:');

  const { data, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew')
    .in('reference', ['창세기 5:25', '창세기 5:26', '창세기 5:27', '창세기 5:28'])
    .order('id');

  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
