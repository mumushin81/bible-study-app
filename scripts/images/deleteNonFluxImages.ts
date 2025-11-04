#!/usr/bin/env tsx

/**
 * FLUX 이미지가 아닌 모든 이미지 삭제
 * - 로컬 FLUX 파일의 MD5 해시 목록 생성
 * - Storage에서 해당 해시가 아닌 파일 모두 삭제
 */

import { createClient } from '@supabase/supabase-js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LOCAL_DIR = join(process.cwd(), 'public', 'images', 'words')

async function deleteNonFluxImages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🗑️  FLUX 이미지 외 모든 파일 삭제')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. 로컬 FLUX 파일 목록 → MD5 해시 생성
  const localFiles = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  const fluxHashes = new Set<string>()

  console.log(`📁 로컬 FLUX 파일: ${localFiles.length}개\n`)
  
  localFiles.forEach(filename => {
    const hebrew = filename.replace('.jpg', '')
    const hash = createHash('md5').update(hebrew).digest('hex')
    const storageFilename = `word_${hash}.jpg`
    fluxHashes.add(storageFilename)
  })

  console.log(`🔑 FLUX 해시 목록: ${fluxHashes.size}개\n`)

  // 2. Storage 전체 파일 목록 조회
  console.log('☁️  Storage 파일 목록 조회 중...\n')
  
  const { data: files, error } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 3000
    })

  if (error) {
    console.error('❌ Storage 조회 실패:', error.message)
    return
  }

  console.log(`📊 Storage 총 파일: ${files.length}개\n`)

  // 3. FLUX가 아닌 파일 필터링
  const filesToDelete = files.filter(file => !fluxHashes.has(file.name))
  const fluxFiles = files.filter(file => fluxHashes.has(file.name))

  console.log(`✅ FLUX 파일 (보존): ${fluxFiles.length}개`)
  console.log(`❌ 삭제 대상: ${filesToDelete.length}개\n`)

  // 4. 확인 메시지
  console.log('⚠️  정말로 삭제하시겠습니까?')
  console.log(`   - 보존: ${fluxFiles.length}개 (FLUX)`)
  console.log(`   - 삭제: ${filesToDelete.length}개 (Claude 등)\n`)

  // 5. 삭제 실행
  console.log('🗑️  삭제 시작...\n')

  let deleted = 0
  let failed = 0

  // 배치 삭제 (한 번에 여러 개)
  const BATCH_SIZE = 50
  for (let i = 0; i < filesToDelete.length; i += BATCH_SIZE) {
    const batch = filesToDelete.slice(i, i + BATCH_SIZE)
    const paths = batch.map(f => `icons/${f.name}`)

    const { error: deleteError } = await supabase.storage
      .from('hebrew-icons')
      .remove(paths)

    if (deleteError) {
      console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삭제 실패:`, deleteError.message)
      failed += batch.length
    } else {
      deleted += batch.length
      console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}개 삭제 (진행: ${deleted}/${filesToDelete.length})`)
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // 결과 요약
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 삭제 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 삭제 성공: ${deleted}/${filesToDelete.length}`)
  console.log(`❌ 삭제 실패: ${failed}/${filesToDelete.length}`)
  console.log(`💾 보존된 FLUX 파일: ${fluxFiles.length}개`)

  if (deleted === filesToDelete.length) {
    console.log('\n🎉 모든 Claude 생성 이미지가 삭제되었습니다!')
    console.log('✅ FLUX 이미지만 남았습니다.')
  }
}

deleteNonFluxImages().catch(console.error)
