#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  console.log('🔍 Verses 테이블 스키마 확인\n')

  // 첫 번째 verse 조회하여 컬럼 확인
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('id', 'genesis_1_1')
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('✅ Verse 데이터:')
  console.log(JSON.stringify(data, null, 2))
  console.log('\n컬럼 목록:')
  Object.keys(data || {}).forEach(key => {
    console.log(`  - ${key}`)
  })
}

main().catch(console.error)
