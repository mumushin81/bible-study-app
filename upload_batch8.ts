import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function uploadBatch8() {
  const svgData = JSON.parse(readFileSync('svg_gen3_batch_8.json', 'utf-8'));
  const meanings = Object.keys(svgData);

  console.log('📦 Genesis 3 Batch 8 업로드 중...\n');
  console.log(`단어 수: ${meanings.length}개\n`);

  let success = 0;
  let records = 0;

  for (const meaning of meanings) {
    const svg = svgData[meaning];
    await supabase.from('words').update({ icon_svg: svg }).eq('meaning', meaning);
    const { data } = await supabase.from('words').select('id').eq('meaning', meaning);
    const count = data?.length || 0;
    if (count > 0) {
      console.log(`✅ "${meaning}" → ${count}개 레코드`);
      success++;
      records += count;
    }
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n✅ 성공: ${success}개`);
  console.log(`📊 레코드: ${records}개`);
}

uploadBatch8().catch(console.error);
