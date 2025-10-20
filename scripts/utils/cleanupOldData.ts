/**
 * 구 형식 데이터 정리
 *
 * genesis1-1 형식의 구 데이터를 삭제하고
 * genesis_1_1 형식의 신 데이터만 유지합니다.
 */

import { createSupabaseClient } from './supabase'
import { log } from './logger'

async function main() {
  const supabase = createSupabaseClient()

  log.step('🧹 구 형식 데이터 정리 시작')

  // 구 형식 패턴: genesis1-1, genesis1-2, ...
  // 신 형식 패턴: genesis_1_1, genesis_1_2, ...

  // 먼저 확인
  const { data: oldData, error: checkError } = await supabase
    .from('verses')
    .select('id')
    .like('id', '%-%')

  if (checkError) {
    log.error(`확인 실패: ${checkError.message}`)
    return
  }

  log.info(`구 형식 데이터: ${oldData?.length || 0}개`)

  if (!oldData || oldData.length === 0) {
    log.success('정리할 데이터가 없습니다.')
    return
  }

  // 사용자 확인
  console.log('\n⚠️  경고: 다음 데이터가 삭제됩니다:')
  console.log(`   - 구 형식 (하이픈): ${oldData.length}개 구절`)
  console.log(`   - 예시: ${oldData.slice(0, 5).map(v => v.id).join(', ')}`)
  console.log('\n계속하려면 "yes"를 입력하세요:')

  // Node.js readline 대신 간단하게 처리
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('', async (answer: string) => {
    rl.close()

    if (answer.toLowerCase() !== 'yes') {
      log.info('취소되었습니다.')
      return
    }

    log.step('🗑️  구 형식 데이터 삭제 중...')

    const { error: deleteError } = await supabase
      .from('verses')
      .delete()
      .like('id', '%-%')

    if (deleteError) {
      log.error(`삭제 실패: ${deleteError.message}`)
      return
    }

    log.success(`✅ ${oldData.length}개 구 형식 데이터 삭제 완료!`)

    // 확인
    const { data: remaining, error: verifyError } = await supabase
      .from('verses')
      .select('id')
      .eq('book_id', 'genesis')

    if (!verifyError) {
      log.info(`남은 데이터: ${remaining?.length || 0}개`)
    }
  })
}

main()
