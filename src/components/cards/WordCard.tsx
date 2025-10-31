import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Word } from '../../types';
import FlashCard from '../shared/FlashCard';

interface WordCardProps {
  words: Word[];
  darkMode: boolean;
  verseReference: string;
}

/**
 * 📚 단어카드
 * 히브리어 단어들을 플래시카드 형태로 표시
 * - 플래시카드 그리드
 * - 뒤집기 애니메이션
 * - 북마크 기능
 * - 어근 어원 표시
 */
export default function WordCard({ words, darkMode, verseReference }: WordCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set());

  // localStorage에서 북마크 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bookmarkedWords');
      if (saved) {
        setBookmarkedWords(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Failed to load bookmarked words:', error);
      setBookmarkedWords(new Set());
    }
  }, []);

  // 북마크 토글
  const toggleBookmark = (wordHebrew: string) => {
    const newBookmarks = new Set(bookmarkedWords);
    if (newBookmarks.has(wordHebrew)) {
      newBookmarks.delete(wordHebrew);
    } else {
      newBookmarks.add(wordHebrew);
    }
    setBookmarkedWords(newBookmarks);

    try {
      localStorage.setItem('bookmarkedWords', JSON.stringify(Array.from(newBookmarks)));
    } catch (error) {
      console.error('Failed to save bookmarked words:', error);
    }
  };

  // 플래시카드 뒤집기
  const toggleFlip = (index: number) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedCards(newFlipped);
  };

  // ✨ Memoize unique words computation to avoid recreating on every render
  const uniqueWords = useMemo(() => {
    const seen = new Set<string>();
    return words.filter(word => {
      if (seen.has(word.hebrew)) {
        return false;
      }
      seen.add(word.hebrew);
      return true;
    });
  }, [words]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl ${
        darkMode
          ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/30 border-2 border-indigo-400/30'
          : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white border-2 border-indigo-300'
      }`}
      data-testid="word-card"
    >
      {/* 카드 헤더 (접기 가능) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-200 ${
          darkMode
            ? 'hover:bg-indigo-800/30'
            : 'hover:bg-indigo-100/50'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30'
              : 'bg-gradient-to-br from-indigo-200 to-purple-200'
          }`}>
            <span className="text-4xl">📚</span>
          </div>
          <div className="text-left">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
              단어카드
            </h3>
            <p className={`text-sm font-medium ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
              {uniqueWords.length}개 단어
            </p>
          </div>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={28} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
        </div>
      </button>

      {/* 카드 본문 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-6 space-y-4 overflow-hidden"
        >
          {/* 모두 뒤집기 버튼 */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setFlippedCards(new Set())}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw size={14} className="inline mr-1" />
              모두 앞면으로
            </button>
          </div>

          {/* 플래시카드 그리드 */}
          <div className="flashcards">
            {uniqueWords.map((word, index) => (
              <FlashCard
                key={index}
                word={word}
                darkMode={darkMode}
                isFlipped={flippedCards.has(index)}
                onFlip={() => toggleFlip(index)}
                isBookmarked={bookmarkedWords.has(word.hebrew)}
                onBookmark={() => toggleBookmark(word.hebrew)}
                reference={verseReference}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
