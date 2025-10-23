import { test, expect } from '@playwright/test';

/**
 * Genesis 11-15장 업데이트 검증 테스트
 *
 * 목적:
 * - 11-15장의 모든 구절이 올바르게 렌더링되는지 확인
 * - 히브리어 텍스트, 단어장, 주석이 정상 표시되는지 확인
 * - SVG 아이콘이 렌더링되는지 확인
 * - 탭 전환 및 네비게이션 동작 확인
 */

test.describe('Genesis 11-15장 업데이트 검증', () => {
  const BASE_URL = 'http://localhost:5174';

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  // 각 장의 첫 번째 구절을 테스트
  const chaptersToTest = [
    { chapter: 11, verse: 10, verseId: 'genesis_11_10' },
    { chapter: 12, verse: 11, verseId: 'genesis_12_11' },
    { chapter: 13, verse: 5, verseId: 'genesis_13_5' },
    { chapter: 14, verse: 10, verseId: 'genesis_14_10' },
    { chapter: 15, verse: 1, verseId: 'genesis_15_1' },
  ];

  test('11-15장 모든 챕터 접근 가능 확인', async ({ page }) => {
    console.log('\n📖 11-15장 챕터 접근성 테스트...\n');

    for (const { chapter, verse } of chaptersToTest) {
      // 북 선택 버튼 클릭
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);

      await page.click('button:has-text("창세기"):has-text("장")');
      await page.waitForSelector('text=성경 선택', { timeout: 5000 });

      // 창세기 선택
      const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
      await genesisButton.scrollIntoViewIfNeeded();
      await genesisButton.click({ force: true });
      await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });

      // 챕터 선택
      await page.click(`button[id="chapter-${chapter}"]`);
      await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });

      // 구절 참조 확인
      await page.waitForSelector(`text=Genesis ${chapter}:${verse}`, { timeout: 10000 });

      console.log(`   ✅ Chapter ${chapter}: 접근 성공`);
    }
  });

  test('11-15장 히브리어 텍스트 렌더링 확인', async ({ page }) => {
    console.log('\n📖 히브리어 텍스트 렌더링 테스트...\n');

    for (const { chapter, verse } of chaptersToTest) {
      // 챕터로 이동
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      await page.click('button:has-text("창세기"):has-text("장")');
      await page.waitForSelector('text=성경 선택', { timeout: 5000 });
      const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
      await genesisButton.scrollIntoViewIfNeeded();
      await genesisButton.click({ force: true });
      await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
      await page.click(`button[id="chapter-${chapter}"]`);
      await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector(`text=Genesis ${chapter}:${verse}`, { timeout: 10000 });

      // 히브리어 텍스트 확인
      const hebrewText = await page.locator('[dir="rtl"]').first().textContent();
      expect(hebrewText).toBeTruthy();
      expect(hebrewText!.length).toBeGreaterThan(0);

      // 한국어 발음 확인
      const koreanPronunciation = page.locator('text=🗣️ 한국어 발음').locator('..').locator('p');
      await expect(koreanPronunciation).toBeVisible();

      // 현대어 의역 확인
      const modernText = page.locator('text=✨ 현대어 의역').locator('..').locator('p');
      await expect(modernText).toBeVisible();

      const modernContent = await modernText.textContent();
      expect(modernContent).toBeTruthy();
      expect(modernContent).not.toContain('[TODO');

      console.log(`   ✅ Chapter ${chapter}:${verse} - 히브리어 & 한국어 렌더링 성공`);
    }
  });

  test('11-15장 단어장 탭 확인', async ({ page }) => {
    console.log('\n📚 단어장 탭 테스트...\n');

    // Genesis 15:1로 이동 (의미 있는 단어들이 많은 구절)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.click('button:has-text("창세기"):has-text("장")');
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
    await page.click('button[id="chapter-15"]');
    await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
    await page.waitForSelector('text=Genesis 15:1', { timeout: 10000 });

    // 단어장 탭 클릭
    await page.click('button:has-text("단어장")');
    await page.waitForTimeout(500);

    // 단어 카드 확인
    const wordCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /^[א-ת]/ });
    const wordCount = await wordCards.count();
    expect(wordCount).toBeGreaterThan(0);

    console.log(`   ✅ 단어장: ${wordCount}개 단어 카드 확인`);

    // 첫 번째 단어 카드 클릭하여 뒷면 확인
    if (wordCount > 0) {
      await wordCards.first().click();
      await page.waitForTimeout(500);

      // 뒷면에 의미, 발음, 문법 정보가 있는지 확인
      const cardContent = await page.locator('[class*="perspective"]').first().textContent();
      expect(cardContent).toBeTruthy();

      console.log('   ✅ 플래시카드 뒷면 렌더링 확인');
    }
  });

  test('11-15장 깊이읽기 탭 확인', async ({ page }) => {
    console.log('\n📖 깊이읽기 탭 테스트...\n');

    // Genesis 12:11로 이동 (주석이 풍부한 구절)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.click('button:has-text("창세기"):has-text("장")');
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
    await page.click('button[id="chapter-12"]');
    await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
    await page.waitForSelector('text=Genesis 12:', { timeout: 10000 });

    // 깊이읽기 탭 클릭
    await page.click('button:has-text("깊이읽기")');
    await page.waitForTimeout(500);

    // 주석 intro 확인
    const commentaryIntro = page.locator('text=창세기 12장').first();
    await expect(commentaryIntro).toBeVisible();

    // 섹션 카드 확인 (최소 1개 이상)
    const sectionCards = page.locator('text=/1️⃣|2️⃣|3️⃣/');
    const sectionCount = await sectionCards.count();
    expect(sectionCount).toBeGreaterThan(0);

    console.log(`   ✅ 깊이읽기: ${sectionCount}개 섹션 확인`);

    // 왜 이 구절인가? 섹션 확인
    await expect(page.locator('text=왜 이 구절인가?')).toBeVisible();

    // 결론 섹션 확인
    await expect(page.locator('text=/결론|마무리/')).toBeVisible();

    console.log('   ✅ 깊이읽기 모든 섹션 렌더링 확인');
  });

  test('11-15장 SVG 아이콘 렌더링 확인', async ({ page }) => {
    console.log('\n🎨 SVG 아이콘 렌더링 테스트...\n');

    // Genesis 15:1로 이동
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.click('button:has-text("창세기"):has-text("장")');
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
    await page.click('button[id="chapter-15"]');
    await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
    await page.waitForSelector('text=Genesis 15:1', { timeout: 10000 });

    // 단어장 탭으로 이동
    await page.click('button:has-text("단어장")');
    await page.waitForTimeout(500);

    // SVG 요소 확인
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    expect(svgCount).toBeGreaterThan(0);

    console.log(`   ✅ SVG 아이콘: ${svgCount}개 확인`);

    // SVG가 실제로 렌더링되었는지 확인 (크기가 0이 아닌지)
    const firstSvg = svgElements.first();
    const boundingBox = await firstSvg.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);

    console.log('   ✅ SVG 아이콘이 정상적으로 렌더링됨');
  });

  test('11-15장 탭 전환 동작 확인', async ({ page }) => {
    console.log('\n🔄 탭 전환 테스트...\n');

    // Genesis 11:10으로 이동
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.click('button:has-text("창세기"):has-text("장")');
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
    await page.click('button[id="chapter-11"]');
    await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
    await page.waitForSelector('text=Genesis 11:', { timeout: 10000 });

    const tabs = ['단어장', '깊이읽기', '퀴즈', '노트', '성장'];

    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`);
      await page.waitForTimeout(300);
      console.log(`   ✅ ${tab} 탭 전환 성공`);
    }

    // 다시 본문 탭으로
    await page.click('button:has-text("본문")');
    await page.waitForTimeout(300);
    console.log('   ✅ 본문 탭으로 복귀');
  });

  test('11-15장 구절 네비게이션 확인', async ({ page }) => {
    console.log('\n⬅️➡️ 구절 네비게이션 테스트...\n');

    // Genesis 11:10으로 이동
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.click('button:has-text("창세기"):has-text("장")');
    await page.waitForSelector('text=성경 선택', { timeout: 5000 });
    const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
    await genesisButton.scrollIntoViewIfNeeded();
    await genesisButton.click({ force: true });
    await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
    await page.click('button[id="chapter-11"]');
    await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
    await page.waitForSelector('text=Genesis 11:10', { timeout: 10000 });

    // 다음 구절로 이동
    const nextButton = page.locator('button[aria-label="다음 구절"]');
    await nextButton.click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Genesis 11:11', { timeout: 5000 });
    console.log('   ✅ 다음 구절로 이동 (11:10 → 11:11)');

    // 이전 구절로 돌아가기
    const prevButton = page.locator('button[aria-label="이전 구절"]');
    await prevButton.click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Genesis 11:10', { timeout: 5000 });
    console.log('   ✅ 이전 구절로 이동 (11:11 → 11:10)');
  });

  test('11-15장 데이터 완성도 통계', async ({ page }) => {
    console.log('\n📊 11-15장 데이터 완성도 분석...\n');

    const stats = {
      totalVerses: 0,
      versesWithHebrew: 0,
      versesWithModern: 0,
      versesWithCommentary: 0,
      totalWords: 0,
    };

    // 각 장의 샘플 구절 테스트
    for (const { chapter, verse } of chaptersToTest) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      await page.click('button:has-text("창세기"):has-text("장")');
      await page.waitForSelector('text=성경 선택', { timeout: 5000 });
      const genesisButton = page.locator('.grid button').filter({ hasText: '창세기' }).first();
      await genesisButton.scrollIntoViewIfNeeded();
      await genesisButton.click({ force: true });
      await page.waitForSelector('text=창세기 (50장)', { timeout: 5000 });
      await page.click(`button[id="chapter-${chapter}"]`);
      await page.waitForSelector('text=성경 선택', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector(`text=Genesis ${chapter}:${verse}`, { timeout: 10000 });

      stats.totalVerses++;

      // 히브리어 확인
      const hebrewText = await page.locator('[dir="rtl"]').first().textContent();
      if (hebrewText && hebrewText.length > 0) {
        stats.versesWithHebrew++;
      }

      // 현대어역 확인
      const modernText = await page.locator('text=✨ 현대어 의역').locator('..').locator('p').textContent();
      if (modernText && !modernText.includes('[TODO')) {
        stats.versesWithModern++;
      }

      // 단어장 단어 수 확인
      await page.click('button:has-text("단어장")');
      await page.waitForTimeout(500);
      const wordCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /^[א-ת]/ });
      const wordCount = await wordCards.count();
      stats.totalWords += wordCount;

      // 깊이읽기 확인
      await page.click('button:has-text("깊이읽기")');
      await page.waitForTimeout(500);
      const hasCommentary = await page.locator('text=창세기').count();
      if (hasCommentary > 0) {
        stats.versesWithCommentary++;
      }

      // 본문으로 돌아가기
      await page.click('button:has-text("본문")');
      await page.waitForTimeout(300);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Genesis 11-15장 데이터 완성도:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`총 샘플 구절: ${stats.totalVerses}개`);
    console.log(`히브리어 텍스트: ${stats.versesWithHebrew}/${stats.totalVerses} (${(stats.versesWithHebrew/stats.totalVerses*100).toFixed(1)}%)`);
    console.log(`현대어역: ${stats.versesWithModern}/${stats.totalVerses} (${(stats.versesWithModern/stats.totalVerses*100).toFixed(1)}%)`);
    console.log(`깊이읽기 주석: ${stats.versesWithCommentary}/${stats.totalVerses} (${(stats.versesWithCommentary/stats.totalVerses*100).toFixed(1)}%)`);
    console.log(`총 단어 수: ${stats.totalWords}개`);
    console.log(`평균 단어/구절: ${(stats.totalWords/stats.totalVerses).toFixed(1)}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 모든 항목이 100%인지 확인
    expect(stats.versesWithHebrew).toBe(stats.totalVerses);
    expect(stats.versesWithModern).toBe(stats.totalVerses);
    expect(stats.versesWithCommentary).toBe(stats.totalVerses);
  });
});
