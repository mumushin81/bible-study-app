/**
 * 쿼리 성능 비교 스크립트
 * N+1 방식 vs Supabase JOIN 방식
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

interface BenchmarkResult {
  method: string
  queryCount: number
  duration: number
  dataSize: number
  verseCount: number
}

// ❌ 구 방식: N+1 쿼리
async function fetchVersesOldWay(bookId: string, chapter: number): Promise<BenchmarkResult> {
  const startTime = Date.now()
  let queryCount = 0

  // 1. Verses 가져오기
  const { data: versesData } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse_number', { ascending: true })

  queryCount++

  if (!versesData) {
    return { method: 'N+1 (Old)', queryCount, duration: 0, dataSize: 0, verseCount: 0 }
  }

  // 2. 각 구절마다 words, commentaries 조회
  const versesWithDetails = await Promise.all(
    versesData.map(async (verse) => {
      // Words 조회
      const { data: wordsData } = await supabase
        .from('words')
        .select('*')
        .eq('verse_id', verse.id)
        .order('position', { ascending: true })

      queryCount++

      // Commentaries 조회
      const { data: commentaryData } = await supabase
        .from('commentaries')
        .select(`
          id,
          intro,
          commentary_sections (*),
          why_questions (*),
          commentary_conclusions (*)
        `)
        .eq('verse_id', verse.id)
        .single()

      queryCount++

      return {
        ...verse,
        words: wordsData || [],
        commentary: commentaryData
      }
    })
  )

  const duration = Date.now() - startTime
  const dataSize = JSON.stringify(versesWithDetails).length

  return {
    method: 'N+1 (Old)',
    queryCount,
    duration,
    dataSize,
    verseCount: versesData.length
  }
}

// ✅ 신 방식: Supabase JOIN
async function fetchVersesNewWay(bookId: string, chapter: number): Promise<BenchmarkResult> {
  const startTime = Date.now()
  const queryCount = 1

  const { data: versesData } = await supabase
    .from('verses')
    .select(`
      *,
      words (
        hebrew,
        meaning,
        ipa,
        korean,
        root,
        grammar,
        structure,
        emoji,
        category,
        position
      ),
      commentaries (
        id,
        intro,
        commentary_sections (
          emoji,
          title,
          description,
          points,
          color,
          position
        ),
        why_questions (
          question,
          answer,
          bible_references
        ),
        commentary_conclusions (
          title,
          content
        )
      )
    `)
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse_number', { ascending: true })

  const duration = Date.now() - startTime
  const dataSize = JSON.stringify(versesData).length

  return {
    method: 'JOIN (New)',
    queryCount,
    duration,
    dataSize,
    verseCount: versesData?.length || 0
  }
}

// 벤치마크 실행
async function runBenchmark() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔬 쿼리 성능 비교 벤치마크')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const tests = [
    { bookId: 'genesis', chapter: 1, name: 'Genesis 1장 (31 verses)' },
    { bookId: 'genesis', chapter: 2, name: 'Genesis 2장 (25 verses)' },
    { bookId: 'genesis', chapter: 3, name: 'Genesis 3장 (24 verses)' },
  ]

  for (const test of tests) {
    console.log(`\n📖 ${test.name}`)
    console.log('─'.repeat(60))

    // 캐시 초기화를 위해 약간 대기
    await new Promise(resolve => setTimeout(resolve, 500))

    // 구 방식 테스트
    const oldResult = await fetchVersesOldWay(test.bookId, test.chapter)
    console.log(`\n❌ ${oldResult.method}:`)
    console.log(`   쿼리 횟수: ${oldResult.queryCount}번`)
    console.log(`   실행 시간: ${oldResult.duration}ms`)
    console.log(`   데이터 크기: ${(oldResult.dataSize / 1024).toFixed(2)} KB`)

    // 캐시 초기화를 위해 대기
    await new Promise(resolve => setTimeout(resolve, 500))

    // 신 방식 테스트
    const newResult = await fetchVersesNewWay(test.bookId, test.chapter)
    console.log(`\n✅ ${newResult.method}:`)
    console.log(`   쿼리 횟수: ${newResult.queryCount}번`)
    console.log(`   실행 시간: ${newResult.duration}ms`)
    console.log(`   데이터 크기: ${(newResult.dataSize / 1024).toFixed(2)} KB`)

    // 개선 비율 계산
    const speedup = (oldResult.duration / newResult.duration).toFixed(2)
    const queryReduction = (((oldResult.queryCount - newResult.queryCount) / oldResult.queryCount) * 100).toFixed(1)

    console.log(`\n🚀 성능 개선:`)
    console.log(`   속도: ${speedup}배 빠름`)
    console.log(`   쿼리 감소: ${queryReduction}% (${oldResult.queryCount} → ${newResult.queryCount})`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ 벤치마크 완료')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

runBenchmark().catch(console.error)
