import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Tables } from '../lib/database.types';

export type BookProgress = Tables<'user_book_progress'>;

export interface BookProgressStats {
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  progressPercentage: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  lastStudiedAt: Date | null;
}

export function useBookProgress(bookId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<BookProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !bookId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    fetchProgress();
  }, [user?.id, bookId]);

  const fetchProgress = async () => {
    if (!user || !bookId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_book_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      setProgress(data);
    } catch (err) {
      console.error('[useBookProgress] Error fetching progress:', err);
      setError(err as Error);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<BookProgress>) => {
    if (!user || !bookId) return;

    try {
      const { data, error: updateError } = await supabase
        .from('user_book_progress')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          ...updates,
        })
        .select()
        .single();

      if (updateError) throw updateError;

      setProgress(data);
      return data;
    } catch (err) {
      console.error('[useBookProgress] Error updating progress:', err);
      throw err;
    }
  };

  const incrementStreak = async () => {
    if (!progress) return;

    const today = new Date();
    const lastStudied = progress.last_studied_at
      ? new Date(progress.last_studied_at)
      : null;

    let newStreak = progress.current_streak || 0;

    if (lastStudied) {
      const daysDiff = Math.floor(
        (today.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // 연속 학습
        newStreak += 1;
      } else if (daysDiff > 1) {
        // 연속 끊김
        newStreak = 1;
      }
      // daysDiff === 0이면 오늘 이미 학습함 (streak 유지)
    } else {
      // 첫 학습
      newStreak = 1;
    }

    const longestStreak = Math.max(
      newStreak,
      progress.longest_streak || 0
    );

    return updateProgress({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_studied_at: today.toISOString(),
    });
  };

  const updateStats = async (stats: {
    learnedWords?: number;
    masteredWords?: number;
  }) => {
    if (!progress) {
      // 진도 데이터가 없으면 새로 생성
      const totalWords = await getTotalWordsInBook(bookId || '');

      return updateProgress({
        total_words: totalWords,
        learned_words: stats.learnedWords || 0,
        mastered_words: stats.masteredWords || 0,
        progress_percentage: totalWords > 0
          ? ((stats.learnedWords || 0) / totalWords) * 100
          : 0,
      });
    }

    const totalWords = progress.total_words || 0;
    const learnedWords = stats.learnedWords ?? (progress.learned_words || 0);
    const progressPercentage = totalWords > 0
      ? (learnedWords / totalWords) * 100
      : 0;

    return updateProgress({
      learned_words: learnedWords,
      mastered_words: stats.masteredWords ?? progress.mastered_words,
      progress_percentage: progressPercentage,
    });
  };

  return {
    progress,
    loading,
    error,
    updateProgress,
    incrementStreak,
    updateStats,
    refetch: fetchProgress,
  };
}

/**
 * 모든 책의 진도 가져오기
 */
export function useAllBookProgress() {
  const { user } = useAuth();
  const [allProgress, setAllProgress] = useState<BookProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAllProgress([]);
      setLoading(false);
      return;
    }

    fetchAllProgress();
  }, [user?.id]);

  const fetchAllProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_book_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_studied_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      setAllProgress(data || []);
    } catch (err) {
      console.error('[useAllBookProgress] Error:', err);
      setAllProgress([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    allProgress,
    loading,
    refetch: fetchAllProgress,
  };
}

/**
 * 책의 총 단어 수 계산 (헬퍼 함수)
 */
async function getTotalWordsInBook(bookId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('words')
      .select('hebrew', { count: 'exact', head: true })
      .eq('verses.book_id', bookId);

    if (error) {
      console.error('[getTotalWordsInBook] Error:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('[getTotalWordsInBook] Error:', err);
    return 0;
  }
}
