# HebrewIcon 이미지 처리 변경 노트

## 주요 변경 내용
- 이미지 URL 검증 로직 엄격화
- 자동 이미지 생성 기능 제거
- Supabase 스토리지 URL 패턴 강화

## 검증 규칙
- 오직 Supabase 공개 URL만 허용
- 디렉토리 기반 엄격한 패턴 매칭
- 이미지 유형별 고유한 URL 패턴

### 허용되는 이미지 디렉토리
1. `hebrew-icons/icons/`: UUID 기반 JPG 이미지
2. `hebrew-icons/word_icons/`: 명시적 이름 기반 JPG 이미지
3. `animated-icons/gifs/`: 애니메이션 GIF 이미지

## 변경 이유
- 보안성 강화
- URL 일관성 확보
- 이미지 소스의 신뢰성 검증

## 주의사항
- 기존 이미지 URL 전체 검토 필요
- 모든 이미지는 Supabase 스토리지에서만 로드 가능
- 외부 이미지 소스 차단

## 향후 개선 방향
- 이미지 캐싱 메커니즘 도입
- 추가 이미지 검증 로직 개발
- 성능 최적화