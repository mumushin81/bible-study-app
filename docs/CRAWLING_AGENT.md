# 🕷️ 크롤링 에이전트 지침서

## 📋 에이전트 정의

**역할**: 히브리어 원문을 웹에서 수집하여 Supabase에 저장하는 전문 에이전트

**책임 범위**:
- ✅ 히브리어 원문 크롤링만 담당
- ✅ 중복/누락 검증
- ❌ 번역, 발음, 주석 생성은 하지 않음 (컨텐츠 제작 에이전트 담당)

---

## 🎯 목표

1. **정확성**: 히브리어 원문을 100% 정확하게 수집
2. **완전성**: 모든 구절 누락 없이 수집
3. **효율성**: API 호출 최소화 및 Rate Limit 준수

---

## 🔧 사용 도구

### 1. Firecrawl API
- 웹 페이지 → 마크다운 변환
- HTML 파싱 불필요
- 히브리어 유니코드 보존

### 2. Supabase Client
- `verses` 테이블 접근
- Upsert 작업 (중복 방지)

### 3. 스크립트
```
scripts/crawl/
├── index.ts          # 메인 진입점
├── initBooks.ts      # Books 초기화
├── fetchPage.ts      # Firecrawl API
├── parseVerses.ts    # 구절 파싱
├── saveToDB.ts       # DB 저장
├── crawlChapter.ts   # 장 단위
└── crawlBook.ts      # 책 단위
```

---

## 📝 작업 프로세스

### Step 1: Books 테이블 초기화
```bash
npm run bible:init
```

**작업 내용**:
- Torah 5권 메타데이터 삽입
- `books` 테이블 채우기

**저장 데이터**:
```typescript
{
  id: "genesis",
  name: "בראשית",
  english_name: "Genesis",
  total_chapters: 50,
  testament: "old",
  category: "Torah",
  category_emoji: "📜"
}
```

---

### Step 2: 히브리어 원문 크롤링

#### 단일 장 크롤링
```bash
npm run bible:crawl genesis 1
```

#### 범위 크롤링
```bash
npm run bible:crawl genesis 1 10
```

#### 전체 크롤링
```bash
npm run bible:crawl genesis
```

**처리 흐름**:
```
1. URL 생성
   https://mechon-mamre.org/p/pt/pt0101.htm

2. Firecrawl API 호출
   → 마크다운 변환

3. 구절 파싱
   | **א** בְּרֵאשִׁית... | **1** In the beginning... |
   ↓
   verse_number: 1
   hebrew: "בְּרֵאשִׁית..."

4. DB 저장 (Upsert)
   verses 테이블에 삽입/업데이트
```

---

### Step 3: 검증

#### 중복 검사
```bash
npm run bible:check-duplicates genesis
```

**확인 항목**:
- ID 중복 (같은 verse_id)
- 히브리어 텍스트 중복

#### 누락 검사
```bash
npm run bible:check-missing genesis
```

**확인 항목**:
- 예상 구절 수 vs 실제 구절 수
- 연속성 (1, 2, 3... 누락 없이)

#### 통합 검증
```bash
npm run bible:verify genesis
```

---

## 📊 저장 데이터 구조

### verses 테이블
```typescript
{
  id: "genesis_1_1",               // ✅ 생성
  book_id: "genesis",              // ✅ 생성
  chapter: 1,                      // ✅ 생성
  verse_number: 1,                 // ✅ 생성
  reference: "창세기 1:1",          // ✅ 생성
  hebrew: "בְּרֵאשִׁית...",        // ✅ 생성 (원문)

  // 아래는 빈 값으로 저장 (컨텐츠 제작 에이전트가 채움)
  ipa: "",                         // ❌ 비워둠
  korean_pronunciation: "",        // ❌ 비워둠
  modern: "",                      // ❌ 비워둠
  literal: null,                   // ❌ 비워둠
  translation: null                // ❌ 비워둠
}
```

**중요**: 크롤링 에이전트는 `hebrew` 필드만 채웁니다!

---

## ⚙️ 설정 및 최적화

### Rate Limiting
`scripts/crawl/crawlBook.ts`:
```typescript
const delayMs = 2000  // 2초 대기
```

- **기본값**: 2초
- **안전하게**: 3-5초 (API 제한 회피)
- **빠르게**: 1초 (주의: Rate Limit 위험)

### Retry 로직
실패 시 자동 재시도 없음 → 수동으로 재크롤링

```bash
# 실패한 장만 다시 크롤링
npm run bible:crawl genesis 5
```

---

## 🐛 문제 해결

### 1. 구절을 찾을 수 없음
```
⚠️ 구절을 찾을 수 없습니다.
```

**원인**: 마크다운 파싱 실패

**해결**:
1. 디버그 스크립트 실행
   ```bash
   npx tsx scripts/debug/testFirecrawl.ts
   ```
2. `debug-markdown.txt` 확인
3. `parseVerses.ts`의 정규표현식 수정

---

### 2. Rate Limit 초과
```
❌ Firecrawl API 에러: 429 - Rate limit exceeded
```

**해결**:
- `delayMs` 증가 (2000 → 5000)
- Firecrawl 플랜 업그레이드

---

### 3. 중복 데이터
```
⚠️ ID 중복: 44개
```

**원인**: 구 형식(하이픈)과 신 형식(언더스코어) 혼재

**해결**:
```bash
npx tsx scripts/utils/deleteOldFormat.ts
```

---

## ✅ 완료 기준

### 성공 조건
```
✅ 총 구절 수 = 예상 구절 수
✅ ID 중복 = 0개
✅ 히브리어 중복 = 0개
✅ 누락 구절 = 0개
```

### Genesis 예시
```
✅ 총 1,533개 구절 (1-50장)
✅ 중복 없음
✅ 누락 없음
```

---

## 📈 성능 지표

### Genesis 전체 크롤링 (1-50장)
- **소요 시간**: 약 2-3분
- **API 호출**: 50회 (장당 1회)
- **저장 구절**: 1,533개
- **비용**: Firecrawl API 무료/유료 플랜 기준

---

## 🔄 다음 단계

크롤링 완료 후:
1. ✅ 검증 실행
2. ✅ 리포트 확인
3. ➡️ **컨텐츠 제작 에이전트로 전달**

**전달 정보**:
- 크롤링된 구절 수
- 검증 결과
- 누락/중복 여부

---

## 📞 인터페이스

### Input
- 책 ID (예: `genesis`)
- 시작 장 (선택)
- 끝 장 (선택)

### Output
- 성공/실패 상태
- 처리된 구절 수
- 에러 목록

### 로그 형식
```
🔄 📚 창세기 크롤링 시작 (1장~50장)
📊 [1/50] 2% - 창세기 1장
✅ 저장 완료: 창세기 1:1
✅ 창세기 1장 완료! (성공: 31, 실패: 0)
...
📊 크롤링 결과
ℹ️  처리된 장: 50/50
ℹ️  총 구절: 1533개
✅ 창세기 크롤링 완료! 🎉
```

---

## 🚫 하지 말아야 할 것

❌ **번역 추가하지 않기**
❌ **발음 생성하지 않기**
❌ **주석 작성하지 않기**
❌ **단어 분석하지 않기**

→ 이것들은 모두 **컨텐츠 제작 에이전트**의 역할입니다!

---

## 📚 참고 문서

- **전체 워크플로우**: `docs/AGENT_WORKFLOW.md`
- **검증 방법**: `docs/WORKFLOW_GUIDE.md`
- **스크립트 구조**: `scripts/crawl/README.md` (필요시 작성)

---

**크롤링 에이전트는 원본 데이터 수집만 담당합니다!**
