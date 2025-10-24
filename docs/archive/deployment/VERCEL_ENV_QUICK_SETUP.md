# Vercel 환경 변수 빠른 설정 가이드

## 🎯 목표
SVG 아이콘이 Vercel에서 표시되도록 환경 변수 설정

---

## 📋 설정할 환경 변수 (복사 준비)

### 1. VITE_SUPABASE_URL
```
https://ouzlnriafovnxlkywerk.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE
```

---

## 🚀 5단계 설정 방법

### 1단계: Vercel 대시보드 접속
```
https://vercel.com/
```
- 로그인하세요

### 2단계: 프로젝트 선택
- 대시보드에서 **`bible-study-app-gold`** 프로젝트 클릭

### 3단계: Settings로 이동
- 상단 탭에서 **Settings** 클릭
- 왼쪽 사이드바에서 **Environment Variables** 클릭

### 4단계: 환경 변수 추가

#### 첫 번째 변수:
1. **Add New** 버튼 클릭
2. 다음 입력:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://ouzlnriafovnxlkywerk.supabase.co`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development (3개 모두 체크)
3. **Save** 클릭

#### 두 번째 변수:
1. 다시 **Add New** 버튼 클릭
2. 다음 입력:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development (3개 모두 체크)
3. **Save** 클릭

### 5단계: 재배포
1. **Deployments** 탭으로 이동
2. 최신 배포 (맨 위) 옆의 **⋯** (점 3개) 메뉴 클릭
3. **Redeploy** 클릭
4. 확인 창에서 다시 **Redeploy** 클릭
5. 배포 완료까지 **약 2-3분** 대기

---

## ✅ 설정 확인

### 환경 변수 확인
Settings → Environment Variables에서 다음 2개가 보여야 합니다:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

각 변수 옆에 **Production**, **Preview**, **Development** 태그가 모두 있어야 합니다.

---

## 🧪 재배포 후 테스트

### 1. 배포 완료 대기 (2-3분)
Deployments 탭에서 상태가 **Ready**로 변경될 때까지 대기

### 2. 사이트 접속
```
https://bible-study-app-gold.vercel.app/
```

### 3. 단어장 탭 확인
1. 하단 네비게이션에서 **단어장** 탭 클릭
2. 첫 번째 단어 카드 확인
3. **SVG 아이콘이 표시되는지** 확인 (❓ 대신 실제 아이콘)

### 4. Console 확인 (선택)
1. F12 → Console 탭
2. "Missing Supabase environment variables" 오류가 **사라졌는지** 확인
3. Network 탭에서 Supabase API 요청이 **200 OK**로 성공하는지 확인

---

## 🎯 예상 결과

### 설정 전 (현재):
- ❌ SVG 아이콘 표시 안됨
- ❌ ❓ 물음표만 표시
- ❌ Console에 "Missing Supabase environment variables" 오류

### 설정 후 (목표):
- ✅ SVG 아이콘 정상 표시
- ✅ 화려한 그라디언트 아이콘
- ✅ Console 오류 없음
- ✅ 데이터베이스 연결 성공

---

## 🐛 문제 해결

### Q1: 재배포 후에도 여전히 ❓가 표시됩니다
**A**: 브라우저 캐시 문제일 수 있습니다.
1. Ctrl+Shift+R (Windows) 또는 Cmd+Shift+R (Mac)로 강력 새로고침
2. 또는 시크릿 모드에서 사이트 열기

### Q2: 환경 변수가 저장되지 않습니다
**A**:
1. 변수 이름에 **공백이 없는지** 확인
2. 값의 앞뒤에 **따옴표가 없는지** 확인
3. Environments를 **최소 1개 이상 선택**했는지 확인

### Q3: 배포가 실패합니다
**A**:
1. Deployments → 실패한 배포 클릭
2. **Build Logs** 확인
3. 오류 메시지 확인 후 문의

---

## 📊 진행 상황 체크리스트

- [ ] Vercel 로그인 완료
- [ ] bible-study-app-gold 프로젝트 찾기
- [ ] Settings → Environment Variables 접속
- [ ] VITE_SUPABASE_URL 추가 (3개 환경 체크)
- [ ] VITE_SUPABASE_ANON_KEY 추가 (3개 환경 체크)
- [ ] 재배포 실행
- [ ] 배포 완료 대기 (2-3분)
- [ ] 사이트에서 SVG 아이콘 확인
- [ ] Console 오류 확인

---

## ⏱️ 예상 소요 시간
- 환경 변수 추가: **2-3분**
- 재배포: **2-3분**
- 확인: **1분**
- **총 5-7분 이내 완료**

---

**작성자**: Claude Code
**날짜**: 2025-10-21
**우선순위**: 🔥 최우선
**난이도**: ⭐ 매우 쉬움
