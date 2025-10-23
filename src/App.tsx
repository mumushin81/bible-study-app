import React, { useState } from 'react';
import { Volume2, Search, Settings, ChevronLeft, ChevronRight, ArrowUp, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavigation from './components/BottomNavigation';
import BookSelectionBottomSheet from './components/BookSelectionBottomSheet';
import SwipeableContent from './components/SwipeableContent';
import VerseIndicator from './components/VerseIndicator';
import StudyTab from './components/StudyTab';
import VocabularyTab from './components/VocabularyTab';
import GrowthTab from './components/GrowthTab';
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';
import UserProfile from './components/UserProfile';
import { useAuth } from './hooks/useAuth';
import { useUserProgress } from './hooks/useUserProgress';
import { useVerses } from './hooks/useVerses';
import { useBooks } from './hooks/useBooks';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useAppNavigation } from './hooks/useAppNavigation';

export default function App() {
  // Auth
  const { user } = useAuth();
  const { preferences, updatePreferences } = useUserPreferences();

  // Navigation state (useReducer로 통합)
  const { navigation, setBook, setVerseIndex, nextVerse, prevVerse } = useAppNavigation();
  const { bookId: currentBookId, chapter: currentChapter, verseIndex: currentVerseIndex } = navigation;

  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'verse' | 'vocabulary' | 'quiz' | 'notes' | 'growth'>('verse');
  const [showBookSheet, setShowBookSheet] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [vocabularyViewMode, setVocabularyViewMode] = useState<'words' | 'roots' | 'dashboard'>('words');
  const [vocabularyBookId, setVocabularyBookId] = useState<string>('genesis');

  // Audio State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // 데이터베이스에서 구절 가져오기
  const { verses: chapterVerses, loading: versesLoading, error: versesError } = useVerses({
    bookId: currentBookId,
    chapter: currentChapter,
  });
  const { getBookById } = useBooks();

  const verseData = chapterVerses[currentVerseIndex] || chapterVerses[0];
  const currentBook = getBookById(currentBookId);

  // User progress for current verse
  const { progress, markAsCompleted } = useUserProgress(verseData?.id || '');

  // 히브리어 힌트 표시 여부 (user_preferences 사용)
  const showHebrewHint = user ? (preferences?.show_hebrew_hint ?? true) : true;

  // 힌트 닫기 핸들러
  const handleCloseHint = async () => {
    if (user && updatePreferences) {
      await updatePreferences({ show_hebrew_hint: false });
    }
  };

  // 스크롤 감지
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 음성 목록 로드
  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 음성 재생
  const playPronunciation = (text: string) => {
    try {
      if (!window.speechSynthesis) {
        alert('음성 기능을 사용할 수 없습니다.');
        return;
      }

      window.speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const hebrewVoice = voices.find(v => v.lang.startsWith('he'));

        if (hebrewVoice) {
          utterance.voice = hebrewVoice;
          utterance.lang = 'he-IL';
        }

        utterance.rate = 0.8;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.error('음성 재생 실패:', error);
    }
  };

  // 햅틱 피드백
  const triggerHaptic = (intensity: number = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity);
    }
  };

  // 네비게이션 핸들러 (useReducer 사용)
  const goToPrevVerse = () => {
    if (currentVerseIndex > 0) {
      triggerHaptic(10);
      prevVerse();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextVerse = () => {
    if (currentVerseIndex < chapterVerses.length - 1) {
      triggerHaptic(10);
      nextVerse();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBookSelect = (bookId: string, chapter: number) => {
    triggerHaptic(15);
    if (activeTab === 'verse') {
      setBook(bookId, chapter);
    } else if (activeTab === 'vocabulary') {
      setVocabularyBookId(bookId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950'
        : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'
    }`}>
      {/* Header - Minimal Modern Design */}
      <div className={`sticky top-0 z-30 backdrop-blur-xl ${
        darkMode ? 'bg-slate-900/50' : 'bg-white/50'
      }`} style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        {/* Ultra-thin Progress Bar - Only show on verse tab */}
        {activeTab === 'verse' && (
          <motion.div
            className={`h-0.5 ${darkMode ? 'bg-purple-400' : 'bg-purple-600'}`}
            initial={{ width: '0%' }}
            animate={{ width: `${((currentVerseIndex + 1) / chapterVerses.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        )}

        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left Side - Minimal context indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3"
            >
              {activeTab === 'verse' && (
                <button
                  onClick={() => setShowBookSheet(true)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all ${
                    darkMode
                      ? 'hover:bg-white/10 text-gray-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* Colorful Bible Icon SVG */}
                  <svg
                    viewBox="0 0 64 64"
                    className="w-8 h-8 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="bible-cover-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                      <linearGradient id="bible-pages-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FEF3C7" />
                        <stop offset="100%" stopColor="#FDE68A" />
                      </linearGradient>
                      <linearGradient id="bible-cross-1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                      <radialGradient id="bible-glow-1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Glow effect */}
                    <circle cx="32" cy="32" r="28" fill="url(#bible-glow-1)" opacity="0.3" />

                    {/* Book cover */}
                    <rect
                      x="14" y="12" width="36" height="40" rx="3"
                      fill="url(#bible-cover-1)"
                      filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
                    />

                    {/* Book spine detail */}
                    <rect x="14" y="12" width="4" height="40" rx="2" fill="#6D28D9" opacity="0.5" />

                    {/* Pages */}
                    <rect
                      x="20" y="14" width="28" height="36" rx="1"
                      fill="url(#bible-pages-1)"
                      opacity="0.9"
                    />

                    {/* Page lines */}
                    <line x1="24" y1="22" x2="44" y2="22" stroke="#D97706" strokeWidth="0.5" opacity="0.3" />
                    <line x1="24" y1="26" x2="44" y2="26" stroke="#D97706" strokeWidth="0.5" opacity="0.3" />
                    <line x1="24" y1="30" x2="44" y2="30" stroke="#D97706" strokeWidth="0.5" opacity="0.3" />

                    {/* Golden Cross */}
                    <g filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))">
                      <rect x="30" y="34" width="4" height="12" rx="1" fill="url(#bible-cross-1)" />
                      <rect x="26" y="38" width="12" height="4" rx="1" fill="url(#bible-cross-1)" />
                    </g>

                    {/* Highlight */}
                    <rect x="18" y="14" width="2" height="8" rx="1" fill="#FFFFFF" opacity="0.4" />
                  </svg>

                  <span className="text-base font-semibold">성경</span>
                </button>
              )}

              {activeTab === 'vocabulary' && (
                <div className="flex items-center gap-2">
                  {/* 단어장 버튼 */}
                  <button
                    onClick={() => setVocabularyViewMode('words')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      vocabularyViewMode === 'words'
                        ? darkMode
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : darkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-base">📚</span>
                    <span>단어장</span>
                  </button>

                  {/* 어근학습 버튼 */}
                  <button
                    onClick={() => setVocabularyViewMode('roots')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      vocabularyViewMode === 'roots'
                        ? darkMode
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                          : 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                        : darkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-base">🌱</span>
                    <span>어근</span>
                  </button>

                  {/* 진도 버튼 */}
                  <button
                    onClick={() => setVocabularyViewMode('dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      vocabularyViewMode === 'dashboard'
                        ? darkMode
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : darkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-base">📊</span>
                    <span>진도</span>
                  </button>
                </div>
              )}

              {activeTab === 'quiz' && (
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  퀴즈
                </span>
              )}

              {activeTab === 'notes' && (
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  노트
                </span>
              )}

              {activeTab === 'growth' && (
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  성장
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Right Side - Icon-only buttons */}
          <div className="flex items-center gap-1">
            {/* Search - Show on verse, vocabulary, notes tabs */}
            {(activeTab === 'verse' || activeTab === 'vocabulary' || activeTab === 'notes') && (
              <button
                className={`p-2 rounded-lg transition-all ${
                  darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all ${
                darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <span className="text-base">{darkMode ? '☀️' : '🌙'}</span>
            </button>

            {/* Settings */}
            <button
              className={`p-2 rounded-lg transition-all ${
                darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {/* Login or User Profile */}
            {user ? (
              <UserProfile darkMode={darkMode} />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  darkMode
                    ? 'hover:bg-white/10 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <SwipeableContent
        onSwipeLeft={activeTab === 'verse' ? goToNextVerse : undefined}
        onSwipeRight={activeTab === 'verse' ? goToPrevVerse : undefined}
        canSwipeLeft={activeTab === 'verse' && currentVerseIndex < chapterVerses.length - 1}
        canSwipeRight={activeTab === 'verse' && currentVerseIndex > 0}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Tab Content */}
          {activeTab === 'verse' && (
            <>
              {/* Loading State */}
              {versesLoading && (
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
                      구절을 불러오는 중...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {!versesLoading && versesError && (
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
                      데이터를 불러오지 못했습니다
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {versesError.message}
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
              )}

              {/* Empty State */}
              {!versesLoading && !versesError && chapterVerses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-3xl shadow-xl p-8 text-center ${
                    darkMode
                      ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
                      : 'bg-white/90 border border-amber-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-4xl">📖</span>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      구절이 없습니다
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      이 장의 구절이 아직 데이터베이스에 없습니다.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Verse Card */}
              {!versesLoading && !versesError && verseData && (
                <motion.div
                  key={`verse-${currentVerseIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`rounded-3xl shadow-xl p-6 mb-4 transition-transform hover:-translate-y-1 ${
                  darkMode
                    ? 'bg-gradient-to-br from-slate-900/60 via-indigo-900/40 to-violet-900/50 border border-cyan-400/20'
                    : 'bg-white/90 border border-amber-200'
                }`}>
                {/* Verse Reference with Navigation */}
                <div className="flex items-center justify-between mb-4 gap-2">
                  <motion.button
                    onClick={goToPrevVerse}
                    disabled={currentVerseIndex === 0}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                      darkMode
                        ? 'hover:bg-cyan-500/20 text-cyan-300'
                        : 'hover:bg-purple-100 text-purple-600'
                    }`}
                    aria-label="이전 구절"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline text-sm font-medium">이전</span>
                  </motion.button>

                  <h2 className={`text-xl font-bold flex-1 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {verseData.reference}
                  </h2>

                  <motion.button
                    onClick={goToNextVerse}
                    disabled={currentVerseIndex === chapterVerses.length - 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                      darkMode
                        ? 'hover:bg-cyan-500/20 text-cyan-300'
                        : 'hover:bg-purple-100 text-purple-600'
                    }`}
                    aria-label="다음 구절"
                  >
                    <span className="hidden sm:inline text-sm font-medium">다음</span>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

                {/* Hebrew Text */}
                <div className={`p-6 rounded-2xl mb-4 ${
                  darkMode
                    ? 'bg-gradient-to-br from-slate-800/50 to-indigo-900/50 border border-cyan-400/20'
                    : 'bg-purple-50 border border-purple-200'
                }`}>
                  {showHebrewHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-center justify-center gap-2 mb-3 px-4 py-2 rounded-full ${
                        darkMode
                          ? 'bg-cyan-500/20 text-cyan-200'
                          : 'bg-purple-200/70 text-purple-900'
                      }`}
                    >
                      <span className="text-xs font-medium">← 이 방향으로 읽기</span>
                      <button
                        onClick={handleCloseHint}
                        className={`ml-2 text-xs underline ${
                          darkMode ? 'hover:text-purple-100' : 'hover:text-purple-700'
                        }`}
                      >
                        알겠어요
                      </button>
                    </motion.div>
                  )}
                  <div className="flex justify-center mb-3">
                    <motion.button
                      onClick={() => playPronunciation(verseData.hebrew)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        darkMode
                          ? 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white`}
                    >
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                      <span className="text-sm">발음 듣기</span>
                    </motion.button>
                  </div>
                  <p
                    data-testid="hebrew-text"
                    className={`text-center font-serif whitespace-nowrap overflow-hidden ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{
                      fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                    }}
                    dir="rtl"
                  >
                    {verseData.hebrew}
                  </p>
                </div>

                {/* Translations */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-400/20' : 'bg-blue-50'}`}>
                    <div className={`text-xs font-semibold mb-2 text-center ${
                      darkMode ? 'text-cyan-300' : 'text-blue-700'
                    }`}>
                      📢 IPA 발음
                    </div>
                    <p
                      className={`font-mono text-center leading-relaxed ${darkMode ? 'text-blue-100' : 'text-gray-900'}`}
                      style={{
                        fontSize: 'clamp(0.7rem, 1.6vw, 0.85rem)',
                        wordBreak: 'break-all',
                        lineHeight: '1.8'
                      }}
                      dir="rtl"
                    >
                      {verseData.ipa}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-r from-fuchsia-900/30 to-pink-900/30 border border-fuchsia-400/20' : 'bg-pink-50'}`}>
                    <div className={`text-xs font-semibold mb-2 text-center ${
                      darkMode ? 'text-fuchsia-300' : 'text-pink-700'
                    }`}>
                      🔊 한글 발음
                    </div>
                    <p
                      className={`text-center leading-relaxed ${darkMode ? 'text-pink-100' : 'text-gray-900'}`}
                      style={{
                        fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)',
                        wordBreak: 'keep-all',
                        wordWrap: 'break-word',
                        lineHeight: '1.8'
                      }}
                    >
                      {verseData.koreanPronunciation}
                    </p>
                  </div>

                  <div className={`p-5 rounded-xl ${
                    darkMode ? 'bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-400/20' : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                  }`}>
                    <div className={`text-xs font-semibold mb-2 text-center ${
                      darkMode ? 'text-violet-300' : 'text-amber-700'
                    }`}>
                      ✨ 현대어 의역
                    </div>
                    <p
                      className={`text-center leading-relaxed font-medium ${darkMode ? 'text-amber-100' : 'text-gray-900'}`}
                      style={{
                        fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {verseData.modern}
                    </p>
                  </div>
                </div>

                {/* Verse Indicator */}
                <VerseIndicator
                  currentIndex={currentVerseIndex}
                  total={chapterVerses.length}
                  darkMode={darkMode}
                />
              </motion.div>
              )}

              {/* StudyTab - only show if verseData exists */}
              {!versesLoading && !versesError && verseData && (
                <StudyTab
                  verse={verseData}
                  darkMode={darkMode}
                  onMarkStudied={markAsCompleted}
                  studied={progress?.completed || false}
                  reviewCount={progress?.review_count || 0}
                  isAuthenticated={!!user}
                />
              )}
            </>
          )}

          {activeTab === 'vocabulary' && (
            <VocabularyTab
              darkMode={darkMode}
              viewMode={vocabularyViewMode}
              onViewModeChange={setVocabularyViewMode}
              selectedBook={vocabularyBookId}
              onBookSelectClick={() => setShowBookSheet(true)}
            />
          )}

          {activeTab === 'quiz' && (
            <div className={`rounded-3xl shadow-xl p-6 text-center ${
              darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-white/90 border border-amber-200'
            }`}>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                🎯 퀴즈 기능은 준비 중입니다
              </p>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className={`rounded-3xl shadow-xl p-6 text-center ${
              darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-white/90 border border-amber-200'
            }`}>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                📝 노트 기능은 준비 중입니다
              </p>
            </div>
          )}

          {activeTab === 'growth' && (
            <GrowthTab darkMode={darkMode} />
          )}
        </div>
      </SwipeableContent>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        darkMode={darkMode}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={`fixed bottom-24 right-6 z-40 text-white p-4 rounded-full shadow-2xl ${
            darkMode
              ? 'bg-gradient-to-r from-cyan-500 to-violet-500'
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
          aria-label="맨 위로"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}

      {/* Book Selection Bottom Sheet */}
      <BookSelectionBottomSheet
        isOpen={showBookSheet}
        onClose={() => setShowBookSheet(false)}
        onSelectBook={handleBookSelect}
        darkMode={darkMode}
        currentBookId={currentBookId}
        currentChapter={currentChapter}
        bookOnly={activeTab === 'vocabulary'} // 단어장 탭에서는 책만 선택
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
        darkMode={darkMode}
      />

      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToLogin={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
        darkMode={darkMode}
      />
    </div>
  );
}
