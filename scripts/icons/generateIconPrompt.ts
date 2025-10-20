#!/usr/bin/env tsx

/**
 * 히브리어 단어에 대한 화려한 SVG 아이콘 생성 프롬프트 생성기
 */

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  context?: string
}

export function generateIconPrompt(word: WordInfo): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 히브리어 단어 아이콘 생성 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 단어 정보

**히브리어**: ${word.hebrew}
**의미**: ${word.meaning}
**한글 발음**: ${word.korean}
${word.context ? `**문맥**: ${word.context}` : ''}

## 작업 지시

위 히브리어 단어의 의미를 시각적으로 표현하는 **화려하고 웅장한 SVG 아이콘**을 React 컴포넌트로 생성해주세요.

### 필수 요구사항

#### 1. 디자인 컨셉
- **화려함**: 다채로운 그라디언트와 풍부한 색상 사용
- **웅장함**: 임팩트 있고 기억에 남는 비주얼
- **상징성**: 단어의 의미를 직관적으로 표현
- **연상 기억**: 이 아이콘을 보면 단어가 떠오를 정도로 강력한 연결

#### 2. 기술적 요구사항

**컴포넌트 구조:**
\`\`\`tsx
import React from 'react';

interface {ComponentName}Props {
  size?: number;
  className?: string;
}

/**
 * ${word.hebrew} (${word.korean}) - ${word.meaning}
 * [아이콘 설명을 한 줄로]
 */
const {ComponentName}: React.FC<{ComponentName}Props> = ({
  size = 64,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* SVG 내용 */}
    </svg>
  );
};

export default {ComponentName};
\`\`\`

**SVG 스타일 가이드:**
- viewBox는 "0 0 64 64" 고정
- 최소 3가지 이상의 그라디언트 사용
- \`<defs>\` 섹션에 모든 그라디언트 정의
- radialGradient, linearGradient 적절히 활용
- filter 효과 사용 (drop-shadow, blur 등)
- 투명도(opacity) 활용하여 깊이감 표현

**색상 선택:**
- 단어의 의미와 어울리는 색상 팔레트
- 최소 4-6가지 색상 사용
- 생동감 있는 채도 높은 색상 선호
- 그라디언트로 색상 전환을 부드럽게

#### 3. 예시 참고

**좋은 예시 (참고만 하세요, 복사 금지):**

\`\`\`tsx
// BereshitIconColorful - 일출 장면
<defs>
  <radialGradient id="sunGradient">
    <stop offset="0%" stopColor="#FFD700" />
    <stop offset="50%" stopColor="#FFA500" />
    <stop offset="100%" stopColor="#FF6B35" />
  </radialGradient>
</defs>

<circle cx="32" cy="28" r="12" fill="url(#sunGradient)"
  filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))" />
\`\`\`

\`\`\`tsx
// ElohimIconColorful - 왕관과 빛
<path d="M 12 48 L 16 36 L 22 40 L 32 28 L 42 40 L 48 36 L 52 48 Z"
  fill="url(#crownGradient)"
  filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" />
\`\`\`

#### 4. 창의적 요소 추가

단어의 의미에 맞는 추가 요소들:
- 배경 효과 (하늘, 땅, 우주 등)
- 상징적 오브젝트
- 빛나는 효과, 반짝임
- 움직임을 암시하는 선들
- 신학적 상징 (삼위일체, 십자가 등 - 적절할 경우)

#### 5. 컴포넌트 명명 규칙

- PascalCase 사용
- "IconColorful" 접미사 추가
- 히브리어 영어 표기 기반

**예시:**
- בְּרֵאשִׁית → BereshitIconColorful
- אֱלֹהִים → ElohimIconColorful
- הָאָרֶץ → HaaretzIconColorful
- הַשָּׁמַיִם → HashamayimIconColorful

### 출력 형식

완전한 TypeScript React 컴포넌트 코드를 출력해주세요.

**파일명**: \`{ComponentName}.tsx\`

### 중요 주의사항

⚠️ **복사 금지**: 예시 코드를 그대로 복사하지 말고, 단어의 의미에 맞게 완전히 새로운 디자인을 창조하세요.

✅ **창의성**: 단어의 핵심 의미를 가장 잘 표현하는 독창적인 비주얼을 만드세요.

🎨 **색상 풍부**: 최소 4-6가지 색상을 사용하여 화려하게 만드세요.

💫 **특별 효과**: drop-shadow, opacity, 그라디언트를 적극 활용하세요.

---

**단어**: ${word.hebrew} (${word.meaning})
**목표**: 이 단어를 영원히 기억할 수 있는 강력한 비주얼 아이콘!
`.trim();
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(`
사용법:
  tsx scripts/icons/generateIconPrompt.ts <히브리어> <의미> <한글발음> [문맥]

예시:
  tsx scripts/icons/generateIconPrompt.ts "הָאָרֶץ" "땅, 지구" "하아레츠"
  tsx scripts/icons/generateIconPrompt.ts "הַשָּׁמַיִם" "하늘" "하샤마임" "창세기 1:1에서 하나님이 창조하신 하늘"
    `);
    process.exit(1);
  }

  const word: WordInfo = {
    hebrew: args[0],
    meaning: args[1],
    korean: args[2],
    context: args[3]
  };

  const prompt = generateIconPrompt(word);
  console.log(prompt);
}
