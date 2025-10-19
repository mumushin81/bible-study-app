# 창세기 전체 마이그레이션 계획 (Phase 3)

## 📊 현황 분석

### 현재 상태
- ✅ **완료**: 창세기 1장 (31개 구절)
- ⏳ **남은 작업**: 창세기 2-50장 (약 1,502개 구절)
- 📦 **데이터 크기**: 구절당 평균 130-170줄 (약 250KB)

### 데이터 구조
각 구절마다 다음 데이터 필요:
```typescript
{
  id: 'gen2-1',
  reference: '창세기 2:1',
  hebrew: 'וַיְכֻלּוּ הַשָּׁמַיִם...',        // 히브리어 원문
  ipa: 'vajəxulu haʃaˈmajim...',          // IPA 발음
  koreanPronunciation: '바예쿨루 하샤마임...', // 한글 발음
  modern: '하늘과 땅과...',                 // 현대어 번역
  words: [...],                           // 단어 분석 (5-15개)
  commentary: {
    intro: '...',                         // 주석 서론
    sections: [...],                      // 해설 섹션 (2-3개)
    whyQuestion: {...},                   // 어린이 질문
    conclusion: {...}                     // 신학적 결론
  }
}
```

### 예상 작업량
- **총 구절 수**: ~1,502개
- **총 단어 수**: ~15,000개 (구절당 평균 10개)
- **총 주석**: ~1,502개 세트
- **예상 데이터 크기**: ~375MB (원시 TypeScript)

---

## 🎯 마이그레이션 전략

### 옵션 1: 수동 데이터 입력 (비추천)
- ❌ **예상 시간**: 6-12개월
- ❌ **품질**: 오타, 일관성 문제
- ❌ **확장성**: 다른 책으로 확장 어려움

### 옵션 2: 기존 데이터 변환 (제한적)
- ⚠️ **히브리어 원문**: 공개 API 활용 가능
- ❌ **단어 분석**: 기존 데이터 없음
- ❌ **주석**: 기존 데이터 없음

### ✅ 옵션 3: 하이브리드 접근 (권장)
**1단계: 원문 데이터 수집**
- 히브리어 원문: API/DB 활용
- IPA 발음: AI 생성 + 검증

**2단계: AI 기반 콘텐츠 생성**
- 단어 분석: Claude API
- 주석 해설: Claude API
- 품질 검증: 수동 검토

**3단계: 점진적 마이그레이션**
- 장별 진행 (2-3장씩)
- 검증 후 DB 업로드

---

## 📝 구체적 실행 계획

## Part 1: 원문 데이터 수집

### 1.1 히브리어 원문 소스

#### 옵션 A: Sefaria API (추천)
- **장점**: 무료, 공개, REST API
- **단점**: 히브리어만 제공 (발음 없음)
- **URL**: `https://www.sefaria.org/api/texts/Genesis.2`

**예시 요청**:
```bash
curl "https://www.sefaria.org/api/texts/Genesis.2?lang=he"
```

**응답 구조**:
```json
{
  "text": [
    "וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל־צְבָאָם׃",
    "וַיְכַל אֱלֹהִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ..."
  ],
  "he": [...],
  "sections": [2],
  "toSections": [2]
}
```

#### 옵션 B: OpenScriptures Hebrew Bible
- **장점**: 형태소 분석 포함
- **단점**: XML 형식, 복잡
- **URL**: `https://github.com/openscriptures/morphhb`

#### 옵션 C: Tanach.us API
- **장점**: 구절별 접근 쉬움
- **단점**: 문서화 부족

**✅ 결정: Sefaria API 사용**

### 1.2 데이터 수집 스크립트

**scripts/fetchGenesisText.ts** 작성:
```typescript
import axios from 'axios';
import * as fs from 'fs';

interface SefariaVerse {
  text: string;      // 히브리어 원문
  ref: string;       // 참조 (Genesis 2:1)
}

async function fetchChapter(chapter: number) {
  const url = `https://www.sefaria.org/api/texts/Genesis.${chapter}`;
  const params = { lang: 'he', commentary: 0 };

  const response = await axios.get(url, { params });
  const verses = response.data.he;

  return verses.map((text: string, index: number) => ({
    id: `gen${chapter}-${index + 1}`,
    reference: `창세기 ${chapter}:${index + 1}`,
    hebrew: text,
    chapter,
    verseNumber: index + 1
  }));
}

async function fetchAllGenesis() {
  const allVerses = [];

  for (let chapter = 2; chapter <= 50; chapter++) {
    console.log(`📖 창세기 ${chapter}장 가져오는 중...`);
    const verses = await fetchChapter(chapter);
    allVerses.push(...verses);

    // API rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // JSON으로 저장
  fs.writeFileSync(
    'data/genesis-raw.json',
    JSON.stringify(allVerses, null, 2)
  );

  console.log(`✅ 총 ${allVerses.length}개 구절 수집 완료`);
}

fetchAllGenesis();
```

### 1.3 발음 데이터 생성

**방법 1: 규칙 기반 변환** (기본)
- 히브리어 → IPA 변환 라이브러리
- 정확도: ~80%
- 라이브러리: `hebrew-transliteration`

**방법 2: AI 생성** (보조)
- Claude API로 IPA 생성
- 품질: 높음
- 비용: 구절당 ~$0.001

**✅ 결정: 규칙 기반 + AI 검증**

---

## Part 2: 단어/해설 생성 전략

### 2.1 단어 분석 생성

#### AI 프롬프트 설계

**입력**:
```
히브리어 구절: וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ
참조: 창세기 2:1
```

**프롬프트**:
```
다음 히브리어 구절을 단어별로 분석해주세요.

구절: {hebrew}
참조: {reference}

각 단어마다 다음 형식으로 JSON 배열을 반환하세요:
[
  {
    "hebrew": "וַיְכֻלּוּ",
    "meaning": "완성되었다",
    "ipa": "vajəxulu",
    "korean": "바예쿨루",
    "root": "כ-ל-ה (칼라)",
    "grammar": "동사 Qal 수동태 3인칭 복수",
    "structure": "접속사 וַ + 동사 יְכֻלּוּ"
  },
  ...
]

주의사항:
1. 모든 단어를 개별 분석
2. 정확한 어근(root) 제시
3. 문법 형태 명시
4. IPA는 Tiberian Hebrew 기준
```

#### 배치 처리

**scripts/generateWordAnalysis.ts**:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeVerse(verse: { hebrew: string, reference: string }) {
  const prompt = `다음 히브리어 구절을 단어별로 분석해주세요...`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const json = extractJSON(content.text);
    return json;
  }
}

async function batchProcess(verses: any[], batchSize = 10) {
  const results = [];

  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);
    console.log(`📊 ${i + 1}-${i + batch.length}번 구절 처리 중...`);

    const batchResults = await Promise.all(
      batch.map(v => analyzeVerse(v))
    );

    results.push(...batchResults);

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}
```

**예상 비용**:
- 1,502 구절 × $0.003 = **~$4.50**
- 총 소요 시간: ~2-3시간

### 2.2 주석 해설 생성

#### 템플릿 설계

**프롬프트 구조**:
```
역할: 당신은 히브리어 성경 전문가이자 신학 교육자입니다.

구절: {hebrew}
번역: {modern}
단어 분석: {words}

다음 형식으로 주석을 작성해주세요:

1. **서론** (intro): 구절의 문맥과 중요성 (100-150자)

2. **해설 섹션** (sections): 2-3개
   - emoji: 이모지 선택
   - title: 핵심 히브리어 단어 + 의미
   - description: 상세 설명 (150-200자)
   - points: 3가지 핵심 포인트
   - color: purple/blue/green 중 선택

3. **어린이 질문** (whyQuestion):
   - question: "왜 ~일까요?"
   - answer: 초등학생이 이해할 수 있는 답변 (200자)
   - bibleReferences: 관련 성경 구절 3개

4. **신학적 결론** (conclusion):
   - title: 💡 신학적 의미
   - content: 그리스도 중심적 해석 (150자)

JSON 형식으로 반환하세요.
```

**scripts/generateCommentary.ts**:
```typescript
async function generateCommentary(verse: VerseWithWords) {
  const prompt = buildCommentaryPrompt(verse);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 6000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseCommentaryJSON(message);
}
```

**예상 비용**:
- 1,502 구절 × $0.005 = **~$7.50**
- 총 소요 시간: ~3-4시간

### 2.3 품질 관리

#### 자동 검증
```typescript
function validateVerse(verse: Verse): ValidationResult {
  const errors = [];

  // 필수 필드 확인
  if (!verse.hebrew) errors.push('히브리어 원문 없음');
  if (!verse.words || verse.words.length === 0) errors.push('단어 분석 없음');

  // 데이터 품질 확인
  if (verse.words.some(w => !w.root)) errors.push('어근 정보 누락');
  if (!verse.commentary.whyQuestion) errors.push('질문 없음');

  // 길이 검증
  if (verse.commentary.intro.length < 50) errors.push('서론 너무 짧음');

  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### 수동 검토
- 각 장마다 샘플 5개 구절 검토
- 신학적 정확성 확인
- 오타, 번역 오류 수정

---

## Part 3: 마이그레이션 실행

### 3.1 단계별 진행 계획

#### Phase 3.1: 파일럿 테스트 (1주)
- **범위**: 창세기 2-3장 (약 50개 구절)
- **목표**: 프로세스 검증, 품질 확인
- **산출물**:
  - `data/genesis-ch2.json`
  - `data/genesis-ch3.json`
  - 품질 리포트

#### Phase 3.2: 배치 1 - 창조와 족장 시대 (2주)
- **범위**: 창세기 4-11장 (약 190개 구절)
- **내용**: 가인과 아벨, 노아 홍수, 바벨탑
- **검증**: 중간 품질 검토

#### Phase 3.3: 배치 2 - 아브라함 (2주)
- **범위**: 창세기 12-25장 (약 370개 구절)
- **내용**: 아브라함 언약, 소돔과 고모라, 이삭 탄생

#### Phase 3.4: 배치 3 - 야곱과 요셉 (2주)
- **범위**: 창세기 26-50장 (약 890개 구절)
- **내용**: 야곱 이야기, 요셉 이야기

### 3.2 마이그레이션 스크립트

**scripts/migrateGenesisPhase3.ts**:
```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateChapter(chapterNumber: number) {
  console.log(`\n📖 창세기 ${chapterNumber}장 마이그레이션 시작...`);

  // 1. 원문 로드
  const rawData = JSON.parse(
    fs.readFileSync(`data/genesis-ch${chapterNumber}.json`, 'utf-8')
  );

  // 2. 검증
  const validationResults = rawData.map(validateVerse);
  const invalid = validationResults.filter(r => !r.valid);

  if (invalid.length > 0) {
    console.error(`❌ ${invalid.length}개 구절 검증 실패`);
    return;
  }

  // 3. DB 업로드
  for (const verse of rawData) {
    // 3.1 구절 삽입
    const { data: verseData, error: verseError } = await supabase
      .from('verses')
      .insert({
        id: verse.id,
        book_id: 'genesis',
        chapter: chapterNumber,
        verse_number: verse.verseNumber,
        hebrew: verse.hebrew,
        ipa: verse.ipa,
        korean_pronunciation: verse.koreanPronunciation,
        modern_translation: verse.modern
      })
      .select()
      .single();

    if (verseError) throw verseError;

    // 3.2 단어 삽입 (배치)
    const wordsData = verse.words.map((w: any) => ({
      verse_id: verse.id,
      hebrew: w.hebrew,
      meaning: w.meaning,
      ipa: w.ipa,
      korean: w.korean,
      root: w.root,
      grammar: w.grammar,
      structure: w.structure
    }));

    const { error: wordsError } = await supabase
      .from('words')
      .insert(wordsData);

    if (wordsError) throw wordsError;

    // 3.3 주석 삽입
    const { data: commentaryData, error: commentaryError } = await supabase
      .from('commentaries')
      .insert({
        verse_id: verse.id,
        intro: verse.commentary.intro
      })
      .select()
      .single();

    if (commentaryError) throw commentaryError;

    // 3.4 주석 섹션, 질문, 결론 삽입
    // ... (이전 마이그레이션 스크립트와 동일)
  }

  console.log(`✅ 창세기 ${chapterNumber}장 완료`);
}

async function migratePhase(startChapter: number, endChapter: number) {
  for (let ch = startChapter; ch <= endChapter; ch++) {
    await migrateChapter(ch);
  }
}

// Phase 3.1 실행
migratePhase(2, 3);
```

### 3.3 모니터링 및 롤백

**진행 상황 추적**:
```typescript
async function getMigrationProgress() {
  const { data, error } = await supabase
    .from('verses')
    .select('chapter, count(*)')
    .eq('book_id', 'genesis')
    .groupBy('chapter')
    .order('chapter');

  console.log('📊 마이그레이션 진행 상황:');
  data?.forEach(row => {
    console.log(`  창세기 ${row.chapter}장: ${row.count}개 구절`);
  });
}
```

**롤백 스크립트**:
```typescript
async function rollbackChapter(chapter: number) {
  console.log(`⏪ 창세기 ${chapter}장 롤백...`);

  // 구절 삭제 (CASCADE로 자동 삭제됨)
  await supabase
    .from('verses')
    .delete()
    .eq('book_id', 'genesis')
    .eq('chapter', chapter);

  console.log(`✅ 롤백 완료`);
}
```

---

## 📊 예상 리소스

### 시간
- **개발**: 1주 (스크립트 작성 + 테스트)
- **데이터 생성**: 2-3일 (AI 처리)
- **검증**: 1주 (품질 검토)
- **마이그레이션**: 1-2일 (DB 업로드)
- **총 소요**: **3-4주**

### 비용
- **API 호출** (Claude):
  - 단어 분석: ~$4.50
  - 주석 생성: ~$7.50
  - 발음 생성: ~$2.00
  - **총 AI 비용: ~$14**

- **인프라**:
  - Supabase: 무료 (1GB 이내)
  - 개발 환경: 기존 사용

- **총 비용: ~$14**

### 저장 공간
- **Supabase DB**:
  - 구절: ~1,502 rows × 1KB = 1.5MB
  - 단어: ~15,000 rows × 0.5KB = 7.5MB
  - 주석: ~1,502 × 2KB = 3MB
  - **총: ~12MB** (무료 플랜 충분)

---

## ✅ 실행 체크리스트

### 준비 단계
- [ ] Sefaria API 테스트
- [ ] Claude API 키 확인
- [ ] 히브리어 → IPA 변환 라이브러리 설치
- [ ] 데이터 검증 스크립트 작성
- [ ] 샘플 데이터 생성 (창세기 2:1)

### Phase 3.1: 파일럿 (창세기 2-3장)
- [ ] 원문 수집 스크립트 실행
- [ ] AI 단어 분석 생성
- [ ] AI 주석 생성
- [ ] 품질 검증 (샘플 10개)
- [ ] DB 마이그레이션
- [ ] 프론트엔드 테스트

### Phase 3.2-3.4: 전체 마이그레이션
- [ ] 배치 1 (4-11장) 완료
- [ ] 배치 2 (12-25장) 완료
- [ ] 배치 3 (26-50장) 완료
- [ ] 전체 품질 검토
- [ ] 프로덕션 배포

### 최종 검증
- [ ] 모든 구절 DB 확인 (1,533개)
- [ ] UI에서 랜덤 구절 테스트
- [ ] 성능 테스트 (로딩 속도)
- [ ] 정적 데이터 제거
- [ ] 문서 업데이트

---

## 🚀 다음 단계

### 즉시 실행 가능한 작업

1. **환경 설정**:
```bash
npm install axios @anthropic-ai/sdk
mkdir -p data scripts
```

2. **API 테스트**:
```bash
npx tsx scripts/fetchGenesisText.ts
```

3. **샘플 생성** (창세기 2:1):
```bash
npx tsx scripts/generateSample.ts
```

### 사용자 결정 필요

다음 중 어떤 방식으로 진행할까요?

**옵션 A: 완전 자동화** (추천)
- AI로 모든 콘텐츠 생성
- 빠른 진행 (3-4주)
- 비용: ~$14
- 품질: 높음 (90%+)

**옵션 B: 반자동화**
- 원문만 자동 수집
- 단어/주석은 수동 작성
- 느린 진행 (3-6개월)
- 비용: $0
- 품질: 매우 높음 (100%)

**옵션 C: 하이브리드** (절충)
- AI로 초안 생성
- 각 장마다 수동 검토 및 수정
- 중간 속도 (6-8주)
- 비용: ~$14
- 품질: 매우 높음 (95%+)

---

## 📌 결론

창세기 전체 마이그레이션은 **완전 자동화 방식(옵션 A)**이 가장 실용적입니다:

✅ **장점**:
- 빠른 진행 (3-4주)
- 일관된 품질
- 확장 가능 (다른 책으로)
- 저렴한 비용 (~$14)

⚠️ **주의사항**:
- AI 생성 콘텐츠 검증 필요
- 신학적 정확성 검토
- 샘플 테스트 필수

**다음 작업**: Phase 3.1 파일럿 시작 (창세기 2-3장)
