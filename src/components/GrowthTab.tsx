import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, RotateCcw, Brain, Star, Heart, TrendingUp } from 'lucide-react';
import { useUserStats } from '../hooks/useUserStats';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

interface GrowthTabProps {
  darkMode: boolean;
}

export default function GrowthTab({ darkMode }: GrowthTabProps) {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useUserStats();
  const { profile, loading: profileLoading } = useUserProfile();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl shadow-xl p-8 text-center ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border border-cyan-400/20'
            : 'bg-white/90 border border-amber-200'
        }`}
      >
        <div className="mb-4">
          <TrendingUp className={`w-16 h-16 mx-auto ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`} />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          성장 기록을 확인하세요
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          로그인하면 학습 통계와 진행 상황을 확인할 수 있습니다
        </p>
      </motion.div>
    );
  }

  if (statsLoading || profileLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`rounded-3xl shadow-xl p-6 animate-pulse ${
              darkMode
                ? 'bg-gradient-to-br from-slate-900/60 to-indigo-900/40'
                : 'bg-white/90'
            }`}
          >
            <div className={`h-8 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} mb-4`} />
            <div className={`h-12 w-24 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>
    );
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const level = profile?.level || 1;
  const totalPoints = profile?.total_points || 0;
  const totalExp = profile?.total_exp || 0;

  const statCards = [
    {
      icon: BookOpen,
      label: '학습한 구절',
      value: stats?.total_verses_studied || 0,
      color: darkMode ? 'from-cyan-500 to-blue-500' : 'from-blue-500 to-cyan-500',
      bgColor: darkMode ? 'from-cyan-900/30 to-blue-900/30 border-cyan-400/20' : 'from-blue-50 to-cyan-50 border-blue-200',
      textColor: darkMode ? 'text-cyan-300' : 'text-blue-700',
    },
    {
      icon: CheckCircle,
      label: '완료한 구절',
      value: stats?.total_verses_completed || 0,
      color: darkMode ? 'from-green-500 to-emerald-500' : 'from-emerald-500 to-green-500',
      bgColor: darkMode ? 'from-green-900/30 to-emerald-900/30 border-green-400/20' : 'from-green-50 to-emerald-50 border-green-200',
      textColor: darkMode ? 'text-green-300' : 'text-green-700',
    },
    {
      icon: RotateCcw,
      label: '총 복습 횟수',
      value: stats?.total_reviews || 0,
      color: darkMode ? 'from-purple-500 to-pink-500' : 'from-pink-500 to-purple-500',
      bgColor: darkMode ? 'from-purple-900/30 to-pink-900/30 border-purple-400/20' : 'from-purple-50 to-pink-50 border-purple-200',
      textColor: darkMode ? 'text-purple-300' : 'text-purple-700',
    },
    {
      icon: Brain,
      label: '퀴즈 도전',
      value: stats?.total_quizzes_taken || 0,
      subValue: stats?.total_quizzes_correct || 0,
      subLabel: '정답',
      color: darkMode ? 'from-orange-500 to-yellow-500' : 'from-yellow-500 to-orange-500',
      bgColor: darkMode ? 'from-orange-900/30 to-yellow-900/30 border-orange-400/20' : 'from-orange-50 to-yellow-50 border-orange-200',
      textColor: darkMode ? 'text-orange-300' : 'text-orange-700',
    },
    {
      icon: Heart,
      label: '즐겨찾기',
      value: stats?.total_favorites || 0,
      color: darkMode ? 'from-red-500 to-pink-500' : 'from-pink-500 to-red-500',
      bgColor: darkMode ? 'from-red-900/30 to-pink-900/30 border-red-400/20' : 'from-red-50 to-pink-50 border-red-200',
      textColor: darkMode ? 'text-red-300' : 'text-red-700',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Profile Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl shadow-xl p-6 border ${
          darkMode
            ? 'bg-gradient-to-br from-slate-900/80 via-indigo-900/60 to-violet-900/70 border-cyan-400/20'
            : 'bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/80 border-purple-200'
        }`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${
            darkMode
              ? 'bg-gradient-to-br from-cyan-400 to-violet-500'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            <span className="text-2xl font-bold text-white">{displayName[0].toUpperCase()}</span>
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              darkMode
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                : 'bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900'
            }`}>
              {level}
            </div>
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {displayName}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              레벨 {level}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${
            darkMode
              ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30'
              : 'bg-gradient-to-br from-purple-100 to-blue-100'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Star className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                총 포인트
              </p>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-cyan-300' : 'text-purple-700'}`}>
              {totalPoints.toLocaleString()}
            </p>
          </div>

          <div className={`p-4 rounded-xl ${
            darkMode
              ? 'bg-gradient-to-br from-violet-900/30 to-purple-900/30'
              : 'bg-gradient-to-br from-pink-100 to-purple-100'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-violet-400' : 'text-purple-600'}`} />
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                총 경험치
              </p>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-violet-300' : 'text-pink-700'}`}>
              {totalExp.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-3xl shadow-xl p-6 border bg-gradient-to-br ${stat.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </h3>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.subValue !== undefined && (
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {stat.subLabel}: {stat.subValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Ring */}
              {stat.subValue !== undefined && stat.value > 0 && (
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className={darkMode ? 'text-gray-700' : 'text-gray-200'}
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - stat.subValue / stat.value)}`}
                      className={stat.textColor}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${stat.textColor}`}>
                      {Math.round((stat.subValue / stat.value) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Encouragement Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-3xl shadow-xl p-6 text-center border ${
          darkMode
            ? 'bg-gradient-to-br from-violet-900/40 to-pink-900/40 border-violet-400/20'
            : 'bg-gradient-to-br from-violet-50 to-pink-50 border-violet-200'
        }`}
      >
        <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-violet-300' : 'text-violet-700'}`}>
          {stats && stats.total_verses_studied > 0
            ? '훌륭합니다! 계속 학습해 나가세요! 🎉'
            : '첫 구절을 학습하고 성장을 시작하세요! 🌱'}
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          매일 조금씩 학습하면 큰 성장을 이룰 수 있습니다
        </p>
      </motion.div>
    </div>
  );
}
