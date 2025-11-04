# Vercel CLI 로그인 가이드

## 로그인 절차

1. 터미널에서 다음 명령어 실행:
   ```bash
   vercel login
   ```

2. 터미널에 표시되는 URL (예: https://vercel.com/oauth/device?user_code=QFTH-VJQD)을 웹 브라우저에서 열기

3. 화면의 지시에 따라 GitHub 또는 이메일로 로그인

4. 인증 코드 입력 (터미널에 표시된 코드)

5. 계정 연결 및 권한 승인

## 문제 해결

- GitHub 계정 사용 권장
- 방화벽이나 VPN으로 인해 문제 발생 시 임시 해제
- 브라우저 쿠키/캐시 초기화
- Vercel 공식 지원: support@vercel.com

## 대안적 방법

1. 웹 인터페이스 로그인
   - https://vercel.com 접속
   - GitHub/Google 계정으로 로그인

2. 토큰을 통한 CLI 인증
   ```bash
   vercel login --token YOUR_VERCEL_TOKEN
   ```
   - 토큰은 Vercel 대시보드에서 생성 가능