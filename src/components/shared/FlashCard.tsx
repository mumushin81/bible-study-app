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
import { getGrammarColors, getGrammarCardBackground } from '../../utils/grammarColors';

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
  const grammarColors = word.grammar ? getGrammarColors(word.grammar) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative cursor-pointer min-h-[240px] sm:min-h-[280px] md:min-h-[320px]"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative rounded-2xl min-h-[240px] sm:min-h-[280px] md:min-h-[320px]"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 앞면 - 히브리어 + 의미 간략히 */}
        <div
          className={`absolute inset-0 p-4 sm:p-6 md:p-8 rounded-2xl ${
            word.grammar
              ? getGrammarCardBackground(word.grammar, darkMode)
              : darkMode
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

          {/* 품사 표시 (상단 왼쪽) - 품사별 색상 */}
          {word.grammar && grammarColors && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
              darkMode ? `${grammarColors.dark.bg} ${grammarColors.dark.text}` : `${grammarColors.light.bg} ${grammarColors.light.text}`
            }`}>
              {getSimpleGrammar(word.grammar)}
            </div>
          )}

          <div className="text-center w-full flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4">
            {/* 1. SVG 아이콘 - 반응형 크기 */}
            <div className="flex justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={96}
                color={darkMode ? '#ffffff' : '#1f2937'}
                className="w-full h-full"
              />
            </div>

            {/* 2. 원문 단어 - 반응형 폰트 */}
            <div
              className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              dir="rtl"
              style={{ fontFamily: 'David, serif' }}
            >
              {word.hebrew}
            </div>

            {/* 3. 알파벳 읽기 - 반응형 폰트 */}
            {word.letters && (
              <div
                className={`text-sm sm:text-base md:text-lg font-medium ${
                  darkMode ? 'text-emerald-300' : 'text-emerald-700'
                }`}
                dir="rtl"
              >
                {word.letters}
              </div>
            )}

            {/* 4. 한국어 발음 + 발음 듣기 버튼 - 반응형 */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {word.korean && (
                <div
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium ${
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
                className={`p-2 sm:p-2.5 rounded-lg ${
                  darkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                } transition-all`}
                aria-label="발음 듣기"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* 탭 안내 */}
            <div
              className={`text-xs sm:text-sm mt-2 sm:mt-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg ${
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
          className={`absolute inset-0 p-4 sm:p-6 md:p-8 rounded-2xl ${
            word.grammar
              ? getGrammarCardBackground(word.grammar, darkMode)
              : darkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          } border-2 shadow-lg`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-full flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 text-center">
            {/* 1. SVG 아이콘 - 반응형 */}
            <div className="flex justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={80}
                color={darkMode ? '#ffffff' : '#1f2937'}
                className="w-full h-full"
              />
            </div>

            {/* 2. 뜻 - 반응형 폰트 */}
            <div
              className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {word.meaning}
            </div>

            {/* 3. 어근 - 반응형 */}
            {word.root && (
              <div className="space-y-1 sm:space-y-2">
                <div
                  className={`text-xs sm:text-sm font-semibold ${
                    darkMode ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  어근
                </div>
                <div
                  className={`text-base sm:text-lg md:text-xl font-medium ${
                    darkMode ? 'text-amber-200' : 'text-amber-900'
                  }`}
                  dir="rtl"
                >
                  {word.root}
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
