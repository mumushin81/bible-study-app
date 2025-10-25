import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArtisticSvgs() {
  console.log('🎨 예술적 SVG 품질 확인\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check some sample words
  const sampleMeanings = [
    "하나님",
    "창조하셨다",
    "빛",
    "하늘",
    "땅",
    "물들",
    "태초에, 처음에"
  ];

  for (const meaning of sampleMeanings) {
    const { data } = await supabase
      .from('words')
      .select('meaning, icon_svg')
      .eq('meaning', meaning)
      .limit(1);

    if (data && data.length > 0 && data[0].icon_svg) {
      const svg = data[0].icon_svg;
      const length = svg.length;

      // Check for artistic features
      const hasMultipleGradients = (svg.match(/Gradient/g) || []).length;
      const hasDropShadow = svg.includes('drop-shadow');
      const hasFilter = svg.includes('<filter') || svg.includes('feGaussianBlur');
      const hasPastelColors = svg.includes('#FFE5B4') || svg.includes('#B4E7F4') ||
                              svg.includes('#E1BEE7') || svg.includes('#FFD4E5') ||
                              svg.includes('#C8E6C9') || svg.includes('#FFF9C4');

      console.log(`🎨 "${meaning}"`);
      console.log(`   길이: ${length}자`);
      console.log(`   그라데이션: ${hasMultipleGradients}개`);
      console.log(`   Drop Shadow: ${hasDropShadow ? '✅' : '❌'}`);
      console.log(`   필터 효과: ${hasFilter ? '✅' : '❌'}`);
      console.log(`   파스텔 컬러: ${hasPastelColors ? '✅' : '❌'}`);
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkArtisticSvgs().catch(console.error);
