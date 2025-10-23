# 플래시카드 완전 재설계 요약

## 🎯 문제 상황

### 1. MD 지침과 데이터 구조 불일치
- **VERSE_CREATION_GUIDELINES.md**에 정의된 필수 필드와 실제 데이터가 다름
- `letters` (알파벳 읽기) 필드 누락
- `iconSvg` (커스텀 SVG) 필드 누락
- `relatedWords` 필드 불일치

### 2. 구절별 데이터 구조 차이
- 창세기 1장: `structure`, `category` 필드 포함
- 창세기 12장: 해당 필드 누락
- 프롬프트 템플릿 업데이트 과정에서 일관성 상실

### 3. FlashCard 뒷면 내용 불일치
- 같은 FlashCard 컴포넌트인데 구절마다 뒷면 내용이 다름
- 필드가 있으면 표시, 없으면 섹션 자체가 사라짐
- 사용자 혼란 야기

---

## ✅ 해결 방안

### Option A: 점진적 수정
- 기존 데이터 유지
- 컴포넌트만 수정하여 조건부 렌더링
- 데이터는 나중에 보완

### Option B: 전면 재작성 ⭐ (선택됨)
- **words 테이블 전체 삭제 후 재작성**
- **FlashCard 컴포넌트 완전히 새로 작성** (FlashCardV2)
- **MD 지침에 정확히 일치하는 데이터만 재입력**

---

## 📦 작업 결과물

### 1. SQL 삭제 스크립트
**파일**: `supabase/migrations/20251023_delete_all_words.sql`

```sql
-- 백업 테이블 생성
CREATE TABLE IF NOT EXISTS words_backup_20251023 AS
SELECT * FROM words;

-- Words 테이블의 모든 데이터 삭제
DELETE FROM words;
```

### 2. 새 FlashCard 컴포넌트
**파일**: `src/components/shared/FlashCardV2.tsx`

**주요 개선사항**:
- ✅ MD 지침 필수 필드만 사용
- ✅ 선택 필드는 조건부 렌더링
- ✅ `iconSvg` 우선 사용, `emoji`는 fallback
- ✅ `letters` (알파벳 읽기) 섹션 추가
- ✅ 간소화된 품사 표시 (명사/동사/형용사/전치사/접속사/부사/대명사)
- ✅ 깔끔하고 일관된 UI

### 3. VocabularyTab 업데이트
**파일**: `src/components/VocabularyTab.tsx`

```typescript
// 기존
import FlashCard from './shared/FlashCard';

// 변경
import FlashCardV2 from './shared/FlashCardV2';

// 사용
<FlashCardV2
  word={word}
  darkMode={darkMode}
  isFlipped={isFlipped}
  onFlip={onFlip}
  isBookmarked={isBookmarked}
  onBookmark={onBookmark}
  reference={reference}
  index={index}
/>
```

### 4. 샘플 데이터
**파일**: `SAMPLE_WORD_DATA.md`

MD 지침에 정확히 맞는 창세기 1:1의 단어 3개:
1. בְּרֵאשִׁית (베레쉬트 - 처음)
2. בָּרָא (바라 - 창조하셨다)
3. אֱלֹהִים (엘로힘 - 하나님)

### 5. 재설계 계획 문서
**파일**: `FLASHCARD_REDESIGN_PLAN.md`

전체 재설계 과정과 다음 단계 안내

---

## 🔄 다음 단계

### Step 1: Supabase에서 데이터 삭제 (백업 포함)

1. Supabase SQL Editor 접속:
   https://supabase.com/dashboard/project/dbvekynhkfxdepsvvawg/sql

2. 스크립트 실행:
   ```sql
   -- supabase/migrations/20251023_delete_all_words.sql 내용 복사하여 실행
   ```

### Step 2: 샘플 데이터 3개 입력

```sql
-- SAMPLE_WORD_DATA.md의 SQL INSERT 문 실행
-- 창세기 1:1의 단어 3개 삽입
```

### Step 3: 로컬에서 테스트

```bash
npm run dev
```

**확인 사항**:
- [ ] 플래시카드가 제대로 표시되는가?
- [ ] 앞면: 히브리어, 의미, 발음, 커스텀 SVG 아이콘
- [ ] 뒷면: 알파벳 읽기, 어근, 품사, 비슷한 단어
- [ ] 다크모드/라이트모드 양쪽에서 잘 보이는가?
- [ ] 모바일에서도 잘 보이는가?

### Step 4: 전체 데이터 재입력

**방법 1: 수동 입력** (추천 - 정확도 높음)
- 창세기 1:1부터 시작
- 각 단어마다 MD 지침에 맞춰 정확히 입력
- `letters`, `iconSvg` 필드 반드시 포함

**방법 2: AI 활용** (빠름 - 검증 필요)
- Claude 4.5 Haiku를 사용하여 자동 생성
- `docs/CONTENT_GENERATION_AGENT.md` 참고
- 생성 후 반드시 검증

---

## 📋 MD 지침 필수 필드 체크리스트

새 단어 입력 시 **반드시 확인**:

- [ ] `hebrew` - 히브리어 원문 (니쿠드 포함)
- [ ] `meaning` - 한국어 의미
- [ ] `ipa` - 국제 음성 기호 발음
- [ ] `korean` - 한글 발음
- [ ] `letters` - 알파벳 읽기 (예: "ש(sh) + ָ(a) + ל(l) + וֹ(o) + ם(m)")
- [ ] `root` - 어근 (예: "ב-ר-א (bara)")
- [ ] `grammar` - 품사 (명사/동사/형용사/전치사/접속사/부사/대명사)
- [ ] `emoji` - 이모지 (fallback)
- [ ] `icon_svg` - 커스텀 SVG (64x64, 화려한 그라디언트)
- [ ] `related_words` - 비슷한 단어 (선택사항, 배열)

---

## 🎨 FlashCardV2 뒷면 구조

```
┌─────────────────────────────┐
│  בְּרֵאשִׁית - 처음          │
│  [베레쉬트] 🔊              │
├─────────────────────────────┤
│ 📝 알파벳 읽기 (필수)        │
│ בְּ(be) + רֵא(re) + שִׁית(t) │
├─────────────────────────────┤
│ 🌱 어근 (필수)              │
│ רֵאשִׁית (레쉬트)             │
├─────────────────────────────┤
│ 📚 품사 (필수)              │
│ 명사 💠                     │
├─────────────────────────────┤
│ 🔗 비슷한 단어 (선택)        │
│ רֹאשׁ (로쉬 - 머리)          │
│ רִאשׁוֹן (리쇼온 - 첫째)      │
├─────────────────────────────┤
│ 📖 창세기 1:1               │
└─────────────────────────────┘
```

**특징**:
- 필수 필드는 항상 표시
- 선택 필드 (`relatedWords`)는 있을 때만 표시
- 일관된 구조로 사용자 경험 개선

---

## 🚀 장점

### 1. 일관성
- 모든 구절의 단어가 동일한 구조
- 플래시카드 뒷면이 항상 같은 형태

### 2. MD 지침 준수
- `VERSE_CREATION_GUIDELINES.md`와 100% 일치
- 향후 유지보수 용이

### 3. 사용자 경험 개선
- 알파벳 읽기 섹션으로 학습 효과 증대
- 화려한 커스텀 SVG 아이콘으로 시각적 몰입도 향상
- 간소화된 품사로 이해하기 쉬움

### 4. 확장성
- 새 필드 추가 시 MD 지침 업데이트
- 컴포넌트 수정만으로 전체 적용

---

## 📌 주의사항

### 1. 백업 필수
```sql
-- 삭제 전 반드시 백업
CREATE TABLE words_backup_20251023 AS SELECT * FROM words;
```

### 2. iconSvg ID 충돌 방지
각 단어마다 고유한 gradient ID 사용:
- ✅ `id="bereshit-sun1"`, `id="bara-center1"`
- ❌ `id="grad1"`, `id="sun1"` (충돌 가능)

### 3. Supabase 배열 타입
`related_words`는 PostgreSQL 배열:
```sql
ARRAY['단어1', '단어2']
```

---

## 📞 문제 발생 시

### 문제 1: 플래시카드가 안 보임
- VocabularyTab.tsx에서 `FlashCard` → `FlashCardV2` 변경 확인
- import 경로 확인

### 문제 2: 알파벳 읽기 섹션이 안 보임
- words 테이블에 `letters` 필드 데이터 확인
- NULL이면 해당 섹션은 숨겨짐 (정상)

### 문제 3: 커스텀 SVG 아이콘이 안 보임
- `icon_svg` 필드에 데이터가 있는지 확인
- NULL이면 `emoji` fallback 사용 (정상)

---

**작성일**: 2025-10-23
**작성자**: Claude Code
**목적**: 플래시카드 완전 재설계를 통한 데이터 일관성 확보 및 MD 지침 준수
