# 🎨 JPG 아이콘 마스터 가이드

**최종 업데이트**: 2025-10-25
**상태**: ✅ 운영 중
**방식**: Canvas API 직접 생성

---

## 📚 목차

1. [개요](#1-개요)
2. [빠른 시작](#2-빠른-시작)
3. [가이드라인 요약](#3-가이드라인-요약)
4. [워크플로우](#4-워크플로우)
5. [문제 해결](#5-문제-해결)
6. [품질 관리](#6-품질-관리)
7. [참고 문서](#7-참고-문서)

---

## 1. 개요

### 1.1 JPG 직접 생성 방식

**기존 방식 (SVG)**:
- ❌ Claude API로 SVG 코드 텍스트 생성
- ❌ Gradient ID 충돌 문제
- ❌ 제한된 색상 표현
- ❌ API 비용 발생

**새로운 방식 (JPG)**:
- ✅ Canvas API로 직접 프로그래밍
- ✅ 풍부한 색감과 그라디언트
- ✅ 더 예술적인 표현
- ✅ 외부 API 불필요
- ✅ 무료

### 1.2 핵심 원칙

| 원칙 | 설명 | 중요도 |
|------|------|--------|
| **파스텔 색감** | 흰색이 섞인 부드러운 색상만 사용 | ⭐⭐⭐⭐⭐ |
| **화려함** | 2-4개 색상의 다채로운 그라디언트 | ⭐⭐⭐⭐⭐ |
| **밝은 색상** | 최소 70% 밝기 (180/255) | ⭐⭐⭐⭐⭐ |
| **예술적 표현** | 단어 의미를 상징적으로 표현 | ⭐⭐⭐⭐ |

### 1.3 기대 효과

- 🎨 **더 풍부한 색감**: JPG는 SVG보다 다양한 색상 표현 가능
- ✨ **화려한 그라디언트**: Canvas의 방사형/선형 그라디언트 자유롭게 사용
- 🖼️ **예술적 자유도**: 프로그래밍으로 복잡한 패턴도 구현 가능
- 💰 **비용 절감**: Claude API 사용 안함

---

## 2. 빠른 시작

### 2.1 설치

```bash
# Canvas 라이브러리 설치
npm install canvas

# 타입 정의 (선택)
npm install --save-dev @types/node
```

### 2.2 첫 아이콘 생성

```bash
# 전체 단어 생성 (창세기 1:1)
npx tsx scripts/icons/generateDirectJpg.ts

# 결과 확인
ls -lh output/direct_jpg/

# 브라우저에서 확인
open output/direct_jpg/bereshit.jpg
```

### 2.3 생성 결과 예시

```
output/direct_jpg/
├── bereshit.jpg    # 29 KB - 태초에 (황금 태양)
├── bara.jpg        # 35 KB - 창조하다 (폭발 입자)
├── elohim.jpg      # 15 KB - 하나님 (신성한 후광)
├── hashamayim.jpg  # 28 KB - 하늘 (구름과 별)
├── haaretz.jpg     # 24 KB - 땅 (언덕과 나무)
├── et.jpg          # 45 KB - 목적격 조사 (흐르는 리본)
└── veet.jpg        # 45 KB - 그리고 (연결 리본)
```

---

## 3. 가이드라인 요약

### 3.1 색상 규정

#### ✅ 권장 색상 (파스텔)

```javascript
const RECOMMENDED_COLORS = {
  // 신성함
  gold: '#FFD700',
  peach: '#FFE5B4',
  cream: '#FFF9E6',

  // 하늘
  skyBlue: '#87CEEB',
  powderBlue: '#B0E0E6',
  aliceBlue: '#F0F8FF',

  // 생명
  lightPink: '#FFB6C1',
  hotPink: '#FF69B4',
  lavenderBlush: '#FFF0F5',

  // 자연
  lightGreen: '#90EE90',
  paleGreen: '#98FB98',
  mintCream: '#F5FFFA',

  // 영성
  lavender: '#E1BEE7',
  plum: '#DDA0DD',
  thistle: '#D8BFD8'
}
```

#### ❌ 금지 색상 (어두운 색)

```javascript
const FORBIDDEN_COLORS = {
  // 절대 사용 금지
  black: '#000000',
  darkGray: '#1C1C1C',
  navy: '#000428',
  darkBrown: '#3E2723',
  darkGreen: '#1B5E20'
}
```

### 3.2 디자인 패턴

| 패턴 | 용도 | 색상 | 예시 단어 |
|------|------|------|----------|
| **방사형 후광** | 신성함, 중요함 | 골드, 화이트 | 하나님, 태초 |
| **그라디언트 배경** | 풍경, 분위기 | 하늘색, 그린 | 하늘, 땅 |
| **입자 효과** | 창조, 에너지 | 다채로운 | 창조하다 |
| **흐르는 리본** | 연결, 흐름 | 무지개 | 목적격 조사 |
| **자연 요소** | 땅, 생명 | 그린, 브라운 | 나무, 꽃 |

### 3.3 기술 요구사항

| 항목 | 값 | 비고 |
|------|-----|------|
| **해상도** | 512x512px | 고정 |
| **포맷** | JPG | PNG보다 작은 파일 |
| **Quality** | 95 | 0-100 범위 |
| **파일 크기** | 15-50 KB | 최적화 |
| **밝기** | 최소 180/255 | 70% 이상 |

---

## 4. 워크플로우

### 4.1 신규 단어 아이콘 생성

```mermaid
graph TD
    A[단어 의미 분석] --> B[색상 팔레트 선택]
    B --> C[디자인 패턴 결정]
    C --> D[렌더러 함수 작성]
    D --> E[테스트 생성]
    E --> F{품질 검증}
    F -->|통과| G[매핑 추가]
    F -->|실패| D
    G --> H[전체 생성]
```

#### 단계별 상세

**1단계: 단어 의미 분석**
```typescript
// 예: בָּרָא (바라 - 창조하다)
의미: 창조, 만들다, 형성하다
카테고리: 동사, 행위
이미지: 폭발, 에너지, 입자, 빛
```

**2단계: 색상 팔레트 선택**
```typescript
// 창조 = 다채로운 에너지
const colors = {
  primary: '#FF69B4',    // 핑크 (생명)
  secondary: '#4FC3F7',  // 블루 (하늘)
  accent: '#FFD700',     // 골드 (신성)
  background: '#F3E5F5'  // 라벤더 (배경)
}
```

**3단계: 디자인 패턴 결정**
- 배경: 파스텔 그라디언트
- 메인: 중심에서 폭발하는 입자
- 효과: 파동, 빛나는 핵

**4단계: 렌더러 작성**
```typescript
function drawBara(canvas: Canvas) {
  // 구현...
}
```

**5단계: 테스트**
```bash
npx tsx scripts/icons/generateDirectJpg.ts
```

**6단계: 매핑 추가**
```typescript
const WORD_RENDERERS: Record<string, (canvas: Canvas) => void> = {
  'bara': drawBara,
  // ...
}
```

### 4.2 대량 생성

```bash
# 모든 단어 생성
npx tsx scripts/icons/generateDirectJpg.ts

# 진행 상황
[1/7] 처리 중... bereshit.jpg ✅ 29 KB
[2/7] 처리 중... bara.jpg ✅ 35 KB
...
[7/7] 처리 중... haaretz.jpg ✅ 24 KB

✅ 완료: 7/7
```

---

## 5. 문제 해결

### 5.1 일반적인 문제

#### 문제 1: Canvas 설치 오류

**증상**:
```
Error: Cannot find module 'canvas'
```

**해결**:
```bash
npm install canvas

# macOS에서 추가 의존성 필요 시
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### 문제 2: 이미지가 너무 어둡다

**증상**:
- 생성된 JPG가 파스텔이 아닌 진한 색

**원인**:
```typescript
// ❌ 잘못된 색상 사용
ctx.fillStyle = '#8B0000'  // 진한 빨강
```

**해결**:
```typescript
// ✅ 파스텔 색상 사용
ctx.fillStyle = '#FFB6C1'  // 라이트 핑크

// 또는 변환 함수 사용
function toPastel(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const pr = Math.round(r + (255 - r) * 0.5)
  const pg = Math.round(g + (255 - g) * 0.5)
  const pb = Math.round(b + (255 - b) * 0.5)

  return `#${pr.toString(16).padStart(2, '0')}${pg.toString(16).padStart(2, '0')}${pb.toString(16).padStart(2, '0')}`
}
```

#### 문제 3: 파일 크기가 너무 크다

**증상**:
```
bara.jpg: 120 KB (너무 큼)
```

**원인**:
- Quality가 너무 높음 (100)
- 복잡한 패턴

**해결**:
```typescript
// Quality 조정
const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.90 })  // 95 → 90

// 또는 해상도 줄이기
const canvas = createCanvas(512, 512)  // 1024 → 512
```

#### 문제 4: 그라디언트가 보이지 않는다

**증상**:
- 단색으로만 표시됨

**원인**:
```typescript
// ❌ 그라디언트 색상이 너무 비슷함
gradient.addColorStop(0, '#FFD700')
gradient.addColorStop(1, '#FFD800')  // 거의 같음
```

**해결**:
```typescript
// ✅ 충분한 대비
gradient.addColorStop(0, '#FFD700')  // 골드
gradient.addColorStop(1, '#FFA500')  // 오렌지
```

### 5.2 디버깅 팁

```typescript
// 디버그 로그 추가
function drawMyWord(canvas: Canvas) {
  console.log('🎨 Drawing MyWord...')

  const ctx = canvas.getContext('2d')

  // 색상 확인
  console.log('Primary color:', primaryColor)
  console.log('Brightness:', calculateBrightness(primaryColor))

  // ... 렌더링 코드
  console.log('✅ Drawing complete')
}

// 밝기 계산 함수
function calculateBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return (r * 299 + g * 587 + b * 114) / 1000
}
```

---

## 6. 품질 관리

### 6.1 체크리스트

생성된 JPG 검증:

**색상**:
- [ ] 모든 색상이 파스텔인가?
- [ ] 밝기가 최소 180/255인가?
- [ ] 어두운 색상이 없는가?

**디자인**:
- [ ] 2개 이상의 그라디언트 사용했는가?
- [ ] 입체감이 있는가?
- [ ] 단어 의미와 일치하는가?
- [ ] 화려하고 생동감 있는가?

**기술**:
- [ ] 512x512 해상도인가?
- [ ] JPG 포맷인가?
- [ ] 파일 크기가 15-50 KB인가?
- [ ] Quality 95로 저장했는가?

### 6.2 품질 등급

| 등급 | 기준 | 예시 |
|------|------|------|
| ⭐⭐⭐⭐⭐ 우수 | 파스텔 + 화려 + 예술적 | bereshit.jpg, bara.jpg |
| ⭐⭐⭐⭐ 양호 | 파스텔 + 화려 | hashamayim.jpg |
| ⭐⭐⭐ 보통 | 파스텔만 충족 | - |
| ⭐⭐ 미흡 | 색상만 밝음 | - |
| ⭐ 불량 | 어두운 색 포함 | - |

### 6.3 자동 검증 스크립트

```typescript
// scripts/validate-jpg-icons.ts
import { readFileSync } from 'fs'
import { createCanvas, loadImage } from 'canvas'

async function validateJpg(filepath: string) {
  const image = await loadImage(filepath)
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, image.width, image.height)
  const pixels = imageData.data

  let darkPixels = 0
  let totalPixels = pixels.length / 4

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    if (brightness < 180) {
      darkPixels++
    }
  }

  const darkPercentage = (darkPixels / totalPixels) * 100

  if (darkPercentage > 10) {
    console.error(`❌ ${filepath}: ${darkPercentage.toFixed(1)}% 어두운 픽셀`)
    return false
  } else {
    console.log(`✅ ${filepath}: ${(100 - darkPercentage).toFixed(1)}% 밝음`)
    return true
  }
}
```

---

## 7. 참고 문서

### 7.1 공식 가이드라인

1. **`docs/JPG_ICON_GUIDELINES.md`** ⭐⭐⭐⭐⭐
   - 색상 팔레트
   - 디자인 원칙
   - Canvas 기법

2. **`docs/JPG_GENERATION_GUIDE.md`** ⭐⭐⭐⭐⭐
   - 실무 개발 가이드
   - 코드 예제
   - 패턴 라이브러리

3. **이 문서 (JPG_ICON_MASTER_GUIDE.md)** ⭐⭐⭐⭐⭐
   - 전체 개요
   - 워크플로우
   - 문제 해결

### 7.2 구현 코드

- **`scripts/icons/generateDirectJpg.ts`** - 메인 생성 스크립트
- **`scripts/icons/readGenesis1_1.ts`** - 창세기 1:1 단어 데이터

### 7.3 외부 자료

**Canvas API**:
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [node-canvas Documentation](https://github.com/Automattic/node-canvas)

**색상 이론**:
- [Pastel Color Theory](https://www.colorpsychology.org/pastel-colors/)
- [Color Hunt - Pastel Palettes](https://colorhunt.co/palettes/pastel)

**디자인 영감**:
- [Dribbble - Pastel Icons](https://dribbble.com/tags/pastel-icons)
- [Behance - Icon Design](https://www.behance.net/search/projects?search=pastel+icons)

---

## 📊 통계 (현재 상태)

| 지표 | 수치 | 상태 |
|------|------|------|
| 총 생성 단어 | 7개 | ✅ |
| 평균 파일 크기 | 29 KB | ✅ 최적 |
| 평균 생성 시간 | <1초/개 | ✅ 빠름 |
| 품질 등급 | ⭐⭐⭐⭐⭐ 우수 | ✅ |
| API 비용 | $0 | ✅ 무료 |

---

## 🎯 로드맵

### Phase 1: 기본 구현 ✅
- [x] Canvas 설치
- [x] 기본 렌더러 7개
- [x] 테스트 생성

### Phase 2: 확장 (진행 중)
- [ ] 창세기 1장 전체 단어 렌더러 작성
- [ ] 자동 색상 선택 알고리즘
- [ ] 품질 자동 검증

### Phase 3: 최적화
- [ ] 렌더링 성능 개선
- [ ] 파일 크기 최적화
- [ ] 일괄 생성 병렬화

### Phase 4: 고급 기능
- [ ] 애니메이션 효과
- [ ] 동적 스타일 변경
- [ ] AI 기반 디자인 제안

---

## ❓ FAQ

### Q1: SVG 대신 JPG를 사용하는 이유는?

**A**:
- ✅ 더 풍부한 색감 표현
- ✅ 복잡한 그라디언트 자유롭게 사용
- ✅ Canvas API로 프로그래밍 방식 생성 (Claude API 불필요)
- ✅ 비용 절감 ($0)

### Q2: 파스텔 색상만 사용해야 하는 이유는?

**A**:
- 부드럽고 편안한 학습 환경 조성
- 장시간 학습 시 눈의 피로 감소
- 긍정적인 감정과 기억력 향상
- 브랜드 일관성 유지

### Q3: 파일 크기가 왜 중요한가?

**A**:
- 웹 로딩 속도 (15-50 KB = 빠른 로딩)
- 모바일 데이터 절약
- 전체 앱 용량 최소화

### Q4: 새로운 단어 렌더러는 어떻게 추가하나?

**A**:
```typescript
// 1. 렌더러 함수 작성
function drawNewWord(canvas: Canvas) {
  // ... 구현
}

// 2. 매핑에 추가
const WORD_RENDERERS: Record<string, (canvas: Canvas) => void> = {
  'newword': drawNewWord,
  // ...
}
```

### Q5: 어두운 색을 꼭 피해야 하나?

**A**:
네, 절대적으로!
- ❌ 검은색 (`#000000`)
- ❌ 진한 회색 (`#1C1C1C`)
- ❌ 진한 네이비 (`#000428`)

대신:
- ✅ 밝은 그레이 (`#D3D3D3`)
- ✅ 파스텔 네이비 (`#B0C4DE`)

---

**최종 업데이트**: 2025-10-25
**작성자**: Claude Code
**버전**: 1.0 (JPG 직접 생성)
**상태**: ✅ 운영 중
