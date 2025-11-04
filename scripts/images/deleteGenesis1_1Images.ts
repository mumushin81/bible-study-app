#!/usr/bin/env tsx

/**
 * 창세기 1:1 이미지 삭제
 * DB의 icon_url을 NULL로 설정
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function deleteGenesis1_1Images() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🗑️  창세기 1:1 이미지 삭제')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 창세기 1:1 verse 조회
  const { data: verse } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single()

  if (!verse) {
    console.error('❌ 창세기 1:1을 찾을 수 없습니다.')
    return
  }

  // 현재 이미지가 있는 단어 확인
  const { data: wordsWithImages } = await supabase
    .from('words')
    .select('id, hebrew, icon_url')
    .eq('verse_id', verse.id)
    .not('icon_url', 'is', null)

  console.log(`📊 현재 상태:`)
  console.log(`   이미지가 있는 단어: ${wordsWithImages?.length || 0}개\n`)

  if (!wordsWithImages || wordsWithImages.length === 0) {
    console.log('✅ 삭제할 이미지가 없습니다.')
    return
  }

  wordsWithImages.forEach((w, i) => {
    const imageType = w.icon_url.includes('.gif') ? 'GIF' : 'JPG'
    console.log(`   ${i + 1}. ${w.hebrew} (${imageType})`)
  })
  console.log()

  // DB에서 icon_url NULL로 설정
  console.log('🗑️  DB icon_url 삭제 중...\n')

  const { error } = await supabase
    .from('words')
    .update({ icon_url: null })
    .eq('verse_id', verse.id)

  if (error) {
    console.error(`❌ DB 업데이트 실패: ${error.message}`)
    return
  }

  console.log(`✅ ${wordsWithImages.length}개 단어의 icon_url을 NULL로 설정했습니다.\n`)

  // 최종 확인
  const { data: finalCheck } = await supabase
    .from('words')
    .select('id')
    .eq('verse_id', verse.id)
    .not('icon_url', 'is', null)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 최종 상태')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`   이미지가 있는 단어: ${finalCheck?.length || 0}개`)
  console.log('\n🎉 창세기 1:1 이미지 삭제 완료!')
}

deleteGenesis1_1Images().catch(console.error)
