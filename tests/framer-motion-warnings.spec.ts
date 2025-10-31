import { test, expect } from '@playwright/test';

test.describe('framer-motion Infinity% warnings', () => {
  test('should not have Infinity% animation warnings on page load', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = [];

    // 모든 콘솔 메시지 캡처
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    });

    // 페이지 로드
    console.log('\n📍 Loading page...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 페이지 초기화 대기
    await page.waitForTimeout(3000);

    // 콘솔 메시지 분석
    console.log('\n=== CONSOLE ANALYSIS ===');
    const infinityWarnings = consoleMessages.filter(m =>
      m.text.includes('Infinity') && m.text.includes('animate')
    );
    const animateWarnings = consoleMessages.filter(m =>
      m.text.includes('animate width') || m.text.includes('not an animatable value')
    );

    console.log(`\n총 메시지: ${consoleMessages.length}`);
    console.log(`Infinity 경고: ${infinityWarnings.length}`);
    console.log(`애니메이션 경고: ${animateWarnings.length}`);

    if (infinityWarnings.length > 0) {
      console.log('\n❌ Infinity 경고 발견:');
      infinityWarnings.forEach((m, i) => {
        console.log(`  ${i + 1}. [${m.type}] ${m.text}`);
      });
    } else {
      console.log('\n✅ Infinity 경고 없음!');
    }

    if (animateWarnings.length > 0) {
      console.log('\n❌ 애니메이션 경고 발견:');
      animateWarnings.forEach((m, i) => {
        console.log(`  ${i + 1}. [${m.type}] ${m.text}`);
      });
    } else {
      console.log('\n✅ 애니메이션 경고 없음!');
    }

    // 검증: Infinity 경고가 없어야 함
    expect(infinityWarnings.length).toBe(0);
    expect(animateWarnings.length).toBe(0);
  });

  test('should render page without NaN or Infinity values', async ({ page }) => {
    const pageErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('NaN') || text.includes('Infinity')) {
        pageErrors.push(`[${msg.type()}] ${text}`);
      }
    });

    console.log('\n📍 Loading page to check for NaN/Infinity...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // 페이지 콘텐츠 검증
    const content = await page.content();
    const hasNaN = content.includes('NaN');
    const hasInfinity = content.includes('Infinity');

    console.log(`\n페이지 콘텐츠 검증:`);
    console.log(`  - NaN 포함: ${hasNaN}`);
    console.log(`  - Infinity 포함: ${hasInfinity}`);

    if (pageErrors.length > 0) {
      console.log('\n⚠️  에러 발견:');
      pageErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    }

    expect(hasNaN).toBe(false);
    expect(hasInfinity).toBe(false);
    expect(pageErrors.length).toBe(0);

    console.log('\n✅ 페이지 검증 완료!');
  });

  test('should handle static data correctly without animation errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const text = msg.text();
        if (text.includes('animate') || text.includes('width')) {
          errors.push(`[${msg.type()}] ${text}`);
        }
      }
    });

    console.log('\n📍 Testing with static data...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 정적 데이터 로드 대기
    await page.waitForTimeout(3000);

    // 페이지가 올바르게 렌더링되었는지 확인
    const isVisible = await page.locator('body').isVisible();
    console.log(`페이지 렌더링: ${isVisible ? '✅ 성공' : '❌ 실패'}`);

    expect(isVisible).toBe(true);
    expect(errors.length).toBe(0);
  });
});
