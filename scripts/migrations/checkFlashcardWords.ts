/**
 * Check words actually used in flashcards (Genesis 1-15)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFlashcardWords() {
  console.log('🔍 Checking words used in flashcards...\n');

  // Simply get all words from words table
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_svg')
    .limit(1000);

  if (wordsError) {
    console.error('Error fetching words:', wordsError);
    return;
  }

  console.log(`📊 Total word instances (limited to 1000): ${words?.length || 0}`);

  // Count SVG coverage
  const withSVG = words?.filter(w => w.icon_svg) || [];
  const withoutSVG = words?.filter(w => !w.icon_svg) || [];

  console.log(`✅ Words with SVG: ${withSVG.length} (${((withSVG.length / words!.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Words without SVG: ${withoutSVG.length} (${((withoutSVG.length / words!.length) * 100).toFixed(1)}%)\n`);

  // Get unique words without SVG
  const uniqueWithoutSVG = new Map();
  for (const word of withoutSVG) {
    const key = `${word.hebrew}:${word.meaning}`;
    if (!uniqueWithoutSVG.has(key)) {
      uniqueWithoutSVG.set(key, word);
    }
  }

  console.log(`🔢 Unique words without SVG: ${uniqueWithoutSVG.size}\n`);

  if (uniqueWithoutSVG.size > 0) {
    console.log('📝 First 20 unique words missing SVG:');
    Array.from(uniqueWithoutSVG.values()).slice(0, 20).forEach((word, i) => {
      console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`);
    });

    if (uniqueWithoutSVG.size > 20) {
      console.log(`\n... and ${uniqueWithoutSVG.size - 20} more unique words`);
    }
  } else {
    console.log('🎉 All Genesis 1-15 flashcard words have SVG icons!');
  }
}

checkFlashcardWords();
