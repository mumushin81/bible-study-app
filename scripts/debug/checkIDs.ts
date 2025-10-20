import { createSupabaseClient } from '../utils/supabase'

async function main() {
  const supabase = createSupabaseClient()

  const { data } = await supabase
    .from('verses')
    .select('id, chapter, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('id')
    .limit(40)

  console.log('\n창세기 1장 ID 샘플 (40개):')
  data?.forEach(v => {
    console.log(`  ${v.id} (${v.chapter}:${v.verse_number})`)
  })
}

main()
