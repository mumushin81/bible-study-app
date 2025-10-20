import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

/**
 * 북마크 관리 Hook (Supabase + localStorage 하이브리드)
 *
 * - Primary: Supabase (기기 간 동기화)
 * - Fallback: localStorage (오프라인 캐시)
 */
export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // localStorage 키
  const STORAGE_KEY = `bookmarkedWords_${user?.id || 'guest'}`;

  // localStorage에서 로드
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set<string>(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[useBookmarks] Failed to load from localStorage:', error);
    }
    return new Set<string>();
  };

  // localStorage에 저장
  const saveToLocalStorage = (words: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(words)));
    } catch (error) {
      console.error('[useBookmarks] Failed to save to localStorage:', error);
    }
  };

  // Supabase에서 로드
  const loadFromSupabase = async () => {
    if (!user) return new Set<string>();

    try {
      const { data, error } = await supabase
        .from('user_word_bookmarks')
        .select('word_hebrew')
        .eq('user_id', user.id);

      if (error) throw error;

      return new Set(data.map(row => row.word_hebrew));
    } catch (error) {
      console.error('[useBookmarks] Failed to load from Supabase:', error);
      return new Set<string>();
    }
  };

  // 초기 로드
  useEffect(() => {
    async function initialize() {
      setLoading(true);

      if (user) {
        // 로그인 사용자: Supabase에서 로드
        const supabaseBookmarks = await loadFromSupabase();
        setBookmarkedWords(supabaseBookmarks);
        saveToLocalStorage(supabaseBookmarks);
      } else {
        // 게스트: localStorage에서 로드
        const localBookmarks = loadFromLocalStorage();
        setBookmarkedWords(localBookmarks);
      }

      setLoading(false);
    }

    initialize();
  }, [user?.id]);

  // 북마크 토글
  const toggleBookmark = async (wordHebrew: string) => {
    const newBookmarks = new Set(bookmarkedWords);
    const isBookmarked = newBookmarks.has(wordHebrew);

    if (isBookmarked) {
      newBookmarks.delete(wordHebrew);
    } else {
      newBookmarks.add(wordHebrew);
    }

    // 즉시 UI 업데이트 (Optimistic Update)
    setBookmarkedWords(newBookmarks);
    saveToLocalStorage(newBookmarks);

    // Supabase 업데이트 (백그라운드)
    if (user) {
      try {
        if (isBookmarked) {
          // 삭제
          await supabase
            .from('user_word_bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('word_hebrew', wordHebrew);
        } else {
          // 추가
          await supabase
            .from('user_word_bookmarks')
            .insert({
              user_id: user.id,
              word_hebrew: wordHebrew,
            });
        }
      } catch (error) {
        console.error('[useBookmarks] Failed to sync with Supabase:', error);
        // 실패 시 롤백
        if (isBookmarked) {
          newBookmarks.add(wordHebrew);
        } else {
          newBookmarks.delete(wordHebrew);
        }
        setBookmarkedWords(new Set(newBookmarks));
        saveToLocalStorage(newBookmarks);
      }
    }
  };

  // 북마크 여부 확인
  const isBookmarked = (wordHebrew: string): boolean => {
    return bookmarkedWords.has(wordHebrew);
  };

  // 북마크 개수
  const bookmarkCount = bookmarkedWords.size;

  return {
    bookmarkedWords,
    toggleBookmark,
    isBookmarked,
    bookmarkCount,
    loading,
  };
}
