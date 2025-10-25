#!/usr/bin/env tsx

/**
 * 히브리어 단어를 JPG 아이콘으로 생성하는 스크립트
 * - SVG 대신 JPG 형식 사용
 * - 어두운 색상 절대 사용 금지
 * - 밝고 화려한 색상만 사용
 */

import { config } from 'dotenv'
import { existsSync as fileExists } from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// .env.local도 읽기
if (fileExists('.env.local')) {
  config({ path: '.env.local' })
} else {
  config()
}

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  ipa?: string
  context?: string
}

interface GenerateJpgOptions {
  outputDir?: string
  width?: number
  height?: number
  quality?: number
  backgroundColor?: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

/**
 * 밝은 색상 팔레트만 사용하는 SVG 아이콘 프롬프트 생성
 */
function generateBrightIconPrompt(word: WordInfo): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 히브리어 단어 JPG 아이콘 생성 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 단어 정보

**히브리어**: ${word.hebrew}
**의미**: ${word.meaning}
**한글 발음**: ${word.korean}
${word.ipa ? `**IPA 발음**: ${word.ipa}` : ''}
${word.context ? `**문맥**: ${word.context}` : ''}

## 작업 지시

위 히브리어 단어의 의미를 시각적으로 표현하는 **밝고 화려한 SVG 아이콘**을 생성해주세요.

### 🚨 필수 제약사항: 밝은 색상만 사용

**절대 사용 금지 색상 (어두운 색상):**
- ❌ #000000 (검정)
- ❌ #1C1C1C, #2C2C2C 등 진한 회색
- ❌ #000428, #001a33 등 진한 네이비
- ❌ #1B5E20, #33691E 등 진한 녹색
- ❌ #8B3A62, #654321 등 진한 갈색
- ❌ 모든 어두운 계열 색상

**반드시 사용할 색상 (밝은 색상만):**
- ✅ 골드/옐로우: #FFD700, #FFA500, #FF8C00, #FFF4E6, #FEE140, #FFEB3B
- ✅ 밝은 블루: #4A90E2, #4FC3F7, #00F2FE, #4FACFE, #00CED1, #87CEEB
- ✅ 핑크/로즈: #FF69B4, #FF1493, #FF6B6B, #FA709A, #FFB6C1, #FFC0CB
- ✅ 밝은 그린: #2ECC71, #4CAF50, #7FE5A8, #AED581, #90EE90, #98FB98
- ✅ 퍼플/라벤더: #7B68EE, #667eea, #BA68C8, #E1BEE7, #DDA0DD
- ✅ 밝은 레드: #FF6B35, #FF6347, #FF7F50, #FFA07A
- ✅ 오렌지: #FFA500, #FFB84D, #FFD580
- ✅ 민트/터콰이즈: #00F5FF, #00E5FF, #A8EDEA, #7FDBFF
- ✅ 화이트: #FFFFFF, #FFF9E6, #FFFACD
- ✅ 파스텔 톤: 모든 밝은 파스텔 색상

### 필수 요구사항

#### 1. 디자인 컨셉
- **밝고 화려함**: 다채로운 그라디언트와 풍부한 밝은 색상
- **생동감**: 활기차고 긍정적인 느낌
- **상징성**: 단어의 의미를 직관적으로 표현
- **배경**: 밝은 색상 또는 화이트/파스텔 배경

#### 2. SVG 기술 요구사항

**필수 구조:**
\`\`\`xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="unique-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFA500"/>
    </linearGradient>
    <radialGradient id="unique-glow-1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FFD700"/>
    </radialGradient>
  </defs>

  <!-- 밝은 배경 -->
  <rect width="64" height="64" fill="#FFF9E6" rx="8"/>

  <!-- 메인 요소들 (밝은 색상만) -->
  <!-- ... -->
</svg>
\`\`\`

**필수 속성:**
- viewBox="0 0 64 64" 고정
- xmlns="http://www.w3.org/2000/svg" 필수
- 고유한 gradient ID (단어별로 다르게)
- filter 효과: drop-shadow (밝은 색상으로)
- 투명도 활용: opacity

**색상 선택 가이드:**
- **신성/하나님**: 골드 (#FFD700) + 밝은 오렌지 (#FFA500)
- **하늘**: 밝은 블루 (#4A90E2) + 밝은 터콰이즈 (#00F5FF)
- **생명/탄생**: 핑크 (#FF69B4) + 로즈 (#FFB6C1)
- **시간/날**: 골드 (#FFD700) + 옐로우 (#FFEB3B)
- **땅/자연**: 밝은 그린 (#4CAF50) + 라임 (#90EE90)
- **물/바다**: 터콰이즈 (#00CED1) + 아쿠아 (#7FDBFF)
- **빛**: 화이트 (#FFFFFF) + 골드 (#FFD700)

#### 3. 그라디언트 사용
- 최소 2-3개 이상의 밝은 그라디언트 사용
- linearGradient: 방향성 있는 표현
- radialGradient: 빛나는 효과, 후광

#### 4. 효과 사용
**Drop Shadow (밝은 색상):**
\`\`\`xml
filter="drop-shadow(0 2px 8px rgba(255, 215, 0, 0.6))"
filter="drop-shadow(0 0 12px rgba(255, 105, 180, 0.8))"
\`\`\`

**투명도:**
- 배경 요소: opacity="0.1-0.3"
- 보조 요소: opacity="0.4-0.7"
- 메인 요소: opacity="0.8-1.0"

### 출력 형식

**순수 SVG 코드만** 출력해주세요. (React 컴포넌트 아님)

예시:
\`\`\`svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 그라디언트 정의 -->
  </defs>
  <!-- SVG 요소들 -->
</svg>
\`\`\`

### 중요 체크리스트

- [ ] 어두운 색상 절대 사용 안 함
- [ ] 밝은 색상만 사용
- [ ] 배경도 밝은 색상
- [ ] 그림자도 밝은 색상
- [ ] viewBox="0 0 64 64" 사용
- [ ] 고유한 gradient ID
- [ ] drop-shadow 효과
- [ ] 단어 의미에 맞는 시각화

---

**단어**: ${word.hebrew} (${word.meaning})
**목표**: 밝고 화려한 JPG 아이콘으로 단어를 영원히 기억!
`.trim()
}

/**
 * Claude API를 사용하여 SVG 생성
 */
async function generateSvgWithClaude(word: WordInfo): Promise<string> {
  console.log(`🤖 Claude API로 SVG 생성 중: ${word.hebrew}`)

  const prompt = generateBrightIconPrompt(word)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('응답 형식이 올바르지 않습니다')
  }

  let svgCode = content.text

  // SVG 코드 블록 추출
  const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/i)
  if (svgMatch) {
    svgCode = svgMatch[0]
  } else {
    // ```svg 코드 블록에서 추출
    const codeBlockMatch = svgCode.match(/```(?:svg|xml)?\n?([\s\S]*?)```/)
    if (codeBlockMatch) {
      svgCode = codeBlockMatch[1].trim()
    }
  }

  return svgCode
}

/**
 * SVG를 JPG로 변환
 */
async function convertSvgToJpg(
  svgCode: string,
  options: GenerateJpgOptions = {}
): Promise<Buffer> {
  const {
    width = 512,
    height = 512,
    quality = 95,
    backgroundColor = '#FFFFFF'
  } = options

  console.log(`📸 SVG → JPG 변환 중 (${width}x${height}, quality: ${quality})`)

  // SVG를 Buffer로 변환
  const svgBuffer = Buffer.from(svgCode)

  // sharp로 JPG 변환
  const jpgBuffer = await sharp(svgBuffer)
    .resize(width, height)
    .flatten({ background: backgroundColor })
    .jpeg({ quality })
    .toBuffer()

  return jpgBuffer
}

/**
 * 히브리어를 파일명으로 변환
 */
function hebrewToFilename(hebrew: string): string {
  const mappings: Record<string, string> = {
    'בְּרֵאשִׁית': 'bereshit',
    'בָּרָא': 'bara',
    'אֱלֹהִים': 'elohim',
    'אֵת': 'et',
    'הַשָּׁמַיִם': 'hashamayim',
    'וְאֵת': 'veet',
    'הָאָרֶץ': 'haaretz',
  }

  // 니쿠드 제거
  const normalized = hebrew.replace(/[\u0591-\u05C7]/g, '')

  for (const [key, value] of Object.entries(mappings)) {
    const normalizedKey = key.replace(/[\u0591-\u05C7]/g, '')
    if (normalized === normalizedKey || hebrew === key) {
      return value
    }
  }

  return 'word_' + Math.random().toString(36).substring(2, 8)
}

/**
 * JPG 아이콘 생성
 */
export async function generateJpgIcon(
  word: WordInfo,
  options: GenerateJpgOptions = {}
): Promise<string> {
  const outputDir = options.outputDir || join(process.cwd(), 'output', 'genesis_1_1_jpg')
  const filename = hebrewToFilename(word.hebrew) + '.jpg'
  const filepath = join(outputDir, filename)

  // 출력 디렉토리 생성
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`🎨 ${word.hebrew} (${word.meaning})`)
  console.log(`📝 파일명: ${filename}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  try {
    // 1. SVG 생성
    const svgCode = await generateSvgWithClaude(word)

    // SVG 파일도 저장 (디버깅용)
    const svgFilepath = filepath.replace('.jpg', '.svg')
    writeFileSync(svgFilepath, svgCode, 'utf-8')
    console.log(`📄 SVG 저장: ${svgFilepath}`)

    // 2. JPG 변환
    const jpgBuffer = await convertSvgToJpg(svgCode, options)

    // 3. JPG 파일 저장
    writeFileSync(filepath, jpgBuffer)
    console.log(`✅ JPG 저장: ${filepath}`)
    console.log(`📊 파일 크기: ${Math.round(jpgBuffer.length / 1024)} KB`)

    return filepath
  } catch (error: any) {
    console.error(`❌ 오류 발생: ${error.message}`)
    throw error
  }
}

/**
 * 여러 단어 일괄 생성
 */
export async function generateJpgIconsBatch(
  words: WordInfo[],
  options: GenerateJpgOptions = {}
): Promise<string[]> {
  console.log(`\n🚀 ${words.length}개 JPG 아이콘 일괄 생성 시작\n`)

  const results: string[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    console.log(`\n[${i + 1}/${words.length}] 처리 중...`)

    try {
      const filepath = await generateJpgIcon(word, options)
      results.push(filepath)

      // API rate limit 방지
      if (i < words.length - 1) {
        console.log('⏳ 3초 대기 중...')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    } catch (error: any) {
      console.error(`❌ 실패: ${word.hebrew}`)
      console.error(error.message)
      results.push(`ERROR: ${word.hebrew}`)
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 완료: ${results.filter(r => !r.startsWith('ERROR')).length}/${words.length}`)
  console.log(`❌ 실패: ${results.filter(r => r.startsWith('ERROR')).length}/${words.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return results
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다')
    process.exit(1)
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 창세기 1:1 JPG 아이콘 생성기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ 특징:
- SVG 대신 JPG 형식
- 어두운 색상 절대 사용 금지
- 밝고 화려한 색상만 사용
- 512x512 고해상도 (변경 가능)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)

  // 창세기 1:1 데이터 읽기
  import('./readGenesis1_1.js').then(async ({ genesis1_1Words }) => {
    const options: GenerateJpgOptions = {
      outputDir: join(process.cwd(), 'output', 'genesis_1_1_jpg'),
      width: 512,
      height: 512,
      quality: 95,
      backgroundColor: '#FFFFFF'
    }

    await generateJpgIconsBatch(genesis1_1Words, options)
    console.log('\n🎉 모든 JPG 아이콘 생성 완료!')
  }).catch(err => {
    console.error('\n❌ 오류 발생:', err)
    process.exit(1)
  })
}
