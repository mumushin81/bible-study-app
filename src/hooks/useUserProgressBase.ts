import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { Database } from '../lib/database.types'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from '../lib/toast'

type UserProgress = Database['public']['Tables']['user_progress']['Row']

interface UseUserProgressOptions {
  realtime?: boolean
  optimisticUpdates?: boolean
}

/**
 * 공통 User Progress 훅
 * useUserProgress와 useUserProgressRealtime의 중복 코드를 통합
 */
export function useUserProgressBase(verseId: string, options: UseUserProgressOptions = {}) {
  const { realtime = false, optimisticUpdates = false } = options
  const { user } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!user) {
      setProgress(null)
      setLoading(false)
      return
    }

    async function fetchProgress() {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('verse_id', verseId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching progress:', error)
      }

      setProgress(data)
      setLoading(false)
    }

    // 초기 데이터 로드
    fetchProgress()

    // Realtime 구독 (옵션)
    if (realtime) {
      const channel: RealtimeChannel = supabase
        .channel(`user_progress:${user.id}:${verseId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_progress',
            filter: `user_id=eq.${user.id},verse_id=eq.${verseId}`
          },
          (payload) => {
            console.log('📡 Realtime progress update:', payload)

            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setProgress(payload.new as UserProgress)
            } else if (payload.eventType === 'DELETE') {
              setProgress(null)
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
        })

      return () => {
        console.log('Unsubscribing from realtime channel')
        supabase.removeChannel(channel)
      }
    }
  }, [user, verseId, realtime])

  const markAsCompleted = async () => {
    if (!user) return null

    // 낙관적 업데이트 (옵션)
    if (optimisticUpdates) {
      const optimisticData: UserProgress = {
        id: progress?.id || crypto.randomUUID(),
        user_id: user.id,
        verse_id: verseId,
        completed: true,
        completed_at: new Date().toISOString(),
        review_count: (progress?.review_count || 0) + 1,
        last_reviewed_at: new Date().toISOString(),
        created_at: progress?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProgress(optimisticData)
      setIsPending(true)
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            verse_id: verseId,
            completed: true,
            completed_at: new Date().toISOString(),
            review_count: (progress?.review_count || 0) + 1,
            last_reviewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,verse_id',
          }
        )
        .select()
        .single()

      if (error) {
        console.error('Error marking as completed:', error)
        toast.error('진행도를 저장할 수 없습니다')
        // 실패 시 롤백 (낙관적 업데이트 사용 시)
        if (optimisticUpdates) {
          setProgress(progress)
        }
        return null
      }

      setProgress(data)
      return data
    } finally {
      if (optimisticUpdates) {
        setIsPending(false)
      }
    }
  }

  const incrementReviewCount = async () => {
    if (!user) return null

    // 낙관적 업데이트 (옵션)
    if (optimisticUpdates && progress) {
      const optimisticData: UserProgress = {
        ...progress,
        review_count: (progress.review_count || 0) + 1,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProgress(optimisticData)
      setIsPending(true)
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            verse_id: verseId,
            review_count: (progress?.review_count || 0) + 1,
            last_reviewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,verse_id',
          }
        )
        .select()
        .single()

      if (error) {
        console.error('Error incrementing review count:', error)
        toast.error('복습 횟수를 업데이트할 수 없습니다')
        // 실패 시 롤백 (낙관적 업데이트 사용 시)
        if (optimisticUpdates) {
          setProgress(progress)
        }
        return null
      }

      setProgress(data)
      return data
    } finally {
      if (optimisticUpdates) {
        setIsPending(false)
      }
    }
  }

  return {
    progress,
    loading,
    isPending,
    markAsCompleted,
    incrementReviewCount,
  }
}
