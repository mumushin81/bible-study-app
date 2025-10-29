/**
 * HebrewRootsContext
 *
 * Purpose: Cache hebrew_roots data globally to avoid redundant fetching
 * in useVerses and useWords hooks.
 *
 * Performance Impact:
 * - BEFORE: Fetched entire hebrew_roots table on every verse/word query
 * - AFTER: Fetch once on app load, reuse across all components
 *
 * Usage:
 * 1. Wrap App with <HebrewRootsProvider>
 * 2. Use useHebrewRoots() hook in useVerses/useWords
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { RootEtymology } from '../types'

interface HebrewRootsContextValue {
  rootsMap: Map<string, RootEtymology>
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const HebrewRootsContext = createContext<HebrewRootsContextValue | undefined>(undefined)

export function HebrewRootsProvider({ children }: { children: React.ReactNode }) {
  const [roots, setRoots] = useState<RootEtymology[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoots = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('hebrew_roots')
        .select('root, root_hebrew, story, emoji, core_meaning, core_meaning_korean')

      if (fetchError) throw fetchError

      setRoots(data || [])
      console.log(`✅ Loaded ${data?.length || 0} Hebrew roots into cache`)
    } catch (err) {
      console.error('❌ Failed to fetch Hebrew roots:', err)
      setError(err as Error)
      setRoots([]) // Fail gracefully
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoots()
  }, [])

  // Create Map for O(1) lookups
  // Memoize to avoid recreating on every render
  const rootsMap = useMemo(() => {
    const map = new Map<string, RootEtymology>()
    roots.forEach(root => {
      // Index by both hyphenated and non-hyphenated forms
      map.set(root.root_hebrew, root) // ברא
      map.set(root.root, root)         // ב-ר-א
    })
    return map
  }, [roots])

  const value: HebrewRootsContextValue = {
    rootsMap,
    loading,
    error,
    refetch: fetchRoots,
  }

  return (
    <HebrewRootsContext.Provider value={value}>
      {children}
    </HebrewRootsContext.Provider>
  )
}

/**
 * Hook to access Hebrew roots cache
 *
 * @returns {HebrewRootsContextValue} Cached roots map and status
 * @throws {Error} If used outside HebrewRootsProvider
 */
export function useHebrewRoots(): HebrewRootsContextValue {
  const context = useContext(HebrewRootsContext)

  if (context === undefined) {
    throw new Error('useHebrewRoots must be used within HebrewRootsProvider')
  }

  return context
}

/**
 * Optional: Hook to get a specific root by hebrew text
 *
 * @param rootHebrew - Hebrew root (with or without hyphens)
 * @returns {RootEtymology | undefined} The root etymology if found
 */
export function useHebrewRoot(rootHebrew: string): RootEtymology | undefined {
  const { rootsMap } = useHebrewRoots()
  return rootsMap.get(rootHebrew)
}
