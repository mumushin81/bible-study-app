import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const anthropicKey = process.env.ANTHROPIC_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

interface WordData {
  id: string;
  hebrew: string;
  meaning: string;
  korean: string;
  grammar: string;
  root: string;
  verse_reference: string;
}

interface Progress {
  completed: string[];
  failed: Array<{ meaning: string; error: string }>;
  lastIndex: number;
  generatedSVGs: Record<string, string>;
}

const PROGRESS_FILE = 'svg_generation_progress.json';

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { completed: [], failed: [], lastIndex: -1, generatedSVGs: {} };
}

function saveProgress(progress: Progress): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

async function generateSVG(word: WordData): Promise<string> {
  const prompt = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 히브리어 단어 SVG 아이콘 생성 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 단어 정보

**히브리어**: ${word.hebrew}
**의미**: ${word.meaning}
**한글 발음**: ${word.korean}
**문법**: ${word.grammar}
**어근**: ${word.root}
**출처**: ${word.verse_reference}

## 작업 요구사항

### 🎯 목표
위 히브리어 단어의 **의미(${word.meaning})**를 시각적으로 표현하는 **인라인 SVG 문자열**을 생성하세요.

### 📐 필수 기술 규격

#### 1. 기본 구조
\`\`\`xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs>[gradients]</defs>[content]</svg>
\`\`\`

**필수 항목:**
- ✅ \`viewBox="0 0 64 64"\` (반드시 이 크기)
- ✅ \`xmlns="http://www.w3.org/2000/svg"\`
- ✅ 한 줄로 작성 (줄바꿈 없음)
- ✅ \`<defs>\` 태그로 그라디언트 정의
- ❌ \`width\`, \`height\` 속성 사용 금지

#### 2. Gradient ID 명명 규칙

**형식**: \`{단어의미축약}-{요소}-{번호}\`

**예시:**
- "하나님" → \`god-crown-1\`, \`god-light-1\`
- "빛" → \`light-beam-1\`, \`light-glow-1\`
- "땅" → \`earth-ground-1\`, \`earth-core-1\`

**중요**: 절대로 일반적인 ID 사용 금지!
❌ \`gradient1\`, \`gradient\`, \`grad1\`, \`g1\`, \`linear1\` 등

#### 3. 그라디언트 사용 (필수)

**LinearGradient**:
\`\`\`xml
<linearGradient id="{unique-id}-1" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="#FFD700"/>
  <stop offset="100%" stop-color="#FFA500"/>
</linearGradient>
\`\`\`

**RadialGradient**:
\`\`\`xml
<radialGradient id="{unique-id}-glow-1">
  <stop offset="0%" stop-color="#FFFFFF"/>
  <stop offset="100%" stop-color="#FFD700"/>
</radialGradient>
\`\`\`

#### 4. Filter 효과 (필수)

**표준 drop-shadow**:
\`\`\`xml
filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
\`\`\`

**색상 후광** (신성한 오브젝트):
\`\`\`xml
filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))"
\`\`\`

#### 5. 색상 가이드

| 의미 | 추천 색상 |
|------|----------|
| 하나님, 신성 | #FFD700 (골드) |
| 하늘, 영적 | #4A90E2 (블루), #7B68EE (퍼플) |
| 사랑, 생명 | #e74c3c (레드), #FF69B4 (핑크) |
| 자연, 성장 | #2ECC71 (그린) |
| 인간, 땅 | #8B4513 (브라운) |
| 금속, 도구 | #C0C0C0 (실버) |
| 물 | #4A90E2 (블루), #3498db (청색) |
| 불, 빛 | #FFD700 (골드), #FFA500 (주황) |

### 🎨 디자인 원칙

1. **시각적 계층**: 메인 심볼 → 보조 요소 → 배경/효과
2. **단순성**: 3-5개 주요 요소로 구성
3. **명확성**: 의미를 직관적으로 전달
4. **일관성**: 부드러운 라운드 코너, 그라디언트, drop-shadow

### 📏 품질 기준

- ✅ 파일 크기: 500-1500자 (최대 3000자)
- ✅ 그라디언트 2-3개 사용
- ✅ drop-shadow 효과 필수
- ✅ 고유한 gradient ID
- ✅ opacity 활용

### ⚠️ 출력 형식

**오직 SVG 문자열만 출력하세요 (한 줄로, 설명 없이):**

IMPORTANT: Output ONLY the SVG string. No explanations, no markdown code blocks, no additional text.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let svg = content.text.trim();

  // Remove markdown code blocks if present
  svg = svg.replace(/^```xml\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
  svg = svg.trim();

  // Validate basic structure
  if (!svg.startsWith('<svg')) {
    throw new Error('Invalid SVG: does not start with <svg>');
  }
  if (!svg.includes('viewBox="0 0 64 64"')) {
    throw new Error('Invalid SVG: missing viewBox="0 0 64 64"');
  }
  if (!svg.includes('<defs>')) {
    throw new Error('Invalid SVG: missing <defs> tag');
  }

  return svg;
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('창세기 1장 SVG 아이콘 생성');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load words
  const wordsData = JSON.parse(fs.readFileSync('genesis1_words.json', 'utf-8'));
  const words: WordData[] = wordsData.words;

  console.log(`총 ${words.length}개 단어\n`);

  // Load progress
  const progress = loadProgress();
  console.log(`진행 상황: ${progress.completed.length}/${words.length} 완료\n`);

  let successCount = progress.completed.length;
  let failCount = progress.failed.length;

  for (let i = progress.lastIndex + 1; i < words.length; i++) {
    const word = words[i];

    console.log(`[${i + 1}/${words.length}] ${word.meaning} (${word.hebrew})`);

    if (progress.completed.includes(word.meaning)) {
      console.log('  ⏭️  이미 완료됨\n');
      continue;
    }

    try {
      const svg = await generateSVG(word);
      console.log(`  ✅ SVG 생성 완료 (${svg.length}자)`);

      // Update DB by meaning
      const { error } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('meaning', word.meaning);

      if (error) {
        throw new Error(`DB 업데이트 실패: ${error.message}`);
      }

      console.log(`  💾 DB 업데이트 완료\n`);

      progress.completed.push(word.meaning);
      progress.generatedSVGs[word.meaning] = svg;
      progress.lastIndex = i;
      successCount++;

      saveProgress(progress);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err: any) {
      console.log(`  ❌ 실패: ${err.message}\n`);
      progress.failed.push({ meaning: word.meaning, error: err.message });
      failCount++;
      saveProgress(progress);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('생성 완료');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`📊 진행률: ${Math.round((successCount / words.length) * 100)}%`);

  if (failCount > 0) {
    console.log('\n실패한 단어:');
    progress.failed.forEach(f => {
      console.log(`  - ${f.meaning}: ${f.error}`);
    });
  }
}

main();
