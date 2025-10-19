# 테스트 결과 및 발견된 이슈

## Phase 2 사용자 기능 테스트 (2025-10-19)

### 테스트 목표
사용자 인증 및 진행률 추적 기능의 전체 플로우 검증:
1. 회원가입
2. 로그인
3. 구절 학습 완료 마크
4. 통계 대시보드 확인

### 테스트 환경
- 로컬 개발 서버 (http://localhost:5173/)
- Supabase 프로덕션 DB
- Playwright (Chromium)

### 테스트 진행 상황

#### ✅ 성공한 단계 (Step 1-7)
1. ✅ 페이지 로드 완료
2. ✅ 로그인 버튼 발견
3. ✅ 로그인 모달 열림
4. ✅ 회원가입 모달로 전환
5. ✅ 회원가입 폼 작성 완료
6. ✅ 회원가입 성공 메시지 확인
7. ✅ 회원가입 모달 자동 닫힘

#### ⚠️ 발견된 이슈

**이슈 #1: Supabase 이메일 확인 설정**
- **증상**: 회원가입 후 로그인 시 "Email not confirmed" 에러
- **원인**: Supabase에서 이메일 확인(Email Confirmation)이 기본 활성화됨
- **영향**:
  - 자동 로그인 실패
  - 수동 로그인 시도 시에도 실패
  - 사용자가 이메일을 확인하기 전까지 로그인 불가
- **해결 방법**:
  1. Supabase Dashboard → Authentication → Email → Confirm email 비활성화
  2. 또는 테스트 환경에서 이메일 확인 자동 처리

**이슈 #2: 이메일 도메인 검증**
- **증상**: `@example.com` 도메인 회원가입 실패
- **원인**: Supabase가 유효하지 않은 이메일 도메인 차단
- **해결**: `@gmail.com` 등 실제 도메인 사용
- **상태**: ✅ 해결됨 (테스트 코드 수정)

**이슈 #3: 회원가입 버튼 viewport 이슈**
- **증상**: 모달 내 버튼이 화면 밖에 위치
- **원인**: 모달 높이가 viewport를 초과할 때 스크롤 필요
- **해결**: Enter 키로 폼 제출 (더 자연스러운 UX)
- **상태**: ✅ 해결됨

### 테스트 코드 개선사항

#### 1. 이메일 도메인 변경
```typescript
// Before
const testEmail = `test${timestamp}@example.com`;

// After
const testEmail = `testuser${timestamp}@gmail.com`;
```

#### 2. 폼 제출 방식 개선
```typescript
// Before: 버튼 클릭 (viewport 이슈 발생)
await signUpSubmitButton.click();

// After: Enter 키 사용 (더 안정적)
await passwordInput.press('Enter');
```

#### 3. 에러 처리 추가
```typescript
// 에러 메시지 확인
const errorMessage = page.locator('[class*="red"]').first();
if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
  const errorText = await errorMessage.textContent();
  throw new Error(`회원가입 실패: ${errorText}`);
}
```

#### 4. 자동/수동 로그인 Fallback
```typescript
// 자동 로그인 실패 시 수동 로그인 시도
const isStillVisible = await loginButton2.isVisible().catch(() => false);
if (isStillVisible) {
  console.log('⚠️  자동 로그인 안됨. 수동 로그인 시도...');
  // 수동 로그인 로직
}
```

### 다음 단계

#### 즉시 필요한 작업
1. **Supabase 이메일 확인 설정 변경**
   - Dashboard → Authentication → Email Auth → Confirm email 비활성화
   - 또는 개발 환경에서만 비활성화

2. **테스트 완료**
   - 이메일 확인 설정 변경 후 재테스트
   - 학습 완료 마크 기능 검증
   - 통계 대시보드 데이터 확인

#### 개선 제안
1. **개발 환경 분리**
   - 프로덕션: 이메일 확인 활성화
   - 개발/테스트: 이메일 확인 비활성화
   - 환경별 Supabase 프로젝트 분리 고려

2. **테스트 사용자 관리**
   - 테스트 후 자동 정리 스크립트
   - 또는 재사용 가능한 테스트 계정

3. **에러 메시지 개선**
   - "Email not confirmed" 에러 시 사용자 친화적 안내
   - 이메일 재전송 기능 추가

### 테스트 실행 방법

```bash
# 로컬 DB 연결 테스트
npx playwright test tests/local-db.spec.ts

# 사용자 플로우 테스트 (이메일 확인 설정 변경 후)
npx playwright test tests/user-flow.spec.ts

# 모든 테스트
npx playwright test
```

### 참고사항
- 테스트 실행 전 개발 서버 시작 필요: `npm run dev`
- `.env.local`에 Supabase 인증 정보 필요
- 각 테스트 실행 시 고유한 이메일 생성 (timestamp 사용)
