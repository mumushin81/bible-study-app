#!/usr/bin/env tsx

/**
 * GIF로 저장된 MP4 파일들을 올바른 MP4로 재업로드
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LOCAL_DIR = join(process.cwd(), 'output', 'animated_gifs')
const STORAGE_BUCKET = 'animated-icons'
const STORAGE_PATH = 'videos'

async function fixAnimatedToMp4() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 GIF 파일을 MP4로 재업로드')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 로컬 파일 확인
  const files = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.gif'))
  console.log(`📁 로컬 파일: ${files.length}개\n`)

  let successCount = 0
  let failCount = 0

  for (const filename of files) {
    const hash = filename.replace('word_', '').replace('.gif', '')
    const mp4Filename = `word_${hash}.mp4`
    const localPath = join(LOCAL_DIR, filename)

    console.log(`\n📹 ${filename} → ${mp4Filename}`)

    try {
      // 파일 읽기
      const fileBuffer = readFileSync(localPath)

      // Supabase Storage에 MP4로 업로드
      const storagePath = `${STORAGE_PATH}/${mp4Filename}`
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: 'video/mp4',
          upsert: true
        })

      if (uploadError && !uploadError.message.includes('already exists')) {
        throw new Error(`업로드 실패: ${uploadError.message}`)
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)

      console.log(`   ✅ 업로드: ${publicUrl}`)

      // DB에서 이 해시를 가진 단어 찾기
      const { data: words, error: findError } = await supabase
        .from('words')
        .select('id, hebrew, icon_url')
        .ilike('icon_url', `%${hash}%`)

      if (findError) {
        throw new Error(`단어 찾기 실패: ${findError.message}`)
      }

      if (!words || words.length === 0) {
        console.log(`   ⚠️  해당 단어를 DB에서 찾을 수 없습니다`)
        continue
      }

      // DB 업데이트
      for (const word of words) {
        const { error: updateError } = await supabase
          .from('words')
          .update({ icon_url: publicUrl })
          .eq('id', word.id)

        if (updateError) {
          throw new Error(`DB 업데이트 실패: ${updateError.message}`)
        }

        console.log(`   💾 DB 업데이트: ${word.hebrew}`)
      }

      successCount++
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`   ❌ 실패:`, error)
      failCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 최종 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log('\n🎉 MP4 재업로드 완료!')
}

fixAnimatedToMp4().catch(console.error)
