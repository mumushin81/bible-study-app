/**
 * 창세기 1:1 데이터를 읽어오는 헬퍼 모듈
 */

import { readFileSync } from 'fs'
import { join } from 'path'

interface WordData {
  hebrew: string
  meaning: string
  ipa: string
  korean: string
  letters?: string
  root?: string
  grammar?: string
}

interface Genesis1_1Data {
  id: string
  reference: string
  hebrew: string
  words: WordData[]
}

/**
 * 창세기 1:1 데이터 읽기
 */
export function readGenesis1_1(): Genesis1_1Data {
  const filepath = join(process.cwd(), 'data', 'unified_verses', 'genesis_1_1.json')
  const content = readFileSync(filepath, 'utf-8')
  return JSON.parse(content)
}

/**
 * 창세기 1:1의 7개 단어 추출
 */
export const genesis1_1Words = readGenesis1_1().words.map(word => ({
  hebrew: word.hebrew,
  meaning: word.meaning,
  korean: word.korean,
  ipa: word.ipa,
  context: `창세기 1:1 - 태초에 하나님이 천지를 창조하시니라`
}))

// 단어 목록 출력 (디버깅용)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('📖 창세기 1:1 단어 목록:\n')
  genesis1_1Words.forEach((word, i) => {
    console.log(`${i + 1}. ${word.hebrew} (${word.korean}) - ${word.meaning}`)
  })
  console.log(`\n총 ${genesis1_1Words.length}개 단어`)
}
