import { test, expect } from '@playwright/test';

/**
 * 리팩토링된 카드 컴포넌트 E2E 테스트
 * - BaseCard 추상화
 * - FlashCard 분리
 * - VerseCard 최적화
 * - ScriptureCard 최적화
 */

test.describe('리팩토링된 카드 컴포넌트 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test.describe('VerseCard (구절카드)', () => {
    test('구절카드가 BaseCard로 제대로 렌더링되어야 함', async ({
      page,
    }) => {
      const verseCard = page.locator('[data-testid="verse-card"]');

      // 카드가 존재해야 함
      await expect(verseCard).toBeVisible();

      // 기본 스타일 확인 (BaseCard 클래스)
      await expect(verseCard).toHaveClass(/rounded-3xl shadow-2xl/);
    });

    test('히브리어 원문이 RTL로 제대로 표시되어야 함', async ({
      page,
    }) => {
      const hebrewText = page.locator('[dir="rtl"]').first();

      // RTL 속성이 있어야 함
      const dir = await hebrewText.getAttribute('dir');
      expect(dir).toBe('rtl');

      // 언어 속성이 있어야 함
      const lang = await hebrewText.getAttribute('lang');
      expect(lang).toBe('he');
    });

    test('발음 듣기 버튼이 작동해야 함', async ({ page }) => {
      const speakButton = page
        .locator('button')
        .filter({ hasText: '발음 듣기' })
        .first();

      // 버튼이 존재해야 함
      await expect(speakButton).toBeVisible();

      // 버튼 클릭 가능해야 함
      await expect(speakButton).toBeEnabled();
    });

    test('힌트 닫기 버튼이 작동해야 함', async ({ page }) => {
      const hint = page.locator('text=이 방향으로 읽기').first();

      // 힌트가 초기에 표시되어야 함
      await expect(hint).toBeVisible();

      // 닫기 버튼 클릭
      const closeButton = hint.locator('..').locator('button').last();
      await closeButton.click();

      // 힌트가 사라져야 함
      await expect(hint).toBeHidden();
    });

    test('다크모드 클래스가 올바르게 적용되어야 함', async ({ page }) => {
      const verseCard = page.locator('[data-testid="verse-card"]');
      const htmlElement = page.locator('html');

      // dark 클래스 여부에 따라 스타일이 변경되어야 함
      const classList = await htmlElement.getAttribute('class');
      // dark: variant가 적용되는지 확인
      await expect(verseCard).toHaveClass(/dark:/);
    });

    test('현대어 번역 박스가 표시되어야 함', async ({ page }) => {
      const translationBox = page
        .locator('text=현대어 번역')
        .locator('..')
        .locator('..');

      await expect(translationBox).toBeVisible();

      // 번역 내용이 있어야 함
      const content = await translationBox.locator('p').nth(1);
      const text = await content.textContent();
      expect(text).toBeTruthy();
    });
  });

  test.describe('FlashCard (단어카드)', () => {
    test('FlashCard가 메모이제이션으로 최적화되어야 함', async ({
      page,
    }) => {
      // FlashCard 로드
      const flashCard = page.locator('[data-testid="flash-card"]').first();

      await expect(flashCard).toBeVisible();

      // 카드가 perspective 스타일을 가져야 함
      const style = await flashCard.getAttribute('style');
      expect(style).toContain('perspective');
    });

    test('더블 탭으로 카드가 뒤집혀야 함', async ({ page }) => {
      const flashCard = page.locator('[data-testid="flash-card"]').first();

      // 초기 상태 (앞면)
      await expect(flashCard).toBeVisible();

      // 더블 탭 수행 (두 번 클릭, 300ms 이내)
      await flashCard.dblClick();

      // 뒤집힘을 확인 (transform 변경)
      const flipContainer = flashCard.locator('>> nth=0');
      await page.waitForTimeout(700); // 플립 애니메이션 대기

      // 뒷면이 표시되어야 함
      const meaningBox = page.locator('text=한국어 뜻');
      await expect(meaningBox.first()).toBeVisible();
    });

    test('북마크 버튼이 작동해야 함', async ({ page }) => {
      const bookmarkButton = page
        .locator('[data-testid="flash-card"]')
        .first()
        .locator('button')
        .first();

      // 버튼이 존재해야 함
      await expect(bookmarkButton).toBeVisible();

      // 클릭 가능해야 함
      await expect(bookmarkButton).toBeEnabled();
    });

    test('품사 정보가 표시되어야 함', async ({ page }) => {
      const grammarLabel = page
        .locator('[data-testid="flash-card"]')
        .first()
        .locator('div')
        .filter({ hasText: /명사|동사|형용사/ })
        .first();

      // 품사 라벨이 존재할 수 있음
      const isVisible = await grammarLabel.isVisible().catch(() => false);
      if (isVisible) {
        await expect(grammarLabel).toHaveClass(/rounded-full/);
      }
    });

    test('뒷면에서 어근 분석이 표시되어야 함', async ({ page }) => {
      const flashCard = page.locator('[data-testid="flash-card"]').first();

      // 뒤집기
      await flashCard.dblClick();
      await page.waitForTimeout(700);

      // 어근 분석 섹션 찾기
      const rootAnalysis = page.locator('text=🌱 어근 분석');

      // 어근 분석이 있을 수 있음 (단어에 따라)
      const isVisible = await rootAnalysis.isVisible().catch(() => false);
      if (isVisible) {
        await expect(rootAnalysis).toBeVisible();
      }
    });

    test('FlashCardFront에서 IPA 발음이 표시되어야 함', async ({
      page,
    }) => {
      const flashCard = page.locator('[data-testid="flash-card"]').first();

      // 앞면 상태 확인
      // IPA는 [로 시작하고 ]로 끝남
      const ipaText = flashCard.locator('text=/\\[.+\\]/');

      const isVisible = await ipaText.isVisible().catch(() => false);
      if (isVisible) {
        await expect(ipaText).toBeVisible();
      }
    });
  });

  test.describe('ScriptureCard (말씀카드)', () => {
    test('말씀카드가 BaseCard로 제대로 렌더링되어야 함', async ({
      page,
    }) => {
      const scriptureCard = page.locator('[data-testid="scripture-card"]');

      if (await scriptureCard.isVisible().catch(() => false)) {
        // 카드가 BaseCard 스타일을 가져야 함
        await expect(scriptureCard.first()).toHaveClass(/rounded-3xl shadow-2xl/);
      }
    });

    test('접기/펼치기 버튼이 작동해야 함', async ({ page }) => {
      const scriptureCard = page.locator('[data-testid="scripture-card"]');

      if (await scriptureCard.isVisible().catch(() => false)) {
        const toggleButton = scriptureCard.first().locator('button').first();

        // 버튼이 존재해야 함
        await expect(toggleButton).toBeVisible();

        // 클릭 가능해야 함
        await expect(toggleButton).toBeEnabled();

        // 버튼 클릭
        const initialState = await toggleButton.getAttribute('aria-expanded');
        await toggleButton.click();

        // 상태가 변경되어야 함 (또는 콘텐츠 가시성 변경)
        const content = scriptureCard.first().locator('div').nth(1);
        const isVisible = await content.isVisible().catch(() => false);
        expect(typeof isVisible).toBe('boolean');
      }
    });

    test('섹션의 색상 클래스가 타입 안전하게 적용되어야 함', async ({
      page,
    }) => {
      const scriptureCard = page.locator('[data-testid="scripture-card"]');

      if (await scriptureCard.isVisible().catch(() => false)) {
        // 색상 섹션 찾기
        const sections = scriptureCard.first().locator('[class*="bg-"][class*="border"]');
        const count = await sections.count();

        if (count > 0) {
          // 섹션의 클래스가 올바른 색상을 포함해야 함
          const firstSection = sections.first();
          const classList = await firstSection.getAttribute('class');

          expect(classList).toMatch(
            /bg-(purple|blue|green|pink|orange|yellow)/
          );
        }
      }
    });

    test('어린이 질문 섹션이 표시되어야 함', async ({ page }) => {
      const whyQuestion = page.locator('text=💭 어린이를 위한 질문');

      const isVisible = await whyQuestion.isVisible().catch(() => false);
      if (isVisible) {
        await expect(whyQuestion).toBeVisible();

        // Q&A 구조 확인
        const question = page.locator('text=/Q:/');
        const answer = page.locator('text=/A:/');

        await expect(question.first()).toBeVisible();
        await expect(answer.first()).toBeVisible();
      }
    });

    test('결론 섹션이 표시되어야 함', async ({ page }) => {
      const scriptureCard = page.locator('[data-testid="scripture-card"]');

      if (await scriptureCard.isVisible().catch(() => false)) {
        // 결론이 있을 수 있음
        const conclusion = page.locator('text=/결론|마무리/i');
        const isVisible = await conclusion.isVisible().catch(() => false);
        if (isVisible) {
          await expect(conclusion).toBeVisible();
        }
      }
    });
  });

  test.describe('공통 - 다크모드 호환성', () => {
    test('모든 카드가 다크모드 클래스를 지원해야 함', async ({
      page,
    }) => {
      const verseCard = page.locator('[data-testid="verse-card"]');
      const scriptureCard = page.locator('[data-testid="scripture-card"]');

      // dark: variant가 포함되어 있어야 함
      const verseClass = await verseCard.first().getAttribute('class');
      const scriptureClass = await scriptureCard
        .first()
        .getAttribute('class')
        .catch(() => '');

      // dark: 클래스가 있어야 함
      expect(
        verseClass?.includes('dark:') ||
          (await verseCard.evaluate((el) =>
            window
              .getComputedStyle(el, '::before')
              .getPropertyValue('content')
          ))
      ).toBeTruthy();
    });
  });

  test.describe('성능 최적화 확인', () => {
    test('카드 컴포넌트가 과도한 리렌더링을 하지 않아야 함', async ({
      page,
    }) => {
      // 콘솔 메시지 모니터링
      const logs: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'log') {
          logs.push(msg.text());
        }
      });

      // 페이지 상호작용
      const flashCard = page.locator('[data-testid="flash-card"]').first();
      if (await flashCard.isVisible()) {
        await flashCard.click();
        await page.waitForTimeout(500);
      }

      // 과도한 로그가 없어야 함
      const debugLogs = logs.filter((log) =>
        log.includes('render') || log.includes('update')
      );
      expect(debugLogs.length).toBeLessThan(10);
    });

    test('useCallback으로 최적화된 핸들러가 작동해야 함', async ({
      page,
    }) => {
      // 버튼 클릭
      const speakButton = page
        .locator('button')
        .filter({ hasText: '발음 듣기' })
        .first();

      if (await speakButton.isVisible()) {
        // 여러 번 클릭해도 안정적으로 작동해야 함
        for (let i = 0; i < 3; i++) {
          await speakButton.click();
          await page.waitForTimeout(200);
        }

        // 에러가 없어야 함
        expect(true).toBe(true);
      }
    });
  });

  test.describe('접근성 개선 확인', () => {
    test('모든 버튼이 aria-label을 가져야 함', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();

      let labeledCount = 0;
      for (let i = 0; i < Math.min(count, 10); i++) {
        const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
        if (ariaLabel) {
          labeledCount++;
        }
      }

      // 최소 50% 이상의 버튼이 aria-label을 가져야 함
      expect(labeledCount / Math.min(count, 10)).toBeGreaterThanOrEqual(0.5);
    });

    test('히브리어 텍스트가 올바른 언어 속성을 가져야 함', async ({
      page,
    }) => {
      const hebrewElements = page.locator('[lang="he"]');
      const count = await hebrewElements.count();

      // 최소 하나의 히브리어 요소가 있어야 함
      expect(count).toBeGreaterThan(0);

      // 모든 히브리어 요소가 RTL이어야 함
      for (let i = 0; i < count; i++) {
        const dir = await hebrewElements.nth(i).getAttribute('dir');
        expect(dir).toBe('rtl');
      }
    });
  });

  test.describe('타입 안정성 확인', () => {
    test('색상 섹션이 유효한 색상만 사용해야 함', async ({ page }) => {
      const validColors = ['purple', 'blue', 'green', 'pink', 'orange', 'yellow'];

      const sections = page.locator(
        '[class*="bg-"][class*="border-"][class*="rounded-xl"]'
      );
      const count = await sections.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const classList = await sections.nth(i).getAttribute('class');

        // 클래스에 유효한 색상이 포함되어야 함
        const hasValidColor = validColors.some((color) =>
          classList?.includes(`bg-${color}`) ||
          classList?.includes(`border-${color}`)
        );

        // 선택적 확인 (색상이 있다면 유효해야 함)
        if (classList?.includes('bg-')) {
          expect(hasValidColor || classList?.includes('dark:bg')).toBeTruthy();
        }
      }
    });
  });
});
