#!/usr/bin/env tsx

/**
 * 창세기 1:1 이미지를 Supabase에 업로드하고 데이터베이스 업데이트
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'exists' : 'missing')
  throw new Error('Missing Supabase credentials in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 창세기 1:1 단어 정보
const GENESIS_1_1_WORDS = [
  { filename: 'bereshit', hebrew: 'בְּרֵאשִׁית', korean: '베레쉬트' },
  { filename: 'bara', hebrew: 'בָּרָא', korean: '바라' },
  { filename: 'elohim', hebrew: 'אֱלֹהִים', korean: '엘로힘' },
  { filename: 'et', hebrew: 'אֵת', korean: '에트' },
  { filename: 'hashamayim', hebrew: 'הַשָּׁמַיִם', korean: '하샤마임' },
  { filename: 'veet', hebrew: 'וְאֵת', korean: '베에트' },
  { filename: 'haaretz', hebrew: 'הָאָרֶץ', korean: '하아레츠' }
]

async function uploadImageToSupabase(
  filename: string,
  hebrew: string
): Promise<string | null> {
  try {
    const localPath = join(
      process.cwd(),
      'output/genesis1_1_comparison/schnell',
      `${filename}.jpg`
    )

    console.log(`📤 Uploading ${filename}.jpg...`)

    // 파일 읽기
    const fileBuffer = readFileSync(localPath)

    // Supabase Storage에 업로드
    const storagePath = `word_icons/${filename}.jpg`
    const { data, error } = await supabase.storage
      .from('hebrew-icons')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // 기존 파일 덮어쓰기
      })

    if (error) {
      console.error(`   ❌ Upload failed: ${error.message}`)
      return null
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from('hebrew-icons')
      .getPublicUrl(storagePath)

    console.log(`   ✅ Uploaded: ${urlData.publicUrl}`)

    return urlData.publicUrl
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`)
    return null
  }
}

async function updateWordIconUrl(
  hebrew: string,
  iconUrl: string
): Promise<boolean> {
  try {
    console.log(`💾 Updating database for ${hebrew}...`)

    const { error } = await supabase
      .from('words')
      .update({ icon_url: iconUrl })
      .eq('hebrew', hebrew)

    if (error) {
      console.error(`   ❌ Database update failed: ${error.message}`)
      return false
    }

    console.log(`   ✅ Database updated`)
    return true
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📤 창세기 1:1 이미지 Supabase 업로드')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`총 ${GENESIS_1_1_WORDS.length}개 이미지 업로드 예정\n`)

  let uploadCount = 0
  let updateCount = 0

  for (const word of GENESIS_1_1_WORDS) {
    console.log(`\n[${uploadCount + 1}/${GENESIS_1_1_WORDS.length}] ${word.hebrew} (${word.korean})`)
    console.log('─'.repeat(50))

    // 1. 이미지 업로드
    const iconUrl = await uploadImageToSupabase(word.filename, word.hebrew)

    if (!iconUrl) {
      console.log('   ⚠️  Skipping database update due to upload failure')
      continue
    }

    uploadCount++

    // 2. 데이터베이스 업데이트
    const updated = await updateWordIconUrl(word.hebrew, iconUrl)

    if (updated) {
      updateCount++
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 업로드 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`✅ 업로드 성공: ${uploadCount}/${GENESIS_1_1_WORDS.length}`)
  console.log(`✅ DB 업데이트 성공: ${updateCount}/${GENESIS_1_1_WORDS.length}`)

  if (uploadCount === GENESIS_1_1_WORDS.length && updateCount === GENESIS_1_1_WORDS.length) {
    console.log('\n🎉 모든 이미지 업로드 및 데이터베이스 업데이트 완료!')
    console.log('\n다음 단계: 앱에서 확인하세요!')
    console.log('  npm run dev')
    console.log('  http://localhost:5173\n')
  } else {
    console.log('\n⚠️  일부 이미지 업로드 또는 업데이트 실패')
    console.log('실패한 항목을 확인하고 다시 시도하세요.\n')
  }
}

main().catch(console.error)
