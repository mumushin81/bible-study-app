import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X } from 'lucide-react';
import { Verse } from '../../types';
import { speakHebrew } from '../../utils/wordHelpers';
import { BaseCard } from '../shared/BaseCard';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface VerseCardProps {
  verse: Verse;
  darkMode: boolean;
}

/**
 * 📜 구절카드 (리팩토링)
 * 성경 구절의 본문을 표시하는 카드
 * - 히브리어 원문
 * - IPA 발음
 * - 한글 발음
 * - 현대어 번역
 */
export default memo(function VerseCard({ verse, darkMode }: VerseCardProps) {
  const [showHebrewHint, setShowHebrewHint] = useLocalStorage(
    'hideHebrewReadingHint',
    true
  );

  // 힌트 닫기 (useCallback으로 최적화)
  const handleCloseHint = useCallback(() => {
    setShowHebrewHint(false);
  }, [setShowHebrewHint]);

  // 발음 듣기 (useCallback으로 최적화)
  const handleSpeak = useCallback(() => {
    speakHebrew(verse.hebrew);
  }, [verse.hebrew]);

  return (
    <BaseCard colorScheme="blue" testId="verse-card">
      {/* 카드 헤더 */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-blue-300/30 dark:border-blue-500/30">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-600/30 dark:to-cyan-600/30">
          <span className="text-4xl">📜</span>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            구절카드
          </h3>
          <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
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
              className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-200/70 text-blue-900 border border-blue-300 dark:bg-cyan-500/20 dark:text-cyan-200 dark:border-cyan-400/30"
            >
              <span className="text-sm font-medium">← 이 방향으로 읽기</span>
              <button
                onClick={handleCloseHint}
                className="ml-2 p-1 rounded-full transition-all hover:bg-blue-300 text-blue-800 dark:hover:bg-cyan-400/30 dark:text-cyan-300"
                aria-label="힌트 닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p
          className="text-2xl md:text-3xl lg:text-4xl font-hebrew text-right leading-relaxed mb-4 text-gray-900 dark:text-white"
          dir="rtl"
          lang="he"
        >
          {verse.hebrew}
        </p>

        {/* 음성 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleSpeak}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 dark:bg-blue-600/30 dark:hover:bg-blue-600/50 dark:text-blue-200 dark:border-blue-400/30"
            aria-label="발음 듣기"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">발음 듣기</span>
          </button>
        </div>
      </div>

      {/* IPA 발음 */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-1 text-cyan-700 dark:text-cyan-400">
          IPA 발음
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {verse.ipa}
        </p>
      </div>

      {/* 한글 발음 */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-1 text-cyan-700 dark:text-cyan-400">
          한글 발음
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {verse.koreanPronunciation}
        </p>
      </div>

      {/* 현대어 번역 */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/30">
        <p className="text-xs font-semibold mb-2 text-blue-700 dark:text-blue-300">
          현대어 번역
        </p>
        <p className="text-base leading-relaxed text-gray-900 dark:text-white">
          {verse.modern}
        </p>
      </div>

      {/* 직역 (있는 경우) */}
      {verse.literal && (
        <div className="mt-4">
          <p className="text-xs font-semibold mb-1 text-gray-500">
            직역
          </p>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            {verse.literal}
          </p>
        </div>
      )}
    </BaseCard>
  );
});
