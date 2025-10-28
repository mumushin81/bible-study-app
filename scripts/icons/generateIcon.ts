#!/usr/bin/env tsx

/**
 * 히브리어 단어 아이콘 자동 생성 스크립트
 * Claude API를 사용하여 SVG 아이콘을 자동 생성합니다
 */

import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { generateIconPrompt } from './generateIconPrompt.js'

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  context?: string
}

interface GenerateIconOptions {
  outputDir?: string
  componentName?: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

/**
 * 히브리어를 컴포넌트 이름으로 변환
 */
function hebrewToComponentName(hebrew: string): string {
  // 간단한 매핑 (확장 가능)
  const mappings: Record<string, string> = {
    'בְּרֵאשִׁית': 'Bereshit',
    'אֱלֹהִים': 'Elohim',
    'בָּרָא': 'Bara',
    'הָאָרֶץ': 'Haaretz',
    'הַשָּׁמַיִם': 'Hashamayim',
    'אוֹר': 'Or',
    'חֹשֶׁךְ': 'Choshek',
    'מַיִם': 'Mayim',
    'נָחָשׁ': 'Nachash',
    'עֵץ': 'Etz',
    'חַיִּים': 'Chayim',
    'אִשָּׁה': 'Isha',
    'אָדָם': 'Adam',
    'גַּן': 'Gan',
    'עֵדֶן': 'Eden',
  }

  // 니쿠드 제거한 버전으로도 시도
  const normalized = hebrew.replace(/[\u0591-\u05C7]/g, '')

  for (const [key, value] of Object.entries(mappings)) {
    const normalizedKey = key.replace(/[\u0591-\u05C7]/g, '')
    if (normalized === normalizedKey || hebrew === key) {
      return value
    }
  }

  // 기본값: 히브리어를 그대로 사용 (ASCII 변환)
  return 'Word' + Math.random().toString(36).substring(2, 8)
}

/**
 * 아이콘 자동 생성
 */
export async function generateIcon(
  word: WordInfo,
  options: GenerateIconOptions = {}
): Promise<string> {
  const componentName = options.componentName || hebrewToComponentName(word.hebrew) + 'IconColorful'
  const outputDir = options.outputDir || join(process.cwd(), 'src/components/icons')

  console.log(`\n🎨 ${word.hebrew} (${word.meaning}) 아이콘 생성 중...`)
  console.log(`📝 컴포넌트 이름: ${componentName}`)

  // 프롬프트 생성
  const prompt = generateIconPrompt(word)

  // Claude API 호출
  console.log('🤖 Claude API 호출 중...')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  // 응답에서 코드 추출
  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('응답 형식이 올바르지 않습니다')
  }

  let code = content.text

  // ```tsx 또는 ``` 코드 블록에서 코드 추출
  const codeBlockMatch = code.match(/```(?:tsx|typescript|jsx)?\n([\s\S]*?)```/)
  if (codeBlockMatch) {
    code = codeBlockMatch[1]
  }

  // 컴포넌트 이름 치환 확인
  if (!code.includes(componentName)) {
    console.warn('⚠️  생성된 코드에 컴포넌트 이름이 없습니다. 수동 교체 중...')
    // 일반적인 패턴 찾아서 교체
    code = code.replace(/const\s+\w+IconColorful/g, `const ${componentName}`)
    code = code.replace(/export default \w+IconColorful/g, `export default ${componentName}`)
  }

  // 파일 저장
  const filename = `${componentName}.tsx`
  const filepath = join(outputDir, filename)

  writeFileSync(filepath, code, 'utf-8')

  console.log(`✅ 생성 완료: ${filepath}`)
  console.log(`📊 코드 크기: ${code.length} bytes`)

  return filepath
}

/**
 * 여러 단어 일괄 생성
 */
export async function generateIconsBatch(words: WordInfo[]): Promise<string[]> {
  console.log(`\n🚀 ${words.length}개 아이콘 일괄 생성 시작\n`)

  const results: string[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    console.log(`\n[${i + 1}/${words.length}] 처리 중...`)

    try {
      const filepath = await generateIcon(word)
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
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
🎨 히브리어 단어 아이콘 자동 생성 도구

사용법:
  1. 단일 단어 생성:
     tsx scripts/icons/generateIcon.ts <히브리어> <의미> <한글발음> [문맥]

  2. 일괄 생성:
     tsx scripts/icons/generateIcon.ts --batch

예시:
  tsx scripts/icons/generateIcon.ts "הָאָרֶץ" "땅, 지구" "하아레츠"
  tsx scripts/icons/generateIcon.ts "הַשָּׁמַיִם" "하늘" "하샤마임" "창세기 1:1"
  tsx scripts/icons/generateIcon.ts --batch

필수 환경 변수:
  ANTHROPIC_API_KEY - Claude API 키
    `)
    process.exit(1)
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다')
    process.exit(1)
  }

  if (args[0] === '--batch') {
    // 일괄 생성 모드
    const commonWords: WordInfo[] = [
      { hebrew: 'הָאָרֶץ', meaning: '땅, 지구', korean: '하아레츠', context: '하나님이 창조하신 물리적 세계' },
      { hebrew: 'הַשָּׁמַיִם', meaning: '하늘들', korean: '하샤마임', context: '복수형으로 하늘의 광대함 표현' },
      { hebrew: 'אוֹר', meaning: '빛', korean: '오르', context: '하나님의 첫 창조 명령' },
      { hebrew: 'מַיִם', meaning: '물', korean: '마임', context: '생명의 근원' },
      { hebrew: 'עֵץ', meaning: '나무', korean: '에츠', context: '선악과 나무, 생명나무' },
    ]

    generateIconsBatch(commonWords)
      .then(() => console.log('\n🎉 모든 아이콘 생성 완료!'))
      .catch(err => {
        console.error('\n❌ 오류 발생:', err)
        process.exit(1)
      })
  } else {
    // 단일 생성 모드
    if (args.length < 3) {
      console.error('❌ 인자가 부족합니다')
      process.exit(1)
    }

    const word: WordInfo = {
      hebrew: args[0],
      meaning: args[1],
      korean: args[2],
      context: args[3]
    }

    generateIcon(word)
      .then(filepath => console.log(`\n🎉 아이콘 생성 완료: ${filepath}`))
      .catch(err => {
        console.error('\n❌ 오류 발생:', err)
        process.exit(1)
      })
  }
}
