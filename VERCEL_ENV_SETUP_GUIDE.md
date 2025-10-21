# Vercel 환경 변수 설정 가이드

## 🚨 현재 문제

**오류 메시지**:
```
Uncaught Error: Missing Supabase environment variables
at index-DBNmJk4H.js:227:36057
```

**원인**: Vercel 배포에 Supabase 환경 변수가 설정되지 않음

---

## ✅ 해결 방법

### 옵션 1: Vercel 대시보드에서 설정 (권장)

#### 1단계: Vercel 대시보드 접속
```
https://vercel.com/
```
- 로그인
- `bible-study-app-gold` 프로젝트 클릭

#### 2단계: Settings → Environment Variables
1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭

#### 3단계: 환경 변수 추가

다음 2개의 환경 변수를 추가하세요:

**변수 1: VITE_SUPABASE_URL**
```
Name: VITE_SUPABASE_URL
Value: https://ouzlnriafovnxlkywerk.supabase.co
Environment: Production, Preview, Development (모두 선택)
```

**변수 2: VITE_SUPABASE_ANON_KEY**
```
Name: VITE_SUPABASE_ANON_KEY
Value: [.env.local 파일에서 복사]
Environment: Production, Preview, Development (모두 선택)
```

#### 4단계: 환경 변수 값 가져오기

로컬 `.env.local` 파일에서 값을 복사하세요:

```bash
# 터미널에서 실행:
cat .env.local
```

출력 예시:
```
VITE_SUPABASE_URL=https://ouzlnriafovnxlkywerk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...매우_긴_키...
```

#### 5단계: 재배포
환경 변수를 추가한 후:
1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** (점 3개) 메뉴 클릭
3. **Redeploy** 클릭
4. **Redeploy** 확인

또는 GitHub에 새로운 커밋을 푸시하면 자동으로 재배포됩니다.

---

### 옵션 2: Vercel CLI로 설정

#### 1단계: Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2단계: 로그인
```bash
vercel login
```

#### 3단계: 프로젝트 연결
```bash
vercel link
```

#### 4단계: 환경 변수 설정
```bash
# VITE_SUPABASE_URL 설정
vercel env add VITE_SUPABASE_URL production

# 프롬프트에서 값 입력:
# https://ouzlnriafovnxlkywerk.supabase.co

# VITE_SUPABASE_ANON_KEY 설정
vercel env add VITE_SUPABASE_ANON_KEY production

# 프롬프트에서 .env.local의 VITE_SUPABASE_ANON_KEY 값 붙여넣기
```

#### 5단계: 재배포
```bash
vercel --prod
```

---

### 옵션 3: 자동 설정 스크립트 (가장 빠름)

다음 명령어를 실행하세요:

```bash
# 1. Vercel CLI 설치 (이미 설치되어 있으면 스킵)
npm install -g vercel

# 2. 로그인
vercel login

# 3. 환경 변수 자동 설정 스크립트 실행
# (아래 스크립트를 터미널에 복사하여 실행)
```

**자동 설정 스크립트**:
```bash
#!/bin/bash

# .env.local에서 환경 변수 읽기
source .env.local

# Vercel에 환경 변수 설정
echo "$VITE_SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production
echo "$VITE_SUPABASE_URL" | vercel env add VITE_SUPABASE_URL preview
echo "$VITE_SUPABASE_URL" | vercel env add VITE_SUPABASE_URL development

echo "$VITE_SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production
echo "$VITE_SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY preview
echo "$VITE_SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY development

echo "✅ 환경 변수 설정 완료!"
echo "재배포를 실행하세요: vercel --prod"
```

---

## 🔍 설정 확인

### Vercel 대시보드에서 확인
1. Settings → Environment Variables
2. 다음 2개가 표시되어야 함:
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`

### 배포 로그에서 확인
1. Deployments 탭 → 최신 배포 클릭
2. **Build Logs** 확인
3. 환경 변수 로드 메시지 확인:
   ```
   ✓ Environment variables loaded
   ```

### 브라우저에서 확인
재배포 후:
1. https://bible-study-app-gold.vercel.app/ 열기
2. F12 → Console 확인
3. 오류 메시지 사라져야 함
4. 히브리어 텍스트 정상 표시되어야 함

---

## ⚠️ 주의사항

### 보안
- **절대** GitHub에 `.env.local` 파일을 커밋하지 마세요
- `.gitignore`에 `.env.local`이 포함되어 있는지 확인
- `VITE_` 접두사가 있는 환경 변수만 클라이언트에 노출됨
- `SUPABASE_SERVICE_ROLE_KEY`는 **절대** Vercel에 설정하지 마세요 (서버 전용)

### 환경 선택
Vercel에서 환경 변수를 추가할 때 다음을 모두 선택하세요:
- ✅ **Production** (프로덕션 배포)
- ✅ **Preview** (PR 프리뷰)
- ✅ **Development** (로컬 개발)

### 재배포 필요
환경 변수를 추가/수정한 후에는 **반드시 재배포**해야 적용됩니다.

---

## 🐛 트러블슈팅

### 환경 변수가 적용되지 않는 경우

#### 1. 캐시 삭제 후 재배포
```bash
vercel --prod --force
```

#### 2. 환경 변수 이름 확인
정확한 이름:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

잘못된 이름:
- ❌ `SUPABASE_URL`
- ❌ `VITE_SUPABASE_API_URL`
- ❌ `VITE_SUPABASE_KEY`

#### 3. 값에 공백이 없는지 확인
환경 변수 값의 앞뒤에 공백이 있으면 안 됩니다.

#### 4. 따옴표 없이 입력
Vercel 대시보드에서:
```
✅ 올바름: https://ouzlnriafovnxlkywerk.supabase.co
❌ 잘못됨: "https://ouzlnriafovnxlkywerk.supabase.co"
```

---

## 📋 체크리스트

설정 전:
- [ ] Vercel 계정 로그인 완료
- [ ] `bible-study-app-gold` 프로젝트 찾기
- [ ] `.env.local` 파일 내용 확인

설정 중:
- [ ] `VITE_SUPABASE_URL` 추가
- [ ] `VITE_SUPABASE_ANON_KEY` 추가
- [ ] 모든 환경 (Production, Preview, Development) 선택
- [ ] 값에 공백 없는지 확인

설정 후:
- [ ] 재배포 실행
- [ ] 배포 로그에서 "Environment variables loaded" 확인
- [ ] 브라우저에서 에러 사라졌는지 확인
- [ ] 히브리어 텍스트 표시되는지 확인

---

## 🚀 빠른 해결 (추천)

가장 빠른 방법은 **Vercel 대시보드 사용**입니다:

1. https://vercel.com/ 로그인
2. `bible-study-app-gold` 클릭
3. Settings → Environment Variables
4. Add New 클릭
5. 다음 추가:
   ```
   VITE_SUPABASE_URL = https://ouzlnriafovnxlkywerk.supabase.co
   VITE_SUPABASE_ANON_KEY = [.env.local에서 복사]
   ```
6. Deployments → Latest → Redeploy

**예상 소요 시간**: 2-3분

---

**문서 작성**: Claude Code
**날짜**: 2025-10-21
**상태**: 환경 변수 설정 대기 중
