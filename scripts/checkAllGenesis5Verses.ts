/**
 * Check all Genesis 5 verses in the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Checking all Genesis 5 verses in database...\n');

  const { data, error } = await supabase
    .from('verses')
    .select('id, reference')
    .ilike('reference', '창세기 5:%')
    .order('id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('All Genesis 5 verses found:');
  data?.forEach(v => console.log(`  ID "${v.id}": ${v.reference}`));
  console.log(`\nTotal found: ${data?.length}`);
}

main();
