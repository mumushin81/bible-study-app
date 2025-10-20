import { createSupabaseClient } from '../utils/supabase'

async function main() {
  const supabase = createSupabaseClient()

  // 방법 1: count()
  const { count, error: countError } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', 'genesis')

  console.log(`방법 1 (count): ${count}개`)

  // 방법 2: select() + length
  const { data, error } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')

  console.log(`방법 2 (select): ${data?.length || 0}개`)

  // 방법 3: 장별 카운트 합산
  let total = 0
  for (let ch = 1; ch <= 50; ch++) {
    const { data: verses } = await supabase
      .from('verses')
      .select('id')
      .eq('book_id', 'genesis')
      .eq('chapter', ch)
    
    if (verses && verses.length > 0) {
      total += verses.length
      console.log(`  ${ch}장: ${verses.length}개`)
    }
  }
  console.log(`방법 3 (장별 합산): ${total}개`)
}

main()
