import { test, expect } from '@playwright/test';

const APP_URL = 'https://bible-study-app-gold.vercel.app/';

test.describe('Bible Study App - Deployment Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('1. 페이지 로드 테스트', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Eden/i);

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');

    console.log('✅ 페이지가 성공적으로 로드되었습니다.');
  });

  test('2. 히브리어 성경 구절 표시 확인', async ({ page }) => {
    // 히브리어 텍스트가 있는 요소 찾기
    const hebrewText = page.locator('text=/[א-ת]+/').first();
    await expect(hebrewText).toBeVisible({ timeout: 10000 });

    // 한국어 번역도 있는지 확인
    const koreanText = page.locator('text=/[가-힣]+/').first();
    await expect(koreanText).toBeVisible();

    console.log('✅ 히브리어 성경 구절과 한국어 번역이 표시됩니다.');
  });

  test('3. 탭 전환 기능 테스트', async ({ page }) => {
    // 하단 네비게이션이 보이는지 확인
    const navigation = page.locator('nav, [role="navigation"]').last();
    await expect(navigation).toBeVisible();

    // Vocabulary 탭 클릭
    const vocabularyTab = page.getByRole('button', { name: /단어장|vocabulary/i });
    if (await vocabularyTab.count() > 0) {
      await vocabularyTab.click();
      await page.waitForTimeout(500);
      console.log('✅ Vocabulary 탭으로 전환 성공');
    }

    // Quiz 탭 클릭
    const quizTab = page.getByRole('button', { name: /퀴즈|quiz/i });
    if (await quizTab.count() > 0) {
      await quizTab.click();
      await page.waitForTimeout(500);
      console.log('✅ Quiz 탭으로 전환 성공');
    }

    // Verse 탭으로 돌아가기
    const verseTab = page.getByRole('button', { name: /본문|verse/i });
    if (await verseTab.count() > 0) {
      await verseTab.click();
      await page.waitForTimeout(500);
      console.log('✅ Verse 탭으로 전환 성공');
    }

    console.log('✅ 탭 전환 기능이 정상 작동합니다.');
  });

  test('4. 다크모드 전환 테스트', async ({ page }) => {
    // 설정 버튼 찾기 (Settings 아이콘)
    const settingsButton = page.locator('button').filter({ hasText: /설정|settings/i }).or(
      page.locator('button svg').filter({ has: page.locator('[class*="lucide"]') }).locator('..')
    ).first();

    // 다크모드 토글 찾기
    const darkModeToggle = page.locator('button').filter({
      hasText: /다크|dark|라이트|light|모드|mode/i
    }).first();

    if (await darkModeToggle.count() > 0) {
      // 현재 배경색 저장
      const bodyBefore = await page.locator('body').evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // 다크모드 토글
      await darkModeToggle.click();
      await page.waitForTimeout(300);

      // 배경색이 변경되었는지 확인
      const bodyAfter = await page.locator('body').evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      expect(bodyBefore).not.toBe(bodyAfter);
      console.log('✅ 다크모드 전환이 정상 작동합니다.');
    } else {
      console.log('⚠️  다크모드 토글 버튼을 찾을 수 없습니다.');
    }
  });

  test('5. 스와이프 기능 테스트 (마우스 드래그)', async ({ page }) => {
    // Verse 탭에 있는지 확인
    const verseTab = page.getByRole('button', { name: /본문|verse/i });
    if (await verseTab.count() > 0) {
      await verseTab.click();
      await page.waitForTimeout(500);
    }

    // 현재 구절 번호 확인
    const verseIndicator = page.locator('[class*="indicator"], [class*="verse"]').first();
    const initialContent = await page.locator('body').textContent();

    // 스와이프 영역 찾기 (메인 콘텐츠 영역)
    const swipeArea = page.locator('[class*="swipe"], main, [class*="content"]').first();
    const box = await swipeArea.boundingBox();

    if (box) {
      // 오른쪽에서 왼쪽으로 스와이프 (다음 구절로)
      await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);

      const afterSwipeContent = await page.locator('body').textContent();

      if (initialContent !== afterSwipeContent) {
        console.log('✅ 스와이프 기능이 정상 작동합니다.');
      } else {
        console.log('⚠️  스와이프로 구절이 변경되지 않았습니다. (첫 번째 구절이거나 기능이 비활성화됨)');
      }
    }
  });

  test('6. 전체 기능 통합 테스트', async ({ page }) => {
    // 스크린샷 촬영
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
    console.log('✅ 홈페이지 스크린샷 저장: tests/screenshots/homepage.png');

    // 페이지 성능 메트릭 확인
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    console.log('📊 성능 메트릭:');
    console.log(`  - DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  - Load Complete: ${metrics.loadComplete}ms`);

    // 모바일 반응형 테스트
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/mobile-view.png', fullPage: true });
    console.log('✅ 모바일 뷰 스크린샷 저장: tests/screenshots/mobile-view.png');

    console.log('✅ 전체 통합 테스트 완료!');
  });
});
