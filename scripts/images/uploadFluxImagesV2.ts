#!/usr/bin/env tsx

/**
 * FLUX 이미지 업로드 V2 - 개선된 매칭 로직
 * - 니쿠드 제거 후 정확 매칭
 * - 전체 DB 단어를 메모리에 로드하여 빠른 매칭
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

// 니쿠드 제거 함수
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '')
}

async function uploadFluxImagesV2() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 FLUX 이미지 업로드 V2 (개선된 매칭)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. DB에서 전체 단어 로드
  console.log('📥 DB에서 전체 단어 로드 중...\n')
  
  const { data: allWords, error: loadError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, verse_id')

  if (loadError) {
    console.error('❌ DB 로드 실패:', loadError.message)
    return
  }

  console.log(`📊 전체 단어: ${allWords!.length}개\n`)

  // 2. 히브리어 → 단어 ID 매핑 (니쿠드 제거)
  const hebrewMap = new Map<string, string[]>()
  
  allWords!.forEach(word => {
    const normalized = removeNikkud(word.hebrew).trim()
    if (!hebrewMap.has(normalized)) {
      hebrewMap.set(normalized, [])
    }
    hebrewMap.get(normalized)!.push(word.id)
  })

  console.log(`🗂️  정규화된 히브리어 종류: ${hebrewMap.size}개\n`)

  // 3. 로컬 파일 목록
  const files = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  console.log(`📁 로컬 FLUX 파일: ${files.length}개\n`)

  let uploaded = 0
  let dbUpdated = 0
  let failed = 0
  let notMatched = 0

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const hebrew = filename.replace('.jpg', '') // 니쿠드 제거된 히브리어

    console.log(`[${i + 1}/${files.length}] ${hebrew}`)

    try {
      // 4. 파일 읽기
      const filepath = join(LOCAL_DIR, filename)
      const fileBuffer = readFileSync(filepath)
      const sizeKB = Math.round(fileBuffer.length / 1024)

      // 5. MD5 해시 생성
      const hash = createHash('md5').update(hebrew).digest('hex')
      const storageFilename = `word_${hash}.jpg`

      // 6. Supabase Storage 업로드 (이미 있으면 skip)
      const { data: existing } = await supabase.storage
        .from('hebrew-icons')
        .list('icons', {
          search: storageFilename
        })

      if (existing && existing.length > 0) {
        console.log(`   ⏭️  이미 업로드됨: ${storageFilename}`)
      } else {
        const { error: uploadError } = await supabase.storage
          .from('hebrew-icons')
          .upload(`icons/${storageFilename}`, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) {
          console.error(`   ❌ 업로드 실패: ${uploadError.message}`)
          failed++
          continue
        }

        uploaded++
        console.log(`   ✅ Storage 업로드: ${sizeKB} KB`)
      }

      // 7. Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('hebrew-icons')
        .getPublicUrl(`icons/${storageFilename}`)

      // 8. DB 매칭 (니쿠드 제거 후 정확 매칭)
      const normalized = hebrew.trim()
      const matchedIds = hebrewMap.get(normalized)

      if (!matchedIds || matchedIds.length === 0) {
        console.log(`   ⚠️  DB 매칭 없음`)
        notMatched++
        continue
      }

      // 9. icon_url 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: publicUrl })
        .in('id', matchedIds)

      if (updateError) {
        console.error(`   ⚠️  DB 업데이트 실패: ${updateError.message}`)
        continue
      }

      dbUpdated += matchedIds.length
      console.log(`   💾 DB 업데이트: ${matchedIds.length}개 레코드`)
      console.log(`   🔗 URL: ${publicUrl.substring(0, 80)}...`)

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err: any) {
      console.error(`   ❌ 오류: ${err.message}`)
      failed++
    }

    console.log('')
  }

  // 결과 요약
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 업로드 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ Storage 업로드: ${uploaded}개`)
  console.log(`💾 DB 레코드 업데이트: ${dbUpdated}개`)
  console.log(`⚠️  DB 매칭 실패: ${notMatched}개`)
  console.log(`❌ 오류: ${failed}개`)

  const matchRate = ((files.length - notMatched) / files.length * 100).toFixed(1)
  console.log(`\n📈 매칭률: ${matchRate}%`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (notMatched > 0) {
    console.log(`⚠️  ${notMatched}개 파일이 DB와 매칭되지 않았습니다.`)
    console.log(`   로컬 파일명과 DB hebrew 필드를 확인하세요.`)
  }
}

uploadFluxImagesV2().catch(console.error)
