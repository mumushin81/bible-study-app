# 플래시카드 이미지 로딩 개선

## 주요 변경 사항

### 1. 타입 정의 확장
- `Word` 인터페이스에 `iconSvg` 속성 추가
- 레거시 SVG 이미지 지원을 위한 타입 확장

### 2. 컴포넌트 수정
- `FlashCardFront`와 `FlashCardBack` 컴포넌트 업데이트
- `iconSvg` 속성을 `HebrewIcon` 컴포넌트에 전달
- 조건부 SVG 렌더링 지원

### 3. 이미지 로딩 로직 개선
- 기존 JPG/GIF 이미지와 레거시 SVG 이미지의 통합 처리
- 데이터베이스의 기존 이미지 자산 완전 지원

## 구현 세부 사항

```typescript
// 타입 정의
export interface Word {
  // ... 기존 속성들
  iconUrl?: string;  // JPG/GIF 이미지 URL
  iconSvg?: string;  // 레거시 SVG 이미지
}

// 컴포넌트 수정 예시
<HebrewIcon
  word={word.hebrew}
  iconUrl={word.iconUrl}
  iconSvg={'iconSvg' in word ? word.iconSvg : undefined}
  className="w-full h-full object-cover"
/>
```

## 주의사항
- SVG 이미지와 JPG/GIF 이미지 간 우선순위 관리
- 기존 데이터베이스 마이그레이션을 고려한 유연한 접근

## 성능 및 호환성
- 기존 이미지 에셋의 완전한 지원
- 추가적인 브라우저 호환성 확보
- 이미지 로딩 실패 시 폴백 메커니즘 강화

## 향후 개선 방향
- 이미지 마이그레이션 스크립트 개발
- 데이터베이스 이미지 에셋 정리
- 자동화된 이미지 변환 및 최적화 도구 개발