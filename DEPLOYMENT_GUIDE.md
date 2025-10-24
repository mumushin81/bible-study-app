# 🚀 배포 종합 가이드

**최종 업데이트**: 2025-10-24
**상태**: ✅ 배포 성공

---

## 📚 목차

1. [환경 설정](#1-환경-설정)
2. [빌드 오류 해결](#2-빌드-오류-해결)
3. [배포 프로세스](#3-배포-프로세스)
4. [배포 후 검증](#4-배포-후-검증)

---

## 1. 환경 설정

### 1.1 Vercel 환경변수 설정

**필수 변수** (2개):
```
VITE_SUPABASE_URL=https://ouzlnriafovnxlkywerk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

#### 방법 1: Vercel Dashboard (권장)
1. https://vercel.com 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 두 변수 추가 (Production, Preview, Development 모두 체크)
5. Save
6. Redeploy

#### 방법 2: Vercel CLI
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### 방법 3: vercel.json
```json
{
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### 1.2 검증
```bash
# Vercel Dashboard에서 확인
Settings → Environment Variables → 2개 변수 존재 확인
```

---

## 2. 빌드 오류 해결

### 2.1 TypeScript 오류

#### 일반적인 오류
```
Type 'string | null' is not assignable to type 'string'
```

#### 해결 방법
```typescript
// ❌ Before
const value: string = data.field;

// ✅ After
const value: string = data.field || '';
```

### 2.2 Supabase 타입 오류

#### 타입 재생성
```bash
npx supabase gen types typescript --project-id=ouzlnriafovnxlkywerk > src/types/database.types.ts
```

### 2.3 빌드 테스트
```bash
npm run build
```

**성공 출력**:
```
✓ 1980 modules transformed.
✓ built in 1.66s

dist/index.html                   0.71 kB
dist/assets/index-*.css          73.38 kB
dist/assets/index-*.js          126.32 kB
```

---

## 3. 배포 프로세스

### 3.1 자동 배포 (Vercel)

#### Git Push
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Vercel 자동 감지 → 빌드 → 배포**

### 3.2 수동 배포

```bash
vercel --prod
```

### 3.3 Preview 배포
```bash
# Feature 브랜치에서
git checkout -b feature/new-feature
git push origin feature/new-feature
```

**Vercel이 자동으로 Preview URL 생성**

---

## 4. 배포 후 검증

### 4.1 체크리스트

#### 기본 동작
- [ ] 홈페이지 로딩 성공
- [ ] Genesis 1-3장 단어 표시
- [ ] SVG 아이콘 정상 표시
- [ ] 플래시카드 동작
- [ ] 히브리어 텍스트 선택 기능

#### 데이터베이스
- [ ] Supabase 연결 정상
- [ ] Words 데이터 fetch 성공
- [ ] Commentaries 데이터 fetch 성공

#### 성능
- [ ] 페이지 로딩 <3초
- [ ] API 응답 <500ms
- [ ] Lighthouse 점수 >90

### 4.2 Vercel Dashboard 확인

1. Deployments 탭
2. 최신 배포 선택
3. Logs 확인
4. Build Log 확인 (에러 없는지)
5. Function Logs 확인

### 4.3 실제 사이트 테스트

```
Production URL: https://your-app.vercel.app

테스트 항목:
1. Genesis 1:1 클릭
2. 플래시카드 확인
3. SVG 아이콘 표시 확인
4. 히브리어 선택 기능 테스트
5. 모바일/데스크톱 반응형 확인
```

---

## 🎯 빠른 참조

### 배포 실패 시
```bash
# 1. 로그 확인
vercel logs --follow

# 2. 환경변수 확인
vercel env ls

# 3. 로컬 빌드 테스트
npm run build

# 4. 롤백
git revert HEAD
git push origin main
```

### 환경변수 누락 시
```
증상: "Missing Supabase configuration"
해결: Vercel Dashboard → Environment Variables → 추가
```

### 빌드 실패 시
```
증상: TypeScript errors, build failed
해결: npm run build로 로컬 테스트 → 오류 수정 → 재푸시
```

---

## 📊 배포 상태

```
✅ 환경변수: 설정 완료
✅ 빌드: 성공
✅ 배포: 성공
✅ 검증: 완료
✅ 성능: 정상
```

---

**참조 문서**:
- `VERCEL_ENV_SETUP_GUIDE.md` - 상세 환경 설정
- `DEPLOYMENT_VERIFICATION.md` - 검증 보고서
- `배포완료.md` - 한글 요약

**작성**: Claude Code
**상태**: ✅ 운영 중
