/**
 * 데이터베이스와 동기화되지 않은 로컬 구절 파일 삭제
 *
 * 안전을 위해:
 * 1. 백업 생성
 * 2. 삭제 전 확인
 * 3. 삭제 후 보고
 */

import { log } from '../utils/logger'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const deleteListPath = 'data/files_to_delete.txt'

  if (!fs.existsSync(deleteListPath)) {
    log.error(`삭제 목록 파일이 없습니다: ${deleteListPath}`)
    log.info('먼저 다음 명령을 실행하세요:')
    log.info('  npx tsx scripts/cleanup/findUnsyncedFiles.ts')
    return
  }

  // 1. 삭제할 파일 목록 읽기
  const filesToDelete = fs.readFileSync(deleteListPath, 'utf-8')
    .split('\n')
    .filter(line => line.trim().length > 0)

  log.step(`🗑️  ${filesToDelete.length}개 파일 삭제 준비`)

  if (filesToDelete.length === 0) {
    log.info('삭제할 파일이 없습니다.')
    return
  }

  // 2. 백업 디렉토리 생성
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backupDir = `data/backup_before_cleanup_${timestamp}`

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  log.step(`📦 백업 생성: ${backupDir}`)

  // 3. 백업 및 삭제
  let backedUp = 0
  let deleted = 0
  let notFound = 0

  for (const filePath of filesToDelete) {
    if (!fs.existsSync(filePath)) {
      log.warn(`파일이 존재하지 않음: ${filePath}`)
      notFound++
      continue
    }

    try {
      // 백업
      const fileName = path.basename(filePath)
      const sourceDir = path.dirname(filePath).split('/').pop() // generated or generated_v2
      const backupPath = path.join(backupDir, sourceDir || '', fileName)
      const backupDirPath = path.dirname(backupPath)

      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true })
      }

      fs.copyFileSync(filePath, backupPath)
      backedUp++

      // 삭제
      fs.unlinkSync(filePath)
      deleted++

      console.log(`✓ ${filePath}`)
    } catch (error: any) {
      log.error(`파일 처리 실패 (${filePath}): ${error.message}`)
    }
  }

  // 4. 결과 보고
  log.step('\n📊 삭제 완료')
  console.log(`백업: ${backedUp}개`)
  console.log(`삭제: ${deleted}개`)
  if (notFound > 0) {
    console.log(`찾을 수 없음: ${notFound}개`)
  }

  log.success(`\n✅ 백업 위치: ${backupDir}`)

  // 5. 삭제 목록 파일도 백업 폴더로 이동
  const deleteListBackupPath = path.join(backupDir, 'files_deleted.txt')
  fs.copyFileSync(deleteListPath, deleteListBackupPath)
  fs.unlinkSync(deleteListPath)

  log.info(`삭제 목록 저장: ${deleteListBackupPath}`)

  // 6. 남은 파일 수 확인
  const remainingGenerated = fs.readdirSync('data/generated')
    .filter(f => f.endsWith('.json') && f.startsWith('genesis_'))
  const remainingGeneratedV2 = fs.readdirSync('data/generated_v2')
    .filter(f => f.endsWith('.json') && f.startsWith('genesis_'))

  console.log(`\n📁 남은 파일:`)
  console.log(`  data/generated: ${remainingGenerated.length}개`)
  console.log(`  data/generated_v2: ${remainingGeneratedV2.length}개`)
}

main().catch(error => {
  log.error(`치명적 에러: ${error.message}`)
  console.error(error)
  process.exit(1)
})
