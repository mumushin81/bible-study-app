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

// 예술적이고 파스텔 느낌의 SVG 아이콘
const artisticSvgs: Record<string, string> = {
  "하나님": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="god-art-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE5B4"/><stop offset="30%" stop-color="#FFD4A3"/><stop offset="60%" stop-color="#F4C2C2"/><stop offset="100%" stop-color="#E8C5E8"/></linearGradient><radialGradient id="god-art-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="30%" stop-color="#FFFACD"/><stop offset="70%" stop-color="#FFE5B4"/><stop offset="100%" stop-color="#F4C2C2"/></radialGradient><filter id="soft-glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="32" cy="32" r="30" fill="url(#god-art-glow-1)" opacity="0.4"/><path d="M 32 6 C 32 6, 38 18, 32 24 C 26 18, 32 6, 32 6 M 32 58 C 32 58, 26 46, 32 40 C 38 46, 32 58, 32 58 M 6 32 C 6 32, 18 26, 24 32 C 18 38, 6 32, 6 32 M 58 32 C 58 32, 46 38, 40 32 C 46 26, 58 32, 58 32" fill="url(#god-art-1)" opacity="0.6" filter="url(#soft-glow)"/><circle cx="32" cy="32" r="16" fill="url(#god-art-glow-1)" filter="url(#soft-glow)"/><path d="M 32 14 L 34.5 25 L 45 25 L 36.5 31.5 L 39.5 42 L 32 35.5 L 24.5 42 L 27.5 31.5 L 19 25 L 29.5 25 Z" fill="url(#god-art-1)" opacity="0.8" filter="drop-shadow(0 6px 20px rgba(255, 228, 180, 0.7))"/><circle cx="32" cy="32" r="6" fill="#FFFFFF" opacity="0.7"/><circle cx="29" cy="29" r="2" fill="#FFFFFF"/></svg>',

  "태초에, 처음에": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="begin-art-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#B4E7F4"/><stop offset="25%" stop-color="#D4C5F9"/><stop offset="50%" stop-color="#F9D5E5"/><stop offset="75%" stop-color="#FFE5D9"/><stop offset="100%" stop-color="#E8F5E9"/></linearGradient><radialGradient id="begin-art-core-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#FFF9F0"/><stop offset="100%" stop-color="#E1F5FE"/></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#begin-art-1)" opacity="0.3"/><path d="M 32 32 Q 20 20 12 32 T 32 52 T 52 32 T 32 12" fill="none" stroke="url(#begin-art-1)" stroke-width="3" opacity="0.5" filter="drop-shadow(0 4px 12px rgba(180, 231, 244, 0.6))"/><circle cx="32" cy="32" r="14" fill="url(#begin-art-core-1)" filter="drop-shadow(0 0 24px rgba(255, 249, 240, 0.9))"/><path d="M 32 8 Q 32 20 32 32 M 32 32 Q 20 32 8 32 M 32 32 Q 32 44 32 56 M 32 32 Q 44 32 56 32 M 32 32 Q 20 20 12 12 M 32 32 Q 44 20 52 12 M 32 32 Q 20 44 12 52 M 32 32 Q 44 44 52 52" stroke="url(#begin-art-1)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><circle cx="32" cy="32" r="4" fill="#FFFFFF"/><circle cx="12" cy="32" r="2" fill="#B4E7F4" opacity="0.8"/><circle cx="52" cy="32" r="2" fill="#F9D5E5" opacity="0.8"/><circle cx="32" cy="12" r="2" fill="#D4C5F9" opacity="0.8"/><circle cx="32" cy="52" r="2" fill="#E8F5E9" opacity="0.8"/></svg>',

  "창조하셨다": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="create-art-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD4E5"/><stop offset="30%" stop-color="#F9C6CF"/><stop offset="60%" stop-color="#E5D4F7"/><stop offset="100%" stop-color="#C9E4F7"/></linearGradient><radialGradient id="create-art-magic-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="50%" stop-color="#FFF0F5"/><stop offset="100%" stop-color="#FFD4E5"/></radialGradient></defs><path d="M 16 48 Q 16 36 20 30 L 22 34 L 24 28 L 26 34 L 28 28 L 30 36 Q 32 40 32 48" fill="url(#create-art-1)" opacity="0.7" filter="drop-shadow(0 6px 16px rgba(255, 212, 229, 0.6))"/><circle cx="42" cy="18" r="7" fill="url(#create-art-magic-1)" filter="drop-shadow(0 0 20px rgba(255, 240, 245, 1))"/><circle cx="50" cy="30" r="5" fill="url(#create-art-magic-1)" filter="drop-shadow(0 0 16px rgba(255, 240, 245, 1))"/><circle cx="46" cy="42" r="6" fill="url(#create-art-magic-1)" filter="drop-shadow(0 0 18px rgba(255, 240, 245, 1))"/><path d="M 30 34 Q 36 26 42 18" stroke="url(#create-art-1)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/><path d="M 30 38 Q 40 34 50 30" stroke="url(#create-art-1)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/><path d="M 30 42 Q 38 42 46 42" stroke="url(#create-art-1)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/><path d="M 38 15 L 40 18 L 43 16 L 42 19 L 45 20 L 42 21 L 43 24 L 40 22 L 38 25 L 37 22 L 34 24 L 35 21 L 32 20 L 35 19 L 34 16 L 37 18 Z" fill="#FFFFFF" opacity="0.8"/><path d="M 48 27 L 49 29 L 51 28 L 51 30 L 53 30 L 51 31 L 51 33 L 49 32 L 48 34 L 47 32 L 45 33 L 45 31 L 43 30 L 45 30 L 45 28 L 47 29 Z" fill="#FFFFFF" opacity="0.8"/></svg>',

  "하늘들": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky-art-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E1F4F3"/><stop offset="30%" stop-color="#C2E3F6"/><stop offset="60%" stop-color="#D0C9E8"/><stop offset="100%" stop-color="#E8D5F2"/></linearGradient><radialGradient id="sky-art-cloud-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="50%" stop-color="#FFFEF7"/><stop offset="100%" stop-color="#FFF9E6"/></radialGradient><linearGradient id="sky-art-cloud-2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="50%" stop-color="#F5F9FF"/><stop offset="100%" stop-color="#FFFFFF"/></linearGradient></defs><rect x="0" y="0" width="64" height="64" fill="url(#sky-art-1)"/><path d="M 8 20 Q 12 14 18 14 Q 24 14 28 18 Q 32 14 36 16 Q 40 14 44 18 Q 46 16 50 18 Q 54 16 58 20 L 58 28 Q 54 24 50 26 Q 46 24 42 26 Q 38 22 34 24 Q 30 20 26 24 Q 22 22 18 24 Q 14 26 8 22 Z" fill="url(#sky-art-cloud-1)" opacity="0.8" filter="drop-shadow(0 4px 12px rgba(255, 255, 255, 0.8))"/><ellipse cx="20" cy="38" rx="15" ry="10" fill="url(#sky-art-cloud-2)" opacity="0.75" filter="drop-shadow(0 3px 10px rgba(245, 249, 255, 0.7))"/><ellipse cx="44" cy="42" rx="18" ry="11" fill="url(#sky-art-cloud-2)" opacity="0.75" filter="drop-shadow(0 3px 10px rgba(245, 249, 255, 0.7))"/><circle cx="26" cy="50" r="2" fill="#FFE6A7" opacity="0.6"/><circle cx="38" cy="52" r="2" fill="#FFE6A7" opacity="0.6"/><circle cx="32" cy="30" r="2.5" fill="#FFD4A3" opacity="0.7"/><path d="M 10 15 Q 16 10 22 15" fill="none" stroke="#E1F4F3" stroke-width="2" opacity="0.4"/><path d="M 42 16 Q 48 11 54 16" fill="none" stroke="#D0C9E8" stroke-width="2" opacity="0.4"/></svg>',

  "땅을": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="earth-art-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8F5E9"/><stop offset="30%" stop-color="#C8E6C9"/><stop offset="60%" stop-color="#A5D6A7"/><stop offset="100%" stop-color="#81C784"/></linearGradient><radialGradient id="earth-art-glow-1"><stop offset="0%" stop-color="#F1F8E9"/><stop offset="50%" stop-color="#DCEDC8"/><stop offset="100%" stop-color="#C8E6C9"/></radialGradient><linearGradient id="earth-art-detail-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#B2DFDB"/><stop offset="50%" stop-color="#80CBC4"/><stop offset="100%" stop-color="#4DB6AC"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="url(#earth-art-glow-1)" filter="drop-shadow(0 6px 20px rgba(200, 230, 201, 0.7))"/><circle cx="32" cy="32" r="24" fill="url(#earth-art-1)" opacity="0.9"/><path d="M 12 28 Q 18 22 26 24 Q 34 26 42 22 Q 50 20 56 24" fill="none" stroke="url(#earth-art-detail-1)" stroke-width="3" stroke-linecap="round" opacity="0.6"/><path d="M 10 36 Q 16 32 24 34 Q 32 36 40 32 Q 48 30 54 34" fill="none" stroke="url(#earth-art-detail-1)" stroke-width="3" stroke-linecap="round" opacity="0.6"/><path d="M 14 44 Q 22 40 30 42 Q 38 44 46 40 Q 52 38 58 42" fill="none" stroke="url(#earth-art-detail-1)" stroke-width="3" stroke-linecap="round" opacity="0.5"/><ellipse cx="22" cy="26" rx="5" ry="4" fill="#A5D6A7" opacity="0.5" transform="rotate(-20 22 26)"/><ellipse cx="38" cy="30" rx="6" ry="4" fill="#81C784" opacity="0.5" transform="rotate(15 38 30)"/><ellipse cx="28" cy="38" rx="4" ry="3" fill="#C8E6C9" opacity="0.5" transform="rotate(-10 28 38)"/><ellipse cx="44" cy="42" rx="5" ry="3" fill="#A5D6A7" opacity="0.5" transform="rotate(20 44 42)"/><circle cx="32" cy="32" r="3" fill="#F1F8E9" opacity="0.6"/></svg>',

  "그리고 ~을/를": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="and-art-1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#E1BEE7"/><stop offset="30%" stop-color="#CE93D8"/><stop offset="50%" stop-color="#BA68C8"/><stop offset="70%" stop-color="#CE93D8"/><stop offset="100%" stop-color="#E1BEE7"/></linearGradient><radialGradient id="and-art-node-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="30%" stop-color="#F8E9FA"/><stop offset="70%" stop-color="#F3E5F5"/><stop offset="100%" stop-color="#E1BEE7"/></radialGradient></defs><circle cx="18" cy="32" r="12" fill="url(#and-art-node-1)" filter="drop-shadow(0 6px 18px rgba(225, 190, 231, 0.8))"/><circle cx="46" cy="32" r="12" fill="url(#and-art-node-1)" filter="drop-shadow(0 6px 18px rgba(225, 190, 231, 0.8))"/><path d="M 30 32 L 34 32" stroke="url(#and-art-1)" stroke-width="6" stroke-linecap="round" filter="drop-shadow(0 4px 14px rgba(206, 147, 216, 0.7))"/><path d="M 26 26 Q 32 20 38 26" fill="none" stroke="#CE93D8" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/><path d="M 26 38 Q 32 44 38 38" fill="none" stroke="#CE93D8" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/><circle cx="18" cy="32" r="6" fill="#FFFFFF" opacity="0.7"/><circle cx="46" cy="32" r="6" fill="#FFFFFF" opacity="0.7"/><circle cx="18" cy="32" r="3" fill="#F3E5F5"/><circle cx="46" cy="32" r="3" fill="#F3E5F5"/><path d="M 30 28 Q 32 24 34 28" fill="none" stroke="#E1BEE7" stroke-width="2" opacity="0.4"/><path d="M 30 36 Q 32 40 34 36" fill="none" stroke="#E1BEE7" stroke-width="2" opacity="0.4"/></svg>',

  "~을/를 (목적격 표지)": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="obj-art-1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFE0B2"/><stop offset="25%" stop-color="#FFCC80"/><stop offset="50%" stop-color="#FFB74D"/><stop offset="75%" stop-color="#FFCC80"/><stop offset="100%" stop-color="#FFE0B2"/></linearGradient><radialGradient id="obj-art-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#FFF8E1"/><stop offset="100%" stop-color="#FFE0B2"/></radialGradient></defs><circle cx="12" cy="32" r="9" fill="url(#obj-art-glow-1)" filter="drop-shadow(0 6px 18px rgba(255, 224, 178, 0.8))"/><path d="M 21 32 L 46 32" stroke="url(#obj-art-1)" stroke-width="7" stroke-linecap="round" filter="drop-shadow(0 5px 16px rgba(255, 204, 128, 0.7))"/><path d="M 38 24 L 52 32 L 38 40 Z" fill="url(#obj-art-1)" filter="drop-shadow(0 5px 16px rgba(255, 183, 77, 0.7))"/><path d="M 18 22 Q 28 18 38 22 Q 46 24 52 22" fill="none" stroke="#FFB74D" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><path d="M 18 42 Q 28 46 38 42 Q 46 40 52 42" fill="none" stroke="#FFB74D" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><circle cx="12" cy="32" r="4" fill="#FFFFFF" opacity="0.8"/><circle cx="48" cy="32" r="3" fill="#FFFFFF" opacity="0.6"/><path d="M 24 28 Q 26 26 28 28" fill="none" stroke="#FFCC80" stroke-width="2" opacity="0.3"/><path d="M 24 36 Q 26 38 28 36" fill="none" stroke="#FFCC80" stroke-width="2" opacity="0.3"/></svg>'
};

async function updateArtisticSvgs() {
  console.log('🎨 창세기 1:1 예술적 파스텔 SVG 업데이트 시작...\n');

  let successCount = 0;
  let totalRecords = 0;

  for (const [meaning, svg] of Object.entries(artisticSvgs)) {
    try {
      console.log(`✨ "${meaning}" 업데이트 중...`);

      const { error } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('meaning', meaning);

      if (error) {
        console.error(`❌ 실패:`, error.message);
      } else {
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
  console.log('🎉 예술적 업데이트 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 성공한 단어: ${successCount}/${Object.keys(artisticSvgs).length}개`);
  console.log(`📊 업데이트된 레코드: ${totalRecords}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

updateArtisticSvgs().catch(console.error);
