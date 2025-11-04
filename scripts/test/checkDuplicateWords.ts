#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const GENESIS_1_1_WORDS = [
  { filename: 'bereshit', hebrew: 'בְּרֵאשִׁית', korean: '베레쉬트' },
  { filename: 'bara', hebrew: 'בָּרָא', korean: '바라' },
  { filename: 'elohim', hebrew: 'אֱלֹהִים', korean: '엘로힘' },
  { filename: 'et', hebrew: 'אֵת', korean: '에트' },
  { filename: 'hashamayim', hebrew: 'הַשָּׁמַיִם', korean: '하샤마임' },
  { filename: 'veet', hebrew: 'וְאֵת', korean: '베에트' },
  { filename: 'haaretz', hebrew: 'הָאָרֶץ', korean: '하아레츠' }
]

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 중복 단어 검사')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  for (const word of GENESIS_1_1_WORDS) {
    const { data, error } = await supabase
      .from('words')
      .select('id, hebrew, korean, icon_url, verse_id')
      .eq('hebrew', word.hebrew)

    if (error) {
      console.log(`❌ ${word.hebrew} - Error: ${error.message}\n`)
      continue
    }

    console.log(`${word.hebrew} (${word.korean})`)
    console.log(`   Found: ${data?.length || 0} row(s)`)

    if (data && data.length > 0) {
      data.forEach((row, i) => {
        console.log(`   [${i + 1}] ID: ${row.id}, verse_id: ${row.verse_id}`)
        console.log(`       icon_url: ${row.icon_url ? '✅ ' + row.icon_url.substring(0, 60) + '...' : '❌ NULL'}`)
      })
    }
    console.log()
  }
}

main().catch(console.error)
