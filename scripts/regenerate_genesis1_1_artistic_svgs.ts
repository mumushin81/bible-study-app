import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// 창조적이고 화려한 SVG 디자인
const artisticSVGs: Record<string, string> = {
  // 1. בְּרֵאשִׁית (태초에, 처음에)
  'בְּרֵאשִׁית': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="genesis-beginning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF8C00;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6347;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="genesis-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#FFD700;stop-opacity:0" />
    </radialGradient>
    <filter id="genesis-shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="4" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 우주 배경 -->
  <circle cx="32" cy="32" r="30" fill="url(#genesis-glow)" opacity="0.3"/>

  <!-- 중앙 별 (창조의 빛) -->
  <path d="M 32 8 L 36 24 L 52 26 L 40 38 L 44 54 L 32 44 L 20 54 L 24 38 L 12 26 L 28 24 Z"
        fill="url(#genesis-beginning-gradient)"
        filter="url(#genesis-shadow)"
        stroke="#FFD700" stroke-width="1" opacity="0.95"/>

  <!-- 빛나는 입자들 -->
  <circle cx="16" cy="16" r="2" fill="#FFD700" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="48" cy="18" r="1.5" fill="#FFA500" opacity="0.7">
    <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="14" cy="48" r="1.8" fill="#FF8C00" opacity="0.6">
    <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="50" cy="46" r="2.2" fill="#FFD700" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.8s" repeatCount="indefinite"/>
  </circle>
</svg>`,

  // 2. בָּרָא (창조하셨다)
  'בָּרָא': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="create-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9C27B0;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#E91E63;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF9800;stop-opacity:1" />
    </linearGradient>
    <filter id="create-glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 창조의 손 (위에서 아래로) -->
  <path d="M 20 12 Q 32 20 44 12"
        stroke="url(#create-gradient)" stroke-width="3" fill="none"
        stroke-linecap="round" filter="url(#create-glow)"/>

  <!-- 창조되는 세계 -->
  <circle cx="32" cy="38" r="18"
          fill="url(#create-gradient)"
          opacity="0.3"/>
  <circle cx="32" cy="38" r="14"
          fill="url(#create-gradient)"
          opacity="0.5"/>
  <circle cx="32" cy="38" r="10"
          fill="url(#create-gradient)"
          opacity="0.8"
          filter="url(#create-glow)"/>

  <!-- 빛의 광선들 -->
  <line x1="32" y1="20" x2="32" y2="28" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="44" y1="26" x2="40" y2="32" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="50" y1="38" x2="42" y2="38" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="44" y1="50" x2="40" y2="44" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="20" y1="26" x2="24" y2="32" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="14" y1="38" x2="22" y2="38" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="20" y1="50" x2="24" y2="44" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
</svg>`,

  // 3. אֱלֹהִים (하나님)
  'אֱלֹהִים': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="god-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </radialGradient>
    <filter id="god-divine-glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.8"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 신성한 빛 -->
  <circle cx="32" cy="32" r="28" fill="url(#god-gradient)" opacity="0.2"/>
  <circle cx="32" cy="32" r="20" fill="url(#god-gradient)" opacity="0.4"/>
  <circle cx="32" cy="32" r="12" fill="url(#god-gradient)" filter="url(#god-divine-glow)"/>

  <!-- 삼위일체 상징 (세 개의 호) -->
  <path d="M 32 14 Q 20 20 20 32 Q 20 44 32 50"
        stroke="#FFD700" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 32 50 Q 44 44 44 32 Q 44 20 32 14"
        stroke="#FFD700" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 20 32 Q 26 26 32 26 Q 38 26 44 32"
        stroke="#FFD700" stroke-width="3" fill="none" opacity="0.8"/>

  <!-- 왕관 (신성의 상징) -->
  <path d="M 24 18 L 28 24 L 32 20 L 36 24 L 40 18 L 38 28 L 26 28 Z"
        fill="#FFD700" opacity="0.9" filter="url(#god-divine-glow)"/>
</svg>`,

  // 4. אֵת (~을/를, 목적격 표지)
  'אֵת': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="et-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3F51B5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 화살표 (방향성, 목적) -->
  <path d="M 12 32 L 40 32 L 36 28 M 40 32 L 36 36"
        stroke="url(#et-gradient)" stroke-width="4" fill="none"
        stroke-linecap="round" stroke-linejoin="round">
    <animate attributeName="d"
             values="M 12 32 L 40 32 L 36 28 M 40 32 L 36 36;M 16 32 L 44 32 L 40 28 M 44 32 L 40 36;M 12 32 L 40 32 L 36 28 M 40 32 L 36 36"
             dur="2s" repeatCount="indefinite"/>
  </path>

  <!-- 타겟 원 -->
  <circle cx="48" cy="32" r="8" fill="none" stroke="url(#et-gradient)" stroke-width="2" opacity="0.6"/>
  <circle cx="48" cy="32" r="5" fill="none" stroke="url(#et-gradient)" stroke-width="2" opacity="0.8"/>
  <circle cx="48" cy="32" r="2" fill="url(#et-gradient)" opacity="1"/>
</svg>`,

  // 5. הַשָּׁמַיִם (하늘들)
  'הַשָּׁמַיִם': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="heaven-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E3A8A;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="cloud-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E0F2FE;stop-opacity:0.8" />
    </radialGradient>
  </defs>

  <!-- 하늘 배경 -->
  <rect width="64" height="64" fill="url(#heaven-gradient)" rx="8"/>

  <!-- 구름들 -->
  <ellipse cx="20" cy="20" rx="12" ry="8" fill="url(#cloud-gradient)" opacity="0.9"/>
  <ellipse cx="28" cy="18" rx="10" ry="7" fill="url(#cloud-gradient)" opacity="0.9"/>
  <ellipse cx="16" cy="22" rx="8" ry="6" fill="url(#cloud-gradient)" opacity="0.9"/>

  <ellipse cx="44" cy="28" rx="14" ry="9" fill="url(#cloud-gradient)" opacity="0.85"/>
  <ellipse cx="52" cy="26" rx="11" ry="8" fill="url(#cloud-gradient)" opacity="0.85"/>

  <!-- 별들 -->
  <circle cx="48" cy="12" r="1.5" fill="#FFD700">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="56" cy="16" r="1" fill="#FFD700">
    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="52" cy="44" r="1.2" fill="#FFFFFF">
    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="12" cy="48" r="1" fill="#FFFFFF">
    <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.2s" repeatCount="indefinite"/>
  </circle>

  <!-- 무지개 (약속) -->
  <path d="M 8 52 Q 32 40 56 52"
        stroke="#FF6B9D" stroke-width="2" fill="none" opacity="0.6"/>
  <path d="M 8 54 Q 32 42 56 54"
        stroke="#FFD93D" stroke-width="2" fill="none" opacity="0.6"/>
  <path d="M 8 56 Q 32 44 56 56"
        stroke="#6BCB77" stroke-width="2" fill="none" opacity="0.6"/>
</svg>`,

  // 6. וְאֵת (그리고 ~을/를)
  'וְאֵת': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="and-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00BCD4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#009688;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 연결 고리 (and의 상징) -->
  <path d="M 20 24 Q 20 16 28 16 Q 36 16 36 24 Q 36 32 28 32"
        stroke="url(#and-gradient)" stroke-width="4" fill="none"
        stroke-linecap="round"/>
  <path d="M 28 32 Q 28 40 36 40 Q 44 40 44 32 Q 44 24 36 24"
        stroke="url(#and-gradient)" stroke-width="4" fill="none"
        stroke-linecap="round"/>

  <!-- 연결점 -->
  <circle cx="28" cy="32" r="3" fill="url(#and-gradient)"/>

  <!-- 흐르는 선 (연속성) -->
  <path d="M 12 48 Q 32 44 52 48"
        stroke="url(#and-gradient)" stroke-width="2" fill="none"
        opacity="0.5" stroke-dasharray="4,4">
    <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite"/>
  </path>
</svg>`,

  // 7. הָאָרֶץ (땅)
  'הָאָרֶץ': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="earth-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#A0522D;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
    </radialGradient>
    <linearGradient id="grass-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#90EE90;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#228B22;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 땅 (구형) -->
  <circle cx="32" cy="36" r="22" fill="url(#earth-gradient)"/>

  <!-- 대륙 모양 -->
  <path d="M 20 28 Q 24 24 30 26 Q 34 28 32 32 Q 30 36 26 34 Q 22 32 20 28"
        fill="#8B7355" opacity="0.6"/>
  <path d="M 36 30 Q 40 28 44 30 Q 46 34 44 38 Q 40 40 38 36 Q 36 34 36 30"
        fill="#A0826D" opacity="0.6"/>

  <!-- 풀 -->
  <path d="M 18 46 L 20 42 L 22 46" stroke="url(#grass-gradient)" stroke-width="2" fill="none"/>
  <path d="M 26 48 L 28 44 L 30 48" stroke="url(#grass-gradient)" stroke-width="2" fill="none"/>
  <path d="M 34 48 L 36 44 L 38 48" stroke="url(#grass-gradient)" stroke-width="2" fill="none"/>
  <path d="M 42 46 L 44 42 L 46 46" stroke="url(#grass-gradient)" stroke-width="2" fill="none"/>

  <!-- 산 -->
  <path d="M 24 32 L 28 26 L 32 32" fill="#696969" opacity="0.7"/>
  <path d="M 36 34 L 40 28 L 44 34" fill="#808080" opacity="0.7"/>

  <!-- 나무 -->
  <rect x="30" y="38" width="2" height="6" fill="#8B4513"/>
  <circle cx="31" cy="38" r="3" fill="#228B22"/>
</svg>`
};

async function regenerateGenesis1_1_SVGs() {
  console.log('🎨 Regenerating artistic SVGs for Genesis 1:1...\n');

  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', 'genesis_1_1')
    .order('position', { ascending: true });

  if (error) {
    console.error('❌ Error fetching words:', error);
    return;
  }

  if (!words || words.length === 0) {
    console.log('⚠️  No words found');
    return;
  }

  console.log(`📊 Total words: ${words.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const word of words) {
    const newSvg = artisticSVGs[word.hebrew];

    if (!newSvg) {
      console.log(`⚠️  No SVG design for: ${word.hebrew}`);
      failCount++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('words')
      .update({ icon_svg: newSvg })
      .eq('id', word.id);

    if (updateError) {
      console.error(`❌ Failed to update ${word.hebrew}:`, updateError);
      failCount++;
    } else {
      console.log(`✅ Updated ${word.hebrew} (${word.meaning})`);
      successCount++;
    }
  }

  console.log('\n\n📈 Results:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📊 Total: ${words.length}`);
}

regenerateGenesis1_1_SVGs();
