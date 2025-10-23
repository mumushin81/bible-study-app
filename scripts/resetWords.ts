import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbvekynhkfxdepsvvawg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidmVreW5oa2Z4ZGVwc3Z2YXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODc3MDEsImV4cCI6MjA1MjU2MzcwMX0.TrZWQxILJhp9D1K0pUHH3Pj1n6V7VQb0mJmBDcl7Dds';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAndInsert() {
  console.log('🗑️  모든 단어 데이터 삭제 중...\n');

  // 1. 모든 단어 삭제
  const { error: deleteError } = await supabase
    .from('words')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 행 삭제

  if (deleteError) {
    console.error('❌ 삭제 실패:', deleteError);
    process.exit(1);
  }

  console.log('✅ 모든 단어 삭제 완료\n');
  console.log('📝 창세기 1:1 단어 7개 입력 중...\n');

  // 2. 창세기 1:1 단어 7개 입력
  const words = [
    {
      verse_id: 'genesis_1_1',
      position: 1,
      hebrew: 'בְּרֵאשִׁית',
      meaning: '처음, 태초',
      ipa: 'bəreʃit',
      korean: '베레쉬트',
      letters: 'בְּ(be) + רֵא(re) + שִׁ(shi) + ית(t)',
      root: 'רֵאשִׁית (레쉬트)',
      grammar: '명사',
      emoji: '🌅',
      icon_svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bereshit-sun"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF6B35" /></radialGradient><linearGradient id="bereshit-sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FF6B9D" /><stop offset="100%" stop-color="#8B3A62" /></linearGradient></defs><rect width="64" height="64" fill="url(#bereshit-sky)" opacity="0.3" rx="8" /><circle cx="32" cy="28" r="12" fill="url(#bereshit-sun)" filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))" /><g stroke="#FFD700" stroke-width="2"><line x1="32" y1="12" x2="32" y2="18" /><line x1="44" y1="16" x2="40" y2="20" /><line x1="48" y1="28" x2="42" y2="28" /><line x1="44" y1="40" x2="40" y2="36" /><line x1="20" y1="16" x2="24" y2="20" /><line x1="16" y1="28" x2="22" y2="28" /><line x1="20" y1="40" x2="24" y2="36" /></g></svg>'
    },
    {
      verse_id: 'genesis_1_1',
      position: 2,
      hebrew: 'בָּרָא',
      meaning: '창조하셨다',
      ipa: 'baˈra',
      korean: '바라',
      letters: 'בָּ(ba) + רָ(ra) + א(ʾ)',
      root: 'ב-ר-א (bara)',
      grammar: '동사',
      emoji: '✨',
      icon_svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bara-center"><stop offset="0%" stop-color="#FFFFFF" /><stop offset="50%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF6B35" /></radialGradient><linearGradient id="bara-rays" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FFA500" /></linearGradient></defs><circle cx="32" cy="32" r="8" fill="url(#bara-center)" filter="drop-shadow(0 0 12px rgba(255, 215, 0, 1))" /><g fill="url(#bara-rays)" opacity="0.8"><polygon points="32,8 34,22 30,22" /><polygon points="56,32 42,34 42,30" /><polygon points="32,56 30,42 34,42" /><polygon points="8,32 22,30 22,34" /><polygon points="48,16 38,24 36,20" /><polygon points="48,48 36,44 38,40" /><polygon points="16,48 20,36 24,38" /><polygon points="16,16 24,20 20,24" /></g></svg>'
    },
    {
      verse_id: 'genesis_1_1',
      position: 3,
      hebrew: 'אֱלֹהִים',
      meaning: '하나님',
      ipa: 'ʔɛloˈhim',
      korean: '엘로힘',
      letters: 'אֱ(e) + לֹ(lo) + הִ(hi) + ים(m)',
      root: 'אֱלֹהַּ (엘로아)',
      grammar: '명사',
      emoji: '👑',
      icon_svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="elohim-crown" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF8C00" /></linearGradient><radialGradient id="elohim-glow"><stop offset="0%" stop-color="#FFFFFF" opacity="0.8" /><stop offset="100%" stop-color="#FFD700" opacity="0.2" /></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#elohim-glow)" /><path d="M 12 48 L 16 36 L 22 40 L 32 28 L 42 40 L 48 36 L 52 48 Z" fill="url(#elohim-crown)" stroke="#FF8C00" stroke-width="2" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" /><rect x="12" y="48" width="40" height="6" fill="url(#elohim-crown)" rx="1" /><circle cx="20" cy="38" r="2" fill="#FF1493" filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" /><circle cx="32" cy="32" r="2" fill="#FF1493" filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" /><circle cx="44" cy="38" r="2" fill="#FF1493" filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" /></svg>'
    },
    {
      verse_id: 'genesis_1_1',
      position: 4,
      hebrew: 'אֵת',
      meaning: '~을/를',
      ipa: 'ʔet',
      korean: '에트',
      letters: 'אֵ(e) + ת(t)',
      root: 'אֵת (에트)',
      grammar: '조사',
      emoji: '🎯',
      icon_svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="et-center"><stop offset="0%" stop-color="#FF6B9D" /><stop offset="100%" stop-color="#C41E3A" /></radialGradient><linearGradient id="et-arrow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FFA500" /></linearGradient></defs><circle cx="48" cy="32" r="10" fill="url(#et-center)" filter="drop-shadow(0 0 8px rgba(255, 107, 157, 0.8))" /><circle cx="48" cy="32" r="5" fill="#FFFFFF" opacity="0.8" /><path d="M 8 32 L 35 32" stroke="url(#et-arrow)" stroke-width="4" stroke-linecap="round" /><polygon points="35,32 28,28 28,36" fill="url(#et-arrow)" /></svg>'
    },
    {
      verse_id: 'genesis_1_1',
      position: 5,
      hebrew: 'הַשָּׁמַיִם',
      meaning: '하늘',
      ipa: 'haʃaˈmajim',
      korean: '하샤마임',
      letters: 'הַ(ha) + שָּׁ(sha) + מַ(ma) + יִם(yim)',
      root: 'שָׁמַיִם (샤마임)',
      grammar: '명사',
      emoji: '☁️',
      icon_svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="shamayim-sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#87CEEB" /><stop offset="100%" stop-color="#4682B4" /></linearGradient><radialGradient id="shamayim-cloud"><stop offset="0%" stop-color="#FFFFFF" /><stop offset="100%" stop-color="#E0E0E0" /></radialGradient></defs><rect width="64" height="64" fill="url(#shamayim-sky)" rx="8" /><ellipse cx="20" cy="28" rx="12" ry="8" fill="url(#shamayim-cloud)" opacity="0.9" /><ellipse cx="30" cy="26" rx="14" ry="9" fill="url(#shamayim-cloud)" opacity="0.95" /><ellipse cx="42" cy="28" rx="11" ry="7" fill="url(#shamayim-cloud)" opacity="0.9" /><ellipse cx="24" cy="45" rx="10" ry="6" fill="url(#shamayim-cloud)" opacity="0.85" /><ellipse cx="40" cy="47" rx="12" ry="7" fill="url(#shamayim-cloud)" opacity="0.9" /></svg>'
    },
    {
      verse_id: 'genesis_1_1',
      position: 6,
      hebrew: 'וְאֵת',
      meaning: '그리고 ~을/를',
      ipa: 'vəʔet',
      korean: '베에트',
      letters: 'וְ(ve) + אֵת(et)',
      root: 'ו (바브) + אֵת (에트)',
      grammar: '접속사',
      emoji: '➕',
      icon_svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="veet-plus" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9B59B6" /><stop offset="100%" stop-color="#8E44AD" /></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#veet-plus)" opacity="0.2" /><rect x="28" y="16" width="8" height="32" fill="url(#veet-plus)" rx="2" /><rect x="16" y="28" width="32" height="8" fill="url(#veet-plus)" rx="2" /></svg>'
    },
    {
      verse_id: 'genesis_1_1',
      position: 7,
      hebrew: 'הָאָרֶץ',
      meaning: '땅',
      ipa: 'haˈʔarɛts',
      korean: '하아레츠',
      letters: 'הָ(ha) + אָ(ʾa) + רֶ(re) + ץ(ts)',
      root: 'אֶרֶץ (에레츠)',
      grammar: '명사',
      emoji: '🌍',
      icon_svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="aretz-earth"><stop offset="0%" stop-color="#87CEEB" /><stop offset="70%" stop-color="#4682B4" /><stop offset="100%" stop-color="#2F4F4F" /></radialGradient><linearGradient id="aretz-land" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#90EE90" /><stop offset="100%" stop-color="#228B22" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="url(#aretz-earth)" filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))" /><path d="M 20 25 Q 25 20, 30 22 T 40 25 T 45 30 L 42 38 Q 35 40, 28 38 T 18 32 Z" fill="url(#aretz-land)" opacity="0.9" /><path d="M 35 15 Q 40 18, 42 22 L 38 28 Q 33 26, 30 22 Z" fill="url(#aretz-land)" opacity="0.85" /></svg>'
    }
  ];

  const { error: insertError } = await supabase
    .from('words')
    .insert(words);

  if (insertError) {
    console.error('❌ 입력 실패:', insertError);
    process.exit(1);
  }

  console.log('✅ 창세기 1:1 단어 7개 입력 완료\n');
  console.log('📋 입력된 단어:\n');

  words.forEach((w, i) => {
    console.log(`  ${i + 1}. ${w.hebrew} (${w.korean}) - ${w.meaning}`);
  });

  process.exit(0);
}

resetAndInsert().catch(console.error);
