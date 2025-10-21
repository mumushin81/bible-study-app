import { useUserProgressBase } from './useUserProgressBase'

/**
 * Realtime User Progress 훅 (Realtime + 낙관적 업데이트)
 * useUserProgressBase를 사용하여 중복 코드 제거
 */
export function useUserProgressRealtime(verseId: string) {
  return useUserProgressBase(verseId, {
    realtime: true,
    optimisticUpdates: true
  })
}
