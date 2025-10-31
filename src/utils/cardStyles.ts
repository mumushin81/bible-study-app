/**
 * 카드 컴포넌트 공통 스타일 정의
 * 다크모드를 Tailwind dark: variant로 처리하여 일관성 유지
 */

export const headerStyles = {
  container:
    'flex items-center gap-4 mb-8 pb-6 border-b-2 border-blue-300/30 dark:border-blue-500/30',
  iconBox:
    'p-3 rounded-2xl bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-600/30 dark:to-cyan-600/30',
  title: 'text-2xl font-bold text-blue-700 dark:text-blue-300',
  subtitle: 'text-sm font-medium text-cyan-700 dark:text-cyan-400',
};

export const buttonStyles = {
  primary:
    'flex items-center gap-2 px-4 py-2 rounded-full transition-all bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 dark:bg-blue-600/30 dark:hover:bg-blue-600/50 dark:text-blue-200 dark:border-blue-400/30',
  secondary:
    'p-2 rounded-full transition-all backdrop-blur-md bg-white/40 hover:bg-white/50 border border-gray-400/30',
  bookmark:
    'ml-auto p-2 rounded-full backdrop-blur-md bg-white/40 hover:bg-white/50 transition-all border border-gray-400/30',
};

export const textStyles = {
  label: 'text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-1',
  content: 'text-sm text-gray-700 dark:text-gray-300',
  large: 'text-base leading-relaxed text-gray-900 dark:text-white',
  small: 'text-sm italic text-gray-600 dark:text-gray-400',
};

export const boxStyles = {
  highlight:
    'p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/30',
  section:
    'p-5 rounded-xl border-l-4',
  container:
    'flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-200/70 text-blue-900 border border-blue-300 dark:bg-cyan-500/20 dark:text-cyan-200 dark:border-cyan-400/30',
};

/**
 * 색상 기반 섹션 스타일 생성
 * 타입 안전성을 위해 Record 사용
 */
export type SectionColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'yellow';

export const getSectionColorClasses = (color: SectionColor): string => {
  const colorMap: Record<SectionColor, string> = {
    purple: 'bg-purple-50 border-purple-500 dark:bg-purple-900/30 dark:border-purple-500',
    blue: 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500',
    green: 'bg-green-50 border-green-500 dark:bg-green-900/30 dark:border-green-500',
    pink: 'bg-pink-50 border-pink-500 dark:bg-pink-900/30 dark:border-pink-500',
    orange: 'bg-orange-50 border-orange-500 dark:bg-orange-900/30 dark:border-orange-500',
    yellow: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-500',
  };

  return colorMap[color] || colorMap.green;
};

/**
 * 색상별 텍스트 색상 반환
 */
export const getSectionTextColor = (color: SectionColor): string => {
  const colorMap: Record<SectionColor, string> = {
    purple: 'text-purple-900 dark:text-purple-100',
    blue: 'text-blue-900 dark:text-blue-100',
    green: 'text-green-900 dark:text-green-100',
    pink: 'text-pink-900 dark:text-pink-100',
    orange: 'text-orange-900 dark:text-orange-100',
    yellow: 'text-yellow-900 dark:text-yellow-100',
  };

  return colorMap[color] || colorMap.green;
};
