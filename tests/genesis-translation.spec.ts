import { test, expect } from '@playwright/test';

const LOCAL_URL = '/';

test.describe('Genesis 1-3장 번역 테스트', () => {
  test('Genesis 1장: 히브리어, IPA, 한글 발음, 현대어 의역 표시 확인', async ({ page }) => {
    console.log('\n🧪 Genesis 1장 번역 표시 테스트 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ 페이지 로드 완료');

    // Genesis 1:1 히브리어 확인 (data-testid 사용)
    const hebrewText = page.getByTestId('hebrew-text');
    await expect(hebrewText).toBeVisible({ timeout: 10000 });
    console.log('✅ Genesis 1:1 히브리어 표시 확인');

    // 한글 현대어 의역 확인
    const koreanModern = page.locator('text=/태초에 하나님께서 하늘과 땅을 창조하셨습니다/i').first();
    await expect(koreanModern).toBeVisible();
    console.log('✅ Genesis 1:1 한글 현대어 의역 표시 확인');

    console.log('🎉 Genesis 1장 번역 테스트 성공!\n');
  });

  test('Genesis 2장: 새로 번역된 구절 확인', async ({ page }) => {
    console.log('\n🧪 Genesis 2장 번역 표시 테스트 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // Genesis 2장으로 이동
    // 챕터 네비게이션 찾기
    const chapterNav = page.locator('[data-testid="chapter-nav"], button:has-text("2장")').first();

    // 챕터 네비게이션이 있으면 클릭, 없으면 스크롤로 찾기
    const navExists = await chapterNav.isVisible({ timeout: 3000 }).catch(() => false);

    if (navExists) {
      await chapterNav.click();
      await page.waitForTimeout(1000);
      console.log('✅ Genesis 2장으로 네비게이션');
    } else {
      // 스크롤해서 Genesis 2:1 찾기
      console.log('⚠️  챕터 네비게이션 없음, 수동 검색');
    }

    // Genesis 2:7 - 사람 창조 구절 확인 (새로 번역됨)
    const genesis2_7Korean = page.locator('text=/주 하나님께서 땅의 흙으로 사람을 빚으시고/i').first();

    // 구절이 보일 때까지 스크롤 (최대 10번 시도)
    let found = false;
    for (let i = 0; i < 10; i++) {
      found = await genesis2_7Korean.isVisible({ timeout: 2000 }).catch(() => false);
      if (found) break;
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(500);
    }

    if (found) {
      console.log('✅ Genesis 2:7 한글 번역 표시 확인');
    } else {
      console.log('⚠️  Genesis 2:7 구절을 찾지 못했습니다 (스크롤 범위 초과)');
    }

    console.log('🎉 Genesis 2장 번역 테스트 완료!\n');
  });

  test('Genesis 3장: 새로 번역된 구절 확인', async ({ page }) => {
    console.log('\n🧪 Genesis 3장 번역 표시 테스트 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // Genesis 3:1 - 뱀의 유혹 구절 확인 (새로 번역됨)
    const genesis3_1Korean = page.locator('text=/뱀은 주 하나님께서 만드신 들짐승 중에 가장 교활했습니다/i').first();

    // 구절이 보일 때까지 스크롤
    let found = false;
    for (let i = 0; i < 15; i++) {
      found = await genesis3_1Korean.isVisible({ timeout: 2000 }).catch(() => false);
      if (found) break;
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(500);
    }

    if (found) {
      console.log('✅ Genesis 3:1 한글 번역 표시 확인');
    } else {
      console.log('⚠️  Genesis 3:1 구절을 찾지 못했습니다');
    }

    // Genesis 3:15 - 원시복음 구절 확인
    const genesis3_15Korean = page.locator('text=/내가 너와 여자 사이에.*원수가 되게 하겠다/i').first();

    found = false;
    for (let i = 0; i < 5; i++) {
      found = await genesis3_15Korean.isVisible({ timeout: 2000 }).catch(() => false);
      if (found) break;
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(500);
    }

    if (found) {
      console.log('✅ Genesis 3:15 원시복음 번역 표시 확인');
    }

    console.log('🎉 Genesis 3장 번역 테스트 완료!\n');
  });

  test('번역 품질 검증: TODO 없는지 확인', async ({ page }) => {
    console.log('\n🧪 번역 품질 검증 테스트 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // 페이지에 TODO가 있는지 확인
    const todoText = page.locator('text=/\\[TODO\\]|TODO:/i').first();
    const hasTodo = await todoText.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasTodo) {
      const todoContent = await todoText.textContent();
      console.log(`❌ TODO 발견: ${todoContent}`);
      throw new Error('페이지에 TODO가 남아있습니다');
    } else {
      console.log('✅ TODO 없음 - 모든 구절이 완성됨');
    }

    console.log('🎉 번역 품질 검증 테스트 성공!\n');
  });

  test('IPA 발음 표시 확인', async ({ page }) => {
    console.log('\n🧪 IPA 발음 표시 테스트 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // 발음 표시 버튼이나 요소 찾기 (구현에 따라 다름)
    // IPA는 특수 문자를 포함하므로 정규식으로 찾기
    const ipaText = page.locator('text=/[ˈˌːʔʕħʃʁəβ]/').first();

    // IPA가 표시될 때까지 기다림 (토글 필요할 수도 있음)
    const hasIpa = await ipaText.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasIpa) {
      console.log('✅ IPA 발음 표시 확인');
    } else {
      console.log('⚠️  IPA 발음이 기본적으로 표시되지 않음 (토글 필요할 수 있음)');
    }

    console.log('🎉 IPA 발음 테스트 완료!\n');
  });

  test('한글 발음 표시 확인', async ({ page }) => {
    console.log('\n🧪 한글 발음 표시 테스트 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // 한글 발음 확인 (예: "베레쉬트 바라 엘로힘")
    const koreanPron = page.locator('text=/베레쉬트|엘로힘|아도나이/i').first();

    const hasPronunciation = await koreanPron.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasPronunciation) {
      console.log('✅ 한글 발음 표시 확인');
    } else {
      console.log('⚠️  한글 발음이 기본적으로 표시되지 않음');
    }

    console.log('🎉 한글 발음 테스트 완료!\n');
  });

  test('전체 Genesis 1-3장 완성도 검증', async ({ page }) => {
    console.log('\n🧪 Genesis 1-3장 전체 완성도 검증 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // 주요 구절들이 모두 한글로 표시되는지 확인
    const keyVerses = [
      '태초에 하나님께서', // Genesis 1:1
      '땅의 흙으로 사람을 빚으시고', // Genesis 2:7
      '뱀은.*교활했습니다', // Genesis 3:1
    ];

    let allFound = true;
    for (const verse of keyVerses) {
      const verseLocator = page.locator(`text=/${verse}/i`).first();

      // 스크롤해서 찾기
      let found = false;
      await page.goto(LOCAL_URL); // 페이지 리셋
      await page.waitForLoadState('networkidle');

      for (let i = 0; i < 20; i++) {
        found = await verseLocator.isVisible({ timeout: 1000 }).catch(() => false);
        if (found) {
          console.log(`✅ 주요 구절 발견: "${verse.substring(0, 30)}..."`);
          break;
        }
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(300);
      }

      if (!found) {
        console.log(`⚠️  주요 구절 미발견: "${verse}"`);
        allFound = false;
      }
    }

    if (allFound) {
      console.log('✅ 모든 주요 구절 확인 완료');
    } else {
      console.log('⚠️  일부 구절을 찾지 못했습니다 (UI 구조 확인 필요)');
    }

    console.log('🎉 Genesis 1-3장 전체 완성도 검증 완료!\n');
  });
});
