import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/database.types';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function checkDetailedStatus() {
  console.log('\n📊 Detailed Database Status Check\n');
  console.log('='.repeat(60));

  // Get total count
  const { count: totalCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📖 Total verses in database: ${totalCount}`);

  // Get Genesis 1-15 verses
  const { data: genesis115, error } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('book_id', 'genesis')
    .gte('chapter', 1)
    .lte('chapter', 15)
    .order('chapter', { ascending: true })
    .order('verse_number', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\n📖 Genesis 1-15 verses in database: ${genesis115.length}`);

  // Group by chapter
  const byChapter: { [key: number]: number } = {};
  genesis115.forEach(v => {
    const chapter = parseInt(v.id.split('_')[1]);
    byChapter[chapter] = (byChapter[chapter] || 0) + 1;
  });

  console.log('\n📊 Chapter breakdown:');
  for (let i = 1; i <= 15; i++) {
    const count = byChapter[i] || 0;
    console.log(`   Chapter ${i}: ${count} verses`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

checkDetailedStatus();
