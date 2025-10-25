#!/usr/bin/env tsx

/**
 * 같은 의미(meaning)를 가진 서로 다른 히브리어 단어 찾기
 * → 이미지 중복 사용 확률 분석
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDuplicateMeanings() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 같은 의미(meaning)를 가진 서로 다른 히브리어 단어 분석')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 모든 단어 가져오기
  const { data, error } = await supabase
    .from('words')
    .select('meaning, hebrew')
    .not('meaning', 'is', null)
    .order('meaning')

  if (error) {
    console.error('❌ 오류:', error)
    return
  }

  // 의미별로 그룹화
  const meaningGroups: Record<string, Set<string>> = {}
  data.forEach(row => {
    if (!meaningGroups[row.meaning]) {
      meaningGroups[row.meaning] = new Set()
    }
    meaningGroups[row.meaning].add(row.hebrew)
  })

  // 같은 의미에 2개 이상의 다른 히브리어가 있는 경우
  const conflicts = Object.entries(meaningGroups)
    .filter(([meaning, hebrewSet]) => hebrewSet.size > 1)
    .map(([meaning, hebrewSet]) => ({
      meaning,
      hebrews: Array.from(hebrewSet),
      count: hebrewSet.size
    }))
    .sort((a, b) => b.count - a.count) // 많은 순으로 정렬

  const totalMeanings = Object.keys(meaningGroups).length
  const conflictRate = Math.round(conflicts.length / totalMeanings * 100)

  console.log(`📈 통계:`)
  console.log(`   전체 고유 의미(meaning): ${totalMeanings}개`)
  console.log(`   충돌 가능 의미: ${conflicts.length}개 (${conflictRate}%)`)
  console.log(`   안전한 의미: ${totalMeanings - conflicts.length}개\n`)

  if (conflicts.length === 0) {
    console.log('✅ 모든 의미가 고유한 히브리어 단어와 1:1 매칭됩니다!')
    console.log('   이미지 중복 사용 문제 없음\n')
  } else {
    console.log(`⚠️  주의: ${conflicts.length}개 의미가 여러 히브리어 단어를 공유합니다\n`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('충돌 상위 20개:\n')

    conflicts.slice(0, 20).forEach((c, i) => {
      console.log(`${i + 1}. "${c.meaning}" → ${c.count}개 히브리어`)
      c.hebrews.forEach(h => console.log(`   - ${h}`))
      console.log()
    })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 권장 해결책:')
  console.log('   1. hebrew + meaning 조합으로 매칭 (가장 정확)')
  console.log('   2. 주요 단어만 이미지 생성 (중복 최소화)')
  console.log('   3. 의미 세분화 (예: "하나님" → "하나님(엘로힘)", "하나님(여호와)")')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

checkDuplicateMeanings()
