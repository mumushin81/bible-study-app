# 🤖 에이전트 기반 성경 데이터베이스 구축 시스템

## 📋 개요

성경 데이터베이스 구축은 **두 가지 전문 에이전트**로 분리하여 자동화합니다:

1. **크롤링 에이전트** - 히브리어 원문 수집 및 저장
2. **컨텐츠 제작 에이전트** - AI 기반 컨텐츠 생성 (Claude 4.5 Haiku)

---

## 🕷️ Agent 1: 크롤링 에이전트

### 역할
히브리어 원문을 웹에서 크롤링하여 Supabase에 저장

### 작업 범위
- ✅ mechon-mamre.org에서 히브리어 원문 크롤링
- ✅ Firecrawl API를 통한 웹 페이지 수집
- ✅ 히브리어 텍스트 파싱 및 구조화
- ✅ Supabase `verses` 테이블에 저장 (hebrew 필드만)
- ✅ 중복/누락 검증

### 사용 도구
- `scripts/crawl/` - 크롤링 스크립트
- `scripts/verify/` - 검증 스크립트
- Firecrawl API
- Supabase Client

### 저장 데이터 구조
```typescript
{
  id: "genesis_1_1",
  book_id: "genesis",
  chapter: 1,
  verse_number: 1,
  reference: "창세기 1:1",
  hebrew: "בְּרֵאשִׁית, בָּרָא...",
  // 아래 필드는 빈 문자열
  ipa: "",
  korean_pronunciation: "",
  modern: "",
  literal: null,
  translation: null
}
```

### 실행 명령어
```bash
# Books 테이블 초기화
npm run bible:init

# 책 전체 크롤링
npm run bible:crawl genesis

# 검증
npm run bible:verify genesis
```

---

## 🤖 Agent 2: 컨텐츠 제작 에이전트

### 역할
Claude 4.5 Haiku 모델을 사용하여 구절 컨텐츠를 자동 생성

### 사용 AI 모델
- **Claude 4.5 Haiku** (빠르고 경제적)
- Anthropic API

### 작업 범위

#### 생성 항목
1. **IPA 발음** - 국제 음성 기호
2. **한글 발음** - 한국인이 읽기 쉬운 발음
3. **현대어 번역** - 자연스러운 한국어 의역
4. **단어 분석** - 히브리어 단어별 상세 분석
5. **주석** - 신학적 해설 및 어린이 Q&A

#### 처리 프로세스
```
1. Supabase에서 원문만 있는 구절 조회
   └─ WHERE ipa = '' OR korean_pronunciation = ''

2. Claude 4.5 Haiku API 호출
   └─ 프롬프트: VERSE_CREATION_GUIDELINES.md
   └─ 입력: 히브리어 원문
   └─ 출력: JSON 형식 컨텐츠

3. 데이터 검증
   └─ 필수 필드 존재 확인
   └─ IPA 포맷 검증
   └─ 단어 개수 합리성 체크

4. Supabase 저장
   └─ verses 테이블 업데이트
   └─ words 테이블 삽입
   └─ commentaries 관련 테이블 삽입
```

### 저장 데이터 구조

#### verses 테이블 업데이트
```typescript
{
  ipa: "bəreʃit baˈra ʔɛloˈhim...",
  korean_pronunciation: "베레쉬트 바라 엘로힘...",
  modern: "태초에 하나님께서 하늘과 땅을 창조하셨습니다",
  literal: "...",
  translation: "..."
}
```

#### words 테이블 삽입
```typescript
{
  verse_id: "genesis_1_1",
  position: 0,
  hebrew: "בְּרֵאשִׁית",
  meaning: "처음에, 태초에",
  ipa: "bəreʃit",
  korean: "베레쉬트",
  root: "רֵאשִׁית (레쉬트)",
  grammar: "전치사 בְּ + 명사",
  structure: "...",
  emoji: "🌅",
  category: "noun"
}
```

#### commentaries 테이블 삽입
```typescript
{
  verse_id: "genesis_1_1",
  intro: "창세기 1장 1절은..."
}
```

#### commentary_sections 삽입
```typescript
{
  commentary_id: "...",
  position: 0,
  emoji: "1️⃣",
  title: "בְּרֵאשִׁית (베레쉬트)",
  description: "...",
  points: ["...", "..."],
  color: "purple"
}
```

#### why_questions 삽입
```typescript
{
  commentary_id: "...",
  question: "왜 하나님은...",
  answer: "...",
  bible_references: ["창세기 2:1", "요한복음 1:1"]
}
```

#### commentary_conclusions 삽입
```typescript
{
  commentary_id: "...",
  title: "💡 신학적 의미",
  content: "..."
}
```

---

## 🔄 전체 워크플로우

### Step 1: 원문 크롤링 (크롤링 에이전트)
```bash
# 1. Books 초기화
npm run bible:init

# 2. Genesis 크롤링
npm run bible:crawl genesis

# 3. 검증
npm run bible:verify genesis
```

**결과**: 1,533개 구절 (히브리어 원문만)

---

### Step 2: 컨텐츠 생성 (컨텐츠 제작 에이전트)
```bash
# 4. 컨텐츠 생성 (예정)
npm run generate:content genesis

# 또는 배치 처리
npm run generate:batch genesis 1 10
```

**처리 과정**:
1. DB에서 빈 구절 조회 (1,533개)
2. Claude 4.5 Haiku로 배치 처리 (10-20개씩)
3. 생성된 JSON 검증
4. DB에 저장
5. 진행 상황 로그

**예상 시간**:
- 구절당 5-10초
- 1,533개 구절 = 약 2-3시간

---

## 💰 비용 최적화

### Claude 4.5 Haiku 선택 이유
- **빠른 속도** - 구절당 5-10초
- **저렴한 비용** - Sonnet 대비 1/10 수준
- **충분한 품질** - 구조화된 JSON 생성에 최적

### 예상 비용 (Genesis 전체)
```
입력: 1,533개 구절 × 500 토큰 = 766,500 토큰
출력: 1,533개 구절 × 2,000 토큰 = 3,066,000 토큰

Haiku 요금 (2024):
- Input: $0.25 / 1M tokens
- Output: $1.25 / 1M tokens

총 비용:
- Input: $0.19
- Output: $3.83
- 합계: ~$4.00
```

---

## 📊 진행 상황 추적

### 데이터베이스 쿼리로 확인
```sql
-- 전체 진행 상황
SELECT
  book_id,
  COUNT(*) as total_verses,
  COUNT(CASE WHEN ipa != '' THEN 1 END) as with_ipa,
  COUNT(CASE WHEN korean_pronunciation != '' THEN 1 END) as with_korean,
  ROUND(COUNT(CASE WHEN ipa != '' THEN 1 END) * 100.0 / COUNT(*), 1) as completion_rate
FROM verses
GROUP BY book_id;

-- 컨텐츠가 없는 구절 개수
SELECT COUNT(*)
FROM verses
WHERE ipa = '' OR korean_pronunciation = '' OR modern = '';

-- 단어 분석이 없는 구절
SELECT v.id, v.reference
FROM verses v
LEFT JOIN words w ON v.id = w.verse_id
WHERE w.id IS NULL
LIMIT 10;

-- 주석이 없는 구절
SELECT v.id, v.reference
FROM verses v
LEFT JOIN commentaries c ON v.id = c.verse_id
WHERE c.id IS NULL
LIMIT 10;
```

---

## 🎯 에이전트 분리의 장점

### 1. 명확한 책임 분리
- **크롤링**: 원본 데이터 수집만 담당
- **컨텐츠 제작**: AI 생성만 담당

### 2. 독립적 실행
- 크롤링 완료 후 컨텐츠 제작 가능
- 컨텐츠 재생성 시 크롤링 불필요

### 3. 오류 격리
- 크롤링 실패 ≠ 컨텐츠 제작 실패
- 각 에이전트 독립적으로 재시도

### 4. 확장성
- 크롤링: 다른 소스 추가 가능
- 컨텐츠 제작: 다른 AI 모델 교체 가능

### 5. 비용 최적화
- 크롤링: API 호출 최소화
- 컨텐츠 제작: 저렴한 Haiku 모델 사용

---

## 🚀 다음 단계

### 우선순위 1: 컨텐츠 제작 에이전트 구현
```bash
scripts/generate/
├── index.ts                  # 메인 진입점
├── fetchEmptyVerses.ts      # 빈 구절 조회
├── generateWithClaude.ts    # Claude API 호출
├── validateContent.ts       # 컨텐츠 검증
├── saveToDatabase.ts        # DB 저장
└── batchProcessor.ts        # 배치 처리
```

### 우선순위 2: 모니터링 도구
```bash
scripts/monitor/
├── checkProgress.ts         # 진행 상황 확인
├── estimateCost.ts          # 비용 추정
└── generateReport.ts        # 리포트 생성
```

---

## 📝 참고 문서

- **크롤링**: `docs/WORKFLOW_GUIDE.md`
- **검증**: `scripts/verify/`
- **컨텐츠 가이드라인**: `VERSE_CREATION_GUIDELINES.md`
- **프롬프트**: `data/prompts/`

---

## ✅ 체크리스트

### 크롤링 에이전트
- [x] Books 테이블 초기화
- [x] Genesis 1-50장 크롤링 완료
- [x] 중복/누락 검증 완료
- [x] 1,533개 구절 DB 저장 완료

### 컨텐츠 제작 에이전트
- [ ] Claude 4.5 Haiku API 통합
- [ ] 배치 처리 시스템 구현
- [ ] 컨텐츠 검증 로직 구현
- [ ] DB 저장 로직 구현
- [ ] Genesis 전체 컨텐츠 생성

---

**이 문서는 에이전트 기반 자동화 시스템의 마스터 가이드입니다.**
