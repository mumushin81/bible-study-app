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
  getGrammarColorValues,
  getGrammarCardBackground,
  getGrammarGlowEffect
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
  const grammarColors = word.grammar ? getGrammarColorValues(word.grammar) : null;
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
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 앞면 - 배경 이미지 + 그라디언트 오버레이 */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            isolation: 'isolate',
            transform: 'translateZ(0)',
          }}
        >
          {/* 배경 이미지 (전체 9:16) */}
          <div className="absolute inset-0 z-0">
            <HebrewIcon
              word={word.hebrew}
              iconUrl={word.iconUrl}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 블러 효과 오버레이 (하단 20% - 유리 느낌) */}
          <div
            className="absolute inset-x-0 bottom-0 h-[20%] z-10 pointer-events-none"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
          {/* 상단 버튼들 */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 pointer-events-auto">
            {/* 품사 표시 (색상 적용) */}
            {word.grammar && grammarColors && (
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
                style={{
                  backgroundColor: `${grammarColors.bg}cc`,
                  color: grammarColors.text,
                  borderColor: `${grammarColors.border}80`
                }}
              >
                {getSimpleGrammar(word.grammar)}
              </div>
            )}

            {/* 북마크 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="ml-auto p-2 rounded-full backdrop-blur-md bg-white/40 hover:bg-white/50 transition-all border border-gray-400/30"
            >
              <Star
                size={18}
                className={isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700 drop-shadow'}
              />
            </button>
          </div>

          {/* 하단 컨텐츠 영역 */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center justify-end px-4 py-6 pb-8 pointer-events-auto">
            {/* 히브리어 원문 */}
            <div
              className="text-2xl sm:text-3xl font-bold text-gray-800 drop-shadow-lg mb-2"
              dir="rtl"
              style={{ textShadow: '0 2px 8px rgba(255,255,255,0.8)' }}
            >
              {word.hebrew}
            </div>

            {/* 알파벳 읽기 + 음성 버튼 */}
            {word.letters && (
              <div className="flex items-center gap-2 mb-2">
                <div className="text-base sm:text-lg font-medium text-gray-700" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.8)' }}>
                  {word.letters}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakHebrew(word.hebrew);
                  }}
                  className="p-1.5 rounded-lg bg-gray-800/20 hover:bg-gray-800/30 backdrop-blur-sm text-gray-800 transition-all border border-gray-800/30"
                  aria-label="발음 듣기"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 탭 안내 */}
            <div className="text-xs text-gray-600" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>
              더블 탭하여 뜻 보기
            </div>
          </div>
        </div>

        {/* 뒷면 - 배경 이미지 + 그라디언트 오버레이 */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(0)',
            isolation: 'isolate',
          }}
        >
          {/* 배경 이미지 (전체 9:16) */}
          <div className="absolute inset-0 z-0">
            <HebrewIcon
              word={word.hebrew}
              iconUrl={word.iconUrl}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 블러 효과 오버레이 (전체 - 유리 느낌) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              background: 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.3) 100%)',
            }}
          />

          {/* 상단 버튼들 */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 pointer-events-auto">
            {/* 품사 표시 (색상 적용) */}
            {word.grammar && grammarColors && (
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
                style={{
                  backgroundColor: `${grammarColors.bg}cc`,
                  color: grammarColors.text,
                  borderColor: `${grammarColors.border}80`
                }}
              >
                {getSimpleGrammar(word.grammar)}
              </div>
            )}

            {/* 북마크 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="ml-auto p-2 rounded-full backdrop-blur-md bg-white/40 hover:bg-white/50 transition-all border border-gray-400/30"
            >
              <Star
                size={18}
                className={isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700 drop-shadow'}
              />
            </button>
          </div>

          {/* 중앙 뜻 영역 */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 py-8 pointer-events-auto">
            {/* 한국어 뜻 */}
            <div className="text-3xl sm:text-4xl font-bold text-center text-gray-900 drop-shadow-lg mb-4" style={{ textShadow: '0 4px 12px rgba(255,255,255,0.9)' }}>
              {word.meaning}
            </div>

            {/* 히브리어 원문 */}
            <div
              className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2"
              dir="rtl"
              style={{ textShadow: '0 2px 8px rgba(255,255,255,0.8)' }}
            >
              {word.hebrew}
            </div>

            {/* 발음 */}
            {word.korean && (
              <div className="text-base text-gray-700 mb-6" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.8)' }}>
                [{word.korean}]
              </div>
            )}

            {/* 구절 참조 */}
            <div className="text-sm text-gray-700 backdrop-blur-sm bg-white/30 px-4 py-2 rounded-full border border-gray-400/30" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>
              📖 {reference}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
