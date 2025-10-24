# FlashCard 컴포넌트 완전 재설계 계획

## 🎯 목표

MD 지침(VERSE_CREATION_GUIDELINES.md)에 **정확히 일치**하는 플래시카드 컴포넌트 작성

---

## 📋 MD 지침 필수 필드

```typescript
interface Word {
  // 기본 정보
  hebrew: string;          // ✅ 필수
  meaning: string;         // ✅ 필수
  ipa: string;             // ✅ 필수
  korean: string;          // ✅ 필수

  // 학습 정보
  letters: string;         // ✅ 필수 - "ש(sh) + ָ(a) + ל(l) + וֹ(o) + ם(m)"
  root: string;            // ✅ 필수 - "ב-ר-א (bara)"
  grammar: string;         // ✅ 필수 - "명사/동사/형용사/전치사/접속사/부사/대명사"

  // 시각적 요소
  emoji: string;           // ✅ 필수 - fallback용
  iconSvg: string;         // ✅ 필수 - 화려한 커스텀 SVG

  // 선택 필드
  relatedWords?: string[]; // 🔵 선택 - 관련 단어들
  structure?: string;      // 🔵 선택
  category?: string;       // 🔵 선택
}
```

---

## 🎴 새 FlashCard 디자인 (2025-10-24 개정)

### 앞면 (Front) - 학습 초점
위에서 아래로 가운데 정렬
```
┌─────────────────────────────┐
│  [품사]          ⭐         │
│                             │
│      [커스텀 SVG 아이콘]      │
│                             │
│   ┌─────────────────────┐   │
│   │  알파벳 읽기         │   │
│   │  בְּ(be)+רֵא(re)    │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────┐  🔊      │
│   │ [베레쉬트]   │          │
│   └─────────────┘          │
│                             │
│   더블 탭하여 뜻 보기        │
└─────────────────────────────┘
```

**필수 요소:**
- ✅ SVG 아이콘 (iconSvg 또는 emoji fallback)
- ✅ 알파벳 읽기 (letters) - 박스로 강조
- ✅ 한국어 발음 (korean) - 박스로 강조
- ✅ 음성 듣기 버튼 (🔊) - 발음 옆에 배치
- ✅ 품사 표시 (grammar) - 상단 좌측
- ✅ 북마크 (⭐) - 상단 우측

### 뒷면 (Back) - 의미 전달
```
┌─────────────────────────────┐
│                             │
│      [커스텀 SVG 아이콘]      │
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │    처음, 태초        │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🌱 어근              │   │
│   │ רֵאשִׁית (레쉬트)     │   │
│   └─────────────────────┘   │
│                             │
│     📖 창세기 1:1           │
└─────────────────────────────┘
```

**필수 요소:**
- ✅ SVG 아이콘
- ✅ 한국어 뜻 (meaning) - 크고 명확하게
- ✅ 어근 (root) - 있는 경우만
- ✅ 구절 출처 (reference) - 하단에 표시

---

## 🎨 핵심 개선사항 (2025-10-24)

### 1. 간소화된 구조
앞면과 뒷면의 역할을 명확히 구분:
- **앞면**: 학습 초점 (알파벳 읽기 + 발음)
- **뒷면**: 의미 전달 (한국어 뜻 + 어근)

### 2. 가독성 향상
모든 주요 콘텐츠를 박스로 강조:
```typescript
// 알파벳 읽기 - 에메랄드 색상 박스
<div className="bg-emerald-50 text-emerald-800 border border-emerald-200">
  {word.letters}
</div>

// 한국어 발음 - 퍼플 색상 박스
<div className="bg-purple-50 text-purple-800 border border-purple-200">
  [{word.korean}]
</div>

// 한국어 뜻 - 블루 색상 박스 (크게)
<div className="bg-blue-50 text-blue-900 border border-blue-200">
  {word.meaning}
</div>

// 어근 - 앰버 색상 박스
<div className="bg-amber-50 border border-amber-200">
  🌱 어근
  {word.root}
</div>
```

### 3. 더블 탭 인터랙션
사용자 경험 개선:
- 단일 탭: 아무 동작 없음
- 더블 탭 (300ms 이내): 카드 뒤집기
- 시각적 피드백: hover 효과 + scale 애니메이션

### 4. 조건부 렌더링
```typescript
// 필수 필드
{word.letters}    // 항상 표시
{word.korean}     // 항상 표시
{word.meaning}    // 항상 표시

// 선택 필드
{word.root && (   // 있을 때만 표시
  <div>어근 섹션</div>
)}
```

---

## 🔄 마이그레이션 전략

### Option A: 점진적 마이그레이션
1. 새 FlashCard 컴포넌트 작성
2. 기존 데이터는 유지하되, 필수 필드 없으면 경고 표시
3. 점차 데이터를 보완

### Option B: 전면 재작성 (추천) ⭐
1. **words 테이블 전체 삭제** (백업 후)
2. **새 FlashCard 컴포넌트** 작성
3. **MD 지침에 맞는 데이터**만 재입력
4. **샘플 데이터**로 먼저 테스트

---

## 📝 구현 단계

### Step 1: Words 테이블 삭제 (백업 포함)
```bash
# Supabase SQL Editor에서 실행
supabase/migrations/20251023_delete_all_words.sql
```

### Step 2: 새 FlashCard 컴포넌트 작성
```typescript
// src/components/shared/FlashCardV2.tsx
// MD 지침에 정확히 맞춰서 작성
```

### Step 3: 샘플 데이터로 테스트
```typescript
// 창세기 1:1의 첫 단어만 입력해서 테스트
const sampleWord = {
  hebrew: 'בְּרֵאשִׁית',
  meaning: '처음, 태초',
  ipa: 'bəreʃit',
  korean: '베레쉬트',
  letters: 'בְּ(be) + רֵא(re) + שִׁ(shi) + ית(t)',
  root: 'רֵאשִׁית (레쉬트)',
  grammar: '명사',
  emoji: '🌅',
  iconSvg: `<svg>...</svg>`,
  relatedWords: ['רֹאשׁ (로쉬 - 머리)', 'רִאשׁוֹן (리쇼온 - 첫째)']
};
```

### Step 4: VocabularyTab에서 사용
```typescript
import FlashCardV2 from './shared/FlashCardV2';

// 기존 FlashCard를 FlashCardV2로 교체
```

### Step 5: 데이터 재입력
- MD 지침에 맞춰서 정확하게 입력
- 모든 필수 필드 포함
- AI를 활용하여 letters, iconSvg 자동 생성

---

## ✅ 체크리스트 (2025-10-24)

### 앞면 확인사항:
- [x] SVG 아이콘 표시
- [x] 알파벳 읽기 (letters) - 에메랄드 박스
- [x] 한국어 발음 (korean) - 퍼플 박스
- [x] 음성 듣기 버튼 (🔊) - 발음 옆 배치
- [x] 품사 (grammar) - 상단 좌측
- [x] 북마크 (⭐) - 상단 우측
- [x] 더블 탭 안내 메시지

### 뒷면 확인사항:
- [x] SVG 아이콘 표시
- [x] 한국어 뜻 (meaning) - 블루 박스, 크게
- [x] 어근 (root) - 앰버 박스, 조건부 표시
- [x] 구절 출처 (reference) - 하단 배치

### 공통 확인사항:
- [x] **다크모드/라이트모드** 양쪽 지원
- [x] **반응형 디자인** (모바일/태블릿/데스크톱)
- [x] **오버플로우 방지** (truncate, line-clamp)
- [x] **더블 탭** 인터랙션 (300ms 이내)
- [x] **Hover 효과** 및 애니메이션

---

## ⚠️ 오버플로우 문제 근본 원인 및 해결책

### 🔍 문제 개요
플래시카드 내용이 카드 경계를 넘어서 표시되는 문제가 반복적으로 발생함.
**조사 일자**: 2025-10-24
**조사 방법**: 10개 병렬 에이전트를 통한 전방위 근본 원인 분석

### 🔴 5가지 근본 원인

#### 1. min-h만 설정, max-h 없음
```typescript
// ❌ 문제: 컨텐츠가 무한정 늘어날 수 있음
className="min-h-[240px] sm:min-h-[280px] md:min-h-[320px]"

// ✅ 해결: 고정 높이 설정
className="h-[360px] sm:h-[400px] md:h-[480px]"
```

**측정 결과:**
- 모바일: 필요 높이 290-396px vs 설정 240px (최대 -156px 부족)
- 데스크톱: 필요 높이 401-578px vs 설정 320px (최대 -258px 부족)

#### 2. justify-center + overflow-hidden 중첩
```typescript
// ❌ 문제: 중앙 정렬 시 gap 공간이 계산에서 제외되어 내용이 상하로 넘침
className="justify-center overflow-hidden"

// ✅ 해결: 상단 정렬 + 스크롤 활성화
className="justify-start pt-4 sm:pt-6 md:pt-8 overflow-y-auto"
```

#### 3. 반응형 콘텐츠 성장률 > 카드 높이 성장률
```typescript
// ❌ 문제:
// - 카드 높이: +33% (240px → 320px)
// - 패딩: +100% (16px → 32px)
// - 폰트: +50%, Gap: +67%, 아이콘: +40%

// ✅ 해결: Gap 값 최적화
gap-3 sm:gap-4 md:gap-5  // ❌ 67% 증가
gap-2 sm:gap-3 md:gap-4  // ✅ 50% 증가
```

#### 4. Truncate 클래스 누락 (Git 이력 분석)
```typescript
// ❌ 커밋 31866bc에서 추가했던 truncate가 박스 스타일 추가 중 삭제됨
className="text-lg sm:text-xl md:text-2xl font-semibold max-w-full px-4 py-2"

// ✅ Truncate 복원
className="text-lg sm:text-xl md:text-2xl font-semibold max-w-full truncate px-4 py-2"
```

#### 5. 절대 위치 요소가 레이아웃 계산에서 제외
```typescript
// ❌ 문제: 구절 출처가 absolute 위치 (~50px)로 flex 계산에서 제외
<div className="absolute bottom-4">📖 {reference}</div>

// ✅ 해결: Flex 레이아웃 기반 위치
<div className="mt-auto">📖 {reference}</div>
```

### ✅ 적용된 5가지 해결책

| 우선순위 | 해결책 | 코드 위치 | 효과 |
|---------|--------|----------|------|
| 🔴 Critical | 고정 높이 + 스크롤 | Line 59, 64, 73, 178 | 컨텐츠가 카드를 무한정 늘릴 수 없음 |
| 🟠 High | justify-start 사용 | Line 79, 191 | 상단 정렬로 오버플로우 방지 |
| 🔴 Critical | truncate 복원 | Line 123 | 긴 텍스트 자동 줄임표 |
| 🟡 Medium | Gap 최적화 | Line 108, 191 | 33% 간격 감소로 공간 확보 |
| 🟡 Medium | Flex 위치 | Line 241 | absolute → mt-auto로 정확한 계산 |

### 📐 구현 코드 패턴 (필수 준수)

```typescript
// 1. 카드 컨테이너 - 고정 높이
<motion.div className="h-[360px] sm:h-[400px] md:h-[480px]">

// 2. 앞면/뒷면 - 스크롤 활성화
<div className="absolute inset-0 p-4 sm:p-6 md:p-8 overflow-y-auto
                flex flex-col items-center justify-start pt-4 sm:pt-6 md:pt-8">

// 3. 내부 콘텐츠 - 최적화된 gap
<div className="flex flex-col gap-2 sm:gap-3 md:gap-4">

// 4. 텍스트 요소 - truncate 반드시 포함
<div className="text-lg sm:text-xl md:text-2xl max-w-full truncate">

// 5. 하단 요소 - mt-auto 사용 (absolute 금지)
<div className="mt-auto">📖 {reference}</div>
```

### 🚨 향후 절대 금지 사항

❌ **절대 하지 말아야 할 것:**
1. `min-h`만 사용하고 `max-h` 또는 고정 `h` 없이 구현
2. `justify-center`와 `overflow-hidden` 동시 사용
3. `truncate` 클래스 삭제 (항상 포함 필수)
4. Gap 값이 카드 높이 성장률보다 크게 증가
5. 카드 내부에서 `absolute` 위치 사용 (flex 기반 위치 사용)

✅ **반드시 지켜야 할 것:**
1. 카드는 **고정 높이** + `overflow-y-auto`로 구현
2. 내부 레이아웃은 **justify-start** + 적절한 padding
3. 모든 텍스트 요소에 **truncate** 또는 **line-clamp** 적용
4. Gap 값은 카드 높이 성장률의 50% 이내로 제한
5. 하단 요소는 **mt-auto** 사용하여 flex 레이아웃 유지

### 📊 성능 검증 기준

수정 후 다음 항목을 반드시 확인:
- [ ] 모바일 (360px): 컨텐츠가 카드 경계 내부에 수납됨
- [ ] 태블릿 (768px): 컨텐츠가 카드 경계 내부에 수납됨
- [ ] 데스크톱 (1024px 이상): 컨텐츠가 카드 경계 내부에 수납됨
- [ ] 긴 텍스트: 자동으로 truncate 또는 스크롤 활성화
- [ ] 다크모드: 스크롤바가 배경과 조화롭게 표시

---

## 🚀 다음 단계

사용자 승인 후:
1. ✅ SQL 스크립트 실행 (words 테이블 삭제)
2. ✅ FlashCardV2.tsx 작성
3. ✅ 샘플 데이터로 테스트
4. ✅ VocabularyTab 업데이트
5. ✅ 실제 데이터 재입력 시작

---

## 📝 변경 이력

### v2.1 (2025-10-24) - 오버플로우 문제 근본 해결
**주요 변경사항:**
- 10개 병렬 에이전트를 통한 근본 원인 분석 완료
- 5가지 근본 원인 식별 및 해결책 적용:
  1. 고정 높이 설정 (h-[360px/400px/480px])
  2. justify-start + overflow-y-auto로 변경
  3. truncate 클래스 복원
  4. Gap 값 최적화 (33% 감소)
  5. absolute → mt-auto (flex 기반)
- MD 지침에 "절대 금지 사항" 및 "필수 준수 패턴" 추가
- 성능 검증 기준 체크리스트 추가

### v2.0 (2025-10-24) - 간소화 및 가독성 개선
**주요 변경사항:**
- 앞면: 히브리어 텍스트 제거, 학습에 집중 (알파벳 읽기 + 발음)
- 뒷면: 간소화 (SVG + 의미 + 어근 + 출처)
- 박스 강조: 모든 주요 콘텐츠를 색상 박스로 구분
- 더블 탭: 300ms 이내 두 번 탭으로 뒤집기
- 가독성: 폰트 크기 증가, 명확한 섹션 구분

### v1.0 (2025-10-23) - 초기 설계
- MD 지침 기반 필수/선택 필드 정의
- 앞면/뒷면 기본 레이아웃 설계

---

**작성일**: 2025-10-23
**최종 수정일**: 2025-10-24 (v2.1 - 오버플로우 근본 해결)
**목적**: 일관된 데이터 구조와 최적화된 학습 경험, 반복 문제 방지
