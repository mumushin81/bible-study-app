import { BookOpen, Book, Target, FileText, TrendingUp } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'verse' | 'vocabulary' | 'quiz' | 'notes' | 'growth';
  onTabChange: (tab: 'verse' | 'vocabulary' | 'quiz' | 'notes' | 'growth') => void;
  darkMode: boolean;
}

export default function BottomNavigation({ activeTab, onTabChange, darkMode }: BottomNavigationProps) {
  const tabs = [
    { id: 'verse' as const, icon: BookOpen, label: '말씀' },
    { id: 'vocabulary' as const, icon: Book, label: '학습' },
    { id: 'quiz' as const, icon: Target, label: '퀴즈' },
    { id: 'notes' as const, icon: FileText, label: '노트' },
    { id: 'growth' as const, icon: TrendingUp, label: '성장' },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] ${
        darkMode
          ? 'bg-gray-900/80 border-gray-700/50'
          : 'bg-white/70 border-gray-200/50'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-around max-w-5xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all ${
                isActive
                  ? darkMode
                    ? 'text-purple-400'
                    : 'text-purple-600'
                  : darkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'font-bold' : 'font-normal'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    darkMode ? 'bg-purple-400' : 'bg-purple-600'
                  }`}
                  style={{
                    width: `${100 / tabs.length}%`,
                    transform: `translateX(${tabs.findIndex(t => t.id === tab.id) * 100}%)`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
