#!/usr/bin/env node
/**
 * 성경 데이터베이스 통합 CLI 도구
 *
 * 크롤링, 검증, 컨텐츠 생성을 하나의 명령어로 실행합니다.
 *
 * 사용법:
 *   npm run bible <command> [options]
 *
 * 명령어:
 *   init-books              - Books 테이블 초기화
 *   crawl <bookId> [start] [end]  - 히브리어 원문 크롤링
 *   verify [bookId]         - 데이터 검증 (중복/누락)
 *   help                    - 도움말
 *
 * 예시:
 *   npm run bible init-books
 *   npm run bible crawl genesis
 *   npm run bible crawl genesis 1 10
 *   npm run bible verify
 *   npm run bible verify genesis
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const COMMANDS = {
  'init-books': {
    description: 'Books 테이블 초기화 (Torah 5권)',
    usage: 'npm run bible init-books',
    script: 'tsx scripts/crawl/initBooks.ts'
  },
  'crawl': {
    description: '히브리어 원문 크롤링',
    usage: 'npm run bible crawl <bookId> [startChapter] [endChapter]',
    examples: [
      'npm run bible crawl genesis',
      'npm run bible crawl genesis 1',
      'npm run bible crawl genesis 1 10'
    ],
    script: 'tsx scripts/crawl/index.ts'
  },
  'verify': {
    description: '데이터 검증 (중복/누락 검사)',
    usage: 'npm run bible verify [bookId]',
    examples: [
      'npm run bible verify',
      'npm run bible verify genesis'
    ],
    script: 'tsx scripts/verify/index.ts'
  },
  'help': {
    description: '도움말 표시',
    usage: 'npm run bible help'
  }
}

function showHelp() {
  console.log('📖 성경 데이터베이스 통합 CLI 도구\n')
  console.log('사용 가능한 명령어:\n')

  Object.entries(COMMANDS).forEach(([cmd, info]) => {
    console.log(`  ${cmd}`)
    console.log(`    ${info.description}`)
    console.log(`    사용법: ${info.usage}`)
    if (info.examples) {
      console.log(`    예시:`)
      info.examples.forEach(ex => console.log(`      ${ex}`))
    }
    console.log()
  })
}

async function runCommand(command: string, args: string[]) {
  const cmd = COMMANDS[command as keyof typeof COMMANDS]

  if (!cmd || !cmd.script) {
    console.error(`❌ 알 수 없는 명령어: ${command}`)
    console.log(`💡 'npm run bible help'로 도움말을 확인하세요.\n`)
    showHelp()
    process.exit(1)
  }

  const fullCommand = `${cmd.script} ${args.join(' ')}`
  console.log(`🔄 실행: ${fullCommand}\n`)

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      maxBuffer: 10 * 1024 * 1024 // 10MB
    })
    console.log(stdout)
    if (stderr) console.error(stderr)
  } catch (error: any) {
    console.error(`❌ 명령어 실행 실패: ${error.message}`)
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === 'help') {
    showHelp()
    return
  }

  const command = args[0]
  const commandArgs = args.slice(1)

  await runCommand(command, commandArgs)
}

main()
