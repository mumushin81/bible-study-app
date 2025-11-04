#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  root?: string
  grammar?: string
  context?: string
}

// 대체 전략 유형
enum FallbackStrategy {
  GENERIC_MATCH,
  PARTIAL_MEANING,
  GRAMMATICAL_CONTEXT,
  DEFAULT_IMAGE
}

class WordMatchingFallbackStrategy {
  private supabase: any
  private defaultImageUrl: string

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.defaultImageUrl = 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/default_word_icon.jpg'
  }

  // 매칭 실패 단어 유형 분류
  private classifyFailedWord(word: WordInfo): FallbackStrategy {
    const meaning = word.meaning.toLowerCase()

    // 복합 문장 처리
    if (
      meaning.includes('위하여') ||
      meaning.includes('그리고') ||
      meaning.includes('사이') ||
      meaning.includes('모이라') ||
      meaning.includes('운행하다')
    ) {
      return FallbackStrategy.PARTIAL_MEANING
    }

    // 특수 문법 구조
    if (
      meaning.includes('번성') ||
      meaning.includes('드러나라') ||
      meaning.includes('되게 하라')
    ) {
      return FallbackStrategy.GRAMMATICAL_CONTEXT
    }

    // 일반적인 단어
    return FallbackStrategy.GENERIC_MATCH
  }

  // 부분 일치 단어 매핑
  private async findPartialMeaningMatch(word: WordInfo): Promise<string | null> {
    const partialMeanings = [
      '위하여', '그리고', '사이', '모이라', '운행하다',
      '번성', '드러나라', '되게 하라'
    ]

    for (const partialMeaning of partialMeanings) {
      const { data, error } = await this.supabase
        .from('words')
        .select('id, meaning, icon_url')
        .ilike('meaning', `%${partialMeaning}%`)
        .limit(1)

      if (data && data.length > 0 && data[0].icon_url) {
        console.log(`🔍 부분 일치 매핑: ${word.meaning} -> ${data[0].meaning}`)
        return data[0].icon_url
      }
    }

    return null
  }

  // 문법적 컨텍스트 기반 매핑
  private async findGrammaticalContextMatch(word: WordInfo): Promise<string | null> {
    const grammaticalKeywords = [
      '번성', '되다', '드러나다', '나누다', '부르다'
    ]

    const { data, error } = await this.supabase
      .from('words')
      .select('id, meaning, icon_url')
      .or(
        grammaticalKeywords
          .map(keyword => `meaning.ilike.%${keyword}%`)
          .join(',')
      )
      .limit(1)

    if (data && data.length > 0 && data[0].icon_url) {
      console.log(`✨ 문법적 컨텍스트 매핑: ${word.meaning} -> ${data[0].meaning}`)
      return data[0].icon_url
    }

    return null
  }

  // 제네릭 매칭 (가장 비슷한 단어 찾기)
  private async findGenericMatch(word: WordInfo): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('words')
      .select('id, meaning, icon_url')
      .textSearch('meaning', word.meaning)
      .limit(1)

    if (data && data.length > 0 && data[0].icon_url) {
      console.log(`🔗 제네릭 매핑: ${word.meaning} -> ${data[0].meaning}`)
      return data[0].icon_url
    }

    return null
  }

  // 대체 이미지 매핑 전략
  async findFallbackImage(word: WordInfo): Promise<string> {
    const strategy = this.classifyFailedWord(word)

    let matchedUrl: string | null = null

    switch (strategy) {
      case FallbackStrategy.PARTIAL_MEANING:
        matchedUrl = await this.findPartialMeaningMatch(word)
        break
      case FallbackStrategy.GRAMMATICAL_CONTEXT:
        matchedUrl = await this.findGrammaticalContextMatch(word)
        break
      case FallbackStrategy.GENERIC_MATCH:
        matchedUrl = await this.findGenericMatch(word)
        break
    }

    return matchedUrl || this.defaultImageUrl
  }

  // 단어 매핑 개선 및 데이터베이스 업데이트
  async improveWordMapping(jsonFiles: string[]) {
    console.log('🚀 단어 매핑 개선 및 대체 이미지 전략 시작')

    const allWords: WordInfo[] = []
    for (const file of jsonFiles) {
      const data = JSON.parse(readFileSync(file, 'utf-8'))
      allWords.push(...(data.wordsToGenerate || data.words || []))
    }

    // 매칭 실패한 단어 필터링
    const { data: dbWords, error: dbError } = await this.supabase
      .from('words')
      .select('id, hebrew, meaning, korean, icon_url')

    if (dbError) {
      console.error('데이터베이스 단어 조회 실패:', dbError)
      return
    }

    const failedWords = allWords.filter(
      word => !dbWords.some(dbWord =>
        dbWord.meaning.includes(word.meaning) ||
        word.meaning.includes(dbWord.meaning)
      )
    )

    console.log(`🔍 매칭 실패 단어 수: ${failedWords.length}`)

    // 대체 이미지 매핑
    const updatePromises = failedWords.map(async (word) => {
      const fallbackUrl = await this.findFallbackImage(word)

      const { data, error } = await this.supabase
        .from('words')
        .insert({
          hebrew: word.hebrew,
          meaning: word.meaning,
          korean: word.korean,
          icon_url: fallbackUrl
        })
        .select()

      if (error) {
        console.error(`❌ 단어 추가 실패: ${word.meaning}`, error)
        return null
      }

      console.log(`✅ 단어 추가 성공: ${word.meaning}`)
      return data
    })

    const results = await Promise.allSettled(updatePromises)

    const successCount = results.filter(
      result => result.status === 'fulfilled' && result.value
    ).length
    const failureCount = results.filter(
      result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)
    ).length

    console.log('\n📊 단어 매핑 결과:')
    console.log(`✅ 성공: ${successCount}/${failedWords.length}`)
    console.log(`❌ 실패: ${failureCount}/${failedWords.length}`)
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const strategy = new WordMatchingFallbackStrategy(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const jsonFiles = [
    join(process.cwd(), 'scripts/images/genesis1-words.json'),
    join(process.cwd(), 'scripts/images/genesis1-verse2-31.json')
  ]

  strategy.improveWordMapping(jsonFiles)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ 단어 매핑 개선 중 오류:', err)
      process.exit(1)
    })
}