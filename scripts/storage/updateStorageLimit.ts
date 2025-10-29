#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateStorageLimit() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📦 Supabase Storage 파일 크기 제한 변경')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Check current limit
  console.log('현재 설정 확인 중...')
  const { data: buckets, error: listError } = await supabase
    .from('storage.buckets')
    .select('name, file_size_limit')
    .eq('name', 'hebrew-icons')

  if (listError) {
    console.error('❌ 오류:', listError)
    return
  }

  if (buckets && buckets.length > 0) {
    const currentLimit = buckets[0].file_size_limit || 'unlimited'
    const limitKB = typeof currentLimit === 'number' ? (currentLimit / 1024).toFixed(0) : currentLimit
    console.log(`현재 제한: ${limitKB}KB\n`)
  }

  // Update to 1MB (1048576 bytes)
  const newLimit = 1048576 // 1MB
  const newLimitKB = newLimit / 1024

  console.log(`새로운 제한으로 변경: ${newLimitKB}KB (1MB)`)
  console.log('변경 중...\n')

  // Note: Direct bucket updates via service role might not work
  // This needs to be done via Supabase SQL or Dashboard
  const { error: updateError } = await supabase.rpc('update_storage_bucket_limit', {
    bucket_name: 'hebrew-icons',
    new_limit: newLimit
  })

  if (updateError) {
    console.log('⚠️  직접 업데이트 불가:', updateError.message)
    console.log('\n다음 방법 중 하나를 사용하세요:\n')
    console.log('1. Supabase Dashboard에서 변경:')
    console.log('   https://supabase.com/dashboard')
    console.log('   Storage → hebrew-icons → Settings → File size limit\n')
    console.log('2. SQL Editor에서 실행:')
    console.log('   UPDATE storage.buckets')
    console.log(`   SET file_size_limit = ${newLimit}`)
    console.log('   WHERE name = \'hebrew-icons\';\n')
    return
  }

  console.log('✅ 파일 크기 제한이 1MB로 변경되었습니다!')
  console.log('\n이제 압축 없이 원본 이미지를 업로드할 수 있습니다.')
}

updateStorageLimit().catch(console.error)
