import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Award, Calendar, Target } from 'lucide-react';
import { useAllBookProgress } from '../hooks/useBookProgress';
import { useBooks } from '../hooks/useBooks';

interface BookProgressDashboardProps {
  darkMode: boolean;
  onSelectBook?: (bookId: string) => void;
}

export default function BookProgressDashboard({ darkMode, onSelectBook }: BookProgressDashboardProps) {
  const { allProgress, loading: progressLoading } = useAllBookProgress();
  const { books, loading: booksLoading } = useBooks();

  // 책 ID로 책 정보 찾기
  const getBookInfo = (bookId: string) => {
    return books.find(b => b.id === bookId);
  };

  // 전체 통계 계산
  const totalStats = {
    totalBooks: allProgress.length,
    totalWords: allProgress.reduce((sum, p) => sum + (p.total_words || 0), 0),
    learnedWords: allProgress.reduce((sum, p) => sum + (p.learned_words || 0), 0),
    masteredWords: allProgress.reduce((sum, p) => sum + (p.mastered_words || 0), 0),
    averageProgress: allProgress.length > 0
      ? allProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / allProgress.length
      : 0,
    longestStreak: Math.max(...allProgress.map(p => p.longest_streak || 0), 0),
    currentStreak: Math.max(...allProgress.map(p => p.current_streak || 0), 0),
  };

  if (progressLoading || booksLoading) {
    return (
      <div className={`rounded-3xl shadow-xl p-8 text-center ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
          : 'bg-white/90 border border-amber-200'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent ${
            darkMode ? 'border-cyan-400' : 'border-purple-600'
          }`}></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            진도 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl shadow-xl p-6 mb-4 ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
            : 'bg-gradient-to-br from-white/90 via-purple-50/50 to-pink-50/50 border border-purple-200'
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📊 학습 진도 대시보드
        </h2>

        {/* 전체 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`} />
              <div className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>학습한 책</div>
            </div>
            <div className="text-2xl font-bold">{totalStats.totalBooks}권</div>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`} />
              <div className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>평균 진도</div>
            </div>
            <div className="text-2xl font-bold">{totalStats.averageProgress.toFixed(1)}%</div>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Award className={`w-4 h-4 ${darkMode ? 'text-green-300' : 'text-green-700'}`} />
              <div className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>완벽 암기</div>
            </div>
            <div className="text-2xl font-bold">{totalStats.masteredWords}개</div>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`} />
              <div className={`text-xs ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>최장 연속</div>
            </div>
            <div className="text-2xl font-bold">{totalStats.longestStreak}일</div>
          </div>
        </div>
      </motion.div>

      {/* 책별 상세 진도 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-3xl shadow-xl p-6 ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900/60 to-violet-900/40 border border-violet-400/20'
            : 'bg-white/90 border border-amber-200'
        }`}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          책별 학습 현황
        </h3>

        {allProgress.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              📚 아직 학습을 시작하지 않았습니다
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              단어장에서 단어를 학습해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allProgress
              .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))
              .map((progress) => {
                const book = getBookInfo(progress.book_id);
                if (!book) return null;

                return (
                  <motion.div
                    key={progress.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => onSelectBook?.(progress.book_id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      darkMode
                        ? 'bg-gradient-to-r from-slate-800/50 to-indigo-900/30 hover:from-slate-700/60 hover:to-indigo-800/40 border border-slate-600/30'
                        : 'bg-gradient-to-r from-white/80 to-purple-50/60 hover:from-purple-50/80 hover:to-pink-50/60 border border-purple-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {book.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {book.englishName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          (progress.progress_percentage || 0) >= 100
                            ? 'text-green-500'
                            : (progress.progress_percentage || 0) >= 50
                            ? darkMode ? 'text-blue-400' : 'text-blue-600'
                            : darkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>
                          {progress.progress_percentage?.toFixed(1) || 0}%
                        </div>
                        {(progress.progress_percentage || 0) >= 100 && (
                          <div className="text-xs text-green-500">✓ 완료</div>
                        )}
                      </div>
                    </div>

                    {/* 진도 바 */}
                    <div className={`w-full h-3 rounded-full mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <motion.div
                        className={`h-full rounded-full ${
                          (progress.progress_percentage || 0) >= 100
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : (progress.progress_percentage || 0) >= 50
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-r from-orange-500 to-pink-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.max(progress.progress_percentage || 0, 0), 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>

                    {/* 상세 통계 */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                        <div className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>전체</div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {progress.total_words || 0}
                        </div>
                      </div>
                      <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <div className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>학습</div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {progress.learned_words || 0}
                        </div>
                      </div>
                      <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                        <div className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>암기</div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {progress.mastered_words || 0}
                        </div>
                      </div>
                      <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                        <div className={`text-xs ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>연속</div>
                        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {progress.current_streak || 0}일
                        </div>
                      </div>
                    </div>

                    {/* 마지막 학습일 */}
                    {progress.last_studied_at && (
                      <div className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        마지막 학습: {new Date(progress.last_studied_at).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
