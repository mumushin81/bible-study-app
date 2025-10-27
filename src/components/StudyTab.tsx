import { motion } from 'framer-motion';
import { Verse } from '../types';
import VerseCard from './cards/VerseCard';
import WordCard from './cards/WordCard';
import ScriptureCard from './cards/ScriptureCard';

interface StudyTabProps {
  verse: Verse;
  darkMode: boolean;
  onMarkStudied: () => void;
  studied: boolean;
  reviewCount?: number;
  isAuthenticated: boolean;
}

/**
 * 말씀탭 - 3가지 카드 컨테이너
 * - 📜 구절카드: 성경 구절 본문
 * - 📚 단어카드: 히브리어 단어 플래시카드
 * - ✝️ 말씀카드: 깊이 있는 해설
 */
export default function StudyTab({ verse, darkMode, onMarkStudied, studied, reviewCount = 0, isAuthenticated }: StudyTabProps) {
  return (
    <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>

      {/* 📜 구절카드 */}
      <VerseCard verse={verse} darkMode={darkMode} />

      {/* 📚 단어카드 */}
      {verse.words && verse.words.length > 0 && (
        <WordCard
          words={verse.words}
          darkMode={darkMode}
          verseReference={verse.reference}
        />
      )}

      {/* ✝️ 말씀카드 */}
      {verse.commentary && typeof verse.commentary === 'object' && (
        <ScriptureCard
          commentary={verse.commentary}
          darkMode={darkMode}
        />
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
