import { createClient } from '@supabase/supabase-js'
import { Database } from './src/lib/database.types'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testSupabaseConnection() {
  console.log('🔍 Supabase 연결 및 쿼리 테스트')

  try {
    // 1. 기본 연결 테스트
    console.log('1️⃣ 기본 연결 테스트')
    const { data, error } = await supabase
      .from('books')
      .select('id, name')
      .limit(5)

    if (error) {
      console.error('❌ books 테이블 조회 실패:', error)
      return
    }

    console.log('✅ books 테이블 조회 성공')
    console.log('조회된 책 목록:')
    data.forEach(book => {
      console.log(`  - ${book.id}: ${book.name}`)
    })

    // 2. 단어 테이블 테스트 - 직접 SQL 쿼리
    console.log('\n2️⃣ words 테이블 테스트 (직접 SQL)')
    const { data: wordsResult, error: queryError } = await supabase.rpc('raw_sql_query', {
      query: 'SELECT hebrew, meaning, flashcard_img_url FROM words LIMIT 5;'
    })

    if (queryError) {
      console.error('❌ words 테이블 직접 쿼리 실패:', queryError)
      return
    }

    console.log('✅ words 테이블 직접 쿼리 성공')
    console.log('조회된 단어 목록:')
    console.log(JSON.stringify(wordsResult, null, 2))

    // 3. 구절 테이블 테스트
    console.log('\n3️⃣ verses 테이블 테스트')
    const { data: versesQuery, error: versesError } = await supabase
      .rpc('raw_sql_query', {
        query: 'SELECT id, reference, book_id, chapter FROM verses WHERE book_id = \'genesis\' AND chapter = 1 LIMIT 5;'
      })

    if (versesError) {
      console.error('❌ verses 테이블 직접 쿼리 실패:', versesError)
      return
    }

    console.log('✅ verses 테이블 직접 쿼리 성공')
    console.log('조회된 구절 목록:')
    console.log(JSON.stringify(versesQuery, null, 2))

    console.log('\n🎉 모든 데이터베이스 연결 테스트 완료!')
  } catch (err) {
    console.error('❌ 예상치 못한 오류 발생:', err)
  }
}

testSupabaseConnection()