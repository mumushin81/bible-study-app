#!/usr/bin/env tsx

/**
 * Supabase Storage 확인
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkStorage() {
  console.log('📦 Supabase Storage 확인 중...\n')

  // 모든 buckets 조회
  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ 오류:', error)
    return
  }

  console.log(`✅ 총 ${buckets.length}개 bucket 발견:`)
  buckets.forEach(bucket => {
    console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
  })

  // flashcardimg bucket 확인
  const hasFlashcardBucket = buckets.some(b => b.name === 'flashcardimg')

  if (hasFlashcardBucket) {
    console.log('\n✅ flashcardimg bucket 이미 존재합니다!')

    // 파일 목록 확인
    const { data: files } = await supabase.storage
      .from('flashcardimg')
      .list('words')

    console.log(`📁 words 폴더에 ${files?.length || 0}개 파일 존재`)
  } else {
    console.log('\n⚠️  flashcardimg bucket이 없습니다. 생성이 필요합니다.')
  }
}

checkStorage()
