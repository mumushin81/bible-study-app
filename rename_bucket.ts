import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function renameBucket() {
  // 현재 버킷 목록 조회
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('버킷 목록 조회 실패:', listError)
    return
  }

  console.log('현재 버킷 목록:')
  console.log(buckets.map(b => b.name))

  // 버킷 이름 변경 시도
  const { data, error } = await supabase.storage.updateBucket('hebrew-icons', {
    name: 'flashcardimg'
  })

  if (error) {
    console.error('버킷 이름 변경 실패:', error)
  } else {
    console.log('버킷 이름 변경 성공!')
    console.log('변경된 버킷:', data)
  }
}

renameBucket()