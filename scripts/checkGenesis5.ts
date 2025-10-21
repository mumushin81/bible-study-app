import { createSupabaseClient } from './utils/supabase.js'

const supabase = createSupabaseClient()

async function checkGenesis5() {
  // Get verses with words count
  const { data, error } = await supabase
    .from('verses')
    .select(`
      id,
      reference,
      hebrew,
      ipa,
      modern,
      words (count)
    `)
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .order('verse_number')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`\n📊 창세기 5장 현황:`)
  console.log(`총 ${data?.length || 0}개 구절\n`)

  if (data && data.length > 0) {
    let withContent = 0
    let withoutContent = 0

    console.log('구절별 컨텐츠 상태:')
    data.forEach((verse: any) => {
      const hasHebrew = verse.hebrew && verse.hebrew.trim() !== ''
      const hasIpa = verse.ipa && verse.ipa.trim() !== ''
      const hasModern = verse.modern && verse.modern.trim() !== ''
      const wordCount = verse.words?.[0]?.count || 0

      const hasContent = hasIpa && hasModern && wordCount > 0

      if (hasContent) {
        withContent++
        console.log(`✅ ${verse.reference}: 컨텐츠 O (${wordCount} words, IPA ✓, modern ✓)`)
      } else {
        withoutContent++
        const missing = []
        if (!hasIpa) missing.push('IPA')
        if (!hasModern) missing.push('modern')
        if (wordCount === 0) missing.push('words')
        console.log(`❌ ${verse.reference}: 컨텐츠 X (누락: ${missing.join(', ')})`)
      }
    })

    console.log(`\n📈 요약:`)
    console.log(`✅ 컨텐츠 있음: ${withContent}개`)
    console.log(`❌ 컨텐츠 없음: ${withoutContent}개`)
    console.log(`📊 총 구절: ${data.length}개`)
  } else {
    console.log('❌ 창세기 5장 데이터가 데이터베이스에 없습니다.')
  }
}

checkGenesis5()
