import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  darkMode: boolean;
  type?: 'card' | 'text' | 'circle' | 'grid';
  count?: number;
}

export default function SkeletonLoader({ darkMode, type = 'card', count = 1 }: SkeletonLoaderProps) {
  const baseClass = `animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`;

  if (type === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}
          >
            {/* 이모지 */}
            <div className={`w-16 h-16 rounded-full mb-3 ${baseClass}`}></div>

            {/* 어근 텍스트 */}
            <div className={`h-8 w-32 rounded mb-2 ${baseClass}`}></div>

            {/* 하이픈 표기 */}
            <div className={`h-4 w-20 rounded mb-1 ${baseClass}`}></div>

            {/* 의미 */}
            <div className={`h-6 w-40 rounded mb-2 ${baseClass}`}></div>

            {/* 영어 의미 */}
            <div className={`h-3 w-36 rounded mb-3 ${baseClass}`}></div>

            {/* 암기 팁 */}
            <div className={`h-12 w-full rounded-lg mb-2 ${baseClass}`}></div>

            {/* 배지들 */}
            <div className="flex items-center gap-2">
              <div className={`h-6 w-20 rounded-lg ${baseClass}`}></div>
              <div className={`h-6 w-20 rounded-lg ${baseClass}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
        <div className={`h-6 w-3/4 rounded mb-4 ${baseClass}`}></div>
        <div className={`h-4 w-1/2 rounded mb-2 ${baseClass}`}></div>
        <div className={`h-4 w-2/3 rounded ${baseClass}`}></div>
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div className={`w-12 h-12 rounded-full ${baseClass}`}></div>
    );
  }

  // text type
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`h-4 rounded ${baseClass}`}></div>
      ))}
    </div>
  );
}

// 어근 그리드용 전용 Skeleton
export function RootGridSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`p-6 rounded-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-slate-800/50 to-purple-900/30 border border-slate-600/30'
              : 'bg-gradient-to-br from-white/80 to-purple-50/60 border border-purple-200/50'
          }`}
        >
          {/* 이모지 플레이스홀더 */}
          <div
            className={`w-16 h-16 rounded-full mb-3 animate-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          ></div>

          {/* 어근 텍스트 */}
          <div
            className={`h-8 w-32 rounded mb-2 animate-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          ></div>

          {/* 하이픈 표기 */}
          <div
            className={`h-4 w-20 rounded mb-1 animate-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          ></div>

          {/* 의미 */}
          <div
            className={`h-6 w-40 rounded mb-2 animate-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          ></div>

          {/* 영어 의미 */}
          <div
            className={`h-3 w-36 rounded mb-3 animate-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          ></div>

          {/* 암기 팁 플레이스홀더 */}
          <div
            className={`h-12 w-full rounded-lg mb-2 animate-pulse ${
              darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100/80'
            }`}
          ></div>

          {/* 배지들 */}
          <div className="flex items-center gap-2">
            <div
              className={`h-6 w-20 rounded-lg animate-pulse ${
                darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}
            ></div>
            <div
              className={`h-6 w-20 rounded-lg animate-pulse ${
                darkMode ? 'bg-green-900/30' : 'bg-green-100'
              }`}
            ></div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
