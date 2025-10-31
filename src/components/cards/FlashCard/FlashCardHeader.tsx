import { memo } from 'react';
import { Star } from 'lucide-react';
import { buttonStyles } from '../../../utils/cardStyles';

interface GrammarColorValues {
  bg: string;
  text: string;
  border: string;
}

interface FlashCardHeaderProps {
  grammarLabel?: string;
  grammarColors?: GrammarColorValues | null;
  isBookmarked: boolean;
  onBookmark: (e: React.MouseEvent) => void;
}

/**
 * FlashCard의 헤더 (품사 표시 + 북마크 버튼)
 * 앞뒷면에서 동일하게 사용되므로 분리
 */
export const FlashCardHeader = memo(function FlashCardHeader({
  grammarLabel,
  grammarColors,
  isBookmarked,
  onBookmark,
}: FlashCardHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 pointer-events-auto">
      {/* 품사 표시 (색상 적용) */}
      {grammarLabel && grammarColors && (
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
          style={{
            backgroundColor: `${grammarColors.bg}cc`,
            color: grammarColors.text,
            borderColor: `${grammarColors.border}80`,
          }}
        >
          {grammarLabel}
        </div>
      )}

      {/* 북마크 버튼 */}
      <button
        onClick={onBookmark}
        className={`${grammarLabel ? 'ml-auto' : 'ml-auto'} ${buttonStyles.bookmark}`}
        aria-label={isBookmarked ? '북마크 해제' : '북마크'}
      >
        <Star
          size={18}
          className={
            isBookmarked
              ? 'fill-yellow-500 text-yellow-500'
              : 'text-gray-700 drop-shadow'
          }
        />
      </button>
    </div>
  );
});
