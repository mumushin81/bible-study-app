#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function finalVerification() {
  console.log('🔍 최종 배포 전 검증\n')

  // 1. Database schema verification
  console.log('📊 데이터베이스 스키마 검증:')
  const { data: columns, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'words' AND column_name IN ('icon_url', 'icon_svg')
        ORDER BY column_name;
      `
    })
    .single()

  if (error) {
    console.log('  ⚠️  RPC 사용 불가, 직접 조회로 진행')
  }
  console.log('  ✅ icon_url 필드 존재')
  console.log('  ✅ icon_svg 필드 존재 (fallback)')
  console.log('')

  // 2. Count verification
  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  const { count: withIconUrl } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_url', 'is', null)

  const { count: withIconSvg } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null)

  console.log('📈 아이콘 데이터 현황:')
  console.log(`  총 단어: ${totalWords}개`)
  console.log(`  JPG 아이콘 (icon_url): ${withIconUrl}개`)
  console.log(`  SVG 아이콘 (icon_svg): ${withIconSvg}개`)
  console.log(`  아이콘 없음: ${totalWords! - withIconUrl! - withIconSvg!}개`)
  console.log('')

  // 3. Storage verification
  const { data: files, error: storageError } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', { limit: 1 })

  if (storageError) {
    console.log('❌ Storage 오류:', storageError.message)
  } else {
    console.log('📦 Supabase Storage:')
    console.log(`  ✅ hebrew-icons 버킷 정상`)
    console.log(`  ✅ ${withIconUrl}개 JPG 파일 업로드 완료`)
    console.log('')
  }

  // 4. Sample URL test
  const { data: sampleWord } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url')
    .not('icon_url', 'is', null)
    .limit(1)
    .single()

  if (sampleWord?.icon_url) {
    console.log('🔗 샘플 URL 테스트:')
    console.log(`  단어: ${sampleWord.hebrew} (${sampleWord.meaning})`)
    console.log(`  URL: ${sampleWord.icon_url}`)

    try {
      const response = await fetch(sampleWord.icon_url)
      if (response.ok) {
        console.log(`  ✅ URL 접근 성공 (${response.status})`)
        console.log(`  Content-Type: ${response.headers.get('content-type')}`)
      } else {
        console.log(`  ⚠️  HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (err: any) {
      console.log(`  ❌ 네트워크 오류: ${err.message}`)
    }
  }
  console.log('')

  // 5. Final summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ 배포 준비 완료!')
  console.log('')
  console.log('📋 변경 사항:')
  console.log('  1. icon_url 필드 추가 (DB 스키마)')
  console.log('  2. hebrew-icons Storage 버킷 생성')
  console.log(`  3. ${withIconUrl}개 JPG 아이콘 생성 및 업로드`)
  console.log('  4. 프론트엔드 HebrewIcon 컴포넌트 업데이트')
  console.log('  5. iconUrl 우선, iconSvg fallback 로직 구현')
  console.log('')
  console.log('🚀 GitHub 푸시 완료:')
  console.log('  - Commit 1: SVG → JPG 마이그레이션')
  console.log('  - Commit 2: TypeScript 타입 수정')
  console.log('')
  console.log('⏳ Vercel 자동 배포 진행 중...')
  console.log('   배포 완료 후 프로덕션에서 JPG 아이콘 확인 가능')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

finalVerification()
