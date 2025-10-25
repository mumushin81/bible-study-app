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

async function countArtisticUpdates() {
  console.log('📊 예술적 SVG 업데이트 카운트\n');

  let totalArtistic = 0;
  let totalOld = 0;

  // Load all batch files
  for (let i = 1; i <= 10; i++) {
    try {
      const batchData = JSON.parse(readFileSync(`svg_batch_${i}.json`, 'utf-8'));
      const meanings = Object.keys(batchData);

      console.log(`\n🎨 Batch ${i}: ${meanings.length}개 단어`);

      for (const meaning of meanings) {
        const svg = batchData[meaning];
        const hasPastel = svg.includes('#FFE5B4') || svg.includes('#B4E7F4') ||
                          svg.includes('#E1BEE7') || svg.includes('#FFD4E5');

        // Check if DB has this artistic version
        const { data } = await supabase
          .from('words')
          .select('icon_svg')
          .eq('meaning', meaning)
          .limit(1);

        if (data && data.length > 0 && data[0].icon_svg) {
          const dbSvg = data[0].icon_svg;
          const dbHasPastel = dbSvg.includes('#FFE5B4') || dbSvg.includes('#B4E7F4') ||
                              dbSvg.includes('#E1BEE7') || dbSvg.includes('#FFD4E5');

          if (dbHasPastel) {
            totalArtistic++;
          } else {
            totalOld++;
            console.log(`   ❌ "${meaning}" - 아직 구버전`);
          }
        }
      }
    } catch (err) {
      console.log(`⚠️  Batch ${i} 파일 없음`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 예술적 스타일: ${totalArtistic}개`);
  console.log(`❌ 구버전 스타일: ${totalOld}개`);
  console.log(`📊 업데이트율: ${((totalArtistic/(totalArtistic+totalOld))*100).toFixed(1)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

countArtisticUpdates().catch(console.error);
