/**
 * Vercel SVG 디버깅 스크립트
 *
 * Vercel 배포 후 SVG가 표시되지 않을 때 이 스크립트를 사용하세요.
 *
 * 사용법:
 * 1. Vercel 사이트의 브라우저 콘솔에 아래 코드를 붙여넣기
 * 2. 결과를 확인하여 문제 진단
 */

// 이 코드를 브라우저 콘솔에 복사해서 실행하세요:
const debugScript = `
console.log('🔍 Vercel SVG Debug Script');
console.log('='.repeat(80));

// 1. 환경 확인
console.log('\\n1️⃣ Environment Check');
console.log('-'.repeat(80));
console.log('URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);

// 2. React 앱 마운트 확인
console.log('\\n2️⃣ React App Check');
console.log('-'.repeat(80));
const root = document.getElementById('root');
console.log('Root element found:', !!root);
console.log('Root has children:', root?.children.length > 0);

// 3. SVG DOM 확인
console.log('\\n3️⃣ SVG DOM Check');
console.log('-'.repeat(80));

// dangerouslySetInnerHTML로 렌더링된 SVG 찾기
const allDivs = document.querySelectorAll('div');
const svgContainers = Array.from(allDivs).filter(div => {
  return div.innerHTML.includes('<svg') && div.innerHTML.includes('viewBox');
});

console.log('SVG containers found:', svgContainers.length);

if (svgContainers.length > 0) {
  console.log('✅ SVG elements are rendered');
  console.log('Sample SVG HTML:', svgContainers[0].innerHTML.substring(0, 200) + '...');
} else {
  console.log('❌ No SVG elements found in DOM');
}

// 4. Fallback emoji 확인
const emojiElements = Array.from(document.querySelectorAll('span')).filter(span => {
  return span.textContent === '📜' || span.getAttribute('role') === 'img';
});

console.log('Fallback emojis found:', emojiElements.length);

if (emojiElements.length > 0 && svgContainers.length === 0) {
  console.log('⚠️ Using fallback emojis - SVG data may not be loaded from database');
}

// 5. Supabase 연결 테스트
console.log('\\n4️⃣ Supabase Connection Check');
console.log('-'.repeat(80));

// Supabase 클라이언트가 window에 노출되어 있는지 확인
if (typeof window !== 'undefined') {
  console.log('Window object available');

  // 환경 변수 확인 (프로덕션에서는 보이지 않음)
  console.log('Checking for Supabase in bundle...');

  // React DevTools로 확인
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools available - Use React DevTools to inspect component state');
  }
}

// 6. 네트워크 요청 확인 (이미 로드된 것만)
console.log('\\n5️⃣ Network Check');
console.log('-'.repeat(80));
console.log('Open DevTools → Network tab to check:');
console.log('- Supabase API calls (should see requests to supabase.co)');
console.log('- Response data should include icon_svg field');
console.log('- Check for CORS errors or 401 Unauthorized');

// 7. Console errors 확인
console.log('\\n6️⃣ Error Check');
console.log('-'.repeat(80));
console.log('Check Console tab for:');
console.log('- Supabase connection errors');
console.log('- CSP (Content Security Policy) violations');
console.log('- React rendering errors');

// 8. 추천 조치사항
console.log('\\n7️⃣ Recommended Actions');
console.log('-'.repeat(80));

if (svgContainers.length === 0 && emojiElements.length > 0) {
  console.log('🔧 Action needed:');
  console.log('1. Check Vercel environment variables:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  console.log('2. Check Network tab for failed Supabase requests');
  console.log('3. Verify Supabase is accessible from Vercel');
} else if (svgContainers.length > 0) {
  console.log('✅ SVG rendering is working correctly!');
} else {
  console.log('⚠️ No words rendered yet. Wait for data to load or check for errors.');
}

console.log('\\n' + '='.repeat(80));
console.log('Debug complete. Check results above.');
`;

console.log('='.repeat(80));
console.log('Vercel SVG 디버깅 스크립트');
console.log('='.repeat(80));
console.log('\n사용법:');
console.log('1. Vercel에 배포된 사이트를 브라우저로 열기');
console.log('2. 브라우저 개발자 도구 열기 (F12 또는 Cmd+Option+I)');
console.log('3. Console 탭으로 이동');
console.log('4. 아래 코드를 복사해서 콘솔에 붙여넣기');
console.log('5. Enter 키 누르기');
console.log('\n' + '='.repeat(80));
console.log('\n코드:\n');
console.log(debugScript);
console.log('\n' + '='.repeat(80));

// Export for use in Node.js
export default debugScript;
