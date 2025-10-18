import { motion } from 'framer-motion';
import { LogOut, User, Trophy, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

interface UserProfileProps {
  darkMode: boolean;
}

export default function UserProfile({ darkMode }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const { profile, loading } = useUserProfile();

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
        darkMode ? 'bg-slate-800/50' : 'bg-gray-100'
      }`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className={`h-3 w-20 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} animate-pulse`} />
          <div className={`h-2 w-16 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} animate-pulse`} />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const level = profile?.level || 1;
  const totalPoints = profile?.total_points || 0;
  const totalExp = profile?.total_exp || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md border ${
        darkMode
          ? 'bg-cyan-500/10 border-cyan-400/30'
          : 'bg-white/80 border-purple-200'
      }`}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Avatar */}
      <div className="relative">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          darkMode
            ? 'bg-gradient-to-br from-cyan-400 to-violet-500'
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}>
          <User className="w-5 h-5 text-white" />
        </div>
        {/* Level Badge */}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
          darkMode
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
            : 'bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900'
        }`}>
          {level}
        </div>
      </div>

      {/* User Info - Hidden on mobile */}
      <div className="hidden sm:flex flex-col min-w-0">
        <div className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {displayName}
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-[10px] ${
            darkMode ? 'text-cyan-300' : 'text-purple-600'
          }`}>
            <Trophy className="w-3 h-3" />
            <span>{totalPoints}</span>
          </div>
          <div className={`flex items-center gap-1 text-[10px] ${
            darkMode ? 'text-violet-300' : 'text-pink-600'
          }`}>
            <Star className="w-3 h-3" />
            <span>{totalExp}</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-1.5 rounded-lg transition-colors ${
          darkMode
            ? 'hover:bg-red-500/20 text-red-400'
            : 'hover:bg-red-50 text-red-600'
        }`}
        title="로그아웃"
      >
        <LogOut className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
