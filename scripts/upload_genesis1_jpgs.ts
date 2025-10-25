#!/usr/bin/env tsx

/**
 * 창세기 1장 JPG를 Supabase Storage에 업로드하고 DB 업데이트
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

const JPG_DIR = join(process.cwd(), 'output', 'genesis1_artistic_jpgs_9x16')

async function uploadAndUpdateUrls() {
  console.log('📤 창세기 1장 JPG 업로드 및 URL 업데이트 시작\n')

  // 1. JPG 파일 목록
  const files = readdirSync(JPG_DIR).filter(f => f.endsWith('.jpg'))
  console.log(`📁 ${files.length}개 JPG 파일 발견\n`)

  let uploaded = 0
  let failed = 0

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filepath = join(JPG_DIR, filename)

    try {
      // 파일명에서 word ID 추출 (word_xxx.jpg)
      const wordId = filename.replace('word_', '').replace(/_/g, '-').replace('.jpg', '')

      // 2. Supabase Storage에 업로드
      const fileBuffer = readFileSync(filepath)

      const { error: uploadError } = await supabase.storage
        .from('hebrew-icons')
        .upload(`icons/${filename}`, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true  // 덮어쓰기
        })

      if (uploadError) {
        console.error(`❌ [${i + 1}/${files.length}] ${filename} 업로드 실패:`, uploadError.message)
        failed++
        continue
      }

      // 3. Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${filename}`)

      // 4. DB 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .eq('id', wordId)

      if (updateError) {
        console.error(`❌ [${i + 1}/${files.length}] ${filename} DB 업데이트 실패:`, updateError.message)
        failed++
        continue
      }

      uploaded++
      const sizeKB = Math.round(fileBuffer.length / 1024)

      if (i % 20 === 0 || i === files.length - 1) {
        console.log(`✅ [${i + 1}/${files.length}] ${filename} (${sizeKB} KB)`)
      }

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err: any) {
      console.error(`❌ [${i + 1}/${files.length}] ${filename} 오류:`, err.message)
      failed++
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 업로드 성공: ${uploaded}/${files.length}`)
  console.log(`❌ 실패: ${failed}/${files.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  if (uploaded === files.length) {
    console.log('🎉 모든 파일 업로드 및 DB 업데이트 완료!')
  }
}

uploadAndUpdateUrls()
