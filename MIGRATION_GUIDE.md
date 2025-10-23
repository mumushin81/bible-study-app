# 📊 데이터베이스 마이그레이션 가이드

## Vocabulary Improvement v2.0 마이그레이션

**날짜**: 2025-10-22
**목적**: 단어장 개선을 위한 데이터베이스 스키마 확장

---

## 🎯 마이그레이션 내용

### 새로 생성되는 테이블 (5개)

1. **user_book_progress** - 책별 학습 진도 추적
2. **hebrew_roots** - 히브리어 어근 시스템
3. **word_derivations** - 어근 → 단어 파생 관계
4. **word_metadata** - 단어 난이도/빈도/중요도
5. **user_word_progress_v2** - 강화된 SRS 추적 (SM-2+)

### 추가 생성 항목

- Helper functions (도우미 함수)
- Triggers (자동 업데이트 트리거)
- Sample data (테스트용 샘플 데이터 4개 어근)

---

## 🚀 방법 1: Supabase SQL Editor (권장)

### Step 1: Supabase 대시보드 접속

1. https://supabase.com/dashboard 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### Step 2: 마이그레이션 SQL 복사

1. 파일 열기: `supabase/migrations/20251022_vocabulary_improvement_v2.sql`
2. 전체 내용 복사 (Ctrl+A, Ctrl+C)

### Step 3: SQL 실행

1. SQL Editor에서 **New query** 클릭
2. 복사한 SQL 붙여넣기 (Ctrl+V)
3. **Run** 버튼 클릭 (또는 Ctrl+Enter)
4. 성공 메시지 확인

### Step 4: 검증

SQL Editor에서 다음 쿼리 실행:

```sql
-- 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
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

**예상 결과**: 5개 테이블 + 4개 샘플 어근

---

## 🛠️ 방법 2: 로컬 스크립트 (고급 사용자)

### 요구사항

- Node.js 설치
- `.env.local` 파일에 Supabase 자격증명 설정
  - `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (또는 `VITE_SUPABASE_ANON_KEY`)

### 실행

```bash
npm run migrate:vocabulary
```

### 문제 발생 시

대부분의 경우 **방법 1 (SQL Editor)**이 더 안전하고 확실합니다.

---

## ✅ 마이그레이션 후 작업

### 1. TypeScript 타입 업데이트

```bash
npm run types:generate
```

또는 수동으로:

1. Supabase 대시보드 → Project Settings → API
2. **Generate Types** 클릭
3. TypeScript 선택
4. 생성된 코드를 `src/lib/database.types.ts`에 복사

### 2. 기존 단어에 메타데이터 추가

```bash
npm run scripts:populate-word-metadata
```

(스크립트는 Phase 1 완료 후 작성 예정)

### 3. 어근-단어 관계 매핑

```bash
npm run scripts:map-word-derivations
```

(스크립트는 Phase 3에서 작성 예정)

### 4. 기존 SRS 데이터 마이그레이션

```bash
npm run scripts:migrate-srs-data
```

(스크립트는 Phase 4에서 작성 예정)

---

## 🔄 롤백 (되돌리기)

마이그레이션을 취소하려면:

```sql
-- Supabase SQL Editor에서 실행
DROP TABLE IF EXISTS user_word_progress_v2 CASCADE;
DROP TABLE IF EXISTS word_metadata CASCADE;
DROP TABLE IF EXISTS word_derivations CASCADE;
DROP TABLE IF EXISTS hebrew_roots CASCADE;
DROP TABLE IF EXISTS user_book_progress CASCADE;

DROP FUNCTION IF EXISTS get_derived_word_count(UUID);
DROP FUNCTION IF EXISTS calculate_book_progress_percentage(UUID, TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

---

## 📊 마이그레이션 검증 체크리스트

마이그레이션 후 다음 사항을 확인하세요:

- [ ] 5개 테이블이 모두 생성되었는가?
  - [ ] user_book_progress
  - [ ] hebrew_roots
  - [ ] word_derivations
  - [ ] word_metadata
  - [ ] user_word_progress_v2

- [ ] 샘플 데이터가 로드되었는가?
  - [ ] hebrew_roots 테이블에 4개 어근 (ב-ר-א, ע-ש-ה, א-מ-ר, ה-י-ה)

- [ ] 함수들이 생성되었는가?
  - [ ] get_derived_word_count()
  - [ ] calculate_book_progress_percentage()
  - [ ] update_updated_at_column()

- [ ] 기존 테이블/데이터에 영향이 없는가?
  - [ ] words 테이블 정상
  - [ ] verses 테이블 정상
  - [ ] user_word_progress 테이블 정상 (기존 테이블, v2와 별개)

---

## ❓ 문제 해결

### "permission denied" 에러

**원인**: ANON 키로는 테이블 생성 권한 없음

**해결**:
1. 방법 1 (SQL Editor) 사용
2. 또는 `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가

### "relation already exists" 에러

**원인**: 테이블이 이미 존재함

**해결**: 정상입니다. 이미 마이그레이션이 완료된 상태입니다.

### 스크립트 실행 시 "Module not found"

**원인**: 의존성 미설치

**해결**:
```bash
npm install
```

---

## 📝 다음 단계

마이그레이션이 성공적으로 완료되면:

1. ✅ **Phase 1 완료**: 데이터베이스 스키마 확장
2. 🚀 **Phase 2 시작**: 성경책별 단어 필터링 UI 구현
3. 📚 **Phase 3 준비**: 히브리어 어근 학습 시스템
4. 🎯 **Phase 4 준비**: 지능형 복습 시스템

**예상 소요 시간**: Phase 2-5까지 약 6주

---

**작성일**: 2025-10-22
**버전**: v2.0
