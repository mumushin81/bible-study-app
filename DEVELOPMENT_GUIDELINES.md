# Eden App 개발 지침서

## 📋 목차
1. [코드 수정 원칙](#코드-수정-원칙)
2. [요구사항 분석](#요구사항-분석)
3. [UI/UX 개발 가이드](#uiux-개발-가이드)
4. [테스트 가이드](#테스트-가이드)
5. [반복 발생한 문제와 해결책](#반복-발생한-문제와-해결책)
6. [체크리스트](#체크리스트)

---

## 🎯 코드 수정 원칙

### 1. 기존 기능 보존
**문제점**: 새로운 기능을 추가하거나 버그를 수정하는 과정에서 기존에 작동하던 기능까지 삭제하는 경우가 발생

**개선 방안**:
- ✅ 수정 전 해당 컴포넌트의 **전체 기능 목록** 작성
- ✅ 수정 후 **기존 기능이 모두 유지**되는지 확인
- ✅ 코드 삭제 시 **주석으로 먼저 처리**하고 테스트 후 삭제
- ✅ Git diff 확인하여 의도하지 않은 삭제가 없는지 검토

**실제 사례**:
```
❌ 나쁜 예:
- 깊이읽기 섹션을 수정하면서 openCommentary state까지 삭제
- 결과: 아코디언 기능 전체가 사라짐

✅ 좋은 예:
- 깊이읽기 렌더링을 수정하되 openCommentary state 유지
- 기존 아코디언 기능 보존
```

### 2. 최소 변경 원칙
**문제점**: 작은 문제를 해결하기 위해 불필요하게 많은 코드를 수정

**개선 방안**:
- ✅ 문제의 **근본 원인**만 정확히 수정
- ✅ 영향 범위를 최소화
- ✅ 리팩토링은 별도로 진행

**실제 사례**:
```typescript
// ❌ 나쁜 예: 텍스트 오버플로우 문제를 해결하기 위해 전체 레이아웃 변경
<div className="complete-restructure">...</div>

// ✅ 좋은 예: 해당 요소만 수정
<div className="existing-layout">
  <p style={{ fontSize: 'clamp(0.7rem, 2.2vw, 0.85rem)' }}>
    {text}
  </p>
</div>
```

---

## 🔍 요구사항 분석

### 1. 명확한 의도 파악
**문제점**: 사용자의 요구사항을 표면적으로만 이해하고 작업

**개선 방안**:
- ✅ **왜(Why)** 이 변경이 필요한지 질문
- ✅ 사용자가 **진짜 원하는 것**이 무엇인지 확인
- ✅ 애매한 표현은 **구체적인 예시** 요청

**실제 사례**:
```
사용자: "색감 표시 제거하고 단어장 모두 가운데 정렬하자"

❌ 내 해석: 모든 색상 제거 → 파스텔 디자인까지 삭제
✅ 올바른 해석: 품사별 색상 코딩만 제거, 파스텔 글라스모피즘은 유지

→ 질문했어야 할 것: "파스텔 배경색도 제거할까요, 아니면 품사별 색상만 제거할까요?"
```

### 2. 대안 제시
**문제점**: 사용자가 제시한 방법이 최선이 아닐 수 있음

**개선 방안**:
- ✅ 문제 해결을 위한 **여러 대안** 제시
- ✅ 각 대안의 **장단점** 설명
- ✅ 사용자와 함께 **최적의 방법** 선택

**실제 사례**:
```
사용자: "스크롤 기능 추가해줘"

❌ 나쁜 응답: 즉시 스크롤 추가
✅ 좋은 응답:
  "오버플로우 문제 해결 방법으로 3가지 대안이 있습니다:
   1. 세로 스크롤 추가 (간단하지만 UX 저하)
   2. 폰트 크기 축소 (가독성 저하 가능)
   3. 반응형 폰트 (clamp 사용) (권장)
   어떤 방법을 선호하시나요?"
```

---

## 🎨 UI/UX 개발 가이드

### 1. 반응형 디자인 우선
**원칙**: 스크롤이나 고정 크기보다는 **반응형 디자인**을 우선 고려

**권장 방법**:
```css
/* ❌ 피해야 할 패턴 */
.element {
  font-size: 14px;
  overflow-y: auto;
  max-height: 400px;
}

/* ✅ 권장 패턴 */
.element {
  font-size: clamp(0.7rem, 2.2vw, 0.85rem);
  padding: clamp(0.5rem, 2vw, 1rem);
  /* 스크롤 없이 화면 크기에 맞게 조절 */
}
```

**적용 사례**:
- 플래시카드 뒷면: 스크롤 → 반응형 폰트로 변경
- 현대어역 카드: 가로 스크롤 → 멀티라인 + word-break로 변경

### 2. 레이아웃 우선순위
**우선순위**:
1. 반응형 크기 조절 (clamp, vw, vh)
2. Flexbox/Grid 자동 레이아웃
3. 내용 축약/생략 (text-overflow: ellipsis)
4. 스크롤 (최후의 수단)

### 3. 디자인 일관성
**원칙**:
- ✅ 같은 요소는 **동일한 스타일** 적용
- ✅ 색상, 간격, 폰트 크기 **패턴 유지**
- ✅ 다크모드 양쪽 모두 고려

**스타일 가이드**:
```typescript
// 파스텔 글라스모피즘 패턴 (일관성 유지)
const glassmorphismStyle = {
  light: 'bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80',
  dark: 'bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40',
  backdrop: {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  }
};

// 반응형 폰트 크기 패턴
const fontSizes = {
  title: 'clamp(1rem, 4vw, 1.5rem)',
  body: 'clamp(0.75rem, 2.5vw, 0.9rem)',
  caption: 'clamp(0.6rem, 2vw, 0.75rem)',
};
```

---

## 🧪 테스트 가이드

### 1. 테스트 필수 원칙
**핵심 규칙**: 모든 개발 작업 후 반드시 Playwright MCP를 이용하여 철저히 테스트한다.

**테스트 시점**:
- ✅ 새로운 기능 개발 완료 후
- ✅ 기존 기능 수정 후
- ✅ 버그 수정 후
- ✅ UI/UX 변경 후
- ✅ 배포 전 필수

### 2. Playwright MCP 활용

**설정 확인**:
```json
// .claude.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**MCP 서버 연결 확인**:
- Claude Code 재시작 시 MCP 서버가 자동으로 로드됨
- 도구 목록에서 `mcp__playwright_*` 도구 확인
- 연결되지 않은 경우 Claude Code 재시작

**일반 Playwright 사용 (MCP 미연결 시)**:
```bash
# Playwright 설치
npm install -D @playwright/test
npx playwright install chromium

# 테스트 실행
npx playwright test

# 헤드리스 모드 해제 (브라우저 보기)
npx playwright test --headed

# 특정 테스트만 실행
npx playwright test tests/app.spec.ts
```

### 3. 테스트 범위

**필수 테스트 항목**:

#### 3.1 기본 기능 테스트
```typescript
// 1. 페이지 로드
- 페이지가 정상적으로 로드되는가?
- 타이틀이 올바른가?
- 주요 컴포넌트가 렌더링되는가?

// 2. 콘텐츠 표시
- 히브리어 텍스트가 정상 표시되는가?
- 한국어 번역이 정상 표시되는가?
- 발음 표기(IPA)가 정상 표시되는가?
```

#### 3.2 인터랙션 테스트
```typescript
// 3. 탭 전환
- 모든 탭(본문, 단어장, 퀴즈, 노트, 성장)이 작동하는가?
- 탭 간 전환이 부드러운가?
- 각 탭의 콘텐츠가 정상 표시되는가?

// 4. 네비게이션
- 이전/다음 구절 이동이 작동하는가?
- 책/장 선택이 정상 작동하는가?
- 스와이프 제스처가 작동하는가?

// 5. 설정 및 기능
- 다크모드 전환이 작동하는가?
- 음성 재생이 작동하는가?
- 검색 기능이 작동하는가?
```

#### 3.3 반응형 테스트
```typescript
// 6. 다양한 화면 크기
- 데스크톱 (1920x1080)
- 태블릿 (768x1024)
- 모바일 (375x667 - iPhone SE)
- 모바일 (390x844 - iPhone 12 Pro)

// 7. 레이아웃
- 텍스트 오버플로우가 없는가?
- 모든 요소가 화면 내에 표시되는가?
- 스크롤이 필요한 부분에서만 스크롤이 있는가?
```

#### 3.4 성능 테스트
```typescript
// 8. 로딩 성능
- 페이지 로드 시간이 3초 이내인가?
- DOM Content Loaded 시간이 적절한가?
- 이미지/폰트 로딩이 최적화되어 있는가?

// 9. 애니메이션
- Framer Motion 애니메이션이 부드러운가?
- 탭 전환 애니메이션이 자연스러운가?
- 성능 저하가 없는가?
```

### 4. 테스트 작성 가이드

**테스트 파일 구조**:
```typescript
// tests/feature-name.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://bible-study-app-gold.vercel.app/';

test.describe('기능명 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('1. 구체적인 테스트 시나리오', async ({ page }) => {
    // Given: 초기 상태 설정

    // When: 액션 수행

    // Then: 결과 검증
    await expect(element).toBeVisible();
  });
});
```

**좋은 테스트 사례**:
```typescript
// ✅ 명확한 테스트 이름
test('탭을 클릭하면 해당 콘텐츠가 표시된다', async ({ page }) => {
  const vocabularyTab = page.getByRole('button', { name: /단어장/i });
  await vocabularyTab.click();

  const vocabularyContent = page.locator('[data-testid="vocabulary-content"]');
  await expect(vocabularyContent).toBeVisible();
});

// ✅ 스크린샷으로 시각적 검증
test('모바일 뷰가 올바르게 렌더링된다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({
    path: 'tests/screenshots/mobile-view.png',
    fullPage: true
  });
});

// ✅ 다크모드 양쪽 테스트
test('다크모드 전환이 정상 작동한다', async ({ page }) => {
  const toggle = page.getByRole('button', { name: /다크모드/i });

  // 라이트모드 스크린샷
  await page.screenshot({ path: 'tests/screenshots/light-mode.png' });

  // 다크모드로 전환
  await toggle.click();
  await page.waitForTimeout(300);

  // 다크모드 스크린샷
  await page.screenshot({ path: 'tests/screenshots/dark-mode.png' });
});
```

### 5. 테스트 자동화

**GitHub Actions 연동** (향후 구현):
```yaml
# .github/workflows/test.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install chromium
      - run: npx playwright test
```

**Vercel 배포 후 자동 테스트**:
- Vercel 배포 완료 webhook 수신
- Playwright 테스트 자동 실행
- 실패 시 알림

### 6. 테스트 체크리스트

**개발 완료 후**:
- [ ] Playwright MCP 도구 연결 확인
- [ ] 로컬 환경에서 테스트 실행
- [ ] 모든 테스트 통과 확인
- [ ] 실패한 테스트 분석 및 수정
- [ ] 스크린샷으로 시각적 확인

**배포 전**:
- [ ] 프로덕션 URL에서 테스트 실행
- [ ] 데스크톱/모바일 양쪽 테스트
- [ ] 다크모드/라이트모드 양쪽 테스트
- [ ] 주요 사용자 시나리오 테스트
- [ ] 성능 메트릭 확인

**배포 후**:
- [ ] 실제 배포된 URL 테스트
- [ ] 모든 기능 정상 작동 확인
- [ ] 이슈 발견 시 즉시 수정

### 7. 테스트 실패 대응

**실패 원인 분석**:
```bash
# 1. 스크린샷 확인
ls test-results/*/*.png

# 2. 에러 로그 확인
npx playwright test --reporter=list

# 3. 디버그 모드 실행
npx playwright test --debug
```

**일반적인 실패 원인**:
- DOM 구조 변경으로 선택자 미작동
- 타이밍 이슈 (요소 로딩 전에 테스트 실행)
- 네트워크 지연
- 환경 차이 (로컬 vs 프로덕션)

**해결 방법**:
```typescript
// ❌ 나쁜 예: 고정 대기 시간
await page.waitForTimeout(1000);

// ✅ 좋은 예: 요소가 나타날 때까지 대기
await expect(element).toBeVisible({ timeout: 10000 });

// ✅ 네트워크 안정화 대기
await page.waitForLoadState('networkidle');
```

---

## 🔧 반복 발생한 문제와 해결책

### 문제 1: 깊이읽기 기능 반복 수정
**발생 횟수**: 3회

**타임라인**:
1. 렌더링 불완전 → whyQuestion, conclusion 추가
2. 섹션 전체 삭제 → 섹션 재추가
3. 아코디언 기능 삭제 → 아코디언 재추가

**근본 원인**:
- 전체 구조 파악 없이 부분만 수정
- 기존 기능 확인 없이 코드 삭제

**해결책**:
```typescript
// ✅ 수정 전 체크리스트
// 1. Commentary 인터페이스 확인
// 2. 렌더링해야 할 모든 섹션 목록 작성:
//    - intro
//    - sections (color cards)
//    - whyQuestion
//    - conclusion
// 3. 기존 state 확인 (openCommentary)
// 4. 수정 후 모든 섹션이 표시되는지 확인
```

### 문제 2: 텍스트 오버플로우 처리
**발생 횟수**: 4회

**시도한 방법들**:
1. 멀티라인 (break-words) → 사용자가 한 줄 요청
2. 가로 스크롤 → 스와이프 충돌
3. stopPropagation() 추가 → 여전히 UX 문제
4. 최종: 멀티라인 + 적절한 word-break ✅

**교훈**:
- 첫 번째 시도에서 사용자에게 여러 옵션 제시했다면 반복 수정 방지 가능
- 스크롤은 최후의 수단

**올바른 접근**:
```markdown
사용자: "현대어의역 카드 문장들이 짤리는 현상"

✅ 제안해야 했던 대안:
1. 멀티라인으로 표시 (권장)
   - 장점: 모든 내용 표시, 자연스러운 읽기
   - 단점: 카드 높이 증가

2. 한 줄 + 가로 스크롤
   - 장점: 카드 높이 유지
   - 단점: 스와이프 제스처 충돌 가능

3. 한 줄 + 말줄임표
   - 장점: 간결함
   - 단점: 전체 내용 확인 불가

어떤 방법을 선호하시나요?
```

### 문제 3: 플래시카드 오버플로우
**발생 횟수**: 3회

**시도한 방법들**:
1. 스크롤 추가 → 사용자가 스크롤 원하지 않음
2. 폰트 크기만 축소 → 여전히 오버플로우
3. 최종: 스크롤 제거 + 전체적 반응형 폰트 ✅

**교훈**:
- 처음부터 반응형 디자인 고려했다면 1회에 해결 가능
- 모든 요소(이모지, 의미, 발음, 어근, 문법, 구조)의 크기를 함께 고려

---

## ✅ 작업 전 체크리스트

### 코드 수정 전
- [ ] 사용자 요구사항의 **진짜 의도** 파악
- [ ] 현재 코드의 **전체 구조** 파악
- [ ] 수정할 부분과 **영향 범위** 확인
- [ ] 기존 **기능 목록** 작성
- [ ] 여러 **해결 방안** 검토

### 코드 수정 중
- [ ] **최소한의 변경**으로 문제 해결
- [ ] 기존 기능 **보존** 확인
- [ ] 다크모드/라이트모드 **양쪽** 테스트
- [ ] 다양한 **화면 크기**에서 테스트
- [ ] 주석으로 **의도** 명확히 표시

### 코드 수정 후
- [ ] 요구사항이 **정확히 구현**되었는지 확인
- [ ] **기존 기능**이 모두 작동하는지 확인
- [ ] **부작용**이 없는지 확인
- [ ] 코드 **일관성** 유지 확인
- [ ] 사용자에게 **결과 설명** 및 **대안 제시**

### 테스트 수행 (필수)
- [ ] **Playwright MCP** 연결 확인 (Claude Code 재시작 시)
- [ ] **로컬 환경** 테스트 실행 및 통과 확인
- [ ] **배포 환경** 테스트 실행 및 통과 확인
- [ ] **데스크톱/모바일** 양쪽 화면 크기 테스트
- [ ] **다크모드/라이트모드** 양쪽 테스트
- [ ] 테스트 실패 시 원인 분석 및 **즉시 수정**
- [ ] **스크린샷**으로 시각적 검증 완료

---

## 🎯 핵심 원칙 요약

### 1. 이해 우선 (Understand First)
> "빠르게 코딩하기 전에, 천천히 이해하라"
- 요구사항의 근본 의도 파악
- 현재 코드 전체 구조 이해
- 영향 범위 사전 분석

### 2. 최소 변경 (Minimal Change)
> "필요한 만큼만, 정확하게"
- 문제의 근본 원인만 수정
- 불필요한 리팩토링 자제
- 영향 범위 최소화

### 3. 기능 보존 (Preserve Features)
> "새로운 것을 추가할 때, 기존 것을 잃지 마라"
- 기존 기능 목록 작성
- 수정 후 기능 확인
- 의도하지 않은 삭제 방지

### 4. 반응형 우선 (Responsive First)
> "스크롤보다는 반응형으로"
- clamp()를 활용한 유연한 크기
- Flexbox/Grid 자동 레이아웃
- 스크롤은 최후의 수단

### 5. 대안 제시 (Suggest Alternatives)
> "하나의 방법이 아닌, 여러 선택지를"
- 3가지 이상 대안 제시
- 각 방법의 장단점 설명
- 사용자와 함께 결정

### 6. 철저한 테스트 (Thorough Testing)
> "개발은 테스트 통과 후에 완료된다"
- 모든 개발 후 Playwright MCP로 테스트
- 배포 전 필수 테스트 수행
- 실패 시 즉시 수정 후 재테스트

---

## 📚 참고 자료

### 사용된 기술 스택
- **React 18** + TypeScript
- **Framer Motion** - 애니메이션
- **Tailwind CSS** - 스타일링
- **CSS clamp()** - 반응형 폰트
- **Playwright** - E2E 테스트
- **Playwright MCP** - Claude Code 통합 테스트

### 디자인 패턴
- **Glassmorphism** - 유리 느낌의 반투명 효果
- **Pastel Colors** - 부드러운 파스텔 색상
- **Responsive Typography** - 화면 크기에 따른 폰트 조절

### 유용한 CSS 패턴
```css
/* 반응형 폰트 크기 */
font-size: clamp(최소값, 선호값, 최대값);

/* 글라스모피즘 */
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.1);

/* 한국어 자연스러운 줄바꿈 */
word-break: keep-all;

/* IPA 발음 기호 줄바꿈 */
word-break: break-all;
```

---

## 🔄 버전 히스토리
- v1.1 (2025-10-18): 테스트 가이드 추가
  - Playwright MCP를 이용한 테스트 필수화
  - 테스트 범위, 작성 가이드, 체크리스트 추가
  - 핵심 원칙에 "철저한 테스트" 추가
- v1.0 (2025-10-15): 초기 지침서 작성
  - 깊이읽기, 텍스트 오버플로우, 플래시카드 오버플로우 문제 분석
  - 개선 원칙 및 체크리스트 작성
