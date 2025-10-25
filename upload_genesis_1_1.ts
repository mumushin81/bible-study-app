import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function uploadGenesis1_1() {
  console.log('📦 창세기 1장 1절 화려한 SVG 업로드 중...\n');

  const svgData = JSON.parse(readFileSync('genesis_1_1_vibrant_svgs.json', 'utf-8'));
  const meanings = Object.keys(svgData);

  console.log(`단어 수: ${meanings.length}개\n`);

  let success = 0;
  let totalRecords = 0;

  for (const meaning of meanings) {
    const svg = svgData[meaning];

    const { error } = await supabase
      .from('words')
      .update({ icon_svg: svg })
      .eq('meaning', meaning);

    if (error) {
      console.error(`❌ "${meaning}" 실패:`, error.message);
    } else {
      const { data } = await supabase
        .from('words')
        .select('id')
        .eq('meaning', meaning);

      const count = data?.length || 0;
      if (count > 0) {
        console.log(`✅ "${meaning}" → ${count}개 레코드`);
        success++;
        totalRecords += count;
      }
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 창세기 1장 1절 업로드 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 성공한 단어: ${success}개`);
  console.log(`📊 업데이트된 레코드: ${totalRecords}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

uploadGenesis1_1().catch(console.error);
