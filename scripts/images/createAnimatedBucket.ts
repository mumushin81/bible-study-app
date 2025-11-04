#!/usr/bin/env tsx

/**
 * Supabase Storage에 애니메이션 전용 버킷 생성
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createAnimatedBucket() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🪣 애니메이션 전용 버킷 생성')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 기존 버킷 목록 확인
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ 버킷 목록 조회 실패:', listError.message)
    return
  }

  console.log('📋 기존 버킷 목록:')
  buckets?.forEach(bucket => {
    console.log(`   - ${bucket.name} (public: ${bucket.public})`)
  })
  console.log()

  // animated-icons 버킷 생성
  const bucketName = 'animated-icons'

  const existingBucket = buckets?.find(b => b.name === bucketName)

  if (existingBucket) {
    console.log(`⚠️  버킷 '${bucketName}'이 이미 존재합니다.`)
    return
  }

  console.log(`🆕 새 버킷 생성: ${bucketName}`)

  const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['video/mp4', 'image/gif', 'video/quicktime', 'image/webp']
  })

  if (createError) {
    console.error('❌ 버킷 생성 실패:', createError.message)
    return
  }

  console.log(`✅ 버킷 '${bucketName}' 생성 완료!`)
  console.log()
  console.log('📝 버킷 설정:')
  console.log('   - Public: ✅')
  console.log('   - 파일 크기 제한: 50MB')
  console.log('   - 허용 MIME 타입:')
  console.log('     • video/mp4')
  console.log('     • image/gif')
  console.log('     • video/quicktime')
  console.log('     • image/webp')
  console.log()
  console.log('🎉 애니메이션 이미지를 업로드할 준비가 되었습니다!')
}

createAnimatedBucket().catch(console.error)
