import { memo, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { Word, WordWithContext } from '../../../hooks/useWords';
import HebrewIcon from '../../shared/HebrewIcon';
import { speakHebrew } from '../../../utils/wordHelpers';
import { FlashCardHeader } from './FlashCardHeader';

interface GrammarColorValues {
  bg: string;
  text: string;
  border: string;
}

interface FlashCardFrontProps {
  word: Word | WordWithContext;
  grammarLabel?: string;
  grammarColors?: GrammarColorValues | null;
  isBookmarked: boolean;
  onBookmark: (e: React.MouseEvent) => void;
}

/**
 * FlashCard 앞면 - 배경이미지 + 히브리어 원문
 * 더블탭 힌트 표시
 */
export const FlashCardFront = memo(function FlashCardFront({
  word,
  grammarLabel,
  grammarColors,
  isBookmarked,
  onBookmark,
}: FlashCardFrontProps) {
  const handleSpeak = useCallback(() => {
    speakHebrew(word.hebrew);
  }, [word.hebrew]);

  const handleBookmark = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onBookmark(e);
    },
    [onBookmark]
  );

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl shadow-2xl"
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

      {/* 헤더 (품사, 북마크) */}
      <FlashCardHeader
        grammarLabel={grammarLabel}
        grammarColors={grammarColors}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
      />

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

        {/* IPA 발음 (중앙 정렬) */}
        <div
          className="text-lg sm:text-xl font-medium text-gray-800 drop-shadow-lg mb-2"
          style={{ textShadow: '0 2px 8px rgba(255,255,255,0.8)' }}
        >
          [{word.ipa}]
        </div>

        {/* 음성 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSpeak();
          }}
          className="p-2 rounded-lg bg-gray-800/20 hover:bg-gray-800/30 backdrop-blur-sm text-gray-800 transition-all border border-gray-800/30 mb-2"
          aria-label="발음 듣기"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* 탭 안내 (스크린리더용) */}
        <div
          className="text-xs text-gray-600"
          style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}
        >
          더블 탭하여 뜻 보기
        </div>
      </div>
    </div>
  );
});
