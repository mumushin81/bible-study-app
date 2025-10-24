import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { useRef } from 'react';
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
  const lastTapRef = useRef<number>(0);

  // 더블 탭 핸들러
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // 더블 탭 감지 (300ms 이내)
      onFlip();
      lastTapRef.current = 0; // 리셋
    } else {
      // 첫 번째 탭
      lastTapRef.current = now;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative cursor-pointer h-[360px] sm:h-[400px] md:h-[480px]"
      style={{ perspective: '1000px' }}
      onClick={handleDoubleTap}
    >
      <motion.div
        className="relative rounded-2xl h-[360px] sm:h-[400px] md:h-[480px]"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 앞면 - 히브리어 + 의미 간략히 */}
        <div
          className={`absolute inset-0 p-4 sm:p-6 md:p-8 rounded-2xl overflow-y-auto ${
            word.grammar
              ? getGrammarCardBackground(word.grammar, darkMode)
              : darkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          } border-2 flex flex-col items-center justify-start pt-4 sm:pt-6 md:pt-8 shadow-lg`}
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

          <div className="text-center w-full flex flex-col items-center justify-start gap-2 sm:gap-3 md:gap-4 overflow-hidden px-2">
            {/* 1. SVG 아이콘 - 반응형 크기 */}
            <div className="flex justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={112}
                color={darkMode ? '#ffffff' : '#1f2937'}
                className="w-full h-full"
              />
            </div>

            {/* 2. 알파벳 읽기 - 반응형 폰트 */}
            {word.letters && (
              <div
                className={`text-lg sm:text-xl md:text-2xl font-semibold max-w-full truncate px-4 py-2 rounded-xl ${
                  darkMode
                    ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-700/50'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
                dir="rtl"
              >
                {word.letters}
              </div>
            )}

            {/* 3. 한국어 발음 + 발음 듣기 버튼 - 반응형 */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-full">
              {word.korean && (
                <div
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-base sm:text-lg md:text-xl font-bold max-w-full truncate ${
                    darkMode
                      ? 'bg-purple-900/30 text-purple-200 border border-purple-700/50'
                      : 'bg-purple-50 text-purple-800 border border-purple-200'
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
                className={`p-3 sm:p-3.5 rounded-xl shadow-md ${
                  darkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                } transition-all hover:scale-105 active:scale-95`}
                aria-label="발음 듣기"
              >
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* 탭 안내 */}
            <div
              className={`text-xs sm:text-sm mt-2 sm:mt-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700/50 text-gray-400'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              더블 탭하여 뜻 보기
            </div>
          </div>
        </div>

        {/* 뒷면 - SVG, 원문, 뜻, 어근, 품사 */}
        <div
          className={`absolute inset-0 p-4 sm:p-6 md:p-8 rounded-2xl overflow-y-auto ${
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
          <div className="h-full flex flex-col items-center justify-start pt-4 sm:pt-6 md:pt-8 gap-3 sm:gap-4 md:gap-5 text-center overflow-hidden px-4">
            {/* 1. SVG 아이콘 - 반응형 */}
            <div className="flex justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={96}
                color={darkMode ? '#ffffff' : '#1f2937'}
                className="w-full h-full"
              />
            </div>

            {/* 2. 한국어 뜻 - 크고 명확하게 */}
            <div
              className={`text-2xl sm:text-3xl md:text-4xl font-bold max-w-full break-words line-clamp-3 px-4 py-3 rounded-xl ${
                darkMode
                  ? 'bg-blue-900/30 text-blue-100 border border-blue-700/50'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              {word.meaning}
            </div>

            {/* 3. 어근 - 섹션으로 표시 */}
            {word.root && (
              <div className={`w-full max-w-full overflow-hidden px-4 py-3 rounded-xl ${
                darkMode
                  ? 'bg-amber-900/30 border border-amber-700/50'
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <div
                  className={`text-xs sm:text-sm font-bold mb-2 ${
                    darkMode ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  🌱 어근
                </div>
                <div
                  className={`text-base sm:text-lg md:text-xl font-semibold max-w-full truncate ${
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
              className={`mt-auto text-xs sm:text-sm px-3 py-1.5 rounded-lg ${
                darkMode
                  ? 'bg-gray-800/80 text-gray-400 border border-gray-700'
                  : 'bg-white/80 text-gray-600 border border-gray-300'
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
