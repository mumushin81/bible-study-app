#!/usr/bin/env tsx

/**
 * 창세기 1장 단어들의 FLUX 이미지를 매칭하고 업로드
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LOCAL_DIR = join(process.cwd(), 'public', 'images', 'words')
const STORAGE_BUCKET = 'hebrew-icons'
const STORAGE_PATH = 'icons'

// 니쿠드 제거
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').trim()
}

// MD5 해시 생성
function generateHash(text: string): string {
  return createHash('md5').update(text).digest('hex')
}

async function fixGenesis1Images() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 창세기 1장 FLUX 이미지 수동 매칭')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 로컬 FLUX 파일 맵 생성
  const localFiles = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  const fluxMap = new Map<string, string>()

  localFiles.forEach(filename => {
    const hebrew = filename.replace('.jpg', '')
    fluxMap.set(hebrew, filename)
  })

  console.log(`🎨 로컬 FLUX 파일: ${localFiles.length}개\n`)

  // 창세기 1장 verses 조회
  const { data: verses } = await supabase
    .from('verses')
    .select('id, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .order('verse_number')

  if (!verses) {
    console.error('❌ 창세기 1장 찾을 수 없음')
    return
  }

  let totalProcessed = 0
  let totalUploaded = 0
  let totalMatched = 0
  let totalMissing = 0

  // 각 절의 단어 처리
  for (const verse of verses) {
    const { data: words } = await supabase
      .from('words')
      .select('id, hebrew, meaning, icon_url')
      .eq('verse_id', verse.id)
      .order('position')

    if (!words) continue

    // icon_url이 없는 단어만 처리
    const missingWords = words.filter(w => !w.icon_url)
    if (missingWords.length === 0) continue

    console.log(`\n📖 1:${verse.verse_number} - ${missingWords.length}개 단어 처리`)

    for (const word of missingWords) {
      totalProcessed++
      const normalized = removeNikkud(word.hebrew)

      // 로컬 파일 확인
      if (fluxMap.has(normalized)) {
        const filename = fluxMap.get(normalized)!
        const localPath = join(LOCAL_DIR, filename)
        const hash = generateHash(normalized)
        const storageFilename = `word_${hash}.jpg`
        const storagePath = `${STORAGE_PATH}/${storageFilename}`

        console.log(`  ✅ ${word.hebrew} (${word.meaning})`)
        console.log(`     매칭: ${filename}`)

        // Supabase Storage 업로드
        const fileBuffer = readFileSync(localPath)
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError && !uploadError.message.includes('already exists')) {
          console.error(`     ❌ 업로드 실패: ${uploadError.message}`)
          continue
        }

        totalUploaded++

        // Public URL 생성
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath)

        // DB 업데이트
        const { error: updateError } = await supabase
          .from('words')
          .update({ icon_url: publicUrl })
          .eq('id', word.id)

        if (updateError) {
          console.error(`     ❌ DB 업데이트 실패: ${updateError.message}`)
        } else {
          totalMatched++
          console.log(`     💾 DB 업데이트 완료`)
        }

        // Rate limit 방지
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        totalMissing++
        console.log(`  ⚠️  ${word.hebrew} (${word.meaning}) - 로컬 파일 없음`)
        console.log(`     정규화: ${normalized}`)
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`처리한 단어: ${totalProcessed}개`)
  console.log(`✅ 업로드 성공: ${totalUploaded}개`)
  console.log(`💾 DB 매칭 완료: ${totalMatched}개`)
  console.log(`❌ 로컬 파일 없음: ${totalMissing}개`)
}

fixGenesis1Images().catch(console.error)
