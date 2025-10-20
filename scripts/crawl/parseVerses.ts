/**
 * 마크다운에서 히브리어 구절 추출
 */

import { log } from '../utils/logger'

export interface ParsedVerse {
  verseNumber: number
  hebrew: string
}

/**
 * 마크다운에서 구절 추출
 *
 * Firecrawl은 마크다운 테이블 형식으로 반환:
 * | **א** בְּרֵאשִׁית, בָּרָא... | **1** In the beginning... |
 */
export function parseVerses(markdown: string): ParsedVerse[] {
  const verses: ParsedVerse[] = []

  // 줄 단위로 분리
  const lines = markdown.split('\n')

  // 히브리어 숫자 매핑 (א=1, ב=2, ...)
  const hebrewNumbers: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
    'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
    'יא': 11, 'יב': 12, 'יג': 13, 'יד': 14, 'טו': 15,
    'טז': 16, 'יז': 17, 'יח': 18, 'יט': 19, 'כ': 20,
    'כא': 21, 'כב': 22, 'כג': 23, 'כד': 24, 'כה': 25,
    'כו': 26, 'כז': 27, 'כח': 28, 'כט': 29, 'ל': 30,
    'לא': 31, 'לב': 32, 'לג': 33, 'לד': 34, 'לה': 35,
    'לו': 36, 'לז': 37, 'לח': 38, 'לט': 39, 'מ': 40,
    'מא': 41, 'מב': 42, 'מג': 43, 'מד': 44, 'מה': 45,
    'מו': 46, 'מז': 47, 'מח': 48, 'מט': 49, 'נ': 50
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.startsWith('|')) continue

    // 마크다운 테이블 행 파싱
    // 예: | **א** בְּרֵאשִׁית, בָּרָא אֱלֹהִים... | **1** In the beginning... |
    const tablePattern = /^\|\s*\*\*([א-ת]{1,2})\*\*\s+([\u0590-\u05FF\s,;:.\-–—()]+?)\s*\|\s*\*\*(\d+)\*\*/
    const match = trimmed.match(tablePattern)

    if (match) {
      const hebrewNum = match[1]
      const hebrewText = match[2].trim()
      const arabicNum = parseInt(match[3])

      // 히브리어 숫자를 아라비아 숫자로 변환하여 검증
      const expectedNum = hebrewNumbers[hebrewNum]

      if (expectedNum === arabicNum && hebrewText) {
        // 링크 제거 (예: [{פ}](https://...))
        const cleanText = hebrewText.replace(/\[{[^}]+}\]\([^)]+\)/g, '').trim()

        verses.push({
          verseNumber: arabicNum,
          hebrew: cleanText
        })
      }
    }
  }

  log.info(`추출된 구절: ${verses.length}개`)
  return verses
}
