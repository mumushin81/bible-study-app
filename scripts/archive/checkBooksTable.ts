/**
 * Books 테이블 확인
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBooksTable() {
  console.log('📚 Books 테이블 확인 중...\n')

  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  if (!books || books.length === 0) {
    console.log('⚠️  책 정보가 없습니다.')
    return
  }

  console.log(`총 ${books.length}권 발견\n`)

  // Genesis/창세기 확인
  const genesis = books.find(b => b.id === 'genesis')
  if (genesis) {
    console.log('창세기 정보:')
    console.log(`  id: ${genesis.id}`)
    console.log(`  name: ${genesis.name}`)
    console.log(`  english_name: ${genesis.english_name}`)
    console.log(`  testament: ${genesis.testament}`)
    console.log(`  category: ${genesis.category}`)
    console.log()
  }

  // 영어 이름이 name 필드에 있는 책들 찾기
  const englishNameBooks = books.filter(b => {
    // 영어 알파벳만 있는지 확인
    return /^[A-Za-z0-9\s]+$/.test(b.name)
  })

  if (englishNameBooks.length > 0) {
    console.log(`⚠️  name 필드가 영어로 된 책: ${englishNameBooks.length}권`)
    console.log('\n처음 10개:')
    englishNameBooks.slice(0, 10).forEach(b => {
      console.log(`  - ${b.id}: name="${b.name}", english_name="${b.english_name}"`)
    })
  } else {
    console.log('✅ 모든 책의 name 필드가 한글입니다.')
  }
}

checkBooksTable().catch(console.error)
