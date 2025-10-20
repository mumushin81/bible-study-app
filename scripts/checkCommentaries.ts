import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkCommentaries() {
  console.log('\n🔍 Commentaries 테이블 확인\n')

  // 1. 총 commentaries 개수
  const { count: commentariesCount, error: countError } = await supabase
    .from('commentaries')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Commentaries 카운트 실패:', countError)
  } else {
    console.log(`📊 총 commentaries: ${commentariesCount}개`)
  }

  // 2. 샘플 commentaries 조회
  const { data: sampleData, error: sampleError } = await supabase
    .from('commentaries')
    .select('*')
    .limit(3)

  if (sampleError) {
    console.error('❌ Commentaries 조회 실패:', sampleError)
  } else {
    console.log(`\n📖 샘플 commentaries (${sampleData?.length}개):`)
    sampleData?.forEach((c: any) => {
      console.log(`   - Verse ID: ${c.verse_id}`)
      console.log(`     Intro: ${c.intro?.substring(0, 50)}...`)
    })
  }

  // 3. Genesis 1:1에 대한 commentary 확인
  const { data: gen1Data, error: gen1Error } = await supabase
    .from('commentaries')
    .select('*')
    .eq('verse_id', 'genesis_1_1')
    .single()

  if (gen1Error) {
    console.error('\n❌ Genesis 1:1 commentary 조회 실패:', gen1Error)
  } else {
    console.log('\n✅ Genesis 1:1 commentary 발견!')
    console.log(`   Intro: ${gen1Data.intro}`)
  }

  // 4. Words 테이블 확인
  const { count: wordsCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 총 words: ${wordsCount}개`)

  // 5. Commentary sections 확인
  const { count: sectionsCount } = await supabase
    .from('commentary_sections')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 총 commentary_sections: ${sectionsCount}개`)

  // 6. Why questions 확인
  const { count: questionsCount } = await supabase
    .from('why_questions')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 총 why_questions: ${questionsCount}개`)

  // 7. Commentary conclusions 확인
  const { count: conclusionsCount } = await supabase
    .from('commentary_conclusions')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 총 commentary_conclusions: ${conclusionsCount}개`)
}

checkCommentaries()
