# Supabase 설정 가이드

## 이메일 확인 비활성화 (개발/테스트 환경)

테스트를 원활하게 진행하려면 Supabase의 이메일 확인 기능을 비활성화해야 합니다.

### 설정 변경 방법

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/ouzlnriafovnxlkywerk
   ```

2. **Authentication 메뉴로 이동**
   - 왼쪽 사이드바에서 `Authentication` 클릭
   - `Providers` 탭 선택

3. **Email 설정 변경**
   - `Email` provider 찾기
   - 톱니바퀴 아이콘 클릭 (설정)
   - `Confirm email` 옵션 찾기
   - **OFF로 변경** (비활성화)

4. **저장**
   - `Save` 버튼 클릭

### 변경 후 효과

이메일 확인 비활성화 후:
- ✅ 회원가입 즉시 로그인 가능
- ✅ 이메일 확인 링크 불필요
- ✅ 테스트 자동화 가능
- ⚠️ 프로덕션에서는 다시 활성화 권장

### 대체 방법 (이메일 확인 유지 시)

이메일 확인을 유지하면서 테스트하려면:

#### 방법 1: 수동 사용자 확인
1. Supabase Dashboard → Authentication → Users
2. 테스트 사용자 찾기
3. `...` 메뉴 → `Confirm email`

#### 방법 2: Inbucket 사용 (로컬 개발)
```bash
# Docker 시작
# Supabase 로컬 환경 시작
supabase start

# Inbucket 웹 인터페이스
# http://localhost:54324
```

## 현재 프로젝트 설정

### 프로덕션 (ouzlnriafovnxlkywerk.supabase.co)
- Region: Seoul (ap-northeast-2)
- Email confirmation: **활성화됨** (변경 필요)
- RLS policies: 활성화됨
- Tables: 15개

### 로컬 (supabase/config.toml)
```toml
[auth.email]
enable_signup = true
enable_confirmations = false  # 이미 비활성화됨
```

## 환경별 권장 설정

### 개발 환경
```
✅ enable_confirmations = false
✅ enable_signup = true
✅ SMTP 비활성화 (Inbucket 사용)
```

### 프로덕션 환경
```
⚠️ enable_confirmations = true (권장)
✅ enable_signup = true
✅ SMTP 활성화 (실제 이메일 전송)
✅ Rate limiting 활성화
```

## 보안 고려사항

### 이메일 확인 비활성화 시 리스크
1. **스팸 계정 생성**: 봇이 대량 계정 생성 가능
2. **이메일 소유권 미확인**: 타인 이메일로 계정 생성 가능
3. **알림 실패**: 유효하지 않은 이메일 주소 가능

### 완화 방안
1. **개발 환경에서만 비활성화**
2. **Rate limiting 활성화**
   - 시간당 회원가입 제한
   - IP별 제한
3. **프로덕션 배포 전 재활성화**
4. **reCAPTCHA 추가** (향후)

## 환경 분리 권장

### 장기적 해결책
```
Development:  supabase-dev.supabase.co  (이메일 확인 OFF)
Staging:      supabase-staging.supabase.co (이메일 확인 ON)
Production:   supabase-prod.supabase.co (이메일 확인 ON + 모든 보안)
```

### 환경별 .env 파일
```bash
# .env.development
VITE_SUPABASE_URL=https://xxx-dev.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# .env.production
VITE_SUPABASE_URL=https://xxx-prod.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## 다음 단계

1. ✅ **지금 당장**: Dashboard에서 이메일 확인 비활성화
2. 📝 **단기**: 테스트 완료 후 재활성화
3. 🎯 **중기**: 환경별 Supabase 프로젝트 분리
4. 🚀 **장기**: reCAPTCHA, SMS 인증 등 추가 보안

## 참고 문서
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/auth-email)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Rate Limiting](https://supabase.com/docs/guides/auth/auth-rate-limits)
