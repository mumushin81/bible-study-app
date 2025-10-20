#!/usr/bin/env node

/**
 * 구절 컨텐츠 생성 프롬프트 생성기 (수동 워크플로우)
 *
 * Supabase에서 히브리어 원문을 조회하여
 * Claude Code에서 사용할 프롬프트를 생성합니다.
 *
 * 사용법:
 *   npm run generate:prompt <bookId> [chapter] [limit]
 *   npm run generate:prompt genesis 2 4
 *   npm run generate:prompt genesis 2
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { log } from '../utils/logger.js'
import { fetchEmptyVerses } from './fetchEmptyVerses.js'
import type { EmptyVerse } from './types.js'

/**
 * VERSE_CREATION_GUIDELINES.md 읽기
 */
function loadGuidelines(): string {
  const guidelinesPath = join(process.cwd(), 'VERSE_CREATION_GUIDELINES.md')

  if (!existsSync(guidelinesPath)) {
    log.error('VERSE_CREATION_GUIDELINES.md 파일을 찾을 수 없습니다.')
    process.exit(1)
  }

  return readFileSync(guidelinesPath, 'utf-8')
}

/**
 * 프롬프트 생성
 */
function generatePrompt(verses: EmptyVerse[], guidelines: string): string {
  const versesInfo = verses
    .map(
      v => `
**${v.reference}** (ID: ${v.id})
- Book ID: ${v.book_id}
- Chapter: ${v.chapter}
- Verse: ${v.verse_number}
- Hebrew: ${v.hebrew}
`
    )
    .join('\n')

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 구절 컨텐츠 생성 요청 (수동 워크플로우)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 생성 대상 구절

${versesInfo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 작업 요청

다음 구절들에 대해 **전체 컨텐츠**를 생성해주세요:
1. IPA 발음
2. 한글 발음
3. 현대어 의역
4. 단어 분석 (words)
5. 주석 (commentary)

**각 구절마다** 다음 형식의 JSON을 생성해주세요:

\`\`\`json
{
  "verseId": "${verses[0]?.id || 'genesis_1_1'}",
  "ipa": "히브리어 전체의 IPA 발음",
  "koreanPronunciation": "히브리어 전체의 한글 발음",
  "modern": "현대어 자연스러운 의역 (한 문장)",
  "literal": "직역 (선택사항)",
  "translation": "기타 번역 (선택사항)",
  "words": [
    {
      "hebrew": "히브리어 단어",
      "meaning": "한국어 의미",
      "ipa": "IPA 발음",
      "korean": "한글 발음",
      "root": "히브리어 어근 (한글 발음)",
      "grammar": "문법 정보",
      "emoji": "이모지 (필수)",
      "structure": "구조 설명 (선택)",
      "category": "noun|verb|adjective|preposition|particle (선택)"
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
<summary>VERSE_CREATION_GUIDELINES.md 전문</summary>

\`\`\`markdown
${guidelines}
\`\`\`

</details>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 중요 체크리스트

생성 시 반드시 확인해주세요:

### 기본 정보
- [ ] verseId가 정확한가? (예: genesis_2_4)
- [ ] IPA 발음이 정확한가?
- [ ] 한글 발음이 읽기 쉬운가?
- [ ] 현대어 의역이 자연스러운가? (직역 아님)

### 단어 분석
- [ ] 모든 단어에 emoji가 있는가?
- [ ] root가 "히브리어 (한글)" 형식인가?

### Commentary
- [ ] intro가 2-3문장인가?
- [ ] sections가 2-4개인가?
- [ ] **각 섹션 title이 "히브리어 (한글 발음) - 설명" 형식인가?** ⚠️
- [ ] 각 섹션의 points가 3-4개인가?
- [ ] color가 purple, blue, green, pink, orange, yellow 중 하나인가?
- [ ] 각 섹션의 색상이 중복되지 않는가?
- [ ] whyQuestion이 있는가?
- [ ] bibleReferences가 "책 장:절 - '인용문'" 형식인가?
- [ ] conclusion.title이 정확히 "💡 신학적 의미"인가?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 출력 형식

${verses.length > 1 ? '여러 구절인 경우, JSON 배열로 출력해주세요:' : '단일 구절인 경우, JSON 객체로 출력해주세요:'}

${
  verses.length > 1
    ? `\`\`\`json
[
  { "verseId": "${verses[0]?.id}", ... },
  { "verseId": "${verses[1]?.id}", ... }
]
\`\`\``
    : `\`\`\`json
{ "verseId": "${verses[0]?.id}", ... }
\`\`\``
}

생성이 완료되면:
1. 결과를 \`data/generated/\` 폴더에 JSON 파일로 저장
2. 다음 명령어로 Supabase에 저장:

\`\`\`bash
npm run save:content -- data/generated/<파일명>.json
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이제 위 구절들에 대한 컨텐츠를 생성해주세요! 🙏
`.trim()
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2)

  // 도움말
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📖 구절 컨텐츠 생성 프롬프트 생성기 (수동 워크플로우)

Supabase에서 히브리어 원문을 조회하여 프롬프트를 생성합니다.

사용법:
  npm run generate:prompt <bookId> [chapter] [limit]

예시:
  npm run generate:prompt genesis 2 4      # Genesis 2장, 4개 구절
  npm run generate:prompt genesis 2        # Genesis 2장 전체
  npm run generate:prompt genesis          # Genesis 전체

워크플로우:
  1. 이 명령어로 프롬프트 생성
  2. 출력된 프롬프트를 복사
  3. Claude Code에 붙여넣기
  4. 생성된 JSON을 data/generated/ 폴더에 저장
  5. npm run save:content로 Supabase에 업로드

비용: 무료 (Claude Code 구독에 포함)
    `)
    process.exit(0)
  }

  const bookId = args[0]
  const chapter = args[1] ? parseInt(args[1]) : undefined
  const limit = args[2] ? parseInt(args[2]) : undefined

  try {
    log.step('빈 구절 조회 중...')

    // Supabase에서 빈 구절 조회
    const verses = await fetchEmptyVerses(bookId, chapter, limit)

    if (verses.length === 0) {
      log.success('모든 구절에 컨텐츠가 있습니다!')
      process.exit(0)
    }

    log.success(`${verses.length}개 구절 찾음`)

    // 가이드라인 로드
    const guidelines = loadGuidelines()

    // 프롬프트 생성
    const prompt = generatePrompt(verses, guidelines)

    // 화면 출력
    console.log('\n\n')
    console.log(prompt)
    console.log('\n\n')

    // 파일 저장
    const promptsDir = join(process.cwd(), 'data/prompts')
    if (!existsSync(promptsDir)) {
      mkdirSync(promptsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const filename = `${bookId}${chapter ? `_${chapter}` : ''}_${timestamp}.md`
    const filepath = join(promptsDir, filename)
    writeFileSync(filepath, prompt, 'utf-8')

    log.success(`프롬프트 파일 저장: ${filepath}`)
    log.info('')
    log.step('다음 단계:')
    log.info('1. 위 프롬프트를 복사하여 Claude Code에 붙여넣기')
    log.info('2. 생성된 JSON을 data/generated/ 폴더에 저장')
    log.info('3. npm run save:content -- <json_파일_경로> 실행')
  } catch (err) {
    log.error(`오류 발생: ${err}`)
    process.exit(1)
  }
}

// 실행
main()
