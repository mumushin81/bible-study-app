import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testQuery() {
  console.log('\n🔍 Supabase 쿼리 테스트\n')

  try {
    // 1. 기본 쿼리 (정렬 없이)
    console.log('1️⃣  기본 쿼리 테스트 (정렬 없이)...')
    const { data: basicData, error: basicError } = await supabase
      .from('verses')
      .select('*')
      .limit(3)

    if (basicError) {
      console.error('❌ 기본 쿼리 실패:', basicError)
    } else {
      console.log(`✅ ${basicData?.length}개 구절 로드 성공`)
    }

    // 2. 정렬 추가
    console.log('\n2️⃣  정렬 쿼리 테스트...')
    const { data: sortedData, error: sortedError } = await supabase
      .from('verses')
      .select('*')
      .order('chapter', { ascending: true })
      .order('verse_number', { ascending: true })
      .limit(3)

    if (sortedError) {
      console.error('❌ 정렬 쿼리 실패:', sortedError)
    } else {
      console.log(`✅ ${sortedData?.length}개 구절 로드 성공`)
    }

    // 3. 중첩 쿼리 (words 포함)
    console.log('\n3️⃣  중첩 쿼리 테스트 (words 포함)...')
    const { data: wordsData, error: wordsError } = await supabase
      .from('verses')
      .select(`
        *,
        words (*)
      `)
      .order('chapter', { ascending: true })
      .order('verse_number', { ascending: true })
      .limit(3)

    if (wordsError) {
      console.error('❌ Words 쿼리 실패:', wordsError)
    } else {
      console.log(`✅ ${wordsData?.length}개 구절 로드 성공`)
      console.log(`   첫 번째 구절 words 개수: ${wordsData?.[0]?.words?.length || 0}`)
    }

    // 4. 전체 중첩 쿼리 (commentaries 포함)
    console.log('\n4️⃣  전체 중첩 쿼리 테스트...')
    const { data: fullData, error: fullError } = await supabase
      .from('verses')
      .select(`
        *,
        words (*),
        commentaries (
          id,
          intro,
          commentary_sections (*),
          why_questions (*),
          commentary_conclusions (*)
        )
      `)
      .order('chapter', { ascending: true })
      .order('verse_number', { ascending: true })
      .limit(3)

    if (fullError) {
      console.error('❌ 전체 쿼리 실패:', fullError)
      console.error('   에러 상세:', JSON.stringify(fullError, null, 2))
    } else {
      console.log(`✅ ${fullData?.length}개 구절 로드 성공`)
      if (fullData && fullData.length > 0) {
        console.log(`   첫 번째 구절:`)
        console.log(`   - ID: ${fullData[0].id}`)
        console.log(`   - Hebrew: ${fullData[0].hebrew?.substring(0, 30)}...`)
        console.log(`   - Words: ${fullData[0].words?.length || 0}개`)
        console.log(`   - Commentaries: ${fullData[0].commentaries?.length || 0}개`)
      }
    }

    // 5. Genesis 1-3장만 필터링
    console.log('\n5️⃣  Genesis 1-3장 필터 테스트...')
    const { data: genesisData, error: genesisError } = await supabase
      .from('verses')
      .select('*')
      .eq('book_id', 'genesis')
      .lte('chapter', 3)
      .order('chapter', { ascending: true })
      .order('verse_number', { ascending: true })

    if (genesisError) {
      console.error('❌ Genesis 쿼리 실패:', genesisError)
    } else {
      console.log(`✅ ${genesisData?.length}개 구절 로드 성공`)
      console.log('   챕터별 개수:')
      const chapterCounts = genesisData?.reduce((acc: any, verse: any) => {
        acc[verse.chapter] = (acc[verse.chapter] || 0) + 1
        return acc
      }, {})
      console.log(`   ${JSON.stringify(chapterCounts)}`)
    }

  } catch (err) {
    console.error('\n💥 예외 발생:', err)
  }
}

testQuery()
