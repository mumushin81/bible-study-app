#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateWordImageUrls() {
  console.log('🖼️ 단어 이미지 URL 업데이트 시작')

  // 1. 스토리지의 모든 이미지 조회
  const { data: storageImages, error: storageError } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })

  if (storageError) {
    console.error('❌ 스토리지 이미지 조회 실패:', storageError)
    return
  }

  // 2. 모든 단어 조회
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, hebrew')

  if (wordsError) {
    console.error('❌ 단어 조회 실패:', wordsError)
    return
  }

  console.log(`📦 총 이미지 수: ${storageImages.length}`)
  console.log(`📝 총 단어 수: ${words.length}`)

  // 3. 단어-이미지 매핑
  const updatePromises = storageImages
    .filter(img => img.name !== '__.jpg')
    .map(async (image) => {
      // 이미지 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${image.name}`)

      // 단어와 매칭 (가장 비슷한 단어 찾기)
      const matchedWord = words.find(word =>
        image.name.includes(word.hebrew) ||
        word.hebrew.includes(image.name.replace('.jpg', ''))
      )

      if (matchedWord) {
        // 단어에 이미지 URL 업데이트
        const { error: updateError } = await supabase
          .from('words')
          .update({ icon_url: publicUrl })
          .eq('id', matchedWord.id)

        if (updateError) {
          console.error(`❌ 단어 URL 업데이트 실패 (${matchedWord.hebrew}):`, updateError)
        } else {
          console.log(`✅ 단어 업데이트: ${matchedWord.hebrew} - ${publicUrl}`)
        }
      } else {
        console.warn(`⚠️ 매칭된 단어 없음: ${image.name}`)
      }
    })

  // 4. 모든 업데이트 대기
  await Promise.all(updatePromises)

  console.log('🎉 단어 이미지 URL 업데이트 완료!')
}

updateWordImageUrls().catch(console.error)