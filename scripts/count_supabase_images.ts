#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function countSupabaseImages() {
  try {
    const { data, error } = await supabase.storage
      .from('hebrew-icons')
      .list('icons', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      console.error('❌ 이미지 목록 조회 실패:', error)
      return
    }

    console.log(`🖼️ Supabase Storage에 저장된 이미지 개수: ${data.length}`)

    // 이미지 목록 출력 (디버깅용)
    data.forEach((file, index) => {
      console.log(`[${index + 1}] ${file.name}`)
    })
  } catch (err) {
    console.error('❌ 오류 발생:', err)
  }
}

countSupabaseImages().catch(console.error)