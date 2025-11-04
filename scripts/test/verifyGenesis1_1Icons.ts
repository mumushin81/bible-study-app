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
  console.log('🔍 창세기 1:1 아이콘 URL 검증')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  let successCount = 0

  for (const word of GENESIS_1_1_WORDS) {
    const { data, error } = await supabase
      .from('words')
      .select('hebrew, korean, icon_url')
      .eq('hebrew', word.hebrew)
      .single()

    if (error) {
      console.log(`❌ ${word.hebrew} (${word.korean})`)
      console.log(`   Error: ${error.message}\n`)
      continue
    }

    if (!data.icon_url) {
      console.log(`⚠️  ${word.hebrew} (${word.korean})`)
      console.log(`   No icon_url found\n`)
      continue
    }

    const expectedPath = `word_icons/${word.filename}.jpg`
    const hasCorrectPath = data.icon_url.includes(expectedPath)

    if (hasCorrectPath) {
      console.log(`✅ ${word.hebrew} (${word.korean})`)
      console.log(`   ${data.icon_url}\n`)
      successCount++
    } else {
      console.log(`⚠️  ${word.hebrew} (${word.korean})`)
      console.log(`   Expected: .../${expectedPath}`)
      console.log(`   Got: ${data.icon_url}\n`)
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 검증 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 올바른 icon_url: ${successCount}/${GENESIS_1_1_WORDS.length}`)

  if (successCount === GENESIS_1_1_WORDS.length) {
    console.log('\n🎉 모든 icon_url이 정상적으로 업데이트되었습니다!')
    console.log('\n다음 단계: 앱에서 실제 이미지 확인')
    console.log('  http://localhost:5174')
    console.log('  창세기 1:1 학습 페이지로 이동하여 이미지를 확인하세요.\n')
  } else {
    console.log('\n⚠️  일부 icon_url이 올바르지 않습니다.\n')
  }
}

main().catch(console.error)
