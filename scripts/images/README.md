# FLUX Schnell 히브리어 단어 이미지 생성 가이드

FLUX Schnell을 사용하여 **플래시카드용 히브리어 단어 이미지**를 자동 생성하는 스크립트입니다.

## 특징

- ⚡ **빠른 생성**: FLUX Schnell 모델 사용 (3-5초)
- 💰 **저렴한 비용**: ~$0.003/이미지 (약 333장/$1)
- 🎨 **깊이있는 표현**: 단어의 신학적/문화적 의미를 시각화
- 📱 **플래시카드 최적화**: 9:16 세로 비율, JPG 형식
- 🔄 **일괄 생성**: 여러 단어 한번에 처리
- ✨ **의미 기반**: 단어의 어원, 문맥, 상징을 반영

## 설치

### 1. Replicate 패키지 설치

```bash
npm install replicate
```

### 2. API 키 발급

1. https://replicate.com 회원가입
2. https://replicate.com/account/api-tokens 에서 API 토큰 생성
3. `.env` 파일에 추가:

```bash
# .env
REPLICATE_API_TOKEN=r8_your_token_here
```

## 사용법

### 테스트 실행

간단한 테스트 이미지 생성:

```bash
npm run image:test
```

출력: `public/images/test/test_sunset.jpg` (9:16 비율)

### 단일 단어 생성

```bash
tsx scripts/images/generateImage.ts "בְּרֵאשִׁית" "시작, 태초" "베레쉬트"
```

더 자세하게:

```bash
tsx scripts/images/generateImage.ts "אֱלֹהִים" "하나님" "엘로힘" "אל" "명사" "창세기 1:1"
```

**파라미터:**
- `hebrew`: 히브리어 단어 (니쿠드 포함)
- `meaning`: 한국어 의미
- `korean`: 한글 발음
- `root` (선택): 어근
- `grammar` (선택): 품사
- `context` (선택): 문맥/설명

**출력:** `public/images/words/בראשית.jpg` (니쿠드 제거)

### 일괄 생성

```bash
npm run image:batch
```

샘플 단어 5개를 생성합니다:
- בְּרֵאשִׁית (베레쉬트) - 시작
- אֱלֹהִים (엘로힘) - 하나님
- אוֹר (오르) - 빛
- הָאָרֶץ (하아레츠) - 땅
- הַשָּׁמַיִם (하샤마임) - 하늘

## 스크립트 구조

```
scripts/images/
├── generateImage.ts         # 메인 스크립트
├── generateImagePrompt.ts   # 프롬프트 생성 함수
└── README.md               # 이 문서
```

## API 옵션

### GenerateImageOptions

```typescript
{
  outputDir?: string          // 출력 디렉토리 (기본: public/images/words)
  aspectRatio?: string        // 비율 (기본: 9:16 플래시카드)
  outputFormat?: string       // 형식 (기본: jpg)
  outputQuality?: number      // 품질 0-100 (기본: 90)
  goFast?: boolean           // 속도 최적화 (기본: true)
  numOutputs?: number        // 생성 개수 1-4 (기본: 1)
  seed?: number              // 랜덤 시드 (재현 가능)
}
```

### 지원하는 비율

- `9:16` - 세로 모바일 플래시카드 (기본, 권장)
- `16:9` - 가로 와이드
- `1:1` - 정사각형
- `4:5`, `5:4` - SNS
- `3:4`, `4:3` - 표준

## 프로그래밍 방식 사용

```typescript
import { generateWordImage } from './scripts/images/generateImage.js'

const word = {
  hebrew: 'בְּרֵאשִׁית',
  meaning: '시작, 태초',
  korean: '베레쉬트',
  root: 'ראש',
  grammar: '명사',
  context: '창세기의 첫 단어'
}

const paths = await generateWordImage(word, {
  aspectRatio: '9:16',
  outputFormat: 'jpg',
  outputQuality: 90,
})

console.log('생성된 이미지:', paths[0])
// public/images/words/בראשית.jpg
```

### 일괄 생성

```typescript
import { generateWordImagesBatch } from './scripts/images/generateImage.js'

const words = [
  { hebrew: 'אוֹר', meaning: '빛', korean: '오르' },
  { hebrew: 'מַיִם', meaning: '물', korean: '마임' },
]

const results = await generateWordImagesBatch(words)
// 각 단어별 이미지 경로 배열
```

## 비용 계산

| 이미지 수 | 예상 비용 |
|----------|---------|
| 1장 | $0.003 |
| 10장 | $0.03 |
| 100장 | $0.30 |
| 333장 | $1.00 |

## 프롬프트 커스터마이징

`generateImagePrompt.ts` 파일에서 프롬프트를 수정할 수 있습니다:

### 기본 스타일 설정

```typescript
const baseStyle = `
Art style: Rich symbolic illustration, biblical atmosphere, spiritual depth
Medium: Watercolor with acrylic highlights, textured brushstrokes
Composition: Vertical 9:16 mobile-optimized, centered focus, visual hierarchy
Lighting: Divine golden rays, soft ethereal glow, atmospheric depth
Quality: Highly detailed, 4k resolution, professional artwork
Colors: Warm earth tones, golden accents, rich saturated colors
Mood: Contemplative, sacred, profound, timeless
`.trim()
```

### 의미 기반 시각화

스크립트는 단어의 의미를 분석하여 자동으로 적절한 시각적 컨셉을 생성합니다:

- **하나님/God**: 신성한 빛, 천상의 구름, 신적 권위
- **시작/Beginning**: 우주 창조, 은하 형성, 원시의 빛
- **빛/Light**: 어둠을 가르는 빛줄기, 황금 광선
- **땅/Earth**: 비옥한 대지, 감람나무, 약속의 땅
- **하늘/Heaven**: 천상의 영역, 하나님의 보좌
- **물/Water**: 생명의 물, 에덴의 강
- **사람/Man**: 흙에서 형성된 인간, 신의 형상
- **생명/Life**: 생명나무, 영원한 생명

`generateDeepMeaningDescription()` 함수에서 키워드 매핑을 추가/수정할 수 있습니다.

## 문제 해결

### API 키 오류

```
❌ REPLICATE_API_TOKEN 환경 변수가 설정되지 않았습니다
```

**해결:** `.env` 파일에 `REPLICATE_API_TOKEN` 추가

### 타임아웃 오류

**해결:** 네트워크 연결 확인, 재시도

### Rate Limit 오류

**해결:** `generateImagesBatch`의 대기 시간 증가 (기본 2초)

```typescript
await new Promise(resolve => setTimeout(resolve, 5000)) // 5초로 증가
```

## 주의사항

- ⚠️ API 키를 Git에 커밋하지 마세요 (`.env` 파일 사용)
- 📊 생성된 이미지는 `public/images/words/` 폴더에 저장됩니다
- 💾 Git에 커밋하기 전에 이미지 파일 크기 확인하세요 (보통 200-500KB)
- 🔒 상업적 사용 가능 (FLUX Schnell은 Apache 2.0 라이선스)
- 📱 9:16 비율은 플래시카드 UI에 최적화되어 있습니다
- 🎨 생성된 이미지는 단어마다 다를 수 있습니다 (seed 미지정 시)

## 실전 사용 예시

### 1. 창세기 1장 단어 생성

```bash
# 창세기 1:1의 핵심 단어들
tsx scripts/images/generateImage.ts "בְּרֵאשִׁית" "시작, 태초" "베레쉬트" "ראש" "명사" "창세기 첫 단어"
tsx scripts/images/generateImage.ts "בָּרָא" "창조하다" "바라" "ברא" "동사" "무에서 유를 창조"
tsx scripts/images/generateImage.ts "אֱלֹהִים" "하나님" "엘로힘" "אל" "명사" "창조주"
tsx scripts/images/generateImage.ts "שָׁמַיִם" "하늘" "샤마임" "שמה" "명사" "천상의 영역"
tsx scripts/images/generateImage.ts "אֶרֶץ" "땅" "에레츠" "ארץ" "명사" "물리적 세계"
```

### 2. DB에서 단어 가져와 생성

```typescript
// scripts/generateWordImages.ts
import { createClient } from '@supabase/supabase-js'
import { generateWordImage } from './images/generateImage.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 이미지가 없는 단어들 가져오기
const { data: words } = await supabase
  .from('words')
  .select('hebrew, meaning, korean, ipa, root, grammar')
  .is('iconUrl', null)
  .limit(10)

for (const word of words!) {
  const paths = await generateWordImage(word)

  // Supabase Storage에 업로드
  const file = await fs.readFile(paths[0])
  const { data } = await supabase.storage
    .from('word-images')
    .upload(`${word.hebrew}.jpg`, file)

  // DB 업데이트
  await supabase
    .from('words')
    .update({ iconUrl: data.path })
    .eq('hebrew', word.hebrew)
}
```

## 다음 단계

1. **Supabase Storage 연동**: 생성된 이미지를 자동으로 업로드
2. **DB 업데이트**: words 테이블의 iconUrl 필드에 URL 저장
3. **일괄 처리**: 모든 단어에 대해 이미지 생성
4. **최적화**: 이미지 압축 (현재는 고품질 JPG)
5. **자동화**: 새 단어 추가 시 자동 이미지 생성

## 참고 자료

- [Replicate FLUX Schnell](https://replicate.com/black-forest-labs/flux-schnell)
- [Replicate API Docs](https://replicate.com/docs)
- [FLUX 모델 정보](https://replicate.com/blog/flux-state-of-the-art-image-generation)
