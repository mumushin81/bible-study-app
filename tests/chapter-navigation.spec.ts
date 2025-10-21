import { test, expect } from '@playwright/test';

/**
 * 창세기 전체 50장 네비게이션 테스트
 *
 * 목적:
 * - 모든 챕터가 UI에서 접근 가능한지 확인
 * - 각 챕터의 데이터가 DB에서 정상적으로 로드되는지 확인
 * - Quick jump 기능 테스트
 * - 챕터 전환 시 데이터가 올바르게 표시되는지 확인
 */

test.describe('창세기 50장 네비게이션 테스트', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5177');
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('모든 50개 챕터 버튼이 표시되는지 확인', async ({ page }) => {
    // 북 선택 버튼 클릭
    await page.click('button:has-text("창세기 1장")');

    // 바텀시트 로드 대기
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });

    // 창세기 책 버튼 클릭 - 스크롤 후 클릭
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });

    // 챕터 선택 화면 대기
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });

    // Quick jump 버튼 확인 (1-10, 11-20, 21-30, 31-40, 41-50)
    await expect(page.locator('text=1-10')).toBeVisible();
    await expect(page.locator('text=11-20')).toBeVisible();
    await expect(page.locator('text=21-30')).toBeVisible();
    await expect(page.locator('text=31-40')).toBeVisible();
    await expect(page.locator('text=41-50')).toBeVisible();

    // 모든 챕터 버튼 카운트 확인
    const chapterButtons = page.locator('button[id^="chapter-"]');
    await expect(chapterButtons).toHaveCount(50);

    console.log('✅ 모든 50개 챕터 버튼 확인 완료');
  });

  test('샘플 챕터 데이터 로딩 테스트 (1, 25, 50장)', async ({ page }) => {
    const testChapters = [
      { chapter: 1, expectedRef: 'Genesis 1:1' },
      { chapter: 25, expectedRef: 'Genesis 25:1' },
      { chapter: 50, expectedRef: 'Genesis 50:1' }
    ];

    for (const { chapter, expectedRef } of testChapters) {
      console.log(`\n📖 챕터 ${chapter} 테스트 중...`);

      // 페이지 상단으로 스크롤 (헤더 버튼이 보이도록)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(500);

      // 북 선택 버튼 클릭 (챕터 번호에 관계없이 창세기 버튼 선택)
      await page.click('button:has-text("창세기"):has-text("장")');
      await page.waitForSelector('text=성경 선택', { timeout: 5000 });

      // 창세기 클릭
      const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
      await genesisButton.scrollIntoViewIfNeeded();
      await genesisButton.click({ force: true });
      await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });

      // 챕터 버튼 클릭
      await page.click(`button[id="chapter-${chapter}"]`);

      // 바텀시트 닫힘 대기
      await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });

      // 구절 참조 확인
      await page.waitForSelector(`text=${expectedRef}`, { timeout: 10000 });

      // 히브리어 텍스트 로드 확인 (빈 문자열이 아닌지)
      const hebrewText = await page.locator('[dir="rtl"]').first().textContent();
      expect(hebrewText).toBeTruthy();
      expect(hebrewText!.length).toBeGreaterThan(0);

      // [TODO] 텍스트가 아닌 실제 컨텐츠 확인
      const isTodoContent = hebrewText!.includes('[TODO');
      if (isTodoContent) {
        console.log(`   ⚠️  챕터 ${chapter}: 한글 컨텐츠 TODO 상태`);
      } else {
        console.log(`   ✅ 챕터 ${chapter}: 데이터 로드 완료`);
      }

      // 현대어 의역 확인
      const modernText = await page.locator('text=✨ 현대어 의역').locator('..').locator('p').textContent();
      expect(modernText).toBeTruthy();

      console.log(`   Hebrew: ${hebrewText!.substring(0, 30)}...`);
      console.log(`   Modern: ${modernText!.substring(0, 50)}...`);
    }
  });

  test('Quick Jump 기능 테스트', async ({ page }) => {
    // 북 선택 버튼 클릭
    await page.click('button:has-text("창세기 1장")');
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });

    // 창세기 클릭
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });

    // "41-50" quick jump 버튼 클릭
    await page.click('text=41-50');

    // 챕터 41 버튼이 화면에 보이는지 확인 (스크롤됨)
    await expect(page.locator('button[id="chapter-41"]')).toBeInViewport();

    // 챕터 50 선택
    await page.click('button[id="chapter-50"]');

    // 바텀시트 닫힘 대기
    await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });

    // Genesis 50:1 확인
    await page.waitForSelector('text=Genesis 50:1', { timeout: 10000 });

    console.log('✅ Quick Jump 기능 정상 작동');
  });

  test('챕터 전환 시 구절 인덱스 리셋 확인', async ({ page }) => {
    // 1장으로 시작
    await page.waitForSelector('text=Genesis 1:1', { timeout: 10000 });

    // 다음 구절로 이동 (1:2)
    await page.click('button:has-text("다음")');
    await page.waitForSelector('text=Genesis 1:2', { timeout: 5000 });

    // 북 선택하여 2장으로 전환
    await page.click('button:has-text("창세기 1장")');
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
    await page.click('button[id="chapter-2"]');
    await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });

    // 2:1로 리셋되었는지 확인 (2:2가 아님)
    await page.waitForSelector('text=Genesis 2:1', { timeout: 10000 });

    console.log('✅ 챕터 전환 시 구절 인덱스 리셋 확인');
  });

  test('구절 네비게이션 (이전/다음) 테스트', async ({ page }) => {
    // Genesis 1:1에서 시작
    await page.waitForSelector('text=Genesis 1:1', { timeout: 10000 });

    // 이전 버튼이 비활성화되어 있는지 확인 (첫 구절이므로)
    const prevButton = page.locator('button[aria-label="이전 구절"]');
    await expect(prevButton).toBeDisabled();

    // 다음 버튼 클릭
    const nextButton = page.locator('button[aria-label="다음 구절"]');
    await nextButton.click();
    await page.waitForSelector('text=Genesis 1:2', { timeout: 5000 });

    // 이전 버튼이 활성화되었는지 확인
    await expect(prevButton).toBeEnabled();

    // 이전 버튼으로 다시 1:1로 이동
    await prevButton.click();
    await page.waitForSelector('text=Genesis 1:1', { timeout: 5000 });

    console.log('✅ 구절 네비게이션 정상 작동');
  });

  test('헤더 표시 정보 확인', async ({ page }) => {
    // 1장으로 시작
    await page.waitForSelector('text=Genesis 1:1', { timeout: 10000 });

    // 헤더에 "창세기 1장 1/31절" 형태로 표시되는지 확인
    const headerText = await page.locator('button:has-text("창세기 1장")').textContent();

    expect(headerText).toContain('창세기');
    expect(headerText).toContain('1장');
    expect(headerText).toMatch(/\d+\/\d+절/); // "1/31절" 같은 형태

    console.log(`✅ 헤더 표시: ${headerText}`);
  });

  test('데이터 완성도 분석 - 50개 챕터', async ({ page }) => {
    console.log('\n📊 창세기 전체 데이터 완성도 분석 시작...\n');

    const stats = {
      totalChapters: 0,
      chaptersWithData: 0,
      chaptersWithKorean: 0,
      chaptersWithTodo: 0,
    };

    // 샘플링: 1, 10, 20, 30, 40, 50장 테스트
    const sampleChapters = [1, 10, 20, 30, 40, 50];

    for (const chapter of sampleChapters) {
      stats.totalChapters++;

      // 페이지 상단으로 스크롤 (헤더 버튼이 보이도록)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(500);

      // 북 선택 (챕터 번호에 관계없이 창세기 버튼 선택)
      await page.click('button:has-text("창세기"):has-text("장")');
      await page.waitForSelector('text=성경 선택', { timeout: 5000 });
      const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
      await genesisButton.scrollIntoViewIfNeeded();
      await genesisButton.click({ force: true });
      await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });

      // 챕터 선택
      await page.click(`button[id="chapter-${chapter}"]`);
      await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector(`text=Genesis ${chapter}:1`, { timeout: 10000 });

      // 데이터 로드 확인
      const hebrewText = await page.locator('[dir="rtl"]').first().textContent();
      const modernText = await page.locator('text=✨ 현대어 의역').locator('..').locator('p').textContent();

      if (hebrewText && hebrewText.length > 0) {
        stats.chaptersWithData++;
      }

      if (modernText && !modernText.includes('[TODO')) {
        stats.chaptersWithKorean++;
      } else {
        stats.chaptersWithTodo++;
      }

      console.log(`   Chapter ${chapter}: ${modernText!.includes('[TODO') ? '⚠️  TODO' : '✅ Korean'}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 샘플링 결과 (6개 챕터):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`총 샘플: ${stats.totalChapters}개 챕터`);
    console.log(`데이터 로드: ${stats.chaptersWithData}/${stats.totalChapters} (${(stats.chaptersWithData/stats.totalChapters*100).toFixed(1)}%)`);
    console.log(`한글 컨텐츠: ${stats.chaptersWithKorean}/${stats.totalChapters} (${(stats.chaptersWithKorean/stats.totalChapters*100).toFixed(1)}%)`);
    console.log(`TODO 상태: ${stats.chaptersWithTodo}/${stats.totalChapters} (${(stats.chaptersWithTodo/stats.totalChapters*100).toFixed(1)}%)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});
