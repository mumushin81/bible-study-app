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

// Batch 2: 20 more SVGs (MD 규격 준수)
const svgData: Record<string, string> = {
  // 11. 빛 (오르) - 황금빛 광선
  "빛": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="light-ray-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient><radialGradient id="light-core-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><circle cx="32" cy="32" r="12" fill="url(#light-core-1)" filter="drop-shadow(0 0 12px rgba(255, 215, 0, 0.9))"/><path d="M 32 4 L 34 20 L 32 20 Z M 32 60 L 34 44 L 32 44 Z M 4 32 L 20 34 L 20 32 Z M 60 32 L 44 34 L 44 32 Z" fill="url(#light-ray-1)" opacity="0.8"/><path d="M 12 12 L 24 24 M 52 52 L 40 40 M 12 52 L 24 40 M 52 12 L 40 24" stroke="url(#light-ray-1)" stroke-width="3" stroke-linecap="round" opacity="0.7" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>',

  // 12. 땅 (에레츠) - 브라운 구체
  "땅": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="earth-ground-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D2691E"/><stop offset="100%" stop-color="#8B4513"/></linearGradient><radialGradient id="earth-core-1"><stop offset="0%" stop-color="#CD853F"/><stop offset="100%" stop-color="#8B4513"/></radialGradient></defs><circle cx="32" cy="32" r="26" fill="url(#earth-ground-1)" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))"/><circle cx="32" cy="32" r="14" fill="url(#earth-core-1)" opacity="0.6"/><path d="M 10 28 Q 20 24 32 28 Q 44 32 54 28 M 12 40 Q 22 36 32 40 Q 42 44 52 40" stroke="#654321" stroke-width="2" fill="none" opacity="0.7"/></svg>',

  // 13. 아침 (보케르) - 황금 일출
  "아침": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="morning-sky-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFA500"/><stop offset="100%" stop-color="#FFD700"/></linearGradient><radialGradient id="morning-sun-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><rect x="0" y="32" width="64" height="32" fill="url(#morning-sky-1)" opacity="0.3"/><circle cx="32" cy="48" r="12" fill="url(#morning-sun-1)" filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))"/><path d="M 32 36 L 34 28 M 32 60 L 34 52 M 12 48 L 20 50 M 52 48 L 44 50" stroke="#FFD700" stroke-width="2" stroke-linecap="round" opacity="0.8" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>',

  // 14. 저녁 (에레브) - 보라빛 황혼
  "저녁": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="evening-sky-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#764ba2"/><stop offset="100%" stop-color="#667eea"/></linearGradient><radialGradient id="evening-sun-1"><stop offset="0%" stop-color="#FF8C00"/><stop offset="100%" stop-color="#e74c3c"/></radialGradient></defs><rect x="0" y="0" width="64" height="64" fill="url(#evening-sky-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"/><circle cx="8" cy="52" r="8" fill="url(#evening-sun-1)" filter="drop-shadow(0 0 6px rgba(231, 76, 60, 0.6))"/><path d="M 0 56 Q 16 52 32 56 Q 48 60 64 56" stroke="#FF8C00" stroke-width="2" fill="none" opacity="0.6"/></svg>',

  // 15. 그리고 보셨다 (바야르) - 눈 모양
  "그리고 보셨다": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="see-eye-1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#7B68EE"/></linearGradient><radialGradient id="see-pupil-1"><stop offset="0%" stop-color="#000000"/><stop offset="100%" stop-color="#2c3e50"/></radialGradient></defs><ellipse cx="32" cy="32" rx="28" ry="16" fill="url(#see-eye-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="10" fill="url(#see-pupil-1)"/><circle cx="32" cy="32" r="4" fill="#FFFFFF" opacity="0.9"/><path d="M 4 32 Q 32 20 60 32" stroke="#7B68EE" stroke-width="2" fill="none" opacity="0.6"/><path d="M 4 32 Q 32 44 60 32" stroke="#7B68EE" stroke-width="2" fill="none" opacity="0.6"/></svg>',

  // 16. 있으라, 되라 (예히) - 변화/존재
  "있으라, 되라": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="be-transform-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient><radialGradient id="be-center-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#667eea"/></radialGradient></defs><circle cx="32" cy="32" r="20" fill="url(#be-transform-1)" opacity="0.4" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="12" fill="url(#be-center-1)" opacity="0.6"/><path d="M 32 12 Q 40 20 32 32 Q 24 44 32 52" stroke="url(#be-transform-1)" stroke-width="3" fill="none" stroke-linecap="round" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>',

  // 17. 셋째 (쉴리쉬) - 숫자 3
  "셋째": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="third-num-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2ECC71"/><stop offset="100%" stop-color="#27AE60"/></linearGradient><radialGradient id="third-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#2ECC71"/></radialGradient></defs><circle cx="32" cy="32" r="26" fill="url(#third-glow-1)" opacity="0.3" filter="drop-shadow(0 4px 6px rgba(46, 204, 113, 0.5))"/><text x="32" y="44" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="url(#third-num-1)" text-anchor="middle" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))">3</text></svg>',

  // 18. 풀, 푸른 식물 (데쉐) - 초록 풀
  "풀, 푸른 식물": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grass-blade-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4CAF50"/><stop offset="100%" stop-color="#2ECC71"/></linearGradient><radialGradient id="grass-ground-1"><stop offset="0%" stop-color="#8B4513"/><stop offset="100%" stop-color="#654321"/></radialGradient></defs><ellipse cx="32" cy="56" rx="24" ry="6" fill="url(#grass-ground-1)" opacity="0.6"/><path d="M 20 56 Q 18 40 16 24 Q 18 28 20 32 Q 22 40 20 56" fill="url(#grass-blade-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><path d="M 32 56 Q 32 36 32 16 Q 34 24 32 32 Q 32 44 32 56" fill="url(#grass-blade-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><path d="M 44 56 Q 46 40 48 24 Q 46 28 44 32 Q 42 40 44 56" fill="url(#grass-blade-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>',

  // 19. 물들 (하마임) - 파란 물결
  "물들": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="water-wave-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#3498db"/></linearGradient><radialGradient id="water-drop-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#4A90E2"/></radialGradient></defs><path d="M 0 32 Q 16 24 32 32 Q 48 40 64 32 L 64 64 L 0 64 Z" fill="url(#water-wave-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><path d="M 0 40 Q 16 32 32 40 Q 48 48 64 40" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.4"/><circle cx="32" cy="20" r="6" fill="url(#water-drop-1)" opacity="0.7"/></svg>',

  // 20. 나누는 것, 구분하는 것 (마브딜) - 분할선
  "나누는 것, 구분하는 것": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="divide-line-1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#7B68EE"/><stop offset="100%" stop-color="#667eea"/></linearGradient><radialGradient id="divide-point-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#7B68EE"/></radialGradient></defs><rect x="0" y="0" width="28" height="64" fill="#4A90E2" opacity="0.2"/><rect x="36" y="0" width="28" height="64" fill="#e74c3c" opacity="0.2"/><line x1="32" y1="8" x2="32" y2="56" stroke="url(#divide-line-1)" stroke-width="4" stroke-linecap="round" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="6" fill="url(#divide-point-1)" filter="drop-shadow(0 0 6px rgba(123, 104, 238, 0.7))"/></svg>',

  // 21. 그리고 부르셨다 (바이크라) - 말하는 입
  "그리고 부르셨다": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="call-mouth-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#e74c3c"/><stop offset="100%" stop-color="#c0392b"/></linearGradient><radialGradient id="call-sound-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><ellipse cx="32" cy="40" rx="20" ry="12" fill="url(#call-mouth-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><ellipse cx="32" cy="38" rx="16" ry="8" fill="#FFFFFF" opacity="0.3"/><path d="M 52 36 Q 56 32 60 36 M 54 40 Q 58 36 62 40" stroke="url(#call-sound-1)" stroke-width="2" stroke-linecap="round" opacity="0.8"/><circle cx="20" cy="28" r="3" fill="#2c3e50"/><circle cx="44" cy="28" r="3" fill="#2c3e50"/></svg>',

  // 22. 큰, 거대한 (하그돌림) - 큰 원
  "큰, 거대한": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="large-circle-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF8C00"/><stop offset="100%" stop-color="#FFA500"/></linearGradient><radialGradient id="large-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FF8C00"/></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#large-glow-1)" opacity="0.3" filter="drop-shadow(0 4px 8px rgba(255, 140, 0, 0.6))"/><circle cx="32" cy="32" r="22" fill="url(#large-circle-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="32" r="8" fill="#FFFFFF" opacity="0.5"/></svg>',

  // 23. 광명체들, 빛을 내는 것들 (므오로트) - 여러 별
  "광명체들, 빛을 내는 것들": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lights-star-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient><radialGradient id="lights-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFD700"/></radialGradient></defs><circle cx="20" cy="20" r="8" fill="url(#lights-glow-1)" filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"/><circle cx="44" cy="24" r="6" fill="url(#lights-glow-1)" filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"/><circle cx="32" cy="44" r="10" fill="url(#lights-glow-1)" filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"/><path d="M 20 12 L 22 18 L 28 20 L 22 22 L 20 28 L 18 22 L 12 20 L 18 18 Z" fill="url(#lights-star-1)" opacity="0.7"/><path d="M 44 16 L 45 22 L 51 24 L 45 26 L 44 32 L 43 26 L 37 24 L 43 22 Z" fill="url(#lights-star-1)" opacity="0.7"/></svg>',

  // 24. 하나님의 형상대로 (베첼렘 엘로힘) - 인간 실루엣 + 빛
  "하나님의 형상대로": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="image-body-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#7B68EE"/><stop offset="100%" stop-color="#667eea"/></linearGradient><radialGradient id="image-light-1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></radialGradient></defs><ellipse cx="32" cy="18" rx="8" ry="10" fill="url(#image-body-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><rect x="28" y="28" width="8" height="16" rx="2" fill="url(#image-body-1)"/><path d="M 28 32 L 20 44 M 36 32 L 44 44 M 28 44 L 24 56 M 36 44 L 40 56" stroke="url(#image-body-1)" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="12" r="12" fill="url(#image-light-1)" opacity="0.4" filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))"/></svg>',

  // 25. 물과 물 사이 (벤 마임 라마임) - 두 물결
  "물과 물 사이": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="between-water-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#3498db"/></linearGradient><linearGradient id="between-space-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E0E7FF"/><stop offset="100%" stop-color="#C7D2FE"/></linearGradient></defs><path d="M 0 16 Q 16 12 32 16 Q 48 20 64 16 L 64 24 Q 48 28 32 24 Q 16 20 0 24 Z" fill="url(#between-water-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><rect x="0" y="24" width="64" height="16" fill="url(#between-space-1)" opacity="0.6"/><path d="M 0 40 Q 16 36 32 40 Q 48 44 64 40 L 64 48 Q 48 52 32 48 Q 16 44 0 48 Z" fill="url(#between-water-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>',

  // 26. 좋았다, 선하다 (키 토브) - 체크마크/하트
  "좋았다, 선하다": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="good-check-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2ECC71"/><stop offset="100%" stop-color="#27AE60"/></linearGradient><radialGradient id="good-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#2ECC71"/></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#good-glow-1)" opacity="0.3" filter="drop-shadow(0 4px 6px rgba(46, 204, 113, 0.5))"/><path d="M 16 32 L 28 44 L 52 20" stroke="url(#good-check-1)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/></svg>',

  // 27. 생육하라 (페루) - 확장/성장 화살표
  "생육하라": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="multiply-arrow-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2ECC71"/><stop offset="100%" stop-color="#27AE60"/></linearGradient><radialGradient id="multiply-center-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#2ECC71"/></radialGradient></defs><circle cx="32" cy="32" r="8" fill="url(#multiply-center-1)" filter="drop-shadow(0 0 6px rgba(46, 204, 113, 0.7))"/><path d="M 32 8 L 28 20 L 36 20 Z M 32 56 L 28 44 L 36 44 Z M 8 32 L 20 28 L 20 36 Z M 56 32 L 44 28 L 44 36 Z" fill="url(#multiply-arrow-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><path d="M 14 14 L 24 24 M 50 50 L 40 40 M 50 14 L 40 24 M 14 50 L 24 40" stroke="url(#multiply-arrow-1)" stroke-width="3" stroke-linecap="round" opacity="0.6"/></svg>',

  // 28. 남자 (자카르) - 남성 심볼
  "남자": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="male-circle-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4A90E2"/><stop offset="100%" stop-color="#3498db"/></linearGradient><radialGradient id="male-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#4A90E2"/></radialGradient></defs><circle cx="28" cy="36" r="16" fill="url(#male-circle-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="28" cy="36" r="8" fill="url(#male-glow-1)" opacity="0.6"/><line x1="40" y1="24" x2="52" y2="12" stroke="url(#male-circle-1)" stroke-width="4" stroke-linecap="round" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><path d="M 52 12 L 44 12 L 44 14 L 50 14 L 50 20 L 52 20 Z" fill="url(#male-circle-1)"/></svg>',

  // 29. 그리고 여자 (우네케바) - 여성 심볼
  "그리고 여자": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="female-circle-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF69B4"/><stop offset="100%" stop-color="#FF1493"/></linearGradient><radialGradient id="female-glow-1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FF69B4"/></radialGradient></defs><circle cx="32" cy="28" r="14" fill="url(#female-circle-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><circle cx="32" cy="28" r="7" fill="url(#female-glow-1)" opacity="0.6"/><line x1="32" y1="42" x2="32" y2="56" stroke="url(#female-circle-1)" stroke-width="4" stroke-linecap="round" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><line x1="24" y1="52" x2="40" y2="52" stroke="url(#female-circle-1)" stroke-width="4" stroke-linecap="round"/></svg>',

  // 30. 사람, 인간 (아담) - 인간 형태
  "사람, 인간": '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="human-body-1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D2691E"/><stop offset="100%" stop-color="#8B4513"/></linearGradient><radialGradient id="human-head-1"><stop offset="0%" stop-color="#CD853F"/><stop offset="100%" stop-color="#D2691E"/></radialGradient></defs><circle cx="32" cy="16" r="8" fill="url(#human-head-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><ellipse cx="32" cy="34" rx="10" ry="14" fill="url(#human-body-1)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"/><path d="M 22 28 L 14 40 M 42 28 L 50 40" stroke="url(#human-body-1)" stroke-width="4" stroke-linecap="round"/><path d="M 26 48 L 24 60 M 38 48 L 40 60" stroke="url(#human-body-1)" stroke-width="4" stroke-linecap="round"/></svg>'
};

async function updateSVGs() {
  console.log('🎨 Batch 2: 20개 SVG 업데이트 시작...\n');

  let successCount = 0;
  let failCount = 0;
  let totalRecords = 0;

  for (const [meaning, svg] of Object.entries(svgData)) {
    try {
      console.log(`📝 "${meaning}" 업데이트 중...`);

      const { error, count } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('meaning', meaning)
        .select('id', { count: 'exact' });

      if (error) {
        console.error(`❌ "${meaning}" 업데이트 실패:`, error.message);
        failCount++;
      } else {
        console.log(`✅ "${meaning}" 업데이트 성공 (${count || 0}개 레코드)`);
        successCount++;
        totalRecords += (count || 0);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`❌ "${meaning}" 처리 중 오류:`, err);
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 성공: ${successCount}개 단어`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`📊 총 업데이트된 레코드: ${totalRecords}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

updateSVGs().catch(console.error);
