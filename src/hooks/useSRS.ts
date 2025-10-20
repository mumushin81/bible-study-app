import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface SRSData {
  wordHebrew: string;
  nextReview: Date;
  interval: number; // 일 단위
  easeFactor: number;
  reviewCount: number;
}

interface SerializedSRSData {
  wordHebrew: string;
  nextReview: string; // ISO string
  interval: number;
  easeFactor: number;
  reviewCount: number;
}

/**
 * SRS (Spaced Repetition System) 관리 Hook (Supabase + localStorage 하이브리드)
 *
 * Quality levels:
 * - 0: 모르겠어요 (틀림)
 * - 1: 애매해요 (어렴풋이 기억)
 * - 2: 알고있어요 (정확히 기억)
 *
 * - Primary: Supabase (기기 간 동기화)
 * - Fallback: localStorage (오프라인 캐시)
 */
export function useSRS() {
  const { user } = useAuth();
  const [srsData, setSrsData] = useState<Map<string, SRSData>>(new Map());
  const [loading, setLoading] = useState(true);

  // localStorage 키
  const STORAGE_KEY = `srsData_${user?.id || 'guest'}`;

  // localStorage에서 로드
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Record<string, SerializedSRSData> = JSON.parse(saved);
        const srsMap = new Map<string, SRSData>();
        Object.entries(parsed).forEach(([key, value]) => {
          srsMap.set(key, {
            ...value,
            nextReview: new Date(value.nextReview),
          });
        });
        return srsMap;
      }
    } catch (error) {
      console.error('[useSRS] Failed to load from localStorage:', error);
    }
    return new Map<string, SRSData>();
  };

  // localStorage에 저장
  const saveToLocalStorage = (data: Map<string, SRSData>) => {
    try {
      const srsObject: Record<string, SerializedSRSData> = {};
      data.forEach((value, key) => {
        srsObject[key] = {
          ...value,
          nextReview: value.nextReview.toISOString(),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(srsObject));
    } catch (error) {
      console.error('[useSRS] Failed to save to localStorage:', error);
    }
  };

  // Supabase에서 로드
  const loadFromSupabase = async () => {
    if (!user) return new Map<string, SRSData>();

    try {
      const { data, error } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const srsMap = new Map<string, SRSData>();
      data?.forEach((row) => {
        srsMap.set(row.word_hebrew, {
          wordHebrew: row.word_hebrew,
          nextReview: new Date(row.next_review),
          interval: row.interval_days,
          easeFactor: row.ease_factor,
          reviewCount: row.review_count,
        });
      });

      return srsMap;
    } catch (error) {
      console.error('[useSRS] Failed to load from Supabase:', error);
      return new Map<string, SRSData>();
    }
  };

  // 초기 로드
  useEffect(() => {
    async function initialize() {
      setLoading(true);

      if (user) {
        // 로그인 사용자: Supabase에서 로드
        const supabaseSRS = await loadFromSupabase();
        setSrsData(supabaseSRS);
        saveToLocalStorage(supabaseSRS);
      } else {
        // 게스트: localStorage에서 로드
        const localSRS = loadFromLocalStorage();
        setSrsData(localSRS);
      }

      setLoading(false);
    }

    initialize();
  }, [user?.id]);

  // SRS 업데이트
  const updateSRS = (wordHebrew: string, quality: number): SRSData => {
    const today = new Date();
    const current = srsData.get(wordHebrew);

    let newData: SRSData;

    if (!current) {
      // 새 단어
      newData = {
        wordHebrew,
        nextReview: new Date(today.getTime() + (quality === 2 ? 1 : 0) * 24 * 60 * 60 * 1000),
        interval: quality === 2 ? 1 : 0,
        easeFactor: 2.5,
        reviewCount: 1,
      };
    } else {
      let newInterval: number;
      let newEaseFactor = current.easeFactor;

      if (quality === 0) {
        // 틀림: 처음부터
        newInterval = 0;
        newEaseFactor = Math.max(1.3, current.easeFactor - 0.2);
      } else if (quality === 1) {
        // 애매함: 간격 증가 작게
        newInterval = Math.max(1, Math.floor(current.interval * 1.2));
      } else {
        // 맞춤: 간격 크게 증가
        if (current.interval === 0) {
          newInterval = 1;
        } else if (current.interval === 1) {
          newInterval = 3;
        } else {
          newInterval = Math.floor(current.interval * newEaseFactor);
        }
        newEaseFactor = current.easeFactor + 0.1;
      }

      newData = {
        wordHebrew,
        nextReview: new Date(today.getTime() + newInterval * 24 * 60 * 60 * 1000),
        interval: newInterval,
        easeFactor: Math.min(2.5, newEaseFactor),
        reviewCount: current.reviewCount + 1,
      };
    }

    const newSrsData = new Map(srsData);
    newSrsData.set(wordHebrew, newData);

    // 즉시 UI 업데이트 (Optimistic Update)
    setSrsData(newSrsData);
    saveToLocalStorage(newSrsData);

    // Supabase 업데이트 (백그라운드)
    if (user) {
      supabase
        .from('user_word_progress')
        .upsert({
          user_id: user.id,
          word_hebrew: wordHebrew,
          next_review: newData.nextReview.toISOString(),
          interval_days: newData.interval,
          ease_factor: newData.easeFactor,
          review_count: newData.reviewCount,
        })
        .then(({ error }) => {
          if (error) {
            console.error('[useSRS] Failed to sync with Supabase:', error);
          }
        });
    }

    return newData;
  };

  // 오늘 복습할 단어인지 확인
  const isDueForReview = (wordHebrew: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const srs = srsData.get(wordHebrew);
    if (!srs) return true; // 새 단어는 복습 대상
    return srs.nextReview <= today;
  };

  // 완벽히 암기한 단어인지 확인 (5회 이상 복습, 30일 이상 간격)
  const isMastered = (wordHebrew: string): boolean => {
    const srs = srsData.get(wordHebrew);
    if (!srs) return false;
    return srs.reviewCount >= 5 && srs.interval >= 30;
  };

  // 통계 계산
  const getStats = (allWordHebrews: string[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueToday = allWordHebrews.filter(isDueForReview).length;
    const mastered = Array.from(srsData.values()).filter(
      (srs) => srs.reviewCount >= 5 && srs.interval >= 30
    ).length;

    return {
      dueToday,
      mastered,
      total: allWordHebrews.length,
      completed: allWordHebrews.length - dueToday,
    };
  };

  return {
    srsData,
    updateSRS,
    isDueForReview,
    isMastered,
    getStats,
    loading,
  };
}
