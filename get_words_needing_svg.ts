import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getWordsNeedingSVG() {
  const genesis1Data = JSON.parse(readFileSync('genesis1_words.json', 'utf-8'));
  const allWords = genesis1Data.words;

  console.log(`📊 전체 창세기 1장 단어: ${allWords.length}개\n`);
  console.log('SVG 상태 확인 중...\n');

  const needingSvg = [];

  for (const word of allWords) {
    const { data } = await supabase
      .from('words')
      .select('meaning, icon_svg')
      .eq('meaning', word.meaning)
      .limit(1);

    if (data && data.length > 0) {
      if (!data[0].icon_svg) {
        needingSvg.push(word);
      }
    }
  }

  console.log(`✅ SVG 필요한 단어: ${needingSvg.length}개`);
  console.log(`✅ SVG 이미 있는 단어: ${allWords.length - needingSvg.length}개\n`);

  // Save to file
  writeFileSync('words_needing_svg.json', JSON.stringify(needingSvg, null, 2));
  console.log('📝 words_needing_svg.json 파일에 저장 완료');

  // Divide into 10 batches
  const batchSize = Math.ceil(needingSvg.length / 10);
  for (let i = 0; i < 10; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, needingSvg.length);
    const batch = needingSvg.slice(start, end);

    if (batch.length > 0) {
      writeFileSync(`batch_${i + 1}.json`, JSON.stringify(batch, null, 2));
      console.log(`📦 Batch ${i + 1}: ${batch.length}개 단어 → batch_${i + 1}.json`);
    }
  }
}

getWordsNeedingSVG().catch(console.error);
