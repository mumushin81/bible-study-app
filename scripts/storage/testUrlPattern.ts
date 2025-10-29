#!/usr/bin/env tsx

// Test the updated URL pattern validation

function isValidImage(url: string): boolean {
  if (!url) return false;

  // JPG 패턴 1: UUID 파일명 (hebrew-icons/icons/)
  // UUID format: word_{8hex}_{4hex}_{4hex}_{4hex}_{12hex}.jpg
  const jpgPattern1 = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/icons\/word_[a-f0-9]{8}_[a-f0-9]{4}_[a-f0-9]{4}_[a-f0-9]{4}_[a-f0-9]{12}\.jpg$/;

  // JPG 패턴 2: 일반 파일명 (hebrew-icons/word_icons/)
  const jpgPattern2 = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/word_icons\/[a-zA-Z_]+\.jpg$/;

  // GIF 패턴 (animated-icons/gifs/)
  const gifPattern = /supabase\.co\/storage\/v1\/object\/public\/animated-icons\/gifs\/word_[a-f0-9]{8}_[a-f0-9]{4}_[a-f0-9]{4}_[a-f0-9]{4}_[a-f0-9]{12}\.gif$/;

  return jpgPattern1.test(url) || jpgPattern2.test(url) || gifPattern.test(url);
}

const testUrls = [
  // Genesis 1:1 (word_icons) - should PASS
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/bereshit.jpg',
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/bara.jpg',
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/elohim.jpg',

  // Genesis 1:3-31 (UUID) - should PASS
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_20b00abc_8e68_45b7_92fb_649058b3af09.jpg',
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_cea0817d_18c7_4c42_b41a_fd6089d9c32a.jpg',
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_61457589_7327_448f_8035_f93cc95390ba.jpg',

  // Invalid URLs - should FAIL
  'https://example.com/image.jpg',
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_invalid.jpg',
  'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_12345678.jpg',
];

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🧪 URL 패턴 검증 테스트')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

testUrls.forEach((url, index) => {
  const isValid = isValidImage(url)
  const status = isValid ? '✅ PASS' : '❌ FAIL'
  const filename = url.split('/').pop()
  console.log(`[${index + 1}] ${status}`)
  console.log(`    ${filename}`)
  console.log(`    ${url}\n`)
})

// Test specific patterns
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 패턴별 검증')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const genesis1_1_url = 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/word_icons/bereshit.jpg'
const genesis1_10_url = 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_20b00abc_8e68_45b7_92fb_649058b3af09.jpg'

console.log(`Genesis 1:1 (word_icons): ${isValidImage(genesis1_1_url) ? '✅' : '❌'}`)
console.log(`Genesis 1:10 (UUID): ${isValidImage(genesis1_10_url) ? '✅' : '❌'}`)

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ 모든 테스트 완료')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
