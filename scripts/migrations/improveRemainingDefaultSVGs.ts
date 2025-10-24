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
  icon_svg: string | null;
}

// 색상 매핑 (동일)
function getColorByMeaning(meaning: string, grammar: string): { start: string; end: string } {
  const m = meaning.toLowerCase();
  const g = grammar?.toLowerCase() || '';

  if (m.includes('하나님') || m.includes('여호와')) return { start: '#FFD700', end: '#FFA500' };
  if (m.includes('사람') || m.includes('아버지')) return { start: '#8D6E63', end: '#D7CCC8' };
  if (m.includes('나무') || m.includes('식물')) return { start: '#66BB6A', end: '#A5D6A7' };
  if (m.includes('동물') || m.includes('짐승')) return { start: '#8D6E63', end: '#BCAAA4' };
  if (m.includes('물') || m.includes('바다')) return { start: '#42A5F5', end: '#90CAF9' };
  if (m.includes('하늘')) return { start: '#81D4FA', end: '#B3E5FC' };
  if (m.includes('빛') || m.includes('해')) return { start: '#FFD54F', end: '#FFF59D' };
  if (m.includes('어둠') || m.includes('밤')) return { start: '#546E7A', end: '#78909C' };
  if (m.includes('땅') || m.includes('흙')) return { start: '#A1887F', end: '#D7CCC8' };
  if (m.includes('날') || m.includes('시간')) return { start: '#BA68C8', end: '#E1BEE7' };
  if (m.includes('축복') || m.includes('좋')) return { start: '#FFB74D', end: '#FFE082' };
  if (m.includes('말') || m.includes('이르')) return { start: '#9575CD', end: '#B39DDB' };

  // 품사별 기본 색상
  if (g.includes('동사')) return { start: '#4CAF50', end: '#81C784' };
  if (g.includes('명사')) return { start: '#2196F3', end: '#64B5F6' };
  if (g.includes('형용사')) return { start: '#FF9800', end: '#FFB74D' };
  if (g.includes('전치사')) return { start: '#9C27B0', end: '#BA68C8' };
  if (g.includes('대명사')) return { start: '#00BCD4', end: '#4DD0E1' };

  return { start: '#9E9E9E', end: '#BDBDBD' };
}

// 확장된 SVG 생성 함수
function generateEnhancedSVG(word: WordToFix, index: number): string {
  const meaning = word.meaning.toLowerCase();
  const grammar = word.grammar?.toLowerCase() || '';
  const colors = getColorByMeaning(word.meaning, word.grammar);
  const gradientId = `grad-${word.hebrew.replace(/[^a-zA-Z0-9]/g, '')}-${index}`;

  // 숫자 감지
  const numberMatch = meaning.match(/(\d+)|하나|둘|셋|넷|다섯|여섯|일곱|여덟|아홉|십/);
  if (numberMatch) {
    let number = numberMatch[0];
    const numberMap: Record<string, string> = {
      '하나': '1', '둘': '2', '셋': '3', '넷': '4', '다섯': '5',
      '여섯': '6', '일곱': '7', '여덟': '8', '아홉': '9', '십': '10'
    };
    if (numberMap[number]) number = numberMap[number];

    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="22" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <text x="32" y="42" text-anchor="middle" font-size="24" font-weight="bold" fill="white" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${number}</text>
</svg>`;
  }

  // 저주하다
  if (meaning.includes('저주')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF5350"/>
      <stop offset="100%" stop-color="#E57373"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="20" stroke="url(#${gradientId})" stroke-width="4" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <line x1="20" y1="20" x2="44" y2="44" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 표징/징조
  if (meaning.includes('표징') || meaning.includes('징조') || meaning.includes('표시')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M32 18 L35 26 L43 26 L37 31 L39 39 L32 34 L25 39 L27 31 L21 26 L29 26 Z" fill="white" opacity="0.9" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 은혜/호의
  if (meaning.includes('은혜') || meaning.includes('호의') || meaning.includes('축복')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <path d="M32 20 L37 30 L48 32 L40 40 L42 51 L32 45 L22 51 L24 40 L16 32 L27 30 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 눈 (~의 눈에)
  if (meaning.includes('눈')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <ellipse cx="32" cy="32" rx="24" ry="16" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="32" cy="32" r="8" fill="white" opacity="0.9" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <circle cx="32" cy="32" r="4" fill="url(#${gradientId})" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 의로운/완전한
  if (meaning.includes('의로운') || meaning.includes('완전') || meaning.includes('흠이')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <path d="M32 16 L20 28 L26 34 L32 28 L44 40 L50 34 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 창문/빛
  if (meaning.includes('창문') || (meaning.includes('빛') && grammar.includes('명사'))) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <rect x="18" y="18" width="28" height="28" rx="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <line x1="32" y1="18" x2="32" y2="46" stroke="white" stroke-width="2" opacity="0.6"/>
  <line x1="18" y1="32" x2="46" y2="32" stroke="white" stroke-width="2" opacity="0.6"/>
</svg>`;
  }

  // 생명
  if (meaning.includes('생명') || meaning.includes('삶')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <path d="M32 20 Q20 20 20 32 Q20 44 32 52 Q44 44 44 32 Q44 20 32 20 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="32" cy="32" r="6" fill="white" opacity="0.5" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 족보/세대
  if (meaning.includes('족보') || meaning.includes('세대') || meaning.includes('후손')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="16" r="6" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <line x1="32" y1="22" x2="32" y2="30" stroke="url(#${gradientId})" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="24" cy="36" r="5" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="40" cy="36" r="5" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <line x1="24" y1="41" x2="24" y2="48" stroke="url(#${gradientId})" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <line x1="40" y1="41" x2="40" y2="48" stroke="url(#${gradientId})" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="18" cy="52" r="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="30" cy="52" r="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="46" cy="52" r="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 안개/수증기
  if (meaning.includes('안개') || meaning.includes('수증기')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <path d="M16 24 Q32 20 48 24" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M20 32 Q32 28 44 32" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M18 40 Q32 36 46 40" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 동행하다
  if (meaning.includes('동행')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="7" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="40" cy="24" r="7" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M16 50 Q16 38 24 38 Q32 38 32 50" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M32 50 Q32 38 40 38 Q48 38 48 50" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 아래에서
  if (meaning.includes('아래')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <rect x="20" y="16" width="24" height="3" rx="1.5" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M32 24 L32 42 M32 42 L26 36 M32 42 L38 36" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 죽다
  if (meaning.includes('죽')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#78909C"/>
      <stop offset="100%" stop-color="#B0BEC5"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="url(#${gradientId})" opacity="0.3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M20 32 Q32 20 44 32" stroke="url(#${gradientId})" stroke-width="3" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 장자
  if (meaning.includes('장자') || meaning.includes('맏')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="28" r="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M18 52 Q18 38 32 38 Q46 38 46 52" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M26 16 L32 22 L38 16" stroke="url(#${gradientId})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 동사 일반
  if (grammar.includes('동사')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="20" cy="32" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M28 32 L44 32 M44 32 L40 28 M44 32 L40 36" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 명사 일반
  if (grammar.includes('명사')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <rect x="20" y="20" width="24" height="24" rx="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="32" cy="32" r="6" fill="white" opacity="0.4" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 대명사
  if (grammar.includes('대명사')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M22 28 L32 38 L42 28" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 기본
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="18" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
}

async function improveRemainingDefaultSVGs() {
  console.log('🎨 남은 디폴트 SVG 개선 시작...\n');

  const { data: allWords, error: fetchError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, icon_svg')
    .not('icon_svg', 'is', null);

  if (fetchError) {
    console.error('❌ 단어 조회 실패:', fetchError);
    return;
  }

  console.log(`📊 전체 SVG 있는 단어: ${allWords?.length || 0}개\n`);

  // 더 엄격한 필터링
  const wordsToFix = allWords?.filter(w => {
    const svg = w.icon_svg || '';

    // 문서 모양 (엄격)
    const isDocument = svg.includes('<rect') && svg.includes('rx="4"') &&
                       svg.length < 300 && !svg.includes('drop-shadow');

    // Gradient 없음
    const noGradient = !svg.includes('gradient') && !svg.includes('Gradient');

    // Drop-shadow 없음 (but not too simple)
    const noShadow = !svg.includes('drop-shadow') && svg.length > 100;

    // 매우 단순
    const shapeCount = (svg.match(/<(circle|rect|path|polygon|ellipse|line)/g) || []).length;
    const verySimple = shapeCount <= 1 && svg.length < 200;

    return isDocument || (noGradient && svg.length < 400) || (noShadow && svg.length < 350) || verySimple;
  }) || [];

  console.log(`🔧 개선 대상: ${wordsToFix.length}개\n`);

  if (wordsToFix.length === 0) {
    console.log('✅ 개선할 단어가 없습니다!');
    return;
  }

  let improved = 0;
  let failed = 0;

  for (let i = 0; i < wordsToFix.length; i++) {
    const word = wordsToFix[i];

    try {
      const newSvg = generateEnhancedSVG(word, i);

      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_svg: newSvg })
        .eq('id', word.id);

      if (updateError) {
        console.error(`❌ ${word.hebrew} - ${word.meaning}: 업데이트 실패`);
        failed++;
      } else {
        improved++;
        console.log(`✅ [${improved}/${wordsToFix.length}] ${word.hebrew} - ${word.meaning}`);
      }
    } catch (error) {
      console.error(`❌ ${word.hebrew} - ${word.meaning}: 에러`, error);
      failed++;
    }

    if ((i + 1) % 20 === 0) {
      console.log(`\n📊 진행률: ${i + 1}/${wordsToFix.length} (${((i + 1) / wordsToFix.length * 100).toFixed(1)}%)\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 최종 결과');
  console.log('='.repeat(80));
  console.log(`총 개선 대상: ${wordsToFix.length}개`);
  console.log(`✅ 성공: ${improved}개`);
  console.log(`❌ 실패: ${failed}개`);
  console.log(`📈 성공률: ${(improved / wordsToFix.length * 100).toFixed(1)}%`);
}

improveRemainingDefaultSVGs().catch(console.error);
