import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function verify() {
  const { data, error } = await supabase
    .from('verses')
    .select('chapter, verse_number')
    .eq('book_id', 'genesis')
    .gte('chapter', 11)
    .lte('chapter', 15)
    .order('chapter')
    .order('verse_number');

  if (error) throw error;

  const grouped = data.reduce((acc, v) => {
    if (!acc[v.chapter]) acc[v.chapter] = [];
    acc[v.chapter].push(v.verse_number);
    return acc;
  }, {} as Record<number, number[]>);

  console.log('\n📊 Genesis 11-15 Database Verification:\n');
  let total = 0;
  for (let ch = 11; ch <= 15; ch++) {
    const verses = grouped[ch] || [];
    total += verses.length;
    const expected = ch === 11 ? 32 : ch === 12 ? 20 : ch === 13 ? 18 : ch === 14 ? 24 : 21;
    const status = verses.length === expected ? '✅' : '❌';
    console.log(`${status} Genesis ${ch}: ${verses.length}/${expected} verses`);
  }
  console.log(`\n✅ Total: ${total}/115 verses (${(total/115*100).toFixed(1)}%)\n`);
}

verify();
