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

async function uploadGenesis3SVGs() {
  console.log('📦 창세기 3장 예술적 SVG 업로드 시작...\n');

  let totalSuccess = 0;
  let totalRecordsUpdated = 0;

  for (let batchNum = 1; batchNum <= 9; batchNum++) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 Genesis 3 Batch ${batchNum} 업로드 중...`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    try {
      const svgData = JSON.parse(
        readFileSync(`svg_gen3_batch_${batchNum}.json`, 'utf-8')
      );

      const meanings = Object.keys(svgData);
      console.log(`단어 수: ${meanings.length}개\n`);

      for (const meaning of meanings) {
        const svg = svgData[meaning];

        try {
          const { error } = await supabase
            .from('words')
            .update({ icon_svg: svg })
            .eq('meaning', meaning);

          if (error) {
            console.error(`❌ "${meaning}" 실패:`, error.message);
          } else {
            // Verify
            const { data } = await supabase
              .from('words')
              .select('id')
              .eq('meaning', meaning);

            const count = data?.length || 0;
            if (count > 0) {
              console.log(`✅ "${meaning}" → ${count}개 레코드`);
              totalSuccess++;
              totalRecordsUpdated += count;
            } else {
              console.log(`⚠️  "${meaning}" → 매칭 없음`);
            }
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`❌ "${meaning}" 오류:`, err);
        }
      }
    } catch (err) {
      console.error(`❌ Batch ${batchNum} 파일 읽기 실패:`, err);
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 창세기 3장 업로드 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 성공한 단어: ${totalSuccess}개`);
  console.log(`📊 업데이트된 레코드: ${totalRecordsUpdated}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

uploadGenesis3SVGs().catch(console.error);
