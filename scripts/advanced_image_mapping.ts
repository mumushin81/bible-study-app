#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { similarityScore } from './text_similarity_utils'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WordMapping {
  hebrew: string
  meaning: string
  id: string
}

interface ImageMapping {
  filename: string
  publicUrl: string
}

class AdvancedImageMapper {
  private words: WordMapping[] = []
  private images: ImageMapping[] = []
  private mappingLog: {
    [filename: string]: {
      bestMatch?: WordMapping
      score?: number
      status: 'matched' | 'unmatched' | 'low_confidence'
    }
  } = {}

  async initialize() {
    // 1. 모든 단어 조회
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .select('id, hebrew, meaning')

    if (wordError) {
      console.error('단어 조회 실패:', wordError)
      return false
    }

    // 2. 스토리지 이미지 조회
    const { data: storageImages, error: storageError } = await supabase.storage
      .from('hebrew-icons')
      .list('icons', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (storageError) {
      console.error('이미지 조회 실패:', storageError)
      return false
    }

    this.words = wordData || []
    this.images = storageImages
      .filter(img => img.name !== '__.jpg')
      .map(img => ({
        filename: img.name,
        publicUrl: supabase.storage.from('hebrew-icons').getPublicUrl(`icons/${img.name}`).data.publicUrl
      }))

    return true
  }

  // 고급 매핑 알고리즘
  async performAdvancedMapping() {
    const initialized = await this.initialize()
    if (!initialized) return

    console.log(`🔍 매핑 시작: ${this.words.length}개 단어, ${this.images.length}개 이미지`)

    this.images.forEach(image => {
      const bestMatch = this.findBestWordMatch(image)
      this.mappingLog[image.filename] = bestMatch
        ? {
            bestMatch,
            score: bestMatch.score,
            status: bestMatch.score > 0.7 ? 'matched' : 'low_confidence'
          }
        : { status: 'unmatched' }
    })

    await this.updateDatabaseWithMatches()
    this.generateMappingReport()
  }

  private findBestWordMatch(image: ImageMapping) {
    let bestMatch: (WordMapping & { score: number }) | null = null

    // 다중 매칭 전략
    const matchStrategies = [
      // 1. 완전 일치 (파일명 속 히브리어)
      this.findExactMatch(image),

      // 2. 의미 기반 유사성
      this.findMeaningBasedMatch(image),

      // 3. 형태소 유사성
      this.findMorphologicalMatch(image)
    ]

    // 최고 점수 선택
    const validMatches = matchStrategies.filter(match => match !== null)
    if (validMatches.length > 0) {
      bestMatch = validMatches.reduce((a, b) =>
        (a?.score || 0) > (b?.score || 0) ? a : b
      ) as WordMapping & { score: number }
    }

    return bestMatch
  }

  private findExactMatch(image: ImageMapping) {
    // 파일명에서 히브리어 추출 및 매칭
    const extractedHebrew = this.extractHebrewFromFilename(image.filename)
    if (!extractedHebrew) return null

    const match = this.words.find(word => word.hebrew === extractedHebrew)
    return match
      ? { ...match, score: 1.0 }
      : null
  }

  private findMeaningBasedMatch(image: ImageMapping) {
    // 의미 기반 유사성 매칭
    const extractedHebrew = this.extractHebrewFromFilename(image.filename)
    if (!extractedHebrew) return null

    const matches = this.words.map(word => ({
      ...word,
      score: similarityScore(extractedHebrew, word.hebrew) * 0.7 +
             similarityScore(extractedHebrew, word.meaning) * 0.3
    }))

    return matches.reduce((a, b) => a.score > b.score ? a : b)
  }

  private findMorphologicalMatch(image: ImageMapping) {
    // 형태소 및 어근 기반 매칭
    const extractedHebrew = this.extractHebrewFromFilename(image.filename)
    if (!extractedHebrew) return null

    const matches = this.words.map(word => ({
      ...word,
      score: this.morphologicalSimilarity(extractedHebrew, word.hebrew)
    }))

    return matches.reduce((a, b) => a.score > b.score ? a : b)
  }

  private extractHebrewFromFilename(filename: string): string | null {
    // 파일명에서 히브리어 추출 (복잡한 로직 필요)
    const hebrewMatch = filename.match(/[א-ת]+/g)
    return hebrewMatch ? hebrewMatch[0] : null
  }

  private morphologicalSimilarity(str1: string, str2: string): number {
    // 형태소 유사성 계산 로직
    const commonSubstrings = this.longestCommonSubstring(str1, str2)
    return commonSubstrings.length / Math.max(str1.length, str2.length)
  }

  private longestCommonSubstring(str1: string, str2: string): string {
    const matrix = Array(str1.length + 1).fill(null).map(() => Array(str2.length + 1).fill(0))
    let maxLength = 0
    let lastSubstrIndex = 0

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1

          if (matrix[i][j] > maxLength) {
            maxLength = matrix[i][j]
            lastSubstrIndex = i - 1
          }
        }
      }
    }

    return str1.slice(lastSubstrIndex - maxLength + 1, lastSubstrIndex + 1)
  }

  private async updateDatabaseWithMatches() {
    const updatePromises = Object.entries(this.mappingLog)
      .filter(([_, mapping]) => mapping.status === 'matched' && mapping.bestMatch)
      .map(async ([filename, mapping]) => {
        const { data: { publicUrl } } = supabase.storage
          .from('hebrew-icons')
          .getPublicUrl(`icons/${filename}`)

        const { error } = await supabase
          .from('words')
          .update({ icon_url: publicUrl })
          .eq('id', mapping.bestMatch!.id)

        if (error) {
          console.error(`URL 업데이트 실패: ${filename}`, error)
        }
      })

    await Promise.all(updatePromises)
  }

  private generateMappingReport() {
    const matchedCount = Object.values(this.mappingLog).filter(
      log => log.status === 'matched'
    ).length

    const lowConfidenceCount = Object.values(this.mappingLog).filter(
      log => log.status === 'low_confidence'
    ).length

    const unmatchedCount = Object.values(this.mappingLog).filter(
      log => log.status === 'unmatched'
    ).length

    console.log('\n📊 이미지 매핑 보고서:')
    console.log(`✅ 정확히 매칭된 이미지: ${matchedCount}`)
    console.log(`⚠️ 낮은 신뢰도 매칭: ${lowConfidenceCount}`)
    console.log(`❌ 매칭 실패한 이미지: ${unmatchedCount}`)

    // 매핑 로그 상세 출력
    Object.entries(this.mappingLog)
      .filter(([_, log]) => log.status !== 'matched')
      .forEach(([filename, log]) => {
        console.log(`\n파일: ${filename}`)
        console.log(`상태: ${log.status}`)
        if (log.bestMatch) {
          console.log(`최적 매칭: ${log.bestMatch.hebrew} (${log.bestMatch.meaning})`)
          console.log(`유사도 점수: ${log.score?.toFixed(2)}`)
        }
      })
  }
}

async function runAdvancedImageMapper() {
  const mapper = new AdvancedImageMapper()
  await mapper.performAdvancedMapping()
}

runAdvancedImageMapper().catch(console.error)