import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Star, Volume2 } from 'lucide-react';
import { verses } from '../data/verses';
import { Word } from '../types';
import FlashCard from './shared/FlashCard';

interface VocabularyTabProps {
  darkMode: boolean;
}

type SubTab = 'all' | 'bookmarked' | 'study';

interface WordWithContext extends Word {
  verseReference: string;
  verseId: string;
}

interface SRSData {
  wordHebrew: string;
  nextReview: Date;
  interval: number; // 일 단위
  easeFactor: number;
  reviewCount: number;
}

export default function VocabularyTab({ darkMode }: VocabularyTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<string>>(new Set());
  const [srsData, setSrsData] = useState<Map<string, SRSData>>(new Map());
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set()); // 여러 카드 뒤집기용
  const [studyMode, setStudyMode] = useState(false);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);

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

  // localStorage에서 북마크와 SRS 데이터 로드
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedWords');
    if (savedBookmarks) {
      setBookmarkedWords(new Set(JSON.parse(savedBookmarks)));
    }

    const savedSRS = localStorage.getItem('srsData');
    if (savedSRS) {
      const parsed = JSON.parse(savedSRS);
      const srsMap = new Map<string, SRSData>();
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        srsMap.set(key, {
          ...value,
          nextReview: new Date(value.nextReview),
        });
      });
      setSrsData(srsMap);
    }
  }, []);

  // 모든 구절에서 유니크한 단어 추출
  const allWords = useMemo(() => {
    const wordMap = new Map<string, WordWithContext>();

    verses.forEach(verse => {
      verse.words.forEach(word => {
        if (!wordMap.has(word.hebrew)) {
          wordMap.set(word.hebrew, {
            ...word,
            verseReference: verse.reference,
            verseId: verse.id,
          });
        }
      });
    });

    return Array.from(wordMap.values());
  }, []);

  // 검색 및 필터링된 단어
  const filteredWords = useMemo(() => {
    let words = allWords;

    // 서브탭 필터
    if (activeSubTab === 'bookmarked') {
      words = words.filter(w => bookmarkedWords.has(w.hebrew));
    } else if (activeSubTab === 'study') {
      // 오늘 복습할 단어
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      words = words.filter(w => {
        const srs = srsData.get(w.hebrew);
        if (!srs) return true; // 새 단어
        return srs.nextReview <= today;
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
  }, [allWords, activeSubTab, bookmarkedWords, searchQuery, srsData]);

  // 통계
  const stats = useMemo(() => {
    const total = allWords.length;
    const bookmarked = Array.from(bookmarkedWords).filter(hebrew =>
      allWords.some(w => w.hebrew === hebrew)
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mastered = Array.from(srsData.values()).filter(
      srs => srs.reviewCount >= 5 && srs.interval >= 30
    ).length;

    const dueToday = allWords.filter(w => {
      const srs = srsData.get(w.hebrew);
      if (!srs) return true;
      return srs.nextReview <= today;
    }).length;

    return { total, bookmarked, mastered, dueToday };
  }, [allWords, bookmarkedWords, srsData]);

  // 북마크 토글
  const toggleBookmark = (hebrew: string) => {
    const newBookmarks = new Set(bookmarkedWords);
    if (newBookmarks.has(hebrew)) {
      newBookmarks.delete(hebrew);
    } else {
      newBookmarks.add(hebrew);
    }
    setBookmarkedWords(newBookmarks);
    localStorage.setItem('bookmarkedWords', JSON.stringify(Array.from(newBookmarks)));
  };

  // SRS 업데이트
  const updateSRS = (hebrew: string, quality: number) => {
    // quality: 0 = 모르겠어요, 1 = 애매해요, 2 = 알고있어요
    const today = new Date();
    const current = srsData.get(hebrew);

    let newData: SRSData;

    if (!current) {
      // 새 단어
      newData = {
        wordHebrew: hebrew,
        nextReview: new Date(today.getTime() + (quality === 2 ? 1 : 0) * 24 * 60 * 60 * 1000),
        interval: quality === 2 ? 1 : 0,
        easeFactor: 2.5,
        reviewCount: 1,
      };
    } else {
      let newInterval: number;
      let newEaseFactor = current.easeFactor;

      if (quality === 0) {
        // 틀림: 처음부터
        newInterval = 0;
        newEaseFactor = Math.max(1.3, current.easeFactor - 0.2);
      } else if (quality === 1) {
        // 애매함: 간격 증가 작게
        newInterval = Math.max(1, Math.floor(current.interval * 1.2));
      } else {
        // 맞춤: 간격 크게 증가
        if (current.interval === 0) {
          newInterval = 1;
        } else if (current.interval === 1) {
          newInterval = 3;
        } else {
          newInterval = Math.floor(current.interval * newEaseFactor);
        }
        newEaseFactor = current.easeFactor + 0.1;
      }

      newData = {
        wordHebrew: hebrew,
        nextReview: new Date(today.getTime() + newInterval * 24 * 60 * 60 * 1000),
        interval: newInterval,
        easeFactor: Math.min(2.5, newEaseFactor),
        reviewCount: current.reviewCount + 1,
      };
    }

    const newSrsData = new Map(srsData);
    newSrsData.set(hebrew, newData);
    setSrsData(newSrsData);

    // localStorage 저장
    const srsObject: any = {};
    newSrsData.forEach((value, key) => {
      srsObject[key] = {
        ...value,
        nextReview: value.nextReview.toISOString(),
      };
    });
    localStorage.setItem('srsData', JSON.stringify(srsObject));

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
  const getWordEmoji = (word: Word) => {
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

  const getWordColor = (word: Word) => {
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

  return (
    <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl shadow-xl p-6 mb-4 ${
          darkMode ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20' : 'bg-gradient-to-br from-white/90 via-amber-50/50 to-orange-50/50 border border-orange-200'
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📚 단어장
        </h2>

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
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
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
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
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
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
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
                        <div className="text-6xl mb-4">{emoji}</div>
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

                        {/* 어근 */}
                        {currentWord.root && (
                          <div>
                            <div
                              className={`font-semibold mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                              style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}
                            >
                              🌱 어근
                            </div>
                            <div
                              className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                              style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)' }}
                            >
                              {currentWord.root}
                            </div>
                          </div>
                        )}

                        {/* 문법 */}
                        {currentWord.grammar && (
                          <div>
                            <div
                              className={`font-semibold mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                              style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}
                            >
                              📝 문법
                            </div>
                            <div
                              className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                              style={{ fontSize: 'clamp(0.7rem, 2.2vw, 0.85rem)' }}
                            >
                              {currentWord.grammar}
                            </div>
                          </div>
                        )}

                        {/* 구조 */}
                        {currentWord.structure && (
                          <div>
                            <div
                              className={`font-semibold mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                              style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}
                            >
                              🔍 구조
                            </div>
                            <div
                              className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                              style={{ fontSize: 'clamp(0.7rem, 2.2vw, 0.85rem)' }}
                            >
                              {currentWord.structure}
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
    </div>
  );
}
