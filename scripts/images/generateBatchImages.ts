#!/usr/bin/env tsx

/**
 * 히브리어 단어 이미지 자동 대량 생성 스크립트
 * - 여러 JSON 파일에서 단어 목록 읽기
 * - Replicate API를 사용한 이미지 생성
 * - 오류 처리 및 로깅
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { WordInfo } from './generateImagePrompt.js'
import { generateWordImage } from './generateImage.js'

// 환경 설정 로드
config({ path: '.env.local' })

interface GenerationPrompt {
  prompt: string
  negativePrompt: string
}

function createPrompt(word: WordInfo): GenerationPrompt {
  const conceptPrompt = `Symbolic, narrative illustration conveying the biblical concept of "${word.meaning}". Express this sacred idea through luminous metaphors, biblically inspired scenery, and emblematic imagery so the meaning is instantly recognizable. Favor celestial elements, light, flora, natural phenomena, and sacred symbols instead of literal human anatomy; if figures appear, render them only as distant silhouettes with no visible faces or hands.`

  const colorPrompt = 'bright pastel palette with soft pink, sky blue, lavender, golden peach, and mint green; luminous gradients; NO dark colors, NO black, NO dark gray; hopeful, uplifting spiritual glow'

  const compositionPrompt = 'vertical 9:16 layout; primary subject occupies the upper 80%; lower 20% remains softly lit negative space for future text overlay; centered, harmonious framing with gentle depth'

  const stylePrompt = 'impressionistic symbolic art, dreamlike sacred atmosphere, painterly brushstrokes, soft focus edges, watercolor textures, diffuse glow, gentle light bloom'

  const prompt = `${conceptPrompt} ${colorPrompt}. ${compositionPrompt}. ${stylePrompt}. Absolutely no written characters, letters, or text of any kind within the scene.`

  const negativePrompt = [
    'text, letters, typography, calligraphy, inscriptions, captions, subtitles, handwriting, graffiti, banners',
    'Hebrew letters, Hebrew text, Hebrew characters, Hebrew script, ancient text, biblical inscriptions, sacred text',
    'Arabic text, Aramaic text, any written language, alphabets, symbols with text',
    'logos, icons, UI elements, diagrams, charts, graphs, maps, labels, stickers, memes',
    'watermarks, signatures, stamps, QR codes, numbers',
    'photorealistic anatomy, detailed hands, extra fingers, close-up hands, realistic faces, facial features, teeth, portraits, hyper-detailed skin, muscular definition',
    'abstract blobs, chaotic patterns, glitch effects, noisy artifacts, distorted faces'
  ].join(', ')

  return {
    prompt,
    negativePrompt
  }
}

// 로깅 및 추적을 위한 결과 기록 클래스
class BatchImageGenerationResult {
  total: number
  successful: number[]
  failed: string[]
  skipped: string[]

  constructor() {
    this.total = 0
    this.successful = []
    this.failed = []
    this.skipped = []
  }

  addSuccess(index: number) {
    this.successful.push(index)
  }

  addFailure(word: string, error: string) {
    this.failed.push(`${word}: ${error}`)
  }

  addSkipped(word: string) {
    this.skipped.push(word)
  }

  toJSON() {
    return {
      total: this.total,
      successCount: this.successful.length,
      failedCount: this.failed.length,
      skippedCount: this.skipped.length,
      successful: this.successful,
      failed: this.failed,
      skipped: this.skipped
    }
  }
}

// 이미지 배치 생성 메인 함수
async function generateWordImagesBatch(
  jsonFiles: string[],
  options: {
    outputDir?: string,
    batchSize?: number
  } = {}
) {
  const {
    outputDir = join(process.cwd(), 'public/images/words'),
    batchSize = 10
  } = options

  // 결과 추적 객체
  const result = new BatchImageGenerationResult()

  // 디렉터리 생성
  mkdirSync(outputDir, { recursive: true })

  // 모든 JSON 파일에서 단어 수집
  const wordsToGenerate: WordInfo[] = []
  for (const file of jsonFiles) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf-8'))
      wordsToGenerate.push(...(data.wordsToGenerate || data.words))
    } catch (error) {
      console.error(`❌ JSON 파일 ${file} 읽기 실패:`, error)
    }
  }

  result.total = wordsToGenerate.length

  console.log(`\n🚀 총 ${result.total}개 단어 이미지 생성 준비`)

  // 배치로 이미지 생성
  for (let i = 0; i < wordsToGenerate.length; i += batchSize) {
    const batch = wordsToGenerate.slice(i, i + batchSize)

    console.log(`\n📦 배치 ${Math.floor(i/batchSize) + 1} 처리 중 (${i+1} - ${i+batch.length}/${result.total})`)

    try {
      const batchResults = await Promise.all(batch.map(word => {
        const { prompt } = createPrompt(word)
        console.log(`\n📝 프롬프트 프리뷰 (${word.hebrew}): ${prompt.substring(0, 200)}...`)

        return generateWordImage(word, { outputDir, logPromptPreview: false })
          .then(paths => ({ paths, word }))
          .catch(error => ({ paths: [], word, error }))
      }))

      console.log('🔍 Debug: Batch Results', JSON.stringify(batchResults, null, 2));
      batchResults.forEach((resultItem, index) => {
        try {
          console.log(`🔍 Processing result for word: ${resultItem.word.hebrew}`);
          console.log(`🔍 Paths: ${JSON.stringify(resultItem.paths)}`);
          console.log(`🔍 Error: ${resultItem.error ? JSON.stringify(resultItem.error) : 'No error'}`);

          if (resultItem.paths && resultItem.paths.length > 0) {
            result.addSuccess(i + index);
          } else {
            console.error(`❌ Image generation failed for word: ${resultItem.word.hebrew}`);
            result.addFailure(resultItem.word.hebrew, resultItem.error ? resultItem.error.message : '이미지 생성 실패');
          }
        } catch (processingError) {
          console.error(`💥 Error processing result: ${processingError.message}`);
          console.error(`💥 Original result: ${JSON.stringify(resultItem)}`);
          result.addFailure(resultItem.word.hebrew, processingError.message);
        }
      })
    } catch (error) {
      console.error('❌ 배치 처리 중 오류:', error)
      batch.forEach(word => result.addFailure(word.hebrew, error.message))
    }

    // API 요청 사이 대기 (Rate limit 방지)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // 결과 로그 파일 저장
  const logFilePath = join(process.cwd(), 'logs', `image_generation_${new Date().toISOString().replace(/:/g, '-')}.json`)
  mkdirSync(join(process.cwd(), 'logs'), { recursive: true })
  writeFileSync(logFilePath, JSON.stringify(result.toJSON(), null, 2))

  console.log('\n📊 이미지 생성 결과:')
  console.log(`✅ 성공: ${result.successful.length}/${result.total}`)
  console.log(`❌ 실패: ${result.failed.length}/${result.total}`)
  console.log(`📝 로그 파일: ${logFilePath}`)

  return result
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\n❌ REPLICATE_API_TOKEN 환경 변수가 설정되지 않았습니다')
    console.error('📖 .env.local 파일에 다음을 추가하세요:')
    console.error('   REPLICATE_API_TOKEN=your_token_here\n')
    process.exit(1)
  }

  const jsonFiles = [
    join(process.cwd(), 'scripts/images/genesis1-words.json'),
    join(process.cwd(), 'scripts/images/genesis1-verse2-31.json')
  ]

  generateWordImagesBatch(jsonFiles)
    .then(result => {
      console.log('\n🎉 이미지 생성 완료!')
      process.exit(0)
    })
    .catch(err => {
      console.error('\n❌ 전체 프로세스 중 오류 발생:', err)
      process.exit(1)
    })
}
