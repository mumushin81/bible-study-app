import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type HebrewRoot = Tables<'hebrew_roots'>;
export type WordDerivation = Tables<'word_derivations'>;

interface UseHebrewRootsOptions {
  bookId?: string;
  importance?: number; // 최소 중요도 (1-5)
}

export function useHebrewRoots(options?: UseHebrewRootsOptions) {
  const [roots, setRoots] = useState<HebrewRoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchRoots();
  }, [options?.bookId, options?.importance]);

  const fetchRoots = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('hebrew_roots').select('*');

      // 중요도 필터
      if (options?.importance) {
        query = query.gte('importance', options.importance);
      }

      // 정렬: 중요도 → 빈도수
      query = query.order('importance', { ascending: false });
      query = query.order('frequency', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRoots(data || []);
    } catch (err) {
      console.error('[useHebrewRoots] Error:', err);
      setError(err as Error);
      setRoots([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    roots,
    loading,
    error,
    refetch: fetchRoots,
  };
}

/**
 * 특정 어근과 관련된 파생 단어들 가져오기
 */
export function useRootDerivations(rootId: string | null) {
  const [derivations, setDerivations] = useState<Array<WordDerivation & { word: any }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!rootId) {
      setDerivations([]);
      setLoading(false);
      return;
    }

    fetchDerivations();
  }, [rootId]);

  const fetchDerivations = async () => {
    if (!rootId) return;

    try {
      setLoading(true);
      setError(null);

      // word_derivations와 words를 조인하여 가져오기
      const { data, error: fetchError } = await supabase
        .from('word_derivations')
        .select(`
          *,
          word:word_id (
            id,
            hebrew,
            meaning,
            korean,
            ipa,
            grammar,
            letters,
            root,
            icon_svg,
            verse_id,
            position,
            emoji,
            category
          )
        `)
        .eq('root_id', rootId);

      if (fetchError) throw fetchError;

      setDerivations(data as any || []);
    } catch (err) {
      console.error('[useRootDerivations] Error:', err);
      setError(err as Error);
      setDerivations([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    derivations,
    loading,
    error,
    refetch: fetchDerivations,
  };
}

/**
 * 어근의 통계 정보 가져오기
 */
export function useRootStats(rootId: string | null) {
  const [derivedWordCount, setDerivedWordCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rootId) {
      setDerivedWordCount(0);
      setLoading(false);
      return;
    }

    fetchStats();
  }, [rootId]);

  const fetchStats = async () => {
    if (!rootId) return;

    try {
      setLoading(true);

      // get_derived_word_count 함수 호출
      const { data, error } = await supabase
        .rpc('get_derived_word_count', { p_root_id: rootId });

      if (error) throw error;

      setDerivedWordCount(data || 0);
    } catch (err) {
      console.error('[useRootStats] Error:', err);
      setDerivedWordCount(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    derivedWordCount,
    loading,
    refetch: fetchStats,
  };
}
