#!/usr/bin/env tsx

/**
 * 데이터베이스에서 icon_url과 icon_svg 데이터 확인
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkIconData() {
  console.log('🔍 단어 테이블의 icon_url, icon_svg 데이터 분석 중...\n')

  // 전체 단어 수 조회
  const { count: totalCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 총 단어 수: ${totalCount}`)

  // icon_svg가 있는 단어 수
  const { count: svgCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null)

  console.log(`📊 icon_svg가 있는 단어: ${svgCount}`)

  // icon_url이 있는 단어 수
  const { count: urlCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_url', 'is', null)

  console.log(`📊 icon_url이 있는 단어: ${urlCount}`)

  // 둘 다 없는 단어 수
  const { count: noneCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .is('icon_svg', null)
    .is('icon_url', null)

  console.log(`📊 icon이 없는 단어: ${noneCount}`)

  // 샘플 데이터 조회 (icon_url이 있는 경우)
  const { data: urlSamples } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url')
    .not('icon_url', 'is', null)
    .limit(5)

  console.log('\n✅ icon_url이 있는 샘플:')
  urlSamples?.forEach(word => {
    console.log(`  - ${word.hebrew} (${word.meaning}): ${word.icon_url?.substring(0, 80)}...`)
  })

  // 샘플 데이터 조회 (icon_svg만 있는 경우)
  const { data: svgSamples } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg')
    .not('icon_svg', 'is', null)
    .is('icon_url', null)
    .limit(5)

  console.log('\n📝 icon_svg만 있는 샘플:')
  svgSamples?.forEach(word => {
    const svgLength = word.icon_svg?.length || 0
    console.log(`  - ${word.hebrew} (${word.meaning}): SVG ${svgLength} chars`)
  })

  // 둘 다 없는 샘플
  const { data: noneSamples } = await supabase
    .from('words')
    .select('hebrew, meaning, verse_id')
    .is('icon_svg', null)
    .is('icon_url', null)
    .limit(5)

  console.log('\n❌ icon이 없는 샘플:')
  noneSamples?.forEach(word => {
    console.log(`  - ${word.hebrew} (${word.meaning}) [${word.verse_id}]`)
  })
}

checkIconData()
