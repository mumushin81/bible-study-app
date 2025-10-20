import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Word } from '../../types';
import HebrewIcon from './HebrewIcon';
import {
  getWordEmoji,
  getWordColor,
  getSimpleGrammar,
  getGrammarEmoji,
  speakHebrew,
} from '../../utils/wordHelpers';

interface FlashCardProps {
  word: Word;
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
        {/* 앞면 - 히브리어만 크게 */}
        <div
          className={`absolute inset-0 p-6 rounded-2xl backdrop-blur-xl border ${colors.bg} ${colors.border} flex flex-col items-center justify-center`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark();
            }}
            className="absolute top-3 right-3 z-10"
          >
            <Star
              size={18}
              className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : darkMode ? 'text-gray-400' : 'text-gray-500'}
            />
          </button>

          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={96}
                color={darkMode ? '#ffffff' : '#1f2937'}
                fallback={emoji}
                className="drop-shadow-lg"
              />
            </div>
            <div
              className={`text-5xl font-bold mb-6 ${
                darkMode ? 'text-white drop-shadow-lg' : 'text-gray-900'
              }`}
              dir="rtl"
              style={{ fontFamily: 'David, serif' }}
            >
              {word.hebrew}
            </div>
            <div
              className={`text-xs px-4 py-2 rounded-full backdrop-blur-md inline-block ${
                darkMode
                  ? 'bg-purple-900/30 text-purple-200 border border-purple-500/30'
                  : 'bg-purple-100/70 text-purple-700 border border-purple-300/50'
              }`}
            >
              탭하여 뒷면 보기
            </div>
          </div>
        </div>

        {/* 뒷면 - 공간 효율적 배치 */}
        <div
          className={`absolute inset-0 p-5 rounded-2xl backdrop-blur-xl border ${colors.bg} ${colors.border} overflow-y-auto`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="h-full flex flex-col gap-3">
            {/* 상단: 이모지 + 의미 */}
            <div className="text-center pb-3 border-b border-current/20">
              <div className="mb-2 flex justify-center">
                <HebrewIcon
                  word={word.hebrew}
                  iconSvg={word.iconSvg}
                  size={64}
                  color={darkMode ? '#ffffff' : '#1f2937'}
                  fallback={emoji}
                />
              </div>
              <div
                className={`font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}
                style={{ fontSize: 'clamp(1.1rem, 4vw, 1.3rem)' }}
              >
                {word.meaning}
              </div>
            </div>

            {/* 발음 섹션 - 컴팩트 */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {word.ipa && (
                <div className={`px-2.5 py-1.5 rounded-lg backdrop-blur-sm text-xs ${
                  darkMode
                    ? 'bg-blue-900/40 border border-blue-500/30 text-blue-100'
                    : 'bg-blue-50/90 border border-blue-300/50 text-blue-900'
                }`}>
                  <span className="font-mono font-medium">{word.ipa}</span>
                </div>
              )}
              <div className={`px-2.5 py-1.5 rounded-lg backdrop-blur-sm text-xs ${
                darkMode
                  ? 'bg-pink-900/40 border border-pink-500/30 text-pink-100'
                  : 'bg-pink-50/90 border border-pink-300/50 text-pink-900'
              }`}>
                <span className="font-medium">{word.korean}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakHebrew(word.hebrew);
                }}
                className={`p-1.5 rounded-lg backdrop-blur-md ${
                  darkMode
                    ? 'bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30'
                    : 'bg-purple-100/90 hover:bg-purple-200 border border-purple-300/50'
                } transition-all`}
              >
                <Volume2 size={14} className={darkMode ? 'text-purple-300' : 'text-purple-700'} />
              </button>
            </div>

            {/* 알파벳 분해 (letters) */}
            {word.letters && (
              <div className={`p-3 rounded-lg text-center ${
                darkMode ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30' : 'bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-300/50'
              }`}>
                <div className={`text-[0.7rem] font-semibold mb-1.5 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  🔤 알파벳으로 읽기
                </div>
                <div className={`text-sm font-medium leading-snug ${darkMode ? 'text-emerald-100' : 'text-emerald-900'}`} dir="rtl">
                  {word.letters}
                </div>
              </div>
            )}

            {/* 핵심 정보 - 단일 열 배치로 가독성 향상 */}
            <div className="space-y-3 flex-1">
              {/* 어근 (root) */}
              {word.root && (
                <div className={`p-3 rounded-lg text-center ${
                  darkMode ? 'bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30' : 'bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-300/50'
                }`}>
                  <div className={`text-[0.7rem] font-semibold mb-1.5 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                    🌱 어근
                  </div>
                  <div className={`text-sm font-medium leading-snug ${darkMode ? 'text-amber-100' : 'text-amber-900'}`} dir="rtl">
                    {word.root}
                  </div>
                </div>
              )}

              {/* 간단한 품사 */}
              {word.grammar && (
                <div className={`p-3 rounded-lg text-center ${
                  darkMode ? 'bg-black/20' : 'bg-white/40'
                }`}>
                  <div className={`text-sm font-bold flex items-center justify-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <span>{getSimpleGrammar(word.grammar)}</span>
                    <EnhancedEmoji emoji={getGrammarEmoji(word.grammar)} size={20} />
                  </div>
                </div>
              )}

              {/* 비슷한 단어 (있을 경우) */}
              {word.relatedWords && word.relatedWords.length > 0 && (
                <div className={`p-3 rounded-lg text-center ${
                  darkMode ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30' : 'bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border border-blue-300/50'
                }`}>
                  <div className={`text-[0.7rem] font-semibold mb-1.5 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    🔗 비슷한 단어
                  </div>
                  <div className={`text-sm font-medium leading-snug ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                    {word.relatedWords.join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* 하단: 구절 참조 */}
            <div className={`text-center text-[0.65rem] pt-2 border-t border-current/20 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              📖 {reference}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
