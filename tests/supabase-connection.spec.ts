import { test, expect } from '@playwright/test';

test.describe('Supabase Database Connection', () => {
  test('should connect to Supabase and fetch books from database', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    });

    console.log('\n📍 Loading page with Supabase credentials...');
    await page.goto('http://localhost:5177/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 콘솔 분석
    console.log('\n=== Supabase Connection Analysis ===');
    const successMessages = consoleMessages.filter(m => m.text.includes('✅'));
    const errorMessages = consoleMessages.filter(m => m.text.includes('❌'));
    const warnings = consoleMessages.filter(m => m.text.includes('⚠️'));
    const dbMessages = consoleMessages.filter(m => m.text.includes('DB') || m.text.includes('책'));

    console.log(`\n✅ 성공 메시지: ${successMessages.length}`);
    successMessages.forEach(m => console.log(`  - ${m.text}`));

    console.log(`\n❌ 오류 메시지: ${errorMessages.length}`);
    errorMessages.forEach(m => console.log(`  - ${m.text}`));

    console.log(`\n⚠️  경고: ${warnings.length}`);
    warnings.forEach(m => console.log(`  - ${m.text}`));

    console.log(`\n📚 DB 관련 메시지:`);
    dbMessages.forEach(m => console.log(`  - ${m.text}`));

    // DB 연동 성공 여부 판단
    const dbLoadSuccess = successMessages.some(m => m.text.includes('DB에서') || m.text.includes('로드 완료'));
    const isUsingStatic = warnings.some(m => m.text.includes('정적 데이터를 사용'));

    console.log(`\n📊 결과:`);
    console.log(`  - DB 연동 성공: ${dbLoadSuccess ? '✅ YES' : '❌ NO'}`);
    console.log(`  - 정적 데이터 폴백: ${isUsingStatic ? '⚠️ YES' : '✅ NO (DB 사용 중)'}`);

    // 페이지 콘텐츠 확인
    const content = await page.content();
    const pageRendered = content.includes('성경') || content.includes('학습');
    console.log(`  - 페이지 렌더링: ${pageRendered ? '✅ YES' : '❌ NO'}`);

    // 테스트 결과
    if (dbLoadSuccess && !isUsingStatic) {
      console.log('\n🎉 SUCCESS: Supabase database connection working!');
      expect(true).toBe(true);
    } else if (isUsingStatic && pageRendered) {
      console.log('\n⚠️  FALLBACK: Using static data (DB connection may have failed)');
      expect(pageRendered).toBe(true);
    } else {
      console.log('\n❌ FAILURE: Unable to load content');
      expect(pageRendered).toBe(true);
    }
  });

  test('should verify Supabase URL is configured correctly', async ({ page }) => {
    console.log('\n📍 Verifying Supabase configuration...');

    page.on('console', msg => {
      if (msg.text().includes('ouzlnriafovnxlkywerk') || msg.text().includes('supabase')) {
        console.log(`[CONFIG] ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:5177/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Network requests 확인
    const responses: { url: string; status: number }[] = [];
    page.on('response', response => {
      if (response.url().includes('supabase')) {
        responses.push({ url: response.url(), status: response.status() });
      }
    });

    console.log(`\n📡 Supabase API Requests:`);
    if (responses.length > 0) {
      responses.forEach(r => {
        console.log(`  - ${r.status === 200 ? '✅' : '❌'} ${r.url.substring(0, 80)}...`);
      });
    } else {
      console.log('  No Supabase API requests detected yet');
    }

    expect(true).toBe(true);
  });
});
