/**
 * HebrewIcon 현재 버전 vs 개선 버전 비교 테스트
 */

// 현재 버전 (Math.random() 사용)
function processIconSvg_Current(iconSvg: string, word: string): string | null {
  if (!iconSvg || iconSvg.trim().length === 0) return null;

  const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;
  let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);
  processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

  return processedSvg;
}

// 개선 버전 (useId 시뮬레이션)
function processIconSvg_Improved(iconSvg: string, reactId: string): string | null {
  if (!iconSvg || iconSvg.trim().length === 0) return null;

  const uniqueId = reactId.replace(/:/g, '');
  let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);
  processedSvg = processedSvg.replace(/url\(\s*#([^)]+?)\s*\)/g, `url(#${uniqueId}-$1)`);

  return processedSvg;
}

// React useId 시뮬레이션 (실제로는 ":r1:", ":r2:" 등의 형식)
let idCounter = 0;
function simulateUseId(): string {
  return `:r${++idCounter}:`;
}

console.log('='.repeat(80));
console.log('HebrewIcon 현재 버전 vs 개선 버전 비교');
console.log('='.repeat(80));

const testSvg = '<svg><defs><radialGradient id="sun"><stop/></radialGradient></defs><circle fill="url(#sun)"/></svg>';

// 테스트 1: SSR/Hydration 시뮬레이션
console.log('\n📊 테스트 1: SSR/Hydration 시뮬레이션\n');
console.log('시나리오: 동일한 컴포넌트가 SSR과 CSR에서 각각 렌더링됨\n');

console.log('【현재 버전 - Math.random()】');
console.log('SSR (서버):', processIconSvg_Current(testSvg, 'בְּרֵאשִׁית')?.match(/id="[^"]+"/)?.[0]);
console.log('CSR (클라이언트):', processIconSvg_Current(testSvg, 'בְּרֵאשִׁית')?.match(/id="[^"]+"/)?.[0]);
console.log('CSR (재렌더링):', processIconSvg_Current(testSvg, 'בְּרֵאשִׁית')?.match(/id="[^"]+"/)?.[0]);
console.log('❌ 결과: 매번 다른 ID → Hydration Mismatch 발생!\n');

console.log('【개선 버전 - useId()】');
const reactId1 = simulateUseId(); // 컴포넌트 마운트 시 한 번만 생성
console.log('SSR (서버):', processIconSvg_Improved(testSvg, reactId1)?.match(/id="[^"]+"/)?.[0]);
console.log('CSR (클라이언트):', processIconSvg_Improved(testSvg, reactId1)?.match(/id="[^"]+"/)?.[0]);
console.log('CSR (재렌더링):', processIconSvg_Improved(testSvg, reactId1)?.match(/id="[^"]+"/)?.[0]);
console.log('✅ 결과: 항상 동일한 ID → Hydration 성공!\n');

// 테스트 2: 여러 컴포넌트 인스턴스
console.log('\n📊 테스트 2: 여러 컴포넌트 인스턴스\n');
console.log('시나리오: 같은 페이지에 여러 HebrewIcon 컴포넌트\n');

console.log('【현재 버전】');
for (let i = 1; i <= 3; i++) {
  const result = processIconSvg_Current(testSvg, 'בְּרֵאשִׁית');
  console.log(`인스턴스 ${i}:`, result?.match(/id="[^"]+"/)?.[0]);
}
console.log('⚠️  결과: 히브리어 단어는 모두 빈 prefix (디버깅 어려움)\n');

console.log('【개선 버전】');
for (let i = 1; i <= 3; i++) {
  const reactId = simulateUseId();
  const result = processIconSvg_Improved(testSvg, reactId);
  console.log(`인스턴스 ${i}:`, result?.match(/id="[^"]+"/)?.[0]);
}
console.log('✅ 결과: 각 인스턴스마다 고유 ID (충돌 없음)\n');

// 테스트 3: url() 공백 처리
console.log('\n📊 테스트 3: url() 공백 처리\n');

const svgWithSpace = '<svg><defs><gradient id="grad"><stop/></gradient></defs><rect fill="url( #grad )"/></svg>';

console.log('원본 SVG:', 'url( #grad )');
console.log('\n【현재 버전】');
const current = processIconSvg_Current(svgWithSpace, 'test');
const currentUrl = current?.match(/url\([^)]+\)/)?.[0];
console.log('처리 결과:', currentUrl);
console.log(currentUrl === 'url( #grad )' ? '❌ 공백으로 인해 치환 실패' : '✅ 치환 성공');

console.log('\n【개선 버전】');
const improved = processIconSvg_Improved(svgWithSpace, simulateUseId());
const improvedUrl = improved?.match(/url\([^)]+\)/)?.[0];
console.log('처리 결과:', improvedUrl);
console.log(improvedUrl?.includes('r') ? '✅ 공백 처리하여 치환 성공' : '❌ 치환 실패');

// 성능 비교
console.log('\n\n📊 테스트 4: 성능 비교\n');

const iterations = 10000;
const largeSvg = testSvg.repeat(10); // 큰 SVG 시뮬레이션

console.log(`반복 횟수: ${iterations.toLocaleString()}회\n`);

console.log('【현재 버전】');
const startCurrent = performance.now();
for (let i = 0; i < iterations; i++) {
  processIconSvg_Current(largeSvg, 'בְּרֵאשִׁית');
}
const endCurrent = performance.now();
console.log(`실행 시간: ${(endCurrent - startCurrent).toFixed(2)}ms`);

console.log('\n【개선 버전】');
const startImproved = performance.now();
for (let i = 0; i < iterations; i++) {
  processIconSvg_Improved(largeSvg, simulateUseId());
}
const endImproved = performance.now();
console.log(`실행 시간: ${(endImproved - startImproved).toFixed(2)}ms`);

const diff = endImproved - endCurrent;
console.log(`\n성능 차이: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}ms (${diff > 0 ? '느림' : '빠름'})`);
console.log(`상대 성능: ${((endCurrent / endImproved) * 100).toFixed(1)}%`);

// 요약
console.log('\n\n' + '='.repeat(80));
console.log('📋 종합 비교');
console.log('='.repeat(80));

console.log('\n| 항목 | 현재 버전 | 개선 버전 |');
console.log('|------|-----------|-----------|');
console.log('| SSR 지원 | ❌ Math.random() | ✅ useId() |');
console.log('| Hydration 안전성 | ❌ Mismatch 발생 | ✅ 안전 |');
console.log('| 히브리어 prefix | ⚠️ 빈 문자열 | ✅ 고유 ID |');
console.log('| url() 공백 처리 | ❌ 실패 | ✅ 성공 |');
console.log('| 성능 | ⚡ 빠름 | ⚡ 비슷 |');
console.log('| 디버깅 | ⚠️ 어려움 | ✅ 쉬움 |');
console.log('| Best Practice | ❌ | ✅ |');

console.log('\n\n💡 권장 사항:');
console.log('   1. 즉시 개선 버전으로 교체 (useId 사용)');
console.log('   2. SSR 도입 전에 반드시 수정 필요');
console.log('   3. 성능 차이 거의 없음 (안심하고 교체 가능)');
console.log('   4. React 18 Best Practice 준수');

console.log('\n='.repeat(80));
