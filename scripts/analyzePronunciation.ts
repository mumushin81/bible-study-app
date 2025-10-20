import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function analyzePronunciation() {
  console.log('\n🔊 한글 발음 데이터 분석\n')

  // 1. Genesis 1:1-5 샘플 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id, hebrew, ipa, korean_pronunciation')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .lte('verse_number', 5)
    .order('verse_number', { ascending: true })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 구절별 발음 비교 (Genesis 1:1-5)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  verses?.forEach((v: any, idx: number) => {
    console.log(`${idx + 1}. ${v.id}`)
    console.log(`   히브리어: ${v.hebrew?.substring(0, 50)}...`)
    console.log(`   IPA:     ${v.ipa?.substring(0, 80)}`)
    console.log(`   한글:     ${v.korean_pronunciation?.substring(0, 80)}`)
    console.log('')
  })

  // 2. Words 테이블 샘플 조회
  const { data: words } = await supabase
    .from('words')
    .select('hebrew, ipa, korean, meaning')
    .eq('verse_id', 'genesis_1_1')
    .order('position', { ascending: true })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📚 개별 단어 발음 분석 (Genesis 1:1)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  words?.forEach((w: any, idx: number) => {
    console.log(`${idx + 1}. ${w.hebrew}`)
    console.log(`   IPA:  ${w.ipa}`)
    console.log(`   한글: ${w.korean}`)
    console.log(`   뜻:   ${w.meaning}`)
    console.log('')
  })

  // 3. 문제 패턴 분석
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  한글 표기의 문제점')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const issues = [
    {
      sound: 'ʔ (성문 파열음)',
      ipa: 'ʔɛloˈhim',
      current: '엘로힘',
      issue: 'ʔ (알레프) 소리가 누락',
      example: 'אֱלֹהִים (엘로힘)'
    },
    {
      sound: 'ʕ (유성 인두 마찰음)',
      ipa: 'ʕal',
      current: '알',
      issue: 'ʕ (아인) 소리를 ㅇ으로 표기하여 구분 불가',
      example: 'עַל (알)'
    },
    {
      sound: 'ħ (무성 인두 마찰음)',
      ipa: 'ħɔˈʃɛχ',
      current: '호쉐흐',
      issue: 'ħ (헤트) 소리를 ㅎ으로 표기',
      example: 'חֹשֶׁךְ (호쉐흐)'
    },
    {
      sound: 'χ (무성 연구개 마찰음)',
      ipa: 'məraˈχɛfɛt',
      current: '므라헤페트',
      issue: 'χ (카프 약음) 소리를 ㅎ으로 표기',
      example: 'מְרַחֶפֶת (므라헤페트)'
    },
    {
      sound: 'ə (슈와)',
      ipa: 'bəreʃit',
      current: '베레쉬트',
      issue: 'ə를 ㅡ 대신 ㅔ로 표기 (부정확)',
      example: 'בְּרֵאשִׁית (브레쉬트가 더 정확)'
    }
  ]

  issues.forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.sound}`)
    console.log(`   IPA:      ${issue.ipa}`)
    console.log(`   현재 한글: ${issue.current}`)
    console.log(`   문제:      ${issue.issue}`)
    console.log(`   예시:      ${issue.example}`)
    console.log('')
  })

  // 4. 통계
  const allWords = await supabase
    .from('words')
    .select('ipa, korean')
    .eq('verse_id', 'genesis_1_1')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 발음 데이터 통계')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const stats = {
    total: allWords.data?.length || 0,
    hasGlottalStop: allWords.data?.filter((w: any) => w.ipa?.includes('ʔ')).length || 0,
    hasPharyngeal: allWords.data?.filter((w: any) => w.ipa?.includes('ʕ') || w.ipa?.includes('ħ')).length || 0,
    hasVelar: allWords.data?.filter((w: any) => w.ipa?.includes('χ')).length || 0,
    hasSchwa: allWords.data?.filter((w: any) => w.ipa?.includes('ə')).length || 0,
  }

  console.log(`총 단어 수:              ${stats.total}개`)
  console.log(`ʔ (성문파열음) 포함:      ${stats.hasGlottalStop}개 (${(stats.hasGlottalStop/stats.total*100).toFixed(1)}%)`)
  console.log(`ʕ/ħ (인두마찰음) 포함:    ${stats.hasPharyngeal}개 (${(stats.hasPharyngeal/stats.total*100).toFixed(1)}%)`)
  console.log(`χ (연구개마찰음) 포함:    ${stats.hasVelar}개 (${(stats.hasVelar/stats.total*100).toFixed(1)}%)`)
  console.log(`ə (슈와) 포함:           ${stats.hasSchwa}개 (${(stats.hasSchwa/stats.total*100).toFixed(1)}%)`)
  console.log('')
}

analyzePronunciation()
