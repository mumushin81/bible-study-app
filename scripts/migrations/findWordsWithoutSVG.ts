import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not found in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findWordsWithoutSVG() {
  console.log('🔍 Searching for words without SVG icons...\n');

  // Get all unique words from database
  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning, grammar, icon_svg')
    .order('hebrew');

  if (error) {
    console.error('❌ Error fetching words:', error);
    return;
  }

  // Find words without SVG
  const wordsWithoutSVG = words.filter(word => !word.icon_svg || word.icon_svg.trim() === '');

  console.log(`📊 Total words in database: ${words.length}`);
  console.log(`❌ Words without SVG: ${wordsWithoutSVG.length}`);
  console.log(`✅ Words with SVG: ${words.length - wordsWithoutSVG.length}\n`);

  if (wordsWithoutSVG.length > 0) {
    console.log('📝 Words missing SVG icons:\n');
    
    // Group by first 20, 50, 100
    const first20 = wordsWithoutSVG.slice(0, 20);
    
    first20.forEach((word, index) => {
      console.log(`${index + 1}. ${word.hebrew} (${word.meaning}) - ${word.grammar || 'no grammar'}`);
    });

    if (wordsWithoutSVG.length > 20) {
      console.log(`\n... and ${wordsWithoutSVG.length - 20} more words\n`);
    }

    // Save to JSON file for processing
    const outputPath = path.resolve(process.cwd(), 'scripts/migrations/words-without-svg.json');
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(wordsWithoutSVG, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Full list saved to: ${outputPath}`);
  } else {
    console.log('✅ All words have SVG icons!');
  }
}

findWordsWithoutSVG();
