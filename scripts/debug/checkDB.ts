/**
 * 데이터베이스 상태 확인
 */

import { createSupabaseClient } from '../utils/supabase'
import { log } from '../utils/logger'

async function main() {
  const supabase = createSupabaseClient()

  // Genesis 전체 통계
  log.step('📊 Genesis 데이터베이스 상태')

  const { data: stats, error: statsError } = await supabase
    .from('verses')
    .select('id, chapter, verse_number, hebrew')
    .eq('book_id', 'genesis')

  if (statsError) {
    log.error(`통계 조회 실패: ${statsError.message}`)
    return
  }

  const totalVerses = stats?.length || 0
  const uniqueIds = new Set(stats?.map(v => v.id)).size
  const uniqueHebrew = new Set(stats?.map(v => v.hebrew)).size
  const chapters = new Set(stats?.map(v => v.chapter))

  log.info(`총 구절 (rows): ${totalVerses}`)
  log.info(`고유 ID: ${uniqueIds}`)
  log.info(`고유 히브리어 텍스트: ${uniqueHebrew}`)
  log.info(`장 범위: ${Math.min(...chapters)} ~ ${Math.max(...chapters)}`)

  // 장별 구절 수
  const chapterCounts: Record<number, number> = {}
  stats?.forEach(v => {
    chapterCounts[v.chapter] = (chapterCounts[v.chapter] || 0) + 1
  })

  log.step('\n📖 장별 구절 수')
  Object.entries(chapterCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .slice(0, 10)
    .forEach(([chapter, count]) => {
      log.info(`  창세기 ${chapter}장: ${count}개`)
    })

  // ID 중복 확인
  const idCounts: Record<string, number> = {}
  stats?.forEach(v => {
    idCounts[v.id] = (idCounts[v.id] || 0) + 1
  })

  const duplicateIds = Object.entries(idCounts).filter(([_, count]) => count > 1)
  if (duplicateIds.length > 0) {
    log.step('\n⚠️  ID 중복 발견')
    duplicateIds.slice(0, 5).forEach(([id, count]) => {
      log.warn(`  ${id}: ${count}회`)
    })
  }
}

main()
