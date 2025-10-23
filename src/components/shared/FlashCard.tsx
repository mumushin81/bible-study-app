import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Word } from '../../types';
import { WordWithContext } from '../../hooks/useWords';
import HebrewIcon from './HebrewIcon';
import {
  getWordEmoji,
  getWordColor,
  getSimpleGrammar,
  getGrammarEmoji,
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

// Enhanced Emoji Component with better styling
function EnhancedEmoji({ emoji, size = 72 }: { emoji: string; size?: number }) {
  return (
    <span
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-block',
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, EmojiSymbols, EmojiOne Color',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
      role="img"
      aria-label={emoji}
    >
      {emoji}
    </span>
  );
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
  const emoji = getWordEmoji(word);
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

          <div className="text-center w-full">
            {/* 아이콘 */}
            <div className="mb-4 flex justify-center">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={80}
                color={darkMode ? '#ffffff' : '#1f2937'}
                fallback={emoji}
              />
            </div>

            {/* 히브리어 (크게) */}
            <div
              className={`text-4xl sm:text-5xl font-bold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              dir="rtl"
              style={{ fontFamily: 'David, serif' }}
            >
              {word.hebrew}
            </div>

            {/* 의미 (보통 크기) */}
            <div className={`text-lg sm:text-xl font-semibold mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {word.meaning}
            </div>

            {/* 발음 */}
            {word.korean && (
              <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                [{word.korean}]
              </div>
            )}

            {/* 탭 안내 */}
            <div
              className={`text-xs mt-6 px-3 py-1.5 rounded-lg inline-block ${
                darkMode
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              탭하여 자세히 보기
            </div>
          </div>
        </div>

        {/* 뒷면 - 깔끔한 정보 표시 */}
        <div
          className={`absolute inset-0 p-5 rounded-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200'
          } overflow-y-auto shadow-lg`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-full flex flex-col gap-4">
            {/* 상단: 히브리어 + 의미 */}
            <div className="text-center">
              <div
                className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                dir="rtl"
                style={{ fontFamily: 'David, serif' }}
              >
                {word.hebrew}
              </div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {word.meaning}
              </div>
            </div>

            {/* 발음 + 재생 버튼 */}
            <div className="flex items-center justify-center gap-2">
              {word.korean && (
                <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                }`}>
                  [{word.korean}]
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakHebrew(word.hebrew);
                }}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                } transition-all`}
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* 핵심 정보 */}
            <div className="space-y-2.5 flex-1">
              {/* 어근 */}
              {word.root && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-amber-900/20' : 'bg-amber-50'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                    어근
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-amber-200' : 'text-amber-900'}`} dir="rtl">
                    {word.root}
                  </div>
                </div>
              )}

              {/* 품사 */}
              {word.grammar && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                    품사
                  </div>
                  <div className={`text-sm font-medium flex items-center gap-2 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                    <span>{getSimpleGrammar(word.grammar)}</span>
                    <EnhancedEmoji emoji={getGrammarEmoji(word.grammar)} size={18} />
                  </div>
                </div>
              )}

              {/* 알파벳 */}
              {word.letters && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    알파벳 읽기
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-emerald-200' : 'text-emerald-900'}`} dir="rtl">
                    {word.letters}
                  </div>
                </div>
              )}

              {/* 비슷한 단어 */}
              {word.relatedWords && word.relatedWords.length > 0 && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    비슷한 단어
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                    {word.relatedWords.join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* 하단: 구절 참조 */}
            <div className={`text-center text-xs pt-3 border-t ${
              darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-600'
            }`}>
              📖 {reference}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
