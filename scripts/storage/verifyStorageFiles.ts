#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyStorage() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 Supabase Storage 파일 존재 및 접근 확인')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Check bucket configuration
  console.log('1️⃣ Storage Bucket 설정 확인\n')

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('❌ Bucket 조회 실패:', bucketsError)
    return
  }

  const hebrewIconsBucket = buckets.find(b => b.name === 'hebrew-icons')
  if (!hebrewIconsBucket) {
    console.error('❌ hebrew-icons 버킷을 찾을 수 없습니다')
    return
  }

  console.log(`✅ Bucket: ${hebrewIconsBucket.name}`)
  console.log(`   Public: ${hebrewIconsBucket.public}`)
  console.log(`   ID: ${hebrewIconsBucket.id}`)
  console.log(`   Created: ${hebrewIconsBucket.created_at}\n`)

  // 2. List files in icons folder
  console.log('2️⃣ icons/ 폴더 파일 목록 확인\n')

  const { data: files, error: listError } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', {
      limit: 10,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (listError) {
    console.error('❌ 파일 목록 조회 실패:', listError)
    return
  }

  if (!files || files.length === 0) {
    console.error('❌ icons/ 폴더에 파일이 없습니다!')
    console.log('\n⚠️  파일이 실제로 업로드되지 않았을 수 있습니다.')
    return
  }

  console.log(`✅ 파일 발견: ${files.length}개 (최근 10개)\n`)

  files.forEach((file, i) => {
    console.log(`[${i + 1}] ${file.name}`)
    console.log(`    크기: ${(file.metadata?.size / 1024).toFixed(2)} KB`)
    console.log(`    MIME: ${file.metadata?.mimetype}`)
    console.log(`    생성: ${file.created_at}`)
    console.log(`    업데이트: ${file.updated_at}\n`)
  })

  // 3. Test public URL access
  console.log('3️⃣ 퍼블릭 URL 접근 테스트\n')

  const testFile = files[0]
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/hebrew-icons/icons/${testFile.name}`

  console.log(`테스트 URL: ${publicUrl}\n`)

  try {
    const response = await fetch(publicUrl)
    console.log(`HTTP Status: ${response.status} ${response.statusText}`)
    console.log(`Content-Type: ${response.headers.get('content-type')}`)
    console.log(`Content-Length: ${response.headers.get('content-length')} bytes`)

    if (response.ok) {
      const buffer = await response.arrayBuffer()
      const uint8Array = new Uint8Array(buffer)
      const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF
      console.log(`JPEG 시그니처: ${isJPEG ? '✅ 정상' : '❌ 잘못됨'}`)
      console.log('\n✅ 파일에 퍼블릭 접근 가능\n')
    } else {
      console.log('\n❌ 파일 접근 실패\n')
    }
  } catch (error: any) {
    console.error(`❌ 네트워크 오류: ${error.message}\n`)
  }

  // 4. Check database records
  console.log('4️⃣ 데이터베이스 icon_url 확인\n')

  const { data: words, error: dbError } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, icon_url')
    .like('verse_id', 'genesis_1_%')
    .not('icon_url', 'is', null)
    .limit(10)

  if (dbError) {
    console.error('❌ DB 조회 실패:', dbError)
    return
  }

  console.log(`✅ icon_url이 있는 단어: ${words.length}개 (샘플 10개)\n`)

  for (const word of words.slice(0, 5)) {
    console.log(`${word.hebrew} (${word.verse_id})`)
    console.log(`   URL: ${word.icon_url}`)

    // Test URL
    try {
      const response = await fetch(word.icon_url!)
      const status = response.ok ? '✅' : '❌'
      console.log(`   접근: ${status} (HTTP ${response.status})\n`)
    } catch (error) {
      console.log(`   접근: ❌ 네트워크 오류\n`)
    }
  }

  // 5. Compare uploaded files count vs DB records
  console.log('5️⃣ 파일 개수 vs DB 레코드 비교\n')

  const { data: allFiles } = await supabase.storage
    .from('hebrew-icons')
    .list('icons')

  const { count: dbCount } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true })
    .like('verse_id', 'genesis_1_%')
    .not('icon_url', 'is', null)

  console.log(`Storage 파일 수: ${allFiles?.length || 0}`)
  console.log(`DB icon_url 수: ${dbCount || 0}`)

  if (allFiles && dbCount) {
    if (allFiles.length < dbCount) {
      console.log(`\n⚠️  Storage에 파일이 부족합니다! (${dbCount - allFiles.length}개 누락)`)
    } else if (allFiles.length > dbCount) {
      console.log(`\n⚠️  DB에 URL이 부족합니다! (${allFiles.length - dbCount}개 누락)`)
    } else {
      console.log(`\n✅ 파일 수와 DB 레코드 수가 일치합니다`)
    }
  }

  // 6. Check specific Genesis 1:3-31 files
  console.log('\n6️⃣ Genesis 1:3-31 파일 샘플 확인\n')

  const { data: genesis3to31Words } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, icon_url')
    .like('verse_id', 'genesis_1_%')
    .not('icon_url', 'is', null)
    .limit(5)
    .order('verse_id')

  if (genesis3to31Words && genesis3to31Words.length > 0) {
    // Filter for verses 3+
    const v3plus = genesis3to31Words.filter(w => {
      const match = w.verse_id.match(/genesis_1_(\d+)/)
      return match && parseInt(match[1]) >= 3
    })

    if (v3plus.length === 0) {
      console.log('❌ Genesis 1:3 이상의 단어에 icon_url이 없습니다!')
      console.log('   → 데이터베이스 업데이트가 실패했을 가능성이 높습니다.\n')
    } else {
      console.log(`✅ Genesis 1:3+ 단어 발견: ${v3plus.length}개\n`)

      for (const word of v3plus) {
        const filename = word.icon_url?.split('/').pop()
        console.log(`${word.hebrew} (${word.verse_id})`)
        console.log(`   파일명: ${filename}`)

        // Check if file exists in storage
        const { data: fileExists } = await supabase.storage
          .from('hebrew-icons')
          .list('icons', { search: filename })

        if (fileExists && fileExists.length > 0) {
          console.log(`   Storage: ✅ 존재함\n`)
        } else {
          console.log(`   Storage: ❌ 파일 없음!\n`)
        }
      }
    }
  } else {
    console.log('❌ icon_url이 있는 단어를 찾을 수 없습니다!\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 진단 완료')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

verifyStorage().catch(console.error)
