#!/usr/bin/env tsx

/**
 * MP4 파일을 실제 GIF로 변환하고 Supabase에 업로드
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const INPUT_DIR = join(process.cwd(), 'output', 'animated_gifs')
const OUTPUT_DIR = join(process.cwd(), 'output', 'converted_gifs')
const STORAGE_BUCKET = 'animated-icons'
const STORAGE_PATH = 'gifs'

async function convertMp4ToGif() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎬 MP4를 실제 GIF로 변환')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 출력 디렉토리 생성
  execSync(`mkdir -p "${OUTPUT_DIR}"`)

  // MP4 파일 찾기 (실제로는 .gif 확장자지만 MP4 파일)
  const files = readdirSync(INPUT_DIR).filter(f => f.endsWith('.gif'))
  console.log(`📁 변환할 파일: ${files.length}개\n`)

  let successCount = 0
  let failCount = 0

  for (const filename of files) {
    const hash = filename.replace('word_', '').replace('.gif', '')
    const inputPath = join(INPUT_DIR, filename)
    const outputFilename = `word_${hash}.gif`
    const outputPath = join(OUTPUT_DIR, outputFilename)

    console.log(`\n🎨 ${filename}`)

    try {
      // ffmpeg로 MP4 → GIF 변환
      // - 16fps로 최적화
      // - 320px 너비로 리사이즈 (파일 크기 감소)
      // - palette 생성으로 고품질 GIF
      console.log('   ⏳ ffmpeg 변환 중...')

      const ffmpegCmd = `ffmpeg -i "${inputPath}" \
        -vf "fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
        -loop 0 \
        "${outputPath}" \
        -y 2>&1 | grep -E "(frame=|size=|time=)" | tail -1`

      execSync(ffmpegCmd, { stdio: 'pipe' })

      if (!existsSync(outputPath)) {
        throw new Error('GIF 파일이 생성되지 않았습니다')
      }

      const stats = execSync(`ls -lh "${outputPath}" | awk '{print $5}'`).toString().trim()
      console.log(`   ✅ 변환 완료: ${stats}`)

      // Supabase Storage에 업로드
      console.log('   ☁️  Supabase Storage 업로드 중...')
      const fileBuffer = readFileSync(outputPath)
      const storagePath = `${STORAGE_PATH}/${outputFilename}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: 'image/gif',
          upsert: true
        })

      if (uploadError && !uploadError.message.includes('already exists')) {
        throw new Error(`업로드 실패: ${uploadError.message}`)
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)

      console.log(`   🔗 ${publicUrl}`)

      // DB 업데이트
      const { data: words, error: findError } = await supabase
        .from('words')
        .select('id, hebrew')
        .ilike('icon_url', `%${hash}%`)

      if (findError) {
        throw new Error(`단어 찾기 실패: ${findError.message}`)
      }

      if (!words || words.length === 0) {
        console.log(`   ⚠️  해당 단어를 DB에서 찾을 수 없습니다`)
        continue
      }

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

    } catch (error) {
      console.error(`   ❌ 실패:`, error instanceof Error ? error.message : error)
      failCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 최종 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log(`📁 출력 경로: ${OUTPUT_DIR}`)
  console.log('\n🎉 GIF 변환 및 업로드 완료!')
}

convertMp4ToGif().catch(console.error)
