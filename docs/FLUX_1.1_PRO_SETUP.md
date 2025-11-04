# 🚀 FLUX 1.1 Pro 설정 가이드

**작성일**: 2025-10-27
**상태**: ✅ 설정 완료

---

## 📋 목차

1. [현재 설정 상태](#현재-설정-상태)
2. [Replicate MCP 사용법](#replicate-mcp-사용법)
3. [스크립트에서 사용](#스크립트에서-사용)
4. [모델 비교](#모델-비교)
5. [비용 정보](#비용-정보)

---

## 현재 설정 상태

### ✅ 완료된 설정

1. **환경 변수** (.env.local)
```bash
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# 실제 토큰은 .env.local 파일에서 관리 (Git에 커밋하지 않음)
```

2. **MCP 서버** (.claude.json)
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

3. **사용 중인 모델**
- ✅ `black-forest-labs/flux-1.1-pro` (모든 스크립트 통일 완료)

---

## Replicate MCP 사용법

### 1. Claude Code에서 직접 사용

MCP가 설정되어 있으므로 Claude Code에서 직접 Replicate API를 사용할 수 있습니다:

#### 예제 1: 이미지 생성 요청
```
Claude에게: "FLUX 1.1 Pro로 '태초에 하나님이 천지를 창조하시니라' 테마의 16:9 이미지 생성해줘"
```

#### 예제 2: 배치 이미지 생성
```
Claude에게: "히브리어 단어 베레쉬트, 바라, 엘로힘의 이미지를 각각 생성해줘.
파스텔 색상으로, 16:9 비율, JPG 형식으로"
```

#### 예제 3: 특정 프롬프트로 생성
```typescript
// Claude Code에서 직접 실행 가능
await mcp_replicate.runPrediction({
  model: "black-forest-labs/flux-1.1-pro",
  input: {
    prompt: "Abstract pastel visualization of 'beginning', minimalist sacred art style",
    aspect_ratio: "16:9",
    output_format: "jpg",
    output_quality: 90
  }
})
```

### 2. MCP 사용 시 장점

- ✅ **자동화**: Claude Code가 직접 Replicate API 호출
- ✅ **간편함**: 스크립트 작성 없이 대화로 이미지 생성
- ✅ **통합**: 생성된 이미지를 바로 Supabase에 업로드 가능
- ✅ **배치 처리**: 여러 이미지를 한 번에 생성 및 업로드

### 3. MCP 활용 워크플로우

```
1. Claude Code에게 요청
   "Genesis 1:1의 모든 단어 이미지를 FLUX 1.1 Pro로 생성해줘"

2. Claude가 자동으로:
   - DB에서 단어 목록 조회
   - 각 단어별로 프롬프트 생성
   - Replicate API 호출
   - 이미지 다운로드
   - Supabase Storage에 업로드
   - DB의 icon_url 업데이트

3. 결과 확인
   "생성된 이미지 상태를 확인해줘"
```

---

## 스크립트에서 사용

### 1. 단어 이미지 생성

```bash
# 단일 단어 이미지 생성
tsx scripts/images/generateImage.ts "בְּרֵאשִׁית" "시작, 태초" "베레쉬트" "ראש" "명사"

# 배치 생성
tsx scripts/images/generateImage.ts --batch

# 테스트
tsx scripts/images/generateImage.ts --test
```

### 2. Genesis 1:1 전체 생성

```bash
tsx scripts/images/generateGenesis1_1_JPG.ts
```

### 3. 사용 중인 스크립트

| 스크립트 | 모델 | 비율 | 형식 |
|---------|------|------|------|
| `generateImage.ts` | FLUX 1.1 Pro | 9:16 | JPG |
| `generateGenesis1_1_JPG.ts` | FLUX 1.1 Pro | 16:9 | JPG |
| `generateGenesis1_1_AllJPG.ts` | FLUX 1.1 Pro | 16:9 | JPG |

---

## 모델 비교

### FLUX 모델 라인업

| 모델 | 속도 | 품질 | 가격 | 용도 |
|------|------|------|------|------|
| **FLUX 1.1 Pro** ⭐ | 빠름 | 최고 | $0.04 | 프로덕션 (현재 사용) |
| FLUX Schnell | 매우 빠름 | 중상 | $0.003 | 프로토타입 |
| FLUX Dev | 보통 | 상 | $0.025 | 개발/테스트 |

### FLUX 1.1 Pro 선택 이유

✅ **최고 품질**: 가장 정교한 이미지 생성
✅ **빠른 속도**: Schnell보다 약간 느리지만 품질 대비 우수
✅ **안정성**: 프롬프트 해석이 가장 정확
✅ **비용 효율**: 재생성 횟수가 적어 결과적으로 경제적

---

## 비용 정보

### FLUX 1.1 Pro 가격

- **입력**: $0.04 per generation
- **예상 비용**:
  - 10개 이미지: $0.40
  - 100개 이미지: $4.00
  - 1000개 이미지: $40.00

### 프로젝트 예상 비용

```
Genesis 전체 (50장)
- 단어 수: ~2,096개
- 예상 비용: ~$83.84
- 1회 생성 기준 (재생성 불필요)
```

### 비용 절감 팁

1. **프롬프트 최적화**: 정확한 프롬프트로 재생성 방지
2. **배치 처리**: 한 번에 여러 이미지 생성
3. **캐싱**: 이미 생성된 이미지 재사용
4. **품질 설정**: output_quality 80-90으로 조정 (파일 크기 절약)

---

## 실전 예제

### 예제 1: MCP로 단일 이미지 생성

```
사용자: "베레쉬트 단어 이미지를 FLUX 1.1 Pro로 생성해줘.
파스텔 핑크/블루 그라데이션, 16:9 비율로"

Claude: (자동으로 아래 작업 수행)
1. Replicate API 호출
2. 이미지 생성
3. Supabase Storage 업로드
4. DB 업데이트
5. 결과 URL 제공
```

### 예제 2: 배치 생성 및 업로드

```
사용자: "Genesis 1:1의 주요 단어 5개 이미지를 생성하고 DB에 저장해줘"

Claude: (자동으로)
1. DB 조회 → 주요 단어 추출
2. 각 단어별 프롬프트 생성
3. FLUX 1.1 Pro로 이미지 생성
4. Storage 업로드
5. DB 업데이트
6. 진행 상태 보고
```

### 예제 3: 이미지 품질 검증

```
사용자: "방금 생성한 이미지들의 URL을 확인하고, 깨진 이미지가 있는지 체크해줘"

Claude:
1. DB에서 최근 생성 이미지 조회
2. 각 URL fetch 테스트
3. 이미지 크기/형식 검증
4. 결과 보고
```

---

## 트러블슈팅

### 문제 1: MCP 연결 실패

**증상**: `MCP server 'replicate' failed to start`

**해결**:
```bash
# 1. 환경 변수 확인
echo $REPLICATE_API_TOKEN

# 2. 패키지 재설치
npm install -g replicate-mcp

# 3. Claude Code 재시작
Cmd + Q → 재실행
```

### 문제 2: API 토큰 오류

**증상**: `Authentication failed`

**해결**:
1. https://replicate.com/account/api-tokens 접속
2. 토큰 활성화 상태 확인
3. 필요시 새 토큰 발급
4. .env.local 업데이트

### 문제 3: 생성 속도 느림

**원인**: Cold start (첫 실행 시 30-60초 소요)

**해결**: 정상입니다. 두 번째부터는 빠릅니다.

### 문제 4: 이미지 품질 불만족

**해결**:
```typescript
// output_quality를 100으로 설정
{
  input: {
    prompt: "...",
    output_quality: 100  // 90 → 100
  }
}
```

---

## 다음 단계

### Phase 1: 전체 Genesis 이미지 생성 ✅ 진행 중
```bash
# Genesis 1-50장 모든 단어 이미지 생성
tsx scripts/images/generateAllGenesis.ts
```

### Phase 2: 자동화 워크플로우
```typescript
// Claude Code MCP를 통한 완전 자동화
// 1. DB 조회
// 2. 이미지 생성
// 3. 업로드
// 4. 검증
// 5. 리포트
```

### Phase 3: 품질 관리
```typescript
// 생성된 이미지 품질 자동 검증
// - 해상도 확인
// - 색상 분석
// - 프롬프트 일치도 평가
```

---

## 📚 참고 자료

### 공식 문서
- [FLUX 1.1 Pro Documentation](https://replicate.com/black-forest-labs/flux-1.1-pro)
- [Replicate API Docs](https://replicate.com/docs)
- [Replicate MCP Server](https://github.com/deepfates/mcp-replicate)

### 프롬프트 가이드
- [IMAGE_GENERATION_GUIDELINES.md](../IMAGE_GENERATION_GUIDELINES.md)
- [JPG_ICON_MASTER_GUIDE.md](../JPG_ICON_MASTER_GUIDE.md)

### 관련 스크립트
- [generateImage.ts](../scripts/images/generateImage.ts)
- [generateImagePrompt.ts](../scripts/images/generateImagePrompt.ts)

---

**작성**: Claude Code (Haiku 4.5)
**업데이트**: 2025-10-27
**상태**: ✅ FLUX 1.1 Pro 전환 완료
