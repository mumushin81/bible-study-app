import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWord() {
  console.log('🔍 Checking "그리고 롯에게도" from Genesis 13:5...\n');

  // Get the word
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, icon_svg, verse_id')
    .eq('meaning', '그리고 롯에게도')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!words || words.length === 0) {
    console.log('Word not found. Searching with partial match...');

    const { data: partialWords } = await supabase
      .from('words')
      .select('id, hebrew, meaning, grammar, icon_svg, verse_id')
      .ilike('meaning', '%롯%')
      .limit(10);

    console.log('\nFound words containing "롯":');
    partialWords?.forEach(w => {
      console.log(`\n${w.hebrew} - ${w.meaning}`);
      console.log(`Verse: ${w.verse_id}`);
      console.log(`Grammar: ${w.grammar || 'N/A'}`);
      console.log(`SVG: ${w.icon_svg ? w.icon_svg.substring(0, 100) + '...' : 'NULL'}`);
    });
    return;
  }

  console.log(`Found ${words.length} instances:\n`);

  words.forEach((word, i) => {
    console.log(`[${i + 1}] ${word.hebrew} - ${word.meaning}`);
    console.log(`    Verse: ${word.verse_id}`);
    console.log(`    Grammar: ${word.grammar || 'N/A'}`);

    if (word.icon_svg) {
      console.log(`    SVG length: ${word.icon_svg.length} characters`);
      console.log(`    SVG preview: ${word.icon_svg.substring(0, 150)}...`);

      // Check if it's a "document" icon (rect pattern)
      if (word.icon_svg.includes('<rect') && word.icon_svg.includes('rx="4"')) {
        console.log(`    ⚠️  WARNING: This looks like a default document icon!`);
      }
    } else {
      console.log(`    SVG: NULL`);
    }
    console.log('');
  });
}

checkWord();
