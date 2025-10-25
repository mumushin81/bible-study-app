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

async function verifyGenesis2() {
  console.log('🎯 창세기 2장 최종 확인\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const genesis2Data = JSON.parse(readFileSync('genesis2_words.json', 'utf-8'));
  const allWords = genesis2Data.words;

  console.log(`총 고유 단어: ${allWords.length}개\n`);

  let withSvg = 0;
  let withoutSvg = 0;
  const missing: string[] = [];

  for (const word of allWords) {
    const { data } = await supabase
      .from('words')
      .select('meaning, icon_svg')
      .eq('meaning', word.meaning)
      .limit(1);

    if (data && data.length > 0) {
      if (data[0].icon_svg) {
        withSvg++;
      } else {
        withoutSvg++;
        missing.push(word.meaning);
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 최종 결과');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ SVG 있음: ${withSvg}개 (${((withSvg/allWords.length)*100).toFixed(1)}%)`);
  console.log(`❌ SVG 없음: ${withoutSvg}개 (${((withoutSvg/allWords.length)*100).toFixed(1)}%)`);
  console.log(`\n완성도: ${withSvg}/${allWords.length}`);

  if (withoutSvg > 0 && withoutSvg <= 20) {
    console.log('\n\n⚠️  SVG가 아직 없는 단어들:\n');
    missing.forEach((m, i) => {
      console.log(`${i + 1}. "${m}"`);
    });
  } else if (withoutSvg === 0) {
    console.log('\n\n🎉🎉🎉 축하합니다! 창세기 2장 모든 단어에 SVG가 있습니다! 🎉🎉🎉');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

verifyGenesis2().catch(console.error);
