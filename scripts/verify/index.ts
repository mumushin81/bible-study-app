/**
 * 통합 검증 도구
 *
 * 중복, 누락, 품질 검사를 한 번에 실행합니다.
 *
 * 사용법:
 *   tsx scripts/verify/index.ts [bookId]
 *
 * 예시:
 *   tsx scripts/verify/index.ts          # 모든 책 검사
 *   tsx scripts/verify/index.ts genesis  # 창세기만 검사
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { log } from '../utils/logger'

const execAsync = promisify(exec)

async function runCheck(command: string, description: string) {
  log.step(description)
  try {
    const { stdout, stderr } = await execAsync(command)
    console.log(stdout)
    if (stderr) console.error(stderr)
    return true
  } catch (error: any) {
    log.error(`${description} 실패: ${error.message}`)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  const bookId = args[0] || ''

  log.step('🔍 통합 데이터 검증 시작')

  // 1. 중복 검사
  await runCheck(
    `tsx scripts/verify/checkDuplicates.ts ${bookId}`,
    '1️⃣ 중복 구절 검사'
  )

  // 2. 누락 검사
  await runCheck(
    `tsx scripts/verify/checkMissing.ts ${bookId}`,
    '2️⃣ 누락 구절 검사'
  )

  log.step('✅ 검증 완료')
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  process.exit(1)
})
