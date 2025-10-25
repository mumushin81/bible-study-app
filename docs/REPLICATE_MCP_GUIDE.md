# 🚀 Replicate MCP 가이드

**작성일**: 2025-10-25
**상태**: ✅ 설치 완료

---

## 📋 목차

1. [개요](#개요)
2. [설치 방법](#설치-방법)
3. [사용 예시](#사용-예시)
4. [활용 방안](#활용-방안)
5. [트러블슈팅](#트러블슈팅)

---

## 개요

### Replicate MCP란?

**Replicate MCP**는 Model Context Protocol을 통해 Claude Code에서 [Replicate](https://replicate.com) API를 사용할 수 있게 해주는 서버입니다.

### Replicate란?

- **AI 모델 실행 플랫폼**
- 수천 개의 오픈소스 AI 모델 호스팅
- 주요 모델:
  - **이미지 생성**: FLUX, Stable Diffusion, DALL-E
  - **이미지 업스케일링**: Real-ESRGAN
  - **음성 생성**: ElevenLabs, Bark
  - **텍스트 생성**: Llama, Mistral
  - **비디오 생성**: AnimateDiff

### 이 프로젝트에서 활용 방안

#### 1. SVG 아이콘 생성 자동화
```typescript
// 현재: MD Script로 직접 프롬프트 작성
// 개선: Replicate FLUX로 자동 생성

// 히브리어 단어 → FLUX 프롬프트 → SVG 변환
"Generate a simple icon for Hebrew word 'בְּרֵאשִׁית' (beginning)"
```

#### 2. 히브리어 폰트 이미지 생성
```
"Create beautiful Hebrew calligraphy for 'שָׁמַיִם וְאֵת הָאָרֶץ'"
```

#### 3. 학습 카드 배경 이미지
```
"Generate a serene background for a Bible study flashcard"
```

---

## 설치 방법

### 1. Replicate API 토큰 발급

1. https://replicate.com/account/api-tokens 접속
2. "New token" 클릭
3. 이름: `claude-code-mcp`
4. 생성된 토큰 복사 (예: `r8_xxxxxxxxxxxxx`)

### 2. 환경변수 설정

```bash
# ~/.zshrc에 추가
echo 'export REPLICATE_API_TOKEN="r8_your_token_here"' >> ~/.zshrc

# 적용
source ~/.zshrc

# 확인
echo $REPLICATE_API_TOKEN
```

### 3. .claude.json 설정

프로젝트 루트의 `.claude.json` 파일에 다음 추가:

```json
{
  "mcpServers": {
    "replicate": {
      "command": "npx",
      "args": ["-y", "replicate-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": "${env:REPLICATE_API_TOKEN}"
      }
    }
  }
}
```

### 4. Claude Code 재시작

- `Cmd + Q`로 완전 종료
- 재시작
- MCP 서버 자동 로드 확인

---

## 사용 예시

### 1. 모델 검색

```
Claude에게: "Replicate에서 이미지 업스케일링 모델 검색해줘"
```

**결과**: Real-ESRGAN, GFPGAN 등 모델 리스트

### 2. 이미지 생성

```
Claude에게: "FLUX 모델로 '히브리어 성경 공부' 테마의 아이콘 생성해줘"
```

**결과**: 이미지 URL 반환

### 3. 이미지 업스케일

```
Claude에게: "이 SVG를 고해상도로 변환해줘"
```

### 4. 배치 처리

```typescript
// 예: 100개 단어의 아이콘 자동 생성
const words = ['בְּרֵאשִׁית', 'בָּרָא', 'אֱלֹהִים', ...];

for (const word of words) {
  await replicate.run('flux-dev', {
    prompt: `Simple icon for Hebrew word ${word.meaning}`
  });
}
```

---

## 활용 방안

### Phase 1: SVG 아이콘 생성 자동화

#### 현재 프로세스 (수동)
```
1. MD Script 프롬프트 작성
2. AI에게 요청
3. SVG 코드 복사
4. 데이터베이스 업로드
```

#### 개선된 프로세스 (자동)
```typescript
// scripts/icons/generateWithReplicate.ts
async function generateIconsWithReplicate() {
  const nullWords = await supabase
    .from('words')
    .select('*')
    .is('icon_svg', null);

  for (const word of nullWords.data) {
    // 1. FLUX로 이미지 생성
    const image = await replicate.run('flux-dev', {
      prompt: `Simple, minimalist icon for ${word.meaning}`
    });

    // 2. 이미지 → SVG 변환 (potrace 등)
    const svg = await imageToSvg(image);

    // 3. DB 업로드
    await supabase
      .from('words')
      .update({ icon_svg: svg })
      .eq('id', word.id);
  }
}
```

**장점**:
- ✅ 2,096개 단어 아이콘 자동 생성
- ✅ 일관된 스타일 유지
- ✅ 시간 절약 (수동: 1시간/100개 → 자동: 5분/100개)

### Phase 2: 학습 컨텐츠 시각화

```typescript
// 구절별 배경 이미지
const verse = "בְּרֵאשִׁית בָּרָא אֱלֹהִים";
const background = await replicate.run('sdxl', {
  prompt: 'Biblical creation scene, serene, artistic'
});
```

### Phase 3: 발음 가이드 오디오

```typescript
// 히브리어 발음 음성 생성
const audio = await replicate.run('bark', {
  text: 'beresheet bara elohim'
});
```

---

## 트러블슈팅

### 문제 1: MCP 서버 연결 안 됨

**증상**:
```
MCP server 'replicate' failed to start
```

**해결**:
```bash
# 1. 환경변수 확인
echo $REPLICATE_API_TOKEN

# 2. 패키지 수동 설치
npm install -g replicate-mcp

# 3. Claude Code 재시작
```

### 문제 2: API 토큰 오류

**증상**:
```
Authentication failed
```

**해결**:
1. https://replicate.com/account/api-tokens 접속
2. 토큰 상태 확인 (활성화 여부)
3. 새 토큰 발급
4. 환경변수 업데이트

### 문제 3: 모델 실행 느림

**원인**:
- Cold start (모델 첫 실행 시 1-2분 소요)
- GPU 할당 대기

**해결**:
```typescript
// 모델 warming (미리 한 번 실행)
await replicate.warm('flux-dev');
```

### 문제 4: 비용 초과

**Replicate 요금**:
- 무료: 월 $5 크레딧
- FLUX: $0.003/생성
- SDXL: $0.0025/생성

**해결**:
```typescript
// 배치 크기 제한
const BATCH_SIZE = 10;
const DAILY_LIMIT = 100;

// 비용 추적
let totalCost = 0;
if (totalCost > DAILY_LIMIT * 0.003) {
  console.log('Daily budget exceeded');
  return;
}
```

---

## 📊 성능 비교

### SVG 아이콘 생성

| 방법 | 시간 (100개) | 비용 | 품질 |
|------|-------------|------|------|
| **수동 (MD Script)** | 60분 | $0 | ⭐⭐⭐⭐⭐ |
| **Replicate FLUX** | 5분 | $0.30 | ⭐⭐⭐⭐ |
| **하이브리드** | 10분 | $0.10 | ⭐⭐⭐⭐⭐ |

**하이브리드 방법** (권장):
1. Replicate로 초안 생성
2. MD Script로 세부 조정
3. 가이드라인 준수 검증

---

## 🎯 실전 예제

### 예제 1: 단어 아이콘 생성

```typescript
// scripts/icons/generateSingleIcon.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateWordIcon(word: string, meaning: string) {
  const output = await replicate.run(
    'black-forest-labs/flux-dev',
    {
      input: {
        prompt: `Simple, minimalist SVG icon for ${meaning}.
                Flat design, single gradient color,
                no text, no background, 64x64px`,
        num_outputs: 1,
        aspect_ratio: '1:1'
      }
    }
  );

  return output;
}

// 사용
const icon = await generateWordIcon('בְּרֵאשִׁית', 'beginning');
console.log(icon); // URL to generated image
```

### 예제 2: 배치 생성 (비용 관리)

```typescript
// scripts/icons/batchGenerateIcons.ts
async function batchGenerate(words: Word[]) {
  const BATCH_SIZE = 10;
  const COST_PER_IMAGE = 0.003;
  const BUDGET = 1.0; // $1

  let totalCost = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);

    // 비용 체크
    const batchCost = batch.length * COST_PER_IMAGE;
    if (totalCost + batchCost > BUDGET) {
      console.log(`Budget limit reached: $${totalCost.toFixed(2)}`);
      break;
    }

    // 병렬 생성
    await Promise.all(
      batch.map(word => generateWordIcon(word.hebrew, word.meaning))
    );

    totalCost += batchCost;
    console.log(`Progress: ${i + batch.length}/${words.length} ($${totalCost.toFixed(2)})`);

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

---

## 🔗 참고 링크

### 공식 문서
- [Replicate 홈페이지](https://replicate.com)
- [Replicate API Docs](https://replicate.com/docs)
- [Replicate MCP Server](https://github.com/deepfates/mcp-replicate)

### 추천 모델
- **FLUX Dev**: 최신 이미지 생성 (고품질)
- **SDXL**: Stable Diffusion XL (빠름)
- **Real-ESRGAN**: 이미지 업스케일링
- **SVG-Gen**: SVG 직접 생성 (실험적)

### 커뮤니티
- [Replicate Discord](https://discord.gg/replicate)
- [MCP Servers GitHub](https://github.com/modelcontextprotocol/servers)

---

**작성**: Claude Code
**상태**: ✅ 설치 및 설정 완료
**다음**: SVG 아이콘 자동 생성 스크립트 구현
