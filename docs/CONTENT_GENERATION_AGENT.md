# 🤖 컨텐츠 제작 에이전트 지침서 (수동 워크플로우)

## 📋 에이전트 정의

**역할**: Supabase 데이터베이스에서 히브리어 원문을 조회하여 사용자가 직접 컨텐츠를 제작하도록 돕는 전문 에이전트

**작업 방식**: API 자동화 없이 수동 워크플로우 (Claude Code와 협업)

**책임 범위**:
- ✅ IPA 발음 생성 (사용자가 작성)
- ✅ 한글 발음 생성 (사용자가 작성)
- ✅ 현대어 의역 생성 (사용자가 작성)
- ✅ 단어 분석 (words 테이블) (사용자가 작성)
- ✅ 주석 (commentaries 관련 테이블) (사용자가 작성)
- ❌ 히브리어 원문 수집 (크롤링 에이전트 담당)

---

## 🎯 목표

1. **정확성**: 히브리어 문법과 신학적 정확성 보장
2. **일관성**: 모든 구절에 동일한 구조와 품질 유지
3. **품질**: 사용자가 직접 검토하고 수정 가능
4. **완전성**: 모든 필수 필드 생성

---

## 🔧 사용 도구

### 1. Supabase 조회 스크립트
```bash
npm run generate:prompt <bookId> [chapter] [limit]
```
- Supabase에서 빈 구절 조회
- 히브리어 원문 표시
- Claude Code용 프롬프트 생성

### 2. Claude Code (사용자)
- 생성된 프롬프트를 사용하여 컨텐츠 작성
- VERSE_CREATION_GUIDELINES.md 참고
- JSON 형식으로 출력

### 3. Supabase 저장 스크립트
```bash
npm run save:content -- <json_file> [--force]
```
- JSON 파일 읽기
- 컨텐츠 검증
- 여러 테이블에 저장

### 4. 스크립트 구조
```
scripts/generate/
├── index.ts                  # 워크플로우 안내
├── types.ts                  # 타입 정의
├── fetchEmptyVerses.ts      # 빈 구절 조회
├── generatePrompt.ts        # 프롬프트 생성
├── validateContent.ts       # 컨텐츠 검증
├── saveToDatabase.ts        # DB 저장
└── saveFromJson.ts          # JSON → DB 저장
```

---

## 📝 작업 프로세스

### Step 1: 빈 구절 조회 및 프롬프트 생성

```bash
npm run generate:prompt genesis 2 4
```

**실행 결과**:
1. Supabase에서 4개 빈 구절 조회
2. 히브리어 원문 표시
3. 프롬프트 생성 및 출력
4. `data/prompts/` 폴더에 .md 파일 저장

**출력 예시**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 구절 컨텐츠 생성 요청 (수동 워크플로우)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 생성 대상 구절

**창세기 2:4** (ID: genesis_2_4)
- Hebrew: אֵלֶּה תוֹלְדוֹת הַשָּׁמַיִם וְהָאָרֶץ...

**창세기 2:5** (ID: genesis_2_5)
...

## 작업 요청
다음 구절들에 대해 전체 컨텐츠를 생성해주세요...
```

---

### Step 2: 프롬프트 복사

출력된 프롬프트를 복사합니다:
- 터미널에서 전체 선택 후 복사
- 또는 `data/prompts/*.md` 파일 열어서 복사

---

### Step 3: Claude Code에 붙여넣기

1. Claude Code에 프롬프트 붙여넣기
2. VERSE_CREATION_GUIDELINES.md를 참고하여 컨텐츠 생성
3. JSON 형식으로 출력받기

**생성 예시**:
```json
{
  "verseId": "genesis_2_4",
  "ipa": "ˈʔelɛ toləˈdot haʃaˈmajim vəhaˈʔarɛts",
  "koreanPronunciation": "엘레 톨도트 하샤마임 베하아레츠",
  "modern": "이것은 하늘과 땅이 창조될 때의 내력입니다",
  "words": [
    {
      "hebrew": "אֵלֶּה",
      "meaning": "이것, 이들",
      "ipa": "ˈʔelɛ",
      "korean": "엘레",
      "root": "אֵלֶּה (엘레)",
      "grammar": "지시 대명사 복수형",
      "emoji": "👉"
    }
    // ... 더 많은 단어들
  ],
  "commentary": {
    "intro": "창세기 2장 4절은...",
    "sections": [
      {
        "emoji": "1️⃣",
        "title": "תוֹלְדוֹת (톨도트) - 세대, 내력",
        "description": "...",
        "points": ["...", "...", "..."],
        "color": "purple"
      }
    ],
    "whyQuestion": {
      "question": "왜 하나님은...",
      "answer": "...",
      "bibleReferences": ["..."]
    },
    "conclusion": {
      "title": "💡 신학적 의미",
      "content": "..."
    }
  }
}
```

---

### Step 4: JSON 파일 저장

생성된 JSON을 `data/generated/` 폴더에 저장:

```bash
# 폴더 생성 (없는 경우)
mkdir -p data/generated

# 파일 저장 (예시)
# data/generated/genesis_2_4to7.json
```

**파일 명명 규칙**:
- `{bookId}_{chapter}_{timestamp}.json`
- 예: `genesis_2_1735000000.json`

---

### Step 5: Supabase에 저장

```bash
npm run save:content -- data/generated/genesis_2_4to7.json
```

**실행 과정**:
1. JSON 파일 읽기
2. 각 구절 검증 (validateContent.ts)
3. DB 저장 (saveToDatabase.ts)
   - `verses` 테이블 업데이트
   - `words` 테이블 삽입
   - `commentaries` 삽입
   - `commentary_sections` 삽입
   - `why_questions` 삽입
   - `commentary_conclusions` 삽입

**출력 예시**:
```
🔄 [1/4] genesis_2_4 처리 중...
✅ genesis_2_4: 검증 통과
✅ DB 저장 완료: genesis_2_4

🔄 [2/4] genesis_2_5 처리 중...
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
최종 결과
✅ 성공: 4/4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 💾 저장 데이터 구조

### verses 테이블 업데이트
```sql
UPDATE verses SET
  ipa = '...',
  korean_pronunciation = '...',
  modern = '...',
  literal = '...',
  translation = '...'
WHERE id = 'genesis_2_4'
```

### words 테이블 삽입
```sql
INSERT INTO words (verse_id, position, hebrew, meaning, ipa, korean, root, grammar, emoji, structure, category)
VALUES ('genesis_2_4', 0, 'אֵלֶּה', '이것', 'ˈʔelɛ', '엘레', 'אֵלֶּה (엘레)', '지시 대명사', '👉', NULL, NULL)
```

### commentaries 테이블 삽입
```sql
INSERT INTO commentaries (verse_id, intro)
VALUES ('genesis_2_4', '창세기 2장 4절은...')
```

### commentary_sections 삽입
```sql
INSERT INTO commentary_sections (commentary_id, position, emoji, title, description, points, color)
VALUES (..., 0, '1️⃣', 'תוֹלְדוֹת (톨도트) - 세대', '...', ARRAY['...'], 'purple')
```

### why_questions 삽입
```sql
INSERT INTO why_questions (commentary_id, question, answer, bible_references)
VALUES (..., '왜...', '...', ARRAY['...'])
```

### commentary_conclusions 삽입
```sql
INSERT INTO commentary_conclusions (commentary_id, title, content)
VALUES (..., '💡 신학적 의미', '...')
```

---

## ⚙️ 설정 및 옵션

### --force 플래그
기존 컨텐츠를 덮어쓰기:

```bash
npm run save:content -- data/generated/genesis_2_4to7.json --force
```

**기본 동작 (force 없음)**:
- 기존 컨텐츠가 있으면 건너뜀
- 새 구절만 저장

**force 모드**:
- 기존 데이터 삭제
- 새 데이터로 완전 교체

---

## 🔍 검증 시스템

### validateContent.ts
자동 검증 항목:

#### 필수 필드 검증
- verseId
- ipa
- koreanPronunciation
- modern
- words (배열, 최소 1개)
- commentary (intro, sections, whyQuestion, conclusion)

#### 형식 검증
- 섹션 제목: "히브리어 (한글 발음) - 설명" 형식
- root: "히브리어 (한글)" 형식
- bibleReferences: "책 장:절 - '인용문'" 형식
- conclusion.title: 정확히 "💡 신학적 의미"

#### 범위 검증
- 섹션 수: 2-4개
- 단어 수: 2-20개
- points 개수: 2-5개
- bibleReferences: 2-5개

#### 색상 검증
- 유효한 색상: purple, blue, green, pink, orange, yellow
- 색상 중복 경고

**검증 결과 출력**:
```
✅ genesis_2_4: 검증 통과

  경고:
    - sections[1]: points 개수가 적절하지 않습니다 (2개, 권장: 3-4개)
```

---

## 🐛 문제 해결

### 1. JSON 파싱 실패
```
❌ JSON 파싱 실패: Unexpected token
```

**해결**:
- JSON 형식 확인 (괄호, 쉼표, 따옴표)
- 온라인 JSON validator 사용
- Claude Code에 "유효한 JSON만 출력" 요청

---

### 2. 검증 실패
```
❌ genesis_2_4: 검증 실패
  오류:
    - sections[0]: title에 히브리어가 없습니다
```

**해결**:
- 오류 메시지 확인
- VERSE_CREATION_GUIDELINES.md 재확인
- Claude Code에 수정 요청

---

### 3. DB 저장 실패
```
❌ DB 저장 실패: foreign key constraint
```

**해결**:
- verse_id가 verses 테이블에 존재하는지 확인
- Supabase 콘솔에서 데이터 확인

---

## ✅ 완료 기준

### 성공 조건
```
✅ JSON 파싱 성공
✅ 검증 통과 (오류 0개)
✅ DB 저장 완료
✅ 모든 테이블에 데이터 삽입됨
```

### 확인 방법
```sql
-- verses 업데이트 확인
SELECT id, ipa, korean_pronunciation, modern
FROM verses
WHERE id = 'genesis_2_4';

-- words 삽입 확인
SELECT COUNT(*) FROM words WHERE verse_id = 'genesis_2_4';

-- commentaries 삽입 확인
SELECT COUNT(*) FROM commentaries WHERE verse_id = 'genesis_2_4';
```

---

## 📈 성능 지표

### Genesis 전체 (1,533 구절)
- **예상 시간**: 사용자 작업 속도에 따라 다름
- **예상 비용**: $0 (Claude Code 구독에 포함)
- **처리 방식**: 배치 단위 (4-10개씩 권장)

### 권장 배치 크기
- **테스트**: 1-2개 구절
- **일반 작업**: 4-10개 구절
- **대량 작업**: 10-20개 구절

---

## 🔄 다음 단계

컨텐츠 생성 완료 후:
1. ✅ Supabase 콘솔에서 데이터 확인
2. ✅ 프론트엔드에서 표시 확인
3. ➡️ **다음 배치 처리**

---

## 📞 인터페이스

### 입력
- 책 ID (예: `genesis`)
- 장 번호 (선택)
- 개수 제한 (선택)

### 출력
- 프롬프트 (터미널 + 파일)
- 검증 결과
- DB 저장 성공/실패

### 로그 형식
```
🔄 빈 구절 조회 중...
✅ 4개 구절 찾음

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 구절 컨텐츠 생성 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
```

---

## 🚫 주의사항

❌ **API 키 불필요** - Claude Code 사용 (무료)
❌ **자동화 없음** - 사용자가 직접 작성
✅ **품질 우선** - 사용자가 검토 가능
✅ **비용 절감** - API 비용 0원

---

## 📚 참고 문서

- **전체 워크플로우**: `docs/AGENT_WORKFLOW.md`
- **품질 기준**: `VERSE_CREATION_GUIDELINES.md`
- **크롤링**: `docs/CRAWLING_AGENT.md`

---

**컨텐츠 제작 에이전트는 사용자와 Claude Code가 협업하여 고품질 컨텐츠를 생성합니다!**
