#!/usr/bin/env tsx

/**
 * FLUX 이미지와 Claude JPG 이미지 비교 분석
 */

import { createClient } from '@supabase/supabase-js'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function analyzeFLUXImages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 FLUX 이미지 vs Claude JPG 분석')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. 로컬 public/images/words 폴더 확인 (FLUX 생성)
  const localDir = join(process.cwd(), 'public', 'images', 'words')
  let localFiles: string[] = []
  let localSizes: number[] = []

  try {
    localFiles = readdirSync(localDir).filter(f => f.endsWith('.jpg'))
    localSizes = localFiles.map(f => statSync(join(localDir, f)).size)
    
    const avgSize = Math.round(localSizes.reduce((a, b) => a + b, 0) / localSizes.length / 1024)
    const minSize = Math.round(Math.min(...localSizes) / 1024)
    const maxSize = Math.round(Math.max(...localSizes) / 1024)
    
    console.log('📂 로컬 FLUX 이미지 (public/images/words):')
    console.log(`   - 파일 수: ${localFiles.length}개`)
    console.log(`   - 평균 크기: ${avgSize} KB`)
    console.log(`   - 크기 범위: ${minSize} KB ~ ${maxSize} KB`)
    console.log(`   - 샘플: ${localFiles.slice(0, 3).join(', ')}`)
  } catch (err) {
    console.log('📂 로컬 FLUX 이미지: 없음\n')
  }

  // 2. Supabase Storage 파일 확인
  const { data: storageFiles, error } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 1000
    })

  if (error) {
    console.error('❌ Storage 조회 실패:', error.message)
    return
  }

  const storageSizes = storageFiles.map(f => f.metadata.size)
  const avgStorageSize = Math.round(storageSizes.reduce((a, b) => a + b, 0) / storageSizes.length / 1024)
  const minStorageSize = Math.round(Math.min(...storageSizes) / 1024)
  const maxStorageSize = Math.round(Math.max(...storageSizes) / 1024)

  // 큰 파일 (FLUX 후보) 찾기
  const largFiles = storageFiles.filter(f => f.metadata.size > 100 * 1024) // 100KB 이상
  
  console.log('\n☁️  Supabase Storage (hebrew-icons/icons):')
  console.log(`   - 파일 수: ${storageFiles.length}개`)
  console.log(`   - 평균 크기: ${avgStorageSize} KB`)
  console.log(`   - 크기 범위: ${minStorageSize} KB ~ ${maxStorageSize} KB`)
  console.log(`   - 100KB 이상 파일: ${largFiles.length}개`)
  
  if (largFiles.length > 0) {
    console.log(`   - 큰 파일 샘플:`)
    largFiles.slice(0, 5).forEach(f => {
      console.log(`     • ${f.name} (${Math.round(f.metadata.size / 1024)} KB)`)
    })
  }

  // 3. 결론
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 분석 결과:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (localFiles.length > 0 && largFiles.length === 0) {
    console.log('❌ FLUX 이미지가 Supabase Storage에 업로드되지 않았습니다!')
    console.log('   • 로컬에는 있지만 Storage에는 없음')
    console.log('   • Storage에는 Claude 생성 JPG만 있음 (평균 10-20KB)')
  } else if (largFiles.length > 0) {
    console.log('✅ FLUX 이미지가 일부 업로드되었습니다')
    console.log(`   • ${largFiles.length}개의 큰 파일 발견`)
  } else {
    console.log('⚠️  FLUX 이미지를 찾을 수 없습니다')
    console.log('   • 로컬과 Storage 모두에서 큰 파일 없음')
  }
}

analyzeFLUXImages()
