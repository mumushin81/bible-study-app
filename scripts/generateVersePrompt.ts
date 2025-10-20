/**
 * 구절 컨텐츠 생성 프롬프트 생성기 (Supabase 통합)
 *
 * Supabase에서 구절을 조회하여 Claude Code에서 사용할
 * 프롬프트를 생성합니다.
 *
 * 사용법:
 *   tsx scripts/generateVersePrompt.ts <verse_ids>
 *
 * 예시:
 *   tsx scripts/generateVersePrompt.ts gen2-4
 *   tsx scripts/generateVersePrompt.ts gen2-4,gen2-5,gen2-6
 *   tsx scripts/generateVersePrompt.ts gen2-4~gen2-7
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 환경변수 로드
dotenv.config({ path: '.env.local' });

// 로그 헬퍼
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

/**
 * Supabase 클라이언트 생성
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('환경 변수가 설정되지 않았습니다.');
    log.info('.env.local 파일에 다음을 추가해주세요:');
    log.info('  VITE_SUPABASE_URL=...');
    log.info('  SUPABASE_SERVICE_ROLE_KEY=...');
    process.exit(1);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * VERSE_CREATION_GUIDELINES.md 읽기
 */
function loadGuidelines(): string {
  const guidelinesPath = path.join(process.cwd(), 'VERSE_CREATION_GUIDELINES.md');

  if (!fs.existsSync(guidelinesPath)) {
    log.error('VERSE_CREATION_GUIDELINES.md 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  return fs.readFileSync(guidelinesPath, 'utf-8');
}

/**
 * Genesis 1장 참고 예시 읽기
 */
function loadGenesis1Examples(): string {
  const versesPath = path.join(process.cwd(), 'src/data/verses.ts');

  if (!fs.existsSync(versesPath)) {
    log.warn('src/data/verses.ts 파일을 찾을 수 없습니다.');
    return '';
  }

  const fullContent = fs.readFileSync(versesPath, 'utf-8');

  // Genesis 1:1, 1:2, 1:3 예시만 추출
  return fullContent.substring(0, 8000) + '\n... (생략) ...';
}

/**
 * verse_id 범위 파싱
 */
function parseVerseIds(input: string): string[] {
  // 쉼표로 구분
  if (input.includes(',')) {
    return input.split(',').map(id => id.trim());
  }

  // 범위 지정 (gen2-4~gen2-7)
  if (input.includes('~')) {
    const [start, end] = input.split('~').map(id => id.trim());
    const startMatch = start.match(/^(\w+)(\d+)-(\d+)$/);
    const endMatch = end.match(/^(\w+)(\d+)-(\d+)$/);

    if (!startMatch || !endMatch) {
      log.error(`범위 형식이 잘못되었습니다: ${input}`);
      process.exit(1);
    }

    const [, book, chapter, startVerse] = startMatch;
    const [, , , endVerse] = endMatch;

    const result: string[] = [];
    for (let v = parseInt(startVerse); v <= parseInt(endVerse); v++) {
      result.push(`${book}${chapter}-${v}`);
    }
    return result;
  }

  // 단일 verse_id
  return [input];
}

/**
 * Supabase에서 구절 조회
 */
async function fetchVerses(
  supabase: ReturnType<typeof createSupabaseClient>,
  verseIds: string[]
) {
  log.info(`${verseIds.length}개 구절 조회 중...`);

  const verses = [];

  for (const verseId of verseIds) {
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .eq('id', verseId)
      .single();

    if (error || !data) {
      log.error(`구절을 찾을 수 없습니다: ${verseId}`);
      continue;
    }

    verses.push(data);
  }

  log.success(`${verses.length}개 구절 조회 완료`);
  return verses;
}

/**
 * 프롬프트 생성
 */
function generatePrompt(
  verses: any[],
  guidelines: string,
  examples: string
): string {
  const versesInfo = verses.map(v => `
**${v.reference}** (ID: ${v.id})
- Hebrew: ${v.hebrew}
${v.ipa ? `- IPA (기존): ${v.ipa}` : '- IPA: (생성 필요)'}
${v.korean_pronunciation ? `- Korean Pronunciation (기존): ${v.korean_pronunciation}` : '- Korean Pronunciation: (생성 필요)'}
${v.modern ? `- Modern (기존): ${v.modern}` : '- Modern: (생성 필요)'}
`).join('\n');

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 구절 컨텐츠 생성 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 생성 대상 구절

${versesInfo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 작업 요청

다음 구절들에 대해 **전체 컨텐츠**를 생성해주세요:
1. IPA 발음 (없는 경우)
2. 한글 발음 (없는 경우)
3. 현대어 의역 (없는 경우)
4. 단어 분석 (words)
5. 주석 (commentary)

각 구절마다 다음 형식의 JSON을 생성해주세요:

\`\`\`json
{
  "verse_id": "gen2-4",
  "ipa": "히브리어 전체의 IPA 발음",
  "korean_pronunciation": "히브리어 전체의 한글 발음",
  "modern": "현대어 자연스러운 의역 (한 문장)",
  "words": [
    {
      "hebrew": "히브리어 단어",
      "meaning": "한국어 의미",
      "ipa": "IPA 발음",
      "korean": "한글 발음",
      "root": "히브리어 어근 (한글)",
      "grammar": "문법 정보",
      "emoji": "이모지",
      "structure": "구조 설명 (선택)",
      "category": "카테고리 (선택)",
      "relatedWords": ["관련 단어 1", "관련 단어 2"]
    }
  ],
  "commentary": {
    "intro": "서론 2-3문장",
    "sections": [
      {
        "emoji": "1️⃣",
        "title": "히브리어 (한글 발음) - 설명",
        "description": "단어/개념 설명 2-3문장",
        "points": ["포인트1", "포인트2", "포인트3"],
        "color": "purple"
      }
    ],
    "whyQuestion": {
      "question": "어린이를 위한 질문",
      "answer": "어린이가 이해할 수 있는 답변 3-5문장",
      "bibleReferences": [
        "책 장:절 - '인용문'",
        "책 장:절 - '인용문'"
      ]
    },
    "conclusion": {
      "title": "💡 신학적 의미",
      "content": "신학적 의미 2-3문장"
    }
  }
}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 가이드라인 (필독!)

<details>
<summary>VERSE_CREATION_GUIDELINES.md</summary>

\`\`\`markdown
${guidelines}
\`\`\`

</details>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Genesis 1장 참고 예시

<details>
<summary>Genesis 1장 예시 코드</summary>

\`\`\`typescript
${examples}
\`\`\`

</details>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 중요 체크리스트

생성 시 반드시 확인해주세요:

### 기본 정보
- [ ] IPA 발음이 정확한가?
- [ ] 한글 발음이 읽기 쉬운가?
- [ ] 현대어 의역이 자연스러운가? (직역이 아닌 의역)

### 단어 분석
- [ ] 모든 단어에 emoji가 있는가?
- [ ] 섹션 제목이 "히브리어 (발음) - 설명" 형식인가?
- [ ] sections가 2-4개인가?
- [ ] 각 섹션의 points가 3-4개인가?
- [ ] color는 "purple", "blue", "green", "pink", "orange", "yellow" 중 하나인가?
- [ ] whyQuestion과 conclusion이 있는가?
- [ ] bibleReferences가 "책 장:절 - '인용문'" 형식인가?
- [ ] conclusion.title이 "💡 신학적 의미"인가?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 출력 형식

여러 구절인 경우, JSON 배열로 출력해주세요:

\`\`\`json
[
  { "verse_id": "gen2-4", "words": [...], "commentary": {...} },
  { "verse_id": "gen2-5", "words": [...], "commentary": {...} },
  { "verse_id": "gen2-6", "words": [...], "commentary": {...} }
]
\`\`\`

생성이 완료되면, 결과를 \`data/generated/verses-{timestamp}.json\` 형식으로
저장하고, 다음 명령어로 Supabase에 업로드하세요:

\`\`\`bash
npm run save:verse -- data/generated/verses-{timestamp}.json
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이제 위 구절들에 대한 컨텐츠를 생성해주세요! 🙏
`.trim();
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);

  // 사용법 출력
  if (args.length === 0) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 구절 컨텐츠 생성 프롬프트 생성기 (Supabase 통합)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

사용법:
  tsx scripts/generateVersePrompt.ts <verse_ids>

예시:
  tsx scripts/generateVersePrompt.ts gen2-4
  tsx scripts/generateVersePrompt.ts gen2-4,gen2-5,gen2-6
  tsx scripts/generateVersePrompt.ts gen2-4~gen2-7

필요한 환경 변수:
  VITE_SUPABASE_URL         Supabase 프로젝트 URL
  SUPABASE_SERVICE_ROLE_KEY  Supabase 서비스 롤 키

워크플로우:
  1. 이 스크립트로 프롬프트 생성
  2. 프롬프트를 Claude Code에 붙여넣기
  3. 생성된 JSON을 파일로 저장
  4. npm run save:verse로 Supabase에 업로드

비용: 무료 (Claude Code 구독 플랜에 포함)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    process.exit(0);
  }

  const verseIdsInput = args[0];

  // verse_id 파싱
  const verseIds = parseVerseIds(verseIdsInput);
  log.step(`생성 대상: ${verseIds.length}개 구절`);
  verseIds.forEach(id => log.info(`  - ${id}`));

  // Supabase 클라이언트 생성
  const supabase = createSupabaseClient();
  log.success('Supabase 연결 완료');

  // 구절 조회
  const verses = await fetchVerses(supabase, verseIds);

  if (verses.length === 0) {
    log.error('조회된 구절이 없습니다.');
    process.exit(1);
  }

  // 가이드라인 및 예시 로드
  const guidelines = loadGuidelines();
  const examples = loadGenesis1Examples();
  log.success('가이드라인 및 예시 로드 완료');

  // 프롬프트 생성
  const prompt = generatePrompt(verses, guidelines, examples);

  // 화면 출력
  console.log('\n\n');
  console.log(prompt);
  console.log('\n\n');

  // 파일 저장
  const promptsDir = path.join(process.cwd(), 'data/prompts');
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }

  const filename = `verses-${verseIds.join('-')}.md`;
  const filepath = path.join(promptsDir, filename);
  fs.writeFileSync(filepath, prompt, 'utf-8');

  log.success(`프롬프트 파일 저장: ${filepath}`);
  log.info('');
  log.step('다음 단계:');
  log.info('1. 위 프롬프트를 Claude Code에 붙여넣기');
  log.info('2. 생성된 JSON을 data/generated/ 폴더에 저장');
  log.info('3. npm run save:verse -- <json_파일_경로> 실행');
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log.error(`실행 중 오류 발생: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}
