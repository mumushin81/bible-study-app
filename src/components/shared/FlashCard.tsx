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
import {
  getGrammarColors,
  getGrammarCardBackground
} from '../../utils/grammarColors';

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
      className="relative cursor-pointer w-full max-w-md mx-auto"
      style={{ perspective: '1000px', aspectRatio: '9/16' }}
      onClick={handleDoubleTap}
    >
      <motion.div
        className="relative rounded-2xl w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 공통 SVG 레이어 - 카드 회전과 독립적으로 배치 (잔상 방지) */}
        <div
          className="absolute top-0 left-0 right-0 h-[80%] flex items-center justify-center z-20 pointer-events-none"
          style={{
            isolation: 'isolate',
            willChange: 'contents',
          }}
        >
          <HebrewIcon
            word={word.hebrew}
            iconUrl={word.iconUrl}
            iconSvg={word.iconSvg}
            size={512}
            color={darkMode ? '#ffffff' : '#1f2937'}
            className="w-full h-full object-contain"
          />
        </div>

        {/* 앞면 - 품사별 배경색 */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden ${
            word.grammar
              ? getGrammarCardBackground(word.grammar, darkMode)
              : darkMode
                ? 'bg-gray-800'
                : 'bg-gray-50'
          } flex flex-col`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            isolation: 'isolate',
            transform: 'translateZ(0)',
          }}
        >
          {/* 상단 버튼들 */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 pointer-events-auto">
            {/* 품사 표시 */}
            {word.grammar && grammarColors && (
              <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                darkMode ? `${grammarColors.dark.bg} ${grammarColors.dark.text}` : `${grammarColors.light.bg} ${grammarColors.light.text}`
              }`}>
                {getSimpleGrammar(word.grammar)}
              </div>
            )}

            {/* 북마크 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="ml-auto p-2 rounded-full backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-all"
            >
              <Star
                size={18}
                className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-white drop-shadow'}
              />
            </button>
          </div>

          {/* 이미지 영역 (80% 높이) */}
          <div className="relative w-full h-[80%] flex-shrink-0" />

          {/* 하단 컨텐츠 영역 (20% 높이) */}
          <div className="relative w-full h-[20%] flex flex-col items-center justify-center px-4 py-2 pointer-events-auto z-10">
            {/* 히브리어 원문 */}
            <div
              className="text-xl sm:text-2xl font-bold mb-1 text-white"
              dir="rtl"
            >
              {word.hebrew}
            </div>

            {/* 알파벳 읽기 */}
            {word.letters && (
              <div
                className="text-xs font-medium mb-1 text-emerald-200"
                dir="rtl"
              >
                {word.letters}
              </div>
            )}

            {/* 발음 */}
            {word.korean && (
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-purple-200">
                  [{word.korean}]
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakHebrew(word.hebrew);
                  }}
                  className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all"
                  aria-label="발음 듣기"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 탭 안내 */}
            <div className="text-xs text-white/70 mt-0.5">
              더블 탭하여 뜻 보기
            </div>
          </div>
        </div>

        {/* 뒷면 - 품사별 배경색 */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden ${
            word.grammar
              ? getGrammarCardBackground(word.grammar, darkMode)
              : darkMode
                ? 'bg-gray-800'
                : 'bg-gray-50'
          } flex flex-col`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(0)',
            isolation: 'isolate',
          }}
        >
          {/* 이미지 영역 (80% 높이) */}
          <div className="relative w-full h-[80%] flex-shrink-0" />

          {/* 하단 뜻 영역 (20% 높이) */}
          <div className="relative w-full h-[20%] flex flex-col items-center justify-center px-6 py-3 pointer-events-auto z-10">
            {/* 한국어 뜻 */}
            <div className="text-2xl sm:text-3xl font-bold mb-2 text-center text-white">
              {word.meaning}
            </div>

            {/* 구절 참조 */}
            <div className="text-xs text-white/70">
              📖 {reference}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
