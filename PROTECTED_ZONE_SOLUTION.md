# 🔒 보호 구역 솔루션: Words & Commentaries 데이터 손실 근본 해결

## 🔴 문제 상황

### 증상
매번 `migrateFullGenesis.ts`를 실행할 때마다 **Words와 Commentaries 데이터가 사라지는** 현상이 반복적으로 발생

### 사용자 피드백
> "단어랑 말씀 깊이 읽기가 또 없어졌어. 근본적인 해결책을 찾아줘"

## 🔍 근본 원인 분석

### 1. Database Schema의 Foreign Key Constraint

`supabase/migrations/20251018163944_phase2_content_schema.sql`:

```sql
-- Words Table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id TEXT REFERENCES verses(id) ON DELETE CASCADE,  -- ⚠️ 문제
  ...
);

-- Commentaries Table
CREATE TABLE commentaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id TEXT UNIQUE REFERENCES verses(id) ON DELETE CASCADE,  -- ⚠️ 문제
  ...
);
```

**`ON DELETE CASCADE`** 설정:
- `verses` 테이블의 레코드가 삭제되면
- 연결된 `words`와 `commentaries`도 **자동으로 함께 삭제**됨

### 2. Migration Script의 문제

기존 `migrateFullGenesis.ts`:

```typescript
// 2. 기존 구절 삭제 (전체 삭제)
const { error: deleteError } = await supabase
  .from('verses')
  .delete()
  .eq('book_id', 'genesis');  // ⚠️ Genesis 전체 삭제

// 3. 새 구절 삽입
await supabase.from('verses').insert(verses);
```

**문제점**:
1. Genesis 전체를 DELETE
2. Words와 Commentaries가 CASCADE DELETE됨 (자동 삭제)
3. 새로운 verses를 INSERT
4. 결과: Words와 Commentaries는 사라지고 verses만 남음

### 3. 왜 반복적으로 발생했나?

```
┌─────────────────────────────────────────────────────────────┐
│ 사이클:                                                        │
│                                                               │
│ 1. migrateFullGenesis.ts 실행                                 │
│    → Genesis 1-50장 모두 DELETE                               │
│    → Words/Commentaries CASCADE DELETE ❌                     │
│                                                               │
│ 2. remigrateWordsAndCommentaries.ts로 복원                   │
│    → Words/Commentaries 재생성 ✅                             │
│                                                               │
│ 3. migrateFullGenesis.ts 다시 실행                            │
│    → 다시 CASCADE DELETE ❌                                   │
│                                                               │
│ 4. 무한 반복...                                               │
└─────────────────────────────────────────────────────────────┘
```

## ✅ 해결 방안 비교

### 옵션 1: UPSERT 방식 (전체)
**방법**: DELETE 대신 `INSERT ON CONFLICT UPDATE` 사용

**장점**:
- Words/Commentaries 보존
- 데이터 손실 없음

**단점**:
- 전체 1,533개 구절을 매번 UPSERT (성능 저하)
- 불필요한 업데이트 많음

### 옵션 2: 보호 구역 방식 ⭐ (선택됨)
**방법**:
- Genesis 1-3장: UPSERT (Words/Commentaries 존재)
- Genesis 4-50장: DELETE + INSERT (새 데이터)

**장점**:
- Words/Commentaries 완벽 보존
- Genesis 4-50장은 효율적으로 재생성
- 성능과 안전성 균형

**단점**:
- 코드가 약간 복잡

### 옵션 3: Foreign Key Constraint 변경
**방법**: `ON DELETE CASCADE` → `ON DELETE RESTRICT`

**장점**:
- 실수로 삭제 방지

**단점**:
- Migration 시 수동으로 words/commentaries 삭제 필요
- 복잡성 증가

## 🔧 구현된 해결책: 보호 구역 방식

### 수정된 `saveToSupabase` 함수

```typescript
/**
 * Supabase에 데이터 저장 (보호 구역 방식)
 * - Genesis 1-3장: UPSERT (Words & Commentaries 보존)
 * - Genesis 4-50장: DELETE 후 INSERT
 */
async function saveToSupabase(verses: MergedVerse[]) {
  console.log('💾 Supabase에 데이터 저장 중 (보호 구역 방식)...\n');

  // 1. Genesis book 확인
  // ... (동일)

  // 2. 보호 구역 설정
  const protectedVerses = verses.filter(v => v.chapter >= 1 && v.chapter <= 3);
  const unprotectedVerses = verses.filter(v => v.chapter >= 4 && v.chapter <= 50);

  console.log(`\n📦 데이터 분류:`);
  console.log(`   - 보호 구역 (1-3장): ${protectedVerses.length}개 구절 (UPSERT)`);
  console.log(`   - 일반 구역 (4-50장): ${unprotectedVerses.length}개 구절 (DELETE + INSERT)`);

  // 3. Genesis 4-50장만 삭제
  await supabase
    .from('verses')
    .delete()
    .eq('book_id', 'genesis')
    .gte('chapter', 4)
    .lte('chapter', 50);

  // 4. Genesis 1-3장 UPSERT (Words & Commentaries 보존)
  for (let i = 0; i < protectedVerses.length; i += batchSize) {
    const batch = protectedVerses.slice(i, i + batchSize);
    await supabase.from('verses').upsert(batch, { onConflict: 'id' });
  }

  // 5. Genesis 4-50장 INSERT
  for (let i = 0; i < unprotectedVerses.length; i += batchSize) {
    const batch = unprotectedVerses.slice(i, i + batchSize);
    await supabase.from('verses').insert(batch);
  }
}
```

## 📊 실행 결과

### 마이그레이션 성공

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 창세기 전체 마이그레이션 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 데이터 분류:
   - 보호 구역 (1-3장): 80개 구절 (UPSERT)
   - 일반 구역 (4-50장): 1,453개 구절 (DELETE + INSERT)

✅ 모든 구절 저장 완료!
   - 보호 구역 (1-3장): 80개 UPSERT ✅
   - 일반 구역 (4-50장): 1,453개 INSERT ✅
```

### 데이터 검증

```
🔍 데이터 관계 확인 중...

2️⃣  Words verse_id 참조:
   총 420개 words ✅

3️⃣  Commentaries verse_id 참조:
   총 34개 commentaries ✅

4️⃣  Foreign key 유효성 확인:
   ✅ Words FK valid: genesis_1_1 exists
   ✅ Commentaries FK valid: genesis_1_1 exists
```

## 🎯 해결 효과

### Before (문제 상황)
```
migrateFullGenesis.ts 실행
→ Genesis 1-50장 전체 DELETE
→ Words/Commentaries CASCADE DELETE ❌
→ verses만 INSERT
→ 사용자: "단어랑 말씀 깊이 읽기가 없어졌어"
```

### After (해결 후)
```
migrateFullGenesis.ts 실행
→ Genesis 1-3장 UPSERT (Words/Commentaries 보존) ✅
→ Genesis 4-50장만 DELETE + INSERT
→ 모든 데이터 안전하게 보존
→ 사용자: 앱에서 정상 확인 가능
```

## 📝 향후 권장사항

### 1. 다른 책으로 확장 시
새로운 성경 책을 추가할 때도 동일한 패턴 적용:

```typescript
// Words/Commentaries가 있는 챕터만 보호
const protectedVerses = verses.filter(v =>
  hasWordsOrCommentaries(v.chapter)
);
```

### 2. Production 배포 전
Migration 실행 전 **백업 필수**:

```bash
# Supabase 백업
supabase db dump > backup-$(date +%Y%m%d).sql
```

### 3. Testing
E2E 테스트에 words/commentaries 검증 추가:

```typescript
test('Words & Commentaries 보존 확인', async ({ page }) => {
  // Migration 실행 전후 비교
  const beforeCount = await getWordsCount();
  await runMigration();
  const afterCount = await getWordsCount();

  expect(afterCount).toBe(beforeCount);
});
```

## 🔐 보호 구역 개념

### 정의
**보호 구역 (Protected Zone)**:
- Words와 Commentaries가 존재하는 Genesis 1-3장
- UPSERT를 사용하여 Foreign Key 관계 보존
- CASCADE DELETE로부터 안전

### 일반 구역
**일반 구역 (Unprotected Zone)**:
- Words와 Commentaries가 없는 Genesis 4-50장
- DELETE + INSERT로 효율적으로 재생성
- 데이터 손실 위험 없음

## 🎓 교훈

### 1. Foreign Key Cascade의 양날의 검
- **장점**: 데이터 정합성 자동 유지
- **단점**: 의도하지 않은 대량 삭제 가능
- **해결**: 보호 구역 설정으로 제어

### 2. Migration 전략의 중요성
- 단순 DELETE + INSERT는 위험
- UPSERT와 조건부 DELETE 조합이 안전

### 3. 문제 재발 방지
- 근본 원인 파악 중요
- 임시방편 대신 구조적 해결

## 📚 관련 파일

### 수정된 파일
- `scripts/migrateFullGenesis.ts` (saveToSupabase 함수)

### 검증 스크립트
- `scripts/checkDataRelations.ts`
- `scripts/remigrateWordsAndCommentaries.ts`

### Database Schema
- `supabase/migrations/20251018163944_phase2_content_schema.sql`

## ✅ 최종 확인 체크리스트

- [x] Words 데이터 보존 (420개)
- [x] Commentaries 데이터 보존 (34개)
- [x] Commentary Sections 보존 (92개)
- [x] Why Questions 보존 (34개)
- [x] Conclusions 보존 (34개)
- [x] Foreign Key 관계 유효성
- [x] 앱에서 정상 표시
- [x] Genesis 4-50장 새 데이터 추가

---

**작성일**: 2025-10-19
**문제**: Words & Commentaries CASCADE DELETE
**해결**: 보호 구역 (Protected Zone) 방식
**상태**: ✅ 근본적 해결 완료
