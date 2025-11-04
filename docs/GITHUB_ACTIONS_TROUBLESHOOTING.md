# GitHub Actions 워크플로우 문제 해결 가이드

## 워크플로우 상태 확인 방법

### 1. 웹 인터페이스에서 확인
1. GitHub 저장소 페이지 접속
2. "Actions" 탭 클릭
3. 최근 워크플로우 실행 선택
4. 상세 로그 및 상태 확인

### 2. CLI로 확인
```bash
# GitHub CLI 설치 필요
gh auth login
gh run list --workflow=deploy.yml
```

### 3. 일반적인 문제 해결

#### 권한 문제
- 저장소 Settings > Actions > General 확인
- Workflow permissions 설정 확인

#### 환경변수 누락
- Settings > Secrets and variables > Actions
- Repository secrets 설정 확인
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 4. 로그 분석
- 빌드 실패 시 전체 로그 확인
- 오류 메시지의 구체적인 원인 파악

### 5. 수동 배포 대안
```bash
npm run build
npm run deploy
```

### 연락처
문제 지속 시 GitHub 지원 또는 프로젝트 관리자에게 문의