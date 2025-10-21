# 구절 컨텐츠 업데이트 시 자주 발생하는 문제 해결 가이드

## 📋 목차
1. [이모지가 제대로 표시 안 되는 문제](#1-이모지가-제대로-표시-안-되는-문제)
2. [Genesis 5장 등에서 원문만 표시되는 문제](#2-genesis-5장-등에서-원문만-표시되는-문제)
3. [새 구절 추가 시 체크리스트](#3-새-구절-추가-시-체크리스트)
4. [데이터 검증 방법](#4-데이터-검증-방법)

---

## 1. 이모지가 제대로 표시 안 되는 문제

### 증상
- 모든 단어가 똑같은 이모지 (📜)로 표시됨
- 단어마다 다른 이모지가 나와야 하는데 안 나옴

### 원인
**위치**: `src/hooks/useVerses.ts:167`

```typescript
// ❌ 문제 코드
emoji: w.emoji || '📜',  // DB에서 emoji가 NULL이면 기본값 사용
```

`words` 테이블에 데이터를 insert할 때 `emoji` 필드를 누락하거나 `NULL`로 저장하면, 모든 단어가 기본값 `'📜'`로 표시됩니다.

### 해결 방법

#### Option 1: DB 저장 시 emoji 필수로 포함 (권장)
```typescript
// ✅ 마이그레이션/삽입 스크립트에서
const wordsData = verse.words.map((w: any) => ({
  verse_id: verse.id,
  hebrew: w.hebrew,
  meaning: w.meaning,
  ipa: w.ipa,
  korean: w.korean,
  root: w.root,
  grammar: w.grammar,
  emoji: w.emoji || '❓',  // ← 반드시 포함!
  structure: w.structure || null,
  // ...
}));
```

#### Option 2: useVerses.ts 수정
```typescript
// src/hooks/useVerses.ts:167
emoji: w.emoji || '❓',  // NULL이면 '❓'로 표시 (누락 명확히 표시)
```

### 예방 방법
- `VERSE_CREATION_GUIDELINES.md` 체크리스트 확인
- 모든 단어에 `emoji` 필드 필수로 작성
- 마이그레이션 스크립트에서 `emoji` 검증 추가

```typescript
// 검증 함수 예시
function validateWord(word: Word): string[] {
  const errors: string[] = [];
  if (!word.emoji) errors.push(`${word.hebrew}: emoji 누락`);
  if (!word.meaning) errors.push(`${word.hebrew}: meaning 누락`);
  // ...
  return errors;
}
```

---

## 2. Genesis 5장 등에서 원문만 표시되는 문제

### 증상
- 히브리어 원문은 표시됨
- IPA 발음, 한글 발음이 "TODO" 또는 표시 안 됨
- 단어 분석 섹션이 아예 보이지 않음
- 주석 해설이 표시 안 됨

### 원인

**데이터 상태 불일치**:

```
✅ Static Data (src/data/verses.ts)
   - Genesis 1-3장만 (34 verses)
   - 모든 필드 완성 (words, commentary)

⚠️ Database (Supabase)
   - Genesis 1-50장 (1,533 verses)
   - 히브리어 원문 + 영어 번역만 있음
   - words[], commentary가 대부분 비어있음
```

**코드 흐름**:
```typescript
// useVerses.ts:157
const words: Word[] = (verse.words || [])  // ← [] 빈 배열
  .sort(...)
  .map(...)

// 결과: words = []
```

```tsx
// StudyTab.tsx:81
{verse.words && verse.words.length > 0 && (
  // ← 조건 실패, UI 렌더링 안 됨
  <단어 분석 UI>
)}
```

### 근본 원인

**현재 마이그레이션 상태**:
1. Phase 3에서 `verses` 테이블에 1,533개 구절 insert
2. `hebrew`, `ipa`, `korean_pronunciation`, `modern` 필드만 저장
3. **`words` 테이블과 `commentaries` 테이블은 비어있음**
4. Genesis 1-3장만 Static 파일로 완성

**왜 Genesis 5장에서 문제가 되는가?**:
- Genesis 5장은 DB에 `verses` 레코드만 있음
- `words` 테이블에 관련 레코드 0개
- `commentaries` 테이블에 관련 레코드 0개
- 결과: 원문만 표시

### 해결 방법

#### Short-term: Genesis 5장 컨텐츠 생성 및 DB 저장

**1단계: 컨텐츠 생성**
```bash
# Genesis 5장 컨텐츠 생성 (AI 또는 수동)
npm run generate:content -- --chapter 5

# 또는
npm run generate:verse -- --ref "genesis_5_1"
```

**2단계: DB에 저장**
```bash
# 생성된 컨텐츠를 DB에 업로드
npm run migrate:content -- --chapter 5
```

**3단계: 검증**
```bash
# Genesis 5장 데이터 확인
npm run verify:content -- --chapter 5
```

#### Long-term: Phase 4 완료 (AI 자동 생성)

**전체 프로세스**:
```bash
# 1. Genesis 4-50장 컨텐츠 자동 생성
npm run generate:all-content

# 2. 검증
npm run verify:all-content

# 3. DB 업로드
npm run migrate:all-content
```

**예상 결과**:
- 1,499개 구절 완성 (Genesis 4-50)
- words 테이블: ~14,580개 레코드 추가
- commentaries 테이블: 1,499개 레코드 추가

---

## 3. 새 구절 추가 시 체크리스트

### 데이터 준비 단계
- [ ] 히브리어 원문 (니쿠드 포함)
- [ ] IPA 발음
- [ ] 한글 발음
- [ ] 현대어 의역 (자연스러운 한국어)

### Words 배열
- [ ] 모든 단어에 `emoji` 필드 포함
- [ ] 모든 단어에 `root` 필드 포함
- [ ] `grammar` 필드 일관된 형식
- [ ] `structure` 필드 (선택, 필요 시)

### Commentary 객체
- [ ] `intro` (2-3문장)
- [ ] `sections` (2-4개)
  - [ ] 모든 섹션 제목이 "히브리어 (발음) - 설명" 형식
  - [ ] 각 섹션에 다른 `color` 사용
  - [ ] `color`에 `as const` 타입 단언
  - [ ] 각 섹션의 `points` 배열 (3-4개)
- [ ] `whyQuestion`
  - [ ] `question`, `answer`, `bibleReferences` (2-4개)
- [ ] `conclusion`
  - [ ] `title`: "💡 신학적 의미"
  - [ ] `content` (2-3문장)

### DB 저장 단계
- [ ] `verses` 테이블에 insert
- [ ] `words` 테이블에 배치 insert
- [ ] `commentaries` 테이블에 insert
- [ ] `commentary_sections` 테이블에 insert
- [ ] `why_questions` 테이블에 insert
- [ ] `commentary_conclusions` 테이블에 insert

### 검증 단계
- [ ] DB에서 데이터 조회 성공
- [ ] 브라우저에서 UI 확인
- [ ] 이모지 제대로 표시
- [ ] 단어 분석 섹션 표시
- [ ] 주석 해설 섹션 표시

---

## 4. 데이터 검증 방법

### DB 데이터 확인

```bash
# Genesis 5장 데이터 확인
npm run check:chapter -- --chapter 5
```

**또는 직접 쿼리**:
```sql
-- 구절 확인
SELECT id, reference, hebrew,
       CASE WHEN ipa = '' THEN '❌' ELSE '✅' END as has_ipa,
       CASE WHEN korean_pronunciation = '' THEN '❌' ELSE '✅' END as has_korean
FROM verses
WHERE chapter = 5
LIMIT 5;

-- 단어 개수 확인
SELECT v.reference, COUNT(w.id) as word_count
FROM verses v
LEFT JOIN words w ON w.verse_id = v.id
WHERE v.chapter = 5
GROUP BY v.id, v.reference
ORDER BY v.verse_number;

-- 주석 개수 확인
SELECT v.reference, COUNT(c.id) as commentary_count
FROM verses v
LEFT JOIN commentaries c ON c.verse_id = v.id
WHERE v.chapter = 5
GROUP BY v.id, v.reference
ORDER BY v.verse_number;
```

### 브라우저 콘솔 확인

**개발자 도구 콘솔에서**:
```javascript
// useVerses에서 로드된 데이터 확인
// 콘솔에 자동으로 출력됨:
// ✅ DB에서 N개 구절 로드 완료 (commentaries: M개)

// words 배열이 비어있는지 확인
console.log('Words count:', verse.words?.length || 0);
console.log('Commentary exists:', !!verse.commentary);
```

### 자동 검증 스크립트 작성

```typescript
// scripts/verifyVerse.ts
import { supabase } from '../src/lib/supabase';

async function verifyVerse(verseId: string) {
  console.log(`\n🔍 Verifying ${verseId}...`);

  // 1. Verse 확인
  const { data: verse } = await supabase
    .from('verses')
    .select('*')
    .eq('id', verseId)
    .single();

  if (!verse) {
    console.error('❌ Verse not found');
    return;
  }

  console.log('✅ Verse exists');
  console.log(`   Hebrew: ${verse.hebrew.substring(0, 30)}...`);
  console.log(`   IPA: ${verse.ipa ? '✅' : '❌'}`);
  console.log(`   Korean: ${verse.korean_pronunciation ? '✅' : '❌'}`);

  // 2. Words 확인
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', verseId);

  console.log(`\n📝 Words: ${words?.length || 0} found`);
  if (words && words.length > 0) {
    const missingEmoji = words.filter(w => !w.emoji);
    if (missingEmoji.length > 0) {
      console.warn(`   ⚠️  ${missingEmoji.length} words missing emoji`);
    }
  } else {
    console.warn('   ⚠️  No words found!');
  }

  // 3. Commentary 확인
  const { data: commentary } = await supabase
    .from('commentaries')
    .select('*, commentary_sections(*), why_questions(*), commentary_conclusions(*)')
    .eq('verse_id', verseId)
    .single();

  if (commentary) {
    console.log(`\n📖 Commentary: ✅`);
    console.log(`   Intro: ${commentary.intro ? '✅' : '❌'}`);
    console.log(`   Sections: ${commentary.commentary_sections?.length || 0}`);
    console.log(`   Why Question: ${commentary.why_questions ? '✅' : '❌'}`);
    console.log(`   Conclusion: ${commentary.commentary_conclusions ? '✅' : '❌'}`);
  } else {
    console.warn('\n📖 Commentary: ❌ Not found');
  }
}

// 실행
verifyVerse('genesis_5_1');
```

---

## 5. 자주 하는 실수와 해결

### 실수 1: emoji 필드 누락
```typescript
// ❌ 잘못됨
{
  hebrew: 'בָּרָא',
  meaning: '창조하셨다',
  // emoji 없음!
}

// ✅ 올바름
{
  hebrew: 'בָּרָא',
  meaning: '창조하셨다',
  emoji: '✨'
}
```

### 실수 2: words 배열을 DB에 저장 안 함
```typescript
// ❌ 잘못됨: verses만 insert
await supabase.from('verses').insert({ ... });
// words 저장 안 함!

// ✅ 올바름: words도 함께 insert
await supabase.from('verses').insert({ ... });
for (const word of verse.words) {
  await supabase.from('words').insert({
    verse_id: verse.id,
    ...word
  });
}
```

### 실수 3: Static 파일만 수정하고 DB는 업데이트 안 함
```typescript
// ❌ 잘못됨
// src/data/verses.ts만 수정
// DB는 그대로 둠 → 다른 사용자는 볼 수 없음

// ✅ 올바름
// 1. src/data/verses.ts 수정 (로컬 테스트용)
// 2. DB에 마이그레이션 (프로덕션 배포용)
```

---

## 6. 문제 해결 플로우차트

```
구절 추가/수정 시 문제 발생
        ↓
┌───────┴───────┐
│ 어떤 문제?    │
└───────┬───────┘
        ↓
    ┌───┴───┐
    │       │
이모지      원문만
문제        표시
    │       │
    ↓       ↓
emoji    words[]
필드      비어있음
확인
    │       │
    ↓       ↓
DB에      DB에
저장됨?    저장됨?
    │       │
NO  │   NO  │
    ↓       ↓
마이그    words
레이션    테이블
스크립트   insert
수정
```

---

## 7. 빠른 참조

### Genesis 5장 컨텐츠 생성 (급할 때)
```bash
# 1. Genesis 5:1 컨텐츠 생성
npm run generate:verse -- --ref "genesis_5_1"

# 2. DB에 저장
npm run save:verse -- --file "data/genesis-5-1.json"

# 3. 확인
curl http://localhost:5177
# Genesis 5:1로 이동하여 확인
```

### 이모지 일괄 수정 (DB)
```sql
-- emoji가 NULL인 단어들 찾기
SELECT verse_id, hebrew, emoji
FROM words
WHERE emoji IS NULL
LIMIT 10;

-- 기본 이모지로 업데이트
UPDATE words
SET emoji = '❓'
WHERE emoji IS NULL;
```

---

## 8. 관련 문서

- `VERSE_CREATION_GUIDELINES.md` - 컨텐츠 작성 가이드
- `PHASE3_FULL_GENESIS_MIGRATION.md` - 마이그레이션 전략
- `DEVELOPMENT_GUIDELINES.md` - 개발 지침

---

**마지막 업데이트**: 2025-10-21
**작성자**: Claude Code Agent
