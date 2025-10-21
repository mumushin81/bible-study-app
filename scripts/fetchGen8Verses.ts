import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { writeFileSync } from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchGenesis8() {
  const { data: verses, error } = await supabase
    .from('verses')
    .select('id, reference, book_id, chapter, verse_number, hebrew, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 8)
    .order('verse_number', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Fetched', verses.length, 'verses from Genesis 8\n');

  // Display all verses
  verses.forEach((v, index) => {
    console.log(`\n${index + 1}. ${v.reference} (${v.id})`);
    console.log(`   Hebrew: ${v.hebrew}`);
    console.log(`   IPA: ${v.ipa}`);
    console.log(`   Korean: ${v.korean_pronunciation}`);
    console.log(`   Modern: ${v.modern}`);
  });

  // Save to JSON
  const outputPath = path.join(process.cwd(), 'data', 'genesis-8-verses.json');
  writeFileSync(outputPath, JSON.stringify(verses, null, 2), 'utf-8');
  console.log(`\n\nSaved to: ${outputPath}`);
}

fetchGenesis8().catch(console.error);
