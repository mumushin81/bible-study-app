#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  root?: string
  grammar?: string
  context?: string
}

// 단어 유사성 스코어링 함수
function calculateWordSimilarity(word1: string, word2: string): number {
  // 완전 일치
  if (word1 === word2) return 1.0

  // 부분 문자열 매칭
  if (word1.includes(word2) || word2.includes(word1)) return 0.9

  // 단어 길이 기반 유사성
  const maxLength = Math.max(word1.length, word2.length)
  const commonLength = longestCommonSubstring(word1, word2).length
  const similarityRatio = commonLength / maxLength

  return similarityRatio
}

// 최장 공통 부분 문자열 찾기
function longestCommonSubstring(str1: string, str2: string): string {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  let maxLength = 0
  let endIndex = 0

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j]
          endIndex = i - 1
        }
      }
    }
  }

  return str1.substring(endIndex - maxLength + 1, endIndex + 1)
}

// 고급 매칭 알고리즘
function findBestWordMatch(targetWord: WordInfo, wordList: WordInfo[]): WordInfo | null {
  let bestMatch: WordInfo | null = null
  let bestScore = 0

  for (const word of wordList) {
    // 의미 기반 유사성
    const meaningSimilarity = calculateWordSimilarity(
      targetWord.meaning.toLowerCase(),
      word.meaning.toLowerCase()
    )

    // 한국어 단어 유사성
    const koreanSimilarity = calculateWordSimilarity(
      targetWord.korean.toLowerCase(),
      word.korean.toLowerCase()
    )

    // 히브리어 단어 유사성
    const hebrewSimilarity = calculateWordSimilarity(
      targetWord.hebrew,
      word.hebrew
    )

    // 복합 스코어링 (가중치 조정 가능)
    const totalScore = (
      meaningSimilarity * 0.5 +
      koreanSimilarity * 0.3 +
      hebrewSimilarity * 0.2
    )

    // 문법 및 어근 보너스 점수
    const grammarBonus = targetWord.grammar === word.grammar ? 0.1 : 0
    const rootBonus = targetWord.root === word.root ? 0.1 : 0

    const finalScore = totalScore + grammarBonus + rootBonus

    if (finalScore > bestScore) {
      bestScore = finalScore
      bestMatch = word
    }
  }

  // 최소 유사성 임계값 설정
  return bestScore > 0.6 ? bestMatch : null
}

async function improveWordMatching() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // JSON 파일에서 단어 로드
  const jsonFiles = [
    join(process.cwd(), 'scripts/images/genesis1-words.json'),
    join(process.cwd(), 'scripts/images/genesis1-verse2-31.json')
  ]

  const allWords: WordInfo[] = []
  for (const file of jsonFiles) {
    const data = JSON.parse(readFileSync(file, 'utf-8'))
    allWords.push(...(data.wordsToGenerate || data.words || []))
  }

  // 데이터베이스에서 모든 단어 로드
  const { data: dbWords, error: dbError } = await supabase
    .from('words')
    .select('hebrew, meaning, korean, root, grammar')

  if (dbError) {
    console.error('데이터베이스 단어 조회 실패:', dbError)
    return
  }

  console.log(`🔍 총 단어 수: ${allWords.length}`)
  console.log(`🗃️ 데이터베이스 단어 수: ${dbWords.length}`)

  // 매칭 및 업데이트 프로세스
  const updatePromises = allWords.map(async (targetWord) => {
    const bestMatch = findBestWordMatch(targetWord, dbWords)

    if (bestMatch) {
      console.log(`✅ 매칭 성공: ${targetWord.meaning} -> ${bestMatch.meaning}`)
      return bestMatch
    }

    console.warn(`❌ 매칭 실패: ${targetWord.meaning}`)
    return null
  })

  const matchResults = await Promise.all(updatePromises)

  // 매칭 통계
  const successMatches = matchResults.filter(match => match !== null)
  const failedMatches = matchResults.filter(match => match === null)

  console.log('\n📊 매칭 결과:')
  console.log(`✅ 성공: ${successMatches.length}/${allWords.length}`)
  console.log(`❌ 실패: ${failedMatches.length}/${allWords.length}`)

  // 실패한 단어들 상세 분석
  console.log('\n❓ 매칭 실패 단어 샘플 (상위 10개):')
  allWords
    .filter(word => !matchResults.some(match => match && match.meaning === word.meaning))
    .slice(0, 10)
    .forEach(word => {
      console.log(`- ${word.meaning} (${word.korean})`)
    })
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  improveWordMatching()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ 매칭 개선 중 오류:', err)
      process.exit(1)
    })
}