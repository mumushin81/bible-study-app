import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { useRootDerivations } from '../hooks/useHebrewRoots';
import type { HebrewRoot } from '../hooks/useHebrewRoots';
import FlashCard from './shared/FlashCard';

interface RootFlashcardDeckProps {
  root: HebrewRoot;
  darkMode: boolean;
  onClose: () => void;
}

export default function RootFlashcardDeck({ root, darkMode, onClose }: RootFlashcardDeckProps) {
  const { derivations, loading } = useRootDerivations(root.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState(new Set<string>());
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set<string>());

  // 현재 카드
  const currentCard = derivations[currentIndex];

  // 다음 카드로
  const nextCard = () => {
    if (currentIndex < derivations.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // 이전 카드로
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // 플래시카드 뒤집기
  const toggleFlip = (hebrew: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(hebrew)) {
      newFlipped.delete(hebrew);
    } else {
      newFlipped.add(hebrew);
    }
    setFlippedCards(newFlipped);
  };

  // 북마크 토글
  const toggleBookmark = (hebrew: string) => {
    const newBookmarked = new Set(bookmarkedWords);
    if (newBookmarked.has(hebrew)) {
      newBookmarked.delete(hebrew);
    } else {
      newBookmarked.add(hebrew);
    }
    setBookmarkedWords(newBookmarked);
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent ${
              darkMode ? 'border-cyan-400' : 'border-purple-600'
            }`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* 헤더 - 어근 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl shadow-xl p-6 mb-6 ${
            darkMode
              ? 'bg-gradient-to-br from-slate-900/60 to-purple-900/40 border border-purple-400/20'
              : 'bg-gradient-to-br from-white/90 via-purple-50/50 to-pink-50/50 border border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              ← 뒤로 가기
            </button>

            <div className={`px-4 py-2 rounded-xl font-medium ${
              darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              {currentIndex + 1} / {derivations.length}
            </div>
          </div>

          {/* 어근 카드 */}
          <div className="text-center">
            <div className="text-5xl mb-2">{root.emoji}</div>
            <h1 className="text-4xl font-bold mb-2" dir="rtl" style={{ fontFamily: 'David, serif' }}>
              {root.root_hebrew}
            </h1>
            <div className="text-2xl mb-2">{root.root}</div>

            {/* 발음기호 */}
            {root.pronunciation && (
              <div className={`text-lg font-mono mb-3 px-3 py-1 rounded-lg inline-block ${
                darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100/80 text-indigo-700'
              }`}>
                [{root.pronunciation}]
              </div>
            )}

            <div className="text-xl font-semibold mb-2">
              {root.core_meaning_korean}
            </div>

            {root.story && (
              <p className={`text-sm italic max-w-2xl mx-auto ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {root.story}
              </p>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className={`px-3 py-1 rounded-lg ${
                darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                <Sparkles className="w-4 h-4 inline mr-1" />
                중요도: {root.importance}/5
              </div>
              <div className={`px-3 py-1 rounded-lg ${
                darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
              }`}>
                <BookOpen className="w-4 h-4 inline mr-1" />
                빈도: {root.frequency}회
              </div>
              <div className={`px-3 py-1 rounded-lg ${
                darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}>
                파생어: {derivations.length}개
              </div>
            </div>
          </div>
        </motion.div>

        {/* 파생 단어가 없는 경우 */}
        {derivations.length === 0 && (
          <div className={`rounded-3xl shadow-xl p-12 text-center ${
            darkMode
              ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
              : 'bg-white/90 border border-amber-200'
          }`}>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              이 어근에서 파생된 단어가 아직 매핑되지 않았습니다.
            </p>
          </div>
        )}

        {/* 플래시카드 - FlashCard 컴포넌트 사용 */}
        {derivations.length > 0 && currentCard && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6"
          >
            <FlashCard
              word={{
                ...currentCard.word,
                iconSvg: currentCard.word.icon_svg,
                relatedWords: [],
              }}
              darkMode={darkMode}
              isFlipped={flippedCards.has(currentCard.word.hebrew)}
              onFlip={() => toggleFlip(currentCard.word.hebrew)}
              isBookmarked={bookmarkedWords.has(currentCard.word.hebrew)}
              onBookmark={() => toggleBookmark(currentCard.word.hebrew)}
              reference={`${root.root} (${root.root_hebrew}) 어근에서 파생`}
              index={0}
            />

            {/* 어근 파생 정보 추가 */}
            {currentCard.derivation_note && (
              <div className={`mt-4 p-4 rounded-xl ${
                darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className="text-sm font-semibold mb-1">✨ 어근 파생</div>
                <div className="text-sm">{currentCard.derivation_note}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* 네비게이션 */}
        {derivations.length > 1 && (
          <div className={`rounded-3xl shadow-xl p-6 ${
            darkMode
              ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
              : 'bg-white/90 border border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentIndex === 0
                    ? darkMode
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                이전
              </button>

              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentIndex + 1} / {derivations.length}
              </div>

              <button
                onClick={nextCard}
                disabled={currentIndex === derivations.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentIndex === derivations.length - 1
                    ? darkMode
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                다음
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
