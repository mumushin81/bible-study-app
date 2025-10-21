import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testNestedQuery() {
  console.log('\n🔍 중첩 쿼리 테스트\n')

  // 1. Commentaries만 포함 (1단계)
  console.log('1️⃣  Verses + Commentaries (1단계)...')
  const { data: data1, error: error1 } = await supabase
    .from('verses')
    .select(`
      id,
      hebrew,
      commentaries (id, intro)
    `)
    .eq('id', 'genesis_1_1')
    .single()

  if (error1) {
    console.error('❌ 실패:', error1)
  } else {
    console.log(`✅ 성공`)
    console.log(`   Commentaries: ${data1.commentaries?.length || 0}개`)
    if (data1.commentaries && data1.commentaries.length > 0) {
      console.log(`   Intro: ${data1.commentaries[0].intro?.substring(0, 50)}...`)
    }
  }

  // 2. Commentary sections 포함 (2단계)
  console.log('\n2️⃣  Verses + Commentaries + Sections (2단계)...')
  const { data: data2, error: error2 } = await supabase
    .from('verses')
    .select(`
      id,
      hebrew,
      commentaries (
        id,
        intro,
        commentary_sections (emoji, title, position)
      )
    `)
    .eq('id', 'genesis_1_1')
    .single()

  if (error2) {
    console.error('❌ 실패:', error2)
  } else {
    console.log(`✅ 성공`)
    console.log(`   Commentaries: ${data2.commentaries?.length || 0}개`)
    if (data2.commentaries && data2.commentaries.length > 0) {
      console.log(`   Sections: ${data2.commentaries[0].commentary_sections?.length || 0}개`)
    }
  }

  // 3. 전체 중첩 (모든 테이블)
  console.log('\n3️⃣  Verses + Commentaries + 모든 중첩 테이블...')
  const { data: data3, error: error3 } = await supabase
    .from('verses')
    .select(`
      id,
      hebrew,
      commentaries (
        id,
        intro,
        commentary_sections (emoji, title, description, points, color, position),
        why_questions (question, answer, bible_references),
        commentary_conclusions (title, content)
      )
    `)
    .eq('id', 'genesis_1_1')
    .single()

  if (error3) {
    console.error('❌ 실패:', error3)
    console.error('   에러 상세:', JSON.stringify(error3, null, 2))
  } else {
    console.log(`✅ 성공`)
    console.log(`   Commentaries: ${data3.commentaries?.length || 0}개`)
    if (data3.commentaries && data3.commentaries.length > 0) {
      const c = data3.commentaries[0]
      console.log(`   Sections: ${c.commentary_sections?.length || 0}개`)
      console.log(`   Questions: ${c.why_questions?.length || 0}개`)
      console.log(`   Conclusions: ${c.commentary_conclusions?.length || 0}개`)
    }
  }

  // 4. 여러 구절 가져오기 (Genesis 1:1-3)
  console.log('\n4️⃣  Genesis 1:1-3 전체 데이터...')
  const { data: data4, error: error4 } = await supabase
    .from('verses')
    .select(`
      *,
      words (hebrew, meaning, ipa, korean, root, grammar, structure, emoji, category, position),
      commentaries (
        id,
        intro,
        commentary_sections (emoji, title, description, points, color, position),
        why_questions (question, answer, bible_references),
        commentary_conclusions (title, content)
      )
    `)
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .lte('verse_number', 3)
    .order('verse_number', { ascending: true })

  if (error4) {
    console.error('❌ 실패:', error4)
    console.error('   에러 상세:', JSON.stringify(error4, null, 2))
  } else {
    console.log(`✅ 성공 - ${data4?.length}개 구절`)
    data4?.forEach((verse: any, idx: number) => {
      console.log(`\n   구절 ${idx + 1}: ${verse.id}`)
      console.log(`   - Words: ${verse.words?.length || 0}개`)
      console.log(`   - Commentaries: ${verse.commentaries?.length || 0}개`)
      if (verse.commentaries && verse.commentaries.length > 0) {
        const c = verse.commentaries[0]
        console.log(`     - Sections: ${c.commentary_sections?.length || 0}개`)
        console.log(`     - Questions: ${c.why_questions?.length || 0}개`)
        console.log(`     - Conclusions: ${c.commentary_conclusions?.length || 0}개`)
      }
    })
  }
}

testNestedQuery()
