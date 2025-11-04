#!/usr/bin/env tsx

/**
 * FLUX 형식이 아닌 icon_url을 NULL로 정리
 * - word_{32-char-md5}.jpg 형식만 유지
 * - UUID 기반 파일명은 제거
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * FLUX 이미지 형식 검증
 */
function isValidFluxUrl(url: string): boolean {
  if (!url) return false
  // Supabase Storage URL 패턴: word_{32-char-md5-hash}.jpg
  const fluxPattern = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/icons\/word_[a-f0-9]{32}\.jpg$/
  return fluxPattern.test(url)
}

async function cleanupNonFluxUrls() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 FLUX 형식이 아닌 icon_url 정리')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. icon_url이 있는 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, verse_id, icon_url')
    .not('icon_url', 'is', null)

  if (error) {
    console.error('❌ DB 조회 실패:', error.message)
    return
  }

  console.log(`📊 icon_url이 있는 단어: ${words!.length}개\n`)

  // 2. FLUX 형식 검증
  const validFlux: string[] = []
  const invalidUrls: Array<{ id: string; hebrew: string; meaning: string; url: string }> = []

  words!.forEach(word => {
    if (isValidFluxUrl(word.icon_url!)) {
      validFlux.push(word.id)
    } else {
      invalidUrls.push({
        id: word.id,
        hebrew: word.hebrew,
        meaning: word.meaning,
        url: word.icon_url!
      })
    }
  })

  console.log(`✅ 유효한 FLUX URL: ${validFlux.length}개`)
  console.log(`❌ 무효한 URL (정리 대상): ${invalidUrls.length}개\n`)

  if (invalidUrls.length > 0) {
    console.log('⚠️  정리할 URL 샘플 (처음 10개):')
    invalidUrls.slice(0, 10).forEach((w, i) => {
      const filename = w.url.split('/').pop()
      console.log(`  ${i + 1}. ${w.hebrew} (${w.meaning})`)
      console.log(`     파일: ${filename}`)
    })
    console.log('')
  }

  // 3. NULL 처리
  if (invalidUrls.length > 0) {
    console.log('🧹 icon_url NULL 처리 시작...\n')

    const BATCH_SIZE = 100
    let updated = 0
    let failed = 0

    for (let i = 0; i < invalidUrls.length; i += BATCH_SIZE) {
      const batch = invalidUrls.slice(i, i + BATCH_SIZE).map(w => w.id)

      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: null })
        .in('id', batch)

      if (updateError) {
        console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 실패:`, updateError.message)
        failed += batch.length
      } else {
        updated += batch.length
        console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}개 처리 (${updated}/${invalidUrls.length})`)
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
  console.log(`✅ 유효한 FLUX icon_url: ${validFlux.length}개`)
  console.log(`🧹 정리된 무효한 URL: ${invalidUrls.length}개`)
  console.log(`\n🎉 정리 완료!`)
  console.log(`\n💡 이제 uploadFluxImagesV2.ts를 실행하세요.`)
}

cleanupNonFluxUrls().catch(console.error)
