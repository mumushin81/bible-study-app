#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkStorage() {
  // Check buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError)
    return
  }

  console.log('📦 Storage Buckets (admin view):')
  buckets?.forEach(bucket => {
    console.log(`  - ${bucket.name} (public: ${bucket.public})`)
  })
  console.log('')

  // List files in hebrew-icons/icons
  const { data: files, error: filesError } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 10,
      offset: 0
    })

  if (filesError) {
    console.error('❌ Error listing files:', filesError.message)
    return
  }

  console.log(`📁 hebrew-icons/icons - ${files?.length || 0}개 파일:`)
  files?.forEach((file, idx) => {
    const sizeKB = Math.round((file.metadata?.size || 0) / 1024)
    console.log(`  [${idx + 1}] ${file.name} (${sizeKB} KB)`)
  })
}

checkStorage()
