/**
 * Fill ALL missing SVG icons in the database
 * This script updates ALL words that have null icon_svg
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple SVG templates based on meaning keywords
const svgTemplates: Record<string, string> = {
  '아버지': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="20" r="8" stroke="#374151" stroke-width="2"/><path d="M20 50 Q20 35 32 35 Q44 35 44 50" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '아들': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="6" stroke="#374151" stroke-width="2"/><path d="M24 46 Q24 35 32 35 Q40 35 40 46" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '딸': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="6" stroke="#374151" stroke-width="2"/><path d="M24 46 Q24 35 32 35 Q40 35 40 46" stroke="#374151" stroke-width="2" fill="none"/><line x1="28" y1="22" x2="36" y2="22" stroke="#374151" stroke-width="2"/></svg>',
  '형제': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="24" r="5" stroke="#374151" stroke-width="2"/><circle cx="39" cy="24" r="5" stroke="#374151" stroke-width="2"/><path d="M19 44 Q19 35 25 35 Q31 35 31 44 M33 44 Q33 35 39 35 Q45 35 45 44" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '하나님': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="20" stroke="#374151" stroke-width="2"/><path d="M32 20 L35 28 L43 28 L37 34 L40 42 L32 37 L24 42 L27 34 L21 28 L29 28 Z" fill="#374151"/></svg>',
  '여호와': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="18" stroke="#374151" stroke-width="2"/><circle cx="32" cy="32" r="12" stroke="#374151" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#374151"/></svg>',
  '주': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 10 L42 25 L52 25 L44 35 L48 48 L32 40 L16 48 L20 35 L12 25 L22 25 Z" fill="#374151"/></svg>',
  '땅': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="40" rx="25" ry="15" stroke="#374151" stroke-width="2"/><path d="M12 35 Q20 25 32 25 Q44 25 52 35" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '집': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 35 L32 15 L54 35" stroke="#374151" stroke-width="2" fill="none"/><rect x="18" y="35" width="28" height="20" stroke="#374151" stroke-width="2" fill="none"/><rect x="28" y="42" width="8" height="13" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '물': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 35 Q18 30 26 35 Q34 40 42 35 Q50 30 58 35 L58 50 L10 50 Z" stroke="#374151" stroke-width="2" fill="none"/><path d="M10 25 Q18 20 26 25 Q34 30 42 25 Q50 20 58 25" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '하늘': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="22" r="6" stroke="#374151" stroke-width="2"/><circle cx="38" cy="18" r="8" stroke="#374151" stroke-width="2"/><circle cx="48" cy="26" r="5" stroke="#374151" stroke-width="2"/><path d="M15 35 Q32 28 50 35" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '빛': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="8" fill="#374151"/><line x1="32" y1="12" x2="32" y2="20" stroke="#374151" stroke-width="2"/><line x1="32" y1="44" x2="32" y2="52" stroke="#374151" stroke-width="2"/><line x1="12" y1="32" x2="20" y2="32" stroke="#374151" stroke-width="2"/><line x1="44" y1="32" x2="52" y2="32" stroke="#374151" stroke-width="2"/><line x1="19" y1="19" x2="25" y2="25" stroke="#374151" stroke-width="2"/><line x1="39" y1="39" x2="45" y2="45" stroke="#374151" stroke-width="2"/><line x1="45" y1="19" x2="39" y2="25" stroke="#374151" stroke-width="2"/><line x1="25" y1="39" x2="19" y2="45" stroke="#374151" stroke-width="2"/></svg>',
  '나무': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="32" y1="25" x2="32" y2="50" stroke="#374151" stroke-width="2"/><circle cx="32" cy="20" r="12" stroke="#374151" stroke-width="2"/><circle cx="25" cy="15" r="8" stroke="#374151" stroke-width="2"/><circle cx="39" cy="15" r="8" stroke="#374151" stroke-width="2"/></svg>',
  '사람': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="7" stroke="#374151" stroke-width="2"/><line x1="32" y1="29" x2="32" y2="42" stroke="#374151" stroke-width="2"/><line x1="22" y1="35" x2="42" y2="35" stroke="#374151" stroke-width="2"/><line x1="32" y1="42" x2="26" y2="52" stroke="#374151" stroke-width="2"/><line x1="32" y1="42" x2="38" y2="52" stroke="#374151" stroke-width="2"/></svg>',
  '말씀': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 20 Q15 15 20 15 L44 15 Q49 15 49 20 L49 40 Q49 45 44 45 L25 45 L15 52 Z" stroke="#374151" stroke-width="2" fill="none"/></svg>',
  '이름': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="20" width="34" height="24" rx="4" stroke="#374151" stroke-width="2" fill="none"/><line x1="22" y1="28" x2="42" y2="28" stroke="#374151" stroke-width="2"/><line x1="22" y1="36" x2="38" y2="36" stroke="#374151" stroke-width="2"/></svg>',
  'default': '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="24" height="24" rx="4" stroke="#374151" stroke-width="2" fill="none"/><circle cx="32" cy="32" r="6" fill="#374151"/></svg>',
};

function findBestSVG(meaning: string): string {
  const lowerMeaning = meaning.toLowerCase();
  for (const [keyword, svg] of Object.entries(svgTemplates)) {
    if (lowerMeaning.includes(keyword)) {
      return svg;
    }
  }
  return svgTemplates['default'];
}

async function fillAllMissingSVGs() {
  console.log('🎨 Filling ALL missing SVG icons in database...\n');

  // Get all words without SVG directly from database
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning')
    .is('icon_svg', null);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 Total words without SVG: ${words?.length || 0}\n`);

  let successCount = 0;
  let failCount = 0;

  if (!words || words.length === 0) {
    console.log('✅ All words already have SVG icons!');
    return;
  }

  // Process each word by ID
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (i % 50 === 0) {
      console.log(`[${i + 1}/${words.length}] Processing...`);
    }

    try {
      const svg = findBestSVG(word.meaning);

      // Update by ID
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('id', word.id);

      if (updateError) {
        console.error(`  ❌ Error updating ${word.hebrew}: ${updateError.message}`);
        failCount++;
      } else {
        successCount++;
      }

      // Small delay
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error: any) {
      console.error(`  ❌ Failed ${word.hebrew}: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Success: ${successCount}/${words.length}`);
  console.log(`❌ Failed: ${failCount}/${words.length}`);
  console.log(`📈 Success rate: ${((successCount / words.length) * 100).toFixed(1)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

fillAllMissingSVGs();
