#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)
const STORAGE_BASE_URL = `${supabaseUrl}/storage/v1/object/public/hebrew-icons/icons`

interface UploadResult {
  success: boolean
  wordId: string
  filename: string
  url?: string
  error?: string
  alreadyExists?: boolean
}

async function uploadImage(filename: string, filepath: string): Promise<{ success: boolean; alreadyExists?: boolean; error?: string }> {
  try {
    const fileBuffer = readFileSync(filepath)
    const storagePath = `icons/${filename}`

    // Check if file already exists
    const { data: existingFiles } = await supabase.storage
      .from('hebrew-icons')
      .list('icons', {
        search: filename
      })

    if (existingFiles && existingFiles.length > 0) {
      return { success: true, alreadyExists: true }
    }

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('hebrew-icons')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      // If error is duplicate, treat as success
      if (uploadError.message.includes('already exists')) {
        return { success: true, alreadyExists: true }
      }
      return { success: false, error: uploadError.message }
    }

    return { success: true, alreadyExists: false }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function updateDatabase(wordId: string, iconUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('words')
      .update({ icon_url: iconUrl })
      .eq('id', wordId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📤 창세기 1:3-31 이미지 업로드 및 DB 업데이트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const outputDir = join(process.cwd(), 'output/genesis1_3to31')
  const manifestPath = join(outputDir, 'manifest.json')

  if (!existsSync(manifestPath)) {
    console.error('❌ 매니페스트 파일을 찾을 수 없습니다:', manifestPath)
    console.log('먼저 generateGenesis1_3to31.ts를 실행하여 이미지를 생성하세요.')
    return
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  console.log(`📊 총 ${manifest.length}개 이미지 처리 예정\n`)

  const results: UploadResult[] = []
  let uploadCount = 0
  let dbUpdateCount = 0
  let alreadyExistsCount = 0
  let errorCount = 0

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i]
    const filename = `${item.filename}.jpg`
    const filepath = join(outputDir, filename)

    console.log(`[${i + 1}/${manifest.length}] 처리 중: ${item.hebrew}`)
    console.log(`   구절: ${item.verse_id} [${item.position}]`)
    console.log(`   파일: ${filename}`)

    if (!existsSync(filepath)) {
      console.log(`   ❌ 파일을 찾을 수 없음`)
      results.push({
        success: false,
        wordId: item.id,
        filename,
        error: 'File not found'
      })
      errorCount++
      continue
    }

    // Upload image
    const uploadResult = await uploadImage(filename, filepath)

    if (!uploadResult.success) {
      console.log(`   ❌ 업로드 실패: ${uploadResult.error}`)
      results.push({
        success: false,
        wordId: item.id,
        filename,
        error: uploadResult.error
      })
      errorCount++
      continue
    }

    if (uploadResult.alreadyExists) {
      console.log(`   ⏭️  이미 존재함`)
      alreadyExistsCount++
    } else {
      console.log(`   ✅ 업로드 완료`)
      uploadCount++
    }

    // Update database
    const iconUrl = `${STORAGE_BASE_URL}/${filename}`
    const dbResult = await updateDatabase(item.id, iconUrl)

    if (!dbResult.success) {
      console.log(`   ❌ DB 업데이트 실패: ${dbResult.error}`)
      results.push({
        success: false,
        wordId: item.id,
        filename,
        url: iconUrl,
        error: `DB update failed: ${dbResult.error}`
      })
      errorCount++
      continue
    }

    console.log(`   ✅ DB 업데이트 완료`)
    console.log(`   🔗 ${iconUrl}\n`)
    dbUpdateCount++

    results.push({
      success: true,
      wordId: item.id,
      filename,
      url: iconUrl,
      alreadyExists: uploadResult.alreadyExists
    })

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 처리 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`✅ 성공: ${dbUpdateCount}/${manifest.length}`)
  console.log(`📤 새로 업로드: ${uploadCount}`)
  console.log(`⏭️  이미 존재: ${alreadyExistsCount}`)
  console.log(`❌ 실패: ${errorCount}`)

  if (dbUpdateCount === manifest.length) {
    console.log('\n🎉 모든 이미지 업로드 및 DB 업데이트 완료!')
    console.log('\n다음 단계:')
    console.log('  1. 브라우저에서 플래시카드 확인')
    console.log('  2. 변경사항 커밋 및 배포\n')
  } else if (errorCount > 0) {
    console.log('\n⚠️  일부 처리 실패')
    const failed = results.filter(r => !r.success)
    console.log(`\n실패한 항목 (${failed.length}개):`)
    failed.forEach(f => {
      console.log(`  - ${f.filename}: ${f.error}`)
    })
  }

  // Check updated statistics
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Genesis 1장 전체 통계')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const { data: allWords } = await supabase
    .from('words')
    .select('id, icon_url')
    .like('verse_id', 'genesis_1_%')

  if (allWords) {
    const withImages = allWords.filter(w => w.icon_url)
    const percentage = (withImages.length / allWords.length * 100).toFixed(1)

    console.log(`총 단어 수: ${allWords.length}`)
    console.log(`이미지 있음: ${withImages.length} (${percentage}%)`)
    console.log(`이미지 없음: ${allWords.length - withImages.length} (${(100 - parseFloat(percentage)).toFixed(1)}%)\n`)
  }
}

main().catch(console.error)
