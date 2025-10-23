# ✅ Phase 1 완료: 데이터베이스 스키마 확장

**완료일**: 2025-10-22
**소요 시간**: 1시간
**상태**: ✅ 준비 완료 (마이그레이션 대기)

---

## 📦 생성된 파일

### 1. SQL 마이그레이션 파일
**파일**: `supabase/migrations/20251022_vocabulary_improvement_v2.sql`
**크기**: ~10 KB
**내용**:
- 5개 새 테이블 (user_book_progress, hebrew_roots, word_derivations, word_metadata, user_word_progress_v2)
- 3개 헬퍼 함수 (update_updated_at_column, get_derived_word_count, calculate_book_progress_percentage)
- 4개 트리거 (자동 updated_at 업데이트)
- 4개 샘플 히브리어 어근 (ב-ר-א, ע-ש-ה, א-מ-ר, ה-י-ה)

### 2. 마이그레이션 스크립트
**파일**: `scripts/migrations/runVocabularyMigrationSimple.ts`
**용도**: 로컬에서 마이그레이션 실행 (선택사항)

### 3. 마이그레이션 가이드
**파일**: `MIGRATION_GUIDE.md`
**내용**: 단계별 마이그레이션 안내

### 4. package.json 업데이트
**새 스크립트**:
```json
{
  "migrate:vocabulary": "tsx scripts/migrations/runVocabularyMigrationSimple.ts",
  "types:generate": "echo '...' "
}
```

---

## 🎯 다음 단계: 마이그레이션 실행

### 옵션 1: Supabase SQL Editor (권장) ⭐

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택 → SQL Editor

2. **SQL 파일 열기**
   ```
   supabase/migrations/20251022_vocabulary_improvement_v2.sql
   ```

3. **내용 복사 & 실행**
   - 전체 선택 (Ctrl+A) → 복사 (Ctrl+C)
   - SQL Editor에 붙여넣기 (Ctrl+V)
   - Run 버튼 클릭 (또는 Ctrl+Enter)

4. **검증**
   ```sql
   -- 테이블 확인
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_name IN (
       'user_book_progress',
       'hebrew_roots',
       'word_derivations',
       'word_metadata',
       'user_word_progress_v2'
     );

   -- 샘플 데이터 확인
   SELECT * FROM hebrew_roots;
   ```

### 옵션 2: 로컬 스크립트

```bash
npm run migrate:vocabulary
```

---

## 📊 생성되는 테이블 상세

### 1. user_book_progress
**목적**: 책별 학습 진도 추적

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | UUID | 사용자 ID |
| book_id | TEXT | 책 ID (genesis, exodus 등) |
| total_words | INTEGER | 전체 단어 수 |
| learned_words | INTEGER | 학습한 단어 수 |
| mastered_words | INTEGER | 완벽 암기 단어 수 |
| progress_percentage | DECIMAL | 진도율 (0-100) |
| daily_goal | INTEGER | 일일 목표 (기본 10) |
| current_streak | INTEGER | 연속 학습일 |
| longest_streak | INTEGER | 최장 연속일 |

**용도**: Phase 2에서 책별 필터링 및 진도 대시보드에 사용

---

### 2. hebrew_roots
**목적**: 히브리어 3자 어근 시스템

| 컬럼 | 타입 | 설명 | 예시 |
|------|------|------|------|
| root | TEXT | 어근 (하이픈 포함) | 'ב-ר-א' |
| root_hebrew | TEXT | 어근 (히브리어) | 'ברא' |
| core_meaning | TEXT | 핵심 의미 (영어) | 'to create' |
| core_meaning_korean | TEXT | 핵심 의미 (한글) | '창조하다' |
| semantic_field | TEXT | 의미 영역 | 'creation, formation' |
| frequency | INTEGER | 성경 전체 등장 횟수 | 54 |
| importance | INTEGER | 신학적 중요도 (1-5) | 5 |
| mnemonic | TEXT | 암기 힌트 | '바-라 → 바로 무에서 유' |
| story | TEXT | 어근 스토리 | '오직 하나님만이...' |
| emoji | TEXT | 대표 이모지 | '✨' |

**샘플 데이터** (4개):
- ב-ר-א (bara) - 창조하다 ✨
- ע-ש-ה (asah) - 만들다 🔨
- א-מ-ר (amar) - 말하다 💬
- ה-י-ה (hayah) - 되다, 존재하다 🌟

**용도**: Phase 3에서 어근 중심 학습 시스템에 사용

---

### 3. word_derivations
**목적**: 어근 → 단어 파생 관계

| 컬럼 | 타입 | 설명 |
|------|------|------|
| root_id | UUID | hebrew_roots FK |
| word_id | UUID | words FK |
| binyan | TEXT | 동사 패턴 (Qal, Niphal, Piel...) |
| pattern | TEXT | 형태 패턴 (CaCaC 등) |
| derivation_note | TEXT | 관계 설명 |

**용도**: Phase 3에서 어근 플래시카드 덱 생성

---

### 4. word_metadata
**목적**: 단어의 객관적 난이도/빈도/중요도

| 컬럼 | 타입 | 설명 |
|------|------|------|
| word_hebrew | TEXT | 단어 (히브리어) |
| bible_frequency | INTEGER | 성경 전체 등장 횟수 |
| genesis_frequency | INTEGER | 창세기 내 등장 횟수 |
| frequency_rank | INTEGER | 빈도 순위 (1=최다) |
| objective_difficulty | INTEGER | 객관적 난이도 (1-5) |
| difficulty_factors | JSONB | 난이도 요인 |
| theological_importance | INTEGER | 신학적 중요도 (1-5) |
| pedagogical_priority | INTEGER | 교육적 우선순위 (1-5) |
| is_proper_noun | BOOLEAN | 고유명사 여부 |
| is_theological_term | BOOLEAN | 신학 용어 여부 |
| recommended_review_count | INTEGER | 권장 복습 횟수 |
| min_exposures | INTEGER | 최소 노출 횟수 |

**용도**: Phase 4에서 지능형 복습 우선순위 계산

---

### 5. user_word_progress_v2
**목적**: 강화된 SRS 추적 (SM-2+ 알고리즘)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | UUID | 사용자 ID |
| word_hebrew | TEXT | 단어 (히브리어) |
| next_review | TIMESTAMPTZ | 다음 복습 날짜 |
| interval_days | DECIMAL | 복습 간격 (일) |
| ease_factor | DECIMAL | 난이도 계수 (SM-2) |
| review_count | INTEGER | 복습 횟수 |
| **difficulty_level** | DECIMAL | 사용자별 난이도 (1-5) |
| **correct_count** | INTEGER | 정답 횟수 |
| **incorrect_count** | INTEGER | 오답 횟수 |
| **accuracy_rate** | DECIMAL | 정확도 (0-1) |
| **last_study_context** | TEXT | 마지막 학습 방법 |
| **study_methods** | JSONB | 사용한 학습 방법들 |
| **total_study_time_seconds** | INTEGER | 총 학습 시간 (초) |
| **average_response_time_seconds** | DECIMAL | 평균 응답 시간 |
| **mastery_level** | INTEGER | 마스터리 레벨 (0-10) |

**기존 user_word_progress와의 차이**:
- ✅ 난이도 추적 (개인별 적응)
- ✅ 정확도 추적 (correct/incorrect)
- ✅ 학습 맥락 추적 (어떤 방법으로 학습했는지)
- ✅ 시간 추적 (학습 시간, 응답 시간)
- ✅ 마스터리 레벨 시스템 (0-10 단계)

**용도**: Phase 4에서 개인 맞춤형 복습 시스템

---

## 🔧 헬퍼 함수

### 1. update_updated_at_column()
**용도**: 자동으로 updated_at 컬럼 업데이트 (트리거)

### 2. get_derived_word_count(root_id)
**용도**: 특정 어근에서 파생된 단어 개수 반환
```sql
SELECT get_derived_word_count('어근UUID');
```

### 3. calculate_book_progress_percentage(user_id, book_id)
**용도**: 사용자의 책별 학습 진도율 계산
```sql
SELECT calculate_book_progress_percentage('유저UUID', 'genesis');
-- 반환: 75.50 (%)
```

---

## 📈 예상 데이터 크기

| 테이블 | 예상 행 수 | 설명 |
|--------|-----------|------|
| user_book_progress | ~사용자 수 × 66 | 사용자 × 성경 책 개수 |
| hebrew_roots | ~500 | 주요 히브리어 어근 |
| word_derivations | ~5,000 | 단어 × 어근 관계 |
| word_metadata | ~현재 단어 수 | 기존 words와 1:1 |
| user_word_progress_v2 | ~사용자 수 × 단어 수 | 기존 user_word_progress와 유사 |

---

## ⚠️ 주의사항

1. **기존 데이터 영향 없음**
   - 새 테이블만 추가, 기존 테이블 수정 없음
   - words, verses, user_word_progress 등은 그대로 유지

2. **user_word_progress vs user_word_progress_v2**
   - 기존 테이블(user_word_progress)과 새 테이블(v2)는 별개
   - 나중에 데이터 마이그레이션 스크립트로 통합 예정

3. **샘플 데이터**
   - 4개 히브리어 어근이 자동 삽입됨
   - 테스트 후 삭제 가능

---

## ✅ 마이그레이션 후 체크리스트

- [ ] 5개 테이블 생성 확인
- [ ] hebrew_roots에 4개 샘플 어근 확인
- [ ] 함수 3개 생성 확인
- [ ] 트리거 4개 생성 확인
- [ ] 기존 테이블/데이터 정상 확인
- [ ] TypeScript 타입 업데이트 (선택)

---

## 🚀 다음 Phase

마이그레이션 완료 후:

### Phase 2: 성경책별 단어 필터링 (1주)
- [ ] useBookProgress hook 구현
- [ ] 책 선택 드롭다운 UI
- [ ] 책별 진도 대시보드
- [ ] 새로운 필터 옵션

### Phase 3: 어근 학습 시스템 (2주)
- [ ] hebrew_roots 데이터 추가 (스크립트)
- [ ] word_derivations 매핑 (스크립트)
- [ ] RootFlashcardDeck 컴포넌트
- [ ] 어근 학습 탭 추가

### Phase 4: 지능형 복습 시스템 (2주)
- [ ] word_metadata 자동 생성 (스크립트)
- [ ] SM-2+ 알고리즘 구현
- [ ] 우선순위 계산 함수
- [ ] ReviewDashboard UI

---

**준비 완료! 마이그레이션을 진행하세요.**

📖 자세한 안내: `MIGRATION_GUIDE.md`
