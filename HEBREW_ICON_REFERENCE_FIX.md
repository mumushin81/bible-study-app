# HebrewIcon 컴포넌트 참조 오류 수정

## 문제 상황
- `generatedIconUrl` 변수 제거로 인한 참조 오류 발생
- 이미지 렌더링 로직에서 사용되지 않는 변수로 인한 런타임 에러

## 수정 내용
### 변경 전
```typescript
const displayUrl = generatedIconUrl || iconUrl;

if (displayUrl && !imageError) {
  // 이미지 렌더링 로직
}
```

### 변경 후
```typescript
if (iconUrl && !imageError) {
  // 직접 iconUrl 사용
  // generatedIconUrl 관련 로직 완전 제거
}
```

## 주요 개선 사항
- 불필요한 변수 제거
- 이미지 URL 직접 사용
- 코드 단순화
- 런타임 오류 해결

## 영향 범위
- HebrewIcon 컴포넌트
- 이미지 렌더링 로직
- 이미지 URL 처리 방식

## 주의사항
- 자동 이미지 생성 기능 완전 제거
- Supabase 저장소의 기존 이미지 URL 직접 사용