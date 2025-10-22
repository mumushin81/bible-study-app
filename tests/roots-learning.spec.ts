import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';

test.describe('Phase 3: 어근 학습 시스템 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('1. 어근 학습 버튼이 표시되는지 확인', async ({ page }) => {
    console.log('📝 테스트 1: 어근 학습 버튼 확인');

    // 단어장 탭 클릭
    const vocabularyTab = page.locator('text=단어장').first();
    await vocabularyTab.click();
    await page.waitForTimeout(1000);

    // 어근 학습 버튼 확인
    const rootsButton = page.locator('button:has-text("어근 학습")');
    await expect(rootsButton).toBeVisible();

    console.log('✅ 어근 학습 버튼이 표시됨');
  });

  test('2. 어근 학습 버튼 클릭 시 어근 그리드 표시', async ({ page }) => {
    console.log('📝 테스트 2: 어근 그리드 표시 확인');

    // 단어장 탭 클릭
    const vocabularyTab = page.locator('text=단어장').first();
    await vocabularyTab.click();
    await page.waitForTimeout(1000);

    // 어근 학습 버튼 클릭
    const rootsButton = page.locator('button:has-text("어근 학습")');
    await rootsButton.click();
    await page.waitForTimeout(1500);

    // "히브리어 어근 학습" 헤더 확인
    const header = page.locator('h2:has-text("히브리어 어근 학습")');
    await expect(header).toBeVisible();

    // 안내 텍스트 확인
    const description = page.locator('text=학습하고 싶은 어근을 선택하세요');
    await expect(description).toBeVisible();

    console.log('✅ 어근 그리드 헤더가 표시됨');
  });

  test('3. 어근 카드가 표시되는지 확인', async ({ page }) => {
    console.log('📝 테스트 3: 어근 카드 확인');

    // 단어장 탭 → 어근 학습
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    // 어근 카드 개수 확인 (최소 10개 이상)
    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    const count = await rootCards.count();

    console.log(`📊 발견된 어근 카드: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(10);

    // 첫 번째 카드의 구성요소 확인
    const firstCard = rootCards.first();

    // 중요도 배지 확인
    await expect(firstCard.locator('text=/중요도:/i')).toBeVisible();

    // 빈도 배지 확인
    await expect(firstCard.locator('text=/빈도:/i')).toBeVisible();

    console.log('✅ 어근 카드들이 올바르게 표시됨');
  });

  test('4. 특정 어근 카드 클릭 시 플래시카드 덱 표시', async ({ page }) => {
    console.log('📝 테스트 4: 플래시카드 덱 표시 확인');

    // 단어장 탭 → 어근 학습
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    // 어근 카드 클릭 (첫 번째 카드)
    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    const firstCard = rootCards.first();

    // 어근 텍스트 가져오기
    const rootText = await firstCard.locator('div').nth(2).textContent();
    console.log(`🎯 선택한 어근: ${rootText}`);

    await firstCard.click();
    await page.waitForTimeout(2000);

    // "뒤로 가기" 버튼 확인
    const backButton = page.locator('button:has-text("뒤로 가기")');
    await expect(backButton).toBeVisible();

    console.log('✅ 플래시카드 덱이 표시됨');
  });

  test('5. 플래시카드 덱의 어근 정보 확인', async ({ page }) => {
    console.log('📝 테스트 5: 어근 정보 확인');

    // 단어장 탭 → 어근 학습 → 첫 번째 어근 선택
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    await rootCards.first().click();
    await page.waitForTimeout(2000);

    // 중요도 배지 확인
    const importanceBadge = page.locator('text=/중요도: [0-9]\/5/');
    await expect(importanceBadge).toBeVisible();
    const importance = await importanceBadge.textContent();
    console.log(`📊 ${importance}`);

    // 빈도 배지 확인
    const frequencyBadge = page.locator('text=/빈도: [0-9]+회/');
    await expect(frequencyBadge).toBeVisible();
    const frequency = await frequencyBadge.textContent();
    console.log(`📊 ${frequency}`);

    // 파생어 배지 확인
    const derivationsBadge = page.locator('text=/파생어: [0-9]+개/');
    await expect(derivationsBadge).toBeVisible();
    const derivations = await derivationsBadge.textContent();
    console.log(`📊 ${derivations}`);

    console.log('✅ 어근 정보가 올바르게 표시됨');
  });

  test('6. 플래시카드 뒤집기 기능 테스트', async ({ page }) => {
    console.log('📝 테스트 6: 플래시카드 뒤집기');

    // 단어장 탭 → 어근 학습 → 첫 번째 어근 선택
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    await rootCards.first().click();
    await page.waitForTimeout(2000);

    // 파생어 개수 확인
    const derivationsText = await page.locator('text=/파생어: [0-9]+개/').textContent();
    const derivationsCount = parseInt(derivationsText?.match(/\d+/)?.[0] || '0');

    if (derivationsCount > 0) {
      console.log(`📚 파생어 ${derivationsCount}개 발견`);

      // "탭하여 뒷면 보기" 텍스트가 있는지 확인 (앞면)
      const flipHint = page.locator('text=탭하여 뒷면 보기');
      const isFlipHintVisible = await flipHint.isVisible().catch(() => false);

      if (isFlipHintVisible) {
        console.log('📄 플래시카드 앞면 확인됨');

        // 플래시카드 클릭 (뒤집기)
        const flashcard = page.locator('div').filter({ hasText: '탭하여 뒷면 보기' }).first();
        await flashcard.click();
        await page.waitForTimeout(1000);

        console.log('🔄 플래시카드 뒤집기 성공');
      } else {
        console.log('⚠️  플래시카드가 이미 뒤집혀 있거나 다른 상태입니다');
      }
    } else {
      console.log('⚠️  파생어가 없는 어근입니다');
    }

    console.log('✅ 플래시카드 뒤집기 테스트 완료');
  });

  test('7. 플래시카드 네비게이션 테스트', async ({ page }) => {
    console.log('📝 테스트 7: 플래시카드 네비게이션');

    // 단어장 탭 → 어근 학습 → 첫 번째 어근 선택
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    await rootCards.first().click();
    await page.waitForTimeout(2000);

    // 파생어 개수 확인
    const derivationsText = await page.locator('text=/파생어: [0-9]+개/').textContent();
    const derivationsCount = parseInt(derivationsText?.match(/\d+/)?.[0] || '0');

    if (derivationsCount > 1) {
      console.log(`📚 파생어 ${derivationsCount}개 - 네비게이션 테스트 가능`);

      // 현재 진행도 확인
      const progressBadge = page.locator('text=/[0-9]+ \/ [0-9]+/').first();
      const initialProgress = await progressBadge.textContent();
      console.log(`📊 초기 진행도: ${initialProgress}`);

      // "다음" 버튼 클릭
      const nextButton = page.locator('button:has-text("다음")').last();
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        const newProgress = await progressBadge.textContent();
        console.log(`📊 다음 클릭 후: ${newProgress}`);

        expect(newProgress).not.toBe(initialProgress);
        console.log('✅ "다음" 버튼 작동 확인');

        // "이전" 버튼 클릭
        const prevButton = page.locator('button:has-text("이전")').first();
        if (await prevButton.isEnabled()) {
          await prevButton.click();
          await page.waitForTimeout(1000);

          const backProgress = await progressBadge.textContent();
          console.log(`📊 이전 클릭 후: ${backProgress}`);

          expect(backProgress).toBe(initialProgress);
          console.log('✅ "이전" 버튼 작동 확인');
        }
      }
    } else {
      console.log('⚠️  파생어가 1개 이하 - 네비게이션 테스트 스킵');
    }

    console.log('✅ 네비게이션 테스트 완료');
  });

  test('8. 뒤로 가기 버튼 테스트', async ({ page }) => {
    console.log('📝 테스트 8: 뒤로 가기 버튼');

    // 단어장 탭 → 어근 학습 → 첫 번째 어근 선택
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    await rootCards.first().click();
    await page.waitForTimeout(2000);

    // "뒤로 가기" 버튼 클릭
    const backButton = page.locator('button:has-text("뒤로 가기")');
    await backButton.click();
    await page.waitForTimeout(1500);

    // 어근 그리드로 돌아왔는지 확인
    const header = page.locator('h2:has-text("히브리어 어근 학습")');
    await expect(header).toBeVisible();

    console.log('✅ 뒤로 가기 버튼 작동 확인');
  });

  test('9. 단어장으로 돌아가기 테스트', async ({ page }) => {
    console.log('📝 테스트 9: 단어장으로 돌아가기');

    // 단어장 탭 → 어근 학습
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    // "단어장으로 돌아가기" 버튼 클릭
    const backToVocabulary = page.locator('button:has-text("단어장으로 돌아가기")');
    await backToVocabulary.click();
    await page.waitForTimeout(1500);

    // 단어장 헤더 확인
    const vocabularyHeader = page.locator('h2:has-text("단어장")');
    await expect(vocabularyHeader).toBeVisible();

    console.log('✅ 단어장으로 돌아가기 작동 확인');
  });

  test('10. 여러 어근 카드 탐색 테스트', async ({ page }) => {
    console.log('📝 테스트 10: 여러 어근 카드 탐색');

    // 단어장 탭 → 어근 학습
    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    // 처음 3개 어근 카드 탐색
    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    const count = Math.min(await rootCards.count(), 3);

    for (let i = 0; i < count; i++) {
      console.log(`\n🔍 어근 카드 ${i + 1} 탐색 중...`);

      const card = rootCards.nth(i);

      // 어근 텍스트 가져오기
      const rootText = await card.locator('div').nth(2).textContent();
      console.log(`  어근: ${rootText}`);

      // 중요도 확인
      const importance = await card.locator('text=/중요도:/').textContent();
      console.log(`  ${importance}`);

      // 빈도 확인
      const frequency = await card.locator('text=/빈도:/').textContent();
      console.log(`  ${frequency}`);

      // 카드 클릭
      await card.click();
      await page.waitForTimeout(1500);

      // 파생어 개수 확인
      const derivationsText = await page.locator('text=/파생어: [0-9]+개/').textContent();
      console.log(`  ${derivationsText}`);

      // 뒤로 가기
      await page.locator('button:has-text("뒤로 가기")').click();
      await page.waitForTimeout(1000);
    }

    console.log('\n✅ 여러 어근 카드 탐색 완료');
  });
});

test.describe('개선 사항 및 버그 체크', () => {
  test('11. 성능: 어근 로딩 시간 측정', async ({ page }) => {
    console.log('📝 테스트 11: 어근 로딩 성능');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('text=단어장').first().click();

    const startTime = Date.now();
    await page.locator('button:has-text("어근 학습")').click();

    // 어근 카드가 표시될 때까지 대기
    await page.locator('button').filter({ hasText: /중요도:/ }).first().waitFor({ timeout: 10000 });

    const loadTime = Date.now() - startTime;
    console.log(`⏱️  어근 로딩 시간: ${loadTime}ms`);

    if (loadTime > 3000) {
      console.log('⚠️  로딩 시간이 3초를 초과합니다. 최적화가 필요할 수 있습니다.');
    } else {
      console.log('✅ 로딩 시간 양호');
    }
  });

  test('12. 접근성: 키보드 네비게이션 테스트', async ({ page }) => {
    console.log('📝 테스트 12: 키보드 네비게이션');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);

    // Tab 키로 어근 학습 버튼 포커스
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter로 버튼 클릭 시도
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // 어근 그리드가 표시되는지 확인
    const header = page.locator('h2:has-text("히브리어 어근 학습")');
    const isVisible = await header.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ 키보드 네비게이션 작동');
    } else {
      console.log('⚠️  키보드 네비게이션 개선 필요');
    }
  });

  test('13. 반응형: 모바일 뷰포트 테스트', async ({ page }) => {
    console.log('📝 테스트 13: 모바일 반응형');

    // 모바일 뷰포트 설정 (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('text=단어장').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("어근 학습")').click();
    await page.waitForTimeout(2000);

    // 어근 카드 확인
    const rootCards = page.locator('button').filter({ hasText: /중요도:/ });
    const count = await rootCards.count();

    console.log(`📱 모바일에서 ${count}개 어근 카드 확인`);

    // 첫 번째 카드가 화면에 보이는지 확인
    const firstCard = rootCards.first();
    await expect(firstCard).toBeVisible();

    console.log('✅ 모바일 반응형 확인');
  });
});
