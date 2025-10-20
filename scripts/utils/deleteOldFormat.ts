/**
 * 구 형식 데이터 삭제 (하이픈 형식)
 */

import { createSupabaseClient } from './supabase'
import { log } from './logger'

async function main() {
  const supabase = createSupabaseClient()

  log.step('🧹 구 형식 데이터 삭제')

  // 구 형식 확인
  const { data: oldData } = await supabase
    .from('verses')
    .select('id')
    .like('id', '%-%')

  log.info(`구 형식 데이터: ${oldData?.length || 0}개`)

  if (!oldData || oldData.length === 0) {
    log.success('정리할 데이터가 없습니다.')
    return
  }

  log.info(`예시: ${oldData.slice(0, 5).map(v => v.id).join(', ')}`)

  // 삭제
  const { error } = await supabase
    .from('verses')
    .delete()
    .like('id', '%-%')

  if (error) {
    log.error(`삭제 실패: ${error.message}`)
    return
  }

  log.success(`✅ ${oldData.length}개 구 형식 데이터 삭제 완료!`)

  // 확인
  const { data: remaining } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')

  log.info(`남은 Genesis 데이터: ${remaining?.length || 0}개`)
}

main()
