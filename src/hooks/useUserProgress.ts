import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { Database } from '../lib/database.types'

type UserProgress = Database['public']['Tables']['user_progress']['Row']

export function useUserProgress(verseId: string) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

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

    fetchProgress()
  }, [user, verseId])

  const markAsCompleted = async () => {
    if (!user) return null

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
      return null
    }

    setProgress(data)
    return data
  }

  const incrementReviewCount = async () => {
    if (!user) return null

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
      return null
    }

    setProgress(data)
    return data
  }

  return {
    progress,
    loading,
    markAsCompleted,
    incrementReviewCount,
  }
}
