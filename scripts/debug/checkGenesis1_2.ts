#!/usr/bin/env tsx

/**
 * 창세기 1장 2절 단어들의 icon_url 상태 확인
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LOCAL_DIR = join(process.cwd(), 'public', 'images', 'words')

// 니쿠드 제거
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '')
}

async function checkGenesis1_2() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 창세기 1장 2절 단어 분석')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 창세기 1장 2절의 verse_id 찾기
  const { data: verses } = await supabase
    .from('verses')
    .select('id, chapter, verse, text')
    .eq('book', 'genesis')
    .eq('chapter', 1)
    .eq('verse', 2)
    .single()

  if (!verses) {
    console.log('❌ 창세기 1:2 찾을 수 없음')
    return
  }

  console.log(`📖 창세기 1:2 - "${verses.text}"\n`)

  // 해당 절의 단어들 조회
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url, verse_id')
    .eq('verse_id', verses.id)
    .order('position')

  if (!words || words.length === 0) {
    console.log('❌ 단어 없음')
    return
  }

  console.log(`📝 총 ${words.length}개 단어\n`)

  // 로컬 FLUX 파일 목록
  const localFiles = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  const fluxMap = new Map<string, string>()

  localFiles.forEach(filename => {
    const hebrew = filename.replace('.jpg', '')
    const hash = createHash('md5').update(hebrew).digest('hex')
    fluxMap.set(hebrew, `word_${hash}.jpg`)
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 단어별 상태')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  let hasIcon = 0
  let hasLocalFlux = 0
  let missing = 0

  words.forEach((word, i) => {
    const normalized = removeNikkud(word.hebrew).trim()
    const hasFluxLocal = fluxMap.has(normalized)

    console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`)

    if (word.icon_url) {
      const filename = word.icon_url.split('/').pop()
      console.log(`   ✅ DB icon_url: ${filename}`)
      hasIcon++
    } else {
      console.log(`   ❌ DB icon_url: NULL`)
    }

    if (hasFluxLocal) {
      console.log(`   🎨 로컬 FLUX: ${fluxMap.get(normalized)}`)
      hasLocalFlux++
    } else {
      console.log(`   ⚠️  로컬 FLUX: 없음`)
      missing++
    }

    console.log(`   🔑 정규화: ${normalized}`)
    console.log('')
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 요약')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ DB에 icon_url 있음: ${hasIcon}/${words.length}`)
  console.log(`🎨 로컬 FLUX 파일 있음: ${hasLocalFlux}/${words.length}`)
  console.log(`❌ FLUX 파일 없음: ${missing}/${words.length}`)
}

checkGenesis1_2().catch(console.error)
