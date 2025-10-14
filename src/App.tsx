import React, { useState } from 'react';
import { Sparkles, Volume2, Lightbulb, BookOpen, X } from 'lucide-react';
import { verses } from './data/verses';

export default function App() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showWordAnalysis, setShowWordAnalysis] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);

  // 현재 챕터의 구절들만 필터링
  const chapterVerses = verses.filter(v => {
    const chapterNum = parseInt(v.id.split('-')[0].replace('gen', ''));
    return chapterNum === currentChapter;
  });

  const verseData = chapterVerses[currentVerseIndex] || verses[0];

  // 챕터 변경 핸들러
  const handleChapterChange = (chapter: number) => {
    setCurrentChapter(chapter);
    setCurrentVerseIndex(0); // 챕터 변경 시 첫 구절로
    setShowChapterModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 스크롤 감지
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      console.log('스크롤 위치:', scrollY);
      const shouldShow = scrollY > 300;
      console.log('맨 위로 버튼 표시:', shouldShow);
      setShowScrollTop(shouldShow);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 구절 네비게이션
  const goToPrevVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextVerse = () => {
    if (currentVerseIndex < chapterVerses.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const playPronunciation = (text: string) => {
    try {
      if (!window.speechSynthesis) {
        alert('음성 기능을 사용할 수 없습니다. 웹 브라우저에서 열어주세요.');
        return;
      }

      // 기존 재생 중지
      window.speechSynthesis.cancel();

      // 약간의 지연 후 실행 (데스크톱 앱 호환성)
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);

        const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        const defaultVoice = voices[0];

        if (hebrewVoice) {
          utterance.voice = hebrewVoice;
          utterance.lang = 'he-IL';
        } else if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = 'en-US';
        } else if (defaultVoice) {
          utterance.voice = defaultVoice;
        }

        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1;

        utterance.onstart = () => {
          console.log('재생 시작');
          setIsPlaying(true);
        };

        utterance.onend = () => {
          console.log('재생 완료');
          setIsPlaying(false);
        };

        utterance.onerror = (e) => {
          console.error('음성 오류:', e);
          setIsPlaying(false);
          alert(`음성 재생 오류: ${e.error}\n웹 브라우저에서 열면 더 잘 작동할 수 있습니다.`);
        };

        // 실제 재생
        window.speechSynthesis.speak(utterance);
        console.log('재생 명령 실행됨');
      }, 100);

    } catch (error) {
      console.error('음성 재생 실패:', error);
      alert('음성 재생에 실패했습니다. 웹 브라우저에서 열어주세요.');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950'
        : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
    }`}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .glass-card {
          background: ${darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid ${darkMode ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.5)'};
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        .ripple {
          position: relative;
          overflow: hidden;
        }
        .ripple:active::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          animation: ripple-effect 0.6s ease-out;
        }
        @keyframes ripple-effect {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto p-3 sm:p-4 lg:p-6">

        {/* Dark Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ripple ${
              darkMode
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-800 text-yellow-400'
            }`}
            title={darkMode ? '라이트 모드' : '다크 모드'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Floating Action Button - Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all ripple animate-slideUp"
            title="맨 위로"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        {/* Modern Header with Gradient */}
        <div className={`relative mb-4 sm:mb-5 overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-2xl hover-lift animate-slideUp ${
          darkMode
            ? 'bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700'
            : 'bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white opacity-10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white opacity-10 rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
                <h1 className="text-2xl sm:text-3xl font-bold">히브리어 성경</h1>
              </div>

              {/* 챕터 선택 버튼 */}
              <button
                onClick={() => setShowChapterModal(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95 border border-white/30"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-semibold">창세기 {currentChapter}장</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <p className="text-sm sm:text-base opacity-90">원어로 만나는 하나님의 말씀 ✨</p>
          </div>
        </div>

        {/* Verse Card - Glass effect */}
        <div className={`rounded-3xl shadow-xl p-4 sm:p-5 mb-3 sm:mb-4 hover-lift animate-slideUp backdrop-blur-lg ${
          darkMode
            ? 'bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-fuchsia-900/40 border border-purple-400/30 text-white'
            : 'bg-gradient-to-br from-violet-100/60 via-purple-100/60 to-fuchsia-100/60 border border-violet-200/50'
        }`} style={{ animationDelay: '0.1s' }}>
          {/* Navigation Header */}
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
            {/* Previous Button */}
            <button
              onClick={goToPrevVerse}
              disabled={currentVerseIndex === 0}
              className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md ${
                currentVerseIndex > 0
                  ? 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="이전 구절"
            >
              <span className="hidden sm:inline">← 이전</span>
              <span className="sm:hidden">←</span>
            </button>

            {/* Verse Reference */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2">
              <span>{verseData.reference}</span>
              <span className={`text-xs ${darkMode ? 'text-purple-200' : 'text-purple-100'}`}>
                ({currentVerseIndex + 1}/{chapterVerses.length})
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={goToNextVerse}
              disabled={currentVerseIndex === chapterVerses.length - 1}
              className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md ${
                currentVerseIndex < chapterVerses.length - 1
                  ? 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="다음 구절"
            >
              <span className="hidden sm:inline">다음 →</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>

          {/* Hebrew Text */}
          <div className={`relative p-5 sm:p-6 rounded-2xl mb-3 sm:mb-4 overflow-hidden hover-lift backdrop-blur-sm ${
            darkMode
              ? 'bg-gradient-to-br from-purple-800/50 via-violet-800/50 to-fuchsia-800/50 border border-purple-500/40'
              : 'bg-gradient-to-br from-violet-200/70 via-purple-200/70 to-fuchsia-200/70 border border-violet-300/60'
          }`}>
            <div className="flex justify-center mb-2">
              <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full glass-card shadow-lg ${
                darkMode ? 'text-white' : ''
              }`}>
                <span className="text-xs font-medium">← 이 방향으로 읽기</span>
                <button
                  onClick={() => playPronunciation(verseData.hebrew)}
                  className="bg-purple-500 p-1.5 rounded-full hover:bg-purple-600 transition-all hover:scale-110 active:scale-95 ripple"
                  title="히브리어 발음 듣기"
                  type="button"
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-white animate-pulse' : 'text-white'}`} />
                </button>
              </div>
            </div>
            <p
              className={`text-center leading-loose font-serif ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
              style={{
                fontSize: 'clamp(0.75rem, 2.5vw, 1.5rem)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
              dir="rtl"
            >
              {verseData.hebrew}
            </p>
          </div>

          {/* 기본 정보: IPA 발음 + 한글 발음 + 현대어 */}
          <div className="space-y-2.5 mb-3 sm:mb-4">
            <div className={`p-3 sm:p-4 rounded-2xl border-2 hover-lift backdrop-blur-lg ${
              darkMode
                ? 'border-blue-400/30 bg-blue-900/30'
                : 'border-blue-300/60 bg-gradient-to-br from-blue-100/70 to-sky-100/70'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Volume2 className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`} />
                <h3 className={`font-bold text-xs sm:text-sm ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>IPA 발음</h3>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>← 오른쪽부터</span>
              </div>
              <p
                className={`font-mono text-center leading-loose ${
                  darkMode ? 'text-blue-100' : 'text-gray-900'
                }`}
                style={{
                  fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
                dir="rtl"
              >
                {verseData.ipa}
              </p>
            </div>

            <div className={`p-3 sm:p-4 rounded-2xl border-2 hover-lift backdrop-blur-lg ${
              darkMode
                ? 'border-rose-400/30 bg-rose-900/30'
                : 'border-rose-300/60 bg-gradient-to-br from-rose-100/70 to-pink-100/70'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Volume2 className={`w-4 h-4 ${darkMode ? 'text-rose-300' : 'text-rose-700'}`} />
                <h3 className={`font-bold text-xs sm:text-sm ${darkMode ? 'text-rose-200' : 'text-rose-900'}`}>한글 발음</h3>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-rose-600'}`}>← 오른쪽부터</span>
              </div>
              <p
                className={`font-semibold text-center leading-loose ${
                  darkMode ? 'text-rose-100' : 'text-gray-900'
                }`}
                style={{
                  fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  wordBreak: 'keep-all'
                }}
                dir="rtl"
              >
                {verseData.koreanPronunciation}
              </p>
            </div>

            <div className={`p-3 sm:p-4 rounded-2xl border-l-4 hover-lift backdrop-blur-lg ${
              darkMode
                ? 'border-amber-400 bg-amber-900/30'
                : 'border-amber-400 bg-gradient-to-br from-amber-100/70 to-yellow-100/70'
            }`}>
              <div className="text-center">
                <span className={`inline-block text-white text-xs px-2 py-0.5 rounded-full font-bold mb-1.5 shadow-md ${
                  darkMode ? 'bg-amber-600' : 'bg-amber-500'
                }`}>현대어 의역</span>
              </div>
              <p
                className={`leading-relaxed font-medium text-center ${
                  darkMode ? 'text-amber-100' : 'text-gray-900'
                }`}
                style={{
                  fontSize: 'clamp(0.5rem, 1.2vw, 0.75rem)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {verseData.modern}
              </p>
            </div>
          </div>
        </div>

        {/* Word Analysis */}
        <div className={`rounded-3xl shadow-xl overflow-hidden mb-3 sm:mb-4 hover-lift backdrop-blur-lg ${
          darkMode
            ? 'bg-purple-900/20 border border-purple-500/20 text-white'
            : 'bg-gradient-to-br from-emerald-100/60 via-teal-100/60 to-cyan-100/60 border border-teal-200/50'
        }`} style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setShowWordAnalysis(!showWordAnalysis)}
            className={`w-full p-4 sm:p-5 flex items-center justify-between transition-all ripple ${
              darkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'
            }`}
          >
            <h3 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <span className="text-xl sm:text-2xl">📖</span> 단어 사전
            </h3>
            <div className={`transform transition-transform flex-shrink-0 ${showWordAnalysis ? 'rotate-180' : ''}`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showWordAnalysis && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 animate-fadeIn">
              <div className="space-y-2.5">
                {verseData.words.map((word, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl hover-lift border backdrop-blur-lg ${
                      darkMode
                        ? 'border-violet-400/30 bg-violet-900/20'
                        : 'border-teal-300/60 bg-gradient-to-r from-teal-50/80 to-emerald-50/80'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full text-center">
                          <div className={`text-xl sm:text-2xl font-serif ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`} dir="rtl">{word.hebrew}</div>
                        </div>
                        <button
                          onClick={() => playPronunciation(word.hebrew)}
                          className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-all hover:scale-110 active:scale-95 ripple shadow-lg"
                          title="발음 듣기"
                          type="button"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <div className={`text-xs mb-1 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>뜻</div>
                        <div className={`font-semibold text-sm text-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{word.meaning}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="text-center">
                          <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>IPA 발음</div>
                          <div className={`font-mono text-xs p-2 rounded backdrop-blur-sm ${
                            darkMode ? 'bg-gray-800/50 text-gray-300 border border-gray-700/50' : 'bg-cyan-50/90 text-gray-900 border border-cyan-200/70'
                          }`}>{word.ipa}</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>한글 발음</div>
                          <div className={`font-bold text-sm p-2 rounded backdrop-blur-sm ${
                            darkMode ? 'bg-gray-800/50 text-purple-400 border border-gray-700/50' : 'bg-teal-50/90 text-teal-800 border border-teal-200/70'
                          }`}>{word.korean}</div>
                        </div>
                      </div>

                      {/* 어근 분석 */}
                      <div className={`p-2.5 rounded-lg border backdrop-blur-sm ${
                        darkMode
                          ? 'border-yellow-400/30 bg-yellow-900/30'
                          : 'border-orange-300/70 bg-gradient-to-r from-orange-100/80 to-yellow-100/80'
                      }`}>
                        <div className={`text-xs font-bold mb-1 text-center ${darkMode ? 'text-yellow-300' : 'text-orange-900'}`}>🌱 어근</div>
                        <div className={`text-sm text-center font-semibold ${darkMode ? 'text-yellow-200' : 'text-gray-900'}`}>{word.root}</div>
                      </div>

                      {/* 문법 구조 */}
                      <div className={`p-2.5 rounded-lg border backdrop-blur-sm ${
                        darkMode
                          ? 'border-sky-400/30 bg-sky-900/30'
                          : 'border-indigo-300/70 bg-gradient-to-r from-indigo-100/80 to-blue-100/80'
                      }`}>
                        <div className={`text-xs font-bold mb-1 text-center ${darkMode ? 'text-sky-300' : 'text-indigo-900'}`}>⚙️ 문법</div>
                        <div className={`text-xs text-center leading-relaxed ${darkMode ? 'text-sky-200' : 'text-gray-900'}`}>{word.grammar}</div>
                      </div>

                      {/* 구조 설명 */}
                      {word.structure && (
                        <div className={`p-2.5 rounded-lg border backdrop-blur-sm ${
                          darkMode
                            ? 'border-emerald-400/30 bg-emerald-900/30'
                            : 'border-lime-300/70 bg-gradient-to-r from-lime-100/80 to-green-100/80'
                        }`}>
                          <div className={`text-xs font-bold mb-1 text-center ${darkMode ? 'text-emerald-300' : 'text-lime-900'}`}>🔍 구조</div>
                          <div className={`text-xs text-center leading-relaxed ${darkMode ? 'text-emerald-200' : 'text-gray-900'}`}>{word.structure}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Analysis */}
        <div className={`rounded-3xl shadow-xl overflow-hidden hover-lift backdrop-blur-lg ${
          darkMode
            ? 'bg-purple-900/20 border border-purple-500/20 text-white'
            : 'bg-gradient-to-br from-orange-100/60 via-amber-100/60 to-yellow-100/60 border border-orange-200/50'
        }`} style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => {
              console.log('깊이 읽기 버튼 클릭, 현재 상태:', showAnalysis);
              setShowAnalysis(!showAnalysis);
              console.log('깊이 읽기 새 상태:', !showAnalysis);
            }}
            className={`w-full p-4 sm:p-5 flex items-center justify-between transition-all ripple ${
              darkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">💡</span>
              <h3 className={`text-lg sm:text-xl font-bold text-left ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>깊이 읽기</h3>
            </div>
            <div className={`transform transition-transform flex-shrink-0 ${showAnalysis ? 'rotate-180' : ''}`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showAnalysis && verseData.commentary && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3 sm:space-y-4 animate-fadeIn">
              {/* 문자열 commentary 처리 (1:6-1:31) */}
              {typeof verseData.commentary === 'string' && (
                <div className={`p-3 sm:p-4 rounded-2xl ${
                  darkMode
                    ? 'bg-gradient-to-br from-gray-800/60 to-gray-700/60'
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80'
                }`}>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {verseData.commentary}
                  </p>
                </div>
              )}

              {/* 구조화된 commentary 처리 (1:1-1:5) */}
              {typeof verseData.commentary === 'object' && verseData.commentary.intro && (
                <>
                  {/* 서론 */}
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {verseData.commentary.intro}
                  </p>

                  {/* 섹션들 */}
                  {verseData.commentary.sections?.map((section, index) => {
                const colorClasses = {
                  purple: {
                    light: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-500',
                    dark: 'bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-500',
                    titleLight: 'text-purple-900',
                    titleDark: 'text-purple-300',
                    bulletLight: 'text-purple-500',
                    bulletDark: 'text-purple-400'
                  },
                  blue: {
                    light: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500',
                    dark: 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500',
                    titleLight: 'text-blue-900',
                    titleDark: 'text-blue-300',
                    bulletLight: 'text-blue-500',
                    bulletDark: 'text-blue-400'
                  },
                  green: {
                    light: 'bg-gradient-to-br from-green-50 to-green-100 border-green-500',
                    dark: 'bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-500',
                    titleLight: 'text-green-900',
                    titleDark: 'text-green-300',
                    bulletLight: 'text-green-500',
                    bulletDark: 'text-green-400'
                  },
                  pink: {
                    light: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-500',
                    dark: 'bg-gradient-to-br from-pink-900/40 to-pink-800/40 border-pink-500',
                    titleLight: 'text-pink-900',
                    titleDark: 'text-pink-300',
                    bulletLight: 'text-pink-500',
                    bulletDark: 'text-pink-400'
                  },
                  orange: {
                    light: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-500',
                    dark: 'bg-gradient-to-br from-orange-900/40 to-orange-800/40 border-orange-500',
                    titleLight: 'text-orange-900',
                    titleDark: 'text-orange-300',
                    bulletLight: 'text-orange-500',
                    bulletDark: 'text-orange-400'
                  },
                  yellow: {
                    light: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-500',
                    dark: 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border-yellow-500',
                    titleLight: 'text-yellow-900',
                    titleDark: 'text-yellow-300',
                    bulletLight: 'text-yellow-600',
                    bulletDark: 'text-yellow-400'
                  }
                };

                const colors = colorClasses[section.color];

                return (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-2xl border-l-4 ${
                      darkMode ? colors.dark : colors.light
                    }`}
                  >
                    <h4 className={`font-bold text-base sm:text-lg mb-2 flex items-start gap-2 ${
                      darkMode ? colors.titleDark : colors.titleLight
                    }`}>
                      <span className="flex-shrink-0">{section.emoji}</span>
                      <span className="break-words">{section.title}</span>
                    </h4>
                    <p className={`mb-2 text-sm leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {section.description}
                    </p>
                    <ul className="space-y-1.5">
                      {section.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`font-bold flex-shrink-0 ${
                            darkMode ? colors.bulletDark : colors.bulletLight
                          }`}>•</span>
                          <span className={`text-xs sm:text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

                  {/* 결론 (구조화된 commentary용) */}
                  {verseData.commentary.conclusion && (
                    <div className={`p-3 sm:p-4 rounded-2xl border-2 ${
                      darkMode
                        ? 'bg-gradient-to-r from-yellow-900/40 via-orange-900/40 to-yellow-900/40 border-yellow-500'
                        : 'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-yellow-400'
                    }`}>
                      <h4 className={`font-bold text-base sm:text-lg mb-2 flex items-center gap-2 ${
                        darkMode ? 'text-yellow-300' : 'text-orange-900'
                      }`}>
                        <span>{verseData.commentary.conclusion.title}</span>
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {verseData.commentary.conclusion.content}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* 어린이 질문 (모든 타입의 commentary용) */}
              {verseData.commentary && typeof verseData.commentary === 'object' && verseData.commentary.whyQuestion && (
                <div className={`p-3 sm:p-4 rounded-2xl border-l-4 ${
                  darkMode
                    ? 'bg-gradient-to-br from-sky-900/40 to-cyan-900/40 border-sky-500'
                    : 'bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-400'
                }`}>
                  <h4 className={`font-bold text-base sm:text-lg mb-3 flex items-center gap-2 ${
                    darkMode ? 'text-sky-300' : 'text-sky-900'
                  }`}>
                    <span>🤔</span>
                    <span>어린이 질문</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <p className={`font-semibold text-sm mb-2 ${
                        darkMode ? 'text-sky-200' : 'text-sky-800'
                      }`}>
                        Q: {verseData.commentary.whyQuestion.question}
                      </p>
                      <p className={`text-sm leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        A: {verseData.commentary.whyQuestion.answer}
                      </p>
                    </div>

                    {verseData.commentary.whyQuestion.bibleReferences?.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold mb-1.5 ${
                          darkMode ? 'text-sky-300' : 'text-sky-800'
                        }`}>
                          📖 관련 성경 구절:
                        </p>
                        <ul className="space-y-1">
                          {verseData.commentary.whyQuestion.bibleReferences.map((ref, i) => (
                            <li key={i} className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              • {ref}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Chapter Selection Modal */}
      {showChapterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowChapterModal(false)}
        >
          <div
            className={`max-w-2xl w-full rounded-3xl shadow-2xl p-6 animate-slideUp ${
              darkMode
                ? 'bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 text-white'
                : 'bg-gradient-to-br from-white via-purple-50 to-pink-50'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-purple-500" />
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  챕터 선택
                </h2>
              </div>
              <button
                onClick={() => setShowChapterModal(false)}
                className={`p-2 rounded-full transition-all hover:scale-110 ${
                  darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Book Title */}
            <div className={`mb-4 p-3 rounded-xl ${
              darkMode ? 'bg-white/10' : 'bg-purple-100'
            }`}>
              <h3 className={`text-lg font-semibold text-center ${
                darkMode ? 'text-purple-300' : 'text-purple-900'
              }`}>
                📖 창세기 (Genesis)
              </h3>
            </div>

            {/* Chapter Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2 mb-4">
              {[1, 2].map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => handleChapterChange(chapter)}
                  className={`aspect-square rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-110 active:scale-95 ${
                    currentChapter === chapter
                      ? darkMode
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                      : darkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white hover:bg-purple-100 text-gray-900 border-2 border-purple-200'
                  }`}
                >
                  {chapter}
                </button>
              ))}

              {/* Coming Soon Chapters */}
              {[...Array(48)].map((_, i) => {
                const chapter = i + 3;
                return (
                  <button
                    key={chapter}
                    disabled
                    className={`aspect-square rounded-xl font-bold text-sm sm:text-base cursor-not-allowed ${
                      darkMode
                        ? 'bg-gray-800/50 text-gray-600'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    {chapter}
                  </button>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className={`text-center text-xs sm:text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p>💡 현재 1-2장이 준비되어 있습니다</p>
              <p className="mt-1">나머지 챕터는 준비 중입니다</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
