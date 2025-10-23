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

## 🎴 새 FlashCard 디자인

### 앞면 (Front)
```
┌─────────────────────────────┐
│  [품사]          ⭐         │
│                             │
│      [커스텀 SVG 아이콘]      │
│                             │
│     בְּרֵאשִׁית (히브리어)    │
│                             │
│        처음 (의미)           │
│                             │
│      [베레쉬트] (발음)        │
│                             │
│   탭하여 자세히 보기          │
└─────────────────────────────┘
```

### 뒷면 (Back)
```
┌─────────────────────────────┐
│  בְּרֵאשִׁית - 처음          │
│  [베레쉬트] 🔊              │
├─────────────────────────────┤
│ 📝 알파벳 읽기               │
│ בְּ(be) + רֵא(re) + שִׁית(shit) │
├─────────────────────────────┤
│ 🌱 어근                     │
│ רֵאשִׁית (레쉬트)             │
├─────────────────────────────┤
│ 📚 품사                     │
│ 명사 💠                     │
├─────────────────────────────┤
│ 🔗 비슷한 단어 (있는 경우만)  │
│ רֹאשׁ (로쉬 - 머리)          │
│ רִאשׁוֹן (리쇼온 - 첫째)      │
├─────────────────────────────┤
│ 📖 창세기 1:1               │
└─────────────────────────────┘
```

---

## 🎨 핵심 개선사항

### 1. 필드 존재 여부에 따른 조건부 렌더링

```typescript
// ✅ 필수 필드는 항상 표시
<div className="required-section">
  {word.letters}  {/* 항상 있어야 함 */}
</div>

// 🔵 선택 필드는 있을 때만 표시
{word.relatedWords && word.relatedWords.length > 0 && (
  <div className="optional-section">
    {word.relatedWords.map(...)}
  </div>
)}
```

### 2. 커스텀 SVG 아이콘 우선 사용

```typescript
// iconSvg가 있으면 우선 사용, 없으면 emoji fallback
{word.iconSvg ? (
  <HebrewIcon iconSvg={word.iconSvg} size={80} />
) : (
  <EnhancedEmoji emoji={word.emoji} size={72} />
)}
```

### 3. 간소화된 품사 표시

MD 지침에 따라 **단순한 품사**만 표시:
- 명사 💠
- 동사 🔥
- 형용사 🎨
- 전치사 🔗
- 접속사 ➕
- 부사 💫
- 대명사 👉

### 4. 알파벳 읽기 섹션 (필수)

```typescript
<div className="letters-section">
  <div className="label">📝 알파벳 읽기</div>
  <div className="content" dir="rtl">
    {word.letters}  {/* 예: "ש(sh) + ָ(a) + ל(l) + וֹ(o) + ם(m)" */}
  </div>
</div>
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

## ✅ 체크리스트

작성 후 반드시 확인:
- [ ] 모든 **필수 필드**가 표시되는가?
- [ ] **선택 필드**가 없을 때 섹션이 숨겨지는가?
- [ ] **iconSvg 우선**, emoji는 fallback인가?
- [ ] **letters** 섹션이 제대로 보이는가?
- [ ] **품사**가 간소화되어 표시되는가? (명사/동사/형용사 등)
- [ ] **다크모드/라이트모드** 양쪽에서 잘 보이는가?
- [ ] **모바일**에서도 잘 보이는가?

---

## 🚀 다음 단계

사용자 승인 후:
1. ✅ SQL 스크립트 실행 (words 테이블 삭제)
2. ✅ FlashCardV2.tsx 작성
3. ✅ 샘플 데이터로 테스트
4. ✅ VocabularyTab 업데이트
5. ✅ 실제 데이터 재입력 시작

---

**작성일**: 2025-10-23
**목적**: 일관된 데이터 구조와 MD 지침 준수
