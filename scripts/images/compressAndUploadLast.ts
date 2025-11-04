#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync, writeFileSync } from 'fs'
import sharp from 'sharp'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function compressAndUpload() {
  const filename = 'word_5e2b80a3f685531bbcc1e726a03403b0.jpg'
  const inputPath = `/Users/jinxin/dev/bible-study-app/output/genesis1_1_all_jpg/${filename}`
  const storagePath = `icons/${filename}`

  console.log(`📦 압축 중: ${filename}`)

  // 리사이즈 + 압축 (1080x1920, quality: 25)
  const buffer = await sharp(inputPath)
    .resize(1080, 1920, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 25 })
    .toBuffer()

  const sizeKB = (buffer.length / 1024).toFixed(1)
  console.log(`✅ 압축 완료: ${sizeKB}KB`)

  // 로컬에도 저장
  writeFileSync(inputPath, buffer)

  console.log(`📤 업로드 중...`)

  const { error: uploadError } = await supabase.storage
    .from('hebrew-icons')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (uploadError) {
    throw new Error(`업로드 실패: ${uploadError.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('hebrew-icons')
    .getPublicUrl(storagePath)

  console.log(`✅ 업로드 완료: ${publicUrl}`)

  // DB 업데이트 - הָאָרֶץ 단어 찾기
  const { data: verse } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single()

  const { data: word } = await supabase
    .from('words')
    .select('id')
    .eq('verse_id', verse!.id)
    .eq('hebrew', 'הָאָרֶץ')
    .single()

  const { error: updateError } = await supabase
    .from('words')
    .update({ icon_url: publicUrl })
    .eq('id', word!.id)

  if (updateError) {
    throw new Error(`DB 업데이트 실패: ${updateError.message}`)
  }

  console.log('✅ DB 업데이트 완료')
}

compressAndUpload().catch(console.error)
