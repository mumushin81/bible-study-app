#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function mapImagesWithUID() {
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

  const updatePromises = localImages.map(async (localImageName) => {
    // 로컬 이미지 파일명에서 히브리어 단어 추출
    const hebrewWord = decodeURIComponent(localImageName.replace('.jpg', ''))

    // 히브리어 단어로 매칭되는 단어 찾기
    const matchedWord = words.find(word => word.hebrew === hebrewWord)

    if (matchedWord) {
      // 데이터베이스 이미지 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/word_${matchedWord.id}.jpg`)

      // 데이터베이스 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('id', matchedWord.id)

      if (updateError) {
        console.error(`❌ URL 업데이트 실패 (${hebrewWord}):`, updateError)
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

  const mappingResults = await Promise.all(updatePromises)
  const successfulMappings = mappingResults.filter(result => result !== null)
  const failedMappings = localImages.filter(
    localImage => !successfulMappings.some(
      result => result?.localImage === localImage
    )
  )

  console.log('\n📊 매핑 결과:')
  console.log(`✅ 성공한 매핑: ${successfulMappings.length}`)
  console.log(`❌ 매핑 실패한 이미지: ${failedMappings.length}`)

  console.log('\n🔗 성공한 매핑 상세:')
  successfulMappings.forEach(result => {
    console.log(`
- 로컬 이미지: ${result.localImage}
  히브리어 단어: ${result.hebrewWord}
  데이터베이스 ID: ${result.wordId}
  이미지 URL: ${result.publicUrl}
    `)
  })

  console.log('\n❓ 매핑 실패한 이미지:')
  failedMappings.forEach(image => {
    console.log(`- ${image}`)
  })
}

mapImagesWithUID().catch(console.error)