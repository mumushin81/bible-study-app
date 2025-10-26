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
          className="absolute top-0 left-0 right-0 h-[90%] flex items-center justify-center z-0 pointer-events-none rounded-t-2xl overflow-hidden"
          style={{
            isolation: 'isolate',
            willChange: 'contents',
          }}
        >
          <div className="w-full aspect-square flex items-center justify-center">
            <HebrewIcon
              word={word.hebrew}
              iconUrl={word.iconUrl}
              iconSvg={word.iconSvg}
              size={512}
              color={darkMode ? '#ffffff' : '#1f2937'}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* 앞면 - 텍스트 및 버튼만 */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden ${
            word.grammar
              ? getGrammarCardBackground(word.grammar, darkMode)
              : darkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          } border-2 shadow-lg flex flex-col`}
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

          {/* 이미지 영역 (90% 높이) - 공통 SVG 레이어가 차지하므로 투명 */}
          <div className="relative w-full h-[90%] flex-shrink-0" />

          {/* 하단 컨텐츠 영역 (10% 높이) - 완전 불투명 배경 */}
          <div className="relative w-full h-[10%] flex items-center justify-between px-4 bg-gray-900 pointer-events-auto z-10">
            {/* 히브리어 원문 */}
            <div
              className="text-lg sm:text-xl font-bold text-white"
              dir="rtl"
            >
              {word.hebrew}
            </div>

            {/* 발음 버튼 */}
            {word.korean && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakHebrew(word.hebrew);
                }}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1"
                aria-label="발음 듣기"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">[{word.korean}]</span>
              </button>
            )}
          </div>
        </div>

        {/* 뒷면 - 뜻 표시 (배경색 약간 다르게) */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden ${
            word.grammar
              ? getGrammarCardBackground(word.grammar, darkMode).replace('from-', 'from-opacity-90 from-')
              : darkMode
                ? 'bg-gradient-to-br from-gray-900 to-black border-gray-600'
                : 'bg-gradient-to-br from-gray-50 to-white border-gray-300'
          } border-2 shadow-lg flex flex-col`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(0)',
            isolation: 'isolate',
          }}
        >
          {/* 이미지 영역 (90% 높이) - 공통 SVG 레이어가 차지하므로 투명 */}
          <div className="relative w-full h-[90%] flex-shrink-0" />

          {/* 하단 뜻 영역 (10% 높이) - 완전 불투명 배경 */}
          <div className="relative w-full h-[10%] flex items-center justify-center px-6 bg-black pointer-events-auto z-10">
            {/* 한국어 뜻 */}
            <div className="text-xl sm:text-2xl font-bold text-center text-white">
              {word.meaning}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
