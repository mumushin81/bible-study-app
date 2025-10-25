import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 수동으로 제작한 SVG 데이터 (MD 규격 준수)
const svgData: Record<string, string> = {
  "하나님": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="god-light-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient><radialGradient id="god-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><circle cx="32" cy="32" r="24" fill="url(#god-glow-1)" opacity="0.3" filter="drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))"/><path d="M 32 12 L 36 26 L 50 26 L 39 34 L 43 48 L 32 40 L 21 48 L 25 34 L 14 26 L 28 26 Z" fill="url(#god-light-1)" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="6" fill="#FFFFFF" opacity="0.8"/></svg>',

  "창조하셨다": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="create-burst-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FF8C00"/></linearGradient><radialGradient id="create-center-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><circle cx="32" cy="32" r="8" fill="url(#create-center-1)" filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))"/><path d="M 32 8 L 34 28 M 32 56 L 34 36 M 8 32 L 28 34 M 56 32 L 36 34 M 14 14 L 28 28 M 50 50 L 36 36 M 14 50 L 28 36 M 50 14 L 36 28" stroke="url(#create-burst-1)" stroke-width="3" stroke-linecap="round" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>',

  "하늘": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky-main-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#7B68EE"/></linearGradient><radialGradient id="sky-cloud-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E0E7FF"/></radialGradient></defs><rect x="0" y="0" width="64" height="64" fill="url(#sky-main-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"/><ellipse cx="20" cy="20" rx="12" ry="8" fill="url(#sky-cloud-1)" opacity="0.7"/><ellipse cx="44" cy="24" rx="14" ry="9" fill="url(#sky-cloud-1)" opacity="0.6"/><ellipse cx="32" cy="44" rx="10" ry="6" fill="url(#sky-cloud-1)" opacity="0.5"/></svg>',

  "밤": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="night-sky-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#2c3e50"/><stop offset="100%" stop-color="#000428"/></linearGradient><radialGradient id="night-moon-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E0E0E0"/></radialGradient></defs><rect x="0" y="0" width="64" height="64" fill="url(#night-sky-1)"/><circle cx="44" cy="20" r="10" fill="url(#night-moon-1)" filter="drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))"/><circle cx="12" cy="16" r="2" fill="#FFFFFF" opacity="0.9"/><circle cx="18" cy="12" r="1.5" fill="#FFFFFF" opacity="0.8"/><circle cx="24" cy="20" r="1" fill="#FFFFFF" opacity="0.7"/><circle cx="52" cy="44" r="2" fill="#FFFFFF" opacity="0.9"/><circle cx="48" cy="52" r="1.5" fill="#FFFFFF" opacity="0.8"/></svg>',

  "넷째": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fourth-num-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7B68EE"/><stop offset="100%" stop-color="#667eea"/></linearGradient><radialGradient id="fourth-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#7B68EE"/></radialGradient></defs><circle cx="32" cy="32" r="26" fill="url(#fourth-glow-1)" opacity="0.3" filter="drop-shadow(0 4px 6px rgba(123, 104, 238, 0.5))"/><text x="32" y="44" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="url(#fourth-num-1)" text-anchor="middle" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))">4</text></svg>',

  "가축": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cattle-body-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D2691E"/><stop offset="100%" stop-color="#8B4513"/></linearGradient><radialGradient id="cattle-spot-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F5DEB3"/></radialGradient></defs><ellipse cx="32" cy="36" rx="22" ry="18" fill="url(#cattle-body-1)" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"/><circle cx="24" cy="16" r="6" fill="url(#cattle-body-1)"/><circle cx="40" cy="16" r="6" fill="url(#cattle-body-1)"/><ellipse cx="32" cy="30" rx="8" ry="6" fill="url(#cattle-spot-1)" opacity="0.6"/><circle cx="20" cy="38" r="3" fill="url(#cattle-spot-1)" opacity="0.5"/><circle cx="44" cy="36" r="3" fill="url(#cattle-spot-1)" opacity="0.5"/></svg>',

  "씨 맺는 채소": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="herb-leaf-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#2ECC71"/><stop offset="100%" stop-color="#27AE60"/></linearGradient><radialGradient id="herb-seed-1"><stop offset="0%" stop-color="#FFA500"/><stop offset="100%" stop-color="#FF8C00"/></radialGradient></defs><path d="M 32 52 Q 28 40 24 28 Q 20 16 24 8 Q 28 16 32 28 Q 36 40 40 52 Q 36 44 32 52" fill="url(#herb-leaf-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><ellipse cx="20" cy="20" rx="8" ry="12" fill="url(#herb-leaf-1)" opacity="0.7" transform="rotate(-30 20 20)"/><ellipse cx="44" cy="20" rx="8" ry="12" fill="url(#herb-leaf-1)" opacity="0.7" transform="rotate(30 44 20)"/><circle cx="28" cy="24" r="3" fill="url(#herb-seed-1)" opacity="0.8"/><circle cx="36" cy="28" r="2.5" fill="url(#herb-seed-1)" opacity="0.8"/><circle cx="32" cy="32" r="2" fill="url(#herb-seed-1)" opacity="0.8"/></svg>',

  "그것들을": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="them-item-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#7B68EE"/></linearGradient><radialGradient id="them-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#4A90E2"/></radialGradient></defs><circle cx="18" cy="32" r="10" fill="url(#them-item-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="10" fill="url(#them-item-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="46" cy="32" r="10" fill="url(#them-item-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="18" cy="32" r="4" fill="url(#them-glow-1)" opacity="0.6"/><circle cx="32" cy="32" r="4" fill="url(#them-glow-1)" opacity="0.6"/><circle cx="46" cy="32" r="4" fill="url(#them-glow-1)" opacity="0.6"/></svg>',

  "그리고 말씀하셨다": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="speak-wave-1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700"/><stop offset="50%" stop-color="#FFA500"/><stop offset="100%" stop-color="#FFD700"/></linearGradient><radialGradient id="speak-source-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><circle cx="12" cy="32" r="6" fill="url(#speak-source-1)" filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.7))"/><path d="M 20 32 Q 28 24 36 32 Q 44 40 52 32" stroke="url(#speak-wave-1)" stroke-width="3" fill="none" stroke-linecap="round" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><path d="M 20 26 Q 28 18 36 26 Q 44 34 52 26" stroke="url(#speak-wave-1)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/><path d="M 20 38 Q 28 30 36 38 Q 44 46 52 38" stroke="url(#speak-wave-1)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>',

  "그리고 땅의 짐승": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="beast-body-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8B4513"/><stop offset="100%" stop-color="#654321"/></linearGradient><radialGradient id="beast-eye-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#000000"/></radialGradient></defs><ellipse cx="32" cy="36" rx="24" ry="16" fill="url(#beast-body-1)" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))"/><circle cx="20" cy="20" r="8" fill="url(#beast-body-1)"/><circle cx="44" cy="20" r="8" fill="url(#beast-body-1)"/><path d="M 16 20 L 12 12 M 24 18 L 24 10" stroke="#654321" stroke-width="2" stroke-linecap="round"/><path d="M 40 18 L 40 10 M 48 20 L 52 12" stroke="#654321" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="22" r="3" fill="url(#beast-eye-1)"/><circle cx="40" cy="22" r="3" fill="url(#beast-eye-1)"/></svg>'
};

async function updateSVGs() {
  console.log('🎨 수동 제작 SVG 업데이트 시작...\n');

  let successCount = 0;
  let failCount = 0;

  for (const [meaning, svg] of Object.entries(svgData)) {
    try {
      console.log(`📝 "${meaning}" 업데이트 중...`);

      // 한국어 의미를 기준으로 모든 레코드 업데이트
      const { error, count } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('meaning', meaning)
        .select('id', { count: 'exact' });

      if (error) {
        console.error(`❌ "${meaning}" 업데이트 실패:`, error.message);
        failCount++;
      } else {
        console.log(`✅ "${meaning}" 업데이트 성공 (${count}개 레코드)`);
        successCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`❌ "${meaning}" 처리 중 오류:`, err);
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

updateSVGs().catch(console.error);
