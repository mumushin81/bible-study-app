#!/usr/bin/env tsx

/**
 * 생성된 히브리어 단어 이미지를 Supabase Storage에 업로드하고 DB 업데이트
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Admin 권한 필요
)

const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'words')

// 히브리어 파일명 → 의미 및 영어명 매핑 (창세기 1:1)
interface WordMapping {
  meaning: string
  english: string
}

const hebrewToMeaning: Record<string, WordMapping> = {
  'בראשית.jpg': { meaning: '태초에, 처음에', english: 'beginning' },
  'ברא.jpg': { meaning: '창조하셨다', english: 'create' },
  'אלהים.jpg': { meaning: '하나님', english: 'god' },
  'השמים.jpg': { meaning: '하늘들', english: 'heaven' },
  'הארץ.jpg': { meaning: '땅', english: 'earth' }
}

async function uploadWordImages() {
  console.log('📤 히브리어 단어 이미지 업로드 및 URL 업데이트 시작\n')

  // 1. 업로드할 파일 목록
  const hebrewFiles = Object.keys(hebrewToMeaning)
  console.log(`📁 ${hebrewFiles.length}개 이미지 파일 처리\n`)

  let uploaded = 0
  let failed = 0

  for (let i = 0; i < hebrewFiles.length; i++) {
    const filename = hebrewFiles[i]
    const filepath = join(IMAGES_DIR, filename)
    const { meaning, english } = hebrewToMeaning[filename]

    try {
      // 2. 파일 읽기
      const fileBuffer = readFileSync(filepath)
      const sizeKB = Math.round(fileBuffer.length / 1024)

      // Storage 경로 생성 (영어 파일명)
      const storageFilename = `word_${english}.jpg`

      // 3. Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('hebrew-icons')
        .upload(`icons/${storageFilename}`, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true  // 덮어쓰기
        })

      if (uploadError) {
        console.error(`❌ [${i + 1}/${hebrewFiles.length}] ${filename} (${meaning}) 업로드 실패:`, uploadError.message)
        failed++
        continue
      }

      // 4. Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${storageFilename}`)

      console.log(`   🔗 URL: ${publicUrl}`)

      // 5. DB에서 해당 의미를 가진 단어 찾기
      const { data: words, error: selectError } = await supabase
        .from('words')
        .select('id, hebrew')
        .eq('meaning', meaning)

      if (selectError) {
        console.error(`❌ [${i + 1}/${hebrewFiles.length}] ${meaning} 검색 실패:`, selectError.message)
        failed++
        continue
      }

      if (!words || words.length === 0) {
        console.warn(`⚠️  [${i + 1}/${hebrewFiles.length}] "${meaning}"에 해당하는 단어 없음`)
        failed++
        continue
      }

      // 6. 모든 매칭되는 단어에 icon_url 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('meaning', meaning)

      if (updateError) {
        console.error(`❌ [${i + 1}/${hebrewFiles.length}] ${meaning} DB 업데이트 실패:`, updateError.message)
        failed++
        continue
      }

      uploaded++
      console.log(`✅ [${i + 1}/${hebrewFiles.length}] ${filename} → "${meaning}" (${words.length}개 레코드, ${sizeKB} KB)`)

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 200))

    } catch (err: any) {
      console.error(`❌ [${i + 1}/${hebrewFiles.length}] ${filename} 오류:`, err.message)
      failed++
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 업로드 성공: ${uploaded}/${hebrewFiles.length}`)
  console.log(`❌ 실패: ${failed}/${hebrewFiles.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (uploaded === hebrewFiles.length) {
    console.log('🎉 모든 파일 업로드 및 DB 업데이트 완료!')
  }
}

uploadWordImages().catch(console.error)
