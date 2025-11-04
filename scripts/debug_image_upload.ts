#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugImageUpload() {
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

  // 디버깅용 매핑 로그 생성
  console.log('\n📋 상세 디버깅 정보:')
  localImages.forEach(localImageName => {
    // 로컬 이미지 파일명에서 히브리어 단어 추출
    const hebrewWord = decodeURIComponent(localImageName.replace('.jpg', ''))

    // 다양한 매칭 시도
    const exactMatch = words.find(word => word.hebrew === hebrewWord)
    const partialMatches = words.filter(word =>
      hebrewWord.includes(word.hebrew) ||
      word.hebrew.includes(hebrewWord)
    )

    console.log(`
📄 로컬 이미지: ${localImageName}
   디코딩된 히브리어 단어: "${hebrewWord}"
   ✅ 완전 매칭: ${exactMatch ? `[${exactMatch.hebrew}] ${exactMatch.meaning}` : '없음'}
   🔍 부분 매칭 (${partialMatches.length}개):
     ${partialMatches.map(match => `[${match.hebrew}] ${match.meaning}`).join('\n     ')}
`)
  })

  // 특수 문자 및 공백 처리 매핑 로직 추가
  function normalizeHebrewWord(word: string) {
    // 공백, 하이픈, 언더스코어 제거
    return word.replace(/[\s\-_]/g, '')
  }

  console.log('\n🔬 특수 문자 정규화 매핑 시도:')
  localImages.forEach(localImageName => {
    // 로컬 이미지 파일명에서 히브리어 단어 추출
    const hebrewWord = decodeURIComponent(localImageName.replace('.jpg', ''))
    const normalizedLocalWord = normalizeHebrewWord(hebrewWord)

    const normalizedMatches = words.filter(word =>
      normalizeHebrewWord(word.hebrew) === normalizedLocalWord
    )

    if (normalizedMatches.length > 0) {
      console.log(`
📄 정규화된 이미지: ${localImageName}
   정규화된 히브리어 단어: "${normalizedLocalWord}"
   🔍 매칭된 단어들 (${normalizedMatches.length}개):
     ${normalizedMatches.map(match => `[${match.hebrew}] ${match.meaning}`).join('\n     ')}
`)
    }
  })
}

debugImageUpload().catch(console.error)