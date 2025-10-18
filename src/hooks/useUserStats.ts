import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UserStats {
  total_verses_studied: number
  total_verses_completed: number
  total_reviews: number
  total_quizzes_taken: number
  total_quizzes_correct: number
  total_favorites: number
  total_notes: number
}

export function useUserStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setStats(null)
      setLoading(false)
      return
    }

    async function fetchStats() {
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_uuid: user!.id,
      })

      if (error) {
        console.error('Error fetching user stats:', error)
      } else if (data) {
        setStats(data as unknown as UserStats)
      }

      setLoading(false)
    }

    fetchStats()
  }, [user])

  return { stats, loading }
}
