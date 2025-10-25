import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/types/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function getGenesis1_1Words() {
  console.log('🔍 Fetching Genesis 1:1 words...\n');

  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', 'genesis_1_1')
    .order('position', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!words || words.length === 0) {
    console.log('⚠️  No words found for Genesis 1:1');
    return;
  }

  console.log(`📊 Total words: ${words.length}\n`);

  words.forEach((word, index) => {
    console.log(`\n${index + 1}. ${word.hebrew}`);
    console.log(`   - Meaning: ${word.meaning}`);
    console.log(`   - IPA: ${word.ipa}`);
    console.log(`   - Korean: ${word.korean}`);
    console.log(`   - Grammar: ${word.grammar}`);
    console.log(`   - icon_svg: ${word.icon_svg ? `EXISTS (${word.icon_svg.substring(0, 50)}...)` : 'NULL ❌'}`);
  });

  console.log('\n\n📋 Summary:');
  console.log(`   Total: ${words.length} words`);
  console.log(`   With SVG: ${words.filter(w => w.icon_svg).length}`);
  console.log(`   Without SVG: ${words.filter(w => !w.icon_svg).length}`);
}

getGenesis1_1Words();
