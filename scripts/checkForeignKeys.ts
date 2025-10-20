import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkForeignKeys() {
  console.log('\n🔍 Foreign Key 관계 확인\n')

  // 1. Genesis 1:1 verse ID 확인
  const { data: verseData, error: verseError } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single()

  if (verseError) {
    console.error('❌ Verse 조회 실패:', verseError)
    return
  }

  console.log(`✅ Genesis 1:1 verse ID: ${verseData.id}`)

  // 2. 해당 verse_id로 commentary 직접 조회
  const { data: commentaryData, error: commentaryError } = await supabase
    .from('commentaries')
    .select('*')
    .eq('verse_id', verseData.id)

  if (commentaryError) {
    console.error('❌ Commentary 조회 실패:', commentaryError)
  } else {
    console.log(`\n📖 Commentary 직접 조회 결과: ${commentaryData?.length}개`)
    if (commentaryData && commentaryData.length > 0) {
      console.log(`   - ID: ${commentaryData[0].id}`)
      console.log(`   - Verse ID: ${commentaryData[0].verse_id}`)
      console.log(`   - Intro: ${commentaryData[0].intro?.substring(0, 50)}...`)
    }
  }

  // 3. 모든 commentaries의 verse_id 확인
  const { data: allCommentaries } = await supabase
    .from('commentaries')
    .select('id, verse_id')
    .limit(10)

  console.log('\n📋 샘플 Commentaries의 verse_id:')
  allCommentaries?.forEach((c: any) => {
    console.log(`   - Commentary ID: ${c.id}, Verse ID: ${c.verse_id}`)
  })

  // 4. Verses 테이블의 ID 형식 확인
  const { data: allVerses } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number')
    .limit(5)

  console.log('\n📋 샘플 Verses의 ID:')
  allVerses?.forEach((v: any) => {
    console.log(`   - ${v.id} (${v.book_id} ${v.chapter}:${v.verse_number})`)
  })

  // 5. Words 테이블도 확인 (비교용 - words는 잘 작동함)
  const { data: wordsData } = await supabase
    .from('verses')
    .select(`
      id,
      words (id, verse_id, hebrew)
    `)
    .eq('id', verseData.id)
    .single()

  if (wordsData) {
    console.log(`\n✅ Words JOIN 테스트: ${wordsData.words?.length || 0}개`)
    if (wordsData.words && wordsData.words.length > 0) {
      console.log(`   첫 번째 word의 verse_id: ${wordsData.words[0].verse_id}`)
    }
  }

  // 6. RLS 정책 확인을 위한 Service Role 키 사용 테스트
  console.log('\n🔐 RLS 정책 테스트...')

  const supabaseService = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
  )

  const { data: serviceData, error: serviceError } = await supabaseService
    .from('verses')
    .select(`
      id,
      commentaries (id, intro)
    `)
    .eq('id', verseData.id)
    .single()

  if (serviceError) {
    console.error('❌ Service Role 쿼리 실패:', serviceError)
  } else {
    console.log(`✅ Service Role 쿼리 성공`)
    console.log(`   Commentaries: ${serviceData.commentaries?.length || 0}개`)
  }
}

checkForeignKeys()
