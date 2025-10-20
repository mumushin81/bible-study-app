# 🎨 히브리어 단어 아이콘 자동 생성 시스템

## 개요

AI를 사용하여 히브리어 단어의 의미를 분석하고, 화려하고 웅장한 SVG 아이콘을 자동으로 생성하는 시스템입니다.

## 특징

- 🤖 **AI 기반 생성**: Claude API를 사용하여 단어의 의미를 이해하고 시각화
- 🎨 **화려한 디자인**: 다채로운 그라디언트와 풍부한 색상
- 💫 **특수 효과**: drop-shadow, opacity, 그라디언트를 활용한 입체감
- 🔄 **자동화**: 배치 모드로 여러 단어를 한번에 생성
- ⚡ **즉시 사용**: React 컴포넌트로 바로 생성되어 import 가능

## 설치

### 1. 환경 변수 설정

`.env.local` 파일에 Claude API 키를 추가하세요:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

## 사용 방법

### 1. 단일 단어 아이콘 생성

```bash
npm run icon:generate <히브리어> <의미> <한글발음> [문맥]
```

**예시:**
```bash
npm run icon:generate "הָאָרֶץ" "땅, 지구" "하아레츠" "하나님이 창조하신 물리적 세계"
npm run icon:generate "הַשָּׁמַיִם" "하늘들" "하샤마임"
npm run icon:generate "אוֹר" "빛" "오르" "하나님의 첫 창조 명령"
```

### 2. 일괄 생성 (배치 모드)

```bash
npm run icon:batch
```

미리 정의된 5개 단어의 아이콘을 자동으로 생성합니다:
- הָאָרֶץ (땅)
- הַשָּׁמַיִם (하늘)
- אוֹר (빛)
- מַיִם (물)
- עֵץ (나무)

### 3. 커스텀 배치 생성

`scripts/icons/generateIcon.ts`의 `commonWords` 배열을 수정하여 원하는 단어들을 추가할 수 있습니다.

## 생성 과정

1. **프롬프트 생성**: 단어 정보를 바탕으로 상세한 디자인 요구사항 생성
2. **AI 호출**: Claude API로 SVG 코드 생성 요청
3. **코드 추출**: 응답에서 React 컴포넌트 코드 추출
4. **파일 저장**: `src/components/icons/{단어}IconColorful.tsx`에 저장

## 생성된 파일 구조

```typescript
import React from 'react';

interface HaaretzIconColorfulProps {
  size?: number;
  className?: string;
}

/**
 * הָאָרֶץ (하아레츠) - 땅, 지구
 * [아이콘 설명]
 */
const HaaretzIconColorful: React.FC<HaaretzIconColorfulProps> = ({
  size = 64,
  className = ''
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* 화려한 SVG 코드 */}
    </svg>
  );
};

export default HaaretzIconColorful;
```

## 생성된 아이콘 사용하기

### 1. 직접 import

```tsx
import { HaaretzIconColorful } from '@/components/icons';

<HaaretzIconColorful size={64} />
```

### 2. 동적 로딩

```tsx
import { getColorfulIconForWord } from '@/components/icons';

const IconComponent = getColorfulIconForWord('הָאָרֶץ');
if (IconComponent) {
  return <IconComponent size={64} />;
}
```

### 3. export에 추가

생성 후 `src/components/icons/index.ts`에 수동으로 추가:

```typescript
export { default as HaaretzIconColorful } from './HaaretzIconColorful';

export const HebrewIconsColorful = {
  // ...
  'הָאָרֶץ': HaaretzIconColorful,
} as const;
```

## 디자인 가이드라인

생성되는 아이콘은 다음 기준을 따릅니다:

### 색상
- 최소 4-6가지 색상 사용
- 풍부한 그라디언트
- 단어의 의미와 어울리는 색상 팔레트

### 구조
- viewBox: `0 0 64 64`
- `<defs>` 섹션에 모든 그라디언트 정의
- radialGradient, linearGradient 활용

### 효과
- `filter="drop-shadow(...)"` - 그림자
- `opacity` - 투명도로 깊이감
- 여러 레이어로 입체감 표현

## 예시 아이콘

### 이미 생성된 아이콘

1. **BereshitIconColorful** (בְּרֵאשִׁית - 처음)
   - 화려한 일출 장면
   - 금색/주황색/분홍색 그라디언트

2. **ElohimIconColorful** (אֱלֹהִים - 하나님)
   - 금색 왕관과 12방향 광선
   - 삼위일체 삼각형

3. **BaraIconColorful** (בָּרָא - 창조하다)
   - 우주 폭발 장면
   - 새롭게 만들어지는 별들

4. **NachashIconColorful** (נָחָשׁ - 뱀)
   - 화려한 초록/금색 뱀
   - 유혹의 빨간 사과

## 문제 해결

### API 키 오류
```
❌ ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다
```

**해결**: `.env.local` 파일에 API 키를 추가하세요.

### 생성 실패
```
❌ 실패: הָאָרֶץ
```

**해결**:
- 네트워크 연결 확인
- API 키 유효성 확인
- 3초 후 재시도

### 컴포넌트 이름 충돌

생성된 컴포넌트 이름이 이미 존재하는 경우:
1. 기존 파일 백업
2. 생성된 새 파일 확인
3. 수동으로 병합

## API 비용

- Claude API 사용 (claude-sonnet-4)
- 아이콘 1개당 약 3,000-4,000 토큰 사용
- 비용: 아이콘 1개당 약 $0.02-0.03

## 팁

1. **배치 생성 시 주의**: Rate limit을 피하기 위해 각 요청 사이에 3초 대기
2. **프롬프트 수정**: `scripts/icons/generateIconPrompt.ts`에서 프롬프트 커스터마이징 가능
3. **재생성**: 만족스럽지 않은 결과는 동일한 명령어로 다시 실행
4. **수동 편집**: 생성 후 tsx 파일을 직접 수정하여 미세 조정 가능

## 향후 계획

- [ ] 더 많은 단어 아이콘 생성 (100개+)
- [ ] 아이콘 미리보기 페이지
- [ ] 아이콘 검색 시스템
- [ ] 스타일 변형 (3D, 미니멀, 만화 등)
- [ ] 애니메이션 효과 추가

## 참고

- 생성된 아이콘: `src/components/icons/*IconColorful.tsx`
- 스크립트: `scripts/icons/`
- 예시 페이지: `src/components/examples/WordIconExample.tsx`
