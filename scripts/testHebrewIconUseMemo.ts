/**
 * HebrewIcon useMemo 로직 검증 테스트
 *
 * 검증 항목:
 * 1. unique ID 생성 로직의 정확성
 * 2. id="..." 치환
 * 3. url(#...) 치환
 * 4. Math.random() SSR/빌드 시 문제 가능성
 * 5. 정규식이 모든 경우를 커버하는지
 */

// 실제 HebrewIcon 컴포넌트의 useMemo 로직을 시뮬레이션
function processIconSvg(iconSvg: string, word: string): string | null {
  if (!iconSvg || iconSvg.trim().length === 0) return null;

  // Generate unique prefix based on word + random string
  const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;

  // Replace all id="..." with id="uniqueId-..."
  let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);

  // Replace all url(#...) with url(#uniqueId-...)
  processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

  return processedSvg;
}

// 테스트 SVG 샘플 (실제 데이터에서 가져온 SVG)
const testCases = [
  {
    name: '베레쉬트 (בְּרֵאשִׁית) - 복잡한 gradient ID',
    word: 'בְּרֵאשִׁית',
    iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sun_bereshit"><stop offset="0%" stop-color="#FFF4E6" /><stop offset="30%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF6B35" /></radialGradient><linearGradient id="sky_bereshit" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FF6B9D" /><stop offset="50%" stop-color="#C44569" /><stop offset="100%" stop-color="#8B3A62" /></linearGradient></defs><circle cx="32" cy="24" r="14" fill="url(#sun_bereshit)" /><rect width="64" height="64" fill="url(#sky_bereshit)" /></svg>',
  },
  {
    name: '바라 (בָּרָא) - 여러 gradient와 filter',
    word: 'בָּרָא',
    iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="center_bara"><stop offset="0%" stop-color="#FFFFFF" /></radialGradient><linearGradient id="ray1_bara"><stop offset="0%" stop-color="#00F5FF" /></linearGradient></defs><circle fill="url(#center_bara)" /><path fill="url(#ray1_bara)" /></svg>',
  },
  {
    name: '엘로힘 (אֱלֹהִים) - 중첩된 ID 참조',
    word: 'אֱלֹהִים',
    iconSvg: '<svg viewBox="0 0 64 64"><defs><linearGradient id="crown_elohim"><stop offset="0%" stop-color="#FFD700"/></linearGradient><radialGradient id="glow_elohim"><stop offset="0%" stop-color="#FFFFFF"/></radialGradient></defs><path fill="url(#crown_elohim)" filter="drop-shadow(0 0 12px rgba(255, 215, 0, 0.9))" /><circle fill="url(#glow_elohim)" /></svg>',
  },
  {
    name: 'Edge Case: ID에 특수문자 포함',
    word: 'test',
    iconSvg: '<svg><defs><linearGradient id="grad-1_test"><stop/></linearGradient></defs><rect fill="url(#grad-1_test)"/></svg>',
  },
  {
    name: 'Edge Case: 빈 SVG',
    word: 'empty',
    iconSvg: '',
  },
  {
    name: 'Edge Case: 공백만 있는 SVG',
    word: 'whitespace',
    iconSvg: '   ',
  },
  {
    name: 'Edge Case: ID 없는 SVG',
    word: 'noId',
    iconSvg: '<svg><circle cx="32" cy="32" r="10" fill="#FF0000"/></svg>',
  },
];

console.log('='.repeat(80));
console.log('HebrewIcon useMemo 로직 검증 테스트');
console.log('='.repeat(80));
console.log();

testCases.forEach((testCase, index) => {
  console.log(`\n[테스트 ${index + 1}] ${testCase.name}`);
  console.log('-'.repeat(80));

  const result = processIconSvg(testCase.iconSvg, testCase.word);

  if (result === null) {
    console.log('✅ 결과: null (빈 SVG 처리 정상)');
    return;
  }

  console.log(`📝 원본 단어: ${testCase.word}`);
  console.log(`🔑 생성된 unique ID 패턴 확인...`);

  // unique ID 추출 (정규식으로 패턴 확인)
  const uniqueIdMatch = result.match(/id="([^"]+)"/);
  if (uniqueIdMatch) {
    const firstId = uniqueIdMatch[1];
    const prefix = firstId.split('-')[0];
    console.log(`   └─ 첫 번째 ID: ${firstId}`);
    console.log(`   └─ Prefix (단어 기반): ${prefix}`);

    // 히브리어 문자가 제거되었는지 확인
    if (prefix.length === 0 && /[^a-zA-Z0-9]/.test(testCase.word)) {
      console.log('   ⚠️  히브리어 문자가 모두 제거되어 빈 prefix가 생성됨');
    }
  }

  // ID 치환 검증
  const originalIds = testCase.iconSvg.match(/id="([^"]+)"/g) || [];
  const processedIds = result.match(/id="([^"]+)"/g) || [];

  console.log(`\n🔍 ID 치환 검증:`);
  console.log(`   원본 ID 개수: ${originalIds.length}`);
  console.log(`   처리 후 ID 개수: ${processedIds.length}`);

  if (originalIds.length > 0) {
    console.log(`   원본 ID 목록:`, originalIds);
    console.log(`   처리 후 ID 목록:`, processedIds);
  }

  // url(#...) 치환 검증
  const originalUrls = testCase.iconSvg.match(/url\(#([^)]+)\)/g) || [];
  const processedUrls = result.match(/url\(#([^)]+)\)/g) || [];

  console.log(`\n🔗 URL 참조 치환 검증:`);
  console.log(`   원본 url() 개수: ${originalUrls.length}`);
  console.log(`   처리 후 url() 개수: ${processedUrls.length}`);

  if (originalUrls.length > 0) {
    console.log(`   원본 URL 목록:`, originalUrls);
    console.log(`   처리 후 URL 목록:`, processedUrls);
  }

  // ID와 URL 참조 매칭 확인
  if (originalIds.length > 0 && originalUrls.length > 0) {
    console.log(`\n✅ ID-URL 매칭 확인:`);
    const processedIdValues = processedIds.map(id => id.match(/id="([^"]+)"/)?.[1]);
    const processedUrlValues = processedUrls.map(url => url.match(/url\(#([^)]+)\)/)?.[1]);

    processedUrlValues.forEach(urlValue => {
      const isMatched = processedIdValues.includes(urlValue);
      console.log(`   ${isMatched ? '✅' : '❌'} url(#${urlValue}) → ${isMatched ? '매칭됨' : '매칭 안됨'}`);
    });
  }
});

// Math.random() SSR 문제 시뮬레이션
console.log('\n\n' + '='.repeat(80));
console.log('Math.random() SSR/Hydration Mismatch 문제 분석');
console.log('='.repeat(80));

const word = 'בְּרֵאשִׁית';
const iconSvg = '<svg><defs><radialGradient id="sun"><stop/></radialGradient></defs><circle fill="url(#sun)"/></svg>';

console.log('\n🔄 동일한 입력으로 5번 처리 (Math.random() 때문에 매번 다른 결과):\n');

for (let i = 0; i < 5; i++) {
  const result = processIconSvg(iconSvg, word);
  const idMatch = result?.match(/id="([^"]+)"/);
  console.log(`   실행 ${i + 1}: ${idMatch?.[1]}`);
}

console.log('\n⚠️  문제점:');
console.log('   1. Math.random()은 SSR과 CSR에서 다른 값을 생성');
console.log('   2. React Hydration Mismatch 발생 가능');
console.log('   3. 동일한 컴포넌트가 여러 번 렌더링되면 매번 다른 ID 생성');

// 개선 방안
console.log('\n\n' + '='.repeat(80));
console.log('💡 개선 방안');
console.log('='.repeat(80));

console.log('\n1. useId 훅 사용 (React 18+):');
console.log('   ✅ SSR-safe');
console.log('   ✅ Hydration mismatch 없음');
console.log('   ✅ 같은 컴포넌트는 항상 같은 ID');
console.log('   예제: const id = useId();');

console.log('\n2. 해시 함수 사용:');
console.log('   ✅ 결정적 (deterministic)');
console.log('   ✅ 같은 입력 → 같은 출력');
console.log('   예제: const hash = simpleHash(word + iconSvg);');

console.log('\n3. 카운터 기반 ID:');
console.log('   ✅ 순차적 ID 생성');
console.log('   ⚠️  서버와 클라이언트 동기화 필요');

// 정규식 Edge Case 테스트
console.log('\n\n' + '='.repeat(80));
console.log('정규식 Edge Case 테스트');
console.log('='.repeat(80));

const edgeCases = [
  {
    name: 'ID에 하이픈 포함',
    svg: '<svg><defs><gradient id="my-gradient-1"><stop/></gradient></defs><rect fill="url(#my-gradient-1)"/></svg>',
  },
  {
    name: 'ID에 언더스코어 포함',
    svg: '<svg><defs><gradient id="my_gradient_1"><stop/></gradient></defs><rect fill="url(#my_gradient_1)"/></svg>',
  },
  {
    name: 'url() 여러 개',
    svg: '<svg><defs><g id="g1"><stop/></g><g id="g2"><stop/></g></defs><rect fill="url(#g1)"/><rect fill="url(#g2)"/></svg>',
  },
  {
    name: 'id 속성이 줄바꿈 포함',
    svg: '<svg><defs><gradient id="grad"\n  ><stop/></gradient></defs></svg>',
  },
  {
    name: 'url()에 공백 포함',
    svg: '<svg><defs><gradient id="grad"><stop/></gradient></defs><rect fill="url( #grad )"/></svg>',
  },
];

edgeCases.forEach((testCase, index) => {
  console.log(`\n[Edge Case ${index + 1}] ${testCase.name}`);
  const result = processIconSvg(testCase.svg, 'test');
  const processedIds = result?.match(/id="([^"]+)"/g) || [];
  const processedUrls = result?.match(/url\(#([^)]+)\)/g) || [];
  console.log(`   ID: ${processedIds.join(', ')}`);
  console.log(`   URL: ${processedUrls.join(', ')}`);

  // 공백이 있는 url() 케이스 검증
  if (testCase.name.includes('공백')) {
    const hasSpace = /url\( #/.test(result || '');
    console.log(`   ${hasSpace ? '⚠️' : '✅'} url() 내부 공백 ${hasSpace ? '처리 안됨' : '처리됨'}`);
  }
});

console.log('\n\n' + '='.repeat(80));
console.log('테스트 완료');
console.log('='.repeat(80));
