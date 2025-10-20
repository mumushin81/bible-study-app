# 📖 성경 데이터베이스 구축 워크플로우 가이드

## 🎯 목표

히브리어 원문을 크롤링하여 Supabase에 저장하고, 품질을 검증한 후, AI로 컨텐츠를 생성하는 체계적인 시스템

---

## 📁 새로운 디렉토리 구조

```
scripts/
├── bible-cli.ts           # 🎮 통합 CLI 도구
├── utils/                 # 🔧 공통 유틸리티
│   ├── logger.ts         # 로깅
│   ├── supabase.ts       # Supabase 클라이언트
│   └── constants.ts      # 책 정보, 상수
├── crawl/                 # 🕷️ 크롤링
│   ├── index.ts          # 메인 진입점
│   ├── initBooks.ts      # Books 테이블 초기화
│   ├── fetchPage.ts      # Firecrawl API
│   ├── parseVerses.ts    # 구절 파싱
│   ├── saveToDB.ts       # DB 저장
│   ├── crawlChapter.ts   # 장 단위 크롤링
│   └── crawlBook.ts      # 책 단위 크롤링
├── verify/                # ✅ 검증
│   ├── index.ts          # 통합 검증
│   ├── checkMissing.ts   # 누락 검사
│   └── checkDuplicates.ts # 중복 검사
└── generate/              # 🤖 컨텐츠 생성 (추후 구현)
    └── (예정)
```

---

## 🚀 빠른 시작

### 1️⃣ Books 테이블 초기화

Torah 5권(창세기~신명기) 메타데이터를 Supabase에 저장합니다.

```bash
npm run bible:init
```

**출력 예시:**
```
📚 Books 테이블 초기화 시작
✅ Supabase 연결 완료
✅ 창세기 (בראשית) - 50장
✅ 출애굽기 (שמות) - 40장
✅ 레위기 (ויקרא) - 27장
✅ 민수기 (במדבר) - 36장
✅ 신명기 (דברים) - 34장
✅ Books 테이블 초기화 완료! 🎉
```

---

### 2️⃣ 히브리어 원문 크롤링

mechon-mamre.org에서 히브리어 원문을 크롤링하여 `verses` 테이블에 저장합니다.

#### 단일 장 크롤링
```bash
npm run bible:crawl genesis 1
```

#### 범위 크롤링
```bash
npm run bible:crawl genesis 1 10
```

#### 책 전체 크롤링
```bash
npm run bible:crawl genesis
```

**출력 예시:**
```
📚 창세기 크롤링 시작 (1장~50장)
📊 [1/50] 2% - 창세기 1장
📖 창세기 1장 크롤링 시작
ℹ️  URL: https://mechon-mamre.org/p/pt/pt0101.htm
ℹ️  Firecrawl API로 크롤링: ...
✅ 크롤링 성공: 5847 바이트
ℹ️  추출된 구절: 31개
✅ 저장 완료: 창세기 1:1
✅ 저장 완료: 창세기 1:2
...
✅ 창세기 1장 완료! (성공: 31, 실패: 0)
```

**저장되는 데이터:**
- ✅ `id`: `genesis_1_1`
- ✅ `book_id`: `genesis`
- ✅ `chapter`: `1`
- ✅ `verse_number`: `1`
- ✅ `reference`: `창세기 1:1`
- ✅ `hebrew`: `בְּרֵאשִׁית בָּרָא...` (히브리어 원문)
- ⏸️ `ipa`: `` (나중에 추가)
- ⏸️ `korean_pronunciation`: `` (나중에 추가)
- ⏸️ `modern`: `` (나중에 추가)

---

### 3️⃣ 데이터 검증

크롤링한 데이터의 중복과 누락을 검사합니다.

#### 전체 검증 (중복 + 누락)
```bash
npm run bible:verify
```

#### 중복 검사만
```bash
npm run bible:check-duplicates
```

#### 누락 검사만
```bash
npm run bible:check-missing
```

#### 특정 책만 검사
```bash
npm run bible:verify genesis
npm run bible:check-missing genesis
npm run bible:check-duplicates genesis
```

**출력 예시:**
```
🔍 통합 데이터 검증 시작

1️⃣ 중복 구절 검사
📖 창세기 중복 구절 검사
📊 검사 결과
ℹ️  총 구절: 1533개
✅ ID 중복 없음
✅ 히브리어 텍스트 중복 없음

2️⃣ 누락 구절 검사
📖 창세기 누락 구절 검사
📊 검사 결과
ℹ️  총 예상 구절: 1533개
ℹ️  실제 구절: 1530개
⚠️  누락된 구절: 3개

누락 목록:
  - 창세기 5:12 (ID: genesis_5_12)
  - 창세기 10:8 (ID: genesis_10_8)
  - 창세기 22:15 (ID: genesis_22_15)

✅ 검증 완료
```

---

## 📋 전체 워크플로우

### 새 책 추가 시나리오 (예: 출애굽기)

```bash
# 1. Books 테이블에 메타데이터가 있는지 확인 (초기화 시 자동 추가됨)
npm run bible:init

# 2. 출애굽기 전체 크롤링
npm run bible:crawl exodus

# 3. 검증
npm run bible:verify exodus

# 4. 누락된 구절이 있다면 해당 장만 다시 크롤링
npm run bible:crawl exodus 5  # 5장만 다시 크롤링

# 5. 다시 검증
npm run bible:verify exodus
```

---

## 🛠️ 통합 CLI 도구

`npm run bible` 명령어로 모든 기능에 접근할 수 있습니다.

### 도움말
```bash
npm run bible help
```

### 사용 가능한 명령어

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `init-books` | Books 테이블 초기화 | `npm run bible init-books` |
| `crawl <bookId> [start] [end]` | 히브리어 원문 크롤링 | `npm run bible crawl genesis 1 10` |
| `verify [bookId]` | 데이터 검증 | `npm run bible verify genesis` |

---

## 📊 현재 상태 확인

### Supabase에서 SQL로 확인

```sql
-- 총 구절 수
SELECT COUNT(*) FROM verses;

-- 책별 구절 수
SELECT book_id, COUNT(*) as verse_count
FROM verses
GROUP BY book_id
ORDER BY book_id;

-- 최근 추가된 구절
SELECT * FROM verses
ORDER BY created_at DESC
LIMIT 10;

-- 특정 장의 구절들
SELECT reference, LEFT(hebrew, 30) as hebrew_preview
FROM verses
WHERE book_id = 'genesis' AND chapter = 1
ORDER BY verse_number;

-- 빈 필드 확인 (컨텐츠 생성 필요한 구절)
SELECT COUNT(*)
FROM verses
WHERE ipa = '' OR korean_pronunciation = '' OR modern = '';
```

---

## ⚙️ 설정

### 환경 변수 (.env.local)

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 선택사항

# Firecrawl (자동 설정됨)
FIRECRAWL_API_KEY=fc-650c644774d3424fa7e1c49fdfdbd444
```

### 크롤링 속도 조절

`scripts/crawl/crawlBook.ts`의 `delayMs` 수정:

```typescript
export interface CrawlBookOptions {
  delayMs?: number // 기본값: 2000ms (2초)
}
```

---

## 🎯 다음 단계

### Phase 3: 컨텐츠 생성 자동화 (예정)

```bash
# 계획 중인 명령어들
npm run bible:generate genesis     # IPA, 발음, 번역, 단어, 주석 생성
npm run bible:generate-missing     # 빈 필드만 보충
npm run bible:status               # 진행 상황 확인
```

---

## 🐛 문제 해결

### 1. Firecrawl API 에러
```
❌ Firecrawl API 에러: 429 - Rate limit exceeded
```
**해결:** `crawlBook.ts`의 `delayMs`를 늘리세요 (예: 3000ms)

### 2. Supabase 연결 실패
```
❌ VITE_SUPABASE_URL이 설정되지 않았습니다.
```
**해결:** `.env.local` 파일 확인

### 3. 구절을 찾을 수 없음
```
⚠️  구절을 찾을 수 없습니다.
```
**해결:** 웹 페이지 구조가 변경되었을 수 있음. `parseVerses.ts`의 정규표현식 확인

---

## 💡 팁

1. **소규모 테스트 먼저**: 전체 책을 크롤링하기 전에 1-2장만 테스트하세요.
2. **정기적인 검증**: 크롤링 후 항상 검증을 실행하세요.
3. **백업**: 대량 작업 전에 Supabase에서 데이터 백업을 권장합니다.
4. **Rate Limit**: API 제한을 고려하여 대기 시간을 적절히 설정하세요.

---

## 📞 지원

문제가 발생하면:
1. 로그 확인
2. 환경 변수 확인
3. Supabase 데이터베이스 상태 확인
4. GitHub Issues에 문의

---

**행복한 코딩 되세요!** 🚀
