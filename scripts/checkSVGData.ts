import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkSVGData() {
  const { data, error } = await supabase
    .from('words')
    .select('hebrew, icon_svg')
    .not('icon_svg', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample SVG data from database:');
  data?.forEach((word) => {
    console.log('\n---');
    console.log('Hebrew:', word.hebrew);
    console.log('icon_svg length:', word.icon_svg?.length || 0);
    console.log('icon_svg preview:', word.icon_svg?.substring(0, 100) + '...');
    console.log('Is valid SVG:', word.icon_svg?.includes('<svg'));
  });
}

checkSVGData();
