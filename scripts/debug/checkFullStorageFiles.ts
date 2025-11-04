#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkFullStorageFiles() {
  console.log('🔍 Supabase Storage 전체 파일 확인 중...\n')

  // 전체 파일 목록 (limit 증가)
  const { data: files, error } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 2000,  // 충분히 큰 limit
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('❌ Storage 조회 실패:', error.message)
    return
  }

  console.log(`📊 총 파일 수: ${files.length}개\n`)

  // 크기별 분류
  const sizes = {
    small: 0,    // 0-15KB (Claude)
    medium: 0,   // 16-50KB (FLUX 일부)
    large: 0,    // 51KB+ (FLUX 고품질)
  }

  const largeSamples: any[] = []

  files.forEach(file => {
    const sizeKB = Math.round(file.metadata.size / 1024)
    if (sizeKB <= 15) {
      sizes.small++
    } else if (sizeKB <= 50) {
      sizes.medium++
      if (largeSamples.length < 10) {
        largeSamples.push({ name: file.name, size: sizeKB })
      }
    } else {
      sizes.large++
      if (largeSamples.length < 10) {
        largeSamples.push({ name: file.name, size: sizeKB })
      }
    }
  })

  console.log('📋 크기별 분류:')
  console.log(`  - 0-15KB (Claude): ${sizes.small}개`)
  console.log(`  - 16-50KB (FLUX): ${sizes.medium}개`)
  console.log(`  - 51KB+ (FLUX 고품질): ${sizes.large}개`)

  console.log('\n✅ 중대형 파일 샘플 (FLUX 후보):')
  largeSamples.forEach(f => {
    console.log(`  - ${f.name} (${f.size} KB)`)
  })

  // 평균 크기
  const totalSize = files.reduce((sum, f) => sum + f.metadata.size, 0)
  const avgSize = Math.round(totalSize / files.length / 1024)
  console.log(`\n📊 평균 파일 크기: ${avgSize} KB`)
}

checkFullStorageFiles()
