# 구절 컨텐츠 생성 가이드 (Supabase + Claude Code)

## 개요

이 문서는 Supabase 데이터베이스의 히브리어 원문을 활용하여 Claude Code에서 **전체 구절 컨텐츠**를 생성하는 방법을 설명합니다.

**생성되는 컨텐츠:**
1. **IPA 발음** - 국제 음성 기호 표기
2. **한글 발음** - 한국인이 읽기 쉬운 발음
3. **현대어 의역** - 자연스러운 한국어 번역
4. **단어 분석 (words)** - 히브리어 단어별 상세 분석
5. **주석 (commentary)** - 신학적 해설 및 질문

**핵심 특징:**
- ✅ **비용 무료**: API 키 불필요 (Claude Code 구독 플랜에 포함)
- ✅ **Supabase 통합**: 히브리어 원문 조회 및 결과 저장
- ✅ **가이드라인 준수**: VERSE_CREATION_GUIDELINES.md 완벽 적용
- ✅ **Claude Haiku 4.5 사용**: 빠르고 정확한 생성
- ✅ **완전한 컨텐츠**: 발음부터 주석까지 한번에 생성

## 아키텍처

```
┌─────────────┐
│  Supabase   │
│   verses    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ generatePrompt  │  ← 1단계: 프롬프트 생성
│    스크립트      │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Claude Code    │  ← 2단계: 컨텐츠 생성 (무료)
│  대화형 생성     │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  JSON 파일      │  ← 3단계: 결과 저장
│ data/generated/ │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  saveVerse      │  ← 4단계: Supabase에 업로드
│    스크립트      │
└─────────────────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
│  - words    │
│  - comments │
│  - sections │
│  - questions│
│  - conclusions│
└─────────────┘
```

## 전체 워크플로우

### 1️⃣ 프롬프트 생성

Supabase에서 **히브리어 원문**을 조회하여 프롬프트를 생성합니다.

```bash
npm run generate:prompt gen2-4
```

**조회하는 정보:**
- `hebrew`: 히브리어 원문 (필수)
- `reference`: 참조 (예: "창세기 2:4")
- `ipa`, `korean_pronunciation`, `modern`: 있으면 표시, 없으면 생성 요청

**출력:**
- 화면에 프롬프트 표시
- `data/prompts/verses-gen2-4.md` 파일 생성

**범위 지정 가능:**
```bash
# 여러 구절
npm run generate:prompt gen2-4,gen2-5,gen2-6

# 범위
npm run generate:prompt gen2-4~gen2-7
```

### 2️⃣ Claude Code에서 생성

생성된 프롬프트를 Claude Code에 붙여넣습니다.

```
(프롬프트 내용을 복사 & 붙여넣기)
```

Claude가 다음 형식의 **완전한 JSON**을 생성합니다:

```json
{
  "verse_id": "gen2-4",
  "ipa": "ʔelˈle toləˈdot haʃaˈmajim vəhaˈʔarɛts bəhibaˈrəʔam",
  "korean_pronunciation": "엘레 톨도트 하샤마임 베하아레츠 베히바레암",
  "modern": "이것이 하늘과 땅이 창조될 때의 내력이니라",
  "words": [
    {
      "hebrew": "אֵלֶּה",
      "meaning": "이것이, 이들이",
      "ipa": "ʔelˈle",
      "korean": "엘레",
      "root": "אֵלֶּה (엘레)",
      "grammar": "지시 대명사 복수",
      "emoji": "👉"
    }
  ],
  "commentary": {
    "intro": "창세기 2:4는...",
    "sections": [...],
    "whyQuestion": {...},
    "conclusion": {...}
  }
}
```

### 3️⃣ JSON 파일로 저장

생성된 JSON을 파일로 저장합니다.

```bash
# data/generated/ 폴더 생성 (없으면)
mkdir -p data/generated

# JSON 저장 (타임스탬프 사용)
# data/generated/verses-1234567890.json
# 또는 verse_id 사용
# data/generated/verses-gen2-4.json
```

**여러 구절을 생성한 경우:**

JSON 배열로 저장합니다:

```json
[
  { "verse_id": "gen2-4", "words": [...], "commentary": {...} },
  { "verse_id": "gen2-5", "words": [...], "commentary": {...} },
  { "verse_id": "gen2-6", "words": [...], "commentary": {...} }
]
```

### 4️⃣ Supabase에 업로드

JSON 파일을 Supabase에 저장합니다.

```bash
npm run save:verse data/generated/verses-gen2-4.json
```

**저장되는 위치:**
1. `verses` 테이블 - IPA, 한글 발음, 현대어 의역 업데이트
2. `words` 테이블 - 단어 분석 저장
3. `commentaries` 테이블 - 주석 intro 저장
4. `commentary_sections` 테이블 - 섹션들 저장
5. `why_questions` 테이블 - 질문과 답변 저장
6. `commentary_conclusions` 테이블 - 결론 저장
7. `word_relations` 테이블 - 관련 단어들 저장

**기존 컨텐츠 덮어쓰기:**

```bash
npm run save:verse data/generated/verses-gen2-4.json --force
```

## 환경 설정

### 필요한 환경 변수

`.env.local` 파일에 다음을 추가하세요:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**참고:** Anthropic API 키는 불필요합니다!

## 사용 예시

### 예시 1: 창세기 2:4 단일 구절 (완전 생성)

Supabase에 히브리어 원문만 있는 경우:

```bash
# 1. 프롬프트 생성
npm run generate:prompt gen2-4

# 출력:
# **창세기 2:4** (ID: gen2-4)
# - Hebrew: אֵלֶּה תוֹלְדוֹת הַשָּׁמַיִם וְהָאָרֶץ בְּהִבָּרְאָם
# - IPA: (생성 필요)
# - Korean Pronunciation: (생성 필요)
# - Modern: (생성 필요)

# 2. 프롬프트를 Claude Code에 붙여넣기
# Claude가 IPA, 한글발음, 현대어 의역, words, commentary 모두 생성

# 3. 생성된 JSON을 저장
# data/generated/verses-gen2-4.json

# 4. Supabase에 업로드 (verses 테이블 포함)
npm run save:verse data/generated/verses-gen2-4.json
```

### 예시 2: 창세기 2:4-7 범위 생성

```bash
# 1. 프롬프트 생성 (4개 구절)
npm run generate:prompt gen2-4~gen2-7

# 2. 프롬프트를 Claude Code에 붙여넣기

# 3. 생성된 JSON 배열을 저장
# (4개 구절의 JSON 배열)

# 4. Supabase에 업로드 (한 번에)
npm run save:verse data/generated/verses-gen2-4-7.json
```

### 예시 3: 기존 컨텐츠 수정

```bash
# 1. 기존 구절의 프롬프트 생성
npm run generate:prompt gen1-1

# 2. Claude Code에서 개선된 컨텐츠 생성

# 3. JSON 저장

# 4. --force로 덮어쓰기
npm run save:verse data/generated/verses-gen1-1.json --force
```

## 생성 컨텐츠 구조

### 기본 정보

| 필드 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `verse_id` | ✅ | 구절 ID | `"gen2-4"` |
| `ipa` | ✅ | IPA 발음 | `"ʔelˈle toləˈdot..."` |
| `korean_pronunciation` | ✅ | 한글 발음 | `"엘레 톨도트 하샤마임..."` |
| `modern` | ✅ | 현대어 의역 | `"이것이 하늘과 땅이 창조될 때의 내력이니라"` |

### words 배열

각 단어는 다음 필드를 포함합니다:

| 필드 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `hebrew` | ✅ | 히브리어 단어 | `"אֵלֶּה"` |
| `meaning` | ✅ | 한국어 의미 | `"이것이, 이들이"` |
| `ipa` | ✅ | IPA 발음 | `"ʔelˈle"` |
| `korean` | ✅ | 한글 발음 | `"엘레"` |
| `root` | ✅ | 어근 (히브리어 + 한글) | `"אֵלֶּה (엘레)"` |
| `grammar` | ✅ | 문법 정보 | `"지시 대명사 복수"` |
| `emoji` | ✅ | 이모지 | `"👉"` |
| `structure` | ❌ | 구조 설명 (선택) | `"지시 대명사의 기본형"` |
| `category` | ❌ | 카테고리 (선택) | `"대명사"` |
| `relatedWords` | ❌ | 관련 단어들 (선택) | `["זֶה (제 - 이것)", "זֹאת (조트 - 이것)"]` |

### commentary 객체

```typescript
{
  intro: string;                  // 서론 (2-3문장)
  sections: CommentarySection[];  // 2-4개 섹션
  whyQuestion: WhyQuestion;       // 어린이를 위한 질문
  conclusion: Conclusion;         // 신학적 의미
}
```

**CommentarySection:**
```typescript
{
  emoji: string;           // "1️⃣", "2️⃣", "3️⃣", "4️⃣"
  title: string;           // "히브리어 (발음) - 설명" 형식 필수!
  description: string;     // 단어/개념 설명 (2-3문장)
  points: string[];        // 핵심 포인트 3-4개
  color: string;           // "purple", "blue", "green", "pink", "orange", "yellow"
}
```

**WhyQuestion:**
```typescript
{
  question: string;         // 어린이를 위한 질문
  answer: string;           // 이해하기 쉬운 답변 (3-5문장)
  bibleReferences: string[]; // "책 장:절 - '인용문'" 형식
}
```

**Conclusion:**
```typescript
{
  title: string;    // 항상 "💡 신학적 의미"
  content: string;  // 신학적 의미 (2-3문장)
}
```

## 가이드라인 체크리스트

생성된 컨텐츠가 다음을 만족하는지 확인하세요:

### 필수 검증 항목

- [ ] 모든 단어에 `emoji`가 있는가?
- [ ] 섹션 제목이 "히브리어 (발음) - 설명" 형식인가?
- [ ] `sections`가 2-4개인가?
- [ ] 각 섹션의 `points`가 3-4개인가?
- [ ] `color`는 유효한 색상인가?
- [ ] `whyQuestion`과 `conclusion`이 있는가?
- [ ] `bibleReferences`가 "책 장:절 - '인용문'" 형식인가?
- [ ] `conclusion.title`이 "💡 신학적 의미"인가?

## 비용 및 성능

### 비용

**완전 무료!** ✅

- Claude Code 구독 플랜에 포함
- 추가 API 비용 없음
- 무제한 생성 가능 (구독 플랜 한도 내)

### 성능

- **단일 구절**: 약 30초 ~ 1분
- **10개 구절**: 약 3-5분
- **Genesis 2장 전체** (25절): 약 10-15분

## 트러블슈팅

### Q1: Supabase 연결 오류

```
❌ 환경 변수가 설정되지 않았습니다.
```

**해결책**: `.env.local`에 Supabase URL과 서비스 롤 키를 추가하세요.

### Q2: 구절을 찾을 수 없음

```
❌ 구절을 찾을 수 없습니다: gen2-100
```

**해결책**: verse_id가 Supabase `verses` 테이블에 존재하는지 확인하세요.

### Q3: JSON 형식 오류

```
❌ JSON 파싱 실패: Unexpected token
```

**해결책**:
1. Claude가 생성한 JSON이 유효한지 확인하세요.
2. 코드 블록(```)을 제거하고 순수 JSON만 저장하세요.
3. JSON validator로 검증하세요.

### Q4: 이미 컨텐츠가 존재함

```
⚠️  이미 컨텐츠가 존재합니다: gen2-4
```

**해결책**: `--force` 플래그를 사용하여 덮어쓰세요.

```bash
npm run save:verse data/generated/verses-gen2-4.json --force
```

## 팁 및 모범 사례

### 1. 배치 처리

여러 구절을 한번에 생성하면 효율적입니다:

```bash
# 좋음: 범위 지정
npm run generate:prompt gen2-1~gen2-25

# 나쁨: 하나씩
npm run generate:prompt gen2-1
npm run generate:prompt gen2-2
...
```

### 2. 백업

JSON 파일을 버전 관리에 포함하지 마세요:

```bash
# .gitignore에 추가
data/generated/*.json
```

### 3. 검증

저장하기 전에 체크리스트로 확인하세요:

```bash
# 1. JSON 유효성 검사
cat data/generated/verses-gen2-4.json | jq .

# 2. 시각적 확인
cat data/generated/verses-gen2-4.json | jq .words[].emoji
```

### 4. 점진적 개선

한번에 완벽하게 만들려 하지 말고:

1. 첫 번째 생성 → 저장
2. 검토 후 개선점 파악
3. 프롬프트에 피드백 추가
4. 재생성 → `--force`로 덮어쓰기

## 참고 자료

- **가이드라인**: `VERSE_CREATION_GUIDELINES.md`
- **예시**: `src/data/verses.ts` (Genesis 1장)
- **데이터베이스**: `src/lib/database.types.ts`
- **프롬프트 예시**: `data/prompts/` 폴더

## FAQ

**Q: API 키가 필요한가요?**
A: 아니요! Claude Code 구독 플랜만 있으면 됩니다.

**Q: 대량 생성이 가능한가요?**
A: 네, 범위 지정으로 한번에 여러 구절을 생성할 수 있습니다.

**Q: 생성 품질이 일관되나요?**
A: VERSE_CREATION_GUIDELINES.md를 따르므로 일관된 품질을 유지합니다.

**Q: Supabase가 아닌 다른 DB를 사용할 수 있나요?**
A: 스크립트를 수정하면 가능합니다. 현재는 Supabase 전용입니다.

**Q: 생성 속도를 높일 수 있나요?**
A: Claude Code는 대화형이므로 속도는 모델에 따라 다릅니다. Haiku 모델이 가장 빠릅니다.

---

**마지막 업데이트**: 2025년 1월
**버전**: 2.0 (API 비용 제거, Supabase 통합)
**모델 권장**: Claude 3.5 Haiku
