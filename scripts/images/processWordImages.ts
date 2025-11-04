#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import Replicate from 'replicate'
import { generateWordImagePrompt } from './generateImagePrompt.js'

// 환경 설정
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const REPLICATE_API_TOKEN = process.env.VITE_REPLICATE_API_TOKEN

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !REPLICATE_API_TOKEN) {
  console.error('환경 변수가 제대로 로드되지 않았습니다.')
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY)
  console.error('VITE_REPLICATE_API_TOKEN:', !!REPLICATE_API_TOKEN)
  process.exit(1)
}

// 클라이언트 초기화
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const replicate = new Replicate({ auth: REPLICATE_API_TOKEN })

// 타입 정의
interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  root?: string
  grammar?: string
  context?: string
  icon_url?: string
}

// 히브리어 파일명 변환 유틸리티
function hebrewToFilename(hebrew: string): string {
  // 니쿠드(발음 기호) 제거
  const withoutNikkud = hebrew.replace(/[\u0591-\u05C7]/g, '')

  // 히브리어 문자와 숫자만 남기고 나머지는 제거
  const cleanedHebrew = withoutNikkud
    .replace(/[^א-ת0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')

  // 파일명이 너무 짧으면 원본 의미에서 추가 정보 가져오기
  return cleanedHebrew.length > 0
    ? cleanedHebrew
    : `word_${Date.now()}`
}

// 이미지 생성 함수
async function generateWordImage(word: WordInfo): Promise<string | null> {
  try {
    const outputDir = join(process.cwd(), 'public/images/words')
    mkdirSync(outputDir, { recursive: true })

    const filename = hebrewToFilename(word.hebrew)
    const prompt = generateWordImagePrompt(word)

    console.log(`🎨 이미지 생성: ${word.hebrew} (${word.korean})`)
    console.log(`📝 의미: ${word.meaning}`)

    const output = await replicate.run(
      'black-forest-labs/flux-1.1-pro',
      {
        input: {
          prompt,
          aspect_ratio: '9:16',
          output_format: 'jpg',
          output_quality: 100
        }
      }
    )

    const imageUrl = Array.isArray(output) ? output[0] : output

    if (!imageUrl) {
      console.error(`❌ 이미지 생성 실패: ${word.hebrew}`)
      return null
    }

    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()

    const filepath = join(outputDir, `${filename}.jpg`)
    writeFileSync(filepath, Buffer.from(buffer))

    console.log(`✅ 이미지 저장: ${filepath}`)
    return filepath
  } catch (error) {
    console.error(`❌ 이미지 생성 중 오류: ${word.hebrew}`, error)
    return null
  }
}

// Supabase 업로드 함수
async function uploadToSupabase(filepath: string, word: WordInfo): Promise<string | null> {
  try {
    // 안전한 파일명 생성 (영숫자, 언더스코어, 소문자만 허용)
    const safeFilename = hebrewToFilename(word.hebrew)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')

    const finalFilename = `${safeFilename}.jpg`
    const bucketPath = 'icons'

    const { data, error: uploadError } = await supabase.storage
      .from('hebrew-icons')
      .upload(`${bucketPath}/${finalFilename}`, filepath, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ Supabase 업로드 실패: ${word.hebrew}`, uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hebrew-icons')
      .getPublicUrl(`${bucketPath}/${finalFilename}`)

    console.log(`✅ Supabase 업로드 성공: ${finalFilename}`)
    return publicUrl
  } catch (error) {
    console.error(`❌ Supabase 업로드 중 오류: ${word.hebrew}`, error)
    return null
  }
}

// 단어 데이터베이스 업데이트 함수
async function updateWordDatabase(iconUrl: string, word: WordInfo) {
  try {
    const { data, error } = await supabase
      .from('words')
      .update({ icon_url: iconUrl })
      .eq('meaning', word.meaning)
      .select()

    if (error) {
      console.error(`❌ 데이터베이스 업데이트 실패: ${word.hebrew}`, error)
      return false
    }

    console.log(`✅ 데이터베이스 업데이트 성공: ${word.hebrew}`)
    return true
  } catch (error) {
    console.error(`❌ 데이터베이스 업데이트 중 오류: ${word.hebrew}`, error)
    return false
  }
}

// 메인 프로세스
async function processWordImages(jsonFiles: string[]) {
  console.log('🚀 워드 이미지 프로세싱 시작')

  const totalResults = {
    total: 0,
    success: 0,
    failed: 0
  }

  for (const jsonFile of jsonFiles) {
    const data = JSON.parse(readFileSync(jsonFile, 'utf-8'))
    const words: WordInfo[] = data.wordsToGenerate || data.words || []

    totalResults.total += words.length

    for (const word of words) {
      try {
        const localImagePath = await generateWordImage(word)
        if (!localImagePath) {
          totalResults.failed++
          continue
        }

        const iconUrl = await uploadToSupabase(localImagePath, word)
        if (!iconUrl) {
          totalResults.failed++
          continue
        }

        const dbUpdateSuccess = await updateWordDatabase(iconUrl, word)
        if (dbUpdateSuccess) {
          totalResults.success++
        } else {
          totalResults.failed++
        }

        // API 호출 사이 대기
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ 전체 프로세스 중 오류: ${word.hebrew}`, error)
        totalResults.failed++
      }
    }
  }

  console.log('\n📊 프로세싱 결과:')
  console.log(`✅ 총 단어: ${totalResults.total}`)
  console.log(`✅ 성공: ${totalResults.success}`)
  console.log(`❌ 실패: ${totalResults.failed}`)
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const jsonFiles = [
    join(process.cwd(), 'scripts/images/genesis1-words.json'),
    join(process.cwd(), 'scripts/images/genesis1-verse2-31.json')
  ]

  processWordImages(jsonFiles)
    .then(() => {
      console.log('\n🎉 모든 단어 이미지 프로세싱 완료!')
      process.exit(0)
    })
    .catch(err => {
      console.error('\n❌ 치명적인 오류 발생:', err)
      process.exit(1)
    })
}