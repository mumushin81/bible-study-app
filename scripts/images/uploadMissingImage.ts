#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function uploadMissingImage() {
  const filename = 'word_e118965c2d94f937ccb7d315ab3711e3.jpg'
  const localPath = `/Users/jinxin/dev/bible-study-app/output/genesis1_1_all_jpg/${filename}`
  const storagePath = `icons/${filename}`

  console.log(`📤 업로드 중: ${filename}`)

  const buffer = readFileSync(localPath)

  const { error: uploadError } = await supabase.storage
    .from('hebrew-icons')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (uploadError && !uploadError.message.includes('already exists')) {
    throw new Error(`업로드 실패: ${uploadError.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('hebrew-icons')
    .getPublicUrl(storagePath)

  console.log(`✅ 업로드 완료: ${publicUrl}`)

  // DB 업데이트 - אֵת 단어 찾기
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
    .eq('hebrew', 'אֵת')
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

uploadMissingImage().catch(console.error)
