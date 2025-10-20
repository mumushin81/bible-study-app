import React, { useState } from 'react';
import { Volume2, Search, Settings, ChevronLeft, ChevronRight, ArrowUp, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
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

export default function App() {
  // Auth
  const { user } = useAuth();

  // State
  const [darkMode, setDarkMode] = useState(false);
  const [currentBookId, setCurrentBookId] = useState('genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'verse' | 'vocabulary' | 'quiz' | 'notes' | 'growth'>('verse');
  const [showBookSheet, setShowBookSheet] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHebrewHint, setShowHebrewHint] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

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

  // 히브리어 힌트 표시 여부 체크 (localStorage)
  React.useEffect(() => {
    try {
      const hintCount = parseInt(localStorage.getItem('hebrewHintShown') || '0');
      if (hintCount >= 3) {
        setShowHebrewHint(false);
      }
    } catch (error) {
      console.error('Failed to load hint count:', error);
    }
  }, []);

  // 힌트 닫기 핸들러
  const handleCloseHint = () => {
    try {
      const currentCount = parseInt(localStorage.getItem('hebrewHintShown') || '0');
      localStorage.setItem('hebrewHintShown', String(currentCount + 1));
      setShowHebrewHint(false);
    } catch (error) {
      console.error('Failed to save hint count:', error);
      setShowHebrewHint(false);
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

  // 네비게이션 핸들러
  const goToPrevVerse = () => {
    if (currentVerseIndex > 0) {
      triggerHaptic(10);
      setCurrentVerseIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextVerse = () => {
    if (currentVerseIndex < chapterVerses.length - 1) {
      triggerHaptic(10);
      setCurrentVerseIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBookSelect = (bookId: string, chapter: number) => {
    triggerHaptic(15);
    setCurrentBookId(bookId);
    setCurrentChapter(chapter);
    setCurrentVerseIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950'
        : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 backdrop-blur-xl border-b shadow-lg ${
        darkMode ? 'bg-slate-900/80 border-cyan-500/20' : 'bg-white/70 border-gray-200/50'
      }`} style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        {/* Progress Bar */}
        <motion.div
          className={`h-1 ${darkMode ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${((currentVerseIndex + 1) / chapterVerses.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Book/Chapter Selector - 간결한 배지 스타일 */}
          <button
            onClick={() => setShowBookSheet(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all backdrop-blur-md border ${
              darkMode
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/30 text-cyan-50'
                : 'bg-white/80 hover:bg-white/95 border-amber-200 text-gray-900'
            }`}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span className="text-base">📕</span>
            <span className="text-xs font-medium">성경</span>
            <span className="text-sm font-bold whitespace-nowrap">{currentBook?.name || '창세기'} {currentChapter}장</span>
            <span className={`text-xs ${darkMode ? 'opacity-70' : 'opacity-60'}`}>
              {currentVerseIndex + 1}/{chapterVerses.length}절
            </span>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'
              }`}
            >
              <Search className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'
              }`}
            >
              <Settings className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>

            {/* Login or User Profile */}
            {user ? (
              <UserProfile darkMode={darkMode} />
            ) : (
              <motion.button
                onClick={() => setShowLoginModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all backdrop-blur-md border ${
                  darkMode
                    ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/30 text-cyan-50'
                    : 'bg-white/80 hover:bg-white/95 border-purple-200 text-purple-600'
                }`}
                style={{
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">로그인</span>
              </motion.button>
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
            <VocabularyTab darkMode={darkMode} />
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
