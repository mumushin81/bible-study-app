#!/usr/bin/env tsx

/**
 * Supabase Storage에 저장된 파일 목록 확인
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkStorageFiles() {
  console.log('🔍 Supabase Storage 파일 목록 확인 중...\n')

  // hebrew-icons 버킷의 파일 목록
  const { data: files, error } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('❌ Storage 조회 실패:', error.message)
    return
  }

  console.log(`📊 총 ${files.length}개 파일 발견\n`)

  // 파일명 패턴 분석
  const patterns = {
    word_md5: 0,
    word_hash: 0,
    other: 0
  }

  const samples: any[] = []

  files.forEach((file, idx) => {
    if (file.name.startsWith('word_') && file.name.match(/word_[a-f0-9]{32}\.jpg/)) {
      patterns.word_md5++
    } else if (file.name.startsWith('word_')) {
      patterns.word_hash++
    } else {
      patterns.other++
    }

    if (idx < 10) {
      samples.push({
        name: file.name,
        size: Math.round(file.metadata.size / 1024) + ' KB',
        created: file.created_at
      })
    }
  })

  console.log('📋 파일명 패턴 분석:')
  console.log(`  - word_{md5}.jpg: ${patterns.word_md5}개`)
  console.log(`  - word_*.jpg (기타): ${patterns.word_hash}개`)
  console.log(`  - 기타 형식: ${patterns.other}개`)

  console.log('\n✅ 최근 10개 파일 샘플:')
  samples.forEach(file => {
    console.log(`  - ${file.name} (${file.size}, ${file.created})`)
  })
}

checkStorageFiles()
