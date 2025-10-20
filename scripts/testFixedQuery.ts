import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testFixedQuery() {
  console.log('\n🔍 수정된 쿼리 방식 테스트\n')

  // 1️⃣ Verses + Words 가져오기
  console.log('1️⃣  Verses + Words 조회...')
  const { data: versesData, error: versesError } = await supabase
    .from('verses')
    .select(`
      *,
      words (
        hebrew,
        meaning,
        ipa,
        korean,
        root,
        grammar,
        structure,
        emoji,
        category,
        position
      )
    `)
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .lte('verse_number', 3)
    .order('verse_number', { ascending: true })

  if (versesError) {
    console.error('❌ 실패:', versesError)
    return
  }

  console.log(`✅ ${versesData.length}개 구절 로드`)
  versesData.forEach((v: any) => {
    console.log(`   - ${v.id}: ${v.words?.length || 0}개 words`)
  })

  // 2️⃣ Verse IDs 추출
  const verseIds = versesData.map((v: any) => v.id)
  console.log(`\n2️⃣  추출된 Verse IDs: ${verseIds.join(', ')}`)

  // 3️⃣ Commentaries 별도 조회
  console.log('\n3️⃣  Commentaries 별도 조회...')
  const { data: commentariesData, error: commentariesError } = await supabase
    .from('commentaries')
    .select(`
      verse_id,
      id,
      intro,
      commentary_sections (
        emoji,
        title,
        description,
        points,
        color,
        position
      ),
      why_questions (
        question,
        answer,
        bible_references
      ),
      commentary_conclusions (
        title,
        content
      )
    `)
    .in('verse_id', verseIds)

  if (commentariesError) {
    console.error('❌ 실패:', commentariesError)
  } else {
    console.log(`✅ ${commentariesData?.length || 0}개 commentaries 로드`)
    commentariesData?.forEach((c: any) => {
      console.log(`   - ${c.verse_id}:`)
      console.log(`     Intro: ${c.intro?.substring(0, 40)}...`)
      console.log(`     Sections: ${c.commentary_sections?.length || 0}개`)
      console.log(`     Questions: ${c.why_questions?.length || 0}개`)
      console.log(`     Conclusions: ${c.commentary_conclusions?.length || 0}개`)
    })
  }

  // 4️⃣ 데이터 병합 테스트
  console.log('\n4️⃣  데이터 병합...')
  const commentariesMap = new Map()
  commentariesData?.forEach((c: any) => {
    commentariesMap.set(c.verse_id, c)
  })

  const mergedData = versesData.map((verse: any) => {
    const commentary = commentariesMap.get(verse.id)
    return {
      id: verse.id,
      hebrew: verse.hebrew?.substring(0, 30) + '...',
      words_count: verse.words?.length || 0,
      has_commentary: !!commentary,
      commentary_sections: commentary?.commentary_sections?.length || 0,
    }
  })

  console.log('✅ 병합 완료:')
  mergedData.forEach((m: any) => {
    console.log(`   ${m.id}: words=${m.words_count}, commentary=${m.has_commentary ? '✅' : '❌'}, sections=${m.commentary_sections}`)
  })

  console.log('\n🎉 수정된 방식으로 모든 데이터 정상 로드!')
}

testFixedQuery()
