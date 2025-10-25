import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRemaining() {
  // Read genesis1_words.json
  const genesis1Data = JSON.parse(readFileSync('genesis1_words.json', 'utf-8'));
  const allMeanings = genesis1Data.words.map((w: any) => w.meaning);

  console.log(`📊 창세기 1장 고유 의미: ${allMeanings.length}개\n`);

  // Check which ones already have SVG
  let withSvg = 0;
  let withoutSvg = 0;
  const needingSvg: string[] = [];

  for (const meaning of allMeanings.slice(0, 50)) { // Check first 50
    const { data } = await supabase
      .from('words')
      .select('meaning, icon_svg')
      .eq('meaning', meaning)
      .limit(1);

    if (data && data.length > 0) {
      if (data[0].icon_svg) {
        withSvg++;
        console.log(`✅ "${meaning}"`);
      } else {
        withoutSvg++;
        needingSvg.push(meaning);
        console.log(`❌ "${meaning}"`);
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ SVG 있음: ${withSvg}개`);
  console.log(`❌ SVG 없음: ${withoutSvg}개`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (needingSvg.length > 0) {
    console.log(`📝 다음 배치로 생성할 단어들 (최대 20개):\n`);
    needingSvg.slice(0, 20).forEach((m, i) => {
      console.log(`${i + 1}. "${m}"`);
    });
  }
}

checkRemaining().catch(console.error);
