import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X } from 'lucide-react';
import { Verse } from '../../types';
import { speakHebrew } from '../../utils/wordHelpers';

interface VerseCardProps {
  verse: Verse;
  darkMode: boolean;
}

/**
 * 📜 구절카드
 * 성경 구절의 본문을 표시하는 카드
 * - 히브리어 원문
 * - IPA 발음
 * - 한글 발음
 * - 현대어 번역
 */
export default function VerseCard({ verse, darkMode }: VerseCardProps) {
  const [showHebrewHint, setShowHebrewHint] = useState(true);

  // localStorage에서 힌트 표시 여부 확인
  useEffect(() => {
    try {
      const hideHint = localStorage.getItem('hideHebrewReadingHint');
      if (hideHint === 'true') {
        setShowHebrewHint(false);
      }
    } catch (error) {
      console.error('Failed to load hint preference:', error);
    }
  }, []);

  // 힌트 닫기
  const handleCloseHint = () => {
    setShowHebrewHint(false);
    try {
      localStorage.setItem('hideHebrewReadingHint', 'true');
    } catch (error) {
      console.error('Failed to save hint preference:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border-2 border-blue-400/30'
          : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-white border-2 border-blue-300'
      }`}
      data-testid="verse-card"
    >
      {/* 카드 헤더 */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-blue-300/30 dark:border-blue-500/30">
        <div className={`p-3 rounded-2xl ${
          darkMode
            ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30'
            : 'bg-gradient-to-br from-blue-200 to-cyan-200'
        }`}>
          <span className="text-4xl">📜</span>
        </div>
        <div className="flex-1">
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            구절카드
          </h3>
          <p className={`text-sm font-medium ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
            {verse.reference}
          </p>
        </div>
      </div>

      {/* 히브리어 원문 */}
      <div className="mb-6">
        {/* 읽기 방향 힌트 */}
        <AnimatePresence>
          {showHebrewHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full ${
                darkMode
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                  : 'bg-blue-200/70 text-blue-900 border border-blue-300'
              }`}
            >
              <span className="text-sm font-medium">← 이 방향으로 읽기</span>
              <button
                onClick={handleCloseHint}
                className={`ml-2 p-1 rounded-full transition-all ${
                  darkMode
                    ? 'hover:bg-cyan-400/30 text-cyan-300'
                    : 'hover:bg-blue-300 text-blue-800'
                }`}
                aria-label="힌트 닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p
          className={`text-2xl md:text-3xl lg:text-4xl font-hebrew text-right leading-relaxed mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
          dir="rtl"
          lang="he"
        >
          {verse.hebrew}
        </p>

        {/* 음성 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={() => speakHebrew(verse.hebrew)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              darkMode
                ? 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/30'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300'
            }`}
            aria-label="발음 듣기"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">발음 듣기</span>
          </button>
        </div>
      </div>

      {/* IPA 발음 */}
      <div className="mb-4">
        <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
          IPA 발음
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {verse.ipa}
        </p>
      </div>

      {/* 한글 발음 */}
      <div className="mb-4">
        <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
          한글 발음
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {verse.koreanPronunciation}
        </p>
      </div>

      {/* 현대어 번역 */}
      <div
        className={`p-4 rounded-xl ${
          darkMode
            ? 'bg-blue-900/30 border border-blue-500/30'
            : 'bg-blue-50 border border-blue-200'
        }`}
      >
        <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          현대어 번역
        </p>
        <p className={`text-base leading-relaxed ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {verse.modern}
        </p>
      </div>

      {/* 직역 (있는 경우) */}
      {verse.literal && (
        <div className="mt-4">
          <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            직역
          </p>
          <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {verse.literal}
          </p>
        </div>
      )}
    </motion.div>
  );
}
