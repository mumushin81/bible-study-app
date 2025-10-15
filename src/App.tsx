import React, { useState } from 'react';
import { Volume2, Search, Settings, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { verses } from './data/verses';
import { getBookById } from './data/bibleBooks';
import BottomNavigation from './components/BottomNavigation';
import BookSelectionBottomSheet from './components/BookSelectionBottomSheet';
import SwipeableContent from './components/SwipeableContent';
import VerseIndicator from './components/VerseIndicator';
import StudyTab from './components/StudyTab';
import VocabularyTab from './components/VocabularyTab';

export default function App() {
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

  // 현재 책과 장의 구절들 필터링
  const chapterVerses = verses.filter(v => {
    // TODO: 현재는 창세기만 지원하므로 임시로 이렇게 처리
    const match = v.id.match(/^gen(\d+)-(\d+)$/);
    if (!match) return false;
    const [, chapter] = match;
    return currentBookId === 'genesis' && parseInt(chapter) === currentChapter;
  });

  const verseData = chapterVerses[currentVerseIndex] || verses[0];
  const currentBook = getBookById(currentBookId);

  // 히브리어 힌트 표시 여부 체크 (localStorage)
  React.useEffect(() => {
    const hintCount = parseInt(localStorage.getItem('hebrewHintShown') || '0');
    if (hintCount >= 3) {
      setShowHebrewHint(false);
    }
  }, []);

  // 힌트 닫기 핸들러
  const handleCloseHint = () => {
    const currentCount = parseInt(localStorage.getItem('hebrewHintShown') || '0');
    localStorage.setItem('hebrewHintShown', String(currentCount + 1));
    setShowHebrewHint(false);
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
              {/* Verse Card */}
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

              <StudyTab
                verse={verseData}
                darkMode={darkMode}
                onMarkStudied={() => {}}
                studied={false}
              />
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
            <div className={`rounded-3xl shadow-xl p-6 text-center ${
              darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-white/90 border border-amber-200'
            }`}>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                📊 성장 기능은 준비 중입니다
              </p>
            </div>
          )}

          {/* REMOVED: Old commentary tab - now integrated into StudyTab */}
          {activeTab === 'commentary' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-3xl shadow-xl p-6 ${
              darkMode
                ? 'bg-gradient-to-br from-orange-900/40 to-yellow-900/40 border border-orange-400/30'
                : 'bg-white border border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                💡 깊이 읽기
              </h3>
              {!verseData.commentary ? (
                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  이 구절에 대한 깊이 읽기 내용이 아직 준비되지 않았습니다.
                </p>
              ) : typeof verseData.commentary === 'string' ? (
                <p className={`whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {verseData.commentary}
                </p>
              ) : (
                <div className="space-y-6">
                  {/* Intro */}
                  <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {verseData.commentary.intro}
                  </p>

                  {/* Sections */}
                  {verseData.commentary.sections?.map((section, index) => {
                    const colorClasses = {
                      purple: darkMode ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-400',
                      blue: darkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-400',
                      green: darkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-400',
                      pink: darkMode ? 'bg-pink-900/30 border-pink-500' : 'bg-pink-50 border-pink-400',
                      orange: darkMode ? 'bg-orange-900/30 border-orange-500' : 'bg-orange-50 border-orange-400',
                      yellow: darkMode ? 'bg-yellow-900/30 border-yellow-500' : 'bg-yellow-50 border-yellow-400',
                    };

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`p-5 rounded-xl border-l-4 ${colorClasses[section.color]}`}
                      >
                        <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {section.emoji} {section.title}
                        </h4>
                        <p className={`text-sm mb-3 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {section.description}
                        </p>
                        <ul className="space-y-2">
                          {section.points.map((point, i) => (
                            <li key={i} className={`text-sm flex gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="text-purple-500 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}

                  {/* Why Question for Children */}
                  {verseData.commentary.whyQuestion && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className={`p-5 rounded-2xl ${
                        darkMode
                          ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30'
                          : 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-300'
                      }`}
                    >
                      <h4 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-pink-300' : 'text-pink-700'}`}>
                        💭 어린이를 위한 질문
                      </h4>
                      <p className={`text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Q: {verseData.commentary.whyQuestion.question}
                      </p>
                      <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        A: {verseData.commentary.whyQuestion.answer}
                      </p>
                      <div className={`pt-3 border-t ${darkMode ? 'border-pink-700/30' : 'border-pink-300'}`}>
                        <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-pink-400' : 'text-pink-700'}`}>
                          📖 관련 성경 구절
                        </p>
                        <ul className="space-y-1">
                          {verseData.commentary.whyQuestion.bibleReferences.map((ref, i) => (
                            <li key={i} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              • {ref}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {/* Conclusion */}
                  {verseData.commentary.conclusion && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      className={`p-5 rounded-2xl ${
                        darkMode
                          ? 'bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30'
                          : 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-300'
                      }`}
                    >
                      <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                        {verseData.commentary.conclusion.title}
                      </h4>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {verseData.commentary.conclusion.content}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
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

          {activeTab === 'profile' && (
            <div className={`rounded-3xl shadow-xl p-6 text-center ${
              darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-white/90 border border-amber-200'
            }`}>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                👤 프로필 기능은 준비 중입니다
              </p>
            </div>
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
    </div>
  );
}
