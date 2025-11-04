#!/usr/bin/env tsx

const GENESIS_1_1_ICONS = [
  { word: 'bereshit', url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/bereshit.jpg' },
  { word: 'bara', url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/bara.jpg' },
  { word: 'elohim', url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/elohim.jpg' },
  { word: 'et', url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/et.jpg' },
  { word: 'hashamayim', url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/hashamayim.jpg' },
  { word: 'veet', url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/veet.jpg' },
  { word: 'haaretz', url: 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/haaretz.jpg' }
]

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🌐 이미지 접근성 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  let successCount = 0

  for (const icon of GENESIS_1_1_ICONS) {
    try {
      const response = await fetch(icon.url)

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        const contentLength = response.headers.get('content-length')
        const sizeKB = contentLength ? (parseInt(contentLength) / 1024).toFixed(2) : 'unknown'

        console.log(`✅ ${icon.word}.jpg`)
        console.log(`   Status: ${response.status} ${response.statusText}`)
        console.log(`   Type: ${contentType}`)
        console.log(`   Size: ${sizeKB} KB\n`)
        successCount++
      } else {
        console.log(`❌ ${icon.word}.jpg`)
        console.log(`   Status: ${response.status} ${response.statusText}\n`)
      }
    } catch (error: any) {
      console.log(`❌ ${icon.word}.jpg`)
      console.log(`   Error: ${error.message}\n`)
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 접근성 테스트 결과')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✅ 접근 가능: ${successCount}/7`)

  if (successCount === 7) {
    console.log('\n🎉 모든 이미지가 정상적으로 접근 가능합니다!')
    console.log('\n✅ 완료된 작업:')
    console.log('  1. FLUX Schnell로 7개 이미지 생성 (100% 규칙 준수)')
    console.log('  2. Supabase Storage 업로드 (hebrew-icons 버킷)')
    console.log('  3. 데이터베이스 icon_url 업데이트 완료')
    console.log('  4. 모든 이미지 공개 접근 가능 확인\n')
    console.log('🚀 다음 단계:')
    console.log('  앱에서 실제 학습 화면 확인')
    console.log('  http://localhost:5174\n')
  } else {
    console.log(`\n⚠️  ${7 - successCount}개 이미지 접근 실패\n`)
  }
}

main().catch(console.error)
