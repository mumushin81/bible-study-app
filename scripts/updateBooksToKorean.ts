/**
 * Books 테이블의 name을 한글로 업데이트
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { bibleBooks } from '../src/data/bibleBooks'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateBooksToKorean() {
  console.log('🔄 Books 테이블을 한글로 업데이트 중...\n')

  let successCount = 0
  let errorCount = 0
  let notFoundCount = 0

  for (const book of bibleBooks) {
    // DB에 해당 책이 있는지 확인
    const { data: existing, error: fetchError } = await supabase
      .from('books')
      .select('id, name')
      .eq('id', book.id)
      .single()

    if (fetchError || !existing) {
      console.log(`  ⚠️  ${book.id}: DB에 없음`)
      notFoundCount++
      continue
    }

    // 이미 한글이면 스킵
    if (existing.name === book.name) {
      console.log(`  ✓ ${book.id}: 이미 한글 (${book.name})`)
      continue
    }

    // 업데이트
    console.log(`  ${book.id}: "${existing.name}" → "${book.name}"`)

    const { error: updateError } = await supabase
      .from('books')
      .update({
        name: book.name,
        category: book.category,
        category_emoji: book.categoryEmoji
      })
      .eq('id', book.id)

    if (updateError) {
      console.log(`    ❌ 실패: ${updateError.message}`)
      errorCount++
    } else {
      console.log(`    ✅ 완료`)
      successCount++
    }
  }

  console.log(`\n📊 결과:`)
  console.log(`  성공: ${successCount}개`)
  console.log(`  실패: ${errorCount}개`)
  console.log(`  없음: ${notFoundCount}개`)

  // 업데이트 후 확인
  console.log('\n✅ 업데이트 후 확인...')
  const { data: allBooks, error } = await supabase
    .from('books')
    .select('id, name, english_name')
    .order('id', { ascending: true })
    .limit(10)

  if (error) {
    console.error('❌ 확인 실패:', error.message)
  } else if (allBooks) {
    console.log('\n처음 10권:')
    allBooks.forEach(b => {
      console.log(`  ${b.id}: ${b.name} (${b.english_name})`)
    })
  }
}

updateBooksToKorean().catch(console.error)
