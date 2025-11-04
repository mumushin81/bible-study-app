#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function clearGenesis1_1Images() {
  console.log('🗑️  창세기 1:1 기존 이미지 제거 중...\n')

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

  // 기존 icon_url 제거
  const { error } = await supabase
    .from('words')
    .update({ icon_url: null })
    .eq('verse_id', verse.id)

  if (error) {
    console.error('❌ 오류:', error)
    return
  }

  // 확인
  const { data: words } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url')
    .eq('verse_id', verse.id)
    .order('position')

  console.log('✅ 기존 이미지 제거 완료!\n')
  console.log('📋 단어 목록:')
  words?.forEach((w, i) => {
    console.log(`   ${i + 1}. ${w.hebrew} - ${w.meaning} | icon_url: ${w.icon_url}`)
  })
  console.log()
}

clearGenesis1_1Images().catch(console.error)
