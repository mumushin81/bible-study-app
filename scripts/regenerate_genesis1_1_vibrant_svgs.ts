import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// 훨씬 더 화려하고 극적인 SVG 디자인
const vibrantSVGs: Record<string, string> = {
  // 1. בְּרֵאשִׁית (태초에, 처음에) - 빅뱅, 우주 탄생
  'בְּרֵאשִׁית': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="genesis-big-bang" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="20%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#FF6B6B;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#4ECDC4;stop-opacity:1" />
      <stop offset="80%" style="stop-color:#9B59B6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </radialGradient>
    <filter id="genesis-explosion-glow">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 폭발하는 우주 (빅뱅) -->
  <circle cx="32" cy="32" r="30" fill="url(#genesis-big-bang)" opacity="0.9"/>

  <!-- 중앙 폭발점 -->
  <circle cx="32" cy="32" r="8" fill="#FFFFFF" filter="url(#genesis-explosion-glow)">
    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
  </circle>

  <!-- 폭발 광선들 -->
  <line x1="32" y1="32" x2="32" y2="4" stroke="#FFD700" stroke-width="3" opacity="0.9" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="54" y2="10" stroke="#FF6B6B" stroke-width="3" opacity="0.9" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="60" y2="32" stroke="#4ECDC4" stroke-width="3" opacity="0.9" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="54" y2="54" stroke="#9B59B6" stroke-width="3" opacity="0.9" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="32" y2="60" stroke="#FFD700" stroke-width="3" opacity="0.9" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="10" y2="54" stroke="#FF6B6B" stroke-width="3" opacity="0.9" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="4" y2="32" stroke="#4ECDC4" stroke-width="3" opacity="0.9" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="10" y2="10" stroke="#9B59B6" stroke-width="3" opacity="0.9" stroke-linecap="round"/>

  <!-- 회전하는 별들 -->
  <g>
    <circle cx="32" cy="8" r="3" fill="#FFD700">
      <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite"/>
    </circle>
    <circle cx="56" cy="32" r="3" fill="#FF6B6B">
      <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite"/>
    </circle>
    <circle cx="8" cy="32" r="3" fill="#4ECDC4">
      <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite"/>
    </circle>
  </g>
</svg>`,

  // 2. בָּרָא (창조하셨다) - 신의 손이 세계를 만드는 모습
  'בָּרָא': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="create-power" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667EEA;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#764BA2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F093FB;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="create-energy" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B6B;stop-opacity:0" />
    </radialGradient>
    <filter id="create-magic-glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 에너지 배경 -->
  <circle cx="32" cy="40" r="20" fill="url(#create-energy)" opacity="0.5">
    <animate attributeName="r" values="20;25;20" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- 신의 손 (위에서) -->
  <path d="M 24 8 Q 28 4 32 4 Q 36 4 40 8 L 38 14 L 32 18 L 26 14 Z"
        fill="url(#create-power)" opacity="0.9" filter="url(#create-magic-glow)"/>

  <!-- 마법 광선 (손에서 나오는) -->
  <line x1="32" y1="18" x2="32" y2="32" stroke="#FFD700" stroke-width="4" opacity="0.8">
    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
  </line>

  <!-- 창조되는 구체 -->
  <circle cx="32" cy="40" r="16" fill="url(#create-power)" opacity="0.8" filter="url(#create-magic-glow)">
    <animate attributeName="r" values="14;16;14" dur="2s" repeatCount="indefinite"/>
  </circle>

  <!-- 회전하는 입자들 -->
  <g opacity="0.9">
    <circle cx="16" cy="40" r="2" fill="#FFD700">
      <animateTransform attributeName="transform" type="rotate" from="0 32 40" to="360 32 40" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="48" cy="40" r="2" fill="#FF6B6B">
      <animateTransform attributeName="transform" type="rotate" from="0 32 40" to="360 32 40" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="32" cy="24" r="2" fill="#4ECDC4">
      <animateTransform attributeName="transform" type="rotate" from="0 32 40" to="360 32 40" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="32" cy="56" r="2" fill="#9B59B6">
      <animateTransform attributeName="transform" type="rotate" from="0 32 40" to="360 32 40" dur="4s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- 에너지 파동 -->
  <circle cx="32" cy="40" r="18" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.6">
    <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>`,

  // 3. אֱלֹהִים (하나님) - 삼위일체, 성령의 불꽃
  'אֱלֹהִים': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="holy-light" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="30%" style="stop-color:#FFE57F;stop-opacity:1" />
      <stop offset="70%" style="stop-color:#FFD740;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA726;stop-opacity:0.8" />
    </radialGradient>
    <filter id="divine-radiance">
      <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 신성한 빛 -->
  <circle cx="32" cy="32" r="28" fill="url(#holy-light)" opacity="0.4">
    <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="32" cy="32" r="20" fill="url(#holy-light)" opacity="0.6">
    <animate attributeName="opacity" values="0.5;0.7;0.5" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- 중앙 핵심 -->
  <circle cx="32" cy="32" r="10" fill="url(#holy-light)" filter="url(#divine-radiance)"/>

  <!-- 삼위일체 상징 (세 개의 원이 교차) -->
  <circle cx="32" cy="24" r="8" fill="none" stroke="#FFD700" stroke-width="3" opacity="0.8"/>
  <circle cx="26" cy="34" r="8" fill="none" stroke="#FFD700" stroke-width="3" opacity="0.8"/>
  <circle cx="38" cy="34" r="8" fill="none" stroke="#FFD700" stroke-width="3" opacity="0.8"/>

  <!-- 왕관 -->
  <path d="M 20 12 L 24 18 L 28 14 L 32 18 L 36 14 L 40 18 L 44 12 L 42 22 L 22 22 Z"
        fill="url(#crown-gold)" opacity="0.95" filter="url(#divine-radiance)"/>

  <!-- 다이아몬드 (왕관 위) -->
  <path d="M 32 8 L 30 12 L 34 12 Z" fill="#FFFFFF" opacity="0.95"/>

  <!-- 빛의 광선 (12방향) -->
  <g opacity="0.7">
    <line x1="32" y1="32" x2="32" y2="6" stroke="#FFD700" stroke-width="2"/>
    <line x1="32" y1="32" x2="50" y2="14" stroke="#FFD700" stroke-width="2"/>
    <line x1="32" y1="32" x2="58" y2="32" stroke="#FFD700" stroke-width="2"/>
    <line x1="32" y1="32" x2="50" y2="50" stroke="#FFD700" stroke-width="2"/>
    <line x1="32" y1="32" x2="32" y2="58" stroke="#FFD700" stroke-width="2"/>
    <line x1="32" y1="32" x2="14" y2="50" stroke="#FFD700" stroke-width="2"/>
    <line x1="32" y1="32" x2="6" y2="32" stroke="#FFD700" stroke-width="2"/>
    <line x1="32" y1="32" x2="14" y2="14" stroke="#FFD700" stroke-width="2"/>
  </g>
</svg>`,

  // 4. אֵת - 화살표와 타겟
  'אֵת': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5AB9EA;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="target-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8E53;stop-opacity:1" />
    </radialGradient>
  </defs>

  <!-- 타겟 (과녁) -->
  <circle cx="50" cy="32" r="12" fill="url(#target-gradient)" opacity="0.3"/>
  <circle cx="50" cy="32" r="9" fill="url(#target-gradient)" opacity="0.5"/>
  <circle cx="50" cy="32" r="6" fill="url(#target-gradient)" opacity="0.7"/>
  <circle cx="50" cy="32" r="3" fill="url(#target-gradient)" opacity="1"/>

  <!-- 움직이는 화살표 -->
  <g>
    <line x1="10" y1="32" x2="42" y2="32" stroke="url(#arrow-gradient)" stroke-width="4"/>
    <path d="M 42 32 L 36 28 L 36 36 Z" fill="url(#arrow-gradient)"/>
    <animateTransform attributeName="transform" type="translate" values="0,0; 8,0; 0,0" dur="2s" repeatCount="indefinite"/>
  </g>

  <!-- 에너지 웨이브 -->
  <circle cx="50" cy="32" r="14" fill="none" stroke="#4A90E2" stroke-width="2" opacity="0.5">
    <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>`,

  // 5. הַשָּׁמַיִם (하늘들) - 역동적인 하늘
  'הַשָּׁמַיִם': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#00D4FF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E3A8A;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="sun-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFEB3B;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFC107;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF9800;stop-opacity:0.8" />
    </radialGradient>
    <radialGradient id="cloud-white" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E3F2FD;stop-opacity:0.9" />
    </radialGradient>
  </defs>

  <!-- 하늘 배경 -->
  <rect width="64" height="64" fill="url(#sky-gradient)"/>

  <!-- 태양 -->
  <circle cx="48" cy="16" r="10" fill="url(#sun-gradient)">
    <animate attributeName="r" values="10;12;10" dur="4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="48" cy="16" r="12" fill="url(#sun-gradient)" opacity="0.3">
    <animate attributeName="r" values="12;16;12" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite"/>
  </circle>

  <!-- 구름들 (움직이는) -->
  <g opacity="0.95">
    <ellipse cx="18" cy="20" rx="12" ry="6" fill="url(#cloud-white)">
      <animate attributeName="cx" values="18;22;18" dur="6s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="26" cy="18" rx="10" ry="5" fill="url(#cloud-white)">
      <animate attributeName="cx" values="26;30;26" dur="6s" repeatCount="indefinite"/>
    </ellipse>
  </g>

  <g opacity="0.9">
    <ellipse cx="38" cy="36" rx="14" ry="7" fill="url(#cloud-white)">
      <animate attributeName="cx" values="38;34;38" dur="8s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="46" cy="34" rx="11" ry="6" fill="url(#cloud-white)">
      <animate attributeName="cx" values="46;42;46" dur="8s" repeatCount="indefinite"/>
    </ellipse>
  </g>

  <!-- 별들 (반짝이는) -->
  <circle cx="12" cy="12" r="2" fill="#FFEB3B">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="56" cy="44" r="1.5" fill="#FFF">
    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="10" cy="50" r="1.8" fill="#FFEB3B">
    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="52" cy="52" r="1.3" fill="#FFF">
    <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.2s" repeatCount="indefinite"/>
  </circle>

  <!-- 새 (날아가는) -->
  <path d="M 16 44 Q 18 42 20 44 M 18 43 L 18 45" stroke="#34495E" stroke-width="1" fill="none" opacity="0.7">
    <animateTransform attributeName="transform" type="translate" values="0,0; 32,0; 0,0" dur="12s" repeatCount="indefinite"/>
  </path>
</svg>`,

  // 6. וְאֵת - 연결
  'וְאֵת': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="link-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#11998E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#38EF7D;stop-opacity:1" />
    </linearGradient>
    <filter id="link-glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 연결된 고리 체인 -->
  <circle cx="18" cy="28" r="10" fill="none" stroke="url(#link-gradient)" stroke-width="4" filter="url(#link-glow)"/>
  <circle cx="32" cy="32" r="10" fill="none" stroke="url(#link-gradient)" stroke-width="4" filter="url(#link-glow)"/>
  <circle cx="46" cy="28" r="10" fill="none" stroke="url(#link-gradient)" stroke-width="4" filter="url(#link-glow)"/>

  <!-- 연결선 -->
  <line x1="22" y1="24" x2="28" y2="28" stroke="url(#link-gradient)" stroke-width="4" filter="url(#link-glow)"/>
  <line x1="36" y1="28" x2="42" y2="24" stroke="url(#link-gradient)" stroke-width="4" filter="url(#link-glow)"/>

  <!-- 흐르는 에너지 -->
  <circle cx="18" cy="28" r="3" fill="#38EF7D">
    <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
    <animateMotion path="M 18,28 L 32,32 L 46,28" dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- + 기호 (and의 의미) -->
  <line x1="32" y1="48" x2="32" y2="56" stroke="url(#link-gradient)" stroke-width="3" stroke-linecap="round"/>
  <line x1="28" y1="52" x2="36" y2="52" stroke="url(#link-gradient)" stroke-width="3" stroke-linecap="round"/>
</svg>`,

  // 7. הָאָרֶץ (땅) - 살아있는 지구
  'הָאָרֶץ': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="earth-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#A0522D;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
    </radialGradient>
    <linearGradient id="grass-vibrant" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#7FFF00;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#228B22;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#8B8680;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4A4A4A;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 지구 -->
  <circle cx="32" cy="34" r="24" fill="url(#earth-core)"/>

  <!-- 대륙들 (더 크고 명확하게) -->
  <path d="M 18 26 Q 22 20 28 22 Q 32 24 34 28 Q 32 32 28 32 Q 24 30 20 28 Z"
        fill="#8B7355" opacity="0.8"/>
  <path d="M 36 26 Q 42 24 46 28 Q 48 32 46 36 Q 42 38 38 36 Q 36 32 36 26 Z"
        fill="#A0826D" opacity="0.8"/>
  <path d="M 22 38 Q 26 36 30 38 Q 32 42 28 44 Q 24 42 22 38 Z"
        fill="#8B7355" opacity="0.7"/>

  <!-- 산맥 -->
  <path d="M 20 30 L 24 22 L 28 30" fill="url(#mountain-gradient)" opacity="0.9"/>
  <path d="M 36 32 L 40 24 L 44 32" fill="url(#mountain-gradient)" opacity="0.9"/>
  <path d="M 28 32 L 30 28 L 32 32" fill="url(#mountain-gradient)" opacity="0.85"/>

  <!-- 눈 덮인 산 정상 -->
  <path d="M 24 22 L 22 24 L 26 24 Z" fill="#FFFFFF" opacity="0.9"/>
  <path d="M 40 24 L 38 26 L 42 26 Z" fill="#FFFFFF" opacity="0.9"/>

  <!-- 숲 (나무들) -->
  <g opacity="0.9">
    <rect x="18" y="42" width="3" height="8" fill="#8B4513"/>
    <path d="M 19.5 42 L 16 38 L 23 38 Z" fill="url(#grass-vibrant)"/>

    <rect x="26" y="44" width="2.5" height="6" fill="#8B4513"/>
    <path d="M 27.25 44 L 24.5 41 L 30 41 Z" fill="url(#grass-vibrant)"/>

    <rect x="34" y="43" width="3" height="7" fill="#8B4513"/>
    <path d="M 35.5 43 L 32 39 L 39 39 Z" fill="url(#grass-vibrant)"/>

    <rect x="42" y="45" width="2.5" height="6" fill="#8B4513"/>
    <path d="M 43.25 45 L 40.5 42 L 46 42 Z" fill="url(#grass-vibrant)"/>
  </g>

  <!-- 풀 (흔들리는) -->
  <path d="M 14 52 L 16 48 L 18 52" stroke="url(#grass-vibrant)" stroke-width="2" fill="none">
    <animateTransform attributeName="transform" type="rotate" values="0 16 50; 5 16 50; 0 16 50; -5 16 50; 0 16 50" dur="3s" repeatCount="indefinite"/>
  </path>
  <path d="M 48 52 L 50 48 L 52 52" stroke="url(#grass-vibrant)" stroke-width="2" fill="none">
    <animateTransform attributeName="transform" type="rotate" values="0 50 50; -5 50 50; 0 50 50; 5 50 50; 0 50 50" dur="3.5s" repeatCount="indefinite"/>
  </path>
</svg>`
};

async function regenerateVibrantSVGs() {
  console.log('🎨💥 Regenerating VIBRANT artistic SVGs for Genesis 1:1...\n');

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
    const newSvg = vibrantSVGs[word.hebrew];

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
      console.log(`✅ Updated ${word.hebrew} (${word.meaning}) - ${newSvg.length} chars`);
      successCount++;
    }
  }

  console.log('\n\n📈 Results:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📊 Total: ${words.length}`);
  console.log('\n🔄 Please hard refresh your browser (Cmd+Shift+R / Ctrl+Shift+R)');
}

regenerateVibrantSVGs();
