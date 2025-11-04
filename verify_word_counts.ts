import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const { data: allWords } = await supabase
    .from('words')
    .select('id, verse_id')
    .like('verse_id', 'genesis_%');
  
  console.log(`Total Genesis words in database: ${allWords?.length || 0}`);
  
  const gen1to15 = allWords?.filter(w => {
    const match = w.verse_id.match(/genesis_(\d+)_/);
    if (!match) return false;
    const ch = parseInt(match[1]);
    return ch >= 1 && ch <= 15;
  });
  
  console.log(`Genesis 1-15 words: ${gen1to15?.length || 0}`);
}

verify();
