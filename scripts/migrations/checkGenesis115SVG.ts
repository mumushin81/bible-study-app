import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGenesis115SVG() {
  console.log('🔍 Checking Genesis 1-15 SVG coverage...\n');

  // Get all words from database
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg');

  if (wordsError) {
    console.error('Error fetching words:', wordsError);
    return;
  }

  console.log(`📊 Total words in database: ${words?.length || 0}`);

  const withoutSVG = words?.filter(w => !w.icon_svg) || [];
  const withSVG = words?.filter(w => w.icon_svg) || [];

  console.log(`✅ Words with SVG: ${withSVG.length}`);
  console.log(`❌ Words without SVG: ${withoutSVG.length}`);
  console.log(`📈 Coverage: ${((withSVG.length / words!.length) * 100).toFixed(1)}%\n`);

  // Show unique words without SVG
  const uniqueWithoutSVG = new Map();
  for (const word of withoutSVG) {
    const key = `${word.hebrew}:${word.meaning}`;
    if (!uniqueWithoutSVG.has(key)) {
      uniqueWithoutSVG.set(key, word);
    }
  }

  console.log(`🔢 Unique words without SVG: ${uniqueWithoutSVG.size}`);

  if (uniqueWithoutSVG.size > 0) {
    console.log('\n📝 First 10 unique words missing SVG:');
    Array.from(uniqueWithoutSVG.values()).slice(0, 10).forEach((word, i) => {
      console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`);
    });
  }
}

checkGenesis115SVG();
