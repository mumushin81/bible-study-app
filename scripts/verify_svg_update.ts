import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function verifySVGUpdate() {
  console.log('🔍 Verifying SVG updates for Genesis 1:1...\n');

  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg')
    .eq('verse_id', 'genesis_1_1')
    .order('position', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!words || words.length === 0) {
    console.log('⚠️  No words found');
    return;
  }

  words.forEach((word, index) => {
    console.log(`\n${index + 1}. ${word.hebrew} (${word.meaning})`);

    if (word.icon_svg) {
      // Check for new SVG features
      const hasAnimation = word.icon_svg.includes('<animate');
      const hasFilter = word.icon_svg.includes('<filter');
      const hasGradient = word.icon_svg.includes('Gradient');
      const hasMultipleColors = (word.icon_svg.match(/stop-color/g) || []).length > 1;

      console.log(`   📊 SVG Features:`);
      console.log(`      Animation: ${hasAnimation ? '✅' : '❌'}`);
      console.log(`      Filter: ${hasFilter ? '✅' : '❌'}`);
      console.log(`      Gradient: ${hasGradient ? '✅' : '❌'}`);
      console.log(`      Multi-color: ${hasMultipleColors ? '✅' : '❌'}`);
      console.log(`      Length: ${word.icon_svg.length} chars`);

      // Show first 100 chars
      console.log(`      Preview: ${word.icon_svg.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ NO SVG`);
    }
  });
}

verifySVGUpdate();
