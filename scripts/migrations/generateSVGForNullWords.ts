import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface WordToFix {
  id: string;
  hebrew: string;
  meaning: string;
  grammar: string;
}

// Generate meaning-based SVG icons following Eden Guidelines
function generateMeaningBasedSVG(word: WordToFix, index: number): string {
  const meaning = word.meaning.toLowerCase();
  const grammar = word.grammar.toLowerCase();
  const gradientId = `${word.hebrew.replace(/[^a-zA-Z0-9]/g, '')}-${index}`;

  // Color selection based on meaning
  function getColorByMeaning(text: string): { primary: string; secondary: string } {
    // 신성/하나님 관련 - Gold
    if (text.includes('하나님') || text.includes('여호와') || text.includes('주')) {
      return { primary: '#FFD700', secondary: '#FFA500' };
    }
    // 생명/탄생 - Red/Pink
    if (text.includes('낳') || text.includes('생명') || text.includes('태어') || text.includes('아들') || text.includes('딸')) {
      return { primary: '#e74c3c', secondary: '#c0392b' };
    }
    // 시간/날짜 - Blue
    if (text.includes('날') || text.includes('해') || text.includes('년') || text.includes('때')) {
      return { primary: '#4A90E2', secondary: '#357ABD' };
    }
    // 장소/땅 - Brown
    if (text.includes('땅') || text.includes('곳') || text.includes('성') || text.includes('집')) {
      return { primary: '#8B4513', secondary: '#654321' };
    }
    // 사람/관계 - Orange
    if (text.includes('사람') || text.includes('형제') || text.includes('아내') || text.includes('남편')) {
      return { primary: '#FF6B6B', secondary: '#EE5A52' };
    }
    // 자연/물 - Cyan
    if (text.includes('물') || text.includes('바다') || text.includes('강') || text.includes('비')) {
      return { primary: '#00CED1', secondary: '#20B2AA' };
    }
    // 빛/불 - Yellow
    if (text.includes('빛') || text.includes('불') || text.includes('별')) {
      return { primary: '#FFD700', secondary: '#FFC700' };
    }
    // 식물/나무 - Green
    if (text.includes('나무') || text.includes('씨') || text.includes('열매') || text.includes('풀')) {
      return { primary: '#2ecc71', secondary: '#27ae60' };
    }
    // 동물 - Purple
    if (text.includes('짐승') || text.includes('새') || text.includes('물고기')) {
      return { primary: '#9b59b6', secondary: '#8e44ad' };
    }
    // 말/언어 - Indigo
    if (text.includes('말') || text.includes('이름') || text.includes('부르')) {
      return { primary: '#5C6BC0', secondary: '#3F51B5' };
    }
    // Default - Purple
    return { primary: '#7B68EE', secondary: '#6A5ACD' };
  }

  const colors = getColorByMeaning(meaning);

  // 숫자/수량
  if (meaning.match(/\d+/) || meaning.includes('모든') || meaning.includes('전체')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1"/><stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1"/></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><text x="32" y="38" font-size="20" font-weight="bold" text-anchor="middle" fill="white">#</text></svg>`;
  }

  // 시간/날
  if (meaning.includes('날') || meaning.includes('해') || meaning.includes('년') || meaning.includes('때')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFD700;stop-opacity:1"/><stop offset="100%" style="stop-color:#FFA500;stop-opacity:1"/></linearGradient></defs><circle cx="32" cy="32" r="16" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="32" r="20" fill="none" stroke="${colors.primary}" stroke-width="2" opacity="0.5"/></svg>`;
  }

  // 생명/탄생
  if (meaning.includes('낳') || meaning.includes('생명') || meaning.includes('태어') || meaning.includes('아들') || meaning.includes('딸')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF69B4;stop-opacity:1"/><stop offset="100%" style="stop-color:#FF1493;stop-opacity:1"/></linearGradient></defs><path d="M32 20 C20 20 16 28 16 36 C16 44 24 52 32 52 C40 52 48 44 48 36 C48 28 44 20 32 20 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="30" r="4" fill="white" opacity="0.8"/></svg>`;
  }

  // 말하다/부르다/이름
  if (meaning.includes('말') || meaning.includes('부르') || meaning.includes('이름')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#5C6BC0;stop-opacity:1"/><stop offset="100%" style="stop-color:#3F51B5;stop-opacity:1"/></linearGradient></defs><path d="M16 32 L24 24 L24 40 Z M28 24 L36 24 L36 40 L28 40 Z M40 24 L48 32 L40 40 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/></svg>`;
  }

  // 보다/듣다 (감각)
  if (meaning.includes('보') || meaning.includes('듣') || meaning.includes('보이')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1"/><stop offset="100%" style="stop-color:#357ABD;stop-opacity:1"/></linearGradient></defs><ellipse cx="32" cy="32" rx="20" ry="12" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="32" r="6" fill="white" opacity="0.9"/><circle cx="32" cy="32" r="3" fill="#1a1a1a"/></svg>`;
  }

  // 땅/장소
  if (meaning.includes('땅') || meaning.includes('곳') || meaning.includes('성')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#8B4513;stop-opacity:1"/><stop offset="100%" style="stop-color:#654321;stop-opacity:1"/></linearGradient></defs><rect x="12" y="28" width="40" height="24" rx="2" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><rect x="20" y="20" width="24" height="8" fill="${colors.primary}" opacity="0.8"/></svg>`;
  }

  // 물/바다
  if (meaning.includes('물') || meaning.includes('바다') || meaning.includes('강')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#00CED1;stop-opacity:1"/><stop offset="100%" style="stop-color:#20B2AA;stop-opacity:1"/></linearGradient></defs><path d="M8 32 Q16 24 24 32 T40 32 T56 32 L56 48 L8 48 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><path d="M8 36 Q16 28 24 36 T40 36 T56 36" fill="none" stroke="white" stroke-width="2" opacity="0.5"/></svg>`;
  }

  // 사람/관계
  if (meaning.includes('사람') || meaning.includes('형제') || meaning.includes('아내') || meaning.includes('남편')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1"/><stop offset="100%" style="stop-color:#EE5A52;stop-opacity:1"/></linearGradient></defs><circle cx="32" cy="24" r="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><path d="M16 44 Q16 36 32 36 Q48 36 48 44 L48 52 L16 52 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/></svg>`;
  }

  // 나무/식물
  if (meaning.includes('나무') || meaning.includes('씨') || meaning.includes('열매') || meaning.includes('풀')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#2ecc71;stop-opacity:1"/><stop offset="100%" style="stop-color:#27ae60;stop-opacity:1"/></linearGradient></defs><circle cx="32" cy="24" r="16" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><rect x="28" y="36" width="8" height="20" rx="2" fill="#8B4513" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/></svg>`;
  }

  // 동물/새/짐승
  if (meaning.includes('짐승') || meaning.includes('새') || meaning.includes('물고기')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#9b59b6;stop-opacity:1"/><stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1"/></linearGradient></defs><ellipse cx="32" cy="32" rx="24" ry="16" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="24" cy="28" r="3" fill="white"/><circle cx="40" cy="28" r="3" fill="white"/></svg>`;
  }

  // 빛/별
  if (meaning.includes('빛') || meaning.includes('별') || meaning.includes('불')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${gradientId}"><stop offset="0%" style="stop-color:#FFD700;stop-opacity:1"/><stop offset="100%" style="stop-color:#FFA500;stop-opacity:0.6"/></radialGradient></defs><circle cx="32" cy="32" r="20" fill="url(#${gradientId})" filter="drop-shadow(0 2px 8px rgba(255,215,0,0.6))"/><circle cx="32" cy="32" r="12" fill="#FFFFFF" opacity="0.8"/></svg>`;
  }

  // 하늘/공중
  if (meaning.includes('하늘') || meaning.includes('공중') || meaning.includes('궁창')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1"/><stop offset="100%" style="stop-color:#4A90E2;stop-opacity:1"/></linearGradient></defs><rect x="8" y="12" width="48" height="40" rx="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="20" cy="24" r="4" fill="white" opacity="0.7"/><circle cx="40" cy="20" r="3" fill="white" opacity="0.6"/></svg>`;
  }

  // 동사 - 움직임 화살표
  if (grammar.includes('동사')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1"/><stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1"/></linearGradient></defs><path d="M12 32 L40 32 L40 24 L52 32 L40 40 L40 32" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/></svg>`;
  }

  // 명사 - 상자
  if (grammar.includes('명사')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1"/><stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1"/></linearGradient></defs><rect x="16" y="16" width="32" height="32" rx="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><rect x="20" y="20" width="24" height="24" rx="2" fill="none" stroke="white" stroke-width="2" opacity="0.5"/></svg>`;
  }

  // 접속사/전치사 - 연결 고리
  if (grammar.includes('접속사') || grammar.includes('전치사')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1"/><stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1"/></linearGradient></defs><circle cx="20" cy="32" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="44" cy="32" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><rect x="20" y="28" width="24" height="8" fill="${colors.primary}" opacity="0.7"/></svg>`;
  }

  // Default - 범용 아이콘
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1"/><stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1"/></linearGradient></defs><circle cx="32" cy="32" r="20" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="32" r="14" fill="none" stroke="white" stroke-width="2" opacity="0.6"/></svg>`;
}

async function generateSVGForNullWords() {
  console.log('🎯 NULL SVG 단어 조회 중...\n');

  // Query words with NULL icon_svg
  const { data: nullWords, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis')
    .is('icon_svg', null);

  if (error) {
    console.error('❌ 조회 에러:', error);
    return;
  }

  const total = nullWords?.length || 0;
  console.log(`📊 NULL icon_svg 단어: ${total}개\n`);

  if (total === 0) {
    console.log('✅ 모든 단어에 SVG가 있습니다!');
    return;
  }

  console.log('🚀 SVG 생성 및 업로드 시작...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < nullWords.length; i++) {
    const word = nullWords[i];
    const svg = generateMeaningBasedSVG(word, i);

    const { error: updateError } = await supabase
      .from('words')
      .update({ icon_svg: svg })
      .eq('id', word.id);

    if (updateError) {
      console.error(`❌ [${i + 1}/${total}] ${word.hebrew} 업로드 실패:`, updateError.message);
      errorCount++;
    } else {
      successCount++;
      if ((i + 1) % 50 === 0 || i === nullWords.length - 1) {
        console.log(`✅ [${i + 1}/${total}] ${word.hebrew} - ${word.meaning} (진행률: ${((i + 1) / total * 100).toFixed(1)}%)`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 결과:');
  console.log(`   총 처리: ${total}개`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${errorCount}개`);
  console.log(`   📈 성공률: ${(successCount / total * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

generateSVGForNullWords().catch(console.error);
