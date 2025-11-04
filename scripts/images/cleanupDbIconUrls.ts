#!/usr/bin/env tsx

/**
 * DB icon_url 정리 - FLUX 이미지가 아닌 URL들 NULL 처리
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

async function cleanupDbIconUrls() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 DB icon_url 정리 (FLUX 아닌 것 NULL 처리)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. 로컬 FLUX 파일 목록 → MD5 해시 생성
  const localFiles = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  const fluxFilenames = new Set<string>()

  localFiles.forEach(filename => {
    const hebrew = filename.replace('.jpg', '')
    const hash = createHash('md5').update(hebrew).digest('hex')
    const storageFilename = `word_${hash}.jpg`
    fluxFilenames.add(storageFilename)
  })

  console.log(`✅ FLUX 파일명 목록: ${fluxFilenames.size}개\n`)

  // 2. DB에서 icon_url이 있는 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url')
    .not('icon_url', 'is', null)

  if (error) {
    console.error('❌ DB 조회 실패:', error.message)
    return
  }

  console.log(`📊 DB icon_url이 있는 단어: ${words!.length}개\n`)

  // 3. FLUX 파일명이 포함되지 않은 icon_url 찾기
  const toClean: string[] = []
  const toKeep: string[] = []

  words!.forEach(word => {
    const url = word.icon_url!
    // URL에서 파일명 추출
    const filename = url.split('/').pop()
    
    if (filename && fluxFilenames.has(filename)) {
      toKeep.push(word.id)
    } else {
      toClean.push(word.id)
    }
  })

  console.log(`✅ 유지할 icon_url: ${toKeep.length}개`)
  console.log(`❌ 삭제할 icon_url: ${toClean.length}개\n`)

  // 4. 배치로 NULL 처리
  if (toClean.length > 0) {
    console.log('🧹 icon_url NULL 처리 중...\n')

    const BATCH_SIZE = 100
    let updated = 0
    let failed = 0

    for (let i = 0; i < toClean.length; i += BATCH_SIZE) {
      const batch = toClean.slice(i, i + BATCH_SIZE)

      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: null })
        .in('id', batch)

      if (updateError) {
        console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 실패:`, updateError.message)
        failed += batch.length
      } else {
        updated += batch.length
        console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}개 처리 (진행: ${updated}/${toClean.length})`)
      }

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    console.log(`\n✅ ${updated}개 레코드의 icon_url을 NULL로 처리했습니다.`)
    if (failed > 0) {
      console.log(`❌ ${failed}개 실패`)
    }
  }

  // 결과 요약
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 정리 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 유지된 FLUX icon_url: ${toKeep.length}개`)
  console.log(`🧹 정리된 icon_url: ${toClean.length}개`)
  console.log(`\n🎉 DB 정리 완료!`)
}

cleanupDbIconUrls().catch(console.error)
