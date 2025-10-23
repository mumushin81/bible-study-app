import { memo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { HebrewRoot } from '../hooks/useHebrewRoots';

interface RootCardProps {
  root: HebrewRoot;
  darkMode: boolean;
  onClick: () => void;
  index: number;
}

const RootCard = memo(function RootCard({ root, darkMode, onClick, index }: RootCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-2xl text-left transition-all ${
        darkMode
          ? 'bg-gradient-to-br from-slate-800/50 to-purple-900/30 hover:from-slate-700/60 hover:to-purple-800/40 border border-slate-600/30'
          : 'bg-gradient-to-br from-white/80 to-purple-50/60 hover:from-purple-50/80 hover:to-pink-50/60 border border-purple-200/50'
      }`}
    >
      <div className="mb-3">
        <BookOpen
          size={40}
          className={darkMode ? 'text-purple-400' : 'text-purple-600'}
          strokeWidth={1.5}
        />
      </div>
      <div className="text-2xl font-bold mb-2" dir="rtl" style={{ fontFamily: 'David, serif' }}>
        {root.root_hebrew}
      </div>
      <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {root.root}
      </div>

      {/* 발음기호 */}
      {root.pronunciation && (
        <div className={`text-sm font-mono mb-2 px-2 py-1 rounded inline-block ${
          darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100/80 text-indigo-700'
        }`}>
          [{root.pronunciation}]
        </div>
      )}

      <div className="text-lg font-semibold mb-3">
        {root.core_meaning_korean}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded-lg ${
          darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
        }`}>
          중요도: {root.importance}/5
        </span>
        <span className={`px-2 py-1 rounded-lg ${
          darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
        }`}>
          빈도: {root.frequency}회
        </span>
      </div>
    </motion.button>
  );
});

export default RootCard;
