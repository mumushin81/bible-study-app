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

async function uploadAllBatches() {
  console.log('📦 모든 배치 SVG 업로드 시작...\n');

  let totalSuccess = 0;
  let totalFail = 0;
  let totalRecordsUpdated = 0;

  for (let batchNum = 1; batchNum <= 10; batchNum++) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📦 Batch ${batchNum} 업로드 중...`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    try {
      const svgData = JSON.parse(
        readFileSync(`svg_batch_${batchNum}.json`, 'utf-8')
      );

      const meanings = Object.keys(svgData);
      console.log(`단어 수: ${meanings.length}개\n`);

      for (const meaning of meanings) {
        const svg = svgData[meaning];

        try {
          const { error, count } = await supabase
            .from('words')
            .update({ icon_svg: svg })
            .eq('meaning', meaning)
            .select('id', { count: 'exact' });

          if (error) {
            console.error(`❌ "${meaning}" 실패:`, error.message);
            totalFail++;
          } else if (count && count > 0) {
            console.log(`✅ "${meaning}" → ${count}개 레코드 업데이트`);
            totalSuccess++;
            totalRecordsUpdated += count;
          } else {
            console.log(`⚠️  "${meaning}" → 매칭되는 레코드 없음`);
            totalFail++;
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`❌ "${meaning}" 오류:`, err);
          totalFail++;
        }
      }
    } catch (err) {
      console.error(`❌ Batch ${batchNum} 파일 읽기 실패:`, err);
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 전체 업로드 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 성공한 단어: ${totalSuccess}개`);
  console.log(`❌ 실패한 단어: ${totalFail}개`);
  console.log(`📊 업데이트된 레코드: ${totalRecordsUpdated}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

uploadAllBatches().catch(console.error);
