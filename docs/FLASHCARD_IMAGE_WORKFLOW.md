# 플래시카드 이미지 생성 및 연동 워크플로우

> **작성일**: 2025-10-26
> **목적**: 히브리어 단어 플래시카드 이미지 생성부터 Supabase 연동까지 전체 프로세스 문서화

## 📋 목차

1. [이미지 생성 규칙](#1-이미지-생성-규칙)
2. [이미지 생성 프로세스](#2-이미지-생성-프로세스)
3. [Supabase Storage 업로드](#3-supabase-storage-업로드)
4. [데이터베이스 연동](#4-데이터베이스-연동)
5. [플래시카드 컴포넌트 설정](#5-플래시카드-컴포넌트-설정)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 이미지 생성 규칙

### 필수 준수 사항 ⚠️

#### 1.1 이미지 사양
```yaml
모델: FLUX Schnell (black-forest-labs/flux-schnell)
비용: $0.003/이미지
비율: 9:16 (모바일 세로) - ABSOLUTE
형식: JPG
품질: 90
평균 크기: 37KB
```

#### 1.2 디자인 규칙

**✅ 필수 적용**:
- **9:16 세로 비율** (절대적 요구사항)
- **하단 20% 완전히 비움** (텍스트 오버레이 공간)
- **밝은 파스텔 색상만** (RGB > 180/255)
- **NO TEXT** - 어떤 언어의 텍스트도 금지

**❌ 절대 금지**:
- 어두운 색상 (검은색, 진한 파랑, 진한 빨강 등)
- 텍스트, 레터링, 타이포그래피 (모든 언어)
- 수채화 번짐 효과
- 사실적/구체적 오브젝트

#### 1.3 프롬프트 템플릿

```typescript
const prompt = `
ABSTRACT PASTEL ART - ABSOLUTELY NO TEXT

MEANING: [단어의 의미 - 예: THE BEGINNING]

VISUAL CONCEPT:
- [추상적 시각 표현 - 예: Soft radial light rays]
- [구체적 패턴 설명]
- [색상 조합]

STYLE:
- Clean digital pastel gradients
- Modern minimalist
- Pure visual - NO TYPOGRAPHY EVER

COMPOSITION (9:16 PORTRAIT):
- Upper 80%: [메인 비주얼 컨텐츠]
- Bottom 20%: Solid cream color (#FFF9E6)
- NO content in bottom 20%

COLORS:
- Golden yellow (#FFE66D), rose pink (#FFB3C6), sky blue (#A8D8FF)
- Mint (#B5E7D0), lavender (#DCC6FF), peach (#FFCCB8)
- ALL brightness > 180/255

CRITICAL RULES:
✅ 9:16 portrait vertical
✅ Bottom 20% empty solid pastel
✅ Bright pastels only
✅ Visible visual pattern
✅ NO TEXT - NO LETTERS - NO WORDS - NO TYPOGRAPHY WHATSOEVER

STRICTLY FORBIDDEN:
❌ ABSOLUTELY NO TEXT OR LETTERS OF ANY KIND IN ANY LANGUAGE
❌ NO WORDS
❌ NO TYPOGRAPHY
❌ NO dark colors
❌ NO watercolor texture

Pure abstract pastel visual - shapes only, never text.
`.trim()
```

---

## 2. 이미지 생성 프로세스

### 2.1 생성 스크립트 작성

**예시: 창세기 1:1 (7개 단어)**

```typescript
#!/usr/bin/env tsx

import Replicate from 'replicate'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

interface WordInfo {
  filename: string
  hebrew: string
  korean: string
  meaning: string
  visualForm: string  // 추상적 시각 표현
}

const WORDS: WordInfo[] = [
  {
    filename: 'bereshit',
    hebrew: 'בְּרֵאשִׁית',
    korean: '베레쉬트',
    meaning: '태초에',
    visualForm: 'Soft radial light rays from center point'
  },
  // ... 나머지 단어들
]

async function generateImage(word: WordInfo) {
  const prompt = generatePrompt(word)

  const output: any = await replicate.run('black-forest-labs/flux-schnell', {
    input: {
      prompt,
      num_outputs: 1,
      aspect_ratio: '9:16',  // ⚠️ 필수
      output_format: 'jpg',
      output_quality: 90,
    }
  })

  const imageUrl = Array.isArray(output) ? output[0] : output
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()

  const filepath = join(
    process.cwd(),
    `output/genesis1_1_comparison/schnell/${word.filename}.jpg`
  )

  writeFileSync(filepath, Buffer.from(buffer))
  console.log(`✅ ${word.filename}.jpg generated`)
}

async function main() {
  for (const word of WORDS) {
    await generateImage(word)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit
  }
}

main().catch(console.error)
```

### 2.2 생성 후 검증

```bash
# 1. 이미지 생성
npx tsx scripts/generateGenesis1_1.ts

# 2. 육안 검증
# - 텍스트 있는지 확인 ❌
# - 어두운 색상 있는지 확인 ❌
# - 하단 20% 비어있는지 확인 ✅
# - 9:16 비율 맞는지 확인 ✅

# 3. 규칙 위반 시 재생성
npx tsx scripts/regenerateViolatingImages.ts
```

**주요 위반 사례**:
- 텍스트 생성 (가장 빈번) → 프롬프트에 "NO TEXT" 강조 추가
- 어두운 색상 → "NO dark colors" 추가, 밝기 최소값 명시
- 너무 미니멀 → "CLEAR visual element" 요구

---

## 3. Supabase Storage 업로드

### 3.1 Storage 버킷 확인

```bash
# 사용 가능한 버킷 확인
npx tsx scripts/test/listSupabaseBuckets.ts
```

**결과**:
```
1. hebrew-icons (Public) ← 사용
2. animated-icons (Public)
```

### 3.2 업로드 스크립트

```typescript
#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ SERVICE_ROLE_KEY 사용

const supabase = createClient(supabaseUrl, supabaseKey)

const GENESIS_1_1_WORDS = [
  { filename: 'bereshit', hebrew: 'בְּרֵאשִׁית', korean: '베레쉬트' },
  { filename: 'bara', hebrew: 'בָּרָא', korean: '바라' },
  // ... 나머지
]

async function uploadImageToSupabase(
  filename: string,
  hebrew: string
): Promise<string | null> {
  // 1. 로컬 파일 읽기
  const localPath = join(
    process.cwd(),
    'output/genesis1_1_comparison/schnell',
    `${filename}.jpg`
  )
  const fileBuffer = readFileSync(localPath)

  // 2. Supabase Storage에 업로드
  const storagePath = `word_icons/${filename}.jpg`
  const { data, error } = await supabase.storage
    .from('hebrew-icons')  // ⚠️ 버킷 이름 확인
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,  // 기존 파일 덮어쓰기
    })

  if (error) {
    console.error(`❌ Upload failed: ${error.message}`)
    return null
  }

  // 3. Public URL 생성
  const { data: urlData } = supabase.storage
    .from('hebrew-icons')
    .getPublicUrl(storagePath)

  console.log(`✅ Uploaded: ${urlData.publicUrl}`)
  return urlData.publicUrl
}

async function updateWordIconUrl(
  hebrew: string,
  iconUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from('words')
    .update({ icon_url: iconUrl })
    .eq('hebrew', hebrew)

  if (error) {
    console.error(`❌ DB update failed: ${error.message}`)
    return false
  }

  console.log(`✅ Database updated for ${hebrew}`)
  return true
}

async function main() {
  let uploadCount = 0
  let updateCount = 0

  for (const word of GENESIS_1_1_WORDS) {
    console.log(`\n[${uploadCount + 1}/${GENESIS_1_1_WORDS.length}] ${word.hebrew}`)

    // 1. 이미지 업로드
    const iconUrl = await uploadImageToSupabase(word.filename, word.hebrew)
    if (!iconUrl) continue
    uploadCount++

    // 2. 데이터베이스 업데이트
    const updated = await updateWordIconUrl(word.hebrew, iconUrl)
    if (updated) updateCount++

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n✅ Upload: ${uploadCount}/${GENESIS_1_1_WORDS.length}`)
  console.log(`✅ DB Update: ${updateCount}/${GENESIS_1_1_WORDS.length}`)
}

main().catch(console.error)
```

### 3.3 실행 및 검증

```bash
# 1. 업로드 실행
npx tsx scripts/test/uploadGenesis1_1ToSupabase.ts

# 2. 이미지 접근성 테스트
npx tsx scripts/test/verifyImageAccess.ts

# 3. 데이터베이스 연동 테스트
npx tsx scripts/test/testDatabaseConnection.ts
```

**예상 결과**:
```
✅ Upload: 7/7
✅ DB Update: 7/7
✅ Image Access: 7/7
🎉 All tests passed!
```

---

## 4. 데이터베이스 연동

### 4.1 테이블 스키마

**verses 테이블**:
```sql
id              text (PK)      -- 예: 'genesis_1_1'
book_id         text
chapter         integer
verse_number    integer
reference       text           -- 예: '창세기 1:1'
hebrew          text
```

**words 테이블**:
```sql
id              uuid (PK)
verse_id        text (FK)      -- verses.id 참조
hebrew          text
korean          text
meaning         text
icon_url        text           -- ⚠️ 이미지 URL 저장
position        integer
grammar         text
```

### 4.2 중복 단어 처리

동일한 히브리어 단어가 여러 구절에 나타날 수 있습니다:

```typescript
// 예: אֱלֹהִים (엘로힘)은 43개 구절에 등장
const { data } = await supabase
  .from('words')
  .select('*')
  .eq('hebrew', 'אֱלֹהִים')

// 결과: 43개 row, 모두 같은 icon_url 업데이트됨
```

**업데이트 쿼리**:
```sql
UPDATE words
SET icon_url = 'https://...hebrew-icons/word_icons/elohim.jpg'
WHERE hebrew = 'אֱלֹהִים'
-- 43개 row 모두 업데이트됨
```

### 4.3 검증 쿼리

```typescript
// 창세기 1:1 단어 조회
const { data: verse } = await supabase
  .from('verses')
  .select('id')
  .eq('id', 'genesis_1_1')
  .single()

const { data: words } = await supabase
  .from('words')
  .select('hebrew, korean, meaning, icon_url, position')
  .eq('verse_id', verse.id)
  .order('position')

// 7개 단어, 모두 icon_url 존재 확인
```

---

## 5. 플래시카드 컴포넌트 설정

### 5.1 이미지 검증 함수 (HebrewIcon.tsx)

**필수 패턴 허용**:
```typescript
function isValidImage(url: string): boolean {
  if (!url) return false;

  // JPG 패턴 1: MD5 해시 파일명 (대량 생성)
  const jpgPattern1 = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/icons\/word_[a-f0-9]{32}\.jpg$/;

  // JPG 패턴 2: 일반 파일명 (창세기 1:1 등 특별 생성)
  const jpgPattern2 = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/word_icons\/[a-zA-Z_]+\.jpg$/;

  // GIF 패턴 (애니메이션)
  const gifPattern = /supabase\.co\/storage\/v1\/object\/public\/animated-icons\/gifs\/word_[a-f0-9]{32}\.gif$/;

  return jpgPattern1.test(url) || jpgPattern2.test(url) || gifPattern.test(url);
}
```

**이미지 렌더링**:
```tsx
if (iconUrl && !imageError && !isInvalidFormat) {
  return (
    <img
      src={iconUrl}
      alt={word}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
      }}
      loading="lazy"
      onError={() => setImageError(true)}
    />
  );
}
```

### 5.2 플래시카드 UI 설정 (FlashCard.tsx)

**앞면 레이아웃**:
```tsx
{/* 배경 이미지 (9:16 전체) */}
<div className="absolute inset-0 z-0">
  <HebrewIcon
    word={word.hebrew}
    iconUrl={word.iconUrl}
    className="w-full h-full object-cover"
  />
</div>

{/* 블러 효과 오버레이 (하단 20%) */}
<div
  className="absolute inset-x-0 bottom-0 h-[20%] z-10 pointer-events-none"
  style={{
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    background: 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
  }}
/>

{/* 상단 버튼 (품사, 북마크) */}
<div className="absolute top-0 left-0 right-0 z-20">
  {/* 품사 배지 - grammarColors 적용 */}
  <div style={{
    backgroundColor: `${grammarColors.bg}cc`,
    color: grammarColors.text,
    borderColor: `${grammarColors.border}80`
  }}>
    {getSimpleGrammar(word.grammar)}
  </div>

  {/* 북마크 버튼 */}
  <button>
    <Star className={isBookmarked ? 'fill-yellow-500' : 'text-gray-700'} />
  </button>
</div>

{/* 하단 텍스트 영역 */}
<div className="absolute bottom-0 left-0 right-0 z-20">
  {/* 히브리어 */}
  <div className="text-gray-800" dir="rtl">
    {word.hebrew}
  </div>

  {/* 알파벳 + 음성 버튼 */}
  <div className="flex items-center gap-2">
    <div className="text-gray-700">{word.letters}</div>
    <button><Volume2 /></button>
  </div>

  {/* 탭 안내 */}
  <div className="text-xs text-gray-600">
    더블 탭하여 뜻 보기
  </div>
</div>
```

**뒷면 레이아웃**:
```tsx
{/* 배경 이미지 */}
<HebrewIcon ... />

{/* 블러 효과 (전체) */}
<div style={{
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.3) 100%)',
}} />

{/* 상단 버튼 (앞면과 동일) */}
<div>품사 + 북마크</div>

{/* 중앙 뜻 영역 */}
<div className="flex flex-col items-center justify-center">
  <div className="text-gray-900">{word.meaning}</div>
  <div className="text-gray-800" dir="rtl">{word.hebrew}</div>
  <div className="text-gray-700">[{word.korean}]</div>
  <div className="bg-white/30">📖 {reference}</div>
</div>
```

### 5.3 UI 스펙 정리

| 항목 | 설정값 |
|------|--------|
| 배경 이미지 | 9:16 전체 화면 |
| 앞면 블러 | 하단 20%, blur(8px) |
| 뒷면 블러 | 전체, blur(16px) |
| 텍스트 색상 | 회색 계열 (text-gray-700~900) |
| 텍스트 그림자 | 흰색 반투명 (`rgba(255,255,255,0.8)`) |
| 버튼 배경 | 흰색 반투명 (`bg-white/40`) + blur |
| 품사 배지 | grammarColors 적용 (80% 투명도) |

---

## 6. 트러블슈팅

### 6.1 이미지 생성 관련

#### 문제: 텍스트가 이미지에 생성됨
```
증상: "THE BEGINNING", "create" 등의 영문 텍스트가 이미지에 포함됨
원인: AI가 의미를 문자로 표현하려는 경향
```

**해결책**:
```typescript
// 프롬프트에 강력한 금지 명령 추가
const prompt = `
CRITICAL RULES:
✅ NO TEXT - NO LETTERS - NO WORDS - NO TYPOGRAPHY WHATSOEVER

STRICTLY FORBIDDEN:
❌ ABSOLUTELY NO TEXT OR LETTERS OF ANY KIND IN ANY LANGUAGE
❌ NO WORDS
❌ NO TYPOGRAPHY

Pure abstract pastel visual - shapes only, never text.
`
```

#### 문제: 너무 미니멀한 이미지 (거의 빈 그라디언트)
```
증상: elohim, hashamayim 등이 단순 그라디언트만 표시됨
원인: "abstract" 강조로 인한 과도한 단순화
```

**해결책**:
```typescript
// CLEAR visual element 요구
VISUAL CONCEPT:
- CLEAR and VISIBLE [구체적 패턴]
- NOT just gradients
- Multiple visual layers
```

#### 문제: 어두운 색상 사용
```
증상: 검은색, 진한 파랑, 진한 빨강 배경
원인: FLUX 1.1 Pro 모델 사용 (규칙 준수율 42%)
```

**해결책**:
```typescript
// FLUX Schnell 사용 (규칙 준수율 95%)
// 프롬프트에 밝기 최소값 명시
COLORS:
- ALL brightness > 180/255
❌ NO dark colors (no navy, black, dark gray, dark blue, dark red)
```

### 6.2 Supabase 업로드 관련

#### 문제: "Bucket not found" 에러
```bash
❌ Upload failed: Bucket not found
```

**해결책**:
```bash
# 1. 사용 가능한 버킷 확인
npx tsx scripts/test/listSupabaseBuckets.ts

# 2. 올바른 버킷 이름으로 수정
.from('icons')      # ❌ 존재하지 않음
.from('hebrew-icons') # ✅ 올바름
```

#### 문제: 환경 변수 오류
```bash
❌ Missing Supabase credentials in .env.local
```

**해결책**:
```typescript
// Vite 프로젝트이므로 VITE_ 접두사 사용
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!  // 조회용
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // 업로드용
```

### 6.3 플래시카드 연동 관련

#### 문제: "올바르지 않은 이미지 형식" 에러
```
증상: 이미지가 표시되지 않고 노란색 경고 박스 표시
원인: HebrewIcon.tsx의 isValidImage() 검증 실패
```

**해결책**:
```typescript
// word_icons 경로 패턴 추가
const jpgPattern2 = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/word_icons\/[a-zA-Z_]+\.jpg$/;
```

**확인 방법**:
```bash
# 콘솔에서 경고 메시지 확인
[HebrewIcon] ⚠️ Invalid image format: https://...word_icons/bereshit.jpg

# 패턴 추가 후 재확인
[HebrewIcon] 🎨 Rendering JPG for בְּרֵאשִׁית: https://...word_icons/bereshit.jpg
```

#### 문제: 이미지가 너무 어둡게 표시됨
```
증상: 검은색 그라디언트로 인해 파스텔 이미지가 가려짐
원인: 기존 FlashCard.tsx의 어두운 오버레이
```

**해결책**:
```typescript
// 검은색 → 흰색 반투명 + 블러
background: 'rgba(0,0,0,0.85)' // ❌
↓
background: 'rgba(255,255,255,0.6)' // ✅
backdropFilter: 'blur(8px)' // ✅
```

---

## 7. 체크리스트

### 이미지 생성 전 ✅
- [ ] FLUX Schnell 모델 사용 확인
- [ ] 9:16 비율 설정 확인
- [ ] 하단 20% 비우기 프롬프트 포함
- [ ] "NO TEXT" 금지 명령 포함
- [ ] 밝은 파스텔 색상만 지정
- [ ] REPLICATE_API_TOKEN 환경변수 설정

### 이미지 생성 후 ✅
- [ ] 텍스트 없는지 육안 확인
- [ ] 어두운 색상 없는지 확인
- [ ] 하단 20% 비어있는지 확인
- [ ] 9:16 비율 맞는지 확인
- [ ] 파일 크기 적절한지 확인 (20-60KB)

### Supabase 업로드 전 ✅
- [ ] Supabase 버킷 존재 확인 (`hebrew-icons`)
- [ ] VITE_SUPABASE_URL 환경변수 확인
- [ ] SUPABASE_SERVICE_ROLE_KEY 환경변수 확인
- [ ] 로컬 이미지 파일 경로 확인

### Supabase 업로드 후 ✅
- [ ] Storage에 이미지 업로드 확인
- [ ] Public URL 접근 가능 확인 (200 OK)
- [ ] words 테이블 icon_url 업데이트 확인
- [ ] 중복 단어들도 모두 업데이트 확인

### 플래시카드 연동 전 ✅
- [ ] HebrewIcon.tsx의 isValidImage() 패턴 확인
- [ ] word_icons 경로 패턴 포함 확인
- [ ] FlashCard.tsx 블러 효과 설정 확인
- [ ] 텍스트 색상 (회색 계열) 확인

### 플래시카드 연동 후 ✅
- [ ] 이미지 정상 표시 확인
- [ ] 하단 20% 영역에 텍스트 배치 확인
- [ ] 블러 효과 적용 확인
- [ ] 품사 색상 배지 표시 확인
- [ ] 북마크 버튼 작동 확인

---

## 8. 참고 파일

### 스크립트
- `scripts/test/generateGenesis1_1_AbstractMeaning.ts` - 이미지 생성
- `scripts/test/regenerateViolatingImages.ts` - 규칙 위반 재생성
- `scripts/test/uploadGenesis1_1ToSupabase.ts` - Supabase 업로드
- `scripts/test/verifyImageAccess.ts` - 이미지 접근성 테스트
- `scripts/test/testDatabaseConnection.ts` - DB 연동 테스트

### 컴포넌트
- `src/components/shared/HebrewIcon.tsx` - 이미지 검증 및 렌더링
- `src/components/shared/FlashCard.tsx` - 플래시카드 UI

### 환경 변수 (.env.local)
```bash
VITE_SUPABASE_URL=https://ouzlnriafovnxlkywerk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REPLICATE_API_TOKEN=r8_...
```

---

## 9. 성공 사례: 창세기 1:1

**생성된 이미지**: 7개
**업로드 성공률**: 100% (7/7)
**DB 업데이트 성공률**: 100% (7/7)
**이미지 접근 성공률**: 100% (7/7)
**규칙 준수율**: 100%
**총 비용**: $0.021 (7 × $0.003)
**평균 파일 크기**: 37KB

**단어 목록**:
1. בְּרֵאשִׁית (bereshit) - 태초에 ✅
2. בָּרָא (bara) - 창조하셨다 ✅
3. אֱלֹהִים (elohim) - 하나님 ✅
4. אֵת (et) - ~을/를 ✅
5. הַשָּׁמַיִם (hashamayim) - 하늘들 ✅
6. וְאֵת (veet) - 그리고 ~을/를 ✅
7. הָאָרֶץ (haaretz) - 땅 ✅

---

## 10. 결론

이 워크플로우를 정확히 따르면:
- ✅ 규칙 준수율 100% 이미지 생성 가능
- ✅ Supabase 연동 문제 없음
- ✅ 플래시카드에서 정상 표시
- ✅ 확장 가능 (다른 구절에도 동일 적용)

**핵심 포인트**:
1. **FLUX Schnell** 모델만 사용
2. **9:16 비율** 절대 준수
3. **NO TEXT** 철저히 금지
4. **hebrew-icons/word_icons/** 경로 사용
5. **HebrewIcon.tsx** 검증 패턴 확인
6. **블러 효과** 하단 20%, 8px

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-10-26
**작성자**: Claude (Anthropic)
