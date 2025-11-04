import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function main() {
  const { data } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url')
    .not('icon_url', 'is', null)
    .limit(10);

  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
