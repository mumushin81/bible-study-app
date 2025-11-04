#!/usr/bin/env tsx

/**
 * 로컬 FLUX 이미지를 Supabase Storage에 업로드하고 DB 업데이트
 * public/images/words/*.jpg → Storage + DB icon_url
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LOCAL_DIR = join(process.cwd(), 'public', 'images', 'words')

async function uploadFluxImages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 FLUX 이미지 일괄 업로드 시작')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. 로컬 파일 목록
  const files = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  console.log(`📁 로컬 파일: ${files.length}개\n`)

  let uploaded = 0
  let dbUpdated = 0
  let failed = 0
  const failedFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const hebrew = filename.replace('.jpg', '') // 히브리어 (니쿠드 포함)

    try {
      console.log(`[${i + 1}/${files.length}] ${hebrew}`)

      // 2. 파일 읽기
      const filepath = join(LOCAL_DIR, filename)
      const fileBuffer = readFileSync(filepath)
      const sizeKB = Math.round(fileBuffer.length / 1024)

      // 3. MD5 해시 생성 (DB 매칭용)
      const hash = createHash('md5').update(hebrew).digest('hex')
      const storageFilename = `word_${hash}.jpg`

      // 4. Supabase Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from('hebrew-icons')
        .upload(`icons/${storageFilename}`, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true  // 덮어쓰기
        })

      if (uploadError) {
        console.error(`   ❌ 업로드 실패: ${uploadError.message}`)
        failed++
        failedFiles.push(filename)
        continue
      }

      uploaded++
      console.log(`   ✅ Storage 업로드: ${storageFilename} (${sizeKB} KB)`)

      // 5. Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${storageFilename}`)

      // 6. DB에서 매칭되는 단어 찾기 (니쿠드 제거하고 검색)
      const hebrewWithoutNikkud = hebrew.replace(/[\u0591-\u05C7]/g, '')
      
      const { data: words, error: selectError } = await supabase
        .from('words')
        .select('id, hebrew, meaning')
        .ilike('hebrew', `%${hebrewWithoutNikkud}%`)

      if (selectError) {
        console.error(`   ⚠️  DB 검색 실패: ${selectError.message}`)
        continue
      }

      if (!words || words.length === 0) {
        console.log(`   ⏭️  DB에 매칭되는 단어 없음`)
        continue
      }

      // 7. icon_url 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .in('id', words.map(w => w.id))

      if (updateError) {
        console.error(`   ⚠️  DB 업데이트 실패: ${updateError.message}`)
        continue
      }

      dbUpdated += words.length
      console.log(`   💾 DB 업데이트: ${words.length}개 레코드`)
      console.log(`   🔗 URL: ${publicUrl.substring(0, 80)}...`)

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err: any) {
      console.error(`   ❌ 오류: ${err.message}`)
      failed++
      failedFiles.push(filename)
    }

    console.log('')
  }

  // 결과 요약
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 업로드 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ Storage 업로드 성공: ${uploaded}/${files.length}`)
  console.log(`💾 DB 레코드 업데이트: ${dbUpdated}개`)
  console.log(`❌ 실패: ${failed}/${files.length}`)

  if (failedFiles.length > 0) {
    console.log(`\n❌ 실패한 파일:`)
    failedFiles.forEach(f => console.log(`   - ${f}`))
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (uploaded === files.length) {
    console.log('🎉 모든 FLUX 이미지 업로드 완료!')
  } else if (uploaded > 0) {
    console.log(`⚠️  일부 파일만 업로드됨: ${uploaded}/${files.length}`)
  } else {
    console.log('❌ 업로드 실패')
  }
}

uploadFluxImages().catch(console.error)
