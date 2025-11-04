#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { generateWordImagesBatch } from './images/generateImage'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function generateImagesForAllWords() {
  console.log('🚀 모든 단어의 AI 이미지 생성 시작')

  // 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning, korean, root, grammar')
    .is('iconUrl', null)  // 이미지가 없는 단어만 선택
    .order('id', { ascending: true })
    .limit(100)  // 처음 100개만 생성

  if (error || !words) {
    console.error('❌ 단어 조회 실패:', error)
    return
  }

  console.log(`📊 총 ${words.length}개의 이미지 없는 단어 발견`)

  // AI 이미지 생성
  const results = await generateWordImagesBatch(
    words.map(word => ({
      hebrew: word.hebrew,
      meaning: word.meaning,
      korean: word.korean,
      root: word.root,
      grammar: word.grammar
    })),
    {
      aspectRatio: '9:16',
      outputFormat: 'jpg',
      outputQuality: 90
    }
  )

  // 생성된 이미지 URL을 데이터베이스에 저장
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const imagePaths = results[i]

    if (imagePaths && imagePaths.length > 0) {
      const imageUrl = imagePaths[0] // 첫 번째 이미지 선택

      // Supabase Storage에 업로드
      const filename = `word_${word.hebrew.replace(/[^\w]/g, '_')}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hebrew-icons')
        .upload(`icons/${filename}`, imageUrl, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.error(`❌ 이미지 업로드 실패 (${word.hebrew}):`, uploadError)
        continue
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${filename}`)

      // 단어 레코드 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ iconUrl: publicUrl })
        .eq('hebrew', word.hebrew)

      if (updateError) {
        console.error(`❌ 데이터베이스 업데이트 실패 (${word.hebrew}):`, updateError)
      } else {
        console.log(`✅ ${word.hebrew}: 이미지 생성 및 저장 완료`)
      }
    }
  }

  console.log('🎉 모든 단어의 AI 이미지 생성 완료')
}

generateImagesForAllWords().catch(console.error)