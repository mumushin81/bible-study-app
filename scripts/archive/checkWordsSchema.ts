/**
 * Words 테이블 스키마 확인
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWordsSchema() {
  console.log('📋 Words 테이블 스키마 확인 중...\n')

  // 샘플 단어 하나 가져오기
  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  if (!words || words.length === 0) {
    console.log('⚠️  단어가 없습니다.')
    return
  }

  const word = words[0]
  console.log('샘플 단어:')
  console.log(JSON.stringify(word, null, 2))

  console.log('\n사용 가능한 필드:')
  Object.keys(word).forEach(key => {
    console.log(`  - ${key}: ${typeof word[key]}`)
  })

  // related_words 필드 확인
  if ('related_words' in word) {
    console.log('\n✅ related_words 필드 존재')
    console.log(`   타입: ${typeof word.related_words}`)
    console.log(`   값: ${JSON.stringify(word.related_words)}`)
  } else {
    console.log('\n❌ related_words 필드 없음')
  }
}

checkWordsSchema().catch(console.error)
