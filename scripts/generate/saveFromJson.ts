#!/usr/bin/env node

/**
 * JSON 파일에서 생성된 구절 컨텐츠를 Supabase에 저장
 *
 * 사용법:
 *   npm run save:content <json_file_path> [--force]
 *
 * 예시:
 *   npm run save:content data/generated/genesis_2_1234567890.json
 *   npm run save:content data/generated/genesis_2_1234567890.json --force
 */

import { readFileSync, existsSync } from 'fs'
import { log } from '../utils/logger.js'
import type { GeneratedContent } from './types.js'
import { validateContent, printValidationResult } from './validateContent.js'
import { saveToDatabase } from './saveToDatabase.js'

/**
 * JSON 파일 읽기
 */
function loadJsonFile(filepath: string): GeneratedContent[] {
  if (!existsSync(filepath)) {
    log.error(`파일을 찾을 수 없습니다: ${filepath}`)
    process.exit(1)
  }

  const content = readFileSync(filepath, 'utf-8')

  try {
    const data = JSON.parse(content)

    // 단일 객체를 배열로 변환
    return Array.isArray(data) ? data : [data]
  } catch (error: any) {
    log.error(`JSON 파싱 실패: ${error.message}`)
    process.exit(1)
  }
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2)

  // 도움말
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
💾 생성된 구절 컨텐츠를 Supabase에 저장

사용법:
  npm run save:content <json_file_path> [--force]

예시:
  npm run save:content data/generated/genesis_2_1234567890.json
  npm run save:content data/generated/genesis_2_1234567890.json --force

옵션:
  --force    기존 컨텐츠를 덮어씁니다 (기본: 건너뜀)

JSON 형식:
  단일 구절:
  {
    "verseId": "genesis_2_4",
    "ipa": "...",
    "koreanPronunciation": "...",
    "modern": "...",
    "words": [...],
    "commentary": {...}
  }

  여러 구절:
  [
    { "verseId": "genesis_2_4", ... },
    { "verseId": "genesis_2_5", ... }
  ]
    `)
    process.exit(0)
  }

  const filepath = args[0]
  const force = args.includes('--force')

  try {
    log.step('구절 컨텐츠 저장 시작')
    log.info(`파일: ${filepath}`)
    log.info(`덮어쓰기 모드: ${force ? '예' : '아니오'}`)

    // JSON 파일 로드
    const verses = loadJsonFile(filepath)
    log.success(`${verses.length}개 구절 데이터 로드 완료\n`)

    // 각 구절 처리
    let successCount = 0
    let failureCount = 0

    for (let i = 0; i < verses.length; i++) {
      const verseData = verses[i]
      const { verseId } = verseData

      log.step(`[${i + 1}/${verses.length}] ${verseId} 처리 중...`)

      try {
        // 1. 검증
        const validation = validateContent(verseData)
        printValidationResult(verseId, validation)

        if (!validation.isValid) {
          log.warn('검증 실패로 인해 저장하지 않습니다')
          failureCount++
          continue
        }

        if (validation.warnings.length > 0 && !force) {
          log.warn('경고가 있지만 저장을 진행합니다')
        }

        // 2. DB 저장
        const saved = await saveToDatabase(verseData)

        if (saved) {
          successCount++
        } else {
          failureCount++
        }
      } catch (error: any) {
        log.error(`오류 발생: ${error.message}`)
        failureCount++
      }

      console.log('') // 빈 줄
    }

    // 최종 리포트
    log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    log.step('최종 결과')
    log.success(`✅ 성공: ${successCount}/${verses.length}`)
    if (failureCount > 0) {
      log.error(`❌ 실패: ${failureCount}/${verses.length}`)
    }
    log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    process.exit(failureCount > 0 ? 1 : 0)
  } catch (err: any) {
    log.error(`실행 중 오류 발생: ${err.message}`)
    process.exit(1)
  }
}

// 실행
main()
