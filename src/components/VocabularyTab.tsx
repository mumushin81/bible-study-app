import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Volume2, BookOpen, BarChart3, List, Sparkles } from 'lucide-react';
import FlashCard from './shared/FlashCard';
import HebrewIcon from './shared/HebrewIcon';
import BookProgressDashboard from './BookProgressDashboard';
import RootFlashcardDeck from './RootFlashcardDeck';
import RootCard from './RootCard';
import { RootGridSkeleton } from './shared/SkeletonLoader';
import { useWords, WordWithContext } from '../hooks/useWords';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSRS } from '../hooks/useSRS';
import { useBooks } from '../hooks/useBooks';
import { useBookProgress } from '../hooks/useBookProgress';
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
  currentVerseIndex?: number;
}

type SubTab = 'all' | 'bookmarked' | 'new' | 'review';
type ViewMode = 'words' | 'dashboard' | 'roots';

export default function VocabularyTab({
  darkMode,
  viewMode: externalViewMode,
  onViewModeChange,
  selectedBook: externalSelectedBook,
  onBookSelectClick,
  currentVerseIndex
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
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState<HebrewRoot | null>(null);
  const [displayedRootsCount, setDisplayedRootsCount] = useState(15); // 초기에 15개만 표시

  // 데이터 hooks
  const { books, loading: booksLoading } = useBooks();
  const { progress: bookProgress, loading: progressLoading } = useBookProgress(selectedBook);
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

  // 플래시카드 뒤집기 토글 (useCallback으로 함수 참조 유지)
  const toggleFlip = useCallback((hebrew: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(hebrew)) {
      newFlipped.delete(hebrew);
    } else {
      newFlipped.add(hebrew);
    }
    setFlippedCards(newFlipped);
  }, [flippedCards]); // ← flippedCards 변경 시에만 새로운 함수 생성

  // 구절 변경 시 플립 상태 자동 리셋
  // 또는 단어장 탭을 재진입할 때도 리셋 (탭 전환 시 감지하기 위해 activeSubTab도 포함)
  useEffect(() => {
    setFlippedCards(new Set());
  }, [currentVerseIndex, activeSubTab]);

  // 검색 및 필터링된 단어
  const filteredWords = useMemo(() => {
    let words = allWords;

    // 서브탭 필터
    if (activeSubTab === 'bookmarked') {
      words = words.filter(w => bookmarkedWords.has(w.hebrew));
    } else if (activeSubTab === 'new') {
      // 새 단어: 한 번도 복습하지 않은 단어
      words = words.filter(w => !srsData.has(w.hebrew));
    } else if (activeSubTab === 'review') {
      // 복습 대기: 오늘 복습해야 하는 단어
      words = words.filter(w => isDueForReview(w.hebrew) && !isMastered(w.hebrew));
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

  // Helper functions for study mode (암기 모드에서만 사용)
  const getWordEmoji = (word: WordWithContext) => {
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
        <BookProgressDashboard
          darkMode={darkMode}
          onSelectBook={(bookId) => {
            setInternalSelectedBook(bookId);
            setInternalViewMode('words');
          }}
        />
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
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all shadow-lg ${
              darkMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
            } ${booksLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* 책 아이콘 (간단하고 명확하게) */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
              darkMode ? 'bg-white/20' : 'bg-white/30'
            }`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z"/>
              </svg>
            </div>

            <div className="flex-1 text-left">
              <div className="text-xs opacity-90 mb-1">
                현재 선택된 책
              </div>
              <div className="text-xl font-bold">
                {booksLoading ? '불러오는 중...' : books.find(b => b.id === selectedBook)?.name || '창세기'}
              </div>
            </div>

            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
                  animate={{ width: `${Math.min(Math.max(bookProgress.progress_percentage || 0, 0), 100)}%` }}
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

        {/* 필터 버튼 */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all mb-4 flex items-center justify-between ${
            darkMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            필터
          </span>
          <span className="text-sm opacity-80">
            {activeSubTab === 'all' && '📚 전체'}
            {activeSubTab === 'bookmarked' && '⭐ 북마크'}
            {activeSubTab === 'new' && '✨ 새 단어'}
            {activeSubTab === 'review' && '📝 복습 대기'}
          </span>
        </button>

        {/* 검색 */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="단어 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFlippedCards(new Set()); // 검색어 변경 시 flip 상태 리셋
            }}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </motion.div>

      {/* 필터 Bottom Sheet */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col ${
                darkMode
                  ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
                  : 'bg-gradient-to-br from-white via-purple-50 to-pink-50'
              }`}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📊 필터 선택
                </h3>

              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* 필터 옵션 */}
                <div className="space-y-3 mb-4">
                  {/* 전체 */}
                  <button
                    onClick={() => {
                      setActiveSubTab('all');
                      setFlippedCards(new Set()); // Flip 상태 리셋
                    }}
                    className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 hover:scale-105 active:scale-95 ${
                      activeSubTab === 'all'
                        ? darkMode
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                        : darkMode
                          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white'
                          : 'bg-white hover:bg-purple-50 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    <div className="text-left flex-1">
                      <div className="font-bold text-base">전체</div>
                      <div className={`text-xs ${activeSubTab === 'all' ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        모든 단어 보기
                      </div>
                    </div>
                  </button>

                  {/* 북마크 */}
                  <button
                    onClick={() => {
                      setActiveSubTab('bookmarked');
                      setFlippedCards(new Set()); // Flip 상태 리셋
                    }}
                    className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 hover:scale-105 active:scale-95 ${
                      activeSubTab === 'bookmarked'
                        ? darkMode
                          ? 'bg-gradient-to-br from-yellow-600 to-amber-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-lg'
                        : darkMode
                          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white'
                          : 'bg-white hover:bg-yellow-50 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    <div className="text-left flex-1">
                      <div className="font-bold text-base">북마크</div>
                      <div className={`text-xs ${activeSubTab === 'bookmarked' ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        즐겨찾기한 단어
                      </div>
                    </div>
                  </button>

                  {/* 새 단어 */}
                  <button
                    onClick={() => {
                      setActiveSubTab('new');
                      setFlippedCards(new Set()); // Flip 상태 리셋
                    }}
                    className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 hover:scale-105 active:scale-95 ${
                      activeSubTab === 'new'
                        ? darkMode
                          ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                        : darkMode
                          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white'
                          : 'bg-white hover:bg-green-50 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V9.99h14V8.99L12 4.19 5 8.99v.01z"/>
                    </svg>
                    <div className="text-left flex-1">
                      <div className="font-bold text-base">새 단어</div>
                      <div className={`text-xs ${activeSubTab === 'new' ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        처음 보는 단어
                      </div>
                    </div>
                  </button>

                  {/* 복습 대기 */}
                  <button
                    onClick={() => {
                      setActiveSubTab('review');
                      setFlippedCards(new Set()); // Flip 상태 리셋
                    }}
                    className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 hover:scale-105 active:scale-95 ${
                      activeSubTab === 'review'
                        ? darkMode
                          ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg'
                        : darkMode
                          ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white'
                          : 'bg-white hover:bg-orange-50 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                    </svg>
                    <div className="text-left flex-1">
                      <div className="font-bold text-base">복습 대기</div>
                      <div className={`text-xs ${activeSubTab === 'review' ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        복습이 필요한 단어
                      </div>
                    </div>
                  </button>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      darkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all shadow-lg"
                  >
                    확인
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 컨텐츠 */}
      <AnimatePresence mode="wait">
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
                {filteredWords.map((word, index) => {
                  // 각 카드마다 고유한 키: verseReference + hebrew + index 조합
                  // (같은 구절에서 같은 단어가 여러 번 나타나도 고유하도록 index 포함)
                  const cardKey = `${word.verseReference}-${word.hebrew}-${index}`;

                  return (
                    <FlashCard
                      key={cardKey}
                      word={word}
                      darkMode={darkMode}
                      isFlipped={flippedCards.has(cardKey)}
                      onFlip={() => toggleFlip(cardKey)}
                      isBookmarked={bookmarkedWords.has(word.hebrew)}
                      onBookmark={() => toggleBookmark(word.hebrew)}
                      reference={word.verseReference}
                      index={index}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
