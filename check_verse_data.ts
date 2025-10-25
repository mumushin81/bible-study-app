#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkVerseData() {
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, hebrew, modern, literal, translation')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .lte('verse_number', 3)

  console.log('📊 창세기 1:1-3 샘플 데이터:\n')

  verses?.forEach(v => {
    console.log(`${v.reference}:`)
    console.log(`  hebrew: ${v.hebrew?.substring(0, 50)}...`)
    console.log(`  modern: ${v.modern?.substring(0, 50)}...`)
    console.log(`  literal: ${v.literal ? v.literal.substring(0, 50) + '...' : '❌ null'}`)
    console.log(`  translation: ${v.translation ? v.translation.substring(0, 50) + '...' : '❌ null'}`)
    console.log('')
  })
}

checkVerseData()
