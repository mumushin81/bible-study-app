import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testExplicitRelation() {
  console.log('\n🔍 명시적 관계 지정 테스트\n')

  // 1. 기본 관계 (자동 감지)
  console.log('1️⃣  자동 관계 감지...')
  const { data: auto, error: autoError } = await supabase
    .from('verses')
    .select('id, commentaries(*)')
    .eq('id', 'genesis_1_1')
    .single()

  console.log(`   자동: ${auto?.commentaries?.length || 0}개`)
  if (autoError) console.error('   에러:', autoError)

  // 2. 명시적 관계 - verse_id
  console.log('\n2️⃣  명시적 관계 (verse_id)...')
  const { data: explicit1, error: error1 } = await supabase
    .from('verses')
    .select('id, commentaries!verse_id(*)')
    .eq('id', 'genesis_1_1')
    .single()

  console.log(`   verse_id: ${explicit1?.commentaries?.length || 0}개`)
  if (error1) console.error('   에러:', error1)

  // 3. 명시적 관계 - commentaries_verse_id_fkey
  console.log('\n3️⃣  명시적 관계 (fkey 이름)...')
  const { data: explicit2, error: error2 } = await supabase
    .from('verses')
    .select('id, commentaries!commentaries_verse_id_fkey(*)')
    .eq('id', 'genesis_1_1')
    .single()

  console.log(`   fkey: ${explicit2?.commentaries?.length || 0}개`)
  if (error2) console.error('   에러:', error2)

  // 4. Words 관계 확인 (비교용)
  console.log('\n4️⃣  Words 관계 (자동)...')
  const { data: wordsAuto, error: wordsError } = await supabase
    .from('verses')
    .select('id, words(*)')
    .eq('id', 'genesis_1_1')
    .single()

  console.log(`   자동: ${wordsAuto?.words?.length || 0}개`)

  // 5. Words 명시적 관계
  console.log('\n5️⃣  Words 명시적 관계...')
  const { data: wordsExplicit, error: wordsExplicitError } = await supabase
    .from('verses')
    .select('id, words!verse_id(*)')
    .eq('id', 'genesis_1_1')
    .single()

  console.log(`   verse_id: ${wordsExplicit?.words?.length || 0}개`)
  if (wordsExplicitError) console.error('   에러:', wordsExplicitError)

  // 6. 역방향 조회 시도
  console.log('\n6️⃣  역방향 조회 (commentaries → verses)...')
  const { data: reverse, error: reverseError } = await supabase
    .from('commentaries')
    .select(`
      id,
      intro,
      verses!inner(id, hebrew)
    `)
    .eq('verse_id', 'genesis_1_1')
    .single()

  console.log(`   역방향 조회 성공: ${reverse ? '✅' : '❌'}`)
  if (reverse) {
    console.log(`   Verse ID: ${reverse.verses?.id}`)
  }
  if (reverseError) console.error('   에러:', reverseError)

  // 7. 가능한 모든 FK 이름 시도
  console.log('\n7️⃣  가능한 FK 이름 시도...')
  const possibleNames = [
    'commentaries!verse_id',
    'commentaries!fk_verse_id',
    'commentaries!verses_commentaries_fkey',
    'commentaries!public_commentaries_verse_id_fkey',
  ]

  for (const name of possibleNames) {
    try {
      const { data, error } = await supabase
        .from('verses')
        .select(`id, ${name}(*)`)
        .eq('id', 'genesis_1_1')
        .single()

      if (!error && data) {
        console.log(`   ✅ ${name}: ${(data as any).commentaries?.length || 0}개`)
      } else {
        console.log(`   ❌ ${name}: ${error?.message}`)
      }
    } catch (e: any) {
      console.log(`   ❌ ${name}: ${e.message}`)
    }
  }
}

testExplicitRelation()
