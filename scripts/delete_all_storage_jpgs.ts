#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function deleteAllStorageJpgs() {
  console.log('🗑️  Supabase Storage JPG 삭제 시작\n')

  // 모든 파일 목록 가져오기
  const allFiles: string[] = []
  let offset = 0
  const limit = 1000

  while (true) {
    const { data: files, error } = await supabase.storage
      .from('hebrew-icons')
      .list('icons', { limit, offset })

    if (error) {
      console.error('❌ 파일 목록 조회 실패:', error.message)
      break
    }

    if (!files || files.length === 0) break

    files.forEach(file => {
      if (file.name.endsWith('.jpg')) {
        allFiles.push(`icons/${file.name}`)
      }
    })

    console.log(`📁 ${offset + files.length}개 파일 스캔 완료...`)

    if (files.length < limit) break
    offset += limit
  }

  console.log(`\n총 ${allFiles.length}개 JPG 파일 발견\n`)

  if (allFiles.length === 0) {
    console.log('✅ 삭제할 파일이 없습니다')
    return
  }

  // 배치로 삭제 (한 번에 너무 많이 삭제하면 에러 발생 가능)
  const batchSize = 100
  let deleted = 0
  let failed = 0

  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize)

    const { error } = await supabase.storage
      .from('hebrew-icons')
      .remove(batch)

    if (error) {
      console.error(`❌ 배치 ${Math.floor(i / batchSize) + 1} 삭제 실패:`, error.message)
      failed += batch.length
    } else {
      deleted += batch.length
      console.log(`✅ [${i + batch.length}/${allFiles.length}] 삭제 완료`)
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ 삭제 성공: ${deleted}개`)
  console.log(`❌ 삭제 실패: ${failed}개`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // DB의 icon_url도 NULL로 초기화
  console.log('🔄 DB icon_url 필드 초기화 중...\n')

  const { error: updateError } = await supabase
    .from('words')
    .update({ icon_url: null })
    .not('icon_url', 'is', null)

  if (updateError) {
    console.error('❌ DB 업데이트 실패:', updateError.message)
  } else {
    console.log('✅ DB icon_url 필드 초기화 완료')
  }
}

deleteAllStorageJpgs()
