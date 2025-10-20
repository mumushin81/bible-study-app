import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWords() {
  console.log('🔍 단어장(words) 테이블 구조 및 데이터 확인\n')

  // 샘플 단어 데이터 조회 (창세기 3:1에서 몇 개만)
  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', 'genesis_3_1')
    .limit(3)

  if (error) {
    console.error('❌ 조회 실패:', error)
    return
  }

  console.log('📋 words 테이블 필드 구조:\n')
  if (words && words.length > 0) {
    const fields = Object.keys(words[0])
    fields.forEach(field => {
      const value = words[0][field]
      const type = typeof value
      console.log(`  ${field}: ${type}`)
    })
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📖 샘플 데이터 (창세기 3:1에서 3개 단어):\n')

  words?.forEach((word, index) => {
    console.log(`\n[${index + 1}] ${word.hebrew}`)
    console.log(`  ID: ${word.id}`)
    console.log(`  Verse ID: ${word.verse_id}`)
    console.log(`  의미: ${word.meaning}`)
    console.log(`  IPA: ${word.ipa}`)
    console.log(`  한글 발음: ${word.korean}`)
    console.log(`  어근: ${word.root}`)
    console.log(`  문법: ${word.grammar}`)
    console.log(`  이모지: ${word.emoji}`)
    console.log(`  순서: ${word.order_number}`)
    if (word.structure) {
      console.log(`  구조: ${word.structure}`)
    }
  })

  // 전체 단어 수 조회
  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`📊 전체 통계`)
  console.log(`  총 단어 수: ${totalWords}개`)

  // 창별 단어 수
  const chapters = [1, 2, 3]
  for (const chapter of chapters) {
    const { count } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .like('verse_id', `genesis_${chapter}_%`)

    console.log(`  창세기 ${chapter}장: ${count}개`)
  }

  // word_relations 테이블 확인
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('🔗 word_relations 테이블 (관련 단어 연결)\n')

  const { data: relations, error: relError } = await supabase
    .from('word_relations')
    .select('*')
    .limit(5)

  if (relations && relations.length > 0) {
    console.log('샘플 데이터:')
    relations.forEach((rel, index) => {
      console.log(`  [${index + 1}] ${rel.word_id} → ${rel.related_word}`)
    })

    const { count: relCount } = await supabase
      .from('word_relations')
      .select('*', { count: 'exact', head: true })

    console.log(`\n  총 관계 수: ${relCount}개`)
  } else {
    console.log('  (데이터 없음)')
  }
}

checkWords()
