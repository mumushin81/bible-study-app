#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkImages() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 업로드된 이미지 파일 검증')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Get some Genesis 1:3-31 words
  const { data: words, error } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, meaning, icon_url')
    .like('verse_id', 'genesis_1_%')
    .not('icon_url', 'is', null)
    .order('verse_id')
    .order('position')
    .limit(20)

  if (error) {
    console.error('❌ DB 조회 실패:', error)
    return
  }

  console.log(`검증할 단어 수: ${words.length}\n`)

  let successCount = 0
  let failCount = 0
  const failedImages: any[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    console.log(`[${i + 1}/${words.length}] ${word.hebrew} (${word.verse_id})`)
    console.log(`   URL: ${word.icon_url}`)

    try {
      // Fetch the image
      const response = await fetch(word.icon_url!)

      if (!response.ok) {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`)
        failCount++
        failedImages.push({
          word: word.hebrew,
          verse_id: word.verse_id,
          url: word.icon_url,
          error: `HTTP ${response.status}`
        })
        continue
      }

      // Check content type
      const contentType = response.headers.get('content-type')
      console.log(`   Content-Type: ${contentType}`)

      // Check file size
      const buffer = await response.arrayBuffer()
      const sizeKB = (buffer.byteLength / 1024).toFixed(2)
      console.log(`   파일 크기: ${sizeKB} KB`)

      // Verify it's actually a JPEG
      const uint8Array = new Uint8Array(buffer)
      const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF

      if (!isJPEG) {
        console.log(`   ❌ JPEG 시그니처 불일치 (첫 3바이트: ${uint8Array[0].toString(16)} ${uint8Array[1].toString(16)} ${uint8Array[2].toString(16)})`)
        failCount++
        failedImages.push({
          word: word.hebrew,
          verse_id: word.verse_id,
          url: word.icon_url,
          error: 'Invalid JPEG signature'
        })
        continue
      }

      if (contentType !== 'image/jpeg') {
        console.log(`   ⚠️  Content-Type이 image/jpeg가 아님: ${contentType}`)
      }

      console.log(`   ✅ 정상 (JPEG 형식 확인)\n`)
      successCount++

    } catch (error: any) {
      console.log(`   ❌ 오류: ${error.message}\n`)
      failCount++
      failedImages.push({
        word: word.hebrew,
        verse_id: word.verse_id,
        url: word.icon_url,
        error: error.message
      })
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 검증 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`✅ 정상: ${successCount}/${words.length}`)
  console.log(`❌ 실패: ${failCount}/${words.length}`)

  if (failedImages.length > 0) {
    console.log('\n실패한 이미지:')
    failedImages.forEach(img => {
      console.log(`  - ${img.word} (${img.verse_id}): ${img.error}`)
      console.log(`    ${img.url}`)
    })
  }

  // Check storage bucket metadata
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📦 Storage Bucket 설정 확인')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const { data: files } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', { limit: 5 })

  if (files) {
    console.log('최근 업로드된 파일 샘플:\n')
    files.forEach(file => {
      console.log(`  - ${file.name}`)
      console.log(`    크기: ${(file.metadata?.size / 1024).toFixed(2)} KB`)
      console.log(`    MIME: ${file.metadata?.mimetype || 'N/A'}`)
      console.log(`    업데이트: ${file.updated_at}\n`)
    })
  }
}

checkImages().catch(console.error)
