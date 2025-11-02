# 성경 학습 애플리케이션

## 배포 정보
- **GitHub Pages**: [https://jinxin.github.io/bible-study-app/](https://jinxin.github.io/bible-study-app/)

## 시작하기

### 필수 환경변수
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 익명 키

### 개발 환경 설정
1. 저장소 클론
2. 종속성 설치
   ```bash
   npm install
   ```
3. 개발 서버 실행
   ```bash
   npm run dev
   ```

### 배포
GitHub Actions를 통해 자동 배포됩니다.
- `main` 브랜치에 푸시 시 자동 빌드 및 배포