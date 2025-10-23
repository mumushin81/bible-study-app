import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Word } from '../../types';
import { WordWithContext } from '../../hooks/useWords';
import HebrewIcon from './HebrewIcon';
import {
  getWordColor,
  getSimpleGrammar,
  speakHebrew,
} from '../../utils/wordHelpers';

interface FlashCardProps {
  word: Word | WordWithContext;
  darkMode: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  reference: string;
  index?: number;
}

export default function FlashCard({
  word,
  darkMode,
  isFlipped,
  onFlip,
  isBookmarked,
  onBookmark,
  reference,
  index = 0,
}: FlashCardProps) {
  const colors = getWordColor(word, darkMode);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative cursor-pointer"
      style={{ perspective: '1000px', minHeight: '280px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative rounded-2xl"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '280px',
        }}
      >
        {/* 앞면 - 히브리어 + 의미 간략히 */}
        <div
          className={`absolute inset-0 p-6 rounded-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          } border-2 flex flex-col items-center justify-center shadow-lg`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* 북마크 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark();
            }}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-black/5 transition-all"
          >
            <Star
              size={20}
              className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : darkMode ? 'text-gray-500' : 'text-gray-400'}
            />
          </button>

          {/* 품사 표시 (상단 왼쪽) */}
          {word.grammar && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
              darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              {getSimpleGrammar(word.grammar)}
            </div>
          )}

          <div className="text-center w-full flex flex-col items-center justify-center gap-4">
            {/* 1. SVG 아이콘 */}
            <div className="flex justify-center">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={96}
                color={darkMode ? '#ffffff' : '#1f2937'}
              />
            </div>

            {/* 2. 원문 단어 */}
            <div
              className={`text-5xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              dir="rtl"
              style={{ fontFamily: 'David, serif' }}
            >
              {word.hebrew}
            </div>

            {/* 3. 알파벳 읽기 */}
            {word.letters && (
              <div
                className={`text-base font-medium ${
                  darkMode ? 'text-emerald-300' : 'text-emerald-700'
                }`}
                dir="rtl"
              >
                {word.letters}
              </div>
            )}

            {/* 4. 한국어 발음 + 발음 듣기 버튼 */}
            <div className="flex items-center justify-center gap-3">
              {word.korean && (
                <div
                  className={`px-4 py-2 rounded-lg text-base font-medium ${
                    darkMode
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  [{word.korean}]
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakHebrew(word.hebrew);
                }}
                className={`p-2.5 rounded-lg ${
                  darkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                } transition-all`}
                aria-label="발음 듣기"
              >
                <Volume2 size={18} />
              </button>
            </div>

            {/* 탭 안내 */}
            <div
              className={`text-xs mt-4 px-3 py-1.5 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              탭하여 뜻 보기
            </div>
          </div>
        </div>

        {/* 뒷면 - SVG, 원문, 뜻, 어근, 품사 */}
        <div
          className={`absolute inset-0 p-8 rounded-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200'
          } shadow-lg`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
            {/* 1. SVG 아이콘 */}
            <div className="flex justify-center">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={80}
                color={darkMode ? '#ffffff' : '#1f2937'}
              />
            </div>

            {/* 2. 원문 단어 */}
            <div
              className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
              dir="rtl"
              style={{ fontFamily: 'David, serif' }}
            >
              {word.hebrew}
            </div>

            {/* 3. 뜻 */}
            <div
              className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {word.meaning}
            </div>

            {/* 4. 어근 */}
            {word.root && (
              <div className="space-y-2">
                <div
                  className={`text-sm font-semibold ${
                    darkMode ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  어근
                </div>
                <div
                  className={`text-xl font-medium ${
                    darkMode ? 'text-amber-200' : 'text-amber-900'
                  }`}
                  dir="rtl"
                >
                  {word.root}
                </div>
              </div>
            )}

            {/* 5. 품사 */}
            {word.grammar && (
              <div className="space-y-2">
                <div
                  className={`text-sm font-semibold ${
                    darkMode ? 'text-purple-400' : 'text-purple-700'
                  }`}
                >
                  품사
                </div>
                <div
                  className={`text-xl font-medium ${
                    darkMode ? 'text-purple-200' : 'text-purple-900'
                  }`}
                >
                  {getSimpleGrammar(word.grammar)}
                </div>
              </div>
            )}

            {/* 하단: 구절 참조 */}
            <div
              className={`absolute bottom-4 text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-600'
              }`}
            >
              📖 {reference}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
