#!/usr/bin/env tsx

/**
 * DB words 테이블의 icon_url 업데이트
 * - genesis1-verse2-31.json의 매핑 정보 사용
 * - meaning 기반으로 DB 레코드 찾기
 * - 업로드된 Storage URL로 icon_url 업데이트
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// JSON 파일에서 히브리어 → 의미 매핑 로드
const jsonPath = join(process.cwd(), 'scripts', 'images', 'genesis1-verse2-31.json')
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'))

// 창세기 1:1 단어도 추가
const genesis1_1 = [
  { hebrew: 'בְּרֵאשִׁית', meaning: '태초에, 처음에' },
  { hebrew: 'בָּרָא', meaning: '창조하셨다' },
  { hebrew: 'אֱלֹהִים', meaning: '하나님' },
  { hebrew: 'אֵת', meaning: '~을/를 (목적격 표지)' },
  { hebrew: 'הַשָּׁמַיִם', meaning: '하늘들' },
  { hebrew: 'וְאֵת', meaning: '그리고 ~을/를' },
  { hebrew: 'הָאָרֶץ', meaning: '땅' },
]

async function updateWordIconUrls() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 DB words.icon_url 업데이트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 전체 매핑 목록 (1:1 + 2-31절)
  const allWords = [
    ...genesis1_1,
    ...jsonData.wordsToGenerate
  ]

  console.log(`📋 총 ${allWords.length}개 단어 처리 예정\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < allWords.length; i++) {
    const { hebrew, meaning } = allWords[i]

    try {
      // MD5 해시로 Storage 파일명 생성
      const hash = createHash('md5').update(hebrew).digest('hex')
      const storageFilename = `word_${hash}.jpg`

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${storageFilename}`)

      // DB에서 해당 의미로 단어 검색
      const { data: words, error: selectError } = await supabase
        .from('words')
        .select('id, hebrew, icon_url')
        .eq('meaning', meaning)

      if (selectError) {
        console.error(`❌ [${i + 1}/${allWords.length}] "${meaning}" 검색 실패:`, selectError.message)
        failed++
        continue
      }

      if (!words || words.length === 0) {
        console.warn(`⚠️  [${i + 1}/${allWords.length}] "${meaning}" - DB에 없음`)
        skipped++
        continue
      }

      // 이미 같은 URL이 설정되어 있는지 확인
      const alreadySet = words.every(w => w.icon_url === publicUrl)
      if (alreadySet) {
        console.log(`⏭️  [${i + 1}/${allWords.length}] "${meaning}" - 이미 설정됨 (${words.length}개 레코드)`)
        skipped++
        continue
      }

      // icon_url 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('meaning', meaning)

      if (updateError) {
        console.error(`❌ [${i + 1}/${allWords.length}] "${meaning}" 업데이트 실패:`, updateError.message)
        failed++
        continue
      }

      updated++
      console.log(`✅ [${i + 1}/${allWords.length}] "${meaning}" - ${words.length}개 레코드 업데이트`)

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 50))

    } catch (err: any) {
      console.error(`❌ [${i + 1}/${allWords.length}] "${meaning}" 오류:`, err.message)
      failed++
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 업데이트 성공: ${updated}/${allWords.length}`)
  console.log(`⏭️  이미 설정/미매칭: ${skipped}/${allWords.length}`)
  console.log(`❌ 실패: ${failed}/${allWords.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (updated > 0) {
    console.log(`🎉 ${updated}개 단어의 icon_url이 성공적으로 업데이트되었습니다!`)
  }

  if (failed > 0) {
    console.log(`\n⚠️  ${failed}개 단어 업데이트 실패. 로그를 확인하세요.`)
  }
}

updateWordIconUrls().catch(console.error)
