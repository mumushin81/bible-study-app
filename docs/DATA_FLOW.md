# 📊 데이터 플로우 문서

**작성일**: 2025-10-23
**목적**: 명확한 데이터 소스 계층 및 생명 주기 문서화

---

## 🎯 데이터 소스 계층

### 1순위: Supabase (Single Source of Truth) ✨

**용도**: 모든 마스터 데이터의 유일한 소스

**테이블**:
- `verses`, `words`, `commentaries` - 성경 컨텐츠
- `hebrew_roots`, `word_derivations`, `word_metadata` - 어휘 시스템
- `user_book_progress`, `user_word_progress_v2` - 사용자 진행 데이터
- `user_word_bookmarks` - 사용자 북마크

**특징**:
- ✅ 기기 간 자동 동기화
- ✅ 실시간 데이터 업데이트
- ✅ 다중 사용자 지원
- ✅ 백업 및 복구 가능

**접근 방식**:
```typescript
// React Hook을 통한 Supabase 접근 (추천)
const { words, loading } = useWords({ bookId: 'genesis' });
const { progress } = useBookProgress('genesis');

// 직접 접근 (비추천 - Hook 사용 권장)
const { data } = await supabase
  .from('words')
  .select('*')
  .eq('verse_id', verseId);
```

---

### 2순위: localStorage (Cache Only) 💾

**용도**: 오프라인 지원 및 성능 최적화

**저장 데이터**:
- `bookmarkedWords_[userId]` - 북마크 캐시
- `srsData_[userId]` - SRS 데이터 캐시
- `lastSync_[userId]` - 마지막 동기화 시간

**특징**:
- ✅ 오프라인에서도 작동
- ✅ 네트워크 실패 시 fallback
- ✅ 빠른 로드 속도
- ⚠️ 기기 간 동기화 불가
- ⚠️ 브라우저 캐시 삭제 시 손실 가능

**사용 정책**:
```typescript
// 로그인 사용자
if (user) {
  // 1. Primary: Supabase에서 로드
  const supabaseData = await loadFromSupabase();
  setData(supabaseData);

  // 2. Cache: localStorage에 백업
  saveToLocalStorage(supabaseData);
}

// 게스트
else {
  // localStorage만 사용
  const cachedData = loadFromLocalStorage();
  setData(cachedData);
}
```

**TTL (Time To Live)**:
- 권장: 7일
- 오래된 캐시는 자동 삭제
- 로그인 시 Supabase로부터 새로 고침

---

### 3순위: data/*.json (Staging Area) 📂

**용도**: DB 업로드 전 중간 산물

**폴더 구조**:
```
data/
├── generated/          # 배치 생성 데이터 (Genesis 11-15)
│   ├── genesis_11_10-13.json
│   └── ...
├── generated_v2/       # SVG 아이콘 포함 개별 구절
│   ├── genesis_1_1.json
│   └── ...
└── archive/           # 업로드 완료 파일 아카이브 (권장)
```

**특징**:
- ⚠️ **앱에서 직접 사용 금지**
- ✅ 스크립트로만 읽기
- ✅ DB 업로드 후 아카이브 이동

**워크플로우**:
```bash
# 1. 데이터 생성 (스크립트)
npm run generate:verse -- genesis 16 1

# 2. 검증 (선택)
npm run validate:verse -- data/generated_v2/genesis_16_1.json

# 3. 업로드 (Supabase)
npm run save:content -- data/generated_v2/genesis_16_1.json

# 4. 아카이브 (수동)
mv data/generated_v2/genesis_16_1.json data/archive/
```

---

## 🔄 데이터 생명 주기

### 1. 생성 단계 📝

```bash
# 개별 구절 생성
npm run generate:verse -- <book> <chapter> <verse>

# 배치 생성
npm run generate:batch -- <book> <start_chapter> <end_chapter>
```

**산출물**: `data/generated_v2/*.json`

---

### 2. 검증 단계 ✅

**자동 검증 항목**:
- 필수 필드 존재 여부
- SVG 아이콘 형식
- 히브리어 어근 형식 `ה-ל-ך (걷다)`
- 문법 태그 유효성

```bash
npm run validate:verse -- <json_file_path>
```

---

### 3. 업로드 단계 ⬆️

**방법 1: 개별 업로드**
```bash
npm run save:content -- <json_file_path>
```

**방법 2: 배치 업로드**
```bash
# Genesis 11-15 예시
node scripts/upload-genesis-11-15.cjs
```

**업로드 프로세스**:
1. JSON 파일 읽기
2. 스키마 검증
3. Supabase `verses` 테이블에 upsert
4. Supabase `words` 테이블에 upsert
5. 성공/실패 로그 출력

---

### 4. 앱 사용 단계 📱

**React Hooks**:
```typescript
// src/hooks/useVerses.ts
export function useVerses({ bookId, chapter }: Options) {
  // Supabase에서 로드
  const { data: versesData } = await supabase
    .from('verses')
    .select(`
      *,
      words (*)
    `)
    .eq('book_id', bookId)
    .order('verse_number');

  return { verses: versesData, loading, error };
}
```

**사용자 경험**:
- 온라인: Supabase → 실시간 최신 데이터
- 오프라인: localStorage 캐시 → 이전 데이터

---

### 5. 캐싱 단계 💾

**Optimistic Update 전략**:
```typescript
// 예: useBookmarks.ts
const toggleBookmark = async (wordHebrew: string) => {
  // 1. 즉시 UI 업데이트
  setBookmarkedWords(newBookmarks);

  // 2. localStorage 캐시
  saveToLocalStorage(newBookmarks);

  // 3. Supabase 백그라운드 동기화
  if (user) {
    await supabase
      .from('user_word_bookmarks')
      .upsert({ user_id: user.id, word_hebrew: wordHebrew });
  }
};
```

---

### 6. 아카이브 단계 🗃️

**업로드 완료 후**:
```bash
# 수동 아카이브 (권장)
mv data/generated_v2/genesis_1_1.json data/archive/

# 자동 아카이브 (미래 구현)
npm run archive:uploaded
```

---

## 🚫 잘못된 사용 예시

### ❌ 절대 하지 말 것

```typescript
// 1. JSON 파일 직접 import (금지!)
import genesisData from '../data/generated/genesis_11_10-13.json'; // ❌

// 2. localStorage를 Primary로 사용 (금지!)
const data = localStorage.getItem('words'); // ❌ Primary X

// 3. Supabase 없이 localStorage만 사용 (로그인 사용자)
if (user) {
  const data = loadFromLocalStorage(); // ❌ Supabase 먼저!
}

// 4. data/ 폴더를 프로덕션 데이터 소스로 사용
<App dataSource="./data/generated" /> // ❌ 절대 안 됨
```

---

## ✅ 올바른 사용 예시

### ✅ 권장 패턴

```typescript
// 1. React Hook 사용 (최고!)
function StudyTab() {
  const { verses, loading } = useVerses({ bookId: 'genesis' });
  // Supabase → localStorage 캐싱 자동 처리
}

// 2. Optimistic Update
function VocabularyTab() {
  const { toggleBookmark } = useBookmarks();
  // 즉시 UI 업데이트 + 백그라운드 Supabase 동기화
}

// 3. 오프라인 대응
function useWords() {
  useEffect(() => {
    if (user) {
      // Primary: Supabase
      loadFromSupabase().then(data => {
        setWords(data);
        saveToLocalStorage(data); // Cache
      });
    } else {
      // Fallback: localStorage (게스트 전용)
      const cached = loadFromLocalStorage();
      setWords(cached);
    }
  }, [user]);
}
```

---

## 📋 데이터 소스 의사결정 플로우차트

```
사용자 로그인?
  ├─ YES → Supabase (Primary)
  │         ├─ 성공? → localStorage 캐시 + UI 업데이트
  │         └─ 실패? → localStorage fallback
  │
  └─ NO → localStorage (Guest Mode)
            └─ 로그인 권장 안내
```

---

## 🛡️ 데이터 일관성 보장

### Supabase → localStorage 동기화

```typescript
// 주기적 동기화 (앱 시작 시, 로그인 시)
useEffect(() => {
  if (user) {
    syncWithSupabase();
  }
}, [user?.id]);

async function syncWithSupabase() {
  const lastSync = localStorage.getItem(`lastSync_${user.id}`);
  const now = new Date();

  // 7일 이상 지났으면 강제 재동기화
  if (!lastSync || (now - new Date(lastSync)) > 7 * 24 * 60 * 60 * 1000) {
    const freshData = await loadFromSupabase();
    saveToLocalStorage(freshData);
    localStorage.setItem(`lastSync_${user.id}`, now.toISOString());
  }
}
```

---

## 🔍 디버깅 가이드

### localStorage 캐시 확인
```javascript
// Chrome DevTools Console
localStorage.getItem('bookmarkedWords_[user_id]');
localStorage.getItem('srsData_[user_id]');
```

### Supabase 데이터 확인
```sql
-- Supabase SQL Editor
SELECT * FROM verses WHERE book_id = 'genesis' LIMIT 10;
SELECT * FROM words WHERE verse_id = 'genesis_1_1';
SELECT * FROM hebrew_roots ORDER BY frequency DESC LIMIT 10;
```

### 데이터 불일치 해결
```typescript
// 강제 재동기화
localStorage.clear(); // 모든 캐시 삭제
window.location.reload(); // 앱 재시작 → Supabase에서 새로 로드
```

---

## 📚 참고 자료

- **실제 DB 상태**: `ACCURATE_PROGRESS_REPORT.md`
- **올바른 분석 프로세스**: `CORRECT_ANALYSIS_PROCESS.md`
- **근본 원인 분석**: `ROOT_CAUSE_ANALYSIS_REPORT.md`
- **마이그레이션 가이드**: `MIGRATION_GUIDE.md`

---

## 🎯 핵심 원칙 요약

1. **Supabase = Primary** (항상 최우선)
2. **localStorage = Cache** (오프라인 fallback)
3. **data/*.json = Staging** (앱에서 사용 금지)
4. **Optimistic Update** (즉시 UI, 백그라운드 동기화)
5. **게스트 vs 로그인 명확히 구분**

---

**마지막 업데이트**: 2025-10-23
**관리자**: Claude Code
**상태**: ✅ 완료
