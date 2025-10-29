#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'
import sharp from 'sharp'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)
const STORAGE_BASE_URL = `${supabaseUrl}/storage/v1/object/public/hebrew-icons/icons`

// Failed files (over 100KB)
const failedFiles = [
  'word_cddf289d_b5e1_4e4b_b641_8270f84a9db6.jpg',  // 175KB
  'word_a56012bb_1f20_4501_ae2b_9608607d3664.jpg',  // 166KB
  'word_90ee4772_c10b_4f49_826b_3a389de75e44.jpg',  // 110KB
  'word_513f61f3_2e6c_4beb_a6b6_e02f354fe09a.jpg',  // 107KB
  'word_a797addd_b8d8_42f4_82d8_695009525c86.jpg',  // 105KB
]

async function compressAndUpload(filename: string) {
  const inputPath = join(process.cwd(), 'output/genesis1_3to31', filename)
  const outputPath = join(process.cwd(), 'output/genesis1_3to31', `compressed_${filename}`)

  console.log(`\n처리 중: ${filename}`)

  // Read original file
  const originalBuffer = readFileSync(inputPath)
  const originalSize = originalBuffer.byteLength / 1024
  console.log(`   원본 크기: ${originalSize.toFixed(2)} KB`)

  // Compress using sharp
  const compressedBuffer = await sharp(originalBuffer)
    .jpeg({ quality: 75 }) // Reduce quality to 75%
    .toBuffer()

  const compressedSize = compressedBuffer.byteLength / 1024
  console.log(`   압축 후: ${compressedSize.toFixed(2)} KB (${((compressedSize / originalSize) * 100).toFixed(1)}%)`)

  // Save compressed version
  writeFileSync(outputPath, compressedBuffer)

  // Upload to Supabase
  const storagePath = `icons/${filename}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('hebrew-icons')
      .upload(storagePath, compressedBuffer, {
        contentType: 'image/jpeg',
        upsert: true  // Overwrite if exists
      })

    if (uploadError) {
      console.log(`   ❌ 업로드 실패: ${uploadError.message}`)
      return { success: false, error: uploadError.message }
    }

    console.log(`   ✅ 업로드 성공`)

    // Update database
    const wordId = filename.replace('word_', '').replace('.jpg', '').replace(/_/g, '-')
    const iconUrl = `${STORAGE_BASE_URL}/${filename}`

    const { error: dbError } = await supabase
      .from('words')
      .update({ icon_url: iconUrl })
      .eq('id', wordId)

    if (dbError) {
      console.log(`   ❌ DB 업데이트 실패: ${dbError.message}`)
      return { success: false, error: dbError.message }
    }

    console.log(`   ✅ DB 업데이트 완료`)
    console.log(`   🔗 ${iconUrl}`)

    return { success: true }
  } catch (error: any) {
    console.log(`   ❌ 오류: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 실패한 이미지 압축 및 재업로드')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n총 ${failedFiles.length}개 파일 처리`)

  let successCount = 0
  let failCount = 0

  for (const filename of failedFiles) {
    const result = await compressAndUpload(filename)
    if (result.success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 처리 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 성공: ${successCount}/${failedFiles.length}`)
  console.log(`❌ 실패: ${failCount}`)

  if (successCount === failedFiles.length) {
    console.log('\n🎉 모든 이미지 처리 완료!')
  }
}

main().catch(console.error)
