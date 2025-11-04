#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function reuploadLocalImages() {
  const localImageDir = path.join(process.cwd(), 'public', 'images', 'words')
  const localImages = fs.readdirSync(localImageDir)
    .filter(file => file.endsWith('.jpg') && file !== 'default_word_icon.jpg')

  console.log(`🖼️ 로컬 이미지 수: ${localImages.length}`)

  // 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning')

  if (error) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  console.log(`📝 데이터베이스 단어 수: ${words.length}`)

  const uploadPromises = localImages.map(async (localImageName) => {
    // 로컬 이미지 파일명에서 히브리어 단어 추출
    const hebrewWord = decodeURIComponent(localImageName.replace('.jpg', ''))

    // 히브리어 단어로 매칭되는 단어 찾기
    const matchedWord = words.find(word =>
      word.hebrew === hebrewWord ||
      hebrewWord.includes(word.hebrew)
    )

    if (matchedWord) {
      // 로컬 이미지 파일 읽기
      const filePath = path.join(localImageDir, localImageName)
      const imageBuffer = fs.readFileSync(filePath)

      // 이미지를 Supabase Storage에 업로드 (고유한 파일명 생성)
      const uploadFilename = `word_${matchedWord.id}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hebrew-icons')
        .upload(`icons/${uploadFilename}`, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.error(`❌ 이미지 업로드 실패 (${hebrewWord}):`, uploadError)
        return null
      }

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${uploadFilename}`)

      // 데이터베이스 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('id', matchedWord.id)

      if (updateError) {
        console.error(`❌ 데이터베이스 URL 업데이트 실패 (${hebrewWord}):`, updateError)
        return null
      }

      return {
        localImage: localImageName,
        hebrewWord,
        wordId: matchedWord.id,
        publicUrl
      }
    }

    return null
  })

  const uploadResults = await Promise.all(uploadPromises)
  const successfulUploads = uploadResults.filter(result => result !== null)
  const failedUploads = localImages.filter(
    localImage => !successfulUploads.some(
      result => result?.localImage === localImage
    )
  )

  console.log('\n📊 업로드 결과:')
  console.log(`✅ 성공한 업로드: ${successfulUploads.length}`)
  console.log(`❌ 업로드 실패한 이미지: ${failedUploads.length}`)

  console.log('\n🔗 성공한 업로드 상세:')
  successfulUploads.forEach(result => {
    console.log(`
- 로컬 이미지: ${result.localImage}
  히브리어 단어: ${result.hebrewWord}
  데이터베이스 ID: ${result.wordId}
  이미지 URL: ${result.publicUrl}
    `)
  })

  console.log('\n❓ 업로드 실패한 이미지:')
  failedUploads.forEach(image => {
    console.log(`- ${image}`)
  })
}

reuploadLocalImages().catch(console.error)