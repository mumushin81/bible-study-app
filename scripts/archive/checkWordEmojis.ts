/**
 * Words 테이블의 emoji 필드 확인
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWordEmojis() {
  console.log('📊 단어별 이모지 확인 중...\n')

  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning, emoji')
    .order('position', { ascending: true })
    .limit(20)

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  if (!words || words.length === 0) {
    console.log('⚠️  단어가 없습니다.')
    return
  }

  console.log('처음 20개 단어의 이모지:')
  words.forEach((word, i) => {
    console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`)
    console.log(`   emoji 필드: ${word.emoji || '없음'}`)
  })
}

checkWordEmojis().catch(console.error)
