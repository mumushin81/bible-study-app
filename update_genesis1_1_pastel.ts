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

// 파스텔 톤 화려한 SVG (밝고 생동감 있는 색상)
const pastelSvgs: Record<string, string> = {
  "하나님": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="god-rays-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE66D"/><stop offset="50%" stop-color="#FFB347"/><stop offset="100%" stop-color="#FFD4E5"/></linearGradient><radialGradient id="god-center-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#FFF9C4"/><stop offset="100%" stop-color="#FFE082"/></radialGradient><filter id="glow-1"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="32" cy="32" r="26" fill="url(#god-center-1)" opacity="0.5" filter="drop-shadow(0 0 16px rgba(255, 230, 109, 0.8))"/><circle cx="32" cy="32" r="18" fill="#FFFDE7" filter="url(#glow-1)"/><path d="M 32 8 L 35 24 L 50 24 L 38 33 L 42 48 L 32 39 L 22 48 L 26 33 L 14 24 L 29 24 Z" fill="url(#god-rays-1)" filter="drop-shadow(0 4px 12px rgba(255, 179, 71, 0.6))"/><circle cx="32" cy="32" r="8" fill="#FFF9C4" opacity="0.8"/><circle cx="28" cy="28" r="2" fill="#FFFFFF"/></svg>',

  "태초에, 처음에": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="begin-burst-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#B2EBF2"/><stop offset="50%" stop-color="#E1BEE7"/><stop offset="100%" stop-color="#FFE0B2"/></linearGradient><radialGradient id="begin-core-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="50%" stop-color="#E1F5FE"/><stop offset="100%" stop-color="#B2EBF2"/></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#begin-burst-1)" opacity="0.3"/><circle cx="32" cy="32" r="12" fill="url(#begin-core-1)" filter="drop-shadow(0 0 20px rgba(178, 235, 242, 0.9))"/><path d="M 32 4 L 34 22 M 32 60 L 34 42 M 4 32 L 22 34 M 60 32 L 42 34" stroke="#B2EBF2" stroke-width="4" stroke-linecap="round" opacity="0.7" filter="drop-shadow(0 2px 8px rgba(178, 235, 242, 0.6))"/><path d="M 12 12 L 26 26 M 52 52 L 38 38 M 12 52 L 26 38 M 52 12 L 38 26" stroke="#E1BEE7" stroke-width="4" stroke-linecap="round" opacity="0.6" filter="drop-shadow(0 2px 8px rgba(225, 190, 231, 0.6))"/><circle cx="32" cy="32" r="6" fill="#FFFFFF" opacity="0.9"/></svg>',

  "창조하셨다": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="create-hand-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD4E5"/><stop offset="50%" stop-color="#F8BBD0"/><stop offset="100%" stop-color="#FFC1E3"/></linearGradient><radialGradient id="create-magic-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#FFE0F0"/><stop offset="100%" stop-color="#F8BBD0"/></radialGradient><linearGradient id="create-spark-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE66D"/><stop offset="50%" stop-color="#B2EBF2"/><stop offset="100%" stop-color="#E1BEE7"/></linearGradient></defs><ellipse cx="20" cy="36" rx="8" ry="12" fill="url(#create-hand-1)" filter="drop-shadow(0 4px 10px rgba(248, 187, 208, 0.5))"/><path d="M 20 24 Q 20 20 22 18 L 24 22 L 26 18 L 28 22 L 30 18 L 32 24" fill="url(#create-hand-1)" filter="drop-shadow(0 4px 10px rgba(248, 187, 208, 0.5))"/><circle cx="44" cy="20" r="6" fill="url(#create-magic-1)" filter="drop-shadow(0 0 16px rgba(255, 224, 240, 0.9))"/><circle cx="52" cy="32" r="4" fill="url(#create-magic-1)" filter="drop-shadow(0 0 12px rgba(255, 224, 240, 0.9))"/><circle cx="48" cy="44" r="5" fill="url(#create-magic-1)" filter="drop-shadow(0 0 14px rgba(255, 224, 240, 0.9))"/><path d="M 28 28 Q 36 24 44 20 M 28 32 Q 40 32 52 32 M 28 36 Q 38 40 48 44" stroke="url(#create-spark-1)" stroke-width="2" stroke-linecap="round" opacity="0.7" filter="drop-shadow(0 2px 6px rgba(178, 235, 242, 0.5))"/></svg>',

  "하늘들": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky-main-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E1F5FE"/><stop offset="30%" stop-color="#B3E5FC"/><stop offset="70%" stop-color="#D1C4E9"/><stop offset="100%" stop-color="#E1BEE7"/></linearGradient><radialGradient id="sky-cloud-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="60%" stop-color="#FFFDE7"/><stop offset="100%" stop-color="#FFF9C4"/></radialGradient></defs><rect x="0" y="0" width="64" height="64" fill="url(#sky-main-1)" filter="drop-shadow(0 2px 8px rgba(179, 229, 252, 0.4))"/><ellipse cx="18" cy="18" rx="14" ry="9" fill="url(#sky-cloud-1)" opacity="0.85" filter="drop-shadow(0 2px 8px rgba(255, 255, 255, 0.6))"/><ellipse cx="46" cy="22" rx="16" ry="10" fill="url(#sky-cloud-1)" opacity="0.85" filter="drop-shadow(0 2px 8px rgba(255, 255, 255, 0.6))"/><ellipse cx="32" cy="46" rx="12" ry="8" fill="url(#sky-cloud-1)" opacity="0.75" filter="drop-shadow(0 2px 8px rgba(255, 255, 255, 0.6))"/><circle cx="24" cy="36" r="2" fill="#FFE66D" opacity="0.8"/><circle cx="40" cy="38" r="2" fill="#FFE66D" opacity="0.8"/><circle cx="32" cy="30" r="2" fill="#FFB347" opacity="0.8"/></svg>',

  "땅을": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="earth-ground-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#DCEDC8"/><stop offset="50%" stop-color="#C5E1A5"/><stop offset="100%" stop-color="#AED581"/></linearGradient><radialGradient id="earth-glow-1"><stop offset="0%" stop-color="#F1F8E9"/><stop offset="50%" stop-color="#DCEDC8"/><stop offset="100%" stop-color="#C5E1A5"/></radialGradient><linearGradient id="earth-detail-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#A5D6A7"/><stop offset="50%" stop-color="#81C784"/><stop offset="100%" stop-color="#66BB6A"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="url(#earth-glow-1)" filter="drop-shadow(0 4px 16px rgba(197, 225, 165, 0.6))"/><circle cx="32" cy="32" r="22" fill="url(#earth-ground-1)" filter="drop-shadow(0 2px 8px rgba(174, 213, 129, 0.5))"/><path d="M 16 26 Q 22 22 28 26 Q 34 30 40 26 Q 46 22 52 26" stroke="url(#earth-detail-1)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/><path d="M 14 36 Q 20 32 26 36 Q 32 40 38 36 Q 44 32 50 36" stroke="url(#earth-detail-1)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/><circle cx="20" cy="32" r="3" fill="#81C784" opacity="0.6"/><circle cx="32" cy="28" r="3" fill="#81C784" opacity="0.6"/><circle cx="44" cy="34" r="3" fill="#81C784" opacity="0.6"/></svg>',

  "그리고 ~을/를": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="and-link-1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#E1BEE7"/><stop offset="50%" stop-color="#CE93D8"/><stop offset="100%" stop-color="#E1BEE7"/></linearGradient><radialGradient id="and-node-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#F3E5F5"/><stop offset="100%" stop-color="#E1BEE7"/></radialGradient></defs><circle cx="18" cy="32" r="10" fill="url(#and-node-1)" filter="drop-shadow(0 4px 12px rgba(225, 190, 231, 0.7))"/><circle cx="46" cy="32" r="10" fill="url(#and-node-1)" filter="drop-shadow(0 4px 12px rgba(225, 190, 231, 0.7))"/><path d="M 28 32 L 38 32" stroke="url(#and-link-1)" stroke-width="5" stroke-linecap="round" filter="drop-shadow(0 2px 8px rgba(206, 147, 216, 0.6))"/><path d="M 24 28 Q 32 20 40 28" stroke="#CE93D8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/><path d="M 24 36 Q 32 44 40 36" stroke="#CE93D8" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/><circle cx="18" cy="32" r="4" fill="#FFFFFF" opacity="0.9"/><circle cx="46" cy="32" r="4" fill="#FFFFFF" opacity="0.9"/></svg>',

  "~을/를 (목적격 표지)": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="obj-arrow-1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFE0B2"/><stop offset="50%" stop-color="#FFCC80"/><stop offset="100%" stop-color="#FFB74D"/></linearGradient><radialGradient id="obj-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#FFF8E1"/><stop offset="100%" stop-color="#FFE0B2"/></radialGradient></defs><circle cx="12" cy="32" r="8" fill="url(#obj-glow-1)" filter="drop-shadow(0 4px 12px rgba(255, 224, 178, 0.7))"/><path d="M 20 32 L 48 32" stroke="url(#obj-arrow-1)" stroke-width="6" stroke-linecap="round" filter="drop-shadow(0 3px 10px rgba(255, 204, 128, 0.6))"/><path d="M 40 24 L 52 32 L 40 40" fill="url(#obj-arrow-1)" filter="drop-shadow(0 3px 10px rgba(255, 183, 77, 0.6))"/><path d="M 16 22 Q 32 18 48 22" stroke="#FFB74D" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/><path d="M 16 42 Q 32 46 48 42" stroke="#FFB74D" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/></svg>'
};

async function updatePastelSvgs() {
  console.log('🎨 창세기 1:1 파스텔 SVG 업데이트 시작...\n');

  let successCount = 0;
  let totalRecords = 0;

  for (const [meaning, svg] of Object.entries(pastelSvgs)) {
    try {
      console.log(`✨ "${meaning}" 업데이트 중...`);

      const { error, count } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('meaning', meaning);

      if (error) {
        console.error(`❌ 실패:`, error.message);
      } else {
        // Verify by selecting
        const { data } = await supabase
          .from('words')
          .select('id')
          .eq('meaning', meaning);

        const actualCount = data?.length || 0;
        console.log(`✅ 성공 (${actualCount}개 레코드)`);
        successCount++;
        totalRecords += actualCount;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`❌ "${meaning}" 오류:`, err);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 업데이트 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 성공한 단어: ${successCount}/${Object.keys(pastelSvgs).length}개`);
  console.log(`📊 업데이트된 레코드: ${totalRecords}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

updatePastelSvgs().catch(console.error);
