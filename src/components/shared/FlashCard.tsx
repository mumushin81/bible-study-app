import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Word } from '../../types';

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
  // 이모지 매핑
  const getWordEmoji = (word: Word) => {
    if (word.emoji) return word.emoji;

    const meaning = word.meaning.toLowerCase();

    // 핵심 단어별 특별 이모지
    if (meaning.includes('하나님') || meaning.includes('엘로힘')) return '👑';
    if (meaning.includes('처음') || meaning.includes('태초') || meaning.includes('베레쉬트')) return '🌅';
    if (meaning.includes('창조') || meaning.includes('바라')) return '✨';
    if (meaning.includes('하늘') || meaning.includes('샤마임')) return '☁️';
    if (meaning.includes('땅') || meaning.includes('에레츠') || meaning.includes('지구')) return '🌏';
    if (meaning.includes('빛') || meaning.includes('오르')) return '🌟';
    if (meaning.includes('어둠') || meaning.includes('어두')) return '🌙';
    if (meaning.includes('물') && !meaning.includes('목적')) return '💎';
    if (meaning.includes('바다')) return '🌊';
    if (meaning.includes('해') || meaning.includes('태양')) return '☀️';
    if (meaning.includes('달')) return '🌙';
    if (meaning.includes('별')) return '⭐';
    if (meaning.includes('나무') || meaning.includes('식물')) return '🌳';
    if (meaning.includes('열매') || meaning.includes('과일')) return '🍎';
    if (meaning.includes('새') || meaning.includes('날개')) return '🕊️';
    if (meaning.includes('물고기')) return '🐠';
    if (meaning.includes('사람') || meaning.includes('인간') || meaning.includes('아담')) return '🧑';
    if (meaning.includes('여자') || meaning.includes('이브')) return '👩';
    if (meaning.includes('남자')) return '👨';
    if (meaning.includes('생명') || meaning.includes('살다')) return '💚';
    if (meaning.includes('영') || meaning.includes('숨')) return '💨';
    if (meaning.includes('말씀') || meaning.includes('말하')) return '💬';
    if (meaning.includes('축복')) return '🙏';
    if (meaning.includes('선') || meaning.includes('좋')) return '😊';
    if (meaning.includes('악') || meaning.includes('나쁨')) return '⚠️';
    if (meaning.includes('목적격')) return '🎯';
    if (meaning.includes('그리고') || meaning.includes('접속')) return '➕';

    // 문법적 카테고리별 기본 이모지
    if (word.grammar?.includes('동사')) return '🔥';
    if (word.grammar?.includes('명사')) return '💠';
    if (word.grammar?.includes('형용사')) return '🎨';
    if (word.grammar?.includes('전치사') || word.grammar?.includes('조사')) return '🔗';
    if (word.grammar?.includes('대명사')) return '👉';
    if (word.grammar?.includes('수사')) return '🔢';

    return '📜';
  };

  // 품사별 색상 매핑
  const getWordColor = (word: Word) => {
    const grammar = word.grammar?.toLowerCase() || '';

    // 명사 - 파란색 계열
    if (grammar.includes('명사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-blue-900/50 via-blue-800/40 to-indigo-900/50', border: 'border-blue-500/30' }
        : { bg: 'bg-gradient-to-br from-blue-100/90 via-blue-50/90 to-indigo-100/90', border: 'border-blue-300/50' };
    }

    // 동사 - 빨간색 계열
    if (grammar.includes('동사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-red-900/50 via-rose-800/40 to-pink-900/50', border: 'border-red-500/30' }
        : { bg: 'bg-gradient-to-br from-red-100/90 via-rose-50/90 to-pink-100/90', border: 'border-red-300/50' };
    }

    // 형용사 - 초록색 계열
    if (grammar.includes('형용사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-green-900/50 via-emerald-800/40 to-teal-900/50', border: 'border-green-500/30' }
        : { bg: 'bg-gradient-to-br from-green-100/90 via-emerald-50/90 to-teal-100/90', border: 'border-green-300/50' };
    }

    // 전치사/조사 - 노란색 계열
    if (grammar.includes('전치사') || grammar.includes('조사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-yellow-900/50 via-amber-800/40 to-orange-900/50', border: 'border-yellow-500/30' }
        : { bg: 'bg-gradient-to-br from-yellow-100/90 via-amber-50/90 to-orange-100/90', border: 'border-yellow-300/50' };
    }

    // 부사 - 보라색 계열
    if (grammar.includes('부사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-purple-900/50 via-violet-800/40 to-fuchsia-900/50', border: 'border-purple-500/30' }
        : { bg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/90 to-fuchsia-100/90', border: 'border-purple-300/50' };
    }

    // 접속사 - 청록색 계열
    if (grammar.includes('접속사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-cyan-900/50 via-sky-800/40 to-blue-900/50', border: 'border-cyan-500/30' }
        : { bg: 'bg-gradient-to-br from-cyan-100/90 via-sky-50/90 to-blue-100/90', border: 'border-cyan-300/50' };
    }

    // 기타 - 기본 파스텔 그라데이션
    return darkMode
      ? { bg: 'bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40', border: 'border-purple-400/30' }
      : { bg: 'bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80', border: 'border-purple-200/50' };
  };

  // TTS 발음
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const emoji = getWordEmoji(word);
  const colors = getWordColor(word);

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
            <div className="text-7xl mb-6">{emoji}</div>
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
              <div className="text-4xl mb-2">{emoji}</div>
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
                  speak(word.hebrew);
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

            {/* 정보 그리드 - 2열 배치 (품사 + 어근만) */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {/* 품사 */}
              {word.grammar && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-black/20' : 'bg-white/40'
                }`}>
                  <div className={`text-[0.7rem] font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    📝 품사
                  </div>
                  <div className={`text-sm font-medium leading-snug ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {word.grammar}
                  </div>
                </div>
              )}

              {/* 어근 */}
              {word.root && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-black/20' : 'bg-white/40'
                }`}>
                  <div className={`text-[0.7rem] font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    🌱 어근
                  </div>
                  <div className={`text-sm font-medium leading-snug ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {word.root}
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
