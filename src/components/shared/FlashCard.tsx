import { memo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Word } from '../../types';
import { WordWithContext } from '../../hooks/useWords';
import {
  getWordColor,
  getSimpleGrammar,
} from '../../utils/wordHelpers';
import {
  getGrammarColorValues,
} from '../../utils/grammarColors';
import { useWordAnalysis } from '../../hooks/useWordAnalysis';
import { FlashCardFront } from '../cards/FlashCard/FlashCardFront';
import { FlashCardBack } from '../cards/FlashCard/FlashCardBack';

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

/**
 * 플래시카드 - 앞뒷면 플립 가능
 * 복잡한 로직을 분리하여 유지보수성 향상
 */
export default memo(function FlashCard({
  word,
  darkMode,
  isFlipped,
  onFlip,
  isBookmarked,
  onBookmark,
  reference,
  index = 0,
}: FlashCardProps) {
  const grammarColors = word.grammar ? getGrammarColorValues(word.grammar) : null;
  const grammarLabel = word.grammar ? getSimpleGrammar(word.grammar) : undefined;
  const analysis = useWordAnalysis(word);
  const lastTapRef = useRef<number>(0);

  // 더블 탭 핸들러 (useCallback으로 최적화)
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      onFlip();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [onFlip]);

  // 북마크 핸들러 (useCallback으로 최적화)
  const handleBookmark = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onBookmark();
    },
    [onBookmark]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative cursor-pointer w-full max-w-md mx-auto"
      style={{ perspective: '1000px', aspectRatio: '9/16' }}
      onClick={handleDoubleTap}
      data-testid="flash-card"
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 앞면 */}
        <FlashCardFront
          word={word}
          grammarLabel={grammarLabel}
          grammarColors={grammarColors}
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
        />

        {/* 뒷면 */}
        <FlashCardBack
          word={word}
          grammarLabel={grammarLabel}
          grammarColors={grammarColors}
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
          analysis={analysis}
          reference={reference}
        />
      </motion.div>
    </motion.div>
  );
});
