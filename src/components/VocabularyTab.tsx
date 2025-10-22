import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Volume2, BookOpen, BarChart3, List, Sparkles } from 'lucide-react';
import FlashCard from './shared/FlashCard';
import HebrewIcon from './shared/HebrewIcon';
// import BookProgressDashboard from './BookProgressDashboard'; // TODO: Create this component
import RootFlashcardDeck from './RootFlashcardDeck';
import RootCard from './RootCard';
import { RootGridSkeleton } from './shared/SkeletonLoader';
import { useWords, WordWithContext } from '../hooks/useWords';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSRS } from '../hooks/useSRS';
import { useBooks } from '../hooks/useBooks';
// import { useBookProgress } from '../hooks/useBookProgress'; // TODO: Create this hook
import { useHebrewRoots, type HebrewRoot } from '../hooks/useHebrewRoots';
import {
  getWordEmoji,
  getWordColor,
  getSimpleGrammar,
  getGrammarEmoji,
  getTheologicalMeaning,
  speakHebrew,
} from '../utils/wordHelpers';

interface VocabularyTabProps {
  darkMode: boolean;
  viewMode?: 'words' | 'roots' | 'dashboard';
  onViewModeChange?: (mode: 'words' | 'roots' | 'dashboard') => void;
  selectedBook?: string;
  onBookSelectClick?: () => void;
}

type SubTab = 'all' | 'bookmarked' | 'study' | 'new' | 'review' | 'difficult';
type ViewMode = 'words' | 'dashboard' | 'roots';

export default function VocabularyTab({
  darkMode,
  viewMode: externalViewMode,
  onViewModeChange,
  selectedBook: externalSelectedBook,
  onBookSelectClick
}: VocabularyTabProps) {
  // UI 상태 - external prop이 있으면 사용, 없으면 internal state 사용
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('words');
  const viewMode = externalViewMode ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;

  const [internalSelectedBook, setInternalSelectedBook] = useState<string>('genesis');
  const selectedBook = externalSelectedBook ?? internalSelectedBook;
  const setSelectedBook = setInternalSelectedBook; // 내부에서는 사용 안 함
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [studyMode, setStudyMode] = useState(false);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [selectedRoot, setSelectedRoot] = useState<HebrewRoot | null>(null);
  const [displayedRootsCount, setDisplayedRootsCount] = useState(15); // 초기에 15개만 표시

  // 데이터 hooks
  const { books, loading: booksLoading } = useBooks();
  // const { progress: bookProgress, loading: progressLoading } = useBookProgress(selectedBook); // TODO: Create hook
  const bookProgress = null; // Temporary placeholder
  const progressLoading = false; // Temporary placeholder
  const { words: allWords, loading: wordsLoading, error: wordsError } = useWords({
    bookId: selectedBook,
  });
  const { bookmarkedWords, toggleBookmark, isBookmarked } = useBookmarks();
  const { srsData, updateSRS, isDueForReview, isMastered, getStats } = useSRS();
  const { roots, loading: rootsLoading } = useHebrewRoots();

  // 표시할 어근 목록 (성능 최적화)
  const displayedRoots = useMemo(() => {
    return roots.slice(0, displayedRootsCount);
  }, [roots, displayedRootsCount]);

  // 어근 선택 핸들러 (useCallback으로 최적화)
  const handleRootSelect = useCallback((root: HebrewRoot) => {
    setSelectedRoot(root);
  }, []);

  // 더 보기 핸들러
  const loadMoreRoots = useCallback(() => {
    setDisplayedRootsCount(prev => Math.min(prev + 15, roots.length));
  }, [roots.length]);

  // 플래시카드 뒤집기 토글
  const toggleFlip = (hebrew: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(hebrew)) {
      newFlipped.delete(hebrew);
    } else {
      newFlipped.add(hebrew);
    }
    setFlippedCards(newFlipped);
  };

  // 검색 및 필터링된 단어
  const filteredWords = useMemo(() => {
    let words = allWords;

    // 서브탭 필터
    if (activeSubTab === 'bookmarked') {
      words = words.filter(w => bookmarkedWords.has(w.hebrew));
    } else if (activeSubTab === 'study') {
      words = words.filter(w => isDueForReview(w.hebrew));
    } else if (activeSubTab === 'new') {
      // 새 단어: 한 번도 복습하지 않은 단어
      words = words.filter(w => !srsData.has(w.hebrew));
    } else if (activeSubTab === 'review') {
      // 복습 대기: 오늘 복습해야 하는 단어
      words = words.filter(w => isDueForReview(w.hebrew) && !isMastered(w.hebrew));
    } else if (activeSubTab === 'difficult') {
      // 어려운 단어: 정확도가 60% 이하인 단어
      words = words.filter(w => {
        const srs = srsData.get(w.hebrew);
        if (!srs) return false;
        // 임시로 reviewCount 기준 사용 (나중에 accuracy 추가)
        return srs.reviewCount >= 3 && srs.easeFactor < 2.0;
      });
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      words = words.filter(w =>
        w.hebrew.includes(searchQuery) ||
        w.meaning.toLowerCase().includes(query) ||
        w.korean.toLowerCase().includes(query)
      );
    }

    return words;
  }, [allWords, activeSubTab, bookmarkedWords, searchQuery, isDueForReview, isMastered, srsData]);

  // 통계
  const stats = useMemo(() => {
    const allHebrews = allWords.map(w => w.hebrew);
    const srsStats = getStats(allHebrews);

    const bookmarked = Array.from(bookmarkedWords).filter(hebrew =>
      allWords.some(w => w.hebrew === hebrew)
    ).length;

    return {
      total: srsStats.total,
      bookmarked,
      mastered: srsStats.mastered,
      dueToday: srsStats.dueToday,
    };
  }, [allWords, bookmarkedWords, getStats]);

  // SRS 업데이트 + 다음 카드로 이동
  const handleSRSUpdate = (hebrew: string, quality: number) => {
    updateSRS(hebrew, quality);

    // 다음 카드로
    if (studyMode && currentStudyIndex < filteredWords.length - 1) {
      setCurrentStudyIndex(prev => prev + 1);
      setFlippedCard(null);
    } else if (studyMode) {
      setStudyMode(false);
      setCurrentStudyIndex(0);
    }
  };

  // Helper functions for study mode (암기 모드에서만 사용)
  const getWordEmoji = (word: WordWithContext) => {
    if (word.emoji) return word.emoji;
    const meaning = word.meaning.toLowerCase();

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

    if (word.grammar?.includes('동사')) return '🔥';
    if (word.grammar?.includes('명사')) return '💠';
    if (word.grammar?.includes('형용사')) return '🎨';
    if (word.grammar?.includes('전치사') || word.grammar?.includes('조사')) return '🔗';
    if (word.grammar?.includes('대명사')) return '👉';
    if (word.grammar?.includes('수사')) return '🔢';

    return '📜';
  };

  const getWordColor = (word: WordWithContext) => {
    const grammar = word.grammar?.toLowerCase() || '';

    if (grammar.includes('명사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-blue-900/50 via-blue-800/40 to-indigo-900/50', border: 'border-blue-500/30' }
        : { bg: 'bg-gradient-to-br from-blue-100/90 via-blue-50/90 to-indigo-100/90', border: 'border-blue-300/50' };
    }

    if (grammar.includes('동사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-red-900/50 via-rose-800/40 to-pink-900/50', border: 'border-red-500/30' }
        : { bg: 'bg-gradient-to-br from-red-100/90 via-rose-50/90 to-pink-100/90', border: 'border-red-300/50' };
    }

    if (grammar.includes('형용사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-green-900/50 via-emerald-800/40 to-teal-900/50', border: 'border-green-500/30' }
        : { bg: 'bg-gradient-to-br from-green-100/90 via-emerald-50/90 to-teal-100/90', border: 'border-green-300/50' };
    }

    if (grammar.includes('전치사') || grammar.includes('조사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-yellow-900/50 via-amber-800/40 to-orange-900/50', border: 'border-yellow-500/30' }
        : { bg: 'bg-gradient-to-br from-yellow-100/90 via-amber-50/90 to-orange-100/90', border: 'border-yellow-300/50' };
    }

    if (grammar.includes('부사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-purple-900/50 via-violet-800/40 to-fuchsia-900/50', border: 'border-purple-500/30' }
        : { bg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/90 to-fuchsia-100/90', border: 'border-purple-300/50' };
    }

    if (grammar.includes('접속사')) {
      return darkMode
        ? { bg: 'bg-gradient-to-br from-cyan-900/50 via-sky-800/40 to-blue-900/50', border: 'border-cyan-500/30' }
        : { bg: 'bg-gradient-to-br from-cyan-100/90 via-sky-50/90 to-blue-100/90', border: 'border-cyan-300/50' };
    }

    return darkMode
      ? { bg: 'bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40', border: 'border-purple-400/30' }
      : { bg: 'bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80', border: 'border-purple-200/50' };
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 간단한 품사 변환
  const getSimpleGrammar = (grammar: string) => {
    if (grammar.includes('명사')) return '명사';
    if (grammar.includes('동사')) return '동사';
    if (grammar.includes('형용사')) return '형용사';
    if (grammar.includes('전치사') || grammar.includes('조사')) return '전치사';
    if (grammar.includes('접속사')) return '접속사';
    if (grammar.includes('부사')) return '부사';
    if (grammar.includes('대명사')) return '대명사';
    return '기타';
  };

  // 품사별 이모지
  const getGrammarEmoji = (grammar: string) => {
    if (grammar.includes('명사')) return '💠';
    if (grammar.includes('동사')) return '🔥';
    if (grammar.includes('형용사')) return '🎨';
    if (grammar.includes('전치사') || grammar.includes('조사')) return '🔗';
    if (grammar.includes('접속사')) return '➕';
    if (grammar.includes('부사')) return '💫';
    if (grammar.includes('대명사')) return '👉';
    return '📜';
  };

  // 신학적 의미 제공
  const getTheologicalMeaning = (word: WordWithContext) => {
    const hebrew = word.hebrew;
    const meaning = word.meaning.toLowerCase();

    // 특정 단어들에 대한 신학적 의미
    if (hebrew === 'בְּרֵאשִׁית') {
      return '시간의 절대적 시작점. 하나님이 시간, 공간, 물질을 창조하신 그 순간을 가리킵니다.';
    }
    if (hebrew === 'בָּרָא') {
      return '오직 하나님만이 할 수 있는 무에서 유를 만드는 창조. 인간의 “만들기”와는 차원이 다릅니다.';
    }
    if (hebrew === 'אֱלֹהִים') {
      return '형태는 복수이지만 단수 동사와 사용되는 “존엄의 복수”. 하나님의 무한한 위엄과 권능을 나타냅니다.';
    }
    if (hebrew === 'הַשָּׁמַיִם') {
      return '복수형으로 사용되어 하늘의 방대함과 층차성을 표현. 물리적 하늘과 영적 하늘을 모두 포함합니다.';
    }
    if (hebrew === 'הָאָרֶץ') {
      return '하나님이 인간을 위해 특별히 준비하신 거주 공간. 물리적 환경이자 영적 생활의 무대입니다.';
    }
    if (hebrew === 'אֵת') {
      return '히브리어에만 있는 독특한 문법 요소. 직접 목적어가 특별히 중요함을 강조합니다.';
    }
    if (meaning.includes('빛')) {
      return '단순한 물리적 빛이 아니라 하나님의 진리와 거룩함을 상징하는 영적 실재입니다.';
    }
    if (meaning.includes('어둠')) {
      return '하나님이 아직 빛으로 질서를 부여하지 않은 상태. 혼돈과 무질서를 의미합니다.';
    }
    if (meaning.includes('물')) {
      return '생명의 원소이자 정결을 상징. 세례와 중생의 영적 의미로 확장됩니다.';
    }
    
    // 기본 신학적 의미
    if (word.grammar?.includes('동사')) {
      return '하나님의 적극적인 행위를 나타냄. 창조주로서의 주동적 역할을 강조합니다.';
    }
    if (word.grammar?.includes('명사')) {
      return '하나님이 창조하신 구체적 대상. 모든 피조물에는 하나님의 목적과 뜻이 담겨 있습니다.';
    }
    
    // 기본 메시지
    return '이 단어는 하나님의 창조 사역과 그 분의 성품을 드러내는 중요한 용어입니다.';
  };

  // 로딩 상태
  if (wordsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-3xl shadow-xl p-12 text-center ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
            : 'bg-white/90 border border-amber-200'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent ${
            darkMode ? 'border-cyan-400' : 'border-purple-600'
          }`}></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            단어를 불러오는 중...
          </p>
        </div>
      </motion.div>
    );
  }

  // 에러 상태
  if (wordsError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-3xl shadow-xl p-8 text-center ${
          darkMode
            ? 'bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-red-400/20'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl">⚠️</span>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
            단어를 불러오지 못했습니다
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {wordsError.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-2 rounded-full transition-all ${
              darkMode
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            다시 시도
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* 뷰 모드가 대시보드인 경우 */}
      {viewMode === 'dashboard' && (
        <div>
          {/* 대시보드 */}
          {/* TODO: Create BookProgressDashboard component */}
          <div className={`rounded-3xl shadow-xl p-12 text-center ${
            darkMode
              ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
              : 'bg-white/90 border border-amber-200'
          }`}>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              대시보드 기능은 개발 중입니다.
            </p>
          </div>
        </div>
      )}

      {/* 뷰 모드가 어근 학습인 경우 */}
      {viewMode === 'roots' && !selectedRoot && (
        <div>
          {/* 어근 선택 그리드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl shadow-xl p-6 mb-4 ${
              darkMode
                ? 'bg-gradient-to-br from-slate-900/60 to-purple-900/40 border border-purple-400/20'
                : 'bg-gradient-to-br from-white/90 via-purple-50/50 to-pink-50/50 border border-purple-200'
            }`}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              히브리어 어근 학습
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              학습하고 싶은 어근을 선택하세요. 각 어근에서 파생된 단어들을 플래시카드로 학습할 수 있습니다.
            </p>

            {rootsLoading ? (
              <RootGridSkeleton darkMode={darkMode} />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedRoots.map((root, index) => (
                    <RootCard
                      key={root.id}
                      root={root}
                      darkMode={darkMode}
                      onClick={() => handleRootSelect(root)}
                      index={index}
                    />
                  ))}
                </div>

                {/* 더 보기 버튼 */}
                {displayedRootsCount < roots.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <button
                      onClick={loadMoreRoots}
                      className={`px-8 py-3 rounded-xl font-medium transition-all ${
                        darkMode
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      더 보기 ({roots.length - displayedRootsCount}개 더 있음)
                    </button>
                  </motion.div>
                )}

                {/* 전체 개수 표시 */}
                <div className={`mt-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {displayedRootsCount} / {roots.length} 어근 표시 중
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* 선택된 어근의 플래시카드 덱 */}
      {viewMode === 'roots' && selectedRoot && (
        <RootFlashcardDeck
          root={selectedRoot}
          darkMode={darkMode}
          onClose={() => setSelectedRoot(null)}
        />
      )}

      {/* 뷰 모드가 단어장인 경우 */}
      {viewMode === 'words' && (
        <>
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-xl p-6 mb-4 ${
              darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-gradient-to-br from-white/90 via-amber-50/50 to-orange-50/50 border border-orange-200'
            }`}
          >
        {/* 성경책 선택 버튼 */}
        <div className="mb-4">
          <button
            onClick={onBookSelectClick}
            disabled={booksLoading}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all border-2 ${
              darkMode
                ? 'bg-purple-50/5 border-purple-300/50 text-white hover:bg-purple-50/10'
                : 'bg-purple-50/70 border-purple-300/70 text-gray-900 hover:bg-purple-100/70'
            } ${booksLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* 성경책 SVG 아이콘 (파스텔톤) */}
            <svg viewBox="0 0 64 64" className="w-8 h-8 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="vocab-bible-cover" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E9D5FF" />
                  <stop offset="100%" stopColor="#DDD6FE" />
                </linearGradient>
                <linearGradient id="vocab-bible-pages" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
              </defs>
              {/* 책 커버 */}
              <rect x="16" y="12" width="32" height="40" rx="2" fill="url(#vocab-bible-cover)" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))" />
              {/* 페이지 효과 */}
              <rect x="18" y="14" width="28" height="36" rx="1" fill="url(#vocab-bible-pages)" opacity="0.8" />
              {/* 십자가 */}
              <rect x="30" y="22" width="4" height="12" rx="1" fill="#A78BFA" filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))" />
              <rect x="26" y="26" width="12" height="4" rx="1" fill="#A78BFA" filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))" />
              {/* 북마크 리본 */}
              <path d="M 40 12 L 40 52 L 44 48 L 48 52 L 48 12 Z" fill="#FBCFE8" opacity="0.8" />
            </svg>

            <div className="flex-1 text-left">
              <div className="text-base font-semibold">
                성경
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {booksLoading ? '불러오는 중...' : books.find(b => b.id === selectedBook)?.name || '창세기'}
              </div>
            </div>

            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 책 진도 표시 */}
          {bookProgress && !progressLoading && (
            <div className={`mt-2 p-3 rounded-xl ${
              darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  학습 진도
                </span>
                <span className={`text-sm font-bold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                  {bookProgress.progress_percentage?.toFixed(1) || 0}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${bookProgress.progress_percentage || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  학습: {bookProgress.learned_words || 0}개
                </span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  완벽 암기: {bookProgress.mastered_words || 0}개
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>전체 단어</div>
            <div className="text-2xl font-bold">{stats.total}개</div>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>북마크</div>
            <div className="text-2xl font-bold">{stats.bookmarked}개</div>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>완벽 암기</div>
            <div className="text-2xl font-bold">{stats.mastered}개</div>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>오늘 복습</div>
            <div className="text-2xl font-bold">{stats.dueToday}개</div>
          </div>
        </div>

        {/* 서브 탭 */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              activeSubTab === 'all'
                ? darkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            📚 전체
          </button>
          <button
            onClick={() => setActiveSubTab('bookmarked')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              activeSubTab === 'bookmarked'
                ? darkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            ⭐ 북마크
          </button>
          <button
            onClick={() => setActiveSubTab('study')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              activeSubTab === 'study'
                ? darkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            🎯 암기하기
          </button>
        </div>

        {/* 필터 탭 (새 단어, 복습, 어려운 단어) */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setActiveSubTab('new')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              activeSubTab === 'new'
                ? darkMode
                  ? 'bg-green-600 text-white'
                  : 'bg-green-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            ✨ 새 단어
          </button>
          <button
            onClick={() => setActiveSubTab('review')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              activeSubTab === 'review'
                ? darkMode
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            📝 복습 대기
          </button>
          <button
            onClick={() => setActiveSubTab('difficult')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              activeSubTab === 'difficult'
                ? darkMode
                  ? 'bg-red-600 text-white'
                  : 'bg-red-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            🔥 어려운 단어
          </button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="단어 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </motion.div>

      {/* 컨텐츠 */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'study' && !studyMode ? (
          // 암기하기 대시보드
          <motion.div
            key="study-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-3xl shadow-xl p-6 ${darkMode ? 'bg-gradient-to-br from-slate-900/60 to-violet-900/40 border border-violet-400/20' : 'bg-gradient-to-br from-white/90 via-orange-50/50 to-yellow-50/50 border border-yellow-200'}`}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              오늘의 복습
            </h3>

            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={darkMode ? 'text-purple-300' : 'text-purple-700'}>진행도</span>
                <span className="font-bold">
                  {stats.total - stats.dueToday}/{stats.total}
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats.total - stats.dueToday) / stats.total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  ✅ 완료한 단어
                </div>
                <div className="text-2xl font-bold">{stats.total - stats.dueToday}개</div>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                  📝 남은 단어
                </div>
                <div className="text-2xl font-bold">{stats.dueToday}개</div>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  🏆 완벽히 암기
                </div>
                <div className="text-2xl font-bold">{stats.mastered}개</div>
              </div>
            </div>

            {filteredWords.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setStudyMode(true);
                  setCurrentStudyIndex(0);
                  setFlippedCard(null);
                }}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg"
              >
                🎯 지금 복습 시작하기 ({filteredWords.length}개)
              </motion.button>
            )}
          </motion.div>
        ) : activeSubTab === 'study' && studyMode ? (
          // 플래시카드 복습 모드
          <motion.div
            key="study-mode"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-3xl shadow-xl p-6 ${darkMode ? 'bg-gradient-to-br from-slate-900/60 to-violet-900/40 border border-violet-400/20' : 'bg-gradient-to-br from-white/90 via-orange-50/50 to-yellow-50/50 border border-yellow-200'}`}
          >
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm">
                {currentStudyIndex + 1} / {filteredWords.length}
              </span>
              <button
                onClick={() => {
                  setStudyMode(false);
                  setCurrentStudyIndex(0);
                }}
                className={`px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                종료
              </button>
            </div>

            {filteredWords[currentStudyIndex] && (() => {
              const currentWord = filteredWords[currentStudyIndex];
              const colors = getWordColor(currentWord);
              const emoji = getWordEmoji(currentWord);

              return (
                <div
                  className="relative cursor-pointer"
                  onClick={() => setFlippedCard(flippedCard ? null : currentWord.hebrew)}
                  style={{ perspective: '1000px', minHeight: '400px' }}
                >
                  <motion.div
                    className="relative rounded-2xl"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s',
                      transform: flippedCard === currentWord.hebrew ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* 앞면 - 히브리어만 (StudyTab 스타일) */}
                    <div
                      className={`absolute inset-0 p-6 rounded-2xl backdrop-blur-xl border ${colors.bg} ${colors.border}`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      <div className="text-center py-8">
                        <div className="mb-6 flex justify-center">
                          <HebrewIcon
                            word={currentWord.hebrew}
                            iconSvg={currentWord.iconSvg}
                            size={96}
                            color={darkMode ? '#ffffff' : '#1f2937'}
                            fallback={emoji}
                            className="drop-shadow-lg"
                          />
                        </div>
                        <div
                          className={`text-5xl font-bold mb-4 ${
                            darkMode ? 'text-white drop-shadow-lg' : 'text-gray-900'
                          }`}
                          dir="rtl"
                          style={{ fontFamily: 'David, serif' }}
                        >
                          {currentWord.hebrew}
                        </div>
                        <div
                          className={`text-sm px-4 py-2 rounded-full backdrop-blur-md inline-block ${
                            darkMode
                              ? 'bg-purple-900/30 text-purple-200 border border-purple-500/30'
                              : 'bg-purple-100/70 text-purple-700 border border-purple-300/50'
                          }`}
                        >
                          탭하여 뒷면 보기
                        </div>
                      </div>
                    </div>

                    {/* 뒷면 - 상세 정보 (StudyTab 스타일) */}
                    <div
                      className={`absolute inset-0 p-4 rounded-2xl backdrop-blur-xl border ${colors.bg} ${colors.border}`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      <div className="space-y-2 text-center">
                        {/* 의미 */}
                        <div className="pb-2 border-b border-current/20">
                          <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="mb-1">{emoji}</div>
                          <div
                            className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}
                          >
                            {currentWord.meaning}
                          </div>
                        </div>

                        {/* 발음 */}
                        <div
                          className={`p-2 rounded-xl backdrop-blur-md border ${
                            darkMode
                              ? 'bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30 border-indigo-500/30'
                              : 'bg-gradient-to-r from-indigo-50/70 via-purple-50/70 to-pink-50/70 border-indigo-200/50'
                          }`}
                          style={{
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                          }}
                        >
                          <div className={`text-[0.65rem] font-semibold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            📢 발음
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            {/* IPA 발음 */}
                            {currentWord.ipa && (
                              <div className={`px-2 py-1 rounded-lg backdrop-blur-sm ${
                                darkMode
                                  ? 'bg-blue-900/30 border border-blue-500/30'
                                  : 'bg-blue-50/80 border border-blue-200/50'
                              }`}>
                                <div className={`text-[0.6rem] mb-0.5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                  IPA
                                </div>
                                <div className={`font-mono text-xs font-medium ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                                  {currentWord.ipa}
                                </div>
                              </div>
                            )}

                            {/* 한국어 발음 */}
                            <div className={`px-2 py-1 rounded-lg backdrop-blur-sm ${
                              darkMode
                                ? 'bg-pink-900/30 border border-pink-500/30'
                                : 'bg-pink-50/80 border border-pink-200/50'
                            }`}>
                              <div className={`text-[0.6rem] mb-0.5 ${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>
                                한글
                              </div>
                              <div className={`text-xs font-medium ${darkMode ? 'text-pink-100' : 'text-pink-900'}`}>
                                {currentWord.korean}
                              </div>
                            </div>

                            {/* 발음 듣기 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                speak(currentWord.hebrew);
                              }}
                              className={`p-1.5 rounded-full backdrop-blur-md ${
                                darkMode
                                  ? 'bg-purple-900/40 hover:bg-purple-800/50 border border-purple-500/30'
                                  : 'bg-purple-100/80 hover:bg-purple-200/80 border border-purple-300/50'
                              } transition-all`}
                            >
                              <Volume2 size={14} className={darkMode ? 'text-purple-300' : 'text-purple-700'} />
                            </button>
                          </div>
                        </div>

                        {/* 간단한 품사 */}
                        {currentWord.grammar && (
                          <div className="text-center mb-2">
                            <div className={`inline-block px-3 py-1.5 rounded-lg font-bold ${darkMode ? 'bg-black/30 text-gray-200' : 'bg-white/50 text-gray-800'}`}>
                              {getSimpleGrammar(currentWord.grammar)} {getGrammarEmoji(currentWord.grammar)}
                            </div>
                          </div>
                        )}

                        {/* 알파벳 분해 (letters) */}
                        {currentWord.letters && (
                          <div className={`p-3 rounded-lg mb-2 text-center ${
                            darkMode ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30' : 'bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-300/50'
                          }`}>
                            <div className={`text-xs font-semibold mb-1.5 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                              🔤 알파벳으로 읽기
                            </div>
                            <div className={`text-sm font-medium leading-snug ${darkMode ? 'text-emerald-100' : 'text-emerald-900'}`} dir="rtl">
                              {currentWord.letters}
                            </div>
                          </div>
                        )}

                        {/* 신학적 의미 */}
                        <div className={`p-3 rounded-lg mb-2 ${darkMode ? 'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30' : 'bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-300/50'}`}>
                          <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                            ✨ 성경적 의미
                          </div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-indigo-100' : 'text-indigo-900'}`}>
                            {getTheologicalMeaning(currentWord)}
                          </div>
                        </div>

                        {/* 비슷한 단어 (있을 경우) */}
                        {currentWord.relatedWords && currentWord.relatedWords.length > 0 && (
                          <div className={`p-3 rounded-lg mb-2 ${darkMode ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30' : 'bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border border-blue-300/50'}`}>
                            <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                              🔗 비슷한 단어
                            </div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                              {currentWord.relatedWords.join(', ')}
                            </div>
                          </div>
                        )}

                        {/* 구절 참조 */}
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          출처: {currentWord.verseReference}
                        </div>
                      </div>

                      {/* SRS 버튼 (뒷면일 때만) */}
                      {flippedCard === currentWord.hebrew && (
                        <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => updateSRS(currentWord.hebrew, 2)}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                          >
                            😊 알고있어요
                          </button>
                          <button
                            onClick={() => updateSRS(currentWord.hebrew, 1)}
                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-colors"
                          >
                            🤔 애매해요
                          </button>
                          <button
                            onClick={() => updateSRS(currentWord.hebrew, 0)}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                          >
                            😓 모르겠어요
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })()}
          </motion.div>
        ) : (
          // 그리드/리스트 뷰
          <motion.div
            key="word-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredWords.length === 0 ? (
              <div className={`rounded-3xl shadow-xl p-12 text-center ${darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-white/90 border border-amber-200'}`}>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {searchQuery ? '검색 결과가 없습니다' : activeSubTab === 'bookmarked' ? '북마크한 단어가 없습니다' : '단어가 없습니다'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWords.map((word, index) => (
                  <FlashCard
                    key={word.hebrew}
                    word={word}
                    darkMode={darkMode}
                    isFlipped={flippedCards.has(word.hebrew)}
                    onFlip={() => toggleFlip(word.hebrew)}
                    isBookmarked={bookmarkedWords.has(word.hebrew)}
                    onBookmark={() => toggleBookmark(word.hebrew)}
                    reference={word.verseReference}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
