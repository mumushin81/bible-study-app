#!/usr/bin/env tsx

/**
 * 창세기 1:2~1:10 단어들의 FLUX 이미지 상태 확인
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

async function checkGenesis1_2to10() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 창세기 1:2~1:10 FLUX 이미지 상태 분석')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 로컬 FLUX 파일 목록
  const localFiles = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  const fluxMap = new Map<string, string>()

  localFiles.forEach(filename => {
    const hebrew = filename.replace('.jpg', '')
    const hash = createHash('md5').update(hebrew).digest('hex')
    fluxMap.set(hebrew, `word_${hash}.jpg`)
  })

  console.log(`🎨 로컬 FLUX 파일: ${localFiles.length}개\n`)

  // 창세기 1:2~1:10 단어 조회
  const verses = []
  for (let i = 2; i <= 10; i++) {
    verses.push(`genesis_1_${i}`)
  }

  const { data: words } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, meaning, icon_url')
    .in('verse_id', verses)
    .order('verse_id')
    .order('position')

  if (!words || words.length === 0) {
    console.log('❌ 단어 없음')
    return
  }

  console.log(`📝 총 ${words.length}개 단어\n`)

  // 절별로 그룹화
  const byVerse = new Map<string, any[]>()
  words.forEach(word => {
    if (!byVerse.has(word.verse_id)) {
      byVerse.set(word.verse_id, [])
    }
    byVerse.get(word.verse_id)!.push(word)
  })

  let totalHasIcon = 0
  let totalHasLocalFlux = 0
  let totalMissing = 0
  const missingWords: Array<{ verse: string; hebrew: string; meaning: string; normalized: string }> = []

  // 절별 분석
  byVerse.forEach((verseWords, verseId) => {
    const verseNum = verseId.split('_')[2]
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📖 창세기 1:${verseNum} (${verseWords.length}개 단어)`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    verseWords.forEach((word, i) => {
      const normalized = removeNikkud(word.hebrew).trim()
      const hasFluxLocal = fluxMap.has(normalized)

      console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`)

      if (word.icon_url) {
        const filename = word.icon_url.split('/').pop()
        console.log(`   ✅ DB: ${filename}`)
        totalHasIcon++
      } else {
        console.log(`   ❌ DB: NULL`)

        if (hasFluxLocal) {
          console.log(`   🎨 로컬 FLUX 있음: ${fluxMap.get(normalized)}`)
          console.log(`   ⚠️  업로드 필요!`)
          totalHasLocalFlux++
          missingWords.push({
            verse: verseId,
            hebrew: normalized,
            meaning: word.meaning,
            normalized
          })
        } else {
          console.log(`   ⚠️  로컬 FLUX 없음 (생성 필요)`)
          totalMissing++
        }
      }

      console.log(`   🔑 정규화: ${normalized}`)
      console.log('')
    })
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 요약')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ DB에 icon_url 있음: ${totalHasIcon}/${words.length}`)
  console.log(`🎨 로컬 FLUX 있음 (업로드 필요): ${totalHasLocalFlux}`)
  console.log(`❌ FLUX 파일 없음 (생성 필요): ${totalMissing}`)

  if (missingWords.length > 0) {
    console.log(`\n⚠️  업로드가 필요한 ${missingWords.length}개 단어:`)
    missingWords.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w.hebrew} (${w.meaning}) - ${w.verse}`)
    })
  }
}

checkGenesis1_2to10().catch(console.error)
