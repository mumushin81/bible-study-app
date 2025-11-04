/**
 * 브라우저에서 어근 데이터가 제대로 표시되는지 확인하는 테스트
 *
 * 실행 방법:
 * 1. 브라우저에서 http://localhost:5174 열기
 * 2. DevTools 콘솔 열기 (F12)
 * 3. 아래 코드를 복사해서 콘솔에 붙여넣기
 */

// 테스트 대상 어근 (ב-ר-א, 창조하다)
const testRoot = 'ב-ר-א';

console.log('🔍 어근 데이터 표시 테스트 시작\n');
console.log('━'.repeat(60));

// 1. Supabase에서 직접 어근 데이터 조회
async function checkDatabaseData() {
  console.log('\n1️⃣ 데이터베이스 확인');

  const { createClient } = await import('@supabase/supabase-js');

  // @ts-ignore - 전역 변수 접근
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('hebrew_roots')
    .select('root, root_hebrew, etymology_simple, derivatives')
    .eq('root', testRoot)
    .single();

  if (error) {
    console.error('❌ DB 조회 실패:', error.message);
    return null;
  }

  if (!data) {
    console.error('❌ 데이터 없음');
    return null;
  }

  console.log('✅ DB에서 어근 데이터 조회 성공');
  console.log(`   어근: ${data.root} (${data.root_hebrew})`);
  console.log(`   어원 설명: ${data.etymology_simple ? '있음' : '없음'}`);
  console.log(`   파생어: ${data.derivatives?.length || 0}개`);

  if (data.etymology_simple) {
    console.log(`\n   📖 어원 설명 (일부):`);
    console.log(`   ${data.etymology_simple.substring(0, 100)}...`);
  }

  if (data.derivatives && data.derivatives.length > 0) {
    console.log(`\n   📚 파생어 (처음 3개):`);
    data.derivatives.slice(0, 3).forEach((d: any, idx: number) => {
      console.log(`   ${idx + 1}. ${d.hebrew} (${d.korean}) - ${d.meaning}`);
    });
  }

  return data;
}

// 2. DOM에서 어근 정보가 표시되는지 확인
function checkDOMDisplay() {
  console.log('\n2️⃣ DOM 표시 확인');

  // 플래시카드 뒷면 확인
  const backSide = document.querySelector('[style*="rotateY(180deg)"]');

  if (!backSide) {
    console.warn('⚠️  플래시카드 뒷면을 찾을 수 없습니다');
    console.log('   → 플래시카드를 더블 클릭하여 뒤집어주세요');
    return false;
  }

  // 어근의 핵심 의미 섹션 확인
  const etymologySection = Array.from(backSide.querySelectorAll('div'))
    .find(el => el.textContent?.includes('💡 어근의 핵심 의미'));

  if (etymologySection) {
    console.log('✅ "어근의 핵심 의미" 섹션 발견');
    const content = etymologySection.nextElementSibling?.textContent || '';
    console.log(`   내용 (일부): ${content.substring(0, 80)}...`);
  } else {
    console.error('❌ "어근의 핵심 의미" 섹션 없음');
  }

  // 어근 활용 예시 섹션 확인
  const derivativesSection = Array.from(backSide.querySelectorAll('div'))
    .find(el => el.textContent?.includes('📖 어근 활용 예시'));

  if (derivativesSection) {
    console.log('✅ "어근 활용 예시" 섹션 발견');

    // 파생어 개수 세기
    const derivativeItems = derivativesSection.parentElement?.querySelectorAll('[dir="rtl"]');
    console.log(`   표시된 파생어: ${derivativeItems?.length || 0}개`);

    // 처음 3개 파생어 출력
    if (derivativeItems && derivativeItems.length > 0) {
      console.log('   파생어:');
      Array.from(derivativeItems).slice(0, 3).forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.textContent}`);
      });
    }
  } else {
    console.error('❌ "어근 활용 예시" 섹션 없음');
  }

  return true;
}

// 3. React DevTools로 props 확인
function checkReactProps() {
  console.log('\n3️⃣ React Props 확인');

  // React DevTools가 설치되어 있어야 함
  // @ts-ignore
  if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.warn('⚠️  React DevTools가 설치되지 않았습니다');
    return false;
  }

  console.log('✅ React DevTools 감지됨');
  console.log('   → React DevTools로 FlashCard 컴포넌트의 props를 확인하세요');
  console.log('   → word.rootEtymology.etymology_simple');
  console.log('   → word.rootEtymology.derivatives');

  return true;
}

// 메인 테스트 실행
async function runTest() {
  try {
    // 데이터베이스 확인
    const dbData = await checkDatabaseData();

    console.log('\n' + '━'.repeat(60));
    console.log('\n💡 다음 단계:');
    console.log('   1. 단어장 탭으로 이동');
    console.log('   2. 첫 번째 플래시카드를 더블 클릭하여 뒤집기');
    console.log('   3. 아래 함수를 콘솔에서 실행:');
    console.log('      checkDOMDisplay()');
    console.log('      checkReactProps()');

    // 전역으로 함수 노출
    // @ts-ignore
    window.checkDOMDisplay = checkDOMDisplay;
    // @ts-ignore
    window.checkReactProps = checkReactProps;

    console.log('\n✅ 테스트 함수가 준비되었습니다');
    console.log('━'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 자동 실행
runTest();

export { checkDatabaseData, checkDOMDisplay, checkReactProps };
