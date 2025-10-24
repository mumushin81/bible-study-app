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

// 색상 매핑
function getColorByMeaning(meaning: string): { start: string; end: string } {
  const m = meaning.toLowerCase();

  // 신성/하나님
  if (m.includes('하나님') || m.includes('여호와') || m.includes('주님') || m.includes('엘')) {
    return { start: '#FFD700', end: '#FFA500' }; // 금색
  }

  // 사람/인물
  if (m.includes('사람') || m.includes('인간') || m.includes('아버지') || m.includes('어머니') ||
      m.includes('아들') || m.includes('딸') || m.includes('자식') || m.includes('아내') || m.includes('남편')) {
    return { start: '#8D6E63', end: '#D7CCC8' }; // 갈색
  }

  // 생명/식물
  if (m.includes('나무') || m.includes('씨') || m.includes('열매') || m.includes('풀') ||
      m.includes('채소') || m.includes('곡식') || m.includes('식물')) {
    return { start: '#66BB6A', end: '#A5D6A7' }; // 녹색
  }

  // 동물
  if (m.includes('짐승') || m.includes('가축') || m.includes('새') || m.includes('물고기') ||
      m.includes('동물') || m.includes('양') || m.includes('소') || m.includes('기는')) {
    return { start: '#8D6E63', end: '#BCAAA4' }; // 갈색
  }

  // 물/바다
  if (m.includes('물') || m.includes('바다') || m.includes('강') || m.includes('샘')) {
    return { start: '#42A5F5', end: '#90CAF9' }; // 파란색
  }

  // 하늘/공기
  if (m.includes('하늘') || m.includes('궁창') || m.includes('공중') || m.includes('바람')) {
    return { start: '#81D4FA', end: '#B3E5FC' }; // 하늘색
  }

  // 빛/태양
  if (m.includes('빛') || m.includes('해') || m.includes('태양') || m.includes('광명')) {
    return { start: '#FFD54F', end: '#FFF59D' }; // 노란색
  }

  // 어둠/밤
  if (m.includes('어둠') || m.includes('밤') || m.includes('흑암')) {
    return { start: '#546E7A', end: '#78909C' }; // 어두운 회색
  }

  // 땅/흙
  if (m.includes('땅') || m.includes('지면') || m.includes('흙') || m.includes('먼지')) {
    return { start: '#A1887F', end: '#D7CCC8' }; // 베이지
  }

  // 시간
  if (m.includes('날') || m.includes('때') || m.includes('시간') || m.includes('해') ||
      m.includes('달') || m.includes('별') || m.includes('년') || m.includes('세')) {
    return { start: '#BA68C8', end: '#E1BEE7' }; // 보라색
  }

  // 숫자
  if (m.match(/\d+/) || m.includes('하나') || m.includes('둘') || m.includes('셋') ||
      m.includes('넷') || m.includes('다섯') || m.includes('여섯') || m.includes('일곱') ||
      m.includes('여덟') || m.includes('아홉') || m.includes('열')) {
    return { start: '#64B5F6', end: '#90CAF9' }; // 파란색
  }

  // 축복/좋음
  if (m.includes('축복') || m.includes('복') || m.includes('좋') || m.includes('아름') || m.includes('선')) {
    return { start: '#FFB74D', end: '#FFE082' }; // 주황색
  }

  // 말씀/음성
  if (m.includes('말') || m.includes('음성') || m.includes('소리') || m.includes('이르')) {
    return { start: '#9575CD', end: '#B39DDB' }; // 보라색
  }

  // 보다/보이다
  if (m.includes('보') || m.includes('보이') || m.includes('시각')) {
    return { start: '#4DD0E1', end: '#80DEEA' }; // 청록색
  }

  // 만들다/창조
  if (m.includes('만들') || m.includes('창조') || m.includes('짓')) {
    return { start: '#FF8A65', end: '#FFAB91' }; // 주황-빨강
  }

  // 기본 (품사별)
  return { start: '#9E9E9E', end: '#BDBDBD' }; // 회색
}

// 의미 기반 SVG 생성
function generateMeaningBasedSVG(word: WordToFix, index: number): string {
  const meaning = word.meaning.toLowerCase();
  const grammar = word.grammar?.toLowerCase() || '';
  const colors = getColorByMeaning(word.meaning);
  const gradientId = `grad-${word.hebrew.replace(/[^a-zA-Z0-9]/g, '')}-${index}`;

  // 표징/징조
  if (meaning.includes('표징') || meaning.includes('징조') || meaning.includes('표시') || meaning.includes('증거')) {
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

  // 하나 (숫자)
  if (meaning.includes('하나') && (meaning.includes('1') || grammar.includes('수사'))) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="22" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <text x="32" y="42" text-anchor="middle" font-size="28" font-weight="bold" fill="white" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))">1</text>
</svg>`;
  }

  // 날들/시간
  if (meaning.includes('날') || meaning.includes('시간') || meaning.includes('때')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <line x1="32" y1="32" x2="32" y2="18" stroke="white" stroke-width="3" stroke-linecap="round" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <line x1="32" y1="32" x2="42" y2="32" stroke="white" stroke-width="2.5" stroke-linecap="round" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <circle cx="32" cy="32" r="2.5" fill="white" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 낳다/출생
  if (meaning.includes('낳') || meaning.includes('태어') || meaning.includes('출생') || meaning.includes('낳았')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="36" r="12" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="32" cy="22" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M24 28 Q32 32 40 28" stroke="url(#${gradientId})" stroke-width="3" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 년/세
  if (meaning.includes('년') || meaning.includes('세') || meaning.includes('연')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="20" stroke="url(#${gradientId})" stroke-width="3" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="32" cy="32" r="14" stroke="url(#${gradientId})" stroke-width="2" fill="none" opacity="0.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="32" cy="32" r="8" stroke="url(#${gradientId})" stroke-width="2" fill="none" opacity="0.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="32" cy="32" r="3" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 모든 (전체)
  if (meaning.includes('모든') || meaning.includes('전체') || meaning.includes('온')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${gradientId}">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="22" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="20" cy="24" r="4" fill="white" opacity="0.9" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <circle cx="44" cy="24" r="4" fill="white" opacity="0.9" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <circle cx="32" cy="40" r="4" fill="white" opacity="0.9" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <circle cx="20" cy="40" r="4" fill="white" opacity="0.8" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <circle cx="44" cy="40" r="4" fill="white" opacity="0.8" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <circle cx="32" cy="24" r="4" fill="white" opacity="0.8" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 아버지
  if (meaning.includes('아버지') || meaning.includes('부친')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="22" r="9" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M20 50 Q20 35 32 35 Q44 35 44 50" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <rect x="28" y="48" width="8" height="6" fill="white" opacity="0.3" rx="1"/>
</svg>`;
  }

  // 말하다/이르다
  if (meaning.includes('말하') || meaning.includes('이르') || meaning.includes('말씀')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <rect x="16" y="20" width="32" height="22" rx="4" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M24 42 L20 48 L28 42" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <line x1="24" y1="28" x2="40" y2="28" stroke="white" stroke-width="2" stroke-linecap="round" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
  <line x1="24" y1="34" x2="36" y2="34" stroke="white" stroke-width="2" stroke-linecap="round" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"/>
</svg>`;
  }

  // 아들들/딸들
  if (meaning.includes('아들') || meaning.includes('딸')) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.start}"/>
      <stop offset="100%" stop-color="${colors.end}"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="7" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <circle cx="40" cy="24" r="7" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M16 48 Q16 36 24 36 Q32 36 32 48" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
  <path d="M32 48 Q32 36 40 36 Q48 36 48 48" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>`;
  }

  // 동사 (일반)
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

  // 명사 (일반)
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

  // 기본 (원형)
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

async function improveAllDefaultSVGs() {
  console.log('🎨 디폴트 SVG 개선 시작...\n');

  // 1. 디폴트 패턴 단어 조회
  const { data: allWords, error: fetchError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, icon_svg')
    .not('icon_svg', 'is', null);

  if (fetchError) {
    console.error('❌ 단어 조회 실패:', fetchError);
    return;
  }

  console.log(`📊 전체 SVG 있는 단어: ${allWords?.length || 0}개\n`);

  // 2. 디폴트 패턴 필터링
  const wordsToFix = allWords?.filter(w => {
    const svg = w.icon_svg || '';

    // 문서 모양
    const isDocument = svg.includes('<rect') && svg.includes('rx="4"') &&
                       !svg.includes('filter="drop-shadow"') && svg.length < 200;

    // Gradient 없음
    const noGradient = !svg.includes('gradient');

    // Drop-shadow 없음
    const noShadow = !svg.includes('drop-shadow');

    // 매우 단순 (shape 1개 이하)
    const shapeCount = (svg.match(/<(circle|rect|path|polygon|ellipse|line)/g) || []).length;
    const verySimple = shapeCount <= 1;

    return isDocument || (noGradient && noShadow) || verySimple;
  }) || [];

  console.log(`🔧 개선 대상: ${wordsToFix.length}개\n`);

  if (wordsToFix.length === 0) {
    console.log('✅ 개선할 단어가 없습니다!');
    return;
  }

  // 3. SVG 생성 및 업데이트
  let improved = 0;
  let failed = 0;

  for (let i = 0; i < wordsToFix.length; i++) {
    const word = wordsToFix[i];

    try {
      // 새 SVG 생성
      const newSvg = generateMeaningBasedSVG(word, i);

      // 데이터베이스 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_svg: newSvg })
        .eq('id', word.id);

      if (updateError) {
        console.error(`❌ ${word.hebrew} - ${word.meaning}: 업데이트 실패`, updateError);
        failed++;
      } else {
        improved++;
        console.log(`✅ [${improved}/${wordsToFix.length}] ${word.hebrew} - ${word.meaning}`);
      }
    } catch (error) {
      console.error(`❌ ${word.hebrew} - ${word.meaning}: 에러`, error);
      failed++;
    }

    // 진행률 표시
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 진행률: ${i + 1}/${wordsToFix.length} (${((i + 1) / wordsToFix.length * 100).toFixed(1)}%)\n`);
    }
  }

  // 4. 결과 요약
  console.log('\n' + '='.repeat(80));
  console.log('📊 최종 결과');
  console.log('='.repeat(80));
  console.log(`총 개선 대상: ${wordsToFix.length}개`);
  console.log(`✅ 성공: ${improved}개`);
  console.log(`❌ 실패: ${failed}개`);
  console.log(`📈 성공률: ${(improved / wordsToFix.length * 100).toFixed(1)}%`);
}

improveAllDefaultSVGs().catch(console.error);
