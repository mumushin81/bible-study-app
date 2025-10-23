import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Word } from '../../types';
import { WordWithContext } from '../../hooks/useWords';
import HebrewIcon from './HebrewIcon';
import { speakHebrew } from '../../utils/wordHelpers';

interface FlashCardV2Props {
  word: Word | WordWithContext;
  darkMode: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  reference: string;
  index?: number;
}

// 간단한 품사 추출
function getSimpleGrammar(grammar: string): string {
  if (grammar.includes('명사')) return '명사';
  if (grammar.includes('동사')) return '동사';
  if (grammar.includes('형용사')) return '형용사';
  if (grammar.includes('전치사') || grammar.includes('조사')) return '전치사';
  if (grammar.includes('접속사')) return '접속사';
  if (grammar.includes('부사')) return '부사';
  if (grammar.includes('대명사')) return '대명사';
  return '기타';
}

/**
 * FlashCardV2 - 간결하고 집중력 있는 플래시카드
 *
 * 앞면: SVG 아이콘 + 히브리어 원문 + (알파벳 읽기 + 한국어 발음 + 듣기 버튼)
 * 뒷면: SVG 아이콘 + 뜻 + 어근 + 품사
 * 모두 중앙 정렬
 */
export default function FlashCardV2({
  word,
  darkMode,
  isFlipped,
  onFlip,
  isBookmarked,
  onBookmark,
  reference,
  index = 0,
}: FlashCardV2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative cursor-pointer"
      style={{ perspective: '1000px', minHeight: '320px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative rounded-2xl"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '320px',
        }}
      >
        {/* ========================================
            앞면: SVG + 원문 + 읽기
        ======================================== */}
        <div
          className={`absolute inset-0 p-8 rounded-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          } border-2 flex flex-col items-center justify-center shadow-lg`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* 북마크 버튼 (작게, 우측 상단) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark();
            }}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-black/5 transition-all"
          >
            <Star
              size={18}
              className={
                isBookmarked
                  ? 'fill-yellow-400 text-yellow-400'
                  : darkMode
                  ? 'text-gray-500'
                  : 'text-gray-400'
              }
            />
          </button>

          <div className="text-center w-full flex flex-col items-center gap-4">
            {/* SVG 아이콘 */}
            <div className="flex justify-center">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={96}
                color={darkMode ? '#ffffff' : '#1f2937'}
                fallback={word.emoji || '📜'}
              />
            </div>

            {/* 히브리어 원문 */}
            <div
              className={`text-5xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              dir="rtl"
              style={{ fontFamily: 'David, serif' }}
            >
              {word.hebrew}
            </div>

            {/* 알파벳 읽기 + 한국어 발음 + 듣기 버튼 */}
            <div className="space-y-2 w-full">
              {/* 알파벳 읽기 */}
              {word.letters && (
                <div
                  className={`text-sm font-medium ${
                    darkMode ? 'text-emerald-300' : 'text-emerald-700'
                  }`}
                  dir="rtl"
                >
                  {word.letters}
                </div>
              )}

              {/* 한국어 발음 + 듣기 버튼 */}
              <div className="flex items-center justify-center gap-2">
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

        {/* ========================================
            뒷면: SVG + 뜻 + 어근 + 품사
        ======================================== */}
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
            {/* SVG 아이콘 */}
            <div className="flex justify-center">
              <HebrewIcon
                word={word.hebrew}
                iconSvg={word.iconSvg}
                size={80}
                color={darkMode ? '#ffffff' : '#1f2937'}
                fallback={word.emoji || '📜'}
              />
            </div>

            {/* 뜻 */}
            <div
              className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {word.meaning}
            </div>

            {/* 어근 */}
            {word.root && (
              <div className="space-y-1">
                <div
                  className={`text-xs font-semibold ${
                    darkMode ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  어근
                </div>
                <div
                  className={`text-lg font-medium ${
                    darkMode ? 'text-amber-200' : 'text-amber-900'
                  }`}
                  dir="rtl"
                >
                  {word.root}
                </div>
              </div>
            )}

            {/* 품사 */}
            {word.grammar && (
              <div className="space-y-1">
                <div
                  className={`text-xs font-semibold ${
                    darkMode ? 'text-purple-400' : 'text-purple-700'
                  }`}
                >
                  품사
                </div>
                <div
                  className={`text-lg font-medium ${
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
