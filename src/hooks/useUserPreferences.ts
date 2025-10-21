import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

interface UserPreferences {
  show_hebrew_hint?: boolean
  dark_mode?: boolean
  font_size?: 'small' | 'medium' | 'large'
}

const PREFERENCES_KEY = 'user_preferences'

export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (stored) {
        setPreferences(JSON.parse(stored))
      } else {
        setPreferences({})
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      setPreferences({})
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const newPreferences = {
        ...preferences,
        ...updates,
      }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences))
      setPreferences(newPreferences)
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  return {
    preferences,
    updatePreferences,
    loading,
  }
}
