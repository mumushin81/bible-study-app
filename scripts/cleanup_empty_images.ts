#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
}

async function cleanupEmptyImages() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🧹 빈 파일명 이미지 정리 및 데이터베이스 업데이트 시작')

  // Supabase 스토리지의 빈 파일명 이미지 확인
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 300,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })

  if (storageError) {
    console.error('Supabase 스토리지 파일 목록 조회 실패:', storageError)
    return
  }

  // 빈 파일명 이미지 필터링
  const emptyFileImages = storageFiles.filter(file =>
    file.name === '.jpg' || file.name === '_.jpg'
  )

  console.log(`🔍 발견된 빈 파일명 이미지: ${emptyFileImages.length}개`)

  // 빈 파일명 이미지 삭제
  if (emptyFileImages.length > 0) {
    const deletePromises = emptyFileImages.map(file =>
      supabase.storage
        .from('hebrew-icons')
        .remove([`icons/${file.name}`])
    )

    const deleteResults = await Promise.allSettled(deletePromises)

    const successCount = deleteResults.filter(
      result => result.status === 'fulfilled'
    ).length
    const failureCount = deleteResults.filter(
      result => result.status === 'rejected'
    ).length

    console.log('\n📊 이미지 삭제 결과:')
    console.log(`✅ 성공: ${successCount}/${emptyFileImages.length}`)
    console.log(`❌ 실패: ${failureCount}/${emptyFileImages.length}`)
  }

  // JSON 파일에서 단어 로드
  const jsonFiles = [
    join(process.cwd(), 'scripts/images/genesis1-words.json'),
    join(process.cwd(), 'scripts/images/genesis1-verse2-31.json')
  ]

  const allWords: WordInfo[] = []
  for (const file of jsonFiles) {
    const data = JSON.parse(readFileSync(file, 'utf-8'))
    allWords.push(...(data.wordsToGenerate || data.words || []))
  }

  // 데이터베이스에서 빈 icon_url 또는 문제있는 icon_url 확인
  const { data: dbWords, error: dbError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, korean, icon_url')
    .or('icon_url.is.null,icon_url.like.%.jpg')

  if (dbError) {
    console.error('데이터베이스 단어 조회 실패:', dbError)
    return
  }

  console.log(`🔍 문제 있는 icon_url 발견: ${dbWords.length}개`)

  // 데이터베이스 icon_url 정리
  if (dbWords.length > 0) {
    const updatePromises = dbWords.map(async (word) => {
      // 동일한 의미의 단어 찾기
      const matchedWord = allWords.find(w =>
        w.meaning.includes(word.meaning) ||
        word.meaning.includes(w.meaning)
      )

      if (matchedWord) {
        // 로컬 이미지 디렉터리에서 이미지 파일명 생성
        const safeFilename = matchedWord.hebrew
          .replace(/[\u0591-\u05C7]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '_')

        const newIconUrl = `https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/${safeFilename}.jpg`

        const { data, error } = await supabase
          .from('words')
          .update({ icon_url: newIconUrl })
          .eq('id', word.id)

        if (error) {
          console.error(`❌ 업데이트 실패: ${word.meaning}`, error)
          return false
        }

        console.log(`✅ 업데이트 성공: ${word.meaning} -> ${newIconUrl}`)
        return true
      }

      return false
    })

    const updateResults = await Promise.allSettled(updatePromises)

    const successCount = updateResults.filter(
      result => result.status === 'fulfilled' && result.value
    ).length
    const failureCount = updateResults.filter(
      result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)
    ).length

    console.log('\n📊 데이터베이스 icon_url 업데이트 결과:')
    console.log(`✅ 성공: ${successCount}/${dbWords.length}`)
    console.log(`❌ 실패: ${failureCount}/${dbWords.length}`)
  }

  console.log('\n🎉 이미지 및 데이터베이스 정리 완료!')
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupEmptyImages()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ 정리 중 오류:', err)
      process.exit(1)
    })
}