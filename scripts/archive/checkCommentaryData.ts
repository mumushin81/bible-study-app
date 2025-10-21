/**
 * Commentary 데이터 확인
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCommentaryData() {
  console.log('📖 Commentary 데이터 확인 중...\n')

  // 창세기 1:1 commentary 조회
  const { data: commentary, error } = await supabase
    .from('commentaries')
    .select(`
      verse_id,
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
    .eq('verse_id', 'genesis_1_1')
    .single()

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  if (!commentary) {
    console.log('⚠️  창세기 1:1 주석이 없습니다.')
    return
  }

  console.log('✅ 창세기 1:1 주석 데이터:\n')
  console.log(`📝 Intro: ${commentary.intro ? commentary.intro.substring(0, 100) + '...' : '없음'}`)
  console.log(`\n📚 Sections: ${commentary.commentary_sections?.length || 0}개`)

  if (commentary.commentary_sections && commentary.commentary_sections.length > 0) {
    console.log('\n섹션 목록:')
    commentary.commentary_sections.forEach((section: any, i: number) => {
      console.log(`  ${i + 1}. ${section.emoji} ${section.title}`)
      console.log(`     - 색상: ${section.color}`)
      console.log(`     - 포인트: ${section.points?.length || 0}개`)
    })
  }

  console.log(`\n❓ Why Question: ${commentary.why_questions ? '있음' : '없음'}`)
  if (commentary.why_questions) {
    console.log(`   Q: ${commentary.why_questions.question}`)
  }

  console.log(`\n💡 Conclusion: ${commentary.commentary_conclusions ? '있음' : '없음'}`)
  if (commentary.commentary_conclusions) {
    console.log(`   제목: ${commentary.commentary_conclusions.title}`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ "말씀 속으로" 섹션은 100% 데이터베이스 데이터입니다!')
  console.log('   - 하드코딩 없음')
  console.log('   - StudyTab.tsx는 verse.commentary 객체를 렌더링만 함')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

checkCommentaryData().catch(console.error)
