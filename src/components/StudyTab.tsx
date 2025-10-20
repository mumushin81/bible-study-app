import { useState, useEffect } from 'react';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Verse } from '../types';
import FlashCard from './shared/FlashCard';

interface StudyTabProps {
  verse: Verse;
  darkMode: boolean;
  onMarkStudied: () => void;
  studied: boolean;
  reviewCount?: number;
  isAuthenticated: boolean;
}

export default function StudyTab({ verse, darkMode, onMarkStudied, studied, reviewCount = 0, isAuthenticated }: StudyTabProps) {
  const [openDictionary, setOpenDictionary] = useState(false);
  const [openCommentary, setOpenCommentary] = useState(false);
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

  // 중복 단어 제거 (히브리어 기준)
  const getUniqueWords = () => {
    const seen = new Set<string>();
    return verse.words.filter(word => {
      if (seen.has(word.hebrew)) {
        return false;
      }
      seen.add(word.hebrew);
      return true;
    });
  };

  const uniqueWords = getUniqueWords();

  return (
    <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>

      {/* 단어 사전 - 플래시카드 스타일 */}
      {verse.words && verse.words.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-3xl shadow-xl p-6 mb-6 transition-transform hover:-translate-y-1 ${darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-gradient-to-br from-white/90 via-amber-50/50 to-orange-50/50 border border-orange-200'}`}>
          <button
            onClick={() => setOpenDictionary(!openDictionary)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>🌟 단어로 읽는 원문</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                {uniqueWords.length}개 단어
              </span>
            </div>
            {openDictionary ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {openDictionary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-4"
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

              {uniqueWords.map((word, index) => (
                <FlashCard
                  key={index}
                  word={word}
                  darkMode={darkMode}
                  isFlipped={flippedCards.has(index)}
                  onFlip={() => toggleFlip(index)}
                  isBookmarked={bookmarkedWords.has(word.hebrew)}
                  onBookmark={() => toggleBookmark(word.hebrew)}
                  reference={verse.reference}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* 깊이 읽기 섹션 */}
      {verse.commentary && typeof verse.commentary === 'object' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-3xl shadow-xl p-6 mb-6 transition-transform hover:-translate-y-1 ${darkMode ? 'bg-gradient-to-br from-slate-900/60 to-violet-900/40 border border-violet-400/20' : 'bg-gradient-to-br from-white/90 via-orange-50/50 to-yellow-50/50 border border-yellow-200'}`}
        >
          <button
            onClick={() => setOpenCommentary(!openCommentary)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <h3 className={`text-xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>🔮 말씀 속으로</h3>
            {openCommentary ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {openCommentary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-6"
            >
            {/* Intro */}
            {verse.commentary.intro && (
              <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {verse.commentary.intro}
              </p>
            )}

            {/* Sections */}
            {verse.commentary.sections?.map((section, index) => {
              const colorClasses = {
                purple: darkMode ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-400',
                blue: darkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-400',
                green: darkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-400',
                pink: darkMode ? 'bg-pink-900/30 border-pink-500' : 'bg-pink-50 border-pink-400',
                orange: darkMode ? 'bg-orange-900/30 border-orange-500' : 'bg-orange-50 border-orange-400',
                yellow: darkMode ? 'bg-yellow-900/30 border-yellow-500' : 'bg-yellow-50 border-yellow-400',
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`p-5 rounded-xl border-l-4 ${colorClasses[section.color]}`}
                >
                  <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {section.emoji} {section.title}
                  </h4>
                  <p className={`text-sm mb-3 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {section.description}
                  </p>
                  <ul className="space-y-2">
                    {section.points.map((point, i) => (
                      <li key={i} className={`text-sm flex gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}

            {/* Why Question for Children */}
            {verse.commentary.whyQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className={`p-5 rounded-2xl ${
                  darkMode
                    ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30'
                    : 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-300'
                }`}
              >
                <h4 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-pink-300' : 'text-pink-700'}`}>
                  💭 어린이를 위한 질문
                </h4>
                <p className={`text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Q: {verse.commentary.whyQuestion.question}
                </p>
                <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  A: {verse.commentary.whyQuestion.answer}
                </p>
                <div className={`pt-3 border-t ${darkMode ? 'border-pink-700/30' : 'border-pink-300'}`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-pink-400' : 'text-pink-700'}`}>
                    📖 관련 성경 구절
                  </p>
                  <ul className="space-y-1">
                    {verse.commentary.whyQuestion.bibleReferences.map((ref, i) => (
                      <li key={i} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        • {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Conclusion */}
            {verse.commentary.conclusion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className={`p-5 rounded-2xl ${
                  darkMode
                    ? 'bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30'
                    : 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-300'
                }`}
              >
                <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {verse.commentary.conclusion.title}
                </h4>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {verse.commentary.conclusion.content}
                </p>
              </motion.div>
            )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* 학습 완료 버튼 및 상태 */}
      {isAuthenticated ? (
        <div className="space-y-3">
          {/* Status Display */}
          {studied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-center ${
                darkMode
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <span className={`font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  학습 완료
                </span>
              </div>
              {reviewCount > 0 && (
                <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  복습 횟수: {reviewCount}회
                </p>
              )}
            </motion.div>
          )}

          {/* Mark as Studied Button */}
          <motion.button
            onClick={onMarkStudied}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-200 ${
              studied
                ? darkMode
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                : darkMode
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {studied ? '다시 복습하기' : '학습 완료로 표시'}
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-center ${
            darkMode
              ? 'bg-gradient-to-r from-slate-800/50 to-indigo-900/50 border border-cyan-400/20'
              : 'bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200'
          }`}
        >
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            학습 진행 상황을 저장하려면 로그인이 필요합니다
          </p>
        </motion.div>
      )}
    </div>
  );
}
