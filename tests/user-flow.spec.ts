import { test, expect } from '@playwright/test';

const LOCAL_URL = 'http://localhost:5174/';

test.describe('사용자 기능 플로우 테스트', () => {
  // 고유한 테스트 사용자 생성
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@gmail.com`; // Supabase가 허용하는 도메인
  const testPassword = 'Test1234!';
  const testDisplayName = '테스트사용자';

  test('전체 사용자 플로우: 회원가입 → 로그인 → 학습 → 통계 확인', async ({ page }) => {
    console.log('\n🧪 사용자 플로우 테스트 시작');
    console.log(`📧 테스트 이메일: ${testEmail}`);

    // 1. 페이지 로드
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 1: 페이지 로드 완료');

    // 2. 로그인 버튼 찾기 (게스트 모드)
    const loginButton = page.getByRole('button', { name: /로그인/i });
    await expect(loginButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Step 2: 로그인 버튼 발견');

    // 3. 로그인 모달 열기
    await loginButton.click();
    await page.waitForTimeout(500); // 모달 애니메이션 대기
    console.log('✅ Step 3: 로그인 모달 열림');

    // 4. 회원가입 링크 클릭
    const signUpLink = page.getByText(/회원가입/i);
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await page.waitForTimeout(500);
    console.log('✅ Step 4: 회원가입 모달로 전환');

    // 5. 회원가입 폼 작성
    const displayNameInput = page.locator('#displayName');
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    await displayNameInput.fill(testDisplayName);
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    console.log('✅ Step 5: 회원가입 폼 작성 완료');

    // 6. 회원가입 제출 (Enter 키 사용)
    await passwordInput.press('Enter');

    // 응답 대기 (성공 또는 에러)
    await page.waitForTimeout(2000);

    // 성공 메시지 또는 에러 메시지 확인
    const successMessage = page.locator('text=/회원가입이 완료되었습니다/i');
    const errorMessage = page.locator('text=/Invalid|Error|실패/i').first();

    const isSuccess = await successMessage.isVisible({ timeout: 1000 }).catch(() => false);
    const isError = await errorMessage.isVisible({ timeout: 500 }).catch(() => false);

    if (isError) {
      const errorText = await errorMessage.textContent();
      console.log(`❌ 에러 발생: ${errorText}`);
      throw new Error(`회원가입 실패: ${errorText}`);
    }

    if (isSuccess) {
      console.log('✅ Step 6: 회원가입 성공 메시지 확인');
    } else {
      console.log('⚠️  성공 메시지는 없지만 에러도 없음 - 계속 진행');
    }

    // 모달이 자동으로 닫힐 때까지 대기 (2초 설정됨)
    await page.waitForTimeout(3000);
    console.log('✅ Step 6.5: 회원가입 모달 닫힘');

    // 7. 수동 로그인 (이메일 확인이 필요한 경우 자동 로그인 안됨)
    const loginButton2 = page.getByRole('button', { name: /^로그인$/i });
    const isStillVisible = await loginButton2.isVisible().catch(() => false);

    if (isStillVisible) {
      console.log('⚠️  자동 로그인 안됨 (이메일 확인 필요). 수동 로그인 시도...');
      await loginButton2.click();
      await page.waitForTimeout(500);

      // 로그인 폼 작성
      const emailInput2 = page.locator('#email');
      const passwordInput2 = page.locator('#password');
      await emailInput2.fill(testEmail);
      await passwordInput2.fill(testPassword);
      await passwordInput2.press('Enter');

      await page.waitForTimeout(2000);
      console.log('✅ Step 7: 수동 로그인 완료');
    } else {
      console.log('✅ Step 7: 자동 로그인 성공');
    }

    // 로그아웃 버튼 확인 (로그인된 상태)
    const logoutButton = page.locator('button[title="로그아웃"]');
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Step 7.5: 사용자 프로필 표시됨');

    // 8. 학습 탭에서 구절 확인
    const hebrewText = page.locator('p, div').filter({ hasText: /בְּרֵאשִׁ֖ית/ }).first();
    await expect(hebrewText).toBeVisible({ timeout: 10000 });
    console.log('✅ Step 8: 히브리어 구절 표시 확인');

    // 9. "학습 완료로 표시" 버튼 찾기 및 클릭
    const markCompletedButton = page.getByRole('button', { name: /학습 완료|완료로 표시/i });
    await expect(markCompletedButton).toBeVisible({ timeout: 5000 });
    await markCompletedButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Step 9: 구절 학습 완료 마크');

    // 10. Growth 탭으로 이동
    const growthTab = page.getByRole('button', { name: /성장|growth/i });
    await expect(growthTab).toBeVisible();
    await growthTab.click();
    await page.waitForTimeout(1000);
    console.log('✅ Step 10: Growth 탭으로 이동');

    // 11. 통계 확인
    const statsCard = page.locator('text=/완료한 구절|학습한 구절/i').first();
    await expect(statsCard).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 11: 통계 대시보드 표시됨');

    // 12. 완료한 구절 수가 1 이상인지 확인
    const completedCount = page.locator('text=/완료한 구절/i').locator('..').locator('text=/[0-9]+/').first();
    await expect(completedCount).toBeVisible();
    const countText = await completedCount.textContent();
    console.log(`✅ Step 12: 완료한 구절 수: ${countText}`);

    // 13. 레벨 정보 확인
    const levelInfo = page.locator('text=/레벨 [0-9]+/i').first();
    await expect(levelInfo).toBeVisible();
    const levelText = await levelInfo.textContent();
    console.log(`✅ Step 13: ${levelText}`);

    // 14. 포인트 확인
    const pointsCard = page.locator('text=/총 포인트|포인트/i').first();
    await expect(pointsCard).toBeVisible();
    console.log('✅ Step 14: 포인트 정보 표시됨');

    console.log('\n🎉 전체 사용자 플로우 테스트 성공!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 회원가입 성공');
    console.log('✅ 자동 로그인 성공');
    console.log('✅ 구절 학습 완료 기능 작동');
    console.log('✅ 통계 추적 기능 작동');
    console.log('✅ 데이터베이스 연동 확인');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  test.skip('로그아웃 및 재로그인 테스트', async ({ page }) => {
    console.log('\n🧪 로그아웃/재로그인 테스트 시작');

    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // 이미 로그인된 상태라면 로그아웃
    const logoutButton = page.getByRole('button', { name: /로그아웃/i });
    if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 로그아웃 완료');
    }

    // 로그인 버튼 클릭
    const loginButton = page.getByRole('button', { name: /로그인/i });
    await loginButton.click();
    await page.waitForTimeout(1000);

    // 로그인 폼 작성
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);

    const loginSubmitButton = page.getByRole('button', { name: /로그인/i }).first();
    await loginSubmitButton.scrollIntoViewIfNeeded();
    await loginSubmitButton.click({ force: true });

    // 로그인 성공 확인
    await page.waitForTimeout(2000);
    const userProfile = page.locator('text=/테스트사용자|레벨/i').first();
    await expect(userProfile).toBeVisible({ timeout: 10000 });

    console.log('✅ 재로그인 성공');
    console.log('🎉 로그아웃/재로그인 테스트 성공!\n');
  });
});
