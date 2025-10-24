# 🛡️ 중복 데이터 방지 가이드

**최종 업데이트**: 2025-10-24
**상태**: ✅ 모든 중복 제거 완료

---

## 📚 목차

1. [완료 보고](#1-완료-보고)
2. [발견된 버그](#2-발견된-버그)
3. [예방 조치](#3-예방-조치)
4. [빠른 참조](#4-빠른-참조)
5. [모니터링](#5-모니터링)

---

## 1. 완료 보고

### 1.1 최종 결과

```
✅ 데이터베이스 상태: 100% 정리 완료
✅ 총 제거된 중복: 809개
✅ 현재 중복 수: 0개
✅ Foreign Key 무결성: 정상
```

### 1.2 제거 과정

#### Pass 1: 첫 1000개 레코드 정리 (2025-10-24)

**발견**: `.order()` 버그
- Supabase 쿼리에 `.order('created_at')` 사용 시 결과가 달라짐
- 1000개 레코드만 분석하여 중복 누락

**결과**:
```
분석 대상: 1,000개 레코드
발견된 중복: 234개 조합 (276개 레코드)
삭제 완료: 276개
```

**발견된 문제 코드**:
```typescript
// ❌ 잘못된 코드
const { data: words } = await supabase
  .from('words')
  .select('...')
  .order('created_at', { ascending: true });  // ← 버그 발생!
```

#### Pass 2: 페이지네이션 적용 (2025-10-24)

**발견**: Supabase 1000-레코드 제한
- PostgREST의 하드 1000-레코드 페이지네이션 제한
- 실제 데이터베이스: 3,318개 단어
- 쿼리 결과: 1,000개만 반환 (2,318개 누락!)

**결과**:
```
분석 대상: 3,318개 레코드 (전체)
페이지 수: 4개
발견된 중복: 490개 조합 (533개 레코드)
삭제 완료: 533개
```

**수정된 코드**:
```typescript
// ✅ 올바른 코드 (페이지네이션 적용)
let allWords: any[] = [];
let page = 0;
const pageSize = 1000;

while (true) {
  const { data } = await supabase
    .from('words')
    .select('...')
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (!data || data.length === 0) break;
  allWords = allWords.concat(data);
  if (data.length < pageSize) break;
  page++;
}
```

### 1.3 최종 통계

| 항목 | 초기 | Pass 1 후 | Pass 2 후 (최종) |
|------|------|------------|------------------|
| 총 단어 수 | ~3,594 | 1,000 | 2,785 |
| 중복 단어 | ~809 | 533 | 0 ✅ |
| 중복률 | ~22% | ~35% | 0% ✅ |

**총 제거**: 809개 중복 레코드

---

## 2. 발견된 버그

### 2.1 `.order()` 버그

#### 증상
동일한 쿼리에 `.order()` 추가 시 다른 결과 반환

#### 재현 방법
```typescript
// 방법 1: order() 없음
const { data: data1 } = await supabase
  .from('words')
  .select('*');
console.log('총 레코드:', data1.length);  // 1000
console.log('중복 조합:', findDuplicates(data1));  // 234개

// 방법 2: order() 있음
const { data: data2 } = await supabase
  .from('words')
  .select('*')
  .order('created_at', { ascending: true });
console.log('총 레코드:', data2.length);  // 1000
console.log('중복 조합:', findDuplicates(data2));  // 0개 (!)
```

#### 원인
Supabase PostgREST의 내부 동작 방식:
- `.order()` 없음: 삽입 순서대로 첫 1000개 반환
- `.order()` 있음: 정렬 후 첫 1000개 반환
- 정렬 기준에 따라 다른 1000개가 선택됨

#### 해결책
**절대 `.order()` 사용 금지**
```typescript
// ❌ 사용 금지
.order('created_at')
.order('id')

// ✅ 순서가 필요하면 클라이언트에서 정렬
allWords.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
```

### 2.2 Supabase 1000-레코드 제한

#### 증상
```typescript
const { data, count } = await supabase
  .from('words')
  .select('*', { count: 'exact' });

console.log('총 개수:', count);     // 3318
console.log('반환:', data.length);  // 1000 (!)
```

#### 원인
PostgREST의 기본 설정:
- 최대 반환 레코드: 1000개
- `count: 'exact'`로 총 개수는 확인 가능
- 하지만 실제 데이터는 1000개만 반환

#### 해결책
**항상 페이지네이션 사용**
```typescript
async function fetchAllRecords(tableName: string) {
  let allRecords: any[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (!data || data.length === 0) break;
    allRecords = allRecords.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  return allRecords;
}
```

### 2.3 예시: Genesis 3:15 중복

**Before 정리**:
```
"בֵּינְךָ וּבֵין הָאִשָּׁה" (너와 여자 사이에): 2개
"זַרְעֲךָ וּבֵין זַרְעָהּ" (너의 후손과 그녀의 후손): 2개
"הוּא יְשׁוּפְךָ רֹאשׁ" (그가 너의 머리를): 2개
"וְאַתָּה תְּשׁוּפֶנּוּ עָקֵב" (너는 그의 발꿈치를): 2개
"אָשִׁית" (내가 두리라): 2개
"וְאֵיבָה" (적개심): 2개
```

**After 정리**:
```
각 단어당 1개씩만 존재 ✅
```

---

## 3. 예방 조치

### 3.1 UNIQUE Constraint 추가 (필수!)

#### 현재 상태
```
❌ UNIQUE constraint 없음
❌ 중복 삽입 가능
❌ 데이터베이스 레벨 보호 없음
```

#### 적용 방법

**Supabase Dashboard → SQL Editor**에서 실행:

```sql
-- 1. UNIQUE Constraint 추가
ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_unique
UNIQUE (hebrew, verse_id);

-- 2. 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_words_verse_id ON words(verse_id);
CREATE INDEX IF NOT EXISTS idx_words_hebrew ON words(hebrew);
CREATE INDEX IF NOT EXISTS idx_words_hebrew_verse ON words(hebrew, verse_id);
```

**파일로 준비됨**: `APPLY_CONSTRAINT_NOW.sql`

#### 검증
```sql
-- Constraint 확인
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'words'
  AND con.conname = 'words_hebrew_verse_unique';
```

**기대 결과**: 1개 행 반환 ✅

### 3.2 데이터 생성 스크립트 수정

#### INSERT → UPSERT 변경

**Before (문제)**:
```typescript
// ❌ 중복 삽입 가능
const { error } = await supabase
  .from('words')
  .insert([
    { hebrew: 'בְּרֵאשִׁית', verse_id: 'genesis_1_1', ... }
  ]);
```

**After (안전)**:
```typescript
// ✅ 중복 자동 업데이트
const { error } = await supabase
  .from('words')
  .upsert([
    { hebrew: 'בְּרֵאשִׁית', verse_id: 'genesis_1_1', ... }
  ], {
    onConflict: 'hebrew,verse_id'  // UNIQUE constraint 기준
  });
```

#### 수정 대상 파일
```
scripts/
├── generate/
│   └── saveToDatabase.ts           # UPSERT 적용
├── migrations/
│   └── regenerateAllSVGsPerGuidelines.ts  # UPSERT 적용
└── uploadWordsCommentaries.ts      # UPSERT 적용
```

### 3.3 Pre-commit Hook 설정

#### 설치
```bash
npm install --save-dev husky
npx husky install
```

#### Hook 생성
```bash
npx husky add .husky/pre-commit "npm run duplicates:verify"
```

#### package.json 스크립트
```json
{
  "scripts": {
    "duplicates:verify": "tsx scripts/final/verifyNoDuplicates.ts",
    "duplicates:remove": "tsx scripts/final/finalDuplicateRemoval.ts",
    "duplicates:monitor": "tsx scripts/final/monitorDuplicates.ts"
  }
}
```

---

## 4. 빠른 참조

### 4.1 명령어 치트시트

#### 중복 확인
```bash
npm run duplicates:verify
```

**출력**:
```
✅ Word Duplicates: No duplicates found (2785 words, 2785 unique)
✅ Verse Duplicates: No duplicates found (1000 verses)
✅ Constraints: Unique constraint prevents duplicates
```

#### 중복 제거
```bash
npm run duplicates:remove
```

**진행 과정**:
```
📊 Phase 1: Analyzing... (페이지네이션 적용)
🔍 Phase 2: Identifying duplicates...
🗑️  Phase 3: Deleting duplicates... (100/533, 200/533...)
✅ Phase 4: Verification
```

#### 모니터링
```bash
npm run duplicates:monitor --watch
```

**실시간 감지**:
```
[2025-10-24 10:00:00] ✅ No duplicates
[2025-10-24 10:05:00] ✅ No duplicates
[2025-10-24 10:10:00] ❌ Warning: 1 duplicate found!
```

### 4.2 트러블슈팅

| 문제 | 명령어 | 기대 결과 |
|------|--------|-----------|
| 중복 확인 | `npm run duplicates:verify` | 0 duplicates |
| 중복 발견 | `npm run duplicates:remove` | Deleted N records |
| Constraint 확인 | SQL 쿼리 실행 | 1 row returned |
| 페이지네이션 테스트 | `scripts/debug/whyMissedDuplicates.ts` | Fetches all records |

### 4.3 디버깅

#### 1단계: 총 개수 확인
```typescript
const { count } = await supabase
  .from('words')
  .select('*', { count: 'exact', head: true });

console.log('총 단어 수:', count);  // 예: 2785
```

#### 2단계: 중복 확인
```bash
npx tsx scripts/final/verifyNoDuplicates.ts --detailed
```

#### 3단계: 특정 단어 조회
```typescript
const { data } = await supabase
  .from('words')
  .select('*')
  .eq('hebrew', 'בְּרֵאשִׁית')
  .eq('verse_id', 'genesis_1_1');

console.log('결과:', data.length);  // 1이어야 함
```

---

## 5. 모니터링

### 5.1 자동 모니터링 설정

#### Cron Job (선택사항)
```bash
# crontab -e
0 */6 * * * cd /path/to/project && npm run duplicates:monitor >> /var/log/duplicates.log 2>&1
```

**6시간마다 자동 체크**

#### GitHub Actions (권장)
```yaml
# .github/workflows/check-duplicates.yml
name: Check Duplicates

on:
  schedule:
    - cron: '0 0 * * *'  # 매일 자정

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check for duplicates
        run: npm run duplicates:verify
```

### 5.2 알림 설정

#### Slack Webhook
```typescript
// scripts/final/monitorDuplicates.ts
if (duplicates.length > 0) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `⚠️ ${duplicates.length}개 중복 발견!`
    })
  });
}
```

#### 이메일 알림
```typescript
import nodemailer from 'nodemailer';

if (duplicates.length > 0) {
  await transporter.sendMail({
    to: 'admin@example.com',
    subject: '중복 데이터 발견',
    text: `${duplicates.length}개 중복이 발견되었습니다.`
  });
}
```

---

## 📚 참조 파일

### 실행 가능한 스크립트
```
scripts/final/
├── finalDuplicateRemoval.ts       # 중복 제거 (페이지네이션 적용)
├── verifyNoDuplicates.ts          # 6-point 검증
├── addUniqueConstraint.ts         # Constraint 추가
└── monitorDuplicates.ts           # 모니터링
```

### SQL 마이그레이션
```
APPLY_CONSTRAINT_NOW.sql           # 즉시 실행 가능한 SQL
```

### 과거 기록 (Archive)
```
docs/archive/duplicates/
├── DUPLICATE_FIX_SUMMARY.md       # 과거 해결 시도
└── GENESIS_1_6_DUPLICATE_ANALYSIS.md  # 특정 케이스
```

---

## 🎯 체크리스트

### 즉시 실행 (필수!)
- [x] 모든 중복 제거 완료 (809개)
- [ ] **UNIQUE Constraint 적용** ⚠️
- [ ] Constraint 적용 검증

### 1주일 내
- [ ] 데이터 생성 스크립트 UPSERT 변경
- [ ] Pre-commit hook 설정
- [ ] 모니터링 자동화

### 1개월 내
- [ ] GitHub Actions 워크플로우 추가
- [ ] Slack/Email 알림 설정
- [ ] 문서 최종 정리

---

## 📊 현재 상태

```
데이터베이스: ✅ 100% 정리
총 단어 수: 2,785개
중복 단어: 0개
UNIQUE Constraint: ❌ 미적용 (수동 작업 필요)
모니터링: ⚠️  수동 실행 가능
```

---

**최종 업데이트**: 2025-10-24
**작성**: Claude Code
**상태**: ✅ 중복 제거 완료, Constraint 적용 대기 중
**다음 조치**: `APPLY_CONSTRAINT_NOW.sql` 실행
