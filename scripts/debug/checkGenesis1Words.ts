#!/usr/bin/env tsx

/**
 * 창세기 1장의 모든 단어 확인 (절별)
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

async function checkGenesis1Words() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 창세기 1장 단어 분석')
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

  // words 테이블 구조 확인을 위해 먼저 몇 개 가져오기
  const { data: sampleWords } = await supabase
    .from('words')
    .select('*')
    .limit(3)

  console.log('📋 Words 테이블 샘플:')
  console.log(JSON.stringify(sampleWords, null, 2))
  console.log('')

  // 창세기 1장 데이터가 있는지 확인
  const { data: allWords } = await supabase
    .from('words')
    .select('id, hebrew, meaning, verse_id, icon_url')
    .limit(100)

  console.log(`\n📊 전체 단어 샘플 (100개):`)

  // verse_id별로 그룹화
  const byVerse = new Map<string, any[]>()
  allWords?.forEach(word => {
    const verseId = word.verse_id || 'NULL'
    if (!byVerse.has(verseId)) {
      byVerse.set(verseId, [])
    }
    byVerse.get(verseId)!.push(word)
  })

  console.log(`\n📈 verse_id 분포:`)
  Array.from(byVerse.entries()).slice(0, 10).forEach(([verseId, words]) => {
    console.log(`  ${verseId}: ${words.length}개 단어`)

    // 각 verse의 첫 단어 표시
    const firstWord = words[0]
    console.log(`    예: ${firstWord.hebrew} (${firstWord.meaning})`)
    console.log(`    icon_url: ${firstWord.icon_url ? '✅' : '❌'}`)
  })
}

checkGenesis1Words().catch(console.error)
