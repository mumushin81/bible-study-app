import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGenesis3() {
  console.log('🔍 창세기 3장 완성도 검증\n')

  // 구절 정보 조회
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('id, verse_number, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 3)
    .order('verse_number')

  if (versesError) {
    console.error('❌ 구절 조회 실패:', versesError)
    return
  }

  console.log(`📊 총 구절 수: ${verses.length}개\n`)

  // 완성된 구절 vs 빈 구절
  const completed = verses.filter(v => v.ipa && v.korean_pronunciation && v.modern)
  const empty = verses.filter(v => !v.ipa || !v.korean_pronunciation || !v.modern)

  console.log(`✅ 완성된 구절: ${completed.length}개`)
  console.log(`⚠️  빈 구절: ${empty.length}개\n`)

  if (empty.length > 0) {
    console.log('빈 구절 목록:')
    empty.forEach(v => {
      console.log(`  - ${v.id} (${v.verse_number}절)`)
    })
    console.log()
  }

  // 단어 수 조회
  const { count: wordCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .like('verse_id', 'genesis_3_%')

  console.log(`📝 총 단어 수: ${wordCount}개`)

  // 주석 수 조회
  const { count: commentaryCount } = await supabase
    .from('commentaries')
    .select('*', { count: 'exact', head: true })
    .like('verse_id', 'genesis_3_%')

  console.log(`💬 총 주석 수: ${commentaryCount}개\n`)

  // 완성도 계산
  const totalVerses = 24 // 창세기 3장 총 구절 수
  const completionRate = (completed.length / totalVerses * 100).toFixed(1)

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📈 창세기 3장 완성도: ${completionRate}% (${completed.length}/${totalVerses})`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (completed.length === totalVerses) {
    console.log('🎉 창세기 3장 100% 완성!')
  }
}

checkGenesis3()
