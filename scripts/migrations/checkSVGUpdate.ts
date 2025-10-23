import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSVGUpdate() {
  console.log('🔍 Checking SVG update status...\n');

  // Check one specific word
  const { data, error } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg')
    .eq('hebrew', 'אָבִיו')
    .eq('meaning', '그의 아버지')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample word "אָבִיו (그의 아버지)":');
  console.log(JSON.stringify(data, null, 2));

  // Count total words with SVG
  const { count: withSVG } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null);

  const { count: total } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Words with SVG: ${withSVG}/${total}`);
}

checkSVGUpdate();
