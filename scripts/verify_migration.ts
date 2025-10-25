#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyMigration() {
  console.log('🔍 SVG → JPG 마이그레이션 검증\n')

  // 1. Database check
  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  const { count: wordsWithIconUrl } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_url', 'is', null)

  const { count: wordsWithIconSvg } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null)

  console.log('📊 데이터베이스 상태:')
  console.log(`  총 단어: ${totalWords}개`)
  console.log(`  icon_url 설정: ${wordsWithIconUrl}개 (${Math.round((wordsWithIconUrl! / totalWords!) * 100)}%)`)
  console.log(`  icon_svg 설정: ${wordsWithIconSvg}개`)
  console.log('')

  // 2. Storage check
  const { data: files } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', { limit: 1, offset: 0 })

  let totalFiles = 0
  let totalSize = 0

  if (files && files.length > 0) {
    // Get all files (paginated)
    let offset = 0
    const limit = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch } = await supabase.storage
        .from('hebrew-icons')
        .list('icons', { limit, offset })

      if (batch && batch.length > 0) {
        totalFiles += batch.length
        batch.forEach(file => {
          totalSize += file.metadata?.size || 0
        })
        offset += limit
      } else {
        hasMore = false
      }

      if (!batch || batch.length < limit) {
        hasMore = false
      }
    }
  }

  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)

  console.log('📦 Supabase Storage 상태:')
  console.log(`  hebrew-icons 버킷: ${files ? '✅' : '❌'}`)
  console.log(`  업로드된 파일: ${totalFiles}개`)
  console.log(`  총 용량: ${totalSizeMB} MB`)
  console.log('')

  // 3. Sample URL test
  const { data: sampleWords } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url')
    .not('icon_url', 'is', null)
    .limit(3)

  console.log('🖼️  샘플 이미지 URL (3개):')
  sampleWords?.forEach((word, idx) => {
    console.log(`  [${idx + 1}] ${word.hebrew} (${word.meaning})`)
    console.log(`      ${word.icon_url}`)
  })
  console.log('')

  // 4. Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (wordsWithIconUrl === totalWords) {
    console.log('✅ 마이그레이션 완료!')
    console.log('   모든 단어에 JPG 아이콘이 설정되었습니다.')
  } else if (wordsWithIconUrl! > 0) {
    console.log('⚠️  마이그레이션 부분 완료')
    console.log(`   ${totalWords! - wordsWithIconUrl!}개 단어에 icon_url이 없습니다.`)
  } else {
    console.log('❌ 마이그레이션 실패')
    console.log('   icon_url이 설정된 단어가 없습니다.')
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

verifyMigration()
