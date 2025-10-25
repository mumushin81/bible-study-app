#!/usr/bin/env tsx

/**
 * Supabase Storage bucket 생성
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createStorageBucket() {
  console.log('📦 hebrew-icons bucket 생성 중...\n')

  const { data, error } = await supabase.storage.createBucket('hebrew-icons', {
    public: true,
    fileSizeLimit: 102400, // 100KB
    allowedMimeTypes: ['image/jpeg', 'image/jpg']
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Bucket이 이미 존재합니다!')
      return
    }
    console.error('❌ Bucket 생성 실패:', error)
    return
  }

  console.log('✅ hebrew-icons bucket 생성 완료!')
  console.log('   - Public: true')
  console.log('   - Max size: 100KB')
  console.log('   - MIME types: image/jpeg, image/jpg')
}

createStorageBucket()
