#!/usr/bin/env tsx

/**
 * 플래시카드 이미지 전체 삭제
 * - DB의 icon_url을 NULL로 설정
 * - Supabase Storage의 FLUX 이미지 삭제 (선택)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as readline from 'readline'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STORAGE_BUCKET = 'hebrew-icons'
const STORAGE_PATH = 'icons'

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
}

async function deleteAllFlashcardImages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🗑️  플래시카드 이미지 전체 삭제')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 현재 상태 확인
  const { data: wordsWithIcon } = await supabase
    .from('words')
    .select('id, icon_url')
    .not('icon_url', 'is', null)

  console.log(`📊 현재 상태:`)
  console.log(`   icon_url이 있는 단어: ${wordsWithIcon?.length || 0}개\n`)

  // Storage 파일 확인
  const { data: storageFiles } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(STORAGE_PATH)

  const fluxFiles = storageFiles?.filter(f => f.name.startsWith('word_') && f.name.endsWith('.jpg')) || []
  console.log(`   Storage FLUX 파일: ${fluxFiles.length}개\n`)

  console.log('⚠️  삭제 옵션:')
  console.log('   1. DB icon_url만 NULL로 (Storage 파일 유지)')
  console.log('   2. DB + Storage 파일 모두 삭제')
  console.log('   3. 취소\n')

  const answer = await askQuestion('선택하세요 (1/2/3): ')

  if (answer === '3' || !answer) {
    console.log('\n❌ 취소되었습니다.')
    return
  }

  const deleteStorage = answer === '2'

  // 1. DB icon_url NULL 처리
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🗑️  DB icon_url 삭제 중...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const BATCH_SIZE = 100
  let totalUpdated = 0

  if (wordsWithIcon && wordsWithIcon.length > 0) {
    for (let i = 0; i < wordsWithIcon.length; i += BATCH_SIZE) {
      const batch = wordsWithIcon.slice(i, i + BATCH_SIZE).map(w => w.id)

      const { error } = await supabase
        .from('words')
        .update({ icon_url: null })
        .in('id', batch)

      if (error) {
        console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 실패:`, error.message)
      } else {
        totalUpdated += batch.length
        console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}개 처리 (${totalUpdated}/${wordsWithIcon.length})`)
      }

      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  console.log(`\n✅ DB에서 ${totalUpdated}개 icon_url을 NULL로 설정했습니다.\n`)

  // 2. Storage 파일 삭제 (선택)
  if (deleteStorage && fluxFiles.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🗑️  Storage FLUX 파일 삭제 중...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const filesToDelete = fluxFiles.map(f => `${STORAGE_PATH}/${f.name}`)

    const { data: deletedFiles, error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filesToDelete)

    if (deleteError) {
      console.error('❌ Storage 삭제 실패:', deleteError.message)
    } else {
      console.log(`✅ ${deletedFiles?.length || 0}개 파일을 Storage에서 삭제했습니다.\n`)
    }
  }

  // 최종 확인
  const { data: finalCheck } = await supabase
    .from('words')
    .select('id')
    .not('icon_url', 'is', null)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ 삭제 완료')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`📊 최종 상태:`)
  console.log(`   icon_url이 있는 단어: ${finalCheck?.length || 0}개`)

  if (deleteStorage) {
    const { data: remainingFiles } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(STORAGE_PATH)
    const remaining = remainingFiles?.filter(f => f.name.startsWith('word_') && f.name.endsWith('.jpg')) || []
    console.log(`   Storage FLUX 파일: ${remaining.length}개`)
  }

  console.log('\n🎉 모든 플래시카드 이미지가 삭제되었습니다!')
}

deleteAllFlashcardImages().catch(console.error)
