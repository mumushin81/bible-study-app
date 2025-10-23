# Vercel SVG 빠른 가이드

## TL;DR

✅ **Vercel 빌드는 SVG를 정상적으로 처리합니다.**

SVG가 표시되지 않는다면 **99%는 환경 변수 문제**입니다.

---

## 1분 체크리스트

### Vercel 대시보드에서 확인

1. Settings → Environment Variables
2. 다음 변수가 설정되어 있는지 확인:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJ...
   ```
3. 없으면 추가 후 **Redeploy**

### 브라우저에서 확인

1. Vercel 사이트 열기
2. F12 (DevTools 열기)
3. **Console 탭** 확인:
   - Supabase 에러 있나요? → 환경 변수 문제
   - CSP 에러 있나요? → 드물지만 CSP 설정 필요
4. **Network 탭** 확인:
   - `supabase.co` 요청 있나요? → 있으면 정상
   - 401 Unauthorized? → 환경 변수 잘못됨
   - 요청 자체가 없나요? → 환경 변수 누락

---

## 빠른 디버깅

### 방법 1: 브라우저 콘솔에서 직접 테스트

Vercel 사이트에서 F12 → Console에 붙여넣기:

```javascript
// 환경 변수 확인 (간접적)
console.log('Testing Supabase connection...');

// SVG DOM 확인
const svgs = document.querySelectorAll('div[style*="width"]');
const hasSVG = Array.from(svgs).some(div => div.innerHTML.includes('<svg'));
console.log('SVG found:', hasSVG);

// Fallback emoji 확인
const emojis = document.querySelectorAll('span[role="img"]');
console.log('Fallback emojis:', emojis.length);

if (!hasSVG && emojis.length > 0) {
  console.log('❌ SVG not loaded - Check environment variables!');
}
```

### 방법 2: 전체 디버그 스크립트 실행

1. `/scripts/debugVercelSVG.ts` 파일 열기
2. 코드 섹션 전체 복사
3. Vercel 사이트 Console에 붙여넣기
4. 결과 확인

---

## 일반적인 문제와 해결

### ❌ 문제: SVG 대신 📜 emoji만 보임

**원인:** Supabase에서 데이터를 가져오지 못함

**해결:**
1. Vercel 환경 변수 확인
2. Supabase 프로젝트가 Paused 상태인지 확인
3. Supabase Anon Key가 올바른지 확인

### ❌ 문제: 일부 아이콘만 ❓로 표시

**원인:** SVG gradient ID 충돌 (이미 수정됨)

**해결:**
- 최신 코드로 배포되었는지 확인 (commit ae4f244 이후)
- 안 되면 `git pull` 후 재배포

### ❌ 문제: 로컬에서는 되는데 Vercel에서 안 됨

**원인:** 로컬 `.env.local`은 있지만 Vercel 환경 변수가 없음

**해결:**
1. `.env.local` 파일 열기
2. 값 복사
3. Vercel Settings → Environment Variables에 추가
4. Redeploy

---

## 환경 변수 설정 방법

### Vercel 대시보드

1. [vercel.com](https://vercel.com) 로그인
2. 프로젝트 선택
3. **Settings** 탭
4. 좌측 메뉴에서 **Environment Variables**
5. **Add New** 클릭
6. 입력:
   ```
   Name: VITE_SUPABASE_URL
   Value: https://your-project.supabase.co
   Environment: Production (또는 All)
   ```
7. **Add New** 클릭
8. 입력:
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Environment: Production (또는 All)
   ```
9. **Save**
10. **Deployments** 탭으로 이동
11. 최신 배포의 **⋯** 메뉴 → **Redeploy**

### Vercel CLI (선택사항)

```bash
# 프로젝트 디렉토리에서 실행
vercel env add VITE_SUPABASE_URL production
# 값 입력: https://your-project.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 값 입력: eyJ...

# 재배포
vercel --prod
```

---

## 기술적 배경 (관심 있으면 읽기)

### SVG 처리 흐름

1. **Database**: Supabase `words` 테이블에 `icon_svg` TEXT 필드
2. **Fetch**: `useWords` 훅에서 `icon_svg` 필드 포함하여 SELECT
3. **Transform**: 각 SVG의 gradient ID를 고유하게 변환 (충돌 방지)
4. **Render**: `dangerouslySetInnerHTML`로 DOM에 삽입

### Vercel 빌드

```
npm run build
  → tsc -b (TypeScript 컴파일)
  → vite build (번들링)
  → dist/ 생성
```

**결과물:**
- `dist/assets/index-*.js`: 메인 앱 코드 (iconSvg 매핑 포함)
- `dist/assets/react-vendor-*.js`: React 라이브러리
- `dist/assets/supabase-vendor-*.js`: Supabase 클라이언트

### 왜 환경 변수가 필요한가?

Vite는 빌드 시 `import.meta.env.VITE_*` 변수를 **정적으로** 번들에 포함합니다.

```javascript
// 빌드 전 (소스 코드)
const url = import.meta.env.VITE_SUPABASE_URL;

// 빌드 후 (번들)
const url = "https://your-project.supabase.co";
```

따라서:
- Vercel 빌드 시 환경 변수가 없으면 → `undefined`로 치환
- Supabase 클라이언트 생성 실패
- API 호출 불가
- SVG 데이터를 가져올 수 없음
- Fallback emoji만 표시

---

## 참고 문서

- [VERCEL_SVG_BUILD_ANALYSIS.md](./VERCEL_SVG_BUILD_ANALYSIS.md): 전체 분석 보고서
- [VERCEL_ENV_SETUP_GUIDE.md](./VERCEL_ENV_SETUP_GUIDE.md): 환경 변수 상세 가이드
- [scripts/testSVGBuild.ts](./scripts/testSVGBuild.ts): 로컬 빌드 테스트
- [scripts/debugVercelSVG.ts](./scripts/debugVercelSVG.ts): 브라우저 디버그 스크립트

---

## 여전히 안 되나요?

1. **Supabase 프로젝트 상태 확인**
   - [app.supabase.com](https://app.supabase.com) 로그인
   - 프로젝트가 Active 상태인가요?
   - Paused 상태면 Resume 클릭

2. **RLS (Row Level Security) 확인**
   - Supabase → Table Editor → `words` 테이블
   - RLS Policies → `anon` 역할이 SELECT 가능한가요?

3. **CORS 확인**
   - Vercel 도메인이 Supabase에서 허용되는가요?
   - (보통 자동으로 허용됨)

4. **빌드 로그 확인**
   - Vercel → Deployments → 최신 배포 클릭
   - Build Logs에서 에러 확인

5. **Issue 생성**
   - 위의 모든 것을 시도했는데도 안 되면
   - GitHub Issues에 다음 정보와 함께 문의:
     - Vercel 배포 URL
     - 브라우저 Console 스크린샷
     - 브라우저 Network 탭 스크린샷
     - Vercel 환경 변수 설정 스크린샷 (값은 가리기!)
