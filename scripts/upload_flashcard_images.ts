#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function uploadFlashcardImages() {
  const IMAGE_DIR = join(process.cwd(), 'public', 'images', 'words')
  const images = readdirSync(IMAGE_DIR).filter(f => f.endsWith('.jpg') && f !== 'default_word_icon.jpg')

  console.log(`🖼️ 총 ${images.length}개 이미지 발견`)

  for (const filename of images) {
    const hebrewWord = decodeURIComponent(filename.replace('.jpg', ''))
    const filepath = join(IMAGE_DIR, filename)
    const fileBuffer = readFileSync(filepath)

    try {
      // 단어 확인
      const { data: wordData, error: wordError } = await supabase
        .from('words')
        .select('id, hebrew')
        .or(`hebrew.eq.${hebrewWord},hebrew.eq.${decodeURIComponent(hebrewWord)}`)
        .single()

      if (wordError || !wordData) {
        console.warn(`⚠️ 단어를 찾을 수 없음: ${hebrewWord}`)
        continue
      }

      // 스토리지에 이미지 업로드
      const storageFilename = `${wordData.id}.jpg`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('flashcardimg')
        .upload(storageFilename, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (storageError) {
        console.error(`❌ 이미지 업로드 실패 (${hebrewWord}):`, storageError)
        continue
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('flashcardimg')
        .getPublicUrl(storageFilename)

      // 단어 레코드 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({
          iconUrl: publicUrl,
          flashcardImg: publicUrl
        })
        .eq('id', wordData.id)

      if (updateError) {
        console.error(`❌ 데이터베이스 업데이트 실패 (${hebrewWord}):`, updateError)
        continue
      }

      console.log(`✅ ${hebrewWord} 이미지 업로드 완료: ${publicUrl}`)

    } catch (error) {
      console.error(`❌ 처리 중 오류 (${hebrewWord}):`, error)
    }
  }

  console.log('🎉 모든 이미지 업로드 완료!')
}

uploadFlashcardImages().catch(console.error)