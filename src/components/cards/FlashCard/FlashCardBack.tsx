import { memo, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { Word } from '../../../types';
import type { WordWithContext } from '../../../hooks/useWords';
import FlashcardImg from '../../shared/HebrewIcon';
import { speakHebrew } from '../../../utils/wordHelpers';
import { FlashCardHeader } from './FlashCardHeader';
import type { WordAnalysisResult } from '../../../hooks/useWordAnalysis';

interface GrammarColorValues {
  bg: string;
  text: string;
  border: string;
}

interface FlashCardBackProps {
  word: Word | WordWithContext;
  grammarLabel?: string;
  grammarColors?: GrammarColorValues | null;
  isBookmarked: boolean;
  onBookmark: (e: React.MouseEvent) => void;
  analysis: WordAnalysisResult;
  reference: string;
}

/**
 * FlashCard 뒷면 - 한글 뜻, 어근 분석
 * 복잡한 내용을 스크롤 가능하게 구성
 */
export const FlashCardBack = memo(function FlashCardBack({
  word,
  grammarLabel,
  grammarColors,
  isBookmarked,
  onBookmark,
  analysis,
  reference,
}: FlashCardBackProps) {
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
        transform: 'rotateY(180deg) translateZ(0)',
        isolation: 'isolate',
      }}
    >
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        <FlashcardImg
          word={word.hebrew}
          flashcardImgUrl={word.flashcardImgUrl}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 블러 효과 오버레이 */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background:
            'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.3) 100%)',
        }}
      />

      {/* 헤더 (품사, 북마크) */}
      <FlashCardHeader
        grammarLabel={grammarLabel}
        grammarColors={grammarColors}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-start gap-3 px-4 py-16 pb-8 overflow-y-auto pointer-events-auto">
        {/* 한국어 뜻 (가장 크게) */}
        <div className="w-full max-w-sm px-6 py-4 bg-blue-50/90 dark:bg-blue-900/30 border-2 border-blue-200/80 dark:border-blue-700/50 rounded-xl backdrop-blur-sm">
          <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 text-center break-keep">
            {word.meaning}
          </div>
        </div>

        {/* 원문 단어 + 한국어 발음 */}
        <div className="w-full max-w-sm px-4 py-3 bg-purple-50/90 dark:bg-purple-900/30 border-2 border-purple-200/80 dark:border-purple-700/50 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            {/* 히브리어 원문 */}
            <div
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 text-center"
              dir="rtl"
            >
              {word.hebrew}
            </div>
            {/* 한국어 발음 */}
            <div className="text-lg font-medium text-purple-800 dark:text-purple-200 text-center">
              {word.korean}
            </div>
            {/* 음성 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakHebrew(word.hebrew);
              }}
              className="p-1.5 rounded-lg bg-purple-200/50 hover:bg-purple-300/50 dark:bg-purple-700/50 dark:hover:bg-purple-600/50 text-purple-800 dark:text-purple-200 transition-all"
              aria-label="발음 듣기"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 히브리어 읽기 */}
        {word.letters && (
          <div className="w-full max-w-sm px-4 py-3 bg-emerald-50/90 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-700/50 rounded-lg backdrop-blur-sm">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 text-center">
              히브리어 읽기
            </div>
            <div className="flex justify-center gap-2 sm:gap-3">
              {word.letters.split(' + ').map((part, idx) => {
                const match = part.match(/^(.+?)\((.+?)\)$/);
                if (!match) return null;
                const [, letter, pronunciation] = match;
                return (
                  <div key={`letter-${idx}`} className="flex flex-col items-center">
                    <div
                      className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-1"
                      dir="rtl"
                    >
                      {letter}
                    </div>
                    <div className="w-px h-4 bg-emerald-400 dark:bg-emerald-600"></div>
                    <div className="text-sm sm:text-base font-medium text-emerald-700 dark:text-emerald-300 mt-1">
                      {pronunciation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 어근 분석 */}
        {/* 어근 분석 섹션 제거됨 */}

        {/* 구절 출처 (하단) */}
        <div className="mt-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
          📖 {reference}
        </div>
      </div>
    </div>
  );
});
