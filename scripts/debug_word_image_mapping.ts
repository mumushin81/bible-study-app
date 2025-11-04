#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugWordImageMapping() {
  console.log('🔍 단어-이미지 매핑 분석')

  // 1. 모든 이미지 조회
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

  console.log(`📦 스토리지 이미지 수: ${storageImages.length}`)

  // 2. 데이터베이스 단어 조회
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('hebrew, icon_url, meaning')
    .not('icon_url', 'is', null)
    .limit(50)

  if (wordsError) {
    console.error('❌ 단어 조회 실패:', wordsError)
    return
  }

  console.log(`📝 이미지 URL이 있는 단어 수: ${words.length}`)

  // 3. 이미지-단어 매핑 분석
  const imageFilenames = storageImages.map(img => img.name)

  console.log('\n🔗 이미지-단어 매핑 분석:')
  words.forEach(word => {
    // URL에서 파일명 추출
    const urlParts = word.icon_url ? word.icon_url.split('/') : []
    const filename = urlParts[urlParts.length - 1]

    console.log(`
히브리어: ${word.hebrew}
의미: ${word.meaning}
이미지 URL: ${word.icon_url}
파일명: ${filename}
이미지 존재 여부: ${imageFilenames.includes(filename) ? '✅ 존재' : '❌ 없음'}
    `)
  })

  // 4. 매핑되지 않은 이미지 확인
  const unmappedImages = imageFilenames.filter(
    filename => !words.some(word =>
      word.icon_url && word.icon_url.endsWith(filename)
    )
  )

  console.log('\n🚨 매핑되지 않은 이미지:')
  unmappedImages.forEach(img => console.log(img))
}

debugWordImageMapping().catch(console.error)