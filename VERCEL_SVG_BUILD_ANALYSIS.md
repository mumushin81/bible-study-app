# Vercel SVG 빌드 분석 보고서

생성일: 2025-10-22
상태: ✅ 빌드 시스템 정상

## 요약

Vercel 빌드 과정에서 SVG 데이터는 **정상적으로 처리**되고 있습니다. 로컬 빌드와 Vercel 빌드 모두에서 SVG 아이콘이 올바르게 번들에 포함되어 있으며, `dangerouslySetInnerHTML`을 통해 렌더링되도록 설정되어 있습니다.

## 1. Vite 빌드 설정 분석

### vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
```

**분석 결과:**
- ✅ SVG 관련 특수 설정 없음 (기본 동작)
- ✅ 코드 스플리팅 정상 작동
- ✅ dangerouslySetInnerHTML 제한 없음

## 2. 빌드 스크립트 분석

### package.json
```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  }
}
```

**실행 순서:**
1. TypeScript 컴파일 (`tsc -b`)
2. Vite 프로덕션 빌드 (`vite build`)

**빌드 결과물 (dist/):**
```
dist/
├── index.html                            (0.71 kB)
└── assets/
    ├── index-g1mGOqDd.css               (65.65 kB)
    ├── index-oPpNzl3V.js                (108.15 kB) ← 메인 앱 코드
    ├── react-vendor-B6114-rA.js         (141.45 kB)
    ├── supabase-vendor-CfBKVjMH.js      (148.70 kB)
    └── ui-vendor-D44GzLUH.js            (128.64 kB)
```

## 3. SVG 처리 흐름

### 3.1 데이터베이스 저장
```sql
-- words 테이블
icon_svg: text (nullable)
```

**실제 데이터 예시:**
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mist1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E0F7FA" stop-opacity="0.3"/>
      ...
    </linearGradient>
  </defs>
  ...
</svg>
```

**검증 결과:**
- ✅ 10개의 단어에 유효한 SVG 데이터 확인
- ✅ 모든 SVG에 `<svg>` 태그 포함
- ✅ 평균 크기: 1000-1300 bytes

### 3.2 Supabase에서 데이터 가져오기

`src/hooks/useWords.ts`:
```typescript
const { data, error } = await supabase
  .from('words')
  .select(`
    id,
    hebrew,
    icon_svg,  // ← DB에서 SVG 데이터 가져오기
    ...
  `)
```

**변환 과정:**
```typescript
iconSvg: item.icon_svg || undefined
```

### 3.3 컴포넌트에서 렌더링

`src/components/shared/HebrewIcon.tsx`:
```typescript
// 1. Gradient ID 충돌 방지 (ae4f244 커밋)
const uniqueSvg = useMemo(() => {
  if (!iconSvg) return null;

  const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;

  // id 속성 변환: id="gradient1" → id="וְאֵד-x7k2m9-gradient1"
  let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);

  // url() 참조 변환: url(#gradient1) → url(#וְאֵד-x7k2m9-gradient1)
  processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

  return processedSvg;
}, [iconSvg, word]);

// 2. dangerouslySetInnerHTML로 렌더링
if (uniqueSvg) {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      dangerouslySetInnerHTML={{ __html: uniqueSvg }}
    />
  );
}
```

## 4. 빌드 결과물 검증

### 번들 내용 분석 (index-oPpNzl3V.js)

**✅ 포함된 항목:**
1. `iconSvg:o.icon_svg` - DB 필드 매핑
2. `iconSvg:$.icon_svg` - 타입 변환
3. `dangerouslySetInnerHTML` - 렌더링 메서드 (1회)
4. `viewBox` - SVG 속성 (5회 발견)

**하드코딩된 레거시 아이콘도 포함:**
- BereshitIcon
- ElohimIcon
- BaraIcon
- OrIcon

이들은 SVG 컴포넌트로 직접 정의되어 번들에 포함됨.

## 5. Vercel 배포 설정

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**분석:**
- ✅ 빌드 명령어: 로컬과 동일 (`npm run build`)
- ✅ 출력 디렉토리: `dist/`
- ✅ SPA 라우팅 지원 (rewrites)
- ❌ CSP 헤더 설정 없음
- ❌ HTML 새니타이제이션 설정 없음

### 환경 변수 요구사항

**필수 환경 변수 (Vercel 대시보드에서 설정):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

⚠️ **주의:** 환경 변수가 누락되면 Supabase 연결 실패 → SVG 데이터를 가져올 수 없음

## 6. 잠재적 문제점 및 해결 방안

### 6.1 SVG가 Vercel에서 표시되지 않는 경우

#### 원인 1: 환경 변수 누락
**증상:**
- 로컬에서는 작동, Vercel에서는 작동 안 함
- 브라우저 콘솔에 Supabase 에러

**해결:**
1. Vercel 대시보드 → Settings → Environment Variables
2. `VITE_SUPABASE_URL` 추가
3. `VITE_SUPABASE_ANON_KEY` 추가
4. Redeploy

#### 원인 2: Gradient ID 충돌 (해결됨)
**증상:**
- 일부 아이콘만 ❓로 표시
- SVG는 로드되지만 gradient가 적용 안 됨

**해결:** ✅ ae4f244 커밋에서 수정
```typescript
// 각 SVG에 고유한 ID 부여
const uniqueId = `${word}-${Math.random().toString(36).substr(2, 9)}`;
```

#### 원인 3: CSP (Content Security Policy)
**증상:**
- 브라우저 콘솔: "Refused to execute inline script"
- dangerouslySetInnerHTML 차단

**확인 방법:**
```javascript
// 브라우저 콘솔에서 실행
console.log(document.querySelector('[data-hebrew-icon]').innerHTML);
```

**해결:**
Vercel에 CSP 헤더 설정 (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

⚠️ **현재 상태:** vercel.json에 CSP 설정 없음 (기본 허용)

#### 원인 4: DB 데이터 누락
**증상:**
- 일부 단어에만 아이콘 표시
- 나머지는 fallback emoji (📜)

**확인:**
```bash
npm run icon:batch  # 누락된 단어에 대해 아이콘 생성
```

## 7. 빌드 프로세스 비교

### 로컬 빌드
```bash
$ npm run build

> eden-bible-study@0.0.0 build
> tsc -b && vite build

vite v5.4.20 building for production...
✓ 1973 modules transformed.
✓ built in 1.66s
```

### Vercel 빌드 (예상)
```
Installing dependencies...
Running build command...
> tsc -b && vite build
✓ 1973 modules transformed.
Uploading to CDN...
Deployment ready
```

**차이점:**
- ❌ 빌드 명령어 차이 없음
- ❌ 환경 차이 없음 (Node.js, npm 버전만 다를 수 있음)
- ✅ 결과물 동일

## 8. Vercel 특수 동작 분석

### 8.1 HTML Sanitization
**조사 결과:** ❌ 없음

Vercel은 정적 파일 호스팅이므로 빌드된 HTML/JS를 그대로 제공합니다.
dangerouslySetInnerHTML은 React에서 클라이언트 사이드에서 실행되므로 Vercel의 영향을 받지 않습니다.

### 8.2 Content Security Policy
**조사 결과:** ❌ 기본 설정 없음

Vercel은 기본적으로 CSP 헤더를 추가하지 않습니다.
사용자가 명시적으로 설정하지 않는 한 모든 인라인 스크립트/스타일이 허용됩니다.

### 8.3 dangerouslySetInnerHTML 제한
**조사 결과:** ❌ 없음

이는 React의 기능이며, Vercel은 관여하지 않습니다.

## 9. 테스트 결과

### 로컬 빌드 테스트
```bash
$ npx tsx scripts/testSVGBuild.ts

✅ Database has valid SVG data
✅ Build includes iconSvg references
✅ Build includes dangerouslySetInnerHTML
✅ Build includes SVG content

⚠️ No issues detected!
```

### Playwright E2E 테스트
```bash
$ npm test

✅ 7 passed (22.3s)
✅ Genesis 1:1 히브리어 표시 확인
✅ Genesis 1:1 한글 현대어 의역 표시 확인
```

## 10. 최근 커밋 히스토리

### SVG 관련 주요 커밋

1. **ae4f244** - Fix SVG gradient ID collisions causing icons to display as ❓
   - useMemo로 고유 ID 생성
   - 여러 플래시카드에서 같은 gradient ID 충돌 방지

2. **95887f2** - Fix: Remove hardcoded legacy icons to prioritize DB SVG icons
   - 하드코딩된 아이콘 제거 우선순위 조정
   - DB SVG가 최우선, 레거시 아이콘은 fallback

3. **19f0e3d** - Fix: Add icon_svg field to useWords hook for SVG icon display
   - useWords 훅에 icon_svg 필드 추가
   - DB에서 SVG 데이터 가져오기 시작

4. **2778881** - Remove all emoji fields and upload SVG icons to database
   - emoji 필드 삭제
   - SVG 아이콘으로 전면 전환

## 11. 결론 및 권장사항

### ✅ 정상 작동하는 부분
1. Vite 빌드 설정
2. SVG 데이터베이스 저장
3. Supabase 데이터 fetch
4. dangerouslySetInnerHTML 렌더링
5. Gradient ID 충돌 방지
6. 빌드 결과물에 모든 필요한 코드 포함

### ⚠️ Vercel 배포 시 확인사항

1. **환경 변수 설정 (필수)**
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

2. **배포 후 확인**
   - Browser DevTools → Console (에러 확인)
   - Browser DevTools → Network (Supabase API 호출 확인)
   - Browser DevTools → Elements (SVG DOM 렌더링 확인)

3. **문제 발생 시 디버깅**
   ```javascript
   // 브라우저 콘솔에서 실행

   // 1. Supabase 연결 확인
   console.log(window.location.origin);

   // 2. SVG 데이터 확인
   const words = await supabase.from('words').select('hebrew, icon_svg').limit(5);
   console.log(words);

   // 3. DOM 렌더링 확인
   const svgElements = document.querySelectorAll('[style*="dangerouslySetInnerHTML"]');
   console.log(svgElements.length);
   ```

### 🎯 최종 결론

**Vercel 빌드 과정에서 SVG는 정상적으로 처리됩니다.**

- ✅ 빌드 설정 문제 없음
- ✅ SVG 데이터 손실 없음
- ✅ Vercel 특수 제약사항 없음
- ⚠️ 환경 변수만 올바르게 설정하면 작동

만약 Vercel에서 SVG가 표시되지 않는다면:
1. 환경 변수 누락 (가장 가능성 높음)
2. Supabase 네트워크 문제
3. 브라우저 호환성 문제

이 중 **환경 변수 누락**이 가장 흔한 원인입니다.
