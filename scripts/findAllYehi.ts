import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findYehi() {
  const { data, error } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, meaning, created_at')
    .eq('hebrew', 'יְהִי')
    .order('verse_id', { ascending: true })
    .order('position', { ascending: true });

  console.log('\n=== All יְהִי words in database ===\n');
  console.log('Total found:', data?.length || 0);

  if (data && data.length > 0) {
    const grouped = new Map();
    data.forEach(word => {
      if (!grouped.has(word.verse_id)) {
        grouped.set(word.verse_id, []);
      }
      grouped.get(word.verse_id).push(word);
    });

    console.log('\nGrouped by verse:\n');
    for (const [verse, words] of grouped.entries()) {
      console.log(`${verse}: ${words.length} occurrence(s)`);
      words.forEach((w: any) => {
        console.log(`  - Position ${w.position}, ID: ${w.id.substring(0,8)}..., Created: ${w.created_at}`);
      });
    }
  }
}

findYehi().catch(console.error);
