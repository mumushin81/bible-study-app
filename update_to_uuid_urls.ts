import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readdirSync } from 'fs'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const STORAGE_BASE_URL = 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons'
const LOCAL_DIR = 'output/all_words_jpg'

async function updateToUuidUrls() {
  console.log('🔄 DB icon_url을 UUID 기반 파일명으로 업데이트\n')

  // 로컬 UUID 파일명 목록
  const localFiles = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  console.log(`📁 로컬 UUID 이미지: ${localFiles.length}개\n`)

  // 파일명에서 UUID 추출 (word_UUID.jpg -> UUID)
  const uuidMap = new Map<string, string>()
  localFiles.forEach(filename => {
    const match = filename.match(/word_(.+)\.jpg/)
    if (match) {
      const uuid = match[1].replace(/_/g, '-') // UUID 형식 복원
      uuidMap.set(uuid, filename)
    }
  })

  // DB에서 모든 단어 조회
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url')
    .limit(1000)

  if (error) {
    console.error('❌ DB 조회 실패:', error)
    return
  }

  console.log(`📊 DB 단어: ${words.length}개\n`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 업데이트 시작...\n')

  let updateCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const word of words) {
    if (!uuidMap.has(word.id)) {
      skipCount++
      continue
    }

    const filename = uuidMap.get(word.id)!
    const newUrl = `${STORAGE_BASE_URL}/${filename}`

    // 이미 올바른 URL이면 스킵
    if (word.icon_url === newUrl) {
      skipCount++
      continue
    }

    try {
      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: newUrl })
        .eq('id', word.id)

      if (updateError) {
        throw updateError
      }

      updateCount++
      if (updateCount <= 10) {
        console.log(`✅ [${updateCount}] ${word.hebrew} (${word.meaning})`)
        console.log(`   OLD: ${word.icon_url || '(null)'}`)
        console.log(`   NEW: ${newUrl}`)
        console.log()
      } else if (updateCount % 50 === 0) {
        console.log(`✅ 업데이트 진행 중... ${updateCount}개`)
      }
    } catch (err) {
      errorCount++
      console.error(`❌ 업데이트 실패: ${word.hebrew} - ${err}`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 업데이트 완료')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ 업데이트 성공: ${updateCount}개`)
  console.log(`⏭️  스킵 (이미 올바름): ${skipCount}개`)
  console.log(`❌ 업데이트 실패: ${errorCount}개`)
  console.log()

  // Genesis 1:1 검증
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Genesis 1:1 검증')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { data: gen11Words } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url, verses!inner(reference)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true })

  if (gen11Words) {
    for (const word of gen11Words) {
      const hasUuid = uuidMap.has(word.id)
      const expectedFilename = uuidMap.get(word.id)
      const expectedUrl = expectedFilename ? `${STORAGE_BASE_URL}/${expectedFilename}` : null
      const matches = word.icon_url === expectedUrl

      console.log(`${matches ? '✅' : '❌'} ${word.hebrew} (${word.meaning})`)
      console.log(`   현재 URL: ${word.icon_url || '(null)'}`)
      if (expectedUrl) {
        console.log(`   기대 URL: ${expectedUrl}`)
      }
      console.log()
    }
  }
}

updateToUuidUrls()
