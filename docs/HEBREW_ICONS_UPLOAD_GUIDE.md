# 히브리어 아이콘 이미지 업로드 가이드

## 배경
플래시카드의 히브리어 단어 아이콘은 Supabase Storage에 저장됩니다.

## 사전 요구사항
- Node.js (v16 이상)
- Supabase 계정
- `.env` 파일에 다음 환경변수 설정 필요:
  ```
  SUPABASE_URL=your_supabase_project_url
  SUPABASE_SERVICE_KEY=your_supabase_service_key
  ```

## 업로드 절차

### 1. 이미지 준비
- 이미지는 `/icons` 디렉토리에 저장
- 파일명 규칙: `word_{해시값}.jpg`
  - 예: `word_51080d41f61d9530362485df0acd7645.jpg`

### 2. 스크립트 실행
```bash
# 종속성 설치
npm install @supabase/supabase-js

# 스크립트 실행
npx tsx scripts/upload_hebrew_icons.ts
```

## 문제 해결
- 업로드 실패 시 콘솔 오류 메시지 확인
- Supabase 서비스 키 및 URL 재확인
- 이미지 파일 권한 및 포맷 검증

## 자동화 고려사항
- CI/CD 파이프라인에 통합 고려
- 정기적인 이미지 검증 스크립트 추가 권장

## 보안 주의사항
- 서비스 키는 절대 공개하지 말 것
- `.env` 파일은 `.gitignore`에 추가