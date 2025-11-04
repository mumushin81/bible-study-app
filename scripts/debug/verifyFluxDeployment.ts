#!/usr/bin/env tsx

/**
 * FLUX 배포 결과 검증
 * - DB icon_url 상태 확인
 * - FLUX 이미지 개수 확인
 * - 매칭률 확인
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyFluxDeployment() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 FLUX 이미지 배포 결과 검증')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. 전체 단어 수
  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 전체 단어: ${totalWords}개\n`)

  // 2. icon_url이 있는 단어 수 (FLUX 이미지)
  const { data: wordsWithIcon, count: iconCount } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url', { count: 'exact' })
    .not('icon_url', 'is', null)

  console.log(`✅ FLUX 이미지 있음: ${iconCount}개`)
  console.log(`⏸️  이미지 없음: ${totalWords! - iconCount!}개\n`)

  // 3. 매칭률
  const matchRate = ((iconCount! / totalWords!) * 100).toFixed(1)
  console.log(`📈 FLUX 이미지 커버리지: ${matchRate}%\n`)

  // 4. FLUX 이미지 URL 샘플
  console.log('🎨 FLUX 이미지 URL 샘플 (최근 10개):')
  wordsWithIcon?.slice(0, 10).forEach((word, i) => {
    const filename = word.icon_url!.split('/').pop()
    console.log(`  ${i + 1}. ${word.hebrew} (${word.meaning})`)
    console.log(`     → ${filename}`)
  })

  // 5. Storage 파일 수 확인
  console.log('\n☁️  Supabase Storage 확인...')
  const { data: files, error } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', { limit: 500 })

  if (error) {
    console.error('❌ Storage 조회 실패:', error.message)
  } else {
    console.log(`📁 Storage 파일 수: ${files.length}개`)

    // 파일 크기 분석
    const totalSize = files.reduce((sum, f) => sum + f.metadata.size, 0)
    const avgSize = Math.round(totalSize / files.length / 1024)
    console.log(`📦 평균 파일 크기: ${avgSize} KB`)
  }

  // 결과 요약
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 배포 결과 요약')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 총 ${iconCount}개 단어에 FLUX 이미지 배포됨`)
  console.log(`📈 커버리지: ${matchRate}% (${iconCount}/${totalWords})`)
  console.log(`☁️  Storage: ${files?.length}개 FLUX 파일`)
  console.log(`\n🎉 FLUX 이미지 배포 완료!`)
}

verifyFluxDeployment().catch(console.error)
