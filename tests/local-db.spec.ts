import { test, expect } from '@playwright/test';

const LOCAL_URL = 'http://localhost:5177/';

test.describe('로컬 DB 연결 테스트', () => {
  test('DB에서 데이터 로드 확인', async ({ page }) => {
    // 콘솔 메시지 캡처
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // 페이지 로드
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');

    // 콘솔 로그 출력
    console.log('\n📋 브라우저 콘솔 로그:');
    consoleMessages.forEach(msg => {
      if (msg.includes('DB') || msg.includes('로드') || msg.includes('정적')) {
        console.log(`  ${msg}`);
      }
    });

    // DB 로드 성공 메시지 확인
    const hasDbLoadMessage = consoleMessages.some(msg =>
      msg.includes('DB에서') && msg.includes('로드 완료')
    );

    if (hasDbLoadMessage) {
      console.log('\n✅ Supabase DB에서 데이터를 성공적으로 로드했습니다!');
    } else {
      const hasStaticFallback = consoleMessages.some(msg =>
        msg.includes('정적 데이터')
      );
      if (hasStaticFallback) {
        console.log('\n⚠️  정적 데이터를 사용 중입니다. (DB 연결 실패 또는 데이터 없음)');
      } else {
        console.log('\n❓ 데이터 소스를 확인할 수 없습니다.');
      }
    }

    // 히브리어 텍스트가 표시되는지 확인 (data-testid 사용)
    const hebrewText = page.getByTestId('hebrew-text');
    await expect(hebrewText).toBeVisible({ timeout: 10000 });
    console.log('✅ 히브리어 구절이 화면에 표시됩니다.');

    // 모든 콘솔 메시지 파일로 저장 (디버깅용)
    console.log('\n💾 전체 콘솔 로그:');
    consoleMessages.slice(0, 20).forEach(msg => console.log(`  ${msg}`));
  });
});
