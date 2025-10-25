#!/usr/bin/env tsx

/**
 * FLUX Schnell을 사용한 히브리어 단어 이미지 자동 생성 스크립트
 * Replicate API를 사용하여 플래시카드용 깊이있는 단어 이미지를 생성합니다
 */

import 'dotenv/config'
import Replicate from 'replicate'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { generateWordImagePrompt, generateSimplePrompt, WordInfo } from './generateImagePrompt.js'

interface GenerateImageOptions {
  outputDir?: string
  aspectRatio?: '1:1' | '16:9' | '9:16' | '21:9' | '3:2' | '2:3' | '4:5' | '5:4' | '3:4' | '4:3' | '9:21'
  outputFormat?: 'webp' | 'jpg' | 'png'
  outputQuality?: number
  goFast?: boolean
  numOutputs?: number
  seed?: number
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

/**
 * 히브리어를 파일명으로 변환 (니쿠드 제거)
 */
function hebrewToFilename(hebrew: string): string {
  // 니쿠드(발음 기호) 제거
  const withoutNikkud = hebrew.replace(/[\u0591-\u05C7]/g, '')

  // 히브리어 문자만 남기고 공백은 언더스코어로
  const cleaned = withoutNikkud.trim().replace(/\s+/g, '_')

  return cleaned
}

/**
 * FLUX Schnell로 단어 이미지 생성
 */
export async function generateWordImage(
  word: WordInfo,
  options: GenerateImageOptions = {}
): Promise<string[]> {
  const {
    outputDir = join(process.cwd(), 'public/images/words'),
    aspectRatio = '9:16', // 플래시카드 모바일 비율
    outputFormat = 'jpg', // JPG 기본
    outputQuality = 90,
    goFast = true,
    numOutputs = 1,
    seed,
  } = options

  // 출력 디렉토리 생성
  mkdirSync(outputDir, { recursive: true })

  const { hebrew, meaning, korean } = word
  const filename = hebrewToFilename(hebrew)

  console.log(`\n🎨 단어 이미지 생성: ${hebrew} (${korean})`)
  console.log(`📝 의미: ${meaning}`)

  // 프롬프트 생성
  const prompt = generateWordImagePrompt(word)
  console.log(`\n📋 프롬프트 미리보기:`)
  console.log(`${prompt.substring(0, 200)}...\n`)

  // Replicate API 호출
  console.log('🚀 FLUX Schnell API 호출 중...')
  console.log(`⚙️  설정: ${aspectRatio}, ${outputFormat}, 품질 ${outputQuality}`)

  const startTime = Date.now()

  const output = await replicate.run(
    'black-forest-labs/flux-schnell',
    {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        num_outputs: numOutputs,
        output_format: outputFormat,
        output_quality: outputQuality,
        go_fast: goFast,
        ...(seed && { seed }),
      }
    }
  ) as string[]

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`⏱️  생성 시간: ${duration}초`)

  // 이미지 다운로드 및 저장
  const savedPaths: string[] = []

  for (let i = 0; i < output.length; i++) {
    const imageUrl = output[i]
    console.log(`\n📥 이미지 다운로드 중 (${i + 1}/${output.length})...`)
    console.log(`🔗 URL: ${imageUrl}`)

    // 이미지 다운로드
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()

    // 파일명 생성
    const finalFilename = numOutputs > 1
      ? `${filename}_${i + 1}.${outputFormat}`
      : `${filename}.${outputFormat}`

    const filepath = join(outputDir, finalFilename)

    // 파일 저장
    writeFileSync(filepath, Buffer.from(buffer))

    console.log(`✅ 저장 완료: ${filepath}`)
    console.log(`📊 크기: ${(buffer.byteLength / 1024).toFixed(2)} KB`)

    savedPaths.push(filepath)
  }

  // 비용 계산 (FLUX Schnell: ~$0.003/이미지)
  const estimatedCost = (numOutputs * 0.003).toFixed(4)
  console.log(`\n💰 예상 비용: $${estimatedCost} (${numOutputs}장)`)

  return savedPaths
}

/**
 * 간단한 프롬프트로 이미지 생성 (테스트용)
 */
export async function generateSimpleImage(
  description: string,
  outputFilename: string,
  options: GenerateImageOptions = {}
): Promise<string> {
  const {
    outputDir = join(process.cwd(), 'public/images/test'),
    aspectRatio = '1:1',
    outputFormat = 'jpg',
    outputQuality = 90,
    goFast = true,
  } = options

  mkdirSync(outputDir, { recursive: true })

  console.log(`\n🎨 테스트 이미지 생성`)
  console.log(`📝 설명: ${description}`)

  const prompt = generateSimplePrompt(description)

  console.log('🚀 FLUX Schnell API 호출 중...')

  const startTime = Date.now()

  const output = await replicate.run(
    'black-forest-labs/flux-schnell',
    {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        num_outputs: 1,
        output_format: outputFormat,
        output_quality: outputQuality,
        go_fast: goFast,
      }
    }
  ) as string[]

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`⏱️  생성 시간: ${duration}초`)

  const imageUrl = output[0]
  console.log(`\n📥 이미지 다운로드 중...`)
  console.log(`🔗 URL: ${imageUrl}`)

  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()

  const filepath = join(outputDir, `${outputFilename}.${outputFormat}`)
  writeFileSync(filepath, Buffer.from(buffer))

  console.log(`✅ 저장 완료: ${filepath}`)
  console.log(`📊 크기: ${(buffer.byteLength / 1024).toFixed(2)} KB`)
  console.log(`💰 예상 비용: $0.003`)

  return filepath
}

/**
 * 여러 단어 일괄 생성
 */
export async function generateWordImagesBatch(
  words: WordInfo[],
  options: GenerateImageOptions = {}
): Promise<string[][]> {
  console.log(`\n🚀 ${words.length}개 단어 이미지 일괄 생성 시작\n`)

  const results: string[][] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`[${i + 1}/${words.length}] 처리 중...`)

    try {
      const paths = await generateWordImage(word, options)
      results.push(paths)

      // API rate limit 방지 (간단한 대기)
      if (i < words.length - 1) {
        console.log('\n⏳ 2초 대기 중...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error: any) {
      console.error(`\n❌ 실패: ${word.hebrew} (${word.korean})`)
      console.error(`Error: ${error.message}`)
      results.push([])
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  const successCount = results.filter(r => r.length > 0).length
  console.log(`✅ 완료: ${successCount}/${words.length}`)
  console.log(`❌ 실패: ${words.length - successCount}/${words.length}`)

  const totalImages = results.reduce((sum, r) => sum + r.length, 0)
  const totalCost = (totalImages * 0.003).toFixed(4)
  console.log(`💰 총 비용: $${totalCost} (${totalImages}장)`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return results
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\n❌ REPLICATE_API_TOKEN 환경 변수가 설정되지 않았습니다')
    console.error('📖 .env 파일에 다음을 추가하세요:')
    console.error('   REPLICATE_API_TOKEN=your_token_here\n')
    process.exit(1)
  }

  if (args.length === 0) {
    console.log(`
🎨 FLUX Schnell 히브리어 단어 이미지 자동 생성 도구
   (플래시카드용 9:16 JPG 형식)

사용법:
  1. 간단한 테스트:
     npm run image:test
     tsx scripts/images/generateImage.ts --test

  2. 단어 이미지 생성:
     tsx scripts/images/generateImage.ts "<히브리어>" "<의미>" "<한글>" [어근] [품사] [문맥]

  3. 일괄 생성:
     npm run image:batch
     tsx scripts/images/generateImage.ts --batch

예시:
  tsx scripts/images/generateImage.ts --test
  tsx scripts/images/generateImage.ts "בְּרֵאשִׁית" "시작, 태초" "베레쉬트" "ראש" "명사"
  tsx scripts/images/generateImage.ts "אֱלֹהִים" "하나님" "엘로힘" "אל" "명사" "창세기 1:1"
  tsx scripts/images/generateImage.ts --batch

필수 환경 변수:
  REPLICATE_API_TOKEN - Replicate API 토큰
  (https://replicate.com/account/api-tokens)

출력:
  - 형식: JPG (플래시카드용)
  - 비율: 9:16 (모바일 세로)
  - 위치: public/images/words/
  - 비용: ~$0.003/이미지 (약 333장/$1)

특징:
  ✨ 단어의 깊이있는 의미를 시각적으로 표현
  🎨 문화적/신학적 맥락 반영
  📱 플래시카드 형식에 최적화
    `)
    process.exit(1)
  }

  if (args[0] === '--test') {
    // 테스트 모드
    console.log('\n🧪 테스트 이미지 생성 중...\n')

    generateSimpleImage(
      'A beautiful golden sunset over peaceful mountains, with divine rays of light breaking through clouds',
      'test_sunset',
      {
        aspectRatio: '9:16',
        outputFormat: 'jpg',
        outputQuality: 90,
      }
    )
      .then(filepath => {
        console.log(`\n🎉 테스트 완료!`)
        console.log(`📂 파일 위치: ${filepath}`)
      })
      .catch(err => {
        console.error('\n❌ 오류 발생:', err)
        process.exit(1)
      })

  } else if (args[0] === '--batch') {
    // 일괄 생성 모드
    const sampleWords: WordInfo[] = [
      {
        hebrew: 'בְּרֵאשִׁית',
        meaning: '시작, 태초, 처음',
        korean: '베레쉬트',
        root: 'ראש (머리)',
        grammar: '명사',
        context: '창세기의 첫 단어, 절대적인 시작을 의미'
      },
      {
        hebrew: 'אֱלֹהִים',
        meaning: '하나님',
        korean: '엘로힘',
        root: 'אל (신)',
        grammar: '명사 (복수형)',
        context: '창조주 하나님, 삼위일체의 복수성 암시'
      },
      {
        hebrew: 'אוֹר',
        meaning: '빛',
        korean: '오르',
        root: 'אור',
        grammar: '명사',
        context: '하나님의 첫 창조 명령, 영적 계시와 지식의 상징'
      },
      {
        hebrew: 'הָאָרֶץ',
        meaning: '땅, 지구',
        korean: '하아레츠',
        root: 'ארץ',
        grammar: '명사',
        context: '물리적 세계, 약속의 땅'
      },
      {
        hebrew: 'הַשָּׁמַיִם',
        meaning: '하늘, 천국',
        korean: '하샤마임',
        root: 'שמה',
        grammar: '명사 (복수형)',
        context: '하늘의 영역들, 하나님의 거처'
      },
    ]

    generateWordImagesBatch(sampleWords, {
      aspectRatio: '9:16',
      outputFormat: 'jpg',
      outputQuality: 90,
    })
      .then(() => console.log('\n🎉 모든 이미지 생성 완료!'))
      .catch(err => {
        console.error('\n❌ 오류 발생:', err)
        process.exit(1)
      })

  } else {
    // 단일 단어 생성 모드
    if (args.length < 3) {
      console.error('\n❌ 인자가 부족합니다')
      console.error('사용법: tsx scripts/images/generateImage.ts "<히브리어>" "<의미>" "<한글>" [어근] [품사] [문맥]\n')
      process.exit(1)
    }

    const word: WordInfo = {
      hebrew: args[0],
      meaning: args[1],
      korean: args[2],
      root: args[3],
      grammar: args[4],
      context: args[5],
    }

    generateWordImage(word, {
      aspectRatio: '9:16',
      outputFormat: 'jpg',
      outputQuality: 90,
    })
      .then(paths => {
        console.log(`\n🎉 이미지 생성 완료!`)
        console.log(`📂 저장 위치:`)
        paths.forEach(p => console.log(`   ${p}`))
      })
      .catch(err => {
        console.error('\n❌ 오류 발생:', err)
        process.exit(1)
      })
  }
}
