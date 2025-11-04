import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateBucket() {
  console.log('🚀 버킷 마이그레이션 시작')

  // 1. 기존 버킷의 모든 파일 목록 조회
  const { data: files, error: listError } = await supabase.storage
    .from('hebrew-icons')
    .list('icons')

  if (listError) {
    console.error('❌ 파일 목록 조회 실패:', listError)
    return
  }

  console.log(`📁 ${files.length}개 파일 발견`)

  // 2. 새 버킷 생성
  const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('flashcardimg', {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml']
  })

  if (bucketError) {
    console.error('❌ 새 버킷 생성 실패:', bucketError)
    return
  }

  console.log('✅ flashcardimg 버킷 생성 완료')

  // 3. 파일 복사
  for (const file of files) {
    // 원본 파일 다운로드
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('hebrew-icons')
      .download(`icons/${file.name}`)

    if (downloadError) {
      console.error(`❌ 파일 다운로드 실패 ${file.name}:`, downloadError)
      continue
    }

    // 새 버킷에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('flashcardimg')
      .upload(`words/${file.name}`, downloadData, {
        contentType: file.metadata.mimetype || 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ 파일 업로드 실패 ${file.name}:`, uploadError)
      continue
    }

    console.log(`✅ 파일 복사 완료: ${file.name}`)
  }

  console.log('🎉 버킷 마이그레이션 완료')
}

migrateBucket()