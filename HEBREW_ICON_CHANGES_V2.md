# HebrewIcon 컴포넌트 개선 노트 (v2)

## 주요 변경 사항

### 1. URL 검증 로직 강화
- `URL` 객체를 사용한 동적 URL 파싱
- 쿼리 파라미터 지원
- 더 유연하고 안전한 URL 검증 메커니즘

### 2. SVG 폴백 지원 복원
- `iconSvg` 프로퍼티 추가
- SVG 이미지 렌더링 로직 재구현
- 레거시 SVG 아이콘 완전 지원

### 3. 이미지 로딩 로직 개선
- 이미지 URL 및 SVG 상태 통합 관리
- 에러 상태 초기화 메커니즘 강화
- 다양한 이미지 형식 처리 유연성 확보

## 구현 세부 사항

### URL 검증 로직
```typescript
function isValidImage(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // 동적 URL 구조 분석
    // 쿼리 파라미터 지원
  } catch {
    return false;
  }
}
```

### SVG 폴백 지원
```typescript
// SVG 이미지가 있는 경우 렌더링
if (iconSvg) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
}
```

## 주의사항
- 기존 이미지 URL 구조 완전 지원
- 레거시 SVG 이미지와의 호환성 확보
- 쿼리 파라미터가 포함된 Supabase 이미지 URL 지원

## 향후 개선 방향
- 이미지 로딩 캐싱 메커니즘 도입
- 성능 최적화
- 추가 이미지 형식 지원 검토