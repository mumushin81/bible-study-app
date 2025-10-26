#!/usr/bin/env tsx

/**
 * public/images/words의 모든 히브리어 단어 이미지를 Supabase Storage에 업로드하고 DB 업데이트
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'words')

// JSON 파일에서 히브리어 → 의미 매핑 로드
const jsonPath = join(process.cwd(), 'scripts', 'images', 'genesis1-verse2-31.json')
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'))
const hebrewToMeaning = new Map<string, string>()
jsonData.wordsToGenerate.forEach((word: any) => {
  hebrewToMeaning.set(word.hebrew, word.meaning)
})

// 창세기 1:1 단어도 추가 (별도 파일)
const genesis1_1 = [
  { hebrew: 'בְּרֵאשִׁית', meaning: '태초에, 처음에' },
  { hebrew: 'בָּרָא', meaning: '창조하셨다' },
  { hebrew: 'אֱלֹהִים', meaning: '하나님' },
  { hebrew: 'אֵת', meaning: '~을/를 (목적격 표지)' },
  { hebrew: 'הַשָּׁמַיִם', meaning: '하늘들' },
  { hebrew: 'וְאֵת', meaning: '그리고 ~을/를' },
  { hebrew: 'הָאָרֶץ', meaning: '땅' },
]
genesis1_1.forEach(w => hebrewToMeaning.set(w.hebrew, w.meaning))

async function uploadAllWordImages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📤 모든 히브리어 단어 이미지 업로드 및 DB 업데이트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 모든 JPG 파일 목록 가져오기
  const allFiles = readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg'))

  console.log(`📁 ${allFiles.length}개 이미지 파일 발견\n`)

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < allFiles.length; i++) {
    const filename = allFiles[i]
    const hebrewWord = filename.replace('.jpg', '')
    const filepath = join(IMAGES_DIR, filename)

    try {
      // 파일 읽기
      const fileBuffer = readFileSync(filepath)
      const sizeKB = Math.round(fileBuffer.length / 1024)

      // Storage 파일명 생성 (MD5 해시 사용 - URL-safe)
      const hash = createHash('md5').update(hebrewWord).digest('hex')
      const storageFilename = `word_${hash}.jpg`

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('hebrew-icons')
        .upload(`icons/${storageFilename}`, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.error(`❌ [${i + 1}/${allFiles.length}] ${filename} 업로드 실패:`, uploadError.message)
        failed++
        continue
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${storageFilename}`)

      // JSON에서 meaning 찾기
      const meaning = hebrewToMeaning.get(hebrewWord)

      if (!meaning) {
        console.warn(`⚠️  [${i + 1}/${allFiles.length}] "${hebrewWord}"에 대한 의미 매핑 없음 (업로드는 완료)`)
        skipped++
        continue
      }

      // DB에서 해당 의미로 단어 찾기
      const { data: words, error: selectError } = await supabase
        .from('words')
        .select('id, hebrew')
        .eq('meaning', meaning)

      if (selectError) {
        console.error(`❌ [${i + 1}/${allFiles.length}] "${meaning}" 검색 실패:`, selectError.message)
        failed++
        continue
      }

      if (!words || words.length === 0) {
        console.warn(`⚠️  [${i + 1}/${allFiles.length}] "${meaning}"에 해당하는 단어 없음 (업로드는 완료)`)
        skipped++
        continue
      }

      // 모든 매칭되는 단어에 icon_url 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('meaning', meaning)

      if (updateError) {
        console.error(`❌ [${i + 1}/${allFiles.length}] "${meaning}" DB 업데이트 실패:`, updateError.message)
        failed++
        continue
      }

      uploaded++
      console.log(`✅ [${i + 1}/${allFiles.length}] ${filename} → ${meaning} (${words.length}개 레코드, ${sizeKB} KB)`)

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err: any) {
      console.error(`❌ [${i + 1}/${allFiles.length}] ${filename} 오류:`, err.message)
      failed++
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ DB 업데이트 성공: ${uploaded}/${allFiles.length}`)
  console.log(`⚠️  DB 미매칭: ${skipped}/${allFiles.length}`)
  console.log(`❌ 실패: ${failed}/${allFiles.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (uploaded + skipped === allFiles.length) {
    console.log('🎉 모든 파일 업로드 완료!')
  }
}

uploadAllWordImages().catch(console.error)
