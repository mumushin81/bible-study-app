#!/usr/bin/env tsx

/**
 * 창세기 1장 2-31절 단어 이미지 배치 생성
 */

import 'dotenv/config'
import { generateWordImagesBatch } from './generateImage.js'
import type { WordInfo } from './generateImagePrompt.js'
import { readFileSync } from 'fs'
import { join } from 'path'

const inputPath = join(process.cwd(), 'scripts', 'images', 'genesis1-verse2-31.json')
const data = JSON.parse(readFileSync(inputPath, 'utf-8'))

const wordsToGenerate: WordInfo[] = data.wordsToGenerate

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 창세기 1장 2-31절 단어 이미지 배치 생성
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

생성할 단어: ${wordsToGenerate.length}개

품사별 분포:
- 명사: ${wordsToGenerate.filter(w => w.grammar?.includes('명사')).length}개
- 동사: ${wordsToGenerate.filter(w => w.grammar?.includes('동사')).length}개
- 전치사: ${wordsToGenerate.filter(w => w.grammar?.includes('전치사')).length}개
- 형용사: ${wordsToGenerate.filter(w => w.grammar?.includes('형용사')).length}개
- 기타: ${wordsToGenerate.filter(w => !w.grammar?.includes('명사') && !w.grammar?.includes('동사') && !w.grammar?.includes('전치사') && !w.grammar?.includes('형용사')).length}개

설정:
- 비율: 9:16 (플래시카드 모바일)
- 형식: JPG
- 품질: 90
- 예상 비용: $${(wordsToGenerate.length * 0.003).toFixed(3)}
- 예상 시간: 약 ${Math.ceil(wordsToGenerate.length * 6 / 60)}분

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN 환경 변수가 설정되지 않았습니다')
  console.error('📖 .env.local 파일에 다음을 추가하세요:')
  console.error('   REPLICATE_API_TOKEN=your_token_here\n')
  process.exit(1)
}

console.log('🚀 이미지 생성 시작...\n')
console.log('⏱️  진행률 표시: 매 10개마다 업데이트\n')

// 이미지 생성 시작
generateWordImagesBatch(wordsToGenerate, {
  aspectRatio: '9:16',
  outputFormat: 'jpg',
  outputQuality: 90,
})
  .then((results) => {
    const successCount = results.filter(r => r.length > 0).length
    const failCount = results.filter(r => r.length === 0).length

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 창세기 1장 2-31절 이미지 생성 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

결과:
✅ 성공: ${successCount}개
❌ 실패: ${failCount}개
📁 저장 위치: public/images/words/

다음 단계:
1. 이미지 압축: npx tsx scripts/images/compressWordImages.ts
2. Supabase 업로드: npx tsx scripts/images/uploadWordImages.ts
3. 브라우저에서 확인: http://localhost:5173

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  })
  .catch((error) => {
    console.error('\n❌ 오류 발생:', error)
    console.error('\n중단된 시점까지 생성된 이미지는 저장되었습니다.')
    console.error('스크립트를 다시 실행하면 이미 생성된 이미지는 건너뜁니다.\n')
    process.exit(1)
  })
