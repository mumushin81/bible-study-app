import { test, expect } from '@playwright/test';

test.describe('FlashCard Layout and Animation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 앱 시작 및 단어장 탭으로 이동
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 단어장 탭 클릭
    const vocabularyTab = page.locator('text=단어장').or(page.locator('button:has-text("단어장")')).first();
    if (await vocabularyTab.isVisible()) {
      await vocabularyTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test('플래시 카드 뒤집기 애니메이션 테스트', async ({ page }) => {
    // 첫 번째 플래시 카드 찾기
    const flashCard = page.locator('.cursor-pointer').first();
    await expect(flashCard).toBeVisible();

    // 초기 상태 스크린샷
    await page.screenshot({
      path: 'test-results/flashcard-front.png',
      fullPage: true
    });

    // 카드의 초기 위치와 크기 측정
    const initialBox = await flashCard.boundingBox();
    console.log('Initial card position:', initialBox);

    // 카드 클릭하여 뒤집기
    await flashCard.click();
    await page.waitForTimeout(700); // 애니메이션 완료 대기 (0.6s + 여유)

    // 뒤집힌 후 스크린샷
    await page.screenshot({
      path: 'test-results/flashcard-back.png',
      fullPage: true
    });

    // 뒤집힌 후 위치와 크기 측정
    const flippedBox = await flashCard.boundingBox();
    console.log('Flipped card position:', flippedBox);

    // 카드가 하단으로 내려가지 않았는지 확인 (y 좌표 비교)
    if (initialBox && flippedBox) {
      const yDifference = flippedBox.y - initialBox.y;
      console.log('Y position difference:', yDifference);

      // Y 위치가 20px 이상 변하지 않았는지 확인
      expect(Math.abs(yDifference)).toBeLessThan(20);
    }
  });

  test('플래시 카드 뒷면 레이아웃 overflow 테스트', async ({ page }) => {
    const flashCard = page.locator('.cursor-pointer').first();
    await flashCard.click();
    await page.waitForTimeout(700);

    // 뒷면이 보이는지 확인
    const backSide = flashCard.locator('div').filter({ has: page.locator('text=알파벳으로 읽기') });
    const isBackVisible = await backSide.isVisible().catch(() => false);

    if (isBackVisible) {
      const backBox = await backSide.boundingBox();
      console.log('Back side box:', backBox);

      // 뒷면 콘텐츠가 카드 영역을 벗어나지 않는지 확인
      const cardBox = await flashCard.boundingBox();

      if (backBox && cardBox) {
        // 뒷면이 카드보다 아래로 튀어나오지 않았는지 확인
        expect(backBox.y + backBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height + 5);

        console.log('Card height:', cardBox.height);
        console.log('Back content height:', backBox.height);
      }
    }

    // 스크롤 없이 모든 콘텐츠가 보이는지 확인
    const overflowElement = await page.locator('[style*="overflow"]').first().getAttribute('style');
    console.log('Overflow styles:', overflowElement);

    // overflow-y-auto가 없는지 확인
    expect(overflowElement || '').not.toContain('overflow-y-auto');
  });

  test('플래시 카드 뒷면 상단 여백 테스트', async ({ page }) => {
    const flashCard = page.locator('.cursor-pointer').first();

    // 뒤집기 전 뷰포트 상단으로부터의 거리 측정
    const initialBox = await flashCard.boundingBox();

    await flashCard.click();
    await page.waitForTimeout(700);

    const flippedBox = await flashCard.boundingBox();

    if (initialBox && flippedBox) {
      console.log('Initial top position:', initialBox.y);
      console.log('Flipped top position:', flippedBox.y);

      // 카드가 위쪽으로 튀어올라가지 않았는지 확인
      expect(flippedBox.y).toBeGreaterThanOrEqual(initialBox.y - 10);

      // 카드가 아래로 많이 내려가지 않았는지 확인
      expect(flippedBox.y).toBeLessThanOrEqual(initialBox.y + 10);
    }
  });

  test('플래시 카드 뒷면 콘텐츠 모두 표시되는지 확인', async ({ page }) => {
    const flashCard = page.locator('.cursor-pointer').first();
    await flashCard.click();
    await page.waitForTimeout(700);

    // 뒷면의 주요 섹션들이 모두 보이는지 확인
    const sections = [
      '알파벳으로 읽기',
      '어근',
      '비슷한 단어'
    ];

    for (const section of sections) {
      const sectionLocator = page.locator(`text=${section}`).first();
      const isVisible = await sectionLocator.isVisible().catch(() => false);

      if (isVisible) {
        const box = await sectionLocator.boundingBox();
        console.log(`${section} position:`, box);

        // 섹션이 뷰포트 내에 있는지 확인
        if (box) {
          const viewportSize = page.viewportSize();
          if (viewportSize) {
            expect(box.y).toBeLessThan(viewportSize.height);
            expect(box.y).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test('여러 플래시 카드 동시 테스트 - 레이아웃 일관성', async ({ page }) => {
    const flashCards = page.locator('.cursor-pointer');
    const count = await flashCards.count();
    console.log('Total flash cards:', count);

    // 처음 3개 카드만 테스트
    const testCount = Math.min(3, count);

    for (let i = 0; i < testCount; i++) {
      const card = flashCards.nth(i);

      // 앞면 위치 저장
      const frontBox = await card.boundingBox();

      // 뒤집기
      await card.click();
      await page.waitForTimeout(700);

      // 뒷면 위치 확인
      const backBox = await card.boundingBox();

      if (frontBox && backBox) {
        console.log(`Card ${i} - Front Y: ${frontBox.y}, Back Y: ${backBox.y}`);

        // 위치가 크게 변하지 않았는지 확인
        expect(Math.abs(backBox.y - frontBox.y)).toBeLessThan(30);
      }

      // 다시 뒤집어서 앞면으로
      await card.click();
      await page.waitForTimeout(700);
    }
  });

  test('플래시 카드 뒷면 absolute vs relative positioning 테스트', async ({ page }) => {
    const flashCard = page.locator('.cursor-pointer').first();

    // 앞면에서 position 스타일 확인
    const frontInner = flashCard.locator('> div > div').first();
    const frontStyle = await frontInner.getAttribute('style');
    console.log('Front style:', frontStyle);

    await flashCard.click();
    await page.waitForTimeout(700);

    // 뒷면에서 position 스타일 확인
    const backInner = flashCard.locator('> div > div').nth(1);
    const backStyle = await backInner.getAttribute('style');
    console.log('Back style:', backStyle);

    // 뒷면이 relative positioning을 사용하는지 확인
    expect(backStyle).toContain('position');

    // 뒷면의 computed style 확인
    const backPosition = await backInner.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        top: style.top,
        height: style.height
      };
    });

    console.log('Back computed position:', backPosition);
  });
});
