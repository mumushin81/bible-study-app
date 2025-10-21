import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkCategories() {
  const { data, error } = await supabase
    .from('words')
    .select('category')
    .limit(100);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const categories = [...new Set(data?.map(w => w.category).filter(Boolean))];
  console.log('📊 Existing categories in database:');
  console.log(categories);
  console.log(`\n📝 Total unique categories: ${categories.length}`);
}

checkCategories();
